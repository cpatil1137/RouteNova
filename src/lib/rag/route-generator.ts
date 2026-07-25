import axios from 'axios';
import { searchSimilarPlaces } from './vector-store';
import { getPlacesByIds, getConnectedSubgraph, type Place, type GraphPath } from './graph-retriever';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export interface RouteRequest {
    query: string;
    persona?: string;
    preferences?: string[];
}

export interface RouteResponse {
    route: string[];
    reasoning: string;
    places: Place[];
    subgraph: GraphPath;
}

/**
 * Generate a route using GEO-AWARE HYBRID RAG (location + semantic + graph + LLM)
 */
export async function generateRoute(query: string, persona?: string): Promise<RouteResponse> {
    console.log('🔍 Step 1: Geo-aware hybrid search...');

    // Step 1: Geo-aware retrieval - detects area and filters by proximity
    const { geoAwareSearch } = await import('./geo-aware-retrieval');
    const geoResults = await geoAwareSearch(query, 15);

    const candidateIds = geoResults.map(r => r.placeId);
    console.log(`  Found ${candidateIds.length} candidate places`);

    if (candidateIds.length === 0) {
        throw new Error('No matching places found. Try a different query.');
    }

    // Step 2: Get full place details from Neo4j
    console.log('📊 Step 2: Fetching place details from graph...');
    const places = await getPlacesByIds(candidateIds);

    // Step 3: LLM Reranking - score and filter to top 10
    console.log('🤖 Step 3: LLM reranking candidates...');
    const { llmRerank } = await import('./llm-reranker');
    const reranked = await llmRerank(query, places, 10);

    const topPlaceIds = reranked.map(r => r.id);
    const topPlaces = places.filter(p => topPlaceIds.includes(p.id));

    console.log(`  Reranked to top ${topPlaces.length} places`);

    // Step 4: Get connected subgraph for top places
    console.log('🕸️  Step 4: Building connected subgraph...');
    const subgraph = await getConnectedSubgraph(topPlaceIds, 2);

    // Step 5: Build context for final LLM route generation
    console.log('📝 Step 5: Building context for route generation...');
    const context = buildContext(topPlaces, subgraph, query);

    // Step 6: Generate final route with LLM
    console.log('🎯 Step 6: Generating final route...');
    const llmResponse = await callLLM(context, query, persona, topPlaces);

    return {
        route: llmResponse.route,
        reasoning: llmResponse.reasoning,
        places: topPlaces,
        subgraph: subgraph,
    };
}

/**
 * Build context string for LLM from graph data
 */
function buildContext(places: Place[], subgraph: GraphPath, query: string): string {
    let context = '# Available Places in Pune\n\n';

    places.forEach(place => {
        context += `## ${place.name}\n`;
        context += `- Type: ${place.type}\n`;
        context += `- Tags: ${place.tags.join(', ')}\n`;
        context += `- Description: ${place.description}\n`;
        context += `- Location: ${place.lat}, ${place.long}\n\n`;
    });

    // Add relationship information
    context += '\n# Connections Between Places\n\n';
    const nearRelationships = subgraph.relationships.filter(r => r.type === 'NEAR');
    if (nearRelationships.length > 0) {
        context += 'Nearby places (within 5km):\n';
        nearRelationships.forEach(rel => {
            const from = places.find(p => p.id === rel.from);
            const to = places.find(p => p.id === rel.to);
            if (from && to) {
                context += `- ${from.name} ↔ ${to.name} (${rel.properties.distance}km)\n`;
            }
        });
    }

    return context;
}

/**
 * Call Ollama LLM to generate route
 */
async function callLLM(context: string, query: string, persona: string | undefined, places: Place[]): Promise<{ route: string[], reasoning: string }> {
    const prompt = `You are a helpful trip planner for Pune, India. Based on the user's query and the available places, suggest a personalized route.

User Query: "${query}"
${persona ? `User Persona: ${persona}` : ''}

${context}

IMPORTANT RULES:
1. You MUST ONLY use place names that appear in the "Available Places in Pune" section above
2. Do NOT make up or invent any place names
3. Use the EXACT names as they appear in the list
4. Suggest 3-5 places maximum
5. Consider proximity (places that are NEAR each other)
6. Match the user's preferences with place tags

Respond in JSON format:
{
  "route": ["Exact Place Name 1", "Exact Place Name 2", "Exact Place Name 3"],
  "reasoning": "Brief explanation of why this route works"
}`;

    try {
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
            model: 'llama3.2',
            prompt: prompt,
            stream: false,
            format: 'json',
        });

        const result = JSON.parse(response.data.response);

        // Validate that all places in route exist in context
        const availablePlaceNames = context
            .split('## ')
            .slice(1)
            .map(section => {
                const nameMatch = section.match(/^(.+)\n/);
                return nameMatch ? nameMatch[1].trim() : '';
            })
            .filter(Boolean);

        const validatedRoute = result.route?.filter((placeName: string) =>
            availablePlaceNames.some(available =>
                available.toLowerCase().includes(placeName.toLowerCase()) ||
                placeName.toLowerCase().includes(available.toLowerCase())
            )
        ) || [];

        // If LLM didn't return valid places, use top 3 from context
        if (validatedRoute.length === 0) {
            console.warn('LLM returned invalid places, using fallback');
            return {
                route: availablePlaceNames.slice(0, 3),
                reasoning: 'Route based on top matching places for your query.',
            };
        }

        return {
            route: validatedRoute,
            reasoning: result.reasoning || 'Route generated based on your preferences.',
        };
    } catch (error: any) {
        console.error('LLM generation error:', error.message);

        // Fallback: use top 3 places from context
        const topPlaces = context.split('## ').slice(1, 4).map(section => {
            const nameMatch = section.match(/^(.+)\n/);
            return nameMatch ? nameMatch[1].trim() : '';
        }).filter(Boolean);

        return {
            route: topPlaces,
            reasoning: 'Route based on similarity to your query.',
        };
    }
}