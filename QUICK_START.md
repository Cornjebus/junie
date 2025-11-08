# Quick Start Guide - Junie AI Assistant

Get up and running with Junie in 5 minutes!

## Prerequisites

- Node.js 18+
- Accounts: [Clerk](https://clerk.com), [Supabase](https://supabase.com), [OpenAI](https://platform.openai.com)

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your keys:

```env
# Clerk (from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_KEY=...

# Supabase (from app.supabase.com → Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJ...

# OpenAI (from platform.openai.com)
OPENAI_API_KEY=sk-...
```

## 3. Enable pgvector in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Database** → **Extensions**
3. Search for "vector" and click **Enable**
4. Go to **SQL Editor** and paste the contents of `supabase/migrations/20250107_enable_pgvector.sql`
5. Click **Run**

## 4. Configure Clerk

### Enable OAuth Providers
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **User & Authentication** → **Social Connections**
3. Enable **GitHub** and **Google**

### Create JWT Template
1. Go to **JWT Templates**
2. Click **New template** → **Supabase**
3. Save the template

## 5. Run the App

```bash
npm run dev
```

## 6. Test the Features

### Test Authentication
- Visit http://localhost:3000/sign-in
- Try signing in with GitHub or Google
- Or create an account with email/password

### Test Chat (Basic RAG)
- Visit http://localhost:3000/chat
- Try: "What information do you have?"

Note: You'll need documents in your vector store for meaningful responses. See below for adding documents.

### Test Agent Chat
Update `components/chat.tsx` line 13:
```typescript
api: '/api/chat/agents', // Change from '/api/chat'
```

Try these queries:
- "What's 123 * 456?"
- "Calculate 50% of 2000"

## 7. Add Documents to Vector Store (Optional)

Create `scripts/seed-documents.ts`:

```typescript
import { createServerSupabaseClient } from './lib/supabase/client'
import { insertDocuments } from './lib/supabase/vector-store'
import { OpenAIEmbeddings } from '@langchain/openai'

async function seed() {
  const embeddings = new OpenAIEmbeddings()
  const client = createServerSupabaseClient()

  const docs = [
    {
      content: "Junie is an AI assistant built with Next.js, LangChain, and Supabase.",
      metadata: { title: "About Junie", source: "docs" }
    },
    // Add more documents...
  ]

  for (const doc of docs) {
    const embedding = await embeddings.embedQuery(doc.content)
    await insertDocuments(client, [{
      ...doc,
      embedding
    }])
  }

  console.log(`Seeded ${docs.length} documents`)
}

seed()
```

Run:
```bash
npx tsx scripts/seed-documents.ts
```

## Available Routes

| Route | Description |
|-------|-------------|
| `/` | Home page |
| `/sign-in` | Sign in with shadcn/ui |
| `/sign-up` | Sign up with shadcn/ui |
| `/chat` | Chat interface |
| `/api/chat` | Basic RAG endpoint |
| `/api/chat/agents` | Agent endpoint with tools |

## Project Structure

```
├── app/
│   ├── api/chat/          # Chat endpoints
│   ├── sign-in/           # Auth pages
│   ├── sign-up/
│   └── chat/              # Chat page
│
├── components/
│   ├── ui/                # shadcn/ui components
│   └── chat.tsx           # Chat component
│
├── lib/
│   ├── langchain/
│   │   └── tools/         # AI tools
│   └── supabase/
│       ├── vector-store.ts
│       └── client.ts
│
└── supabase/
    └── migrations/        # Database migrations
```

## Key Files

- `SETUP_GUIDE.md` - Detailed setup instructions
- `LANGCHAIN_SETUP.md` - LangChain configuration
- `supabase/README.md` - Vector store documentation

## Common Issues

### "Extension vector does not exist"
→ Enable pgvector in Supabase Dashboard → Database → Extensions

### Authentication not working
→ Verify Clerk environment variables are set correctly

### Chat not responding
→ Check OpenAI API key is valid and has credits

### No results from RAG
→ Add documents to vector store (see step 7 above)

## Next Steps

1. **Customize the AI personality** - Edit prompts in `app/api/chat/route.ts`
2. **Add more tools** - Create new tools in `lib/langchain/tools/`
3. **Import your documents** - Build a document ingestion pipeline
4. **Style the UI** - Customize shadcn/ui components
5. **Deploy** - Deploy to Vercel (see main README.md)

## Resources

- [Full Setup Guide](./SETUP_GUIDE.md)
- [LangChain Documentation](./LANGCHAIN_SETUP.md)
- [Supabase pgvector Guide](./supabase/README.md)

## Need Help?

- Check the detailed guides in this repo
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [LangChain.js Documentation](https://js.langchain.com/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)

Happy building! 🚀
