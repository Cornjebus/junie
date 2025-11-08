# Junie Setup Guide - Clerk, Supabase & pgvector RAG

Complete setup guide for Junie's authentication and RAG system.

## Prerequisites

- Node.js 18+ installed
- A Clerk account ([clerk.com](https://clerk.com))
- A Supabase account ([supabase.com](https://supabase.com))
- An OpenAI account ([platform.openai.com](https://platform.openai.com))

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in the required values:

### Clerk Configuration

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application (or select existing)
3. Go to **API Keys** and copy:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Go to **JWT Templates** and create a new template named "supabase"
5. Copy the JWT key to `CLERK_JWT_KEY`

### Supabase Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (or select existing)
3. Go to **Settings** → **API**
4. Copy:
   - `URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_KEY`

### OpenAI Configuration

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Go to **API Keys**
3. Create a new API key
4. Copy to `OPENAI_API_KEY`

## Step 3: Configure Clerk for OAuth

1. In Clerk Dashboard, go to **User & Authentication** → **Social Connections**
2. Enable **GitHub** and **Google** (or your preferred providers)
3. Configure redirect URLs if needed
4. Set connections to "For all users"

## Step 4: Set Up Supabase pgvector

### Enable pgvector Extension

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to Supabase Dashboard
2. Navigate to **Database** → **Extensions**
3. Search for "vector"
4. Click "Enable" on the pgvector extension

**Option B: Via SQL Editor**

1. Go to **SQL Editor** in Supabase Dashboard
2. Create a new query
3. Copy and paste the contents of `supabase/migrations/20250107_enable_pgvector.sql`
4. Click "Run"

### Verify the Setup

Run this in the SQL Editor to verify:

```sql
-- Check if pgvector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check documents table
SELECT * FROM documents LIMIT 1;

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_name LIKE 'match_documents%';
```

You should see:
- The vector extension
- An empty documents table
- Two functions: `match_documents` and `match_documents_with_threshold`

## Step 5: Configure Clerk-Supabase Integration

### Create Supabase JWT Template in Clerk

1. In Clerk Dashboard, go to **JWT Templates**
2. Click "New template" → Choose "Supabase"
3. Use this configuration:

```json
{
  "aud": "authenticated",
  "exp": "{{token.expiration}}",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "role": "authenticated",
  "metadata": {{user.public_metadata}}
}
```

4. Save the template

### Configure Supabase RLS with Clerk

The migration has already set up RLS policies, but you can customize them:

1. Go to Supabase Dashboard → **Authentication** → **Policies**
2. Review the policies on the `documents` table
3. Customize as needed for your use case

## Step 6: Run the Application

```bash
npm run dev
```

Visit:
- http://localhost:3000 - Home page
- http://localhost:3000/sign-in - Sign in page (with shadcn/ui styling)
- http://localhost:3000/sign-up - Sign up page (with shadcn/ui styling)

## Step 7: Test the RAG System

### Using the Examples

The project includes example code in `lib/supabase/examples.ts`. You can create a test page or API route to try them out.

### Create a Test API Route

Create `app/api/test-rag/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/client'
import { insertDocument, matchDocuments } from '@/lib/supabase/vector-store'

export async function POST(request: Request) {
  const { text } = await request.json()

  const client = createServerSupabaseClient()

  // For testing, use a simple embedding (all zeros)
  // In production, generate real embeddings with OpenAI
  const embedding = new Array(1536).fill(0)

  // Insert a test document
  await insertDocument(client, {
    content: text,
    metadata: { source: 'test' },
    embedding,
  })

  // Search for similar documents
  const results = await matchDocuments(client, {
    queryEmbedding: embedding,
    matchCount: 5,
  })

  return NextResponse.json({ success: true, results })
}
```

Test it:
```bash
curl -X POST http://localhost:3000/api/test-rag \
  -H "Content-Type: application/json" \
  -d '{"text": "This is a test document"}'
```

## Architecture Overview

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Next.js App Router                 │
│  ┌─────────────┐  ┌──────────────┐ │
│  │ Auth Pages  │  │  API Routes  │ │
│  │ (Clerk +    │  │  (RAG Logic) │ │
│  │  shadcn)    │  │              │ │
│  └─────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐    ┌──────────────────┐
│   Clerk      │    │    OpenAI API    │
│ (Auth & JWT) │    │  (Embeddings)    │
└──────────────┘    └──────────────────┘
       │                    │
       └────────┬───────────┘
                ▼
        ┌───────────────┐
        │  Supabase     │
        │  PostgreSQL + │
        │  pgvector     │
        └───────────────┘
```

## Features Implemented

### Authentication (Clerk + shadcn/ui)
- ✅ Custom Sign In page with shadcn/ui components
- ✅ Custom Sign Up page with shadcn/ui components
- ✅ OAuth integration (GitHub, Google)
- ✅ Email/Password authentication
- ✅ Email verification with OTP
- ✅ Multi-step authentication flows
- ✅ Loading states and error handling

### Vector Store (Supabase + pgvector)
- ✅ pgvector extension enabled
- ✅ Documents table with vector embeddings
- ✅ HNSW index for fast similarity search
- ✅ Metadata filtering with GIN index
- ✅ Similarity search functions
- ✅ Threshold-based search
- ✅ Row Level Security (RLS) policies
- ✅ TypeScript types and utilities
- ✅ Server and client Supabase clients

### Developer Experience
- ✅ Comprehensive TypeScript types
- ✅ Utility functions for all operations
- ✅ Example implementations
- ✅ Detailed documentation
- ✅ Migration scripts

## Next Steps

### Implement Embedding Generation

Create `lib/openai/embeddings.ts`:

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })

  return response.data[0].embedding
}
```

### Build the RAG Pipeline

1. Create API routes for document ingestion
2. Implement embedding generation for documents
3. Build semantic search functionality
4. Integrate with LLM for response generation
5. Add streaming responses for better UX

### Optimize Performance

1. Batch document insertions
2. Cache frequently accessed embeddings
3. Implement rate limiting
4. Monitor Supabase performance metrics
5. Optimize RLS policies for your use case

## Troubleshooting

### "Extension vector does not exist"
- Enable pgvector in Supabase Dashboard → Database → Extensions

### Authentication not working
- Verify all Clerk environment variables are set
- Check JWT template is created and named "supabase"
- Ensure OAuth providers are enabled

### Vector search returns no results
- Verify documents are inserted with embeddings
- Check embedding dimensions match (1536 for OpenAI)
- Try lowering similarity threshold

### RLS policies blocking access
- Verify user is authenticated
- Check Clerk token is being passed to Supabase
- Review RLS policies in Supabase Dashboard

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [pgvector Guide](https://supabase.com/docs/guides/database/extensions/pgvector)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Next.js App Router](https://nextjs.org/docs/app)

## Support

For issues or questions:
1. Check the documentation in `/supabase/README.md`
2. Review example code in `/lib/supabase/examples.ts`
3. Check Clerk and Supabase dashboards for errors
4. Review application logs
