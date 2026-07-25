import { generateRoute } from '../src/lib/rag/route-generator';
import { closeNeo4jDriver } from '../src/lib/db/neo4j';
import { closePostgresPool } from '../src/lib/db/postgres';

async function testRAGPipeline() {
    console.log('🧪 Testing RAG Pipeline...\n');

    // Test query 1: CS Student productivity route
    console.log('='.repeat(60));
    console.log('Test 1: CS Student productivity + chill route');
    console.log('='.repeat(60) + '\n');

    const result1 = await generateRoute(
        '1-day productivity + chill route for a CS student with preferences: quiet, wifi, cheap, productivity',
        'CS Student'
    );

    console.log('\n✅ Route Generated:');
    console.log('Route:', result1.route);
    console.log('Reasoning:', result1.reasoning);
    console.log(`Places found: ${result1.places.length}`);
    console.log(`Subgraph nodes: ${result1.subgraph.places.length}`);
    console.log(`Subgraph relationships: ${result1.subgraph.relationships.length}`);

    // Test query 2: Tourist nature route
    console.log('\n' + '='.repeat(60));
    console.log('Test 2: Tourist looking for parks and nature');
    console.log('='.repeat(60) + '\n');

    const result2 = await generateRoute(
        'peaceful parks and gardens for morning walk with preferences: nature, outdoor, peaceful',
        'Tourist'
    );

    console.log('\n✅ Route Generated:');
    console.log('Route:', result2.route);
    console.log('Reasoning:', result2.reasoning);
    console.log(`Places found: ${result2.places.length}`);

    // Cleanup
    await closeNeo4jDriver();
    await closePostgresPool();

    console.log('\n🎉 RAG Pipeline test complete!');
}

testRAGPipeline()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });