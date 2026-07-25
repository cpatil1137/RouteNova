
import { ChatOllama } from "@langchain/ollama";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Initialize Ollama model (llama3.2 as requested)
const llm = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default Ollama URL
    model: "llama3.2",
    temperature: 0, // Deterministic for classification
    format: "json", // Force JSON output
});

const CLASSIFICATION_PROMPT = `
You are an intent classifier for a Pune Trip Planner chatbot.
Classify the user's message into exactly one of these categories:

1. **greeting**: Basic hellos, formalities. Examples: "Hi", "Hello", "Good morning", "Thanks", "Bye".
2. **place_query**: Asking for specific places, cafes, restaurants, etc. Examples: "Cafes near Koregaon Park", "Best coworking spaces", "Find me a gym".
3. **plan_request**: Asking for an itinerary or plan. Examples: "Plan a weekend trip", "2 day itinerary for pune", "What to do on Saturday".
4. **other**: Anything not related to planning trips in Pune. Examples: "What is the weather?", "Tell me a joke", "Write code".

Return ONLY a JSON object with this format:
{{
  "intent": "greeting" | "place_query" | "plan_request" | "other",
  "confidence": number
}}

User Message: {message}
`;

export async function classifyIntent(message: string): Promise<{ intent: string; confidence: number }> {
    try {
        const prompt = PromptTemplate.fromTemplate(CLASSIFICATION_PROMPT);
        const chain = prompt.pipe(llm).pipe(new StringOutputParser());

        const result = await chain.invoke({ message });
        return JSON.parse(result);
    } catch (error) {
        console.error("Intent classification failed:", error);
        // Fallback to place_query if unsure, or 'other'
        return { intent: "place_query", confidence: 0 };
    }
}
