/**
 * TypeScript type definitions for Junie database schema
 * Generated from: supabase/migrations/20250108000000_initial_schema.sql
 */

// ============================================================================
// CORE TABLE TYPES
// ============================================================================

export interface User {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  // Onboarding data
  sparks: string[];
  values: string[];
  dream: string | null;
  // Refinement data
  budget_range: string | null;
  time_available: string | null;
  risk_tolerance: 'low' | 'medium' | 'high' | null;
  location: string | null;
  constraints: string[];
  // Computed
  profile_embedding: number[] | null; // VECTOR(1536)
  // Metadata
  created_at: string;
  updated_at: string;
}

export type CaseKind = 'business' | 'career';
export type CaseStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export interface Case {
  id: string;
  user_id: string;
  kind: CaseKind;
  selected_option: Record<string, any>; // JSONB - full path data snapshot
  profile_snapshot: Record<string, any> | null; // JSONB - user profile at case creation
  status: CaseStatus;
  memory: Record<string, any>; // JSONB - conversation state, decisions, patterns
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  case_id: string;
  version: number;
  graph: {
    nodes: any[];
    edges: any[];
  }; // JSONB - task dependencies
  milestones: any[]; // JSONB - key achievements
  total_weeks: number;
  created_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'skipped';

export interface Task {
  id: string;
  plan_id: string;
  week_number: number;
  title: string;
  why: string | null;
  minutes: number | null;
  confidence: number | null; // DECIMAL(3,2) - AI certainty 0-1
  expected_output: string | null;
  status: TaskStatus;
  due_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ArtifactStatus = 'draft' | 'published';

export interface Artifact {
  id: string;
  case_id: string;
  type: string; // 'offer', 'landing_page', 'email', etc.
  template_id: string | null;
  content: string;
  metadata: Record<string, any>; // JSONB - model_used, tokens, etc.
  status: ArtifactStatus;
  created_at: string;
  updated_at: string;
}

export type MessageRole = 'user' | 'assistant' | 'tool' | 'system';

export interface Message {
  id: string;
  case_id: string;
  role: MessageRole;
  content: string | null;
  tool_calls: Record<string, any> | null; // JSONB - if assistant called tools
  tool_name: string | null;
  tool_input: Record<string, any> | null; // JSONB
  tool_output: Record<string, any> | null; // JSONB
  timestamp: string;
}

export interface Event {
  id: string;
  user_id: string;
  case_id: string | null;
  type: string; // 'onboarding_completed', 'artifact_generated', etc.
  payload: Record<string, any>; // JSONB
  timestamp: string;
}

// ============================================================================
// EMBEDDINGS & VECTOR SEARCH
// ============================================================================

export type EmbeddingKind = 'note' | 'resume' | 'artifact' | 'path_template';

export interface Embedding {
  id: string;
  user_id: string;
  case_id: string | null;
  content: string;
  embedding: number[]; // VECTOR(1536)
  kind: EmbeddingKind | null;
  metadata: Record<string, any>; // JSONB
  created_at: string;
}

// ============================================================================
// TEMPLATE LIBRARY
// ============================================================================

export type PathCategory = 'business' | 'career';

export interface PathTemplate {
  id: string;
  title: string;
  category: PathCategory;
  subcategory: string | null;
  description: string | null;
  why_template: string | null;
  typical_fit: Record<string, any> | null; // JSONB - {sparks, values, skills_needed, time_commitment}
  requirements: Record<string, any> | null; // JSONB - {min_hours, startup_cost, risk_level}
  outcomes: Record<string, any> | null; // JSONB - {avg_time_to_first_client, avg_income, success_rate}
  plan_template: Record<string, any> | null; // JSONB - weeks[] with tasks
  artifact_templates: string[];
  embedding: number[] | null; // VECTOR(1536)
  is_active: boolean;
  created_at: string;
}

export interface ArtifactTemplate {
  id: string;
  type: string;
  category: PathCategory | null;
  name: string;
  description: string | null;
  structure: string | null; // template outline/structure
  variables: Record<string, any>; // JSONB - {var_name: description}
  max_tokens: number;
  created_at: string;
}

// ============================================================================
// BILLING & SUBSCRIPTIONS
// ============================================================================

export type SubscriptionTier = 'free' | 'pathfinder' | 'accelerator' | 'concierge';
export type SubscriptionStatus = 'active' | 'trialing' | 'canceled' | 'past_due';

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface AICost {
  id: string;
  user_id: string;
  model: string;
  provider: string;
  tokens_used: number;
  cost_usd: number; // DECIMAL(10,6)
  operation: string | null; // 'path_gen', 'chat', 'artifact', etc.
  timestamp: string;
}

// ============================================================================
// HELPER FUNCTION RETURN TYPES
// ============================================================================

export interface SimilarPath {
  id: string;
  title: string;
  category: string;
  subcategory: string | null;
  similarity: number;
}

export interface SimilarEmbedding {
  id: string;
  content: string;
  kind: string | null;
  similarity: number;
  metadata: Record<string, any>;
}

// ============================================================================
// DATABASE TYPE (for Supabase Client)
// ============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at' | 'sparks' | 'values' | 'constraints'> & {
          id?: string;
          sparks?: string[];
          values?: string[];
          constraints?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
      cases: {
        Row: Case;
        Insert: Omit<Case, 'id' | 'status' | 'memory' | 'created_at' | 'updated_at'> & {
          id?: string;
          status?: CaseStatus;
          memory?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Case, 'id' | 'created_at' | 'updated_at'>>;
      };
      plans: {
        Row: Plan;
        Insert: Omit<Plan, 'id' | 'version' | 'milestones' | 'total_weeks' | 'created_at'> & {
          id?: string;
          version?: number;
          milestones?: any[];
          total_weeks?: number;
          created_at?: string;
        };
        Update: Partial<Omit<Plan, 'id' | 'created_at'>>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'status' | 'created_at' | 'updated_at'> & {
          id?: string;
          status?: TaskStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Task, 'id' | 'created_at' | 'updated_at'>>;
      };
      artifacts: {
        Row: Artifact;
        Insert: Omit<Artifact, 'id' | 'metadata' | 'status' | 'created_at' | 'updated_at'> & {
          id?: string;
          metadata?: Record<string, any>;
          status?: ArtifactStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Artifact, 'id' | 'created_at' | 'updated_at'>>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, 'id' | 'timestamp'> & {
          id?: string;
          timestamp?: string;
        };
        Update: Partial<Omit<Message, 'id' | 'timestamp'>>;
      };
      events: {
        Row: Event;
        Insert: Omit<Event, 'id' | 'payload' | 'timestamp'> & {
          id?: string;
          payload?: Record<string, any>;
          timestamp?: string;
        };
        Update: Partial<Omit<Event, 'id' | 'timestamp'>>;
      };
      embeddings: {
        Row: Embedding;
        Insert: Omit<Embedding, 'id' | 'metadata' | 'created_at'> & {
          id?: string;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: Partial<Omit<Embedding, 'id' | 'created_at'>>;
      };
      path_templates: {
        Row: PathTemplate;
        Insert: Omit<PathTemplate, 'id' | 'artifact_templates' | 'is_active' | 'created_at'> & {
          id?: string;
          artifact_templates?: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Omit<PathTemplate, 'id' | 'created_at'>>;
      };
      artifact_templates: {
        Row: ArtifactTemplate;
        Insert: Omit<ArtifactTemplate, 'id' | 'variables' | 'max_tokens' | 'created_at'> & {
          id?: string;
          variables?: Record<string, any>;
          max_tokens?: number;
          created_at?: string;
        };
        Update: Partial<Omit<ArtifactTemplate, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Subscription, 'id' | 'created_at' | 'updated_at'>>;
      };
      ai_costs: {
        Row: AICost;
        Insert: Omit<AICost, 'id' | 'timestamp'> & {
          id?: string;
          timestamp?: string;
        };
        Update: Partial<Omit<AICost, 'id' | 'timestamp'>>;
      };
    };
    Functions: {
      search_similar_paths: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
        };
        Returns: SimilarPath[];
      };
      search_embeddings: {
        Args: {
          query_embedding: number[];
          user_uuid: string;
          match_threshold?: number;
          match_count?: number;
        };
        Returns: SimilarEmbedding[];
      };
    };
  };
}
