import { generateEmbedding } from './embeddings';
import { getPostgresClient } from '../db/postgres';

/**
 * Enrich place text for better embeddings
 */
export function enrichPlaceText(place: any): string {
    const tags = place.tags?.join(', ') || '';
    const type = place.type || '';

    // Build enriched description
    let enriched = place.description || place.name;

    // Add context
    enriched += `\nType: ${type}`;
    enriched += `\nTags: ${tags}`;

    // Add persona matching hints
    if (tags.includes('wifi') && tags.includes('quiet')) {
        enriched += '\nSuited for: students, remote workers, productivity, studying';
    }
    if (tags.includes('coworking')) {
        enriched += '\nSuited for: professionals, networking, productive work';
    }
    if (tags.includes('park') || tags.includes('nature')) {
        enriched += '\nSuited for: relaxation, walks, outdoor activities, chill';
    }
    if (tags.includes('cafe')) {
        enriched += '\nSuited for: casual meetings, laptop work, coffee breaks';
    }
    if (tags.includes('cheap') || tags.includes('free')) {
        enriched += '\nSuited for: students, budget-friendly';
    }

    return enriched;
}

/**
 * Keyword-based BM25-style search (simple implementation)
 */
export async function keywordSearch(query: string, limit: number = 10): Promise<string[]> {
    const client = await getPostgresClient();

    try {
        // Validate query
        if (!query || typeof query !== 'string') {
            console.warn('Invalid query for keyword search:', query);
            return [];
        }

        // Simple keyword matching on description
        const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);

        if (keywords.length === 0) {
            return [];
        }

        const keywordPattern = keywords.join('|');

        const result = await client.query(
            `SELECT DISTINCT place_id, description,
        (SELECT COUNT(*) FROM unnest(string_to_array(lower(description), ' ')) AS word 
         WHERE word ~ $1) as keyword_score
       FROM place_embeddings
       WHERE lower(description) ~ $1
       ORDER BY keyword_score DESC
       LIMIT $2`,
            [keywordPattern, limit]
        );

        return result.rows.map(row => row.place_id);
    } catch (error) {
        console.error('Keyword search error:', error);
        return [];
    } finally {
        client.release();
    }
}

/**
 * Vector similarity search with improved query
 */
export async function vectorSearch(query: string, limit: number = 15): Promise<Array<{ placeId: string, similarity: number }>> {
    const client = await getPostgresClient();

    try {
        // Generate embedding for enriched query
        const enrichedQuery = `${query}. Looking for places in Pune for this activity.`;
        const queryEmbedding = await generateEmbedding(enrichedQuery);
        const embeddingArray = `[${queryEmbedding.join(',')}]`;

        const result = await client.query(
            `SELECT 
        place_id,
        description,
        1 - (embedding <=> $1::vector) as similarity
       FROM place_embeddings
       WHERE embedding IS NOT NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
            [embeddingArray, limit]
        );

        return result.rows.map(row => ({
            placeId: row.place_id,
            similarity: parseFloat(row.similarity),
        }));
    } finally {
        client.release();
    }
}

/**
 * Ensemble retrieval: Combine vector + keyword search
 */
export async function ensembleSearch(query: string, vectorK: number = 15, keywordK: number = 10): Promise<string[]> {
    // Run both searches in parallel
    const [vectorResults, keywordResults] = await Promise.all([
        vectorSearch(query, vectorK),
        keywordSearch(query, keywordK),
    ]);

    // Combine and deduplicate
    const vectorIds = new Set(vectorResults.map(r => r.placeId));
    const keywordIds = new Set(keywordResults);

    // Merge: prioritize vector results, then add keyword-only results
    const combined = [
        ...vectorResults.map(r => r.placeId),
        ...keywordResults.filter(id => !vectorIds.has(id)),
    ];

    console.log(`Ensemble search: ${vectorResults.length} vector + ${keywordResults.length} keyword = ${combined.length} total candidates`);

    return combined;
}
