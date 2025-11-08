# Supabase pgvector Setup for Junie's RAG System

This directory contains the database migrations and setup for Junie's Retrieval Augmented Generation (RAG) system using Supabase and pgvector.

## Overview

The RAG system uses:
- **pgvector** - PostgreSQL extension for vector similarity search
- **OpenAI Embeddings** - 1536-dimensional vectors (text-embedding-ada-002 or text-embedding-3-small)
- **Supabase** - Managed PostgreSQL database with pgvector support
- **Clerk** - Authentication integration

## Quick Start

### 1. Enable pgvector Extension

You can enable pgvector in two ways:

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Database** → **Extensions**
3. Search for "vector" and enable the extension
4. Click "Enable" on the pgvector extension

#### Option B: Using SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Create a new query and paste the contents of `migrations/20250107_enable_pgvector.sql`
4. Run the migration

### 2. Run the Migration

```bash
# If you have Supabase CLI installed
supabase db push

# Or copy/paste the SQL from migrations/20250107_enable_pgvector.sql
# into the Supabase SQL Editor
```

### 3. Verify the Setup

Run this query in the SQL Editor to verify:

```sql
-- Check if pgvector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if documents table exists
SELECT * FROM information_schema.tables WHERE table_name = 'documents';

-- Check if functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('match_documents', 'match_documents_with_threshold');
```

## Database Schema

### Documents Table

```sql
documents (
  id              bigserial PRIMARY KEY,
  content         text NOT NULL,
  metadata        jsonb DEFAULT '{}',
  embedding       vector(1536),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
)
```

**Columns:**
- `id` - Unique identifier
- `content` - The actual text content of the document
- `metadata` - Flexible JSON for storing source, title, tags, etc.
- `embedding` - 1536-dimensional vector (OpenAI embeddings)
- `created_at` - Timestamp when document was created
- `updated_at` - Auto-updated timestamp

**Indexes:**
- `documents_embedding_idx` - HNSW index for fast vector similarity search
- `documents_metadata_idx` - GIN index for metadata filtering

### Functions

#### `match_documents()`
Performs similarity search on document embeddings.

```sql
match_documents(
  query_embedding vector(1536),
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'
)
```

**Parameters:**
- `query_embedding` - The query vector
- `match_count` - Maximum number of results to return
- `filter` - JSONB filter for metadata (e.g., `{"source": "docs"}`)

**Returns:**
- `id` - Document ID
- `content` - Document content
- `metadata` - Document metadata
- `similarity` - Similarity score (0-1, higher is more similar)

#### `match_documents_with_threshold()`
Same as `match_documents()` but with a minimum similarity threshold.

```sql
match_documents_with_threshold(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'
)
```

## Usage Examples

### Insert a Document

```typescript
import { createServerSupabaseClient, insertDocument } from '@/lib/supabase'

const client = createServerSupabaseClient()

await insertDocument(client, {
  content: 'Your document content here',
  metadata: {
    source: 'documentation',
    title: 'Example Doc',
    tags: ['tutorial', 'guide'],
  },
  embedding: yourEmbeddingVector, // 1536-dimensional array
})
```

### Search for Similar Documents

```typescript
import { createServerSupabaseClient, matchDocuments } from '@/lib/supabase'

const client = createServerSupabaseClient()

const results = await matchDocuments(client, {
  queryEmbedding: yourQueryEmbedding,
  matchCount: 5,
  filter: { source: 'documentation' }, // Optional
})

results.forEach((doc) => {
  console.log(`${doc.content} - Similarity: ${doc.similarity}`)
})
```

### Complete RAG Pipeline

```typescript
import { createServerSupabaseClient, matchDocumentsWithThreshold } from '@/lib/supabase'

// 1. Get user query
const userQuery = "How do I set up authentication?"

// 2. Generate embedding for query (using OpenAI)
const queryEmbedding = await generateEmbedding(userQuery)

// 3. Search for relevant documents
const client = createServerSupabaseClient()
const relevantDocs = await matchDocumentsWithThreshold(client, {
  queryEmbedding,
  similarityThreshold: 0.75,
  matchCount: 3,
})

// 4. Build context from retrieved documents
const context = relevantDocs.map(doc => doc.content).join('\n\n')

// 5. Generate response with LLM using context
const response = await generateResponse(userQuery, context)
```

## Generating Embeddings

To generate embeddings, you'll need to use an embedding model. Here's an example using OpenAI:

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // or 'text-embedding-ada-002'
    input: text,
  })

  return response.data[0].embedding
}
```

## Security & RLS Policies

Row Level Security (RLS) is enabled on the `documents` table with the following policies:

- **Read**: Authenticated users can read all documents
- **Insert**: Authenticated users can insert documents
- **Update**: Authenticated users can update documents
- **Delete**: Authenticated users can delete documents

**Note:** You may want to customize these policies based on your security requirements. For example, you might want to:
- Add a `user_id` column to track document ownership
- Restrict updates/deletes to document owners only
- Add role-based access control

## Performance Tips

1. **Use HNSW Index**: The migration creates an HNSW index which provides excellent performance for similarity search (already included)

2. **Batch Inserts**: When inserting multiple documents, use `insertDocuments()` instead of multiple `insertDocument()` calls

3. **Limit Results**: Use `matchCount` parameter to limit results and improve query performance

4. **Filter by Metadata**: Use the `filter` parameter to narrow down search space before similarity comparison

5. **Adjust Similarity Threshold**: Use `match_documents_with_threshold()` to only return highly relevant results

## Monitoring

Check document count:
```typescript
import { getDocumentCount } from '@/lib/supabase'

const count = await getDocumentCount(client)
console.log(`Total documents: ${count}`)
```

## Troubleshooting

### Extension Not Found
If you get "extension vector does not exist":
1. Go to Supabase Dashboard → Database → Extensions
2. Enable the "vector" extension
3. Re-run the migration

### Embedding Dimension Mismatch
If you're using a different embedding model:
1. Update the vector dimension in the migration (e.g., `vector(768)` for some models)
2. Update the TypeScript types in `lib/supabase/types.ts`

### Performance Issues
If queries are slow:
1. Check that the HNSW index is created: `\d documents` in SQL Editor
2. Consider increasing `match_count` or adjusting similarity thresholds
3. Monitor query performance in Supabase Dashboard → Database → Query Performance

## Next Steps

1. **Install OpenAI SDK**: `npm install openai`
2. **Set up API Key**: Add `OPENAI_API_KEY` to `.env.local`
3. **Implement Embedding Generation**: Create a utility to generate embeddings
4. **Build RAG Pipeline**: Implement the full RAG flow in your application
5. **Add Data**: Start inserting documents with embeddings into your vector store

## Resources

- [Supabase pgvector Documentation](https://supabase.com/docs/guides/database/extensions/pgvector)
- [LangChain Supabase Integration](https://js.langchain.com/docs/integrations/vectorstores/supabase/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
