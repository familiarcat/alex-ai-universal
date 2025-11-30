-- Migration: Create observations table for Crew Observation Lounge
-- Stores crew observations, insights, and recommendations

CREATE TABLE IF NOT EXISTS observations (
  -- Primary key
  observation_id BIGSERIAL PRIMARY KEY,
  
  -- Session and Crew
  session_id TEXT NOT NULL,
  crew_member_id TEXT REFERENCES crew_members(crew_id),
  
  -- Observation Details
  topic TEXT NOT NULL,
  observation_type TEXT NOT NULL CHECK (observation_type IN ('analysis', 'recommendation', 'warning', 'insight', 'question', 'vote')),
  content TEXT NOT NULL,
  supporting_evidence JSONB DEFAULT '{}'::jsonb,
  
  -- Context and Relationships
  related_to_session TEXT REFERENCES knowledge_base(session_id),
  related_to_project TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  
  -- Severity and Priority
  severity TEXT CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  
  -- Resolution Tracking
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  resolved_by TEXT REFERENCES crew_members(crew_id),
  
  -- Voting and Consensus
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  consensus_reached BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_session_id CHECK (length(session_id) > 0),
  CONSTRAINT valid_content CHECK (length(content) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id);
CREATE INDEX IF NOT EXISTS idx_observations_crew_member ON observations(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_observations_type ON observations(observation_type);
CREATE INDEX IF NOT EXISTS idx_observations_severity ON observations(severity) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_observations_created ON observations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_observations_unresolved ON observations(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_observations_tags ON observations USING GIN (tags);

-- Full-text search
CREATE INDEX IF NOT EXISTS idx_observations_search ON observations USING GIN (
  to_tsvector('english',
    coalesce(topic, '') || ' ' ||
    coalesce(content, '') || ' ' ||
    coalesce(supporting_evidence::text, '')
  )
);

-- Row Level Security
ALTER TABLE observations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read observations"
  ON observations
  FOR SELECT
  USING (true);

-- Public insert (for crew member submissions)
CREATE POLICY "Public can insert observations"
  ON observations
  FOR INSERT
  WITH CHECK (true);

-- Public update (for voting and resolution)
CREATE POLICY "Public can update observations"
  ON observations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_observations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_observations_timestamp
  BEFORE UPDATE ON observations
  FOR EACH ROW
  EXECUTE FUNCTION update_observations_updated_at();

-- Auto-set resolved_at when resolved changes to true
CREATE OR REPLACE FUNCTION set_observation_resolved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.resolved = true AND OLD.resolved = false THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_observations_resolved_timestamp
  BEFORE UPDATE ON observations
  FOR EACH ROW
  EXECUTE FUNCTION set_observation_resolved_at();

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'observations' 
ORDER BY ordinal_position;

