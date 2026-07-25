
export interface EventLocation {
    name: string;
    lat?: number;
    lon?: number;
    radius?: number;
}

export interface Event {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    location: {
        name: string;
        lat?: number;
        lon?: number;
    };
    source: 'google_calendar' | 'eventbrite';
    category: string;
    url?: string;
    imageUrl?: string;
}

export async function fetchGoogleCalendarEvents(
    startDate: string,
    endDate: string,
    location?: EventLocation
): Promise<Event[]> {
    const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;
    if (!apiKey) {
        console.warn('Google Calendar API key not configured');
        return [];
    }

    try {
        // Using public calendar for Pune events or a generic Indian holiday calendar as fallback
        // Ideally, this should be a calendar ID specific to Pune events if available
        const calendarId = 'en.indian%23holiday@group.v.calendar.google.com';

        const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&timeMin=${startDate}&timeMax=${endDate}&singleEvents=true&orderBy=startTime`;

        const response = await fetch(url);
        const data = await response.json();

        if (!data.items) {
            return [];
        }

        return data.items.map((item: any) => ({
            id: `google_${item.id}`,
            title: item.summary || 'Untitled Event',
            description: item.description || '',
            startDate: item.start.dateTime || item.start.date,
            endDate: item.end.dateTime || item.end.date,
            location: {
                name: item.location || 'Pune',
            },
            source: 'google_calendar' as const,
            category: 'holiday',
            url: item.htmlLink,
        }));
    } catch (error) {
        console.error('Google Calendar API error:', error);
        return [];
    }
}

export async function fetchEventbriteEvents(
    startDate: string,
    endDate: string,
    location?: EventLocation
): Promise<Event[]> {
    const apiToken = process.env.EVENTBRITE_API_TOKEN;
    if (!apiToken) {
        // console.warn('Eventbrite API token not configured');
        return [];
    }

    try {
        // Search for events in Pune
        const locationQuery = location
            ? `&location.latitude=${location.lat}&location.longitude=${location.lon}&location.within=${location.radius || 10}km`
            : '&location.address=Pune,India';

        const url = `https://www.eventbriteapi.com/v3/events/search/?start_date.range_start=${startDate}&start_date.range_end=${endDate}${locationQuery}&expand=venue,category`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
        });

        const data = await response.json();

        if (!data.events) {
            return [];
        }

        return data.events.map((event: any) => ({
            id: `eventbrite_${event.id}`,
            title: event.name.text,
            description: event.description?.text || '',
            startDate: event.start.utc,
            endDate: event.end.utc,
            location: {
                name: event.venue?.name || 'Pune',
                lat: event.venue?.latitude,
                lon: event.venue?.longitude,
            },
            source: 'eventbrite' as const,
            category: event.category?.name || 'general',
            url: event.url,
            imageUrl: event.logo?.url,
        }));
    } catch (error) {
        console.error('Eventbrite API error:', error);
        return [];
    }
}
