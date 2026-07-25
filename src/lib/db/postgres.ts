import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

export function getPostgresPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pune_rag',
    });
  }
  return pool;
}

export async function getPostgresClient(): Promise<PoolClient> {
  return getPostgresPool().connect();
}

export async function closePostgresPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Initialize pgvector extension and create tables
export async function initializeVectorStore(): Promise<void> {
  const client = await getPostgresClient();
  
  try {
    // Enable pgvector extension
    await client.query('CREATE EXTENSION IF NOT EXISTS vector');
    
    // Create embeddings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS place_embeddings (
        id SERIAL PRIMARY KEY,
        place_id TEXT UNIQUE NOT NULL,
        embedding vector(768),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create index for vector similarity search
    await client.query(`
      CREATE INDEX IF NOT EXISTS place_embeddings_vector_idx 
      ON place_embeddings 
      USING ivfflat (embedding vector_cosine_ops)
      WITH (lists = 100)
    `);
    
    console.log('✅ Vector store initialized');
  } catch (error) {
    console.error('❌ Error initializing vector store:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Test connection
export async function testPostgresConnection(): Promise<boolean> {
  const client = await getPostgresClient();
  try {
    const result = await client.query('SELECT 1 as test');
    return result.rows.length > 0;
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    return false;
  } finally {
    client.release();
  }
}