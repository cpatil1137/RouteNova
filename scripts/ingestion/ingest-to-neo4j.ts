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

// Haversine distance calculation
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Tag overlap calculation
function calculateTagOverlap(tags1: string[], tags2: string[]): number {
    const set1 = new Set(tags1.map(t => t.toLowerCase()));
    const set2 = new Set(tags2.map(t => t.toLowerCase()));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
}

async function ingestData() {
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const session = driver.session();

    try {
        console.log('🚀 Starting Neo4j data ingestion...\n');

        // Load data
        const dataPath = path.join(__dirname, '../data-collection/pune-places.json');
        const rawData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(rawData);

        // Clear existing data in batches to avoid memory issues
        console.log('🗑️  Clearing existing data...');
        let deletedCount = 0;
        const batchSize = 1000;

        while (true) {
            const result = await session.run(
                `MATCH (n) 
         WITH n LIMIT $batchSize
         DETACH DELETE n
         RETURN count(n) as deleted`,
                { batchSize: neo4j.int(batchSize) }
            );

            const deleted = result.records[0]?.get('deleted').toNumber() || 0;
            deletedCount += deleted;

            if (deleted === 0) break;
            console.log(`  Deleted ${deletedCount} nodes...`);
        }
        console.log(`  ✓ Cleared ${deletedCount} total nodes`);

        // Create constraints and indexes
        console.log('📊 Creating constraints and indexes...');
        await session.run('CREATE CONSTRAINT place_id IF NOT EXISTS FOR (p:Place) REQUIRE p.id IS UNIQUE');
        await session.run('CREATE CONSTRAINT event_id IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE');
        await session.run('CREATE CONSTRAINT persona_id IF NOT EXISTS FOR (p:Persona) REQUIRE p.id IS UNIQUE');
        await session.run('CREATE INDEX place_tags IF NOT EXISTS FOR (p:Place) ON (p.tags)');

        // Insert Places
        console.log('\n📍 Inserting places...');
        for (const place of data.places) {
            await session.run(
                `CREATE (p:Place {
          id: $id,
          name: $name,
          type: $type,
          lat: $lat,
          long: $long,
          tags: $tags,
          description: $description
        })`,
                place
            );
            console.log(`  ✓ ${place.name}`);
        }

        // Insert Events
        console.log('\n📅 Inserting events...');
        for (const event of data.events) {
            await session.run(
                `CREATE (e:Event {
          id: $id,
          name: $name,
          date: $date,
          description: $description
        })`,
                {
                    id: event.id,
                    name: event.name,
                    date: event.date,
                    description: event.description,
                }
            );
            console.log(`  ✓ ${event.name}`);

            // Link event to location if specified
            if (event.location_id) {
                await session.run(
                    `MATCH (e:Event {id: $eventId})
           MATCH (p:Place {id: $placeId})
           CREATE (p)-[:HAS_EVENT]->(e)`,
                    { eventId: event.id, placeId: event.location_id }
                );
            }
        }

        // Insert Personas
        console.log('\n👤 Inserting personas...');
        for (const persona of data.personas) {
            await session.run(
                `CREATE (p:Persona {
          id: $id,
          name: $name,
          tags: $tags,
          description: $description
        })`,
                {
                    id: persona.id,
                    name: persona.name,
                    tags: persona.tags,
                    description: persona.description,
                }
            );
            console.log(`  ✓ ${persona.name}`);
        }

        // Create NEAR relationships (distance < 5km)
        console.log('\n🔗 Creating NEAR relationships...');
        const totalPairs = (data.places.length * (data.places.length - 1)) / 2;
        let nearCount = 0;
        let pairsChecked = 0;
        const startTime = Date.now();

        for (let i = 0; i < data.places.length; i++) {
            for (let j = i + 1; j < data.places.length; j++) {
                const p1 = data.places[i];
                const p2 = data.places[j];
                const distance = haversineDistance(p1.lat, p1.long, p2.lat, p2.long);

                if (distance < 5) {
                    await session.run(
                        `MATCH (p1:Place {id: $id1})
             MATCH (p2:Place {id: $id2})
             CREATE (p1)-[:NEAR {distance: $distance}]->(p2)
             CREATE (p2)-[:NEAR {distance: $distance}]->(p1)`,
                        { id1: p1.id, id2: p2.id, distance: Math.round(distance * 100) / 100 }
                    );
                    nearCount += 2;
                }

                pairsChecked++;

                // Progress update every 100 pairs
                if (pairsChecked % 100 === 0) {
                    const progress = ((pairsChecked / totalPairs) * 100).toFixed(1);
                    const elapsed = (Date.now() - startTime) / 1000;
                    const rate = pairsChecked / elapsed;
                    const remaining = (totalPairs - pairsChecked) / rate;
                    const eta = Math.ceil(remaining / 60);

                    console.log(`  Progress: ${progress}% (${pairsChecked}/${totalPairs} pairs) | ${nearCount} relationships | ETA: ${eta} min`);
                }
            }
        }
        console.log(`  ✓ Created ${nearCount} NEAR relationships`);

        // Create POPULAR_WITH relationships (tag overlap)
        console.log('\n🎯 Creating POPULAR_WITH relationships...');
        let popularCount = 0;
        for (const place of data.places) {
            for (const persona of data.personas) {
                const overlap = calculateTagOverlap(place.tags, persona.tags);
                if (overlap > 0.2) {
                    await session.run(
                        `MATCH (p:Place {id: $placeId})
             MATCH (persona:Persona {id: $personaId})
             CREATE (p)-[:POPULAR_WITH {score: $score}]->(persona)`,
                        { placeId: place.id, personaId: persona.id, score: Math.round(overlap * 100) / 100 }
                    );
                    popularCount++;
                }
            }
        }
        console.log(`  ✓ Created ${popularCount} POPULAR_WITH relationships`);

        // Get summary stats
        const stats = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] as type, count(n) as count
      ORDER BY type
    `);

        console.log('\n✅ Ingestion complete!\n');
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

// Run ingestion
ingestData()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });