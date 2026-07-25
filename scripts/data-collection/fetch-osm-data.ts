import axios from 'axios';
import fs from 'fs';
import path from 'path';

interface OSMPlace {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  tags: string[];
}

// Overpass API query for Pune
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Pune bounding box: [min_lat, min_lon, max_lat, max_lon]
const PUNE_BBOX = '18.4088,73.7394,18.6298,73.9787';

async function fetchOSMData() {
  console.log('🌍 Fetching data from OpenStreetMap...\n');

  const places: OSMPlace[] = [];

  // Query for parks
  console.log('🌳 Fetching parks...');
  const parksQuery = `
    [out:json];
    (
      node["leisure"="park"](${PUNE_BBOX});
      way["leisure"="park"](${PUNE_BBOX});
    );
    out center;
  `;
  
  const parksResponse = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(parksQuery)}`);
  const parks = parksResponse.data.elements;
  
  parks.forEach((park: any) => {
    if (park.tags?.name) {
      places.push({
        id: `osm_park_${park.id}`,
        name: park.tags.name,
        type: 'park',
        lat: park.lat || park.center?.lat,
        lon: park.lon || park.center?.lon,
        tags: ['park', 'nature', 'free', 'outdoor']
      });
    }
  });
  console.log(`  ✓ Found ${parks.length} parks`);

  // Query for cafes
  console.log('☕ Fetching cafes...');
  const cafesQuery = `
    [out:json];
    (
      node["amenity"="cafe"](${PUNE_BBOX});
      way["amenity"="cafe"](${PUNE_BBOX});
    );
    out center;
  `;
  
  const cafesResponse = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(cafesQuery)}`);
  const cafes = cafesResponse.data.elements;
  
  cafes.forEach((cafe: any) => {
    if (cafe.tags?.name) {
      places.push({
        id: `osm_cafe_${cafe.id}`,
        name: cafe.tags.name,
        type: 'cafe',
        lat: cafe.lat || cafe.center?.lat,
        lon: cafe.lon || cafe.center?.lon,
        tags: ['cafe', 'wifi', 'food']
      });
    }
  });
  console.log(`  ✓ Found ${cafes.length} cafes`);

  // Query for coworking spaces
  console.log('💼 Fetching coworking spaces...');
  const coworkingQuery = `
    [out:json];
    (
      node["office"="coworking"](${PUNE_BBOX});
      way["office"="coworking"](${PUNE_BBOX});
    );
    out center;
  `;
  
  const coworkingResponse = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(coworkingQuery)}`);
  const coworking = coworkingResponse.data.elements;
  
  coworking.forEach((space: any) => {
    if (space.tags?.name) {
      places.push({
        id: `osm_coworking_${space.id}`,
        name: space.tags.name,
        type: 'coworking',
        lat: space.lat || space.center?.lat,
        lon: space.lon || space.center?.lon,
        tags: ['coworking', 'wifi', 'workspace']
      });
    }
  });
  console.log(`  ✓ Found ${coworking.length} coworking spaces`);

  // Save to file
  const outputPath = path.join(__dirname, 'osm-pune-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(places, null, 2));
  
  console.log(`\n✅ Saved ${places.length} places to osm-pune-data.json`);
  return places;
}

fetchOSMData()
  .then(() => {
    console.log('\n🎉 OSM data collection complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });