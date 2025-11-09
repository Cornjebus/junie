-- Enable the pgvector extension for vector similarity search
create extension if not exists vector
with
  schema extensions;

-- Create a table to store document embeddings for RAG
create table if not exists documents (
  id bigserial primary key,
  content text not null, -- The actual document content
  metadata jsonb default '{}'::jsonb, -- Flexible metadata (source, title, tags, etc.)
  embedding vector(1536), -- 1536 dimensions for OpenAI embeddings (adjust if using different model)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on the embedding column for faster similarity searches
-- Using HNSW (Hierarchical Navigable Small World) for better performance
create index if not exists documents_embedding_idx
  on documents
  using hnsw (embedding vector_cosine_ops);

-- Create an index on metadata for faster filtered searches
create index if not exists documents_metadata_idx
  on documents
  using gin (metadata);

-- Create a function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update updated_at
create trigger update_documents_updated_at
  before update on documents
  for each row
  execute function update_updated_at_column();

-- Create a function to search for similar documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_count int default 10,
  filter jsonb default '{}'::jsonb
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where metadata @> filter
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Create a function to search for similar documents with a similarity threshold
create or replace function match_documents_with_threshold (
  query_embedding vector(1536),
  similarity_threshold float default 0.7,
  match_count int default 10,
  filter jsonb default '{}'::jsonb
) returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where
    metadata @> filter
    and 1 - (documents.embedding <=> query_embedding) >= similarity_threshold
  order by documents.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- Add RLS (Row Level Security) policies
alter table documents enable row level security;

-- Policy: Allow authenticated users to read all documents
create policy "Allow authenticated users to read documents"
  on documents
  for select
  to authenticated
  using (true);

-- Policy: Allow authenticated users to insert documents
create policy "Allow authenticated users to insert documents"
  on documents
  for insert
  to authenticated
  with check (true);

-- Policy: Allow authenticated users to update their own documents
-- (You may want to add a user_id column and modify this policy)
create policy "Allow authenticated users to update documents"
  on documents
  for update
  to authenticated
  using (true)
  with check (true);

-- Policy: Allow authenticated users to delete documents
create policy "Allow authenticated users to delete documents"
  on documents
  for delete
  to authenticated
  using (true);

-- Create a helper function to get document count
create or replace function get_document_count()
returns bigint
language sql
as $$
  select count(*) from documents;
$$;

-- Comments for documentation
comment on table documents is 'Stores document embeddings for RAG (Retrieval Augmented Generation)';
comment on column documents.content is 'The actual text content of the document';
comment on column documents.metadata is 'Flexible JSON metadata (e.g., source, title, author, tags, timestamp)';
comment on column documents.embedding is 'Vector embedding (1536 dimensions for OpenAI text-embedding-ada-002)';
comment on function match_documents is 'Performs similarity search on document embeddings';
comment on function match_documents_with_threshold is 'Performs similarity search with a minimum similarity threshold';


-- ====================================================================
-- INITIAL SCHEMA MIGRATION
-- ====================================================================

-- Initial Junie Database Schema
-- Created: 2025-01-08
-- Description: Complete database schema for Junie platform including users, cases, plans, tasks, artifacts, and AI cost tracking

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users (managed by Clerk, synced to Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles (rich data for personalization)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Onboarding data
  sparks TEXT[] DEFAULT '{}',  -- interests/hobbies
  values TEXT[] DEFAULT '{}',  -- what matters to them
  dream TEXT,  -- their aspiration (180 chars)

  -- Refinement data
  budget_range TEXT,  -- '$0-100', '$100-500', etc.
  time_available TEXT,  -- '5-10h', '10-20h', etc.
  risk_tolerance TEXT,  -- 'low', 'medium', 'high'
  location TEXT,
  constraints TEXT[] DEFAULT '{}',  -- caregiving, health, etc.

  -- Computed
  profile_embedding VECTOR(1536),  -- for path matching

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

-- Cases (user's journey on a specific path)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  kind TEXT CHECK (kind IN ('business', 'career')),
  selected_option JSONB NOT NULL,  -- full path data snapshot
  profile_snapshot JSONB,  -- user profile at case creation
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),

  -- Memory (Sherpa context)
  memory JSONB DEFAULT '{}',  -- conversation state, decisions, patterns

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans (week-by-week action plans)
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,

  graph JSONB NOT NULL,  -- {nodes: [], edges: []} task dependencies
  milestones JSONB DEFAULT '[]',  -- key achievements
  total_weeks INTEGER DEFAULT 12,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks (individual action items)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES plans(id) ON DELETE CASCADE,

  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  why TEXT,  -- purpose/benefit
  minutes INTEGER,  -- time estimate
  confidence DECIMAL(3,2),  -- AI certainty 0-1
  expected_output TEXT,

  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'skipped')),
  due_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artifacts (generated documents)
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,

  type TEXT NOT NULL,  -- 'offer', 'landing_page', 'email', etc.
  template_id UUID,  -- reference to template used
  content TEXT NOT NULL,  -- the actual doc

  metadata JSONB DEFAULT '{}',  -- model_used, tokens, etc.
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages (Sherpa chat history)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,

  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'tool', 'system')),
  content TEXT,

  tool_calls JSONB,  -- if assistant called tools
  tool_name TEXT,  -- if role='tool'
  tool_input JSONB,
  tool_output JSONB,

  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Events (analytics/telemetry)
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,

  type TEXT NOT NULL,  -- 'onboarding_completed', 'artifact_generated', etc.
  payload JSONB DEFAULT '{}',

  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- EMBEDDINGS & VECTOR SEARCH
