
import { NextRequest, NextResponse } from 'next/server';
import { agentGraph } from '@/lib/agent/graph';
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { classifyIntent } from '@/lib/agent/intent-classifier';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, config, history = [] } = body;

        // 1. Classify Intent (Fast Path)
        const classification = await classifyIntent(message);

        // Quick responses for non-planning intents
        if (classification.intent === 'greeting') {
            return NextResponse.json({
                success: true,
                response: "Hey there! 👋 I'm your Agentic Pune Guide. I can plan trips, find events, and get you directions! 🗺️\n\nTry:\n• \"Plan a weekend in Koregaon Park with events\"\n• \"Best cafes in Viman Nagar\"\n• \"Route from Shivajinagar to Camp\"",
                places: [],
                events: []
            });
        }

        if (classification.intent === 'other') {
            return NextResponse.json({
                success: true,
                response: "I focus on Pune trips and events! 😅 Try asking about:\n• Places to visit 📍\n• Live events 🎉\n• Directions 🚗",
                places: [],
                events: []
            });
        }

        // 2. Run Agentic Workflow (Slow Path)
        console.log(`[Agent] Starting workflow for: ${message}`);

        // Construct System Context from Config
        let systemContext = "You are an expert local guide for Pune City. Answer the user's request using the available tools.";
        if (config) {
            systemContext += `\n\nCURRENT TRIP PREFERENCES:
- Budget: ${config.budget}
- Duration: ${config.days} days
- Pace: ${config.pace}
- Interests: ${config.interests.join(', ')}

When suggesting places or planning itineraries, YOU MUST STRICTLY ADHERE to these preferences.
For 'budget' trips, suggest affordable places. For 'luxury', suggest high-end spots.
For 'relaxed' pace, suggest fewer places. For 'packed', suggest more.
Prioritize places that match the user's selected 'Interests'.`;
        }

        const inputMessages = [
            new SystemMessage(systemContext),
            new HumanMessage(message)
        ];

        // Invoke the graph
        const result = await agentGraph.invoke({ messages: inputMessages });
        const finalMessages = result.messages;
        const lastMessage = finalMessages[finalMessages.length - 1];
        const responseText = lastMessage.content;

        // 3. Extract structured data (Places/Events) from Tool outputs
        // We iterate through messages to find ToolMessages that returned JSON data
        let places: any[] = [];
        let events: any[] = [];

        for (const msg of finalMessages) {
            if (msg.getType() === 'tool') {
                try {
                    const content = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;

                    if (content.places && Array.isArray(content.places)) {
                        places = [...places, ...content.places];
                    }

                    if (content.events && Array.isArray(content.events)) {
                        events = [...events, ...content.events];
                    }
                } catch (e) {
                    // Ignore non-JSON tool outputs
                }
            }
        }

        return NextResponse.json({
            success: true,
            response: typeof responseText === 'string' ? responseText : JSON.stringify(responseText),
            places: places, // Extracted from tool calls
            events: events, // Extracted from tool calls
            intent: classification.intent
        });

    } catch (error: any) {
        console.error("[Agent API] Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
