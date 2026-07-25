import { getNeo4jSession, closeNeo4jDriver } from '../src/lib/db/neo4j';

async function addLocationPoints() {
    console.log('🔧 Adding location points to Neo4j places...\n');

    const session = getNeo4jSession();

    try {
        // Check current state
        const checkResult = await session.run(`
      MATCH (p:Place)
      RETURN count(p) as total,
             count(p.location) as withLocation
    `);

        const total = checkResult.records[0].get('total').toNumber();
        const withLocation = checkResult.records[0].get('withLocation').toNumber();

        console.log(`Total places: ${total}`);
        console.log(`Places with location: ${withLocation}\n`);

        if (withLocation === total) {
            console.log('✅ All places already have location points!');
            return;
        }

        // Add location points to all places
        console.log('Adding location points...');

        const result = await session.run(`
      MATCH (p:Place)
      WHERE p.lat IS NOT NULL AND p.long IS NOT NULL
      SET p.location = point({latitude: p.lat, longitude: p.long})
      RETURN count(p) as updated
    `);

        const updated = result.records[0].get('updated').toNumber();
        console.log(`\n✅ Updated ${updated} places with location points!`);

        // Verify
        const verifyResult = await session.run(`
      MATCH (p:Place)
      WHERE p.location IS NOT NULL
      RETURN count(p) as count
    `);

        const finalCount = verifyResult.records[0].get('count').toNumber();
        console.log(`📍 Total places with location: ${finalCount}`);

        // Test Viman Nagar
        const vimanResult = await session.run(`
      MATCH (p:Place)
      WHERE point.distance(p.location, point({latitude: 18.5679, longitude: 73.9143})) < 4000
      RETURN count(p) as count
    `);

        const vimanCount = vimanResult.records[0].get('count').toNumber();
        console.log(`🎯 Places within 4km of Viman Nagar: ${vimanCount}`);

    } finally {
        await session.close();
        await closeNeo4jDriver();
    }
}

addLocationPoints()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
