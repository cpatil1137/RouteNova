import { NextRequest, NextResponse } from 'next/server';
import { fetchGoogleCalendarEvents, fetchEventbriteEvents, Event } from '@/lib/services/event-service';

interface EventRequest {
    startDate: string; // ISO date
    endDate: string; // ISO date
    location?: {
        lat: number;
        lon: number;
        radius?: number; // km
    };
    interests?: string[];
}

export async function POST(request: NextRequest) {
    try {
        const body: EventRequest = await request.json();
        const { startDate, endDate, location, interests = [] } = body;

        const events: Event[] = [];

        // Fetch from Google Calendar API
        const googleEvents = await fetchGoogleCalendarEvents(startDate, endDate, location as any);
        events.push(...googleEvents);

        // Fetch from Eventbrite API
        const eventbriteEvents = await fetchEventbriteEvents(startDate, endDate, location as any);
        events.push(...eventbriteEvents);

        // Filter by interests if provided
        let filteredEvents = events;
        if (interests.length > 0) {
            filteredEvents = events.filter(event =>
                interests.some(interest =>
                    event.title.toLowerCase().includes(interest.toLowerCase()) ||
                    event.description.toLowerCase().includes(interest.toLowerCase()) ||
                    event.category.toLowerCase().includes(interest.toLowerCase())
                )
            );
        }

        // Sort by start date
        filteredEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        return NextResponse.json({
            success: true,
            events: filteredEvents,
            count: filteredEvents.length,
        });
    } catch (error: any) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

