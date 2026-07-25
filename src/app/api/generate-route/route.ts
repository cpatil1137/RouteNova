import { NextRequest, NextResponse } from 'next/server';
import { generateRoute } from '@/lib/rag/route-generator';
import { closeNeo4jDriver } from '@/lib/db/neo4j';
import { closePostgresPool } from '@/lib/db/postgres';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, persona, preferences } = body;

        if (!query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        console.log('Generating route for query:', query);

        // Generate route using RAG pipeline
        // Construct enhanced query with preferences
        let fullQuery = query;
        if (preferences && Array.isArray(preferences) && preferences.length > 0) {
            fullQuery += ` with preferences: ${preferences.join(', ')}`;
        }

        // Generate route using RAG pipeline
        const result = await generateRoute(fullQuery, persona || 'Tourist');

        return NextResponse.json({
            success: true,
            data: {
                route: result.route,
                reasoning: result.reasoning,
                places: result.places,
                subgraph: {
                    nodes: result.subgraph.places.length,
                    edges: result.subgraph.relationships.length,
                },
            },
        });
    } catch (error: any) {
        console.error('Error generating route:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate route' },
            { status: 500 }
        );
    }
}

// Optional: GET endpoint for testing
export async function GET() {
    return NextResponse.json({
        message: 'Route generation API is running',
        usage: 'POST /api/generate-route with { query, persona?, preferences? }',
    });
}