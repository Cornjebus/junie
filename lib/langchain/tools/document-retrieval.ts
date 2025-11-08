/**
 * Document Retrieval Tool for LangChain
 * Allows the agent to search the vector store for relevant documents
 */

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createServerSupabaseClient } from "@/lib/supabase/client";
import { matchDocumentsWithThreshold } from "@/lib/supabase/vector-store";

/**
 * Create a document retrieval tool
 * This tool allows the AI to search the knowledge base
 */
export function createDocumentRetrievalTool() {
  return new DynamicStructuredTool({
    name: "search_knowledge_base",
    description: "Search the knowledge base for relevant information. Use this when you need to find specific information or context to answer a question.",
    schema: z.object({
      query: z.string().describe("The search query to find relevant documents"),
      limit: z.number().optional().default(3).describe("Maximum number of documents to return (default: 3)"),
    }),
    func: async ({ query, limit = 3 }) => {
      try {
        // Generate embedding for the query
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY,
        });
        const queryEmbedding = await embeddings.embedQuery(query);

        // Search for similar documents
        const client = createServerSupabaseClient();
        const matches = await matchDocumentsWithThreshold(client, {
          queryEmbedding,
          similarityThreshold: 0.7,
          matchCount: limit,
        });

        if (matches.length === 0) {
          return "No relevant documents found in the knowledge base.";
        }

        // Format results
        const results = matches.map((doc, idx) => {
          const source = doc.metadata?.title || doc.metadata?.source || 'Unknown';
          const similarity = (doc.similarity * 100).toFixed(1);
          return `[${idx + 1}] (${similarity}% match) ${source}:\n${doc.content}`;
        }).join("\n\n");

        return results;
      } catch (error) {
        console.error("Error in document retrieval tool:", error);
        return "Error retrieving documents from knowledge base.";
      }
    },
  });
}
