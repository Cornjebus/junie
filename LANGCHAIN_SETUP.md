# LangChain + Vercel AI SDK Setup Guide

Complete guide for using LangChain with Vercel AI SDK for streaming chat and RAG in Junie.

## Overview

This project integrates:
- **LangChain** - Framework for building LLM applications
- **Vercel AI SDK** - Streaming chat UI and utilities
- **OpenAI** - LLM provider (GPT-4o-mini)
- **Supabase pgvector** - Vector store for RAG
- **Next.js App Router** - Modern React framework

## Architecture

```
┌─────────────────────────────────────────────┐
│  Client (React + Vercel AI SDK)             │
│  ┌─────────────────────────────────────┐   │
│  │  useChat() hook                     │   │
│  │  - Manages chat state               │   │
│  │  - Handles streaming                │   │
│  │  - Auto-updates UI                  │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │ HTTP POST
                   ▼
┌─────────────────────────────────────────────┐
│  API Routes (Edge Runtime)                  │
│                                             │
│  /api/chat (Basic RAG)                      │
│  ┌─────────────────────────────────────┐   │
│  │ 1. Retrieve context from pgvector   │   │
│  │ 2. Format prompt with context       │   │
│  │ 3. Stream LLM response              │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  /api/chat/agents (Advanced)                │
│  ┌─────────────────────────────────────┐   │
│  │ 1. Initialize LangChain agent       │   │
│  │ 2. Provide tools (search, calc)     │   │
│  │ 3. Agent decides when to use tools  │   │
│  │ 4. Stream results                   │   │
│  └─────────────────────────────────────┘   │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│  LangChain Tools                            │
│  - Document Retrieval (pgvector)            │
│  - Calculator (math operations)             │
│  - [Add your custom tools]                  │
└─────────────────────────────────────────────┘
```

## Files Structure

```
app/
├── api/
│   └── chat/
│       ├── route.ts              # Basic RAG chat
│       └── agents/
│           └── route.ts          # Agent-based chat with tools
├── chat/
│   └── page.tsx                  # Chat page
│
components/
└── chat.tsx                      # Chat UI component
│
lib/
├── langchain/
│   └── tools/
│       ├── document-retrieval.ts # Vector store search tool
│       ├── calculator.ts         # Calculator tool
│       └── index.ts              # Export all tools
│
└── supabase/
    ├── vector-store.ts           # Vector operations
    └── client.ts                 # Supabase client
```

## Two Chat Endpoints

### 1. Basic RAG Chat (`/api/chat`)

**Use this for:**
- Simple question-answering over documents
- When you always want to retrieve context
- Faster responses (no tool decision overhead)

**Features:**
- Automatic context retrieval from vector store
- Streaming responses
- Error handling
- Formatted prompts with context

**Example usage:**
```typescript
const { messages, input, handleSubmit } = useChat({
  api: '/api/chat',
})
```

### 2. Agent Chat (`/api/chat/agents`)

**Use this for:**
- Complex multi-step tasks
- When the AI needs to decide when to search
- Tasks requiring multiple tools
- More sophisticated reasoning

**Features:**
- LangChain agent with function calling
- Multiple tools (search, calculator, etc.)
- Agent decides when and which tools to use
- Streaming responses
- Full conversation history

**Example usage:**
```typescript
const { messages, input, handleSubmit } = useChat({
  api: '/api/chat/agents',
})
```

## Available Tools

### 1. Document Retrieval Tool

**Name:** `search_knowledge_base`

**Description:** Searches the vector store for relevant documents

**Parameters:**
- `query` (string) - Search query
- `limit` (number, optional) - Max results (default: 3)

**Example:**
```typescript
// The agent will use this automatically when needed
// User: "What is the documentation about authentication?"
// Agent: *uses search_knowledge_base tool*
```

### 2. Calculator Tool

**Name:** `calculator`

**Description:** Performs mathematical calculations

**Parameters:**
- `expression` (string) - Math expression to evaluate

**Example:**
```typescript
// User: "What's 234 * 567?"
// Agent: *uses calculator tool*
```

## Creating Custom Tools

Create a new tool in `lib/langchain/tools/`:

```typescript
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

export function createMyCustomTool() {
  return new DynamicStructuredTool({
    name: "my_tool",
    description: "What this tool does",
    schema: z.object({
      param1: z.string().describe("Parameter description"),
    }),
    func: async ({ param1 }) => {
      // Tool implementation
      return "Tool result";
    },
  });
}
```

Then add it to the agent in `app/api/chat/agents/route.ts`:

```typescript
import { createMyCustomTool } from "@/lib/langchain/tools/my-tool";

const tools = [
  createDocumentRetrievalTool(),
  createCalculatorTool(),
  createMyCustomTool(), // Add your tool
];
```

## Streaming Implementation

### Server Side (LangChain)

