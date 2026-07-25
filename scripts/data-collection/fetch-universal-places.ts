import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';

if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY not found in environment variables');
    process.exit(1);
}

interface GooglePlace {
    id: string;
    name: string;
    type: string;
    lat: number;
    long: number;
    tags: string[];
    description: string;
    rating?: number;
    priceLevel?: string;
    area?: string;
}

// 6 Key Areas in Pune with coordinates
const PUNE_AREAS = [
    { name: 'Koregaon Park', lat: 18.5362, lng: 73.8958, radius: 3000, vibe: 'foodie,upscale,expat' },
    { name: 'Hinjewadi', lat: 18.5912, lng: 73.7389, radius: 4000, vibe: 'IT,tech,coworking' },
    { name: 'FC Road', lat: 18.5314, lng: 73.8446, radius: 2500, vibe: 'student,budget,trendy' },
    { name: 'Viman Nagar', lat: 18.5679, lng: 73.9143, radius: 3000, vibe: 'transit,business,modern' },
    { name: 'Deccan', lat: 18.5165, lng: 73.8442, radius: 2000, vibe: 'shopping,traditional,central' },
    { name: 'Camp', lat: 18.5196, lng: 73.8553, radius: 2500, vibe: 'culture,heritage,historic' },
];

// 20+ Query Categories for Universal Coverage
const QUERY_GROUPS = {
    food: [
        { q: 'cafes with wifi', type: 'cafe', tags: ['cafe', 'wifi', 'food'] },
        { q: 'rooftop restaurants', type: 'restaurant', tags: ['restaurant', 'rooftop', 'food', 'upscale'] },
        { q: 'street food', type: 'food', tags: ['food', 'cheap', 'local-favorite'] },
        { q: 'pubs and bars', type: 'bar', tags: ['bar', 'nightlife', 'drinks'] },
        { q: 'fine dining restaurants', type: 'restaurant', tags: ['restaurant', 'fine-dining', 'upscale'] },
    ],
    work: [
        { q: 'coworking spaces', type: 'coworking', tags: ['coworking', 'wifi', 'workspace', 'productivity'] },
        { q: 'libraries', type: 'library', tags: ['library', 'quiet', 'study', 'free'] },
        { q: 'bookstores and cafes', type: 'bookstore', tags: ['bookstore', 'cafe', 'reading'] },
    ],
    nature: [
        { q: 'parks and gardens', type: 'park', tags: ['park', 'nature', 'outdoor', 'free'] },
        { q: 'lakes and water bodies', type: 'lake', tags: ['lake', 'nature', 'scenic', 'peaceful'] },
        { q: 'yoga and meditation centers', type: 'wellness', tags: ['wellness', 'yoga', 'peaceful'] },
        { q: 'hiking trails', type: 'outdoor', tags: ['outdoor', 'adventure', 'hiking', 'nature'] },
    ],
    culture: [
        { q: 'historical forts', type: 'fort', tags: ['fort', 'historic', 'tourist-friendly', 'culture'] },
        { q: 'museums and art galleries', type: 'museum', tags: ['museum', 'culture', 'art', 'indoor'] },
        { q: 'temples and religious sites', type: 'temple', tags: ['temple', 'spiritual', 'culture', 'free'] },
        { q: 'heritage sites', type: 'heritage', tags: ['heritage', 'historic', 'tourist-friendly'] },
    ],
    shopping: [
        { q: 'shopping malls', type: 'mall', tags: ['mall', 'shopping', 'indoor', 'modern'] },
        { q: 'local markets', type: 'market', tags: ['market', 'shopping', 'local-favorite', 'cheap'] },
        { q: 'boutiques and stores', type: 'shop', tags: ['shop', 'shopping', 'trendy'] },
    ],
    entertainment: [
        { q: 'movie theaters', type: 'cinema', tags: ['cinema', 'entertainment', 'indoor'] },
        { q: 'gaming cafes', type: 'gaming', tags: ['gaming', 'entertainment', 'indoor', 'youth'] },
        { q: 'live music venues', type: 'music', tags: ['music', 'nightlife', 'entertainment'] },
    ],
    adventure: [
        { q: 'adventure sports', type: 'adventure', tags: ['adventure', 'outdoor', 'sports', 'thrill'] },
        { q: 'cycling routes', type: 'cycling', tags: ['cycling', 'outdoor', 'fitness', 'nature'] },
        { q: 'rock climbing', type: 'climbing', tags: ['climbing', 'adventure', 'outdoor', 'fitness'] },
    ],
    family: [
        { q: 'amusement parks', type: 'amusement', tags: ['amusement', 'family', 'kids', 'outdoor'] },
        { q: 'zoos and aquariums', type: 'zoo', tags: ['zoo', 'family', 'kids', 'educational'] },
        { q: 'playgrounds', type: 'playground', tags: ['playground', 'kids', 'outdoor', 'free'] },
    ],
};

