# Junie

**An application to help you find the life you want**

Built with Next.js, Clerk, Supabase, and LangChain for intelligent, personalized guidance.

## Introduction

Junie combines modern authentication, database management, and AI capabilities to create a personalized experience:

- **[Clerk](https://clerk.com/)** - Developer-first authentication and user management with pre-built React components
- **[Supabase](https://supabase.com/)** - Open-source PostgreSQL database with vector search capabilities
- **[LangChain.js](https://js.langchain.com/)** - Framework for building AI-powered applications
- **[Next.js](https://nextjs.org/)** - React framework with App Router

## ✨ Features

### 🎨 shadcn/ui Integration
- Beautiful, customizable UI components
- Custom Sign In/Sign Up pages with shadcn styling
- OAuth integration (GitHub, Google)
- Multi-step authentication flows
- Email verification with OTP

### 🤖 RAG (Retrieval Augmented Generation)
- **Supabase pgvector** - Vector similarity search
- **LangChain.js** - Framework for LLM applications
- **Vercel AI SDK** - Streaming chat interface
- **OpenAI Embeddings** - Semantic search capabilities
- Document storage and retrieval
- Context-aware AI responses

### 💬 AI Chat Features
- Streaming chat interface
- Two chat modes:
  - **Basic RAG** (`/api/chat`) - Automatic context retrieval
  - **Agent Mode** (`/api/chat/agents`) - Tools + reasoning
- LangChain tools:
  - Document retrieval from vector store
  - Calculator for math operations
  - Extensible tool system

## 📚 Documentation

See the detailed guides:
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Complete setup instructions
- [LANGCHAIN_SETUP.md](./LANGCHAIN_SETUP.md) - LangChain & AI configuration
- [QUICK_START.md](./QUICK_START.md) - Quick start guide
- [supabase/README.md](./supabase/README.md) - pgvector setup

## 🚀 Running the Application

```bash
# Clone the repository
git clone https://github.com/Cornjebus/junie.git
cd junie/clerk-supabase-nextjs

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Required Environment Variables

1. **Clerk** - Sign up at [https://clerk.com](https://dashboard.clerk.com/sign-up)
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `CLERK_JWT_KEY`

2. **Supabase** - Create a project at [https://supabase.com](https://supabase.com)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_KEY`

3. **OpenAI** - Get API key from [https://platform.openai.com](https://platform.openai.com)
   - `OPENAI_API_KEY`

## 🔧 Setup Steps

1. Sign up for a Clerk account and create an application
2. Create a Supabase project and enable pgvector extension
3. Follow [the Clerk + Supabase integration guide](https://clerk.com/docs/integrations/databases/supabase)
4. Set up Row Level Security (RLS) policies in Supabase
5. Configure environment variables
6. Run database migrations: `npm run db:migrate`
7. Start development server: `npm run dev`

## Deploy

Easily deploy to Vercel with the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FCornjebus%2Fjunie)

## Learn More

- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [LangChain.js Documentation](https://js.langchain.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Support

Feel free to open an issue or reach out through:
- GitHub Issues: [https://github.com/Cornjebus/junie/issues](https://github.com/Cornjebus/junie/issues)
