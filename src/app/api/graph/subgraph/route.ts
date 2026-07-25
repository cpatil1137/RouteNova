import { NextRequest, NextResponse } from 'next/server';
import { getConnectedSubgraph } from '@/lib/rag/graph-retriever';
import { getNeo4jDriver } from '@/lib/db/neo4j';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { placeIds, maxDepth = 2 } = body;

        if (!placeIds || !Array.isArray(placeIds)) {
            return NextResponse.json(
                { error: 'placeIds array is required' },
                { status: 400 }
            );
        }

        console.log('Fetching subgraph for places:', placeIds);

        // Get connected subgraph
        const subgraph = await getConnectedSubgraph(placeIds, maxDepth);

        return NextResponse.json({
            success: true,
            data: {
                places: subgraph.places,
                relationships: subgraph.relationships,
                stats: {
                    totalPlaces: subgraph.places.length,
                    totalRelationships: subgraph.relationships.length,
                },
            },
        });
    } catch (error: any) {
        console.error('Error fetching subgraph:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch subgraph' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const placeId = searchParams.get('placeId');

        // If placeId is 'all', return all places
        if (placeId === 'all') {
            const session = getNeo4jDriver().session();

            try {
                const result = await session.run(`
          MATCH (p:Place)
          RETURN p
          ORDER BY p.name
        `);

                const places = result.records
                    .map((record: any) => {
                        const place = record.get('p').properties;
                        // Database uses 'lat' and 'long', not 'latitude' and 'longitude'
                        const lat = place.lat ? parseFloat(place.lat) : null;
                        const lng = place.long ? parseFloat(place.long) : null;

                        // Only return places with valid coordinates
                        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                            return null;
                        }

                        return {
                            id: place.place_id,
                            name: place.name,
                            type: place.category || 'place',
                            category: place.category || 'place',
                            rating: place.rating ? parseFloat(place.rating) : null,
                            lat: lat,  // RouteMap expects these at top level
                            long: lng, // RouteMap uses 'long' not 'lng'
                            location: {
                                lat: lat,
                                lng: lng,
                            },
                            address: place.address || place.vicinity || '',
                            description: place.description || `Popular ${place.category || 'place'} in Pune`,
                        };
                    })
                    .filter((place: any) => place !== null); // Remove null entries

                return NextResponse.json({
                    success: true,
                    places,
                    count: places.length,
                });
            } finally {
                await session.close();
            }
        }

        return NextResponse.json({
            message: 'Subgraph API is running',
            usage: 'POST /api/graph/subgraph with { placeIds: string[], maxDepth?: number } OR GET /api/graph/subgraph?placeId=all',
        });
    } catch (error: any) {
        console.error('Error in GET subgraph:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch places' },
            { status: 500 }
        );
    }
}