import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const placeId = searchParams.get('placeId');

        if (!placeId) {
            return NextResponse.json({ error: 'Place ID required' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_PLACES_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
        }

        // Fetch place details including photos
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (detailsData.status !== 'OK' || !detailsData.result?.photos?.[0]) {
            return NextResponse.json({ photoUrl: null });
        }

        // Get first photo reference
        const photoReference = detailsData.result.photos[0].photo_reference;

        // Build photo URL
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${apiKey}`;

        return NextResponse.json({ photoUrl });
    } catch (error: any) {
        console.error('Error fetching place photo:', error);
        return NextResponse.json({ photoUrl: null });
    }
}