/**
 * Paginated search with nextPageToken support
 */
async function paginatedSearch(
    query: string,
    area: typeof PUNE_AREAS[0],
    maxPages: number = 3
): Promise<any[]> {
    const allResults: any[] = [];
    let pageToken: string | undefined = undefined;

    for (let page = 0; page < maxPages; page++) {
        try {
            const requestBody: any = {
                textQuery: `${query} in ${area.name}, Pune`,
                locationBias: {
                    circle: {
                        center: { latitude: area.lat, longitude: area.lng },
                        radius: area.radius,
                    },
                },
            };

            if (pageToken) {
                requestBody.pageToken = pageToken;
            }

            const response = await axios.post(BASE_URL, requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY!,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.editorialSummary,nextPageToken',
                },
            });

            if (response.data.places) {
                allResults.push(...response.data.places);
            }

            pageToken = response.data.nextPageToken;

            if (!pageToken) break; // No more pages

            // Wait before next page (Google requires delay)
            await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error: any) {
            console.error(`  ⚠️  Error on page ${page + 1}:`, error.response?.data?.error?.message || error.message);
            break;
        }
    }

    return allResults;
}

/**
 * Main scraper function
 */
async function fetchUniversalPlaces() {
    console.log('🌍 Starting Universal Pune Places Scraper...\n');
    console.log(`📍 Areas: ${PUNE_AREAS.length}`);
    console.log(`📋 Query Groups: ${Object.keys(QUERY_GROUPS).length}`);
    console.log(`🎯 Target: 400-500 places\n`);

    const allPlaces = new Map<string, GooglePlace>(); // Dedupe by place.id
    let totalFetched = 0;

    // Iterate through all query groups
    for (const [groupName, queries] of Object.entries(QUERY_GROUPS)) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📂 Group: ${groupName.toUpperCase()}`);
        console.log('='.repeat(60));

        for (const queryConfig of queries) {
            console.log(`\n🔍 Query: "${queryConfig.q}"`);

            // Search in multiple areas for diversity
            for (const area of PUNE_AREAS) {
                console.log(`  📍 Area: ${area.name}...`);

                const results = await paginatedSearch(queryConfig.q, area, 2); // 2 pages max per area
                let newCount = 0;

                for (const place of results) {
                    if (!place.id || allPlaces.has(place.id)) continue; // Dedupe

                    // Enrich and add place
                    const enrichedPlace: GooglePlace = {
                        id: place.id,
                        name: place.displayName?.text || 'Unknown',
                        type: queryConfig.type,
                        lat: place.location?.latitude || 0,
                        long: place.location?.longitude || 0,
                        tags: [
                            ...queryConfig.tags,
                            area.vibe.split(',')[0], // Add area vibe
                            place.rating >= 4.5 ? 'highly-rated' : '',
                            place.priceLevel === 'PRICE_LEVEL_INEXPENSIVE' ? 'cheap' : '',
                            place.priceLevel === 'PRICE_LEVEL_MODERATE' ? 'moderate-price' : '',
                            place.priceLevel === 'PRICE_LEVEL_EXPENSIVE' ? 'upscale' : '',
                            'tourist-friendly',
                        ].filter(Boolean),
                        description: place.editorialSummary?.text || `${place.displayName?.text} in ${area.name}, Pune`,
                        rating: place.rating,
                        priceLevel: place.priceLevel,
                        area: area.name,
                    };

                    allPlaces.set(place.id, enrichedPlace);
                    newCount++;
                }

                totalFetched += results.length;
                console.log(`    ✓ ${results.length} fetched, ${newCount} new (Total unique: ${allPlaces.size})`);

                // Rate limiting
                await new Promise(resolve => setTimeout(resolve, 1200));
            }
        }
    }

    // Convert to array and save
    const placesArray = Array.from(allPlaces.values());

    const outputData = {
        places: placesArray,
        metadata: {
            totalPlaces: placesArray.length,
            areas: PUNE_AREAS.map(a => a.name),
            categories: Object.keys(QUERY_GROUPS),
            generatedAt: new Date().toISOString(),
        },
    };

    const outputPath = path.join(__dirname, 'pune-universal-500.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ SCRAPING COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Total unique places: ${placesArray.length}`);
    console.log(`📁 Saved to: ${outputPath}`);
    console.log(`🎯 Target achieved: ${placesArray.length >= 400 ? 'YES ✓' : 'NO (run again with more queries)'}`);

    // Category breakdown
    console.log('\n📈 Breakdown by type:');
    const typeCount = new Map<string, number>();
    placesArray.forEach(p => {
        typeCount.set(p.type, (typeCount.get(p.type) || 0) + 1);
    });
    Array.from(typeCount.entries())
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
        });
}

fetchUniversalPlaces()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
