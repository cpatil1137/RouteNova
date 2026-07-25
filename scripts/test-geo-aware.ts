import { geoAwareSearch } from '../src/lib/rag/geo-aware-retrieval';
import { getPlacesByIds } from '../src/lib/rag/graph-retriever';
import { closePostgresPool } from '../src/lib/db/postgres';
import { closeNeo4jDriver } from '../src/lib/db/neo4j';

async function testGeoAwareRetrieval() {
    console.log('🧪 Testing Geo-Aware Retrieval Pipeline\n');

    const testQueries = [
        'places to eat near Viman Nagar',
        'cafes in Koregaon Park',
        'restaurants near Deccan',
        'best food spots', // No area - should do city-wide
    ];

    for (const query of testQueries) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Query: "${query}"`);
        console.log('='.repeat(60));

        try {
            const results = await geoAwareSearch(query, 5);

            if (results.length === 0) {
                console.log('❌ No results found\n');
                continue;
            }

            // Get place details
            const placeIds = results.map(r => r.placeId);
            const places = await getPlacesByIds(placeIds);

            console.log(`\n✅ Found ${results.length} places:\n`);

            results.forEach((result, idx) => {
                const place = places.find(p => p.id === result.placeId);
                if (place) {
                    console.log(`${idx + 1}. ${place.name}`);
                    console.log(`   Area: ${(place as any).area || 'Unknown'}`);
                    console.log(`   Type: ${place.type}`);
                    console.log(`   Semantic: ${result.semanticScore.toFixed(3)}`);
                    console.log(`   Distance: ${result.distance.toFixed(2)}km`);
                    console.log(`   Combined: ${result.combinedScore.toFixed(3)}`);
                    console.log();
                }
            });
        } catch (error: any) {
            console.error(`❌ Error: ${error.message}\n`);
        }
    }

    // Cleanup
    await closePostgresPool();
    await closeNeo4jDriver();
    console.log('\n✅ Test complete!');
}

testGeoAwareRetrieval()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Test failed:', error);
        process.exit(1);
    });