-- ============================================================================

-- Embeddings (for RAG/semantic search)
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,

  content TEXT NOT NULL,
  embedding VECTOR(1536),
  kind TEXT,  -- 'note', 'resume', 'artifact', 'path_template'

  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TEMPLATE LIBRARY
-- ============================================================================

-- Path Library (curated templates)
CREATE TABLE path_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  title TEXT NOT NULL,
  category TEXT NOT NULL,  -- 'business', 'career'
  subcategory TEXT,  -- 'freelance', 'product', 'consulting', etc.

  description TEXT,
  why_template TEXT,  -- template for "why you" personalization

  typical_fit JSONB,  -- {sparks, values, skills_needed, time_commitment}
  requirements JSONB,  -- {min_hours, startup_cost, risk_level}
  outcomes JSONB,  -- {avg_time_to_first_client, avg_income, success_rate}

  plan_template JSONB,  -- weeks[] with tasks
  artifact_templates TEXT[] DEFAULT '{}',

  embedding VECTOR(1536),  -- for semantic matching

  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artifact Templates
CREATE TABLE artifact_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  type TEXT NOT NULL,
  category TEXT,  -- 'business', 'career'
  name TEXT NOT NULL,
  description TEXT,

  structure TEXT,  -- template outline/structure
  variables JSONB DEFAULT '{}',  -- {var_name: description}
  max_tokens INTEGER DEFAULT 2000,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- BILLING & SUBSCRIPTIONS
-- ============================================================================

-- Subscriptions (Stripe data)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,

  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,

  tier TEXT NOT NULL,  -- 'free', 'pathfinder', 'accelerator', 'concierge'
  status TEXT NOT NULL,  -- 'active', 'trialing', 'canceled', 'past_due'

  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Costs (for budget tracking)
CREATE TABLE ai_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  model TEXT NOT NULL,
  provider TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_usd DECIMAL(10,6) NOT NULL,

  operation TEXT,  -- 'path_gen', 'chat', 'artifact', etc.

  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users table indexes
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);

-- Profiles table indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- Cases table indexes
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_kind ON cases(kind);

