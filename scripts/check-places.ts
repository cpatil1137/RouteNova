import { getNeo4jDriver } from '../src/lib/db/neo4j';

async function checkPlaces() {
    const driver = getNeo4jDriver();
    const session = driver.session();

    try {
        console.log('Fetching places from Neo4j...');
        const result = await session.run(`
            MATCH (p:Place)
            RETURN p
            LIMIT 5
        `);

        console.log(`\nFound ${result.records.length} places (showing first 5):\n`);

        result.records.forEach((record, idx) => {
            const place = record.get('p').properties;
            console.log(`\n--- Place ${idx + 1}: ${place.name} ---`);
            console.log('All properties:', Object.keys(place));
            console.log('place_id:', place.place_id);
            console.log('name:', place.name);
            console.log('category:', place.category);
            console.log('latitude:', place.latitude);
            console.log('longitude:', place.longitude);
            console.log('lat:', place.lat);
            console.log('lng:', place.lng);
            console.log('location:', place.location);
        });

        // Get total count
        const countResult = await session.run(`
            MATCH (p:Place)
            RETURN count(p) as total
        `);
        const total = countResult.records[0].get('total').toNumber();
        console.log(`\n\nTotal places in database: ${total}`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

checkPlaces();
