import { testNeo4jConnection, closeNeo4jDriver } from '../src/lib/db/neo4j';
import { testPostgresConnection, initializeVectorStore, closePostgresPool } from '../src/lib/db/postgres';

async function testConnections() {
  console.log('🧪 Testing database connections...\n');

  // Test Neo4j
  console.log('📊 Testing Neo4j connection...');
  const neo4jOk = await testNeo4jConnection();
  if (neo4jOk) {
    console.log('✅ Neo4j connection successful\n');
  } else {
    console.log('❌ Neo4j connection failed\n');
  }

  // Test PostgreSQL
  console.log('🐘 Testing PostgreSQL connection...');
  const postgresOk = await testPostgresConnection();
  if (postgresOk) {
    console.log('✅ PostgreSQL connection successful\n');
  } else {
    console.log('❌ PostgreSQL connection failed\n');
  }

  // Initialize vector store
  if (postgresOk) {
    console.log('🔧 Initializing vector store...');
    await initializeVectorStore();
  }

  // Cleanup
  await closeNeo4jDriver();
  await closePostgresPool();

  if (neo4jOk && postgresOk) {
    console.log('\n🎉 All connections successful!');
    process.exit(0);
  } else {
    console.log('\n❌ Some connections failed');
    process.exit(1);
  }
}

testConnections();