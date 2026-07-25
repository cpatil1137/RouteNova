import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'your_password_here';

async function checkIngestionStatus() {
    const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
    const session = driver.session();

    try {
        console.log('🔍 Checking Neo4j ingestion status...\n');

        // Check nodes
        const nodeStats = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] as type, count(n) as count
      ORDER BY type
    `);

        console.log('📊 Nodes:');
        nodeStats.records.forEach(record => {
            console.log(`  ${record.get('type')}: ${record.get('count')}`);
        });

        // Check relationships
        const relStats = await session.run(`
      MATCH ()-[r]->()
      RETURN type(r) as type, count(r) as count
      ORDER BY type
    `);

        console.log('\n🔗 Relationships:');
        relStats.records.forEach(record => {
            console.log(`  ${record.get('type')}: ${record.get('count')}`);
        });

        // Check if ingestion is complete
        const placeCount = nodeStats.records.find(r => r.get('type') === 'Place')?.get('count').toNumber() || 0;
        const nearCount = relStats.records.find(r => r.get('type') === 'NEAR')?.get('count').toNumber() || 0;

        console.log('\n📈 Status:');
        console.log(`  Places loaded: ${placeCount} / 2820`);
        console.log(`  NEAR relationships: ${nearCount}`);
        console.log(`  Completion: ${((placeCount / 2820) * 100).toFixed(1)}%`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await session.close();
        await driver.close();
    }
}

checkIngestionStatus()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
