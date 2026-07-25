
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOllama } from "@langchain/ollama";
import { tools } from "./tools";

// Define the Agent LLM
const model = new ChatOllama({
    baseUrl: "http://localhost:11434",
    model: "llama3.2",
    temperature: 0,
}).bindTools(tools);

// Define nodes
function shouldContinue(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1];

    // If the LLM makes a tool call, we continue to the "tools" node
    const toolCalls = (lastMessage as any).tool_calls;
    if (toolCalls?.length) {
        return "tools";
    }
    // Otherwise, we stop (reply to user)
    return "__end__";
}

async function callModel(state: typeof MessagesAnnotation.State) {
    const messages = state.messages;
    const response = await model.invoke(messages);
    return { messages: [response] };
}

// Define the graph
const workflow = new StateGraph(MessagesAnnotation)
    .addNode("agent", callModel)
    .addNode("tools", new ToolNode(tools))
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

// Compile the graph
export const agentGraph = workflow.compile();
