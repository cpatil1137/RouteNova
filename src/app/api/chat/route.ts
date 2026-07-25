import { NextRequest, NextResponse } from 'next/server';
import { generateRoute } from '@/lib/rag/route-generator';
import { classifyIntent } from '@/lib/agent/intent-classifier';

interface ChatRequest {
    message: string;
    config: {
        budget: 'budget' | 'moderate' | 'luxury';
        days: number;
        pace: 'relaxed' | 'moderate' | 'packed';
        interests: string[];
    };
    history?: any[];
}

export async function POST(request: NextRequest) {
    try {
        const body: ChatRequest = await request.json();
        const { message, config, history = [] } = body;

        // 1. Classify Intent
        const classification = await classifyIntent(message);
        console.log('Intent:', classification);

        // 2. Route based on intent
        if (classification.intent === 'greeting') {
            return NextResponse.json({
                success: true,
                response: "Hey there! 👋 I'm your AI guide for Pune. \n\nI can help you:\n• Find hidden gem cafes & workspace ☕\n• Plan a full weekend itinerary 🗓️\n• Check for live events nearby 🎉\n\nWhere would you like to explore today? 🗺️",
                places: [],
                route: []
            });
        }

        if (classification.intent === 'other') {
            return NextResponse.json({
                success: true,
                response: "I'm tuned specifically for planning trips and finding cool spots in Pune! 😅\n\nTry asking me something like:\n• \"Best cafes in Koregaon Park\"\n• \"Plan a 2-day trip for a couple\"\n• \"Coworking spaces with good wifi\"",
                places: [],
                route: []
            });
        }

        // 3. Handle Place Queries & Plan Requests (Existing RAG Pipeline)

        // Check if query is asking for events
        const isEventQuery = message.toLowerCase().includes('event') ||
            message.toLowerCase().includes('festival') ||
            message.toLowerCase().includes('happening');

        // Build enhanced query with config
        let enhancedQuery = message;

        // Add budget context
        const budgetMap = {
            budget: 'budget-friendly, cheap, affordable',
            moderate: 'moderate pricing, mid-range',
            luxury: 'upscale, premium, luxury, expensive',
        };
        enhancedQuery += ` ${budgetMap[config.budget]}`;

        // Add interests
        if (config.interests.length > 0) {
            enhancedQuery += ` interested in ${config.interests.join(', ')}`;
        }

        // Add multi-day context
        if (config.days > 1) {
            enhancedQuery += ` for ${config.days} days`;
        }

        // Add pace context
        const paceMap = {
            relaxed: '2-3 places per day, relaxed pace',
            moderate: '4-5 places per day, moderate pace',
            packed: '6+ places per day, packed itinerary',
        };
        enhancedQuery += ` ${paceMap[config.pace]}`;

        console.log('Enhanced query:', enhancedQuery);

        // Build conversation context from history
        let conversationContext = '';
        if (history.length > 0) {
            conversationContext = '\n\nPrevious conversation:\n';
            history.slice(-5).forEach((msg: any) => {
                conversationContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            });
            conversationContext += '\nCurrent query: ';
        }

        // Generate route using existing RAG pipeline with context
        const result = await generateRoute(
            conversationContext + enhancedQuery,
            'Tourist'
        );

        // Build conversational response
        let response = '';

        if (config.days > 1) {
            response += `🗓️ Here's a ${config.days}-day ${config.budget} trip plan:\n\n`;
        } else {
            response += `✨ Based on your ${config.budget} budget, here are my recommendations:\n\n`;
        }

        // Add reasoning
        response += `${result.reasoning}\n\n`;

        // Add place count
        response += `📍 I found ${result.places.length} great places for you. `;

        if (config.days > 1) {
            const placesPerDay = Math.ceil(result.places.length / config.days);
            response += `That's about ${placesPerDay} places per day at a ${config.pace} pace.`;
        }

        response += `\n\nClick on any place card below to see it on the map! 🗺️`;

        // If asking for events, fetch them
        let events = [];
        if (isEventQuery && result.places.length > 0) {
            try {
                // Get date range (next 7 days by default)
                const startDate = new Date().toISOString();
                const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

                // Get location from first place
                const location = {
                    lat: result.places[0].lat,
                    lon: result.places[0].long,
                    radius: 10, // 10km radius
                };

                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
                const eventResponse = await fetch(`${baseUrl}/api/events`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        startDate,
                        endDate,
                        location,
                        interests: config.interests,
                    }),
                });

                const eventData = await eventResponse.json();
                if (eventData.success && eventData.events.length > 0) {
                    events = eventData.events;
                    response += `\n\n🎉 I also found ${events.length} events happening in this area!`;
                }
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }

        // Generate follow-up questions based on context
        const followUpQuestions = [];

        // Add contextual follow-ups
        if (config.days === 1) {
            followUpQuestions.push('Can you plan a 2-day trip instead?');
        }

        if (config.budget !== 'luxury') {
            followUpQuestions.push('Show me luxury options');
        }

        if (!config.interests.includes('food')) {
            followUpQuestions.push('Add food recommendations');
        }

        // Show event suggestion if we have places and haven't shown events yet
        const showEventSuggestion = result.places.length > 0 && !isEventQuery;

        return NextResponse.json({
            success: true,
            response,
            places: result.places,
            route: result.route,
            events: events.length > 0 ? events : undefined,
            followUpQuestions,
            showEventSuggestion,
        });
    } catch (error: any) {
        console.error('Error in chat API:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to process message',
            },
            { status: 500 }
        );
    }
}
