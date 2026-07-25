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

        // Fetch comprehensive place details
        const fields = [
            'name',
            'rating',
            'user_ratings_total',
            'formatted_phone_number',
            'international_phone_number',
            'website',
            'formatted_address',
            'address_components',
            'opening_hours',
            'price_level',
            'photos',
            'reviews',
            'url',
        ].join(',');

        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;
        const response = await fetch(detailsUrl);
        const data = await response.json();

        if (data.status !== 'OK' || !data.result) {
            return NextResponse.json({
                error: 'Place not found',
                details: null
            });
        }

        const place = data.result;

        // Format the response
        const enhancedDetails = {
            name: place.name,
            rating: place.rating || null,
            userRatingsTotal: place.user_ratings_total || 0,
            phoneNumber: place.formatted_phone_number || place.international_phone_number || null,
            website: place.website || null,
            address: place.formatted_address || null,
            openingHours: place.opening_hours ? {
                weekdayText: place.opening_hours.weekday_text || [],
                openNow: place.opening_hours.open_now || false,
            } : null,
            priceLevel: place.price_level || null,
            googleMapsUrl: place.url || null,
            reviews: place.reviews?.slice(0, 3).map((review: any) => ({
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                time: review.relative_time_description,
            })) || [],
        };

        return NextResponse.json({
            success: true,
            details: enhancedDetails,
        });
    } catch (error: any) {
        console.error('Error fetching place details:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
