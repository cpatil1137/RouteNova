// Mercator projection utilities for converting lat/lon to 3D coordinates
// Optimized for Pune region (18.48-18.58 lat, 73.80-73.92 lon)

const PUNE_BOUNDS = {
    minLat: 18.48,
    maxLat: 18.58,
    minLon: 73.80,
    maxLon: 73.92,
    centerLat: 18.53,
    centerLon: 73.86,
};

const SCALE = 100; // Scale factor for 3D scene

/**
 * Convert latitude/longitude to Mercator projection (x, y)
 */
export function latLonToMercator(lat: number, lon: number): { x: number; y: number } {
    const x = (lon * Math.PI) / 180;
    const y = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
    return { x, y };
}

/**
 * Convert lat/lon to 3D scene coordinates centered on Pune
 */
export function latLonTo3D(lat: number, lon: number, elevation: number = 0): { x: number; y: number; z: number } {
    // Convert to Mercator
    const point = latLonToMercator(lat, lon);
    const center = latLonToMercator(PUNE_BOUNDS.centerLat, PUNE_BOUNDS.centerLon);

    // Center on Pune and scale
    const x = (point.x - center.x) * SCALE;
    const z = -(point.y - center.y) * SCALE; // Negative Z for correct orientation
    const y = elevation;

    return { x, y, z };
}

/**
 * Convert 3D coordinates back to lat/lon
 */
export function threeDToLatLon(x: number, y: number, z: number): { lat: number; lon: number } {
    const center = latLonToMercator(PUNE_BOUNDS.centerLat, PUNE_BOUNDS.centerLon);

    const mercatorX = x / SCALE + center.x;
    const mercatorY = -z / SCALE + center.y;

    const lon = (mercatorX * 180) / Math.PI;
    const lat = (360 / Math.PI) * Math.atan(Math.exp(mercatorY)) - 90;

    return { lat, lon };
}

/**
 * Calculate distance between two lat/lon points in kilometers
 */
export function haversineDistance(
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
    return R * c;
}

/**
 * Check if coordinates are within Pune bounds
 */
export function isInPuneBounds(lat: number, lon: number): boolean {
    return (
        lat >= PUNE_BOUNDS.minLat &&
        lat <= PUNE_BOUNDS.maxLat &&
        lon >= PUNE_BOUNDS.minLon &&
        lon <= PUNE_BOUNDS.maxLon
    );
}

export { PUNE_BOUNDS, SCALE };
