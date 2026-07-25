import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchText';

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
}

async function searchPlaces(query: string, type: string): Promise<GooglePlace[]> {
  console.log(`🔍 Searching for: ${query}...`);
  
  try {
    const response = await axios.post(
      PLACES_API_URL,
      {
        textQuery: query,
        locationBias: {
          circle: {
            center: {
              latitude: 18.5204,
              longitude: 73.8567
            },
            radius: 15000.0
          }
        },
        maxResultCount: 10
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.editorialSummary,places.id'
        }
      }
    );

    const places: GooglePlace[] = [];
    
    if (response.data.places) {
      response.data.places.forEach((place: any) => {
        const tags = [type];
        
        // Add tags based on price level
        if (place.priceLevel === 'PRICE_LEVEL_INEXPENSIVE') tags.push('cheap');
        if (place.priceLevel === 'PRICE_LEVEL_MODERATE') tags.push('moderate-price');
        if (place.priceLevel === 'PRICE_LEVEL_EXPENSIVE') tags.push('premium');
        
        // Add tags based on rating
        if (place.rating >= 4.0) tags.push('highly-rated');
        
        // Common tags
        if (type === 'cafe') tags.push('wifi', 'food');
        if (type === 'coworking') tags.push('wifi', 'workspace', 'productivity');
        if (type === 'park') tags.push('nature', 'free', 'outdoor');
        
        places.push({
          id: `google_${type}_${place.id}`,
          name: place.displayName?.text || 'Unknown',
          type: type,
          lat: place.location?.latitude,
          long: place.location?.longitude,
          tags: tags,
          description: place.editorialSummary?.text || `${place.displayName?.text} in Pune`,
          rating: place.rating,
          priceLevel: place.priceLevel
        });
      });
    }
    
    console.log(`  ✓ Found ${places.length} places`);
    return places;
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.response?.data?.error?.message || error.message}`);
    return [];
  }
}

async function fetchGooglePlaces() {
  console.log('🔑 Using Google Places API...\n');
  
  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_PLACES_API_KEY not found in .env.local');
    process.exit(1);
  }

  const allPlaces: GooglePlace[] = [];

  // Fetch different types of places
  const coworking = await searchPlaces('coworking spaces in Pune', 'coworking');
  allPlaces.push(...coworking);

  await new Promise(resolve => setTimeout(resolve, 1000)); // Rate limiting

  const cafes = await searchPlaces('cafes with wifi in Pune', 'cafe');
  allPlaces.push(...cafes);

  await new Promise(resolve => setTimeout(resolve, 1000));

  const parks = await searchPlaces('parks and gardens in Pune', 'park');
  allPlaces.push(...parks);

  // Save to file
  const outputPath = path.join(__dirname, 'google-pune-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(allPlaces, null, 2));
  
  console.log(`\n✅ Saved ${allPlaces.length} places to google-pune-data.json`);
}

fetchGooglePlaces()
  .then(() => {
    console.log('\n🎉 Google Places data collection complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
  