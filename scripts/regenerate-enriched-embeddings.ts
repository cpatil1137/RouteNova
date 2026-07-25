import fs from 'fs';
import path from 'path';
import { generateEmbedding } from '../src/lib/rag/embeddings';
import { storeEmbedding } from '../src/lib/rag/vector-store';
import { enrichPlaceText } from '../src/lib/rag/hybrid-retrieval';
import { closePostgresPool } from '../src/lib/db/postgres';

async function regenerateEnrichedEmbeddings() {
    console.log('🔮 Regenerating ENRICHED embeddings for places...\n');

    // Load places data
    const dataPath = path.join(__dirname, '../scripts/data-collection/pune-places.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    let count = 0;

    for (const place of data.places) {
        console.log(`Processing: ${place.name}...`);

        // Enrich the text before generating embedding
        const enrichedText = enrichPlaceText(place);
        console.log(`  Enriched: ${enrichedText.substring(0, 100)}...`);

        // Generate embedding from ENRICHED description
        const embedding = await generateEmbedding(enrichedText);

        // Store in vector database
        await storeEmbedding(place.id, enrichedText, embedding);

        count++;
        console.log(`  ✓ ${count}/${data.places.length}\n`);

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    await closePostgresPool();

    console.log(`\n✅ Regenerated enriched embeddings for ${count} places!`);
    console.log('📊 Embeddings now include: type, tags, and persona matching hints');
}

regenerateEnrichedEmbeddings()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
