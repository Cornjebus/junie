import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { HttpResponseOutputParser } from "@langchain/core/output_parsers";

import { createDocumentRetrievalTool } from "@/lib/langchain/tools/document-retrieval";
import { createCalculatorTool } from "@/lib/langchain/tools/calculator";

export const runtime = "edge";

/**
 * Convert Vercel chat messages to LangChain messages
 */
const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else {
    return new HumanMessage(message.content);
  }
};

/**
 * Agent prompt template
 */
const AGENT_SYSTEM_TEMPLATE = `You are Junie, a helpful AI assistant with access to various tools.

You have the following capabilities:
- Search the knowledge base for relevant information
- Perform mathematical calculations
- Engage in natural conversation

When using tools:
- Use the knowledge base when users ask questions that might be in your documentation
- Use the calculator for any mathematical operations
- Always cite your sources when using information from the knowledge base

Be helpful, concise, and accurate in your responses.`;

/**
 * POST handler for agent-based chat
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // Convert messages to LangChain format
    const previousMessages = messages
      .slice(0, -1)
      .map(convertVercelMessageToLangChainMessage);

    const currentMessageContent = messages[messages.length - 1].content;

    // Initialize the model
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0.7,
      streaming: true,
    });

    // Create tools
    const tools = [
      createDocumentRetrievalTool(),
      createCalculatorTool(),
    ];

    // Create the agent prompt
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", AGENT_SYSTEM_TEMPLATE],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Create the agent
    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools,
      prompt,
    });

    // Create the agent executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    // Log the request
    console.log("Agent chat - User query:", currentMessageContent);

    // Execute the agent
    const logStream = await agentExecutor.streamLog({
      input: currentMessageContent,
      chat_history: previousMessages,
    });

    // Create output parser
    const textEncoder = new TextEncoder();
    const transformStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of logStream) {
          if (chunk.ops?.length > 0) {
            for (const op of chunk.ops) {
              if (op.path === "/streamed_output/-") {
                // Extract the text content
                const text = op.value?.toString() ?? "";
                if (text) {
                  controller.enqueue(textEncoder.encode(text));
                }
              }
            }
          }
        }
        controller.close();
      },
    });

    return new StreamingTextResponse(transformStream);

  } catch (error: any) {
    console.error("Error in agent chat route:", error);

    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
