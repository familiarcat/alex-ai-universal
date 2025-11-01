-- Migration: Create projects table for Dashboard DDD Architecture
-- Client => n8n => Supabase (single source of truth)

CREATE TABLE IF NOT EXISTS projects (
  -- Primary key
  project_id TEXT PRIMARY KEY,
  
  -- Core content fields
  headline TEXT NOT NULL,
  subheadline TEXT,
  description TEXT,
  
  -- Theme and type
  theme TEXT DEFAULT 'midnight',
  project_type TEXT DEFAULT 'business' CHECK (project_type IN ('business', 'creative')),
  business_type TEXT,
  
  -- Structured data (JSONB for flexible schema)
  components JSONB,
  pages JSONB,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes for performance
  CONSTRAINT valid_project_id CHECK (length(project_id) > 0)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_type ON projects(project_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access to non-deleted projects
CREATE POLICY "Public can read non-deleted projects"
  ON projects
  FOR SELECT
  USING (deleted_at IS NULL);

-- Allow authenticated users to insert/update projects
CREATE POLICY "Authenticated users can upsert projects"
  ON projects
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON projects
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to soft-delete projects
CREATE POLICY "Authenticated users can soft-delete projects"
  ON projects
  FOR UPDATE
  USING (true)
  WITH CHECK (deleted_at IS NOT NULL);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default projects (alpha, beta, gamma, temporal)
INSERT INTO projects (project_id, headline, subheadline, description, theme, project_type, created_at, updated_at)
VALUES
  (
    'alpha',
    '✨ Discover Your Next Obsession',
    'Curated collections of premium streetwear and creative essentials',
    'Limited edition drops and exclusive designs you won''t find anywhere else. New releases every Friday.',
    'gradient',
    'business',
    NOW(),
    NOW()
  ),
  (
    'beta',
    'Compassionate Care, When You Need It Most',
    'Board-certified providers dedicated to your health and wellness',
    'Professional healthcare services with telemedicine, patient portal, and HIPAA-compliant security.',
    'pastel',
    'business',
    NOW(),
    NOW()
  ),
  (
    'gamma',
    '⚡ Unlock the Power of Your Data',
    'Real-time analytics and ML-powered insights for modern teams',
    'Advanced dashboards, custom reports, powerful API access, and predictive analytics.',
    'cyberpunk',
    'business',
    NOW(),
    NOW()
  ),
  (
    'temporal',
    '⏰ Temporal Wake - Screenplay & Novel',
    'Professional screenplay and novel writing system with visualization',
    'Complete creative writing suite with screenplay formatting, novel composition, outline tools, and Mermaid timeline visualization.',
    'offworld',
    'creative',
    NOW(),
    NOW()
  )
ON CONFLICT (project_id) DO UPDATE SET
  headline = EXCLUDED.headline,
  subheadline = EXCLUDED.subheadline,
  description = EXCLUDED.description,
  theme = EXCLUDED.theme,
  project_type = EXCLUDED.project_type,
  updated_at = NOW();

-- Verify insertion
SELECT project_id, headline, project_type, theme FROM projects ORDER BY project_id;

