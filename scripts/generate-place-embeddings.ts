import fs from 'fs';
import path from 'path';
import { generateEmbedding } from '../src/lib/rag/embeddings';
import { storeEmbedding } from '../src/lib/rag/vector-store';
import { closePostgresPool } from '../src/lib/db/postgres';

async function generatePlaceEmbeddings() {
    console.log('🔮 Generating embeddings for places...\n');

    // Load places data
    const dataPath = path.join(__dirname, '../scripts/data-collection/pune-places.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    let count = 0;

    for (const place of data.places) {
        console.log(`Processing: ${place.name}...`);

        // Generate embedding from description
        const embedding = await generateEmbedding(place.description);

        // Store in vector database
        await storeEmbedding(place.id, place.description, embedding);

        count++;
        console.log(`  ✓ ${count}/${data.places.length}`);

        // Small delay to avoid overwhelming Ollama
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    await closePostgresPool();

    console.log(`\n✅ Generated embeddings for ${count} places!`);
}

generatePlaceEmbeddings()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });