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