-- Plans table indexes
CREATE INDEX idx_plans_case_id ON plans(case_id);

-- Tasks table indexes
CREATE INDEX idx_tasks_plan_id ON tasks(plan_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_week_number ON tasks(week_number);
CREATE INDEX idx_tasks_due_at ON tasks(due_at);

-- Artifacts table indexes
CREATE INDEX idx_artifacts_case_id ON artifacts(case_id);
CREATE INDEX idx_artifacts_type ON artifacts(type);
CREATE INDEX idx_artifacts_status ON artifacts(status);

-- Messages table indexes
CREATE INDEX idx_messages_case_id ON messages(case_id);
CREATE INDEX idx_messages_case_timestamp ON messages(case_id, timestamp DESC);
CREATE INDEX idx_messages_role ON messages(role);

-- Events table indexes
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_user_timestamp ON events(user_id, timestamp DESC);
CREATE INDEX idx_events_case_id ON events(case_id);
CREATE INDEX idx_events_type ON events(type);

-- Embeddings table indexes
CREATE INDEX idx_embeddings_user_id ON embeddings(user_id);
CREATE INDEX idx_embeddings_case_id ON embeddings(case_id);
CREATE INDEX idx_embeddings_kind ON embeddings(kind);

-- Vector similarity search indexes (ivfflat)
CREATE INDEX idx_embeddings_vector ON embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX idx_profiles_embedding ON profiles
  USING ivfflat (profile_embedding vector_cosine_ops)
  WITH (lists = 100);

-- Path Templates table indexes
CREATE INDEX idx_path_templates_category ON path_templates(category);
CREATE INDEX idx_path_templates_subcategory ON path_templates(subcategory);
CREATE INDEX idx_path_templates_is_active ON path_templates(is_active);

CREATE INDEX idx_path_templates_embedding ON path_templates
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Artifact Templates table indexes
CREATE INDEX idx_artifact_templates_type ON artifact_templates(type);
CREATE INDEX idx_artifact_templates_category ON artifact_templates(category);

-- Subscriptions table indexes
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_tier ON subscriptions(tier);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- AI Costs table indexes
CREATE INDEX idx_ai_costs_user_id ON ai_costs(user_id);
CREATE INDEX idx_ai_costs_timestamp ON ai_costs(timestamp);
CREATE INDEX idx_ai_costs_user_timestamp ON ai_costs(user_id, timestamp);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_costs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - Users Table
-- ============================================================================

CREATE POLICY "Users can view own record" ON users
  FOR SELECT USING (clerk_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own record" ON users
  FOR UPDATE USING (clerk_id = auth.jwt()->>'sub');

-- ============================================================================
-- RLS POLICIES - Profiles Table
-- ============================================================================

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- ============================================================================
-- RLS POLICIES - Cases Table
-- ============================================================================

CREATE POLICY "Users can view own cases" ON cases
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert own cases" ON cases
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update own cases" ON cases
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can delete own cases" ON cases
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- ============================================================================
-- RLS POLICIES - Plans Table
-- ============================================================================

CREATE POLICY "Users can view own plans" ON plans
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

CREATE POLICY "Users can insert own plans" ON plans
  FOR INSERT WITH CHECK (
    case_id IN (
      SELECT id FROM cases
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

CREATE POLICY "Users can update own plans" ON plans
  FOR UPDATE USING (
    case_id IN (
      SELECT id FROM cases
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

-- ============================================================================
-- RLS POLICIES - Tasks Table
-- ============================================================================

CREATE POLICY "Users can view own tasks" ON tasks
  FOR SELECT USING (
    plan_id IN (
      SELECT p.id FROM plans p
      JOIN cases c ON c.id = p.case_id
      WHERE c.user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (
    plan_id IN (
      SELECT p.id FROM plans p
      JOIN cases c ON c.id = p.case_id
      WHERE c.user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (
    plan_id IN (
      SELECT p.id FROM plans p
      JOIN cases c ON c.id = p.case_id
      WHERE c.user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

-- ============================================================================
-- RLS POLICIES - Messages Table
-- ============================================================================

CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (
    case_id IN (
      SELECT id FROM cases
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

-- ============================================================================
-- RLS POLICIES - Artifacts Table
-- ============================================================================

CREATE POLICY "Users can view own artifacts" ON artifacts
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM cases
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

CREATE POLICY "Users can insert own artifacts" ON artifacts
  FOR INSERT WITH CHECK (
    case_id IN (
      SELECT id FROM cases
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

CREATE POLICY "Users can update own artifacts" ON artifacts
  FOR UPDATE USING (
    case_id IN (
      SELECT id FROM cases
      WHERE user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
    )
  );

-- ============================================================================
-- RLS POLICIES - Events Table
-- ============================================================================

CREATE POLICY "Users can view own events" ON events
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert own events" ON events
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- ============================================================================
-- RLS POLICIES - Embeddings Table
-- ============================================================================

CREATE POLICY "Users can view own embeddings" ON embeddings
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert own embeddings" ON embeddings
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- ============================================================================
-- RLS POLICIES - Subscriptions Table
-- ============================================================================

CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can insert own subscription" ON subscriptions
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Users can update own subscription" ON subscriptions
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

-- ============================================================================
-- RLS POLICIES - AI Costs Table
-- ============================================================================

CREATE POLICY "Users can view own ai costs" ON ai_costs
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );

CREATE POLICY "Service can insert ai costs" ON ai_costs
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- PUBLIC ACCESS - Template Tables
-- ============================================================================

-- Path templates are publicly readable (no RLS needed)
ALTER TABLE path_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active path templates" ON path_templates
  FOR SELECT USING (is_active = true);

-- Artifact templates are publicly readable
ALTER TABLE artifact_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view artifact templates" ON artifact_templates
  FOR SELECT USING (true);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artifacts_updated_at BEFORE UPDATE ON artifacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to search similar paths using vector similarity
CREATE OR REPLACE FUNCTION search_similar_paths(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  subcategory TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.id,
    pt.title,
    pt.category,
    pt.subcategory,
    1 - (pt.embedding <=> query_embedding) AS similarity
  FROM path_templates pt
  WHERE pt.is_active = true
    AND 1 - (pt.embedding <=> query_embedding) > match_threshold
  ORDER BY pt.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Function to search similar embeddings for RAG
CREATE OR REPLACE FUNCTION search_embeddings(
  query_embedding VECTOR(1536),
  user_uuid UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  kind TEXT,
  similarity FLOAT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.content,
    e.kind,
    1 - (e.embedding <=> query_embedding) AS similarity,
    e.metadata
  FROM embeddings e
  WHERE e.user_id = user_uuid
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts synced from Clerk authentication';
COMMENT ON TABLE profiles IS 'Extended user profiles with onboarding data and embeddings for path matching';
COMMENT ON TABLE cases IS 'User journeys on specific paths (business or career)';
COMMENT ON TABLE plans IS 'Week-by-week action plans with task dependencies';
COMMENT ON TABLE tasks IS 'Individual action items within plans';
COMMENT ON TABLE artifacts IS 'Generated documents (offers, landing pages, emails, etc.)';
COMMENT ON TABLE messages IS 'Sherpa AI chat history with tool calls';
COMMENT ON TABLE events IS 'Analytics and telemetry events';
COMMENT ON TABLE embeddings IS 'Vector embeddings for RAG and semantic search';
COMMENT ON TABLE path_templates IS 'Curated path templates with vector embeddings';
COMMENT ON TABLE artifact_templates IS 'Reusable templates for artifact generation';
COMMENT ON TABLE subscriptions IS 'Stripe subscription data';
COMMENT ON TABLE ai_costs IS 'AI usage tracking for budget management';
