import neo4j from 'neo4j-driver';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

// Load environment variables
const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'your_password_here';

async function ingestWithAPOC() {
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
  const session = driver.session();

  try {
    console.log('🚀 Starting APOC-powered Neo4j ingestion...\n');

    // Load data
    const dataPath = path.join(__dirname, '../data-collection/pune-places.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log(`📊 Dataset: ${data.places.length} places, ${data.events.length} events, ${data.personas.length} personas\n`);

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await session.run('MATCH (n) DETACH DELETE n');
    console.log('  ✓ Cleared\n');

    // Create constraints
    console.log('📊 Creating constraints...');
    await session.run('CREATE CONSTRAINT place_id IF NOT EXISTS FOR (p:Place) REQUIRE p.id IS UNIQUE');
    await session.run('CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE');
    await session.run('CREATE CONSTRAINT persona_id IF NOT EXISTS FOR (p:Persona) REQUIRE p.id IS UNIQUE');
    console.log('  ✓ Constraints created\n');

    // APOC Batch Insert Places (100x faster!)
    console.log('📍 Batch inserting places with APOC...');
    const startPlaces = Date.now();
    await session.run(
      `CALL apoc.periodic.iterate(
        'UNWIND $places AS place RETURN place',
        'CREATE (p:Place {
          id: place.id,
          name: place.name,
          type: place.type,
          lat: place.lat,
          long: place.long,
          tags: place.tags,
          description: place.description
        })',
        {batchSize: 100, params: {places: $places}}
      )`,
      { places: data.places }
    );
    console.log(`  ✓ Inserted ${data.places.length} places in ${((Date.now() - startPlaces) / 1000).toFixed(1)}s\n`);

    // Batch Insert Events
    console.log('📅 Batch inserting events...');
    await session.run(
      `UNWIND $events AS event
       CREATE (e:Event {
         id: event.id,
         name: event.name,
         date: event.date,
         description: event.description
       })`,
      { events: data.events }
    );
    console.log(`  ✓ Inserted ${data.events.length} events\n`);

    // Batch Insert Personas
    console.log('👤 Batch inserting personas...');
    await session.run(
      `UNWIND $personas AS persona
       CREATE (p:Persona {
         id: persona.id,
         name: persona.name,
         tags: persona.tags,
         description: persona.description
       })`,
      { personas: data.personas }
    );
    console.log(`  ✓ Inserted ${data.personas.length} personas\n`);

    // APOC: Create NEAR relationships (MUCH faster with Cypher)
    console.log('🔗 Creating NEAR relationships with APOC...');
    const startNear = Date.now();

    await session.run(
      `CALL apoc.periodic.iterate(
        'MATCH (p1:Place), (p2:Place) WHERE id(p1) < id(p2) RETURN p1, p2',
        'WITH p1, p2,
         point({latitude: p1.lat, longitude: p1.long}) AS point1,
         point({latitude: p2.lat, longitude: p2.long}) AS point2
         WITH p1, p2, point.distance(point1, point2) / 1000.0 AS distance
         WHERE distance < 5
         CREATE (p1)-[:NEAR {distance: round(distance * 100) / 100}]->(p2)
         CREATE (p2)-[:NEAR {distance: round(distance * 100) / 100}]->(p1)',
        {batchSize: 1000, parallel: false}
      )`
    );

    const nearResult = await session.run('MATCH ()-[r:NEAR]->() RETURN count(r) as count');
    const nearCount = nearResult.records[0].get('count').toNumber();
    console.log(`  ✓ Created ${nearCount} NEAR relationships in ${((Date.now() - startNear) / 1000).toFixed(1)}s\n`);

    // Create POPULAR_WITH relationships
    console.log('🎯 Creating POPULAR_WITH relationships...');
    const startPopular = Date.now();

    // Calculate tag overlaps in Cypher
    await session.run(
      `MATCH (place:Place), (persona:Persona)
       WITH place, persona,
         size([tag IN place.tags WHERE tag IN persona.tags]) AS intersection,
         size(place.tags + [tag IN persona.tags WHERE NOT tag IN place.tags]) AS union
       WITH place, persona, toFloat(intersection) / union AS overlap
       WHERE overlap > 0.2
       CREATE (place)-[:POPULAR_WITH {score: round(overlap * 100) / 100}]->(persona)`
    );

    const popularResult = await session.run('MATCH ()-[r:POPULAR_WITH]->() RETURN count(r) as count');
    const popularCount = popularResult.records[0].get('count').toNumber();
    console.log(`  ✓ Created ${popularCount} POPULAR_WITH relationships in ${((Date.now() - startPopular) / 1000).toFixed(1)}s\n`);

    // Summary
    const stats = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] as type, count(n) as count
      ORDER BY type
    `);

    console.log('✅ Ingestion complete!\n');
    console.log('📊 Summary:');
    stats.records.forEach(record => {
      console.log(`  ${record.get('type')}: ${record.get('count')}`);
    });

    const relStats = await session.run(`
      MATCH ()-[r]->()
      RETURN type(r) as type, count(r) as count
      ORDER BY type
    `);

    console.log('\n🔗 Relationships:');
    relStats.records.forEach(record => {
      console.log(`  ${record.get('type')}: ${record.get('count')}`);
    });

  } catch (error) {
    console.error('❌ Error during ingestion:', error);
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

ingestWithAPOC()
  .then(() => {
    console.log('\n🎉 All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
