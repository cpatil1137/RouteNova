import fs from 'fs';
import path from 'path';

// Merge OSM and Google data, remove duplicates
function mergeData() {
  console.log('🔄 Merging OSM and Google Places data...\n');

  const osmPath = path.join(__dirname, 'osm-pune-data.json');
  const googlePath = path.join(__dirname, 'google-pune-data.json');

  let osmData: any[] = [];
  let googleData: any[] = [];

  if (fs.existsSync(osmPath)) {
    osmData = JSON.parse(fs.readFileSync(osmPath, 'utf-8'));
    console.log(`📍 Loaded ${osmData.length} places from OSM`);
  }

  if (fs.existsSync(googlePath)) {
    googleData = JSON.parse(fs.readFileSync(googlePath, 'utf-8'));
    console.log(`📍 Loaded ${googleData.length} places from Google`);
  }

  // Prefer Google data (more detailed), then OSM
  const merged = [...googleData, ...osmData];

  // Add sample events and personas
  const finalData = {
    places: merged.map((place, index) => ({
      id: String(index + 1),
      name: place.name,
      type: place.type,
      lat: place.lat || place.lon,
      long: place.long || place.lon,
      tags: place.tags,
      description: place.description || `${place.name} in Pune`
    })),
    events: [
      {
        id: "e1",
        name: "PuneFOSS Meetup",
        type: "event",
        location_id: "1",
        date: "2026-04-05",
        tags: ["tech", "foss", "networking", "student-friendly", "free"],
        description: "Monthly FOSS community meetup for developers and tech enthusiasts."
      },
      {
        id: "e2",
        name: "Pune Tech Meetup",
        type: "event",
        location_id: "2",
        date: "2026-04-12",
        tags: ["tech", "networking", "startup"],
        description: "Weekly tech meetup for startup enthusiasts and developers."
      }
    ],
    personas: [
      {
        id: "p1",
        name: "CS Student",
        preferences: ["quiet", "cheap", "wifi", "student-friendly", "productivity", "free"]
      },
      {
        id: "p2",
        name: "Remote Worker",
        preferences: ["wifi", "coworking", "cafe", "moderate-price", "quiet"]
      },
      {
        id: "p3",
        name: "Tourist",
        preferences: ["park", "nature", "outdoor", "free", "highly-rated"]
      }
    ]
  };

  const outputPath = path.join(__dirname, 'pune-places.json');
  fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));

  console.log(`\n✅ Merged data saved to pune-places.json`);
  console.log(`📊 Total: ${finalData.places.length} places, ${finalData.events.length} events, ${finalData.personas.length} personas`);
}

mergeData();