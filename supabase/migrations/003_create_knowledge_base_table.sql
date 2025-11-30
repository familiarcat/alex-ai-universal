-- Migration: Create knowledge_base table for RAG system
-- Stores crew memories, architectural decisions, and institutional knowledge

CREATE TABLE IF NOT EXISTS knowledge_base (
  -- Primary key
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  
  -- Core metadata
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  executive_summary TEXT,
  session_date DATE DEFAULT CURRENT_DATE,
  session_duration TEXT,
  
  -- Content (full JSON for vector search)
  content JSONB NOT NULL,
  
  -- Crew and decisions (JSONB for flexible structure)
  crew_members JSONB,
  critical_decisions JSONB,
  bugs_fixed JSONB,
  technical_patterns JSONB,
  lessons_learned JSONB,
  user_insights JSONB,
  architectural_decisions JSONB,
  knowledge_base_entries JSONB,
  
  -- Search and classification
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_session_id CHECK (length(session_id) > 0),
  CONSTRAINT valid_title CHECK (length(title) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_session_date ON knowledge_base(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_created_at ON knowledge_base(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags ON knowledge_base USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_content ON knowledge_base USING GIN (content);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_base_search ON knowledge_base USING GIN (
  to_tsvector('english', 
    coalesce(title, '') || ' ' || 
    coalesce(executive_summary, '') || ' ' || 
    coalesce(content::text, '')
  )
);

-- Row Level Security (RLS) Policies
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public can read knowledge base"
  ON knowledge_base
  FOR SELECT
  USING (true);

-- Allow public upsert (for single-user system)
CREATE POLICY "Public can upsert knowledge"
  ON knowledge_base
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update knowledge"
  ON knowledge_base
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_base_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_knowledge_base_timestamp
  BEFORE UPDATE ON knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_base_updated_at();

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'knowledge_base' 
ORDER BY ordinal_position;

