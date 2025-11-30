-- Migration: Create creative_content table for screenplay, novel, and narrative content
-- Supports version control and collaborative creative writing

CREATE TABLE IF NOT EXISTS creative_content (
  -- Primary key
  content_id BIGSERIAL PRIMARY KEY,
  
  -- Project Association
  project_id TEXT NOT NULL REFERENCES projects(project_id),
  
  -- Content Details
  content_type TEXT NOT NULL CHECK (content_type IN ('screenplay', 'novel', 'outline', 'character', 'timeline', 'notes')),
  content_format TEXT CHECK (content_format IN ('fountain', 'markdown', 'json', 'plain_text', 'html')),
  title TEXT NOT NULL,
  subtitle TEXT,
  content TEXT NOT NULL,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_version_id BIGINT REFERENCES creative_content(content_id),
  version_notes TEXT,
  is_latest_version BOOLEAN DEFAULT true,
  
  -- Structure (for screenplay/novel)
  act_number INTEGER,
  scene_number INTEGER,
  chapter_number INTEGER,
  page_number INTEGER,
  
  -- Metrics
  word_count INTEGER,
  character_count INTEGER,
  page_count INTEGER,
  estimated_runtime_minutes INTEGER, -- for screenplays
  
  -- Metadata (flexible JSONB for format-specific data)
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Collaboration
  author_id TEXT DEFAULT 'default',
  contributors TEXT[] DEFAULT '{}',
  
  -- Tags and Organization
  tags JSONB DEFAULT '[]'::jsonb,
  status TEXT CHECK (status IN ('draft', 'review', 'final', 'archived')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Validation
  CONSTRAINT valid_project_id CHECK (length(project_id) > 0),
  CONSTRAINT valid_title CHECK (length(title) > 0),
  CONSTRAINT valid_version CHECK (version >= 1),
  CONSTRAINT valid_word_count CHECK (word_count IS NULL OR word_count >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_creative_project ON creative_content(project_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_creative_type ON creative_content(content_type);
CREATE INDEX IF NOT EXISTS idx_creative_version ON creative_content(project_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_creative_latest ON creative_content(is_latest_version) WHERE is_latest_version = true;
CREATE INDEX IF NOT EXISTS idx_creative_status ON creative_content(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_creative_created ON creative_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creative_tags ON creative_content USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_creative_metadata ON creative_content USING GIN (metadata);

-- Full-text search on content
CREATE INDEX IF NOT EXISTS idx_creative_search ON creative_content USING GIN (
  to_tsvector('english',
    coalesce(title, '') || ' ' ||
    coalesce(subtitle, '') || ' ' ||
    coalesce(content, '')
  )
);

-- Row Level Security
ALTER TABLE creative_content ENABLE ROW LEVEL SECURITY;

-- Public read access to non-deleted content
CREATE POLICY "Public can read creative content"
  ON creative_content
  FOR SELECT
  USING (deleted_at IS NULL);

-- Public insert
CREATE POLICY "Public can insert creative content"
  ON creative_content
  FOR INSERT
  WITH CHECK (true);

-- Public update
CREATE POLICY "Public can update creative content"
  ON creative_content
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_creative_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_creative_content_timestamp
  BEFORE UPDATE ON creative_content
  FOR EACH ROW
  EXECUTE FUNCTION update_creative_content_updated_at();

-- Auto-calculate word count on insert/update
CREATE OR REPLACE FUNCTION calculate_creative_metrics()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate word count
  NEW.word_count = array_length(regexp_split_to_array(NEW.content, '\s+'), 1);
  
  -- Calculate character count
  NEW.character_count = length(NEW.content);
  
  -- Estimate page count (250 words per page for novels, 55 lines per page for screenplays)
  IF NEW.content_type = 'novel' THEN
    NEW.page_count = CEIL(NEW.word_count / 250.0);
  ELSIF NEW.content_type = 'screenplay' THEN
    NEW.page_count = CEIL(array_length(regexp_split_to_array(NEW.content, '\n'), 1) / 55.0);
    NEW.estimated_runtime_minutes = NEW.page_count; -- 1 page = 1 minute rule
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_creative_content_metrics
  BEFORE INSERT OR UPDATE ON creative_content
  FOR EACH ROW
  WHEN (NEW.content IS NOT NULL)
  EXECUTE FUNCTION calculate_creative_metrics();

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'creative_content' 
ORDER BY ordinal_position;

