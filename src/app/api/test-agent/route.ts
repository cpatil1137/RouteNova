
import { NextRequest, NextResponse } from "next/server";
import { ChatOllama } from "@langchain/ollama";

export async function GET(request: NextRequest) {
    try {
        const model = new ChatOllama({
            baseUrl: "http://localhost:11434",
            model: "llama3.2",
        });

        const response = await model.invoke("Hello, are you connected?");

        return NextResponse.json({
            success: true,
            message: "Ollama connected!",
            response: response.content
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
