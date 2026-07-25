import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { generateRoute } from "@/lib/rag/route-generator";

// Tool 1: Find Places (using GraphRAG)
export const findPlacesTool = new DynamicStructuredTool({
    name: "find_places",
    description: "Finds specific places like cafes, restaurants, coworking spaces, parks, or tourist attractions in Pune based on user query and area. Use this for 'place_query' or finding spots for an itinerary.",
    schema: z.object({
        query: z.string().describe("The search query, e.g., 'cafes with wifi', 'parks for kids'"),
        area: z.string().optional().describe("Specific area or neighborhood in Pune, e.g., 'Koregaon Park', 'Viman Nagar'"),
    }),
    func: async ({ query, area }) => {
        try {
            const fullQuery = area ? `${query} in ${area}` : query;
            console.log(`[Tool: find_places] Searching for: ${fullQuery}`);

            // Re-using the existing RAG pipeline
            const result = await generateRoute(fullQuery, "Tourist");

            return JSON.stringify({
                found: result.places.length,
                places: result.places.map(p => ({
                    id: p.id,
                    name: p.name,
                    type: p.type,
                    lat: p.lat,
                    long: p.long,
                    rating: (p as any).rating,
                    area: (p as any).area || "Pune",
                    description: p.description,
                    images: (p as any).images || [],
                    address: (p as any).address,
                    timings: (p as any).timings,
                    priceRange: (p as any).priceRange,
                    tags: p.tags || [],
                    phoneNumber: (p as any).phoneNumber,
                    reviews: (p as any).reviews,
                    openStatus: (p as any).openStatus,
                })),
                reasoning: result.reasoning
            });
        } catch (error) {
            console.error("[Tool: find_places] Error:", error);
            return "Failed to find places due to an internal error.";
        }
    },
});

// Tool 2: Find Events (Real API)
export const findEventsTool = new DynamicStructuredTool({
    name: "find_events",
    description: "Finds live events, workshops, or meetups happening in Pune. Use this when the user asks for 'events', 'activities', or 'what's happening'.",
    schema: z.object({
        location: z.string().optional().describe("Location filter"),
        date: z.string().optional().describe("Date context, e.g., 'this weekend', 'today'"),
    }),
    func: async ({ location, date }) => {
        console.log(`[Tool: find_events] Searching events in ${location} for ${date}`);

        // Helper to parse date to ISO range
        const now = new Date();
        let startDate = now.toISOString();
        let endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Default 7 days

        if (date) {
            const lowerDate = date.toLowerCase();
            if (lowerDate.includes('today')) {
                endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
            } else if (lowerDate.includes('tomorrow')) {
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                startDate = tomorrow.toISOString();
                endDate = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString();
            } else if (lowerDate.includes('weekend')) {
                const friday = new Date(now);
                friday.setDate(friday.getDate() + (5 - friday.getDay() + 7) % 7);
                startDate = friday.toISOString();
                const sunday = new Date(friday);
                sunday.setDate(sunday.getDate() + 2);
                endDate = sunday.toISOString();
            }
        }

        try {
            const { fetchGoogleCalendarEvents, fetchEventbriteEvents } = await import('@/lib/services/event-service');

            const googleEvents = await fetchGoogleCalendarEvents(startDate, endDate);
            const eventbriteEvents = await fetchEventbriteEvents(startDate, endDate);

            let allEvents = [...googleEvents, ...eventbriteEvents];

            // Filter by location if provided
            if (location) {
                allEvents = allEvents.filter(e =>
                    e.location.name.toLowerCase().includes(location.toLowerCase()) ||
                    (e.description && e.description.toLowerCase().includes(location.toLowerCase()))
                );
            }

            return JSON.stringify({
                events: allEvents.slice(0, 10), // Limit to 10 events
                source: "Google Calendar & Eventbrite APIs"
            });
        } catch (error) {
            console.error("[Tool: find_events] Error:", error);
            return "Failed to fetch real-time events.";
        }
    },
});

// Tool 3: Get Directions
export const getDirectionsTool = new DynamicStructuredTool({
    name: "get_directions",
    description: "Calculates travel time and routing between places. Use this when the user asks for 'directions', 'route', or 'how to get there'.",
    schema: z.object({
        origin: z.string().describe("Starting point name"),
        destination: z.string().describe("Ending point name"),
        mode: z.enum(["driving", "walking", "transit"]).optional().default("driving"),
    }),
    func: async ({ origin, destination, mode }) => {
        console.log(`[Tool: get_directions] ${origin} -> ${destination} (${mode})`);
        // This would connect to Google Directions API
        // Mocking for now to ensure agent flow works

        return JSON.stringify({
            route: `${origin} to ${destination}`,
            distance: "5.2 km",
            duration: "15 mins",
            steps: ["Head north", "Turn right at KP", "Arrive"]
        });
    },
});

export const tools = [findPlacesTool, findEventsTool, getDirectionsTool];
