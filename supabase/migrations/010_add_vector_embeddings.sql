-- Migration: Add Vector Embeddings for Semantic Search
-- Enables AI-powered semantic search using pgvector
-- Commander Data (AI Architecture) + Lt. Cmdr. La Forge (Infrastructure)

-- Install pgvector extension (if not already installed)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to knowledge_base
ALTER TABLE knowledge_base
ADD COLUMN IF NOT EXISTS content_embedding vector(1536);

-- Add embedding metadata
ALTER TABLE knowledge_base
ADD COLUMN IF NOT EXISTS embedding_model TEXT DEFAULT 'text-embedding-3-small',
ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMP WITH TIME ZONE;

-- Create vector similarity index using IVFFlat
-- This enables fast approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON knowledge_base 
USING ivfflat (content_embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for hybrid search (vector + metadata filters)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_hybrid 
ON knowledge_base (category, session_date) 
WHERE content_embedding IS NOT NULL;

-- Function to search by vector similarity
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_category text DEFAULT NULL
)
RETURNS TABLE (
  session_id text,
  title text,
  executive_summary text,
  similarity float,
  category text,
  crew_members jsonb,
  tags jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    kb.session_id,
    kb.title,
    kb.executive_summary,
    1 - (kb.content_embedding <=> query_embedding) as similarity,
    kb.category,
    kb.crew_members,
    kb.tags,
    kb.created_at
  FROM knowledge_base kb
  WHERE kb.content_embedding IS NOT NULL
    AND 1 - (kb.content_embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR kb.category = filter_category)
  ORDER BY kb.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function for hybrid search (combines vector + full-text)
CREATE OR REPLACE FUNCTION hybrid_search_knowledge(
  search_query text,
  query_embedding vector(1536) DEFAULT NULL,
  match_count int DEFAULT 10,
  vector_weight float DEFAULT 0.7,
  keyword_weight float DEFAULT 0.3
)
RETURNS TABLE (
  session_id text,
  title text,
  executive_summary text,
  combined_score float,
  vector_score float,
  keyword_score float,
  category text,
  tags jsonb,
  created_at timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT 
      kb.session_id,
      1 - (kb.content_embedding <=> query_embedding) as score
    FROM knowledge_base kb
    WHERE kb.content_embedding IS NOT NULL
      AND query_embedding IS NOT NULL
  ),
  keyword_results AS (
    SELECT 
      kb.session_id,
      ts_rank(
        to_tsvector('english', 
          coalesce(kb.title, '') || ' ' || 
          coalesce(kb.executive_summary, '') || ' ' ||
          coalesce(kb.content::text, '')
        ),
        plainto_tsquery('english', search_query)
      ) as score
    FROM knowledge_base kb
    WHERE to_tsvector('english', 
            coalesce(kb.title, '') || ' ' || 
            coalesce(kb.executive_summary, '') || ' ' ||
            coalesce(kb.content::text, '')
          ) @@ plainto_tsquery('english', search_query)
  )
  SELECT 
    kb.session_id,
    kb.title,
    kb.executive_summary,
    (
      COALESCE(vr.score * vector_weight, 0) + 
      COALESCE(kr.score * keyword_weight, 0)
    ) as combined_score,
    vr.score as vector_score,
    kr.score as keyword_score,
    kb.category,
    kb.tags,
    kb.created_at
  FROM knowledge_base kb
  LEFT JOIN vector_results vr ON kb.session_id = vr.session_id
  LEFT JOIN keyword_results kr ON kb.session_id = kr.session_id
  WHERE vr.score IS NOT NULL OR kr.score IS NOT NULL
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$$;

-- Add column comments for documentation
COMMENT ON COLUMN knowledge_base.content_embedding IS 'OpenAI text-embedding-3-small (1536 dimensions) for semantic search';
COMMENT ON COLUMN knowledge_base.embedding_model IS 'Model used to generate embeddings';
COMMENT ON COLUMN knowledge_base.embedding_generated_at IS 'Timestamp when embedding was generated';

-- Verify vector extension and functions
SELECT 
  extname, 
  extversion 
FROM pg_extension 
WHERE extname = 'vector';

SELECT 
  proname, 
  prokind,
  pronargs
FROM pg_proc
WHERE proname LIKE '%search_knowledge%';

