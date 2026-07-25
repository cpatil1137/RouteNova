import { getPostgresClient } from '../db/postgres';
import { getDriver } from '../db/neo4j';
import { generateEmbedding } from './embeddings';
import { detectArea, calculateDistance, combinedScore, PuneArea } from '../geo-utils';

interface GeoFilteredResult {
    placeId: string;
    semanticScore: number;
    distance: number;
    combinedScore: number;
}

/**
 * Geo-aware hybrid retrieval pipeline
 * 1. Detect area from query
 * 2. Filter candidates by geographic proximity (Neo4j)
 * 3. Vector search within filtered candidates
 * 4. Combine semantic + geo scores
 */
export async function geoAwareSearch(
    query: string,
    limit: number = 15
): Promise<GeoFilteredResult[]> {
    const detectedArea = detectArea(query);

    console.log('🗺️  Detected area:', detectedArea?.name || 'None (city-wide search)');

    if (detectedArea) {
        return await geoFilteredSearch(query, detectedArea, limit);
    } else {
        return await cityWideSearch(query, limit);
    }
}

/**
 * Search within a specific geographic area
 */
async function geoFilteredSearch(
    query: string,
    area: PuneArea,
    limit: number
): Promise<GeoFilteredResult[]> {
    const driver = getDriver();
    const session = driver.session();
    const pgClient = await getPostgresClient();

    try {
        // Step 1: Get candidate place IDs from Neo4j within radius
        const radiusMeters = area.radius;
        const centerLat = area.lat;
        const centerLon = area.lon;

        const neo4jQuery = `
      MATCH (p:Place)
      WHERE point.distance(p.location, point({latitude: $centerLat, longitude: $centerLon})) < $radius
      RETURN p.id as placeId, 
             point.distance(p.location, point({latitude: $centerLat, longitude: $centerLon})) as distance
      ORDER BY distance ASC
      LIMIT 100
    `;

        const neo4jResult = await session.run(neo4jQuery, {
            centerLat,
            centerLon,
            radius: radiusMeters,
        });
        const candidates = neo4jResult.records.map((record: any) => {
            const distanceValue = record.get('distance');
            const distanceKm = typeof distanceValue === 'number'
                ? distanceValue / 1000
                : (distanceValue?.toNumber?.() || distanceValue) / 1000;

            return {
                placeId: record.get('placeId'),
                distance: distanceKm,
            };
        });

        console.log(`  📍 Found ${candidates.length} places within ${radiusMeters}m of ${area.name}`);

        if (candidates.length === 0) {
            return [];
        }

        // Step 2: Generate query embedding
        const queryEmbedding = await generateEmbedding(query);
        const embeddingArray = `[${queryEmbedding.join(',')}]`;

        // Step 3: Vector search within candidates
        const placeIds = candidates.map((c: any) => c.placeId);
        const pgQuery = `
      SELECT 
        place_id,
        1 - (embedding <=> $1::vector) as similarity
      FROM place_embeddings
      WHERE place_id = ANY($2::text[])
      ORDER BY embedding <=> $1::vector
      LIMIT $3
    `;

        const pgResult = await pgClient.query(pgQuery, [embeddingArray, placeIds, limit * 2]);

        // Step 4: Combine scores
        const results: GeoFilteredResult[] = pgResult.rows.map(row => {
            const candidate = candidates.find((c: any) => c.placeId === row.place_id)!;
            const semanticScore = parseFloat(row.similarity);
            const combined = combinedScore(semanticScore, candidate.distance);

            return {
                placeId: row.place_id,
                semanticScore,
                distance: candidate.distance,
                combinedScore: combined,
            };
        });

        // Sort by combined score and limit
        results.sort((a, b) => b.combinedScore - a.combinedScore);

        console.log(`  🎯 Top result: ${results[0]?.placeId} (semantic: ${results[0]?.semanticScore.toFixed(3)}, dist: ${results[0]?.distance.toFixed(2)}km, combined: ${results[0]?.combinedScore.toFixed(3)})`);

        return results.slice(0, limit);
    } finally {
        await session.close();
        pgClient.release();
    }
}

/**
 * City-wide search (no geographic filter)
 */
async function cityWideSearch(query: string, limit: number): Promise<GeoFilteredResult[]> {
    const pgClient = await getPostgresClient();

    try {
        const queryEmbedding = await generateEmbedding(query);
        const embeddingArray = `[${queryEmbedding.join(',')}]`;

        const pgQuery = `
      SELECT 
        place_id,
        1 - (embedding <=> $1::vector) as similarity
      FROM place_embeddings
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `;

        const result = await pgClient.query(pgQuery, [embeddingArray, limit]);

        return result.rows.map(row => ({
            placeId: row.place_id,
            semanticScore: parseFloat(row.similarity),
            distance: 0, // No distance for city-wide
            combinedScore: parseFloat(row.similarity),
        }));
    } finally {
        pgClient.release();
    }
}
