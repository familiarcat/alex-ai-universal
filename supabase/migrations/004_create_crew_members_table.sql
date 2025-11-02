-- Migration: Create crew_members table for DDD Architecture
-- Migrates crew profiles from JSON files to Supabase

CREATE TABLE IF NOT EXISTS crew_members (
  -- Primary key
  crew_id TEXT PRIMARY KEY,
  
  -- Basic Info
  name TEXT NOT NULL,
  rank TEXT,
  role TEXT NOT NULL,
  department TEXT,
  
  -- Personality (JSONB for flexible structure)
  archetype TEXT,
  traits JSONB DEFAULT '[]'::jsonb,
  catchphrases JSONB DEFAULT '[]'::jsonb,
  personality_description TEXT,
  
  -- Expertise
  primary_expertise TEXT[] DEFAULT '{}',
  secondary_expertise TEXT[] DEFAULT '{}',
  years_experience INTEGER,
  known_for TEXT[] DEFAULT '{}',
  specializations JSONB DEFAULT '{}'::jsonb,
  
  -- AI Configuration
  preferred_models JSONB DEFAULT '[]'::jsonb,
  system_prompt TEXT,
  temperature DECIMAL(3,2) DEFAULT 0.7,
  guidelines TEXT[] DEFAULT '{}',
  max_tokens INTEGER DEFAULT 4000,
  
  -- Integrations
  n8n_workflow_id TEXT,
  webhook_path TEXT,
  openrouter_enabled BOOLEAN DEFAULT false,
  supabase_enabled BOOLEAN DEFAULT true,
  
  -- Responsibilities & Use Cases
  responsibilities TEXT[] DEFAULT '{}',
  typical_use_cases TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT true,
  version TEXT DEFAULT '1.0.0',
  
  -- Validation
  CONSTRAINT valid_crew_id CHECK (length(crew_id) > 0),
  CONSTRAINT valid_temperature CHECK (temperature >= 0 AND temperature <= 2)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crew_members_role ON crew_members(role) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_crew_members_department ON crew_members(department) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_crew_members_active ON crew_members(active);
CREATE INDEX IF NOT EXISTS idx_crew_members_expertise ON crew_members USING GIN (primary_expertise);
CREATE INDEX IF NOT EXISTS idx_crew_members_specializations ON crew_members USING GIN (specializations);

-- Full-text search on crew expertise
CREATE INDEX IF NOT EXISTS idx_crew_members_search ON crew_members USING GIN (
  to_tsvector('english', 
    coalesce(name, '') || ' ' || 
    coalesce(role, '') || ' ' || 
    coalesce(array_to_string(primary_expertise, ' '), '') || ' ' ||
    coalesce(array_to_string(responsibilities, ' '), '')
  )
);

-- Row Level Security
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

-- Public read access to active crew members
CREATE POLICY "Public can read active crew members"
  ON crew_members
  FOR SELECT
  USING (active = true);

-- Allow authenticated updates
CREATE POLICY "Authenticated can update crew members"
  ON crew_members
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow inserts
CREATE POLICY "Public can insert crew members"
  ON crew_members
  FOR INSERT
  WITH CHECK (true);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_crew_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crew_members_timestamp
  BEFORE UPDATE ON crew_members
  FOR EACH ROW
  EXECUTE FUNCTION update_crew_members_updated_at();

-- Seed with core crew members (from existing JSON files)
INSERT INTO crew_members (
  crew_id, name, rank, role, department,
  archetype, primary_expertise, years_experience,
  preferred_models, temperature, active
) VALUES
  (
    'picard',
    'Captain Jean-Luc Picard',
    'Captain',
    'Strategic Leadership & Ethical Decision Making',
    'Command',
    'The Leader',
    ARRAY['strategic_planning', 'ethical_frameworks', 'diplomatic_relations'],
    45,
    '["claude-3.7-sonnet", "gpt-4o"]'::jsonb,
    0.6,
    true
  ),
  (
    'data',
    'Commander Data',
    'Lieutenant Commander',
    'Technical Architecture & Complex Analysis',
    'Operations',
    'The Analyst',
    ARRAY['architecture', 'algorithms', 'data_structures', 'logical_analysis'],
    30,
    '["claude-3.7-sonnet", "o1"]'::jsonb,
    0.3,
    true
  ),
  (
    'laforge',
    'Lt. Cmdr. Geordi La Forge',
    'Lieutenant Commander',
    'Infrastructure & System Engineering',
    'Engineering',
    'The Engineer',
    ARRAY['infrastructure', 'devops', 'performance_optimization'],
    25,
    '["claude-3.7-sonnet", "gpt-4o"]'::jsonb,
    0.5,
    true
  ),
  (
    'troi',
    'Counselor Deanna Troi',
    'Lieutenant Commander',
    'UX & Empathetic Design',
    'Counseling',
    'The Empath',
    ARRAY['ux_design', 'user_research', 'accessibility', 'emotional_intelligence'],
    20,
    '["claude-3.7-sonnet", "gpt-4o"]'::jsonb,
    0.7,
    true
  ),
  (
    'worf',
    'Lieutenant Worf',
    'Lieutenant',
    'Security & Access Control',
    'Security',
    'The Guardian',
    ARRAY['security', 'authentication', 'authorization', 'data_protection'],
    22,
    '["claude-3.7-sonnet"]'::jsonb,
    0.4,
    true
  ),
  (
    'obrien',
    'Chief Miles O''Brien',
    'Chief Petty Officer',
    'Pragmatic Solutions & Implementation',
    'Operations',
    'The Pragmatist',
    ARRAY['hands_on_implementation', 'troubleshooting', 'quick_fixes'],
    28,
    '["claude-3.7-sonnet"]'::jsonb,
    0.5,
    true
  )
ON CONFLICT (crew_id) DO UPDATE SET
  name = EXCLUDED.name,
  rank = EXCLUDED.rank,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Verify insertion
SELECT crew_id, name, role, active FROM crew_members ORDER BY crew_id;

