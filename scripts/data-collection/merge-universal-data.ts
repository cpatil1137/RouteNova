import fs from 'fs';
import path from 'path';

/**
 * Merge universal places with existing data and add sample events/personas
 */
function mergeUniversalData() {
    console.log('🔄 Merging universal places data...\n');

    // Load the new universal data
    const universalPath = path.join(__dirname, 'pune-universal-500.json');
    const universalData = JSON.parse(fs.readFileSync(universalPath, 'utf-8'));

    console.log(`📊 Loaded ${universalData.places.length} places from universal scraper`);

    // Add sample events (expand as needed)
    const events = [
        {
            id: 'e1',
            name: 'Pune Tech Meetup',
            date: '2024-03-15',
            description: 'Monthly tech networking event',
        },
        {
            id: 'e2',
            name: 'Pune Food Festival',
            date: '2024-03-20',
            description: 'Annual food and culture festival',
        },
        {
            id: 'e3',
            name: 'Shaniwar Wada Light Show',
            date: '2024-03-25',
            description: 'Evening light and sound show at historic fort',
        },
    ];

    // Add diverse personas
    const personas = [
        {
            id: 'p1',
            name: 'CS Student',
            tags: ['student', 'tech', 'budget', 'wifi', 'quiet', 'productivity'],
            description: 'College student looking for study spots and affordable hangouts',
        },
        {
            id: 'p2',
            name: 'Remote Worker',
            tags: ['professional', 'wifi', 'coworking', 'cafe', 'moderate-price'],
            description: 'Digital nomad seeking productive workspaces',
        },
        {
            id: 'p3',
            name: 'Tourist',
            tags: ['tourist-friendly', 'culture', 'heritage', 'nature', 'food'],
            description: 'Visitor exploring Pune\'s culture and attractions',
        },
        {
            id: 'p4',
            name: 'Foodie',
            tags: ['food', 'restaurant', 'cafe', 'local-favorite', 'upscale'],
            description: 'Food enthusiast exploring Pune\'s culinary scene',
        },
        {
            id: 'p5',
            name: 'Fitness Enthusiast',
            tags: ['outdoor', 'nature', 'fitness', 'yoga', 'adventure'],
            description: 'Active person seeking outdoor activities and wellness',
        },
        {
            id: 'p6',
            name: 'Family',
            tags: ['family', 'kids', 'amusement', 'educational', 'safe'],
            description: 'Family with children looking for kid-friendly activities',
        },
        {
            id: 'p7',
            name: 'Couple',
            tags: ['romantic', 'upscale', 'scenic', 'peaceful', 'rooftop'],
            description: 'Couple seeking romantic experiences',
        },
        {
            id: 'p8',
            name: 'Adventure Seeker',
            tags: ['adventure', 'outdoor', 'thrill', 'hiking', 'sports'],
            description: 'Thrill-seeker looking for adventure activities',
        },
    ];

    // Create final merged data
    const finalData = {
        places: universalData.places,
        events: events,
        personas: personas,
        metadata: {
            ...universalData.metadata,
            totalEvents: events.length,
            totalPersonas: personas.length,
            mergedAt: new Date().toISOString(),
        },
    };

    // Save to pune-places.json (this is what Neo4j ingestion uses)
    const outputPath = path.join(__dirname, 'pune-places.json');
    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

    console.log('\n✅ Merge complete!');
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`\n📊 Final dataset:`);
    console.log(`   Places: ${finalData.places.length}`);
    console.log(`   Events: ${finalData.events.length}`);
    console.log(`   Personas: ${finalData.personas.length}`);

    // Show category breakdown
    console.log('\n📈 Places by type:');
    const typeCount = new Map<string, number>();
    finalData.places.forEach((p: any) => {
        typeCount.set(p.type, (typeCount.get(p.type) || 0) + 1);
    });
    Array.from(typeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([type, count]) => {
            console.log(`   ${type}: ${count}`);
        });
}

mergeUniversalData();
