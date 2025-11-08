/**
 * Vector store utilities for RAG (Retrieval Augmented Generation)
 * Provides functions for storing and searching document embeddings
 */

import { SupabaseClient } from '@supabase/supabase-js'
import type {
  Database,
  DocumentInsert,
  DocumentMatch,
  MatchDocumentsParams,
  MatchDocumentsWithThresholdParams,
} from './types'

type SupabaseClientType = SupabaseClient<Database>

/**
 * Insert a document with its embedding into the vector store
 */
export async function insertDocument(
  client: SupabaseClientType,
  document: DocumentInsert
) {
  const { data, error } = await client
    .from('documents')
    .insert(document)
    .select()
    .single()

  if (error) {
    console.error('Error inserting document:', error)
    throw new Error(`Failed to insert document: ${error.message}`)
  }

  return data
}

/**
 * Insert multiple documents with embeddings in bulk
 */
export async function insertDocuments(
  client: SupabaseClientType,
  documents: DocumentInsert[]
) {
  const { data, error } = await client
    .from('documents')
    .insert(documents)
    .select()

  if (error) {
    console.error('Error inserting documents:', error)
    throw new Error(`Failed to insert documents: ${error.message}`)
  }

  return data
}

/**
 * Search for similar documents using vector similarity
 */
export async function matchDocuments(
  client: SupabaseClientType,
  params: MatchDocumentsParams
): Promise<DocumentMatch[]> {
  const { queryEmbedding, matchCount = 10, filter = {} } = params

  const { data, error } = await client.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: matchCount,
    filter: filter,
  })

  if (error) {
    console.error('Error matching documents:', error)
    throw new Error(`Failed to match documents: ${error.message}`)
  }

  return data as DocumentMatch[]
}

/**
 * Search for similar documents with a minimum similarity threshold
 */
export async function matchDocumentsWithThreshold(
  client: SupabaseClientType,
  params: MatchDocumentsWithThresholdParams
): Promise<DocumentMatch[]> {
  const {
    queryEmbedding,
    similarityThreshold = 0.7,
    matchCount = 10,
    filter = {},
  } = params

  const { data, error } = await client.rpc('match_documents_with_threshold', {
    query_embedding: queryEmbedding,
    similarity_threshold: similarityThreshold,
    match_count: matchCount,
    filter: filter,
  })

  if (error) {
    console.error('Error matching documents with threshold:', error)
    throw new Error(`Failed to match documents: ${error.message}`)
  }

  return data as DocumentMatch[]
}

/**
 * Get a document by ID
 */
export async function getDocumentById(
  client: SupabaseClientType,
  id: number
) {
  const { data, error } = await client
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error getting document:', error)
    throw new Error(`Failed to get document: ${error.message}`)
  }

  return data
}

/**
 * Update a document
 */
export async function updateDocument(
  client: SupabaseClientType,
  id: number,
  updates: Partial<DocumentInsert>
) {
  const { data, error } = await client
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating document:', error)
    throw new Error(`Failed to update document: ${error.message}`)
  }

  return data
}

/**
 * Delete a document by ID
 */
export async function deleteDocument(client: SupabaseClientType, id: number) {
  const { error } = await client.from('documents').delete().eq('id', id)

  if (error) {
    console.error('Error deleting document:', error)
    throw new Error(`Failed to delete document: ${error.message}`)
  }

  return true
}

/**
 * Delete all documents (use with caution!)
 */
export async function deleteAllDocuments(client: SupabaseClientType) {
  const { error } = await client.from('documents').delete().neq('id', 0)

  if (error) {
    console.error('Error deleting all documents:', error)
    throw new Error(`Failed to delete all documents: ${error.message}`)
  }

  return true
}

/**
 * Get total count of documents
 */
export async function getDocumentCount(
  client: SupabaseClientType
): Promise<number> {
  const { data, error } = await client.rpc('get_document_count')

  if (error) {
    console.error('Error getting document count:', error)
    throw new Error(`Failed to get document count: ${error.message}`)
  }

  return data as number
}

/**
 * Get all documents (with pagination)
 */
export async function getAllDocuments(
  client: SupabaseClientType,
  options?: {
    limit?: number
    offset?: number
    orderBy?: 'created_at' | 'updated_at'
    ascending?: boolean
  }
) {
  const {
    limit = 100,
    offset = 0,
    orderBy = 'created_at',
    ascending = false,
  } = options || {}

  const { data, error } = await client
    .from('documents')
    .select('*')
    .order(orderBy, { ascending })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error getting documents:', error)
    throw new Error(`Failed to get documents: ${error.message}`)
  }

  return data
}

/**
 * Search documents by metadata filter
 */
export async function searchDocumentsByMetadata(
  client: SupabaseClientType,
  metadataFilter: Record<string, any>
) {
  const { data, error } = await client
    .from('documents')
    .select('*')
    .contains('metadata', metadataFilter)

  if (error) {
    console.error('Error searching documents by metadata:', error)
    throw new Error(`Failed to search documents: ${error.message}`)
  }

  return data
}
