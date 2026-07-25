import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

interface RerankCandidate {
    id: string;
    name: string;
    description: string;
    type: string;
    tags: string[];
}

interface RerankResult {
    id: string;
    score: number;
}

/**
 * LLM-based reranking using Ollama
 */
export async function llmRerank(
    query: string,
    candidates: RerankCandidate[],
    topK: number = 10
): Promise<RerankResult[]> {
    if (candidates.length === 0) {
        return [];
    }

    const placesText = candidates
        .map((c, idx) => `${idx + 1}. ${c.name} (${c.type}): ${c.description}\n   Tags: ${c.tags.join(', ')}`)
        .join('\n\n');

    const prompt = `You are a travel recommendation expert for Pune, India. Score how relevant each place is for this query on a scale of 0-10.

Query: "${query}"

Rate each place based on:
- How well it matches the query intent
- Relevance of tags and type
- Suitability for the described activity

Places:
${placesText}

Respond with ONLY a JSON array of objects with "id" (place number 1-${candidates.length}) and "score" (0-10).
Sort from highest to lowest score.

Example format:
[{"id": 3, "score": 9.5}, {"id": 1, "score": 8.0}, ...]

JSON:`;

    try {
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: 'llama3.2',
            prompt: prompt,
            stream: false,
            options: {
                temperature: 0.1, // Low temperature for consistent scoring
                num_predict: 500,
            },
        });

        // Parse LLM response - handle comments and extra text
        let text = response.data.response;

        // Remove JavaScript-style comments
        text = text.replace(/\/\/[^\n]*/g, '');
        text = text.replace(/\/\*[\s\S]*?\*\//g, '');

        // Extract JSON array
        const jsonMatch = text.match(/\[[\s\S]*?\]/);

        if (!jsonMatch) {
            console.warn('LLM reranking failed to return valid JSON, using original order');
            return candidates.slice(0, topK).map((c, idx) => ({
                id: c.id,
                score: 10 - idx, // Descending scores
            }));
        }

        const scores: Array<{ id: number, score: number }> = JSON.parse(jsonMatch[0]);

        // Map back to place IDs
        const reranked = scores
            .filter(s => s.id > 0 && s.id <= candidates.length)
            .map(s => ({
                id: candidates[s.id - 1].id,
                score: s.score,
            }))
            .slice(0, topK);

        console.log(`LLM reranked ${candidates.length} → ${reranked.length} places`);

        return reranked;
    } catch (error: any) {
        console.error('LLM reranking error:', error.message);

        // Fallback: return original order
        return candidates.slice(0, topK).map((c, idx) => ({
            id: c.id,
            score: 10 - idx,
        }));
    }
}
