/**
 * Type definitions for Supabase database schema
 * Focused on pgvector and RAG functionality
 */

export interface DocumentMetadata {
  source?: string
  title?: string
  author?: string
  tags?: string[]
  timestamp?: string
  url?: string
  [key: string]: any // Allow additional custom metadata
}

export interface Document {
  id: number
  content: string
  metadata: DocumentMetadata
  embedding?: number[] // Vector embedding (1536 dimensions for OpenAI)
  created_at: string
  updated_at: string
}

export interface DocumentInsert {
  content: string
  metadata?: DocumentMetadata
  embedding?: number[]
}

export interface DocumentUpdate {
  content?: string
  metadata?: DocumentMetadata
  embedding?: number[]
}

export interface DocumentMatch {
  id: number
  content: string
  metadata: DocumentMetadata
  similarity: number
}

export interface MatchDocumentsParams {
  queryEmbedding: number[]
  matchCount?: number
  filter?: DocumentMetadata
}

export interface MatchDocumentsWithThresholdParams extends MatchDocumentsParams {
  similarityThreshold?: number
}

export interface SupabaseVectorResponse<T> {
  data: T | null
  error: Error | null
}

/**
 * Database types for Supabase client
 */
export interface Database {
  public: {
    Tables: {
      documents: {
        Row: Document
        Insert: DocumentInsert
        Update: DocumentUpdate
      }
      tasks: {
        Row: {
          id: number
          name: string
          created_at: string
        }
        Insert: {
          name: string
        }
        Update: {
          name?: string
        }
      }
    }
    Functions: {
      match_documents: {
        Args: {
          query_embedding: number[]
          match_count?: number
          filter?: DocumentMetadata
        }
        Returns: DocumentMatch[]
      }
      match_documents_with_threshold: {
        Args: {
          query_embedding: number[]
          similarity_threshold?: number
          match_count?: number
          filter?: DocumentMetadata
        }
        Returns: DocumentMatch[]
      }
      get_document_count: {
        Args: Record<string, never>
        Returns: number
      }
    }
  }
}