```typescript
// Basic streaming
const chain = RunnableSequence.from([
  prompt,
  model,
  new HttpResponseOutputParser(),
]);

const stream = await chain.stream({ input: userMessage });
return new StreamingTextResponse(stream);
```

### Client Side (Vercel AI SDK)

```typescript
const { messages, input, handleSubmit, isLoading } = useChat({
  api: '/api/chat',
  onError: (error) => {
    console.error('Chat error:', error)
  },
})

// Messages are automatically updated as they stream
```

## Error Handling

### API Route Errors

```typescript
try {
  // Chat logic
} catch (error: any) {
  console.error("Error in chat route:", error);

  return NextResponse.json(
    {
      error: "An error occurred",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    },
    { status: 500 }
  );
}
```

### Client-Side Errors

```typescript
const { error } = useChat({
  api: '/api/chat',
  onError: (error) => {
    // Custom error handling
    console.error('Chat error:', error)
  },
})

// Display error in UI
{error && (
  <div className="text-destructive">
    Error: {error.message}
  </div>
)}
```

## Environment Variables

Ensure these are set in `.env.local`:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_KEY=...

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Testing the Chat

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Visit the Chat Page

Navigate to: http://localhost:3000/chat

### 3. Test Basic RAG

Default endpoint uses `/api/chat` with automatic context retrieval.

**Try these queries:**
- "What information do you have?" (tests retrieval)
- "Tell me about [topic in your docs]"
- "Summarize the key points about [topic]"

### 4. Test Agent with Tools

Update the Chat component to use the agents endpoint:

```typescript
const { messages, input, handleSubmit } = useChat({
  api: '/api/chat/agents', // Use agent endpoint
})
```

**Try these queries:**
- "What's 123 * 456?" (tests calculator)
- "Search for information about authentication and calculate how many steps are involved" (tests both tools)
- "What is 50% of 1000?" (tests calculator)

## Performance Optimization

### 1. Caching Embeddings

Consider caching frequently used embeddings:

```typescript
// Use a cache for embeddings
const embeddingCache = new Map<string, number[]>()

async function getCachedEmbedding(text: string) {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!
  }

  const embedding = await generateEmbedding(text)
  embeddingCache.set(text, embedding)
  return embedding
}
```

### 2. Limit Context Length

```typescript
// Limit retrieved documents
const matches = await matchDocuments(client, {
  queryEmbedding,
  matchCount: 3, // Keep this low
  similarityThreshold: 0.75, // Only high-quality matches
})
```

### 3. Edge Runtime

All routes use Edge runtime for fast cold starts:

```typescript
export const runtime = "edge";
```

## Debugging

### Enable Verbose Logging

```typescript
// In API routes
console.log("User query:", currentMessageContent)
console.log("Retrieved context:", context)
console.log("Tool results:", toolResults)
```

### Check Network Tab

1. Open Chrome DevTools → Network
2. Look for requests to `/api/chat` or `/api/chat/agents`
3. Check if streaming is working (should see chunks arriving)
4. Inspect response headers and body

### Common Issues

**Streaming not working:**
- Ensure `runtime = "edge"` is set
- Check that `HttpResponseOutputParser` is used
- Verify `StreamingTextResponse` is returned

**Tool not being used:**
- Check tool description is clear
- Verify tool name doesn't conflict
- Test with explicit queries that should trigger the tool

**Vector search returns nothing:**
- Verify documents are in the database
- Check embedding dimensions match (1536)
- Lower similarity threshold
- Verify query embedding is generated correctly

## Advanced Usage

### Custom Prompt Templates

```typescript
const CUSTOM_TEMPLATE = `You are a specialized assistant for {domain}.

Context: {context}
History: {chat_history}
Question: {input}

Answer:`;

const prompt = PromptTemplate.fromTemplate(CUSTOM_TEMPLATE);
```

### Multiple Models

```typescript
// Fast model for simple queries
const fastModel = new ChatOpenAI({ model: "gpt-4o-mini" });

// Powerful model for complex tasks
const powerfulModel = new ChatOpenAI({ model: "gpt-4o" });

// Choose based on query complexity
const model = isComplexQuery ? powerfulModel : fastModel;
```

### Chain Composition

```typescript
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";

const chain = RunnableSequence.from([
  {
    context: async (input) => retrieveContext(input.question),
    question: new RunnablePassthrough(),
  },
  prompt,
  model,
  outputParser,
]);
```

## Next Steps

1. **Add more tools** - Create custom tools for your use case
2. **Implement memory** - Add conversation memory beyond messages
3. **Fine-tune prompts** - Customize for your domain
4. **Add authentication** - Restrict access to authenticated users
5. **Monitor usage** - Track API calls and costs
6. **Implement rate limiting** - Protect against abuse

## Resources

- [LangChain.js Documentation](https://js.langchain.com/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- [LangChain Next.js Template](https://github.com/langchain-ai/langchain-nextjs-template)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Supabase Vector Documentation](https://supabase.com/docs/guides/ai)
