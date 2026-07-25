import { getPostgresClient } from '../db/postgres';
import { generateEmbedding } from './embeddings';

export interface VectorSearchResult {
    placeId: string;
    description: string;
    similarity: number;
}

/**
 * Store embedding for a place
 */
export async function storeEmbedding(
    placeId: string,
    description: string,
    embedding: number[]
): Promise<void> {
    const client = await getPostgresClient();

    try {
        await client.query(
            `INSERT INTO place_embeddings (place_id, description, embedding)
       VALUES ($1, $2, $3)
       ON CONFLICT (place_id) 
       DO UPDATE SET description = $2, embedding = $3`,
            [placeId, description, JSON.stringify(embedding)]
        );
    } finally {
        client.release();
    }
}

/**
 * Search for similar places using vector similarity
 */
export async function searchSimilarPlaces(
    query: string,
    limit: number = 5
): Promise<VectorSearchResult[]> {
    const client = await getPostgresClient();

    try {
        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(query);

        // Format embedding as PostgreSQL array: [0.1, 0.2, ...]
        const embeddingArray = `[${queryEmbedding.join(',')}]`;

        // Search for similar embeddings
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
            description: row.description,
            similarity: parseFloat(row.similarity),
        }));
    } finally {
        client.release();
    }
}

/**
 * Get embedding for a specific place
 */
export async function getPlaceEmbedding(placeId: string): Promise<number[] | null> {
    const client = await getPostgresClient();

    try {
        const result = await client.query(
            'SELECT embedding FROM place_embeddings WHERE place_id = $1',
            [placeId]
        );

        if (result.rows.length === 0) return null;

        return JSON.parse(result.rows[0].embedding);
    } finally {
        client.release();
    }
}
