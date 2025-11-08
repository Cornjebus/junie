import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

import { createServerSupabaseClient } from "@/lib/supabase/client";
import { matchDocuments } from "@/lib/supabase/vector-store";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

/**
 * Basic prompt template for Junie
 * Customize this to match your AI assistant's personality
 */
const JUNIE_TEMPLATE = `You are Junie, a helpful AI assistant with access to a knowledge base.

When answering questions:
- Use the provided context from the knowledge base when relevant
- Be concise but thorough
- If you don't know something, admit it
- Cite sources when you use information from the context

Context from knowledge base:
{context}

Current conversation:
{chat_history}

User: {input}
Junie:`;

/**
 * Generate embeddings for a query
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const embedding = await embeddings.embedQuery(text);
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}

/**
 * Retrieve relevant documents from the vector store
 */
async function retrieveContext(query: string): Promise<string> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search for similar documents in Supabase
    const client = createServerSupabaseClient();
    const matches = await matchDocuments(client, {
      queryEmbedding,
      matchCount: 3, // Top 3 most relevant documents
      // Optional: Add metadata filter
      // filter: { source: 'documentation' }
    });

    // Format the retrieved documents as context
    if (matches.length === 0) {
      return "No relevant information found in the knowledge base.";
    }

    const context = matches
      .map((doc, idx) => {
        const source = doc.metadata?.title || doc.metadata?.source || 'Unknown';
        return `[${idx + 1}] ${source}: ${doc.content}`;
      })
      .join("\n\n");

    return context;
  } catch (error) {
    console.error("Error retrieving context:", error);
    // Return empty context on error rather than failing the whole request
    return "Unable to retrieve context from knowledge base.";
  }
}

/**
 * POST handler for chat endpoint
 * Supports streaming responses with RAG
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

    // Get the current message
    const currentMessageContent = messages[messages.length - 1].content;

    // Format previous messages for chat history
    const formattedPreviousMessages = messages
      .slice(0, -1)
      .map(formatMessage)
      .join("\n");

    // Retrieve relevant context from vector store (RAG)
    console.log("Retrieving context for query:", currentMessageContent);
    const context = await retrieveContext(currentMessageContent);
    console.log("Retrieved context:", context.substring(0, 200) + "...");

    // Create the prompt template
    const prompt = PromptTemplate.fromTemplate(JUNIE_TEMPLATE);

    // Initialize the model
    const model = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
      temperature: 0.7,
      streaming: true,
    });

    // Create the output parser for streaming
    const outputParser = new HttpResponseOutputParser();

    // Chain the prompt, model, and parser together
    const chain = RunnableSequence.from([
      prompt,
      model,
      outputParser,
    ]);

    // Stream the response
    const stream = await chain.stream({
      chat_history: formattedPreviousMessages,
      input: currentMessageContent,
      context: context,
    });

    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error("Error in chat route:", error);

    // Return a proper error response
    return NextResponse.json(
      {
        error: "An error occurred while processing your request",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
