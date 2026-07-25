import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export interface EmbeddingResult {
    embedding: number[];
}

/**
 * Generate embeddings using Ollama's nomic-embed-text model
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/embeddings`, {
            model: 'nomic-embed-text',
            prompt: text,
        }, {
            timeout: 30000, // 30 second timeout
        });

        if (!response.data || !response.data.embedding) {
            throw new Error('Invalid response from Ollama - no embedding data');
        }

        return response.data.embedding;
    } catch (error: any) {
        if (error.code === 'ECONNREFUSED') {
            throw new Error(`Cannot connect to Ollama at ${OLLAMA_BASE_URL}. Is Ollama running?`);
        }
        if (error.response) {
            throw new Error(`Ollama error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
}

/**
 * Generate embeddings for multiple texts in batch
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
    const embeddings: number[][] = [];

    for (const text of texts) {
        const embedding = await generateEmbedding(text);
        embeddings.push(embedding);

        // Small delay to avoid overwhelming Ollama
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    return embeddings;
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}