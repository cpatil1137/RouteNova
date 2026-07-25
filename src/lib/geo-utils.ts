// Pune area definitions with coordinates and search radius
export interface PuneArea {
    name: string;
    lat: number;
    lon: number;
    radius: number; // meters
    aliases: string[];
}

export const PUNE_AREAS: PuneArea[] = [
    {
        name: 'Viman Nagar',
        lat: 18.5679,
        lon: 73.9143,
        radius: 4000,
        aliases: ['viman nagar', 'viman', 'airport road'],
    },
    {
        name: 'Koregaon Park',
        lat: 18.5362,
        lon: 73.8936,
        radius: 4000,
        aliases: ['koregaon park', 'kp', 'koregaon'],
    },
    {
        name: 'Deccan Gymkhana',
        lat: 18.5160,
        lon: 73.8419,
        radius: 3000,
        aliases: ['deccan', 'gymkhana', 'deccan gymkhana'],
    },
    {
        name: 'Hinjewadi',
        lat: 18.5912,
        lon: 73.7389,
        radius: 5000,
        aliases: ['hinjewadi', 'hinjawadi', 'rajiv gandhi infotech park'],
    },
    {
        name: 'Baner',
        lat: 18.5590,
        lon: 73.7793,
        radius: 4000,
        aliases: ['baner', 'balewadi'],
    },
    {
        name: 'Kothrud',
        lat: 18.5074,
        lon: 73.8077,
        radius: 3500,
        aliases: ['kothrud', 'kotharud'],
    },
    {
        name: 'Shivajinagar',
        lat: 18.5304,
        lon: 73.8503,
        radius: 2500,
        aliases: ['shivajinagar', 'shivaji nagar', 'jm road'],
    },
    {
        name: 'Aundh',
        lat: 18.5590,
        lon: 73.8078,
        radius: 3000,
        aliases: ['aundh'],
    },
    {
        name: 'Wakad',
        lat: 18.5978,
        lon: 73.7644,
        radius: 4000,
        aliases: ['wakad'],
    },
    {
        name: 'Kalyani Nagar',
        lat: 18.5470,
        lon: 73.8988,
        radius: 2500,
        aliases: ['kalyani nagar', 'kalyani'],
    },
    {
        name: 'Magarpatta',
        lat: 18.5158,
        lon: 73.9290,
        radius: 3000,
        aliases: ['magarpatta', 'hadapsar'],
    },
    {
        name: 'Pimpri Chinchwad',
        lat: 18.6298,
        lon: 73.7997,
        radius: 5000,
        aliases: ['pimpri', 'chinchwad', 'pcmc'],
    },
    {
        name: 'Camp',
        lat: 18.5089,
        lon: 73.8793,
        radius: 2000,
        aliases: ['camp', 'mg road'],
    },
    {
        name: 'Pune Station',
        lat: 18.5284,
        lon: 73.8742,
        radius: 2000,
        aliases: ['pune station', 'railway station', 'station'],
    },
];

/**
 * Detect area/locality from query text
 */
export function detectArea(query: string): PuneArea | null {
    const lowerQuery = query.toLowerCase();

    // Check for "near X" or "in X" patterns
    const nearPattern = /(?:near|in|at|around)\s+([a-z\s]+?)(?:\s|,|$)/i;
    const match = lowerQuery.match(nearPattern);

    if (match) {
        const locationText = match[1].trim();

        // Try to match against area names and aliases
        for (const area of PUNE_AREAS) {
            if (area.aliases.some(alias => locationText.includes(alias))) {
                return area;
            }
        }
    }

    // Fallback: check if any area name appears anywhere in query
    for (const area of PUNE_AREAS) {
        if (area.aliases.some(alias => lowerQuery.includes(alias))) {
            return area;
        }
    }

    return null;
}

/**
 * Calculate geographic score based on distance
 * Returns 1.0 for very close (0-500m), decays to 0.0 at radius limit
 */
export function geoScore(distanceKm: number, maxRadiusKm: number = 4): number {
    if (distanceKm <= 0.5) return 1.0; // Within 500m = perfect score
    if (distanceKm >= maxRadiusKm) return 0.0; // Beyond radius = no score

    // Exponential decay for smooth scoring
    const normalized = distanceKm / maxRadiusKm;
    return Math.exp(-3 * normalized); // e^(-3x) gives smooth decay
}

/**
 * Combine semantic similarity and geographic score
 */
export function combinedScore(
    semanticSimilarity: number,
    distanceKm: number,
    weights = { semantic: 0.7, geo: 0.3 }
): number {
    const geoScoreValue = geoScore(distanceKm);
    return weights.semantic * semanticSimilarity + weights.geo * geoScoreValue;
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}