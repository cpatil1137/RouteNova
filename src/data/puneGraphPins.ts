// Sample GraphRAG pins for Pune locations
// In production, this would be loaded from pune-universal-500.json

export interface GraphPin {
    id: string;
    name: string;
    lat: number;
    lon: number;
    type: 'cafe' | 'coworking' | 'park' | 'transit' | 'restaurant' | 'historical';
    connections: string[]; // IDs of connected pins (within 5km)
}

export const PUNE_GRAPH_PINS: GraphPin[] = [
    // Koregaon Park Area
    {
        id: 'german-bakery',
        name: 'German Bakery',
        lat: 18.5362,
        lon: 73.8940,
        type: 'cafe',
        connections: ['osho-ashram', 'boat-club'],
    },
    {
        id: 'osho-ashram',
        name: 'Osho International',
        lat: 18.5344,
        lon: 73.8956,
        type: 'historical',
        connections: ['german-bakery', 'boat-club'],
    },
    {
        id: 'boat-club',
        name: 'Boat Club',
        lat: 18.5298,
        lon: 73.8851,
        type: 'park',
        connections: ['german-bakery', 'osho-ashram', 'shaniwar-wada'],
    },

    // Central Pune
    {
        id: 'shaniwar-wada',
        name: 'Shaniwar Wada',
        lat: 18.5195,
        lon: 73.8553,
        type: 'historical',
        connections: ['boat-club', 'dagdusheth-temple', 'fc-road'],
    },
    {
        id: 'dagdusheth-temple',
        name: 'Dagdusheth Halwai Temple',
        lat: 18.5167,
        lon: 73.8560,
        type: 'historical',
        connections: ['shaniwar-wada', 'fc-road'],
    },
    {
        id: 'fc-road',
        name: 'FC Road',
        lat: 18.5314,
        lon: 73.8446,
        type: 'cafe',
        connections: ['shaniwar-wada', 'dagdusheth-temple', 'deccan'],
    },

    // Deccan & Baner
    {
        id: 'deccan',
        name: 'Deccan Gymkhana',
        lat: 18.5167,
        lon: 73.8424,
        type: 'transit',
        connections: ['fc-road', 'baner-cowork'],
    },
    {
        id: 'baner-cowork',
        name: 'Baner Coworking Hub',
        lat: 18.5590,
        lon: 73.7794,
        type: 'coworking',
        connections: ['deccan', 'hinjewadi-tech'],
    },

    // Hinjewadi IT Park
    {
        id: 'hinjewadi-tech',
        name: 'Hinjewadi Tech Park',
        lat: 18.5912,
        lon: 73.7398,
        type: 'coworking',
        connections: ['baner-cowork', 'rajiv-gandhi-infotech'],
    },
    {
        id: 'rajiv-gandhi-infotech',
        name: 'Rajiv Gandhi Infotech Park',
        lat: 18.6060,
        lon: 73.7320,
        type: 'coworking',
        connections: ['hinjewadi-tech'],
    },

    // Viman Nagar & Airport
    {
        id: 'viman-nagar',
        name: 'Viman Nagar',
        lat: 18.5679,
        lon: 73.9143,
        type: 'transit',
        connections: ['phoenix-mall', 'pune-airport'],
    },
    {
        id: 'phoenix-mall',
        name: 'Phoenix Market City',
        lat: 18.5595,
        lon: 73.9143,
        type: 'restaurant',
        connections: ['viman-nagar', 'koregaon-park-plaza'],
    },
    {
        id: 'pune-airport',
        name: 'Pune Airport',
        lat: 18.5821,
        lon: 73.9197,
        type: 'transit',
        connections: ['viman-nagar'],
    },

    // Koregaon Park Extension
    {
        id: 'koregaon-park-plaza',
        name: 'Koregaon Park Plaza',
        lat: 18.5425,
        lon: 73.8992,
        type: 'restaurant',
        connections: ['phoenix-mall', 'german-bakery'],
    },

    // Kothrud & Karve Road
    {
        id: 'kothrud-depot',
        name: 'Kothrud Depot',
        lat: 18.5074,
        lon: 73.8077,
        type: 'transit',
        connections: ['deccan', 'karve-road-cafe'],
    },
    {
        id: 'karve-road-cafe',
        name: 'Karve Road Cafes',
        lat: 18.5089,
        lon: 73.8214,
        type: 'cafe',
        connections: ['kothrud-depot', 'deccan'],
    },

    // Hadapsar & Magarpatta
    {
        id: 'magarpatta-city',
        name: 'Magarpatta City',
        lat: 18.5159,
        lon: 73.9281,
        type: 'coworking',
        connections: ['hadapsar-it', 'phoenix-mall'],
    },
    {
        id: 'hadapsar-it',
        name: 'Hadapsar IT Park',
        lat: 18.5089,
        lon: 73.9260,
        type: 'coworking',
        connections: ['magarpatta-city'],
    },

    // Aundh & Baner
    {
        id: 'aundh-park',
        name: 'Aundh Park',
        lat: 18.5590,
        lon: 73.8079,
        type: 'park',
        connections: ['baner-cowork', 'fc-road'],
    },

    // Pimpri-Chinchwad
    {
        id: 'pcmc',
        name: 'PCMC',
        lat: 18.6298,
        lon: 73.7997,
        type: 'transit',
        connections: ['aundh-park', 'hinjewadi-tech'],
    },
];

/**
 * Get pins by type
 */
export function getPinsByType(type: GraphPin['type']): GraphPin[] {
    return PUNE_GRAPH_PINS.filter((pin) => pin.type === type);
}

/**
 * Get pin by ID
 */
export function getPinById(id: string): GraphPin | undefined {
    return PUNE_GRAPH_PINS.find((pin) => pin.id === id);
}

/**
 * Get connected pins for a given pin
 */
export function getConnectedPins(pinId: string): GraphPin[] {
    const pin = getPinById(pinId);
    if (!pin) return [];

    return pin.connections
        .map((id) => getPinById(id))
        .filter((p): p is GraphPin => p !== undefined);
}
