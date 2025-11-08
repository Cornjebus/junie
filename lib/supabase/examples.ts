/**
 * Example usage of the vector store utilities
 * This file demonstrates how to use Junie's RAG system
 */

import { createServerSupabaseClient } from './client'
import {
  insertDocument,
  insertDocuments,
  matchDocuments,
  matchDocumentsWithThreshold,
  getDocumentCount,
  searchDocumentsByMetadata,
} from './vector-store'
import type { DocumentInsert } from './types'

/**
 * Example: Insert a single document with embedding
 */
export async function exampleInsertDocument() {
  const client = createServerSupabaseClient()

  const document: DocumentInsert = {
    content: 'This is a sample document about Next.js and Supabase integration.',
    metadata: {
      source: 'documentation',
      title: 'Next.js + Supabase Guide',
      tags: ['nextjs', 'supabase', 'tutorial'],
    },
    // In production, you would generate this embedding using OpenAI or similar
    embedding: new Array(1536).fill(0), // Placeholder embedding
  }

  try {
    const result = await insertDocument(client, document)
    console.log('Document inserted:', result)
    return result
  } catch (error) {
    console.error('Failed to insert document:', error)
    throw error
  }
}

/**
 * Example: Insert multiple documents in bulk
 */
export async function exampleBulkInsert() {
  const client = createServerSupabaseClient()

  const documents: DocumentInsert[] = [
    {
      content: 'Introduction to RAG systems and vector databases.',
      metadata: {
        source: 'blog',
        title: 'Understanding RAG',
        tags: ['rag', 'ai', 'vectors'],
      },
      embedding: new Array(1536).fill(0),
    },
    {
      content: 'How to use pgvector with PostgreSQL for semantic search.',
      metadata: {
        source: 'tutorial',
        title: 'pgvector Tutorial',
        tags: ['postgresql', 'pgvector', 'search'],
      },
      embedding: new Array(1536).fill(0),
    },
  ]

  try {
    const results = await insertDocuments(client, documents)
    console.log(`Inserted ${results.length} documents`)
    return results
  } catch (error) {
    console.error('Failed to insert documents:', error)
    throw error
  }
}

/**
 * Example: Search for similar documents
 */
export async function exampleSemanticSearch(queryText: string) {
  const client = createServerSupabaseClient()

  // In production, generate embedding from queryText using OpenAI
  const queryEmbedding = new Array(1536).fill(0) // Placeholder

  try {
    const matches = await matchDocuments(client, {
      queryEmbedding,
      matchCount: 5,
      // Optional: filter by metadata
      filter: { source: 'documentation' },
    })

    console.log(`Found ${matches.length} similar documents:`)
    matches.forEach((match) => {
      console.log(`- ${match.content} (similarity: ${match.similarity})`)
    })

    return matches
  } catch (error) {
    console.error('Failed to search documents:', error)
    throw error
  }
}

/**
 * Example: Search with similarity threshold
 */
export async function exampleSearchWithThreshold(queryText: string) {
  const client = createServerSupabaseClient()

  // In production, generate embedding from queryText
  const queryEmbedding = new Array(1536).fill(0)

  try {
    const matches = await matchDocumentsWithThreshold(client, {
      queryEmbedding,
      similarityThreshold: 0.8, // Only return documents with 80%+ similarity
      matchCount: 10,
    })

    console.log(`Found ${matches.length} highly similar documents`)
    return matches
  } catch (error) {
    console.error('Failed to search documents:', error)
    throw error
  }
}

/**
 * Example: Get document statistics
 */
export async function exampleGetStats() {
  const client = createServerSupabaseClient()

  try {
    const count = await getDocumentCount(client)
    console.log(`Total documents in vector store: ${count}`)
    return count
  } catch (error) {
    console.error('Failed to get document count:', error)
    throw error
  }
}

/**
 * Example: Search by metadata
 */
export async function exampleSearchByTag(tag: string) {
  const client = createServerSupabaseClient()

  try {
    const documents = await searchDocumentsByMetadata(client, {
      tags: [tag],
    })

    console.log(`Found ${documents.length} documents with tag: ${tag}`)
    return documents
  } catch (error) {
    console.error('Failed to search by tag:', error)
    throw error
  }
}

/**
 * Example: Complete RAG pipeline
 * This shows how you would typically use the vector store in a RAG application
 */
export async function exampleRAGPipeline(userQuery: string) {
  const client = createServerSupabaseClient()

  console.log('User query:', userQuery)

  // Step 1: Generate embedding for user query
  // In production, use OpenAI's embedding API:
  // const embedding = await generateEmbedding(userQuery)
  const queryEmbedding = new Array(1536).fill(0) // Placeholder

  // Step 2: Search for relevant documents
  const relevantDocs = await matchDocumentsWithThreshold(client, {
    queryEmbedding,
    similarityThreshold: 0.7,
    matchCount: 3, // Get top 3 most relevant documents
  })

  console.log(`Retrieved ${relevantDocs.length} relevant documents`)

  // Step 3: Build context from retrieved documents
  const context = relevantDocs
    .map((doc) => `Document: ${doc.content}`)
    .join('\n\n')

  // Step 4: Generate response using LLM with context
  // In production, use OpenAI or similar:
  // const response = await generateResponse(userQuery, context)
  const response = `Generated response using context from ${relevantDocs.length} documents`

  return {
    query: userQuery,
    retrievedDocuments: relevantDocs,
    context,
    response,
  }
}
