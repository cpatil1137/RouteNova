import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'your_password_here';

async function resumeIngestion() {
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const session = driver.session();

    try {
        console.log('🔄 Resuming Neo4j ingestion...\n');

        // Check what's missing
        const popularCheck = await session.run('MATCH ()-[r:POPULAR_WITH]->() RETURN count(r) as count');
        const popularCount = popularCheck.records[0].get('count').toNumber();

        console.log(`📊 Current state:`);
        console.log(`  POPULAR_WITH relationships: ${popularCount}`);

        if (popularCount > 0) {
            console.log('\n✅ POPULAR_WITH relationships already exist!');
            console.log('   Ingestion is complete.\n');
            return;
        }

        console.log('\n🎯 Creating POPULAR_WITH relationships...');
        const startTime = Date.now();

        // Create POPULAR_WITH relationships using Cypher (much faster than JS)
        await session.run(
            `MATCH (place:Place), (persona:Persona)
       WITH place, persona,
         size([tag IN place.tags WHERE tag IN persona.tags]) AS intersection,
         size(place.tags + [tag IN persona.tags WHERE NOT tag IN place.tags]) AS union
       WITH place, persona, toFloat(intersection) / union AS overlap
       WHERE overlap > 0.2
       CREATE (place)-[:POPULAR_WITH {score: round(overlap * 100) / 100}]->(persona)`
        );

        const newPopularCheck = await session.run('MATCH ()-[r:POPULAR_WITH]->() RETURN count(r) as count');
        const newPopularCount = newPopularCheck.records[0].get('count').toNumber();
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`  ✓ Created ${newPopularCount} POPULAR_WITH relationships in ${elapsed}s\n`);

        // Final summary
        const stats = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] as type, count(n) as count
      ORDER BY type
    `);

        console.log('✅ Ingestion complete!\n');
        console.log('📊 Final Summary:');
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
        console.error('❌ Error:', error);
        throw error;
    } finally {
        await session.close();
        await driver.close();
    }
}

resumeIngestion()
    .then(() => {
        console.log('\n🎉 All done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
