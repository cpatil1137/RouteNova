import { getNeo4jSession } from '../src/lib/db/neo4j';

async function checkVimanNagarPlaces() {
    const session = getNeo4jSession();

    try {
        // Check if places have location property
        const result = await session.run(`
      MATCH (p:Place)
      WHERE p.area =~ '.*Viman.*'
      RETURN p.id, p.name, p.area, p.location, p.lat, p.long
      LIMIT 10
    `);

        console.log(`Found ${result.records.length} places in Viman Nagar area:\n`);

        result.records.forEach(record => {
            console.log('Name:', record.get('p.name'));
            console.log('Area:', record.get('p.area'));
            console.log('Location:', record.get('p.location'));
            console.log('Lat:', record.get('p.lat'));
            console.log('Long:', record.get('p.long'));
            console.log('---');
        });

        // Check total places with location
        const totalResult = await session.run(`
      MATCH (p:Place)
      WHERE p.location IS NOT NULL
      RETURN count(p) as count
    `);

        console.log('\nTotal places with location property:', totalResult.records[0].get('count').toNumber());

    } finally {
        await session.close();
    }
}

checkVimanNagarPlaces()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    });
