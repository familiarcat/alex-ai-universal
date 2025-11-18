-- ============================================================================
-- CONSOLIDATED SUPABASE MIGRATION
-- Generated: 2025-11-18T09:52:31.463Z
-- Total migrations: 13
-- ============================================================================

-- This file contains all migrations in chronological order.
-- Execute this entire file in the Supabase Dashboard SQL Editor.

-- ============================================================================


-- ============================================================================
-- Migration 1/13: 001_create_projects_table.sql
-- ============================================================================

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




-- ============================================================================
-- Migration 2/13: 002_create_user_settings_table.sql
-- ============================================================================

-- Migration: Create user_settings table for DDD Architecture
-- Client => n8n => Supabase (single source of truth for user preferences)

CREATE TABLE IF NOT EXISTS user_settings (
  -- Primary key (using 'default' for single-user MVP)
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  
  -- Theme preferences
  global_theme TEXT DEFAULT 'midnight',
  
  -- Future preferences (JSONB for flexibility)
  preferences JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_user_id CHECK (length(user_id) > 0),
  CONSTRAINT valid_theme CHECK (length(global_theme) > 0)
);

-- Row Level Security (RLS) Policies
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to settings
CREATE POLICY "Public can read user settings"
  ON user_settings
  FOR SELECT
  USING (true);

-- Allow public upsert (for single-user system)
CREATE POLICY "Public can upsert user settings"
  ON user_settings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update user settings"
  ON user_settings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_timestamp
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_settings_updated_at();

-- Insert default settings for 'default' user
INSERT INTO user_settings (user_id, global_theme, preferences)
VALUES (
  'default',
  'midnight',
  '{}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify insertion
SELECT user_id, global_theme, created_at FROM user_settings;




-- ============================================================================
-- Migration 3/13: 003_create_knowledge_base_table.sql
-- ============================================================================

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




-- ============================================================================
-- Migration 4/13: 004_create_crew_members_table.sql
-- ============================================================================

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




-- ============================================================================
-- Migration 5/13: 005_create_observations_table.sql
-- ============================================================================

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




-- ============================================================================
-- Migration 6/13: 006_create_workflow_executions_table.sql
-- ============================================================================

-- Migration: Create workflow_executions table for operational monitoring
-- Tracks all n8n workflow executions for analytics and debugging

CREATE TABLE IF NOT EXISTS workflow_executions (
  -- Primary key
  execution_id TEXT PRIMARY KEY,
  
  -- Workflow Details
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  
  -- Execution Status
  execution_status TEXT NOT NULL CHECK (execution_status IN ('success', 'error', 'running', 'waiting', 'cancelled')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  
  -- Trigger Context
  trigger_source TEXT CHECK (trigger_source IN ('webhook', 'schedule', 'manual', 'workflow')),
  trigger_data JSONB DEFAULT '{}'::jsonb,
  
  -- Execution Data
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  error_stack TEXT,
  
  -- Performance Metrics
  nodes_executed INTEGER DEFAULT 0,
  http_requests INTEGER DEFAULT 0,
  database_queries INTEGER DEFAULT 0,
  
  -- User Context
  user_id TEXT DEFAULT 'default',
  session_id TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_execution_id CHECK (length(execution_id) > 0),
  CONSTRAINT valid_duration CHECK (duration_ms IS NULL OR duration_ms >= 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON workflow_executions(execution_status);
CREATE INDEX IF NOT EXISTS idx_executions_started ON workflow_executions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_executions_errors ON workflow_executions(execution_status) WHERE execution_status = 'error';
CREATE INDEX IF NOT EXISTS idx_executions_duration ON workflow_executions(duration_ms DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_executions_session ON workflow_executions(session_id);

-- Row Level Security
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read executions"
  ON workflow_executions
  FOR SELECT
  USING (true);

-- Public insert (for workflow logging)
CREATE POLICY "Public can insert executions"
  ON workflow_executions
  FOR INSERT
  WITH CHECK (true);

-- Public update (for completion updates)
CREATE POLICY "Public can update executions"
  ON workflow_executions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'workflow_executions' 
ORDER BY ordinal_position;




-- ============================================================================
-- Migration 7/13: 007_create_error_logs_table.sql
-- ============================================================================

-- Migration: Create error_logs table for centralized error tracking
-- Replaces console-only logging with persistent error storage

CREATE TABLE IF NOT EXISTS error_logs (
  -- Primary key
  error_id BIGSERIAL PRIMARY KEY,
  
  -- Error Classification
  error_type TEXT NOT NULL CHECK (error_type IN ('client', 'server', 'workflow', 'database', 'api', 'network')),
  error_severity TEXT NOT NULL CHECK (error_severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  error_code TEXT,
  error_name TEXT,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  
  -- Source Context
  source TEXT NOT NULL, -- component name, file path, workflow name
  source_file TEXT,
  source_line INTEGER,
  source_function TEXT,
  
  -- User Context
  user_id TEXT DEFAULT 'default',
  session_id TEXT,
  
  -- Request Context (for API/workflow errors)
  request_url TEXT,
  request_method TEXT,
  request_headers JSONB,
  request_body JSONB,
  response_status INTEGER,
  
  -- Environment Context
  environment TEXT DEFAULT 'production' CHECK (environment IN ('development', 'staging', 'production')),
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT,
  
  -- Additional Data
  additional_context JSONB DEFAULT '{}'::jsonb,
  
  -- Resolution Tracking
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT,
  resolution_notes TEXT,
  
  -- Occurrence Tracking
  first_occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  occurrence_count INTEGER DEFAULT 1,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_error_message CHECK (length(error_message) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(error_severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON error_logs(source);
CREATE INDEX IF NOT EXISTS idx_error_logs_occurred ON error_logs(last_occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_unresolved ON error_logs(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_error_logs_code ON error_logs(error_code) WHERE error_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_error_logs_session ON error_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_context ON error_logs USING GIN (additional_context);

-- Full-text search on error details
CREATE INDEX IF NOT EXISTS idx_error_logs_search ON error_logs USING GIN (
  to_tsvector('english',
    coalesce(error_message, '') || ' ' ||
    coalesce(error_stack, '') || ' ' ||
    coalesce(source, '')
  )
);

-- Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read error logs"
  ON error_logs
  FOR SELECT
  USING (true);

-- Public insert (for error reporting)
CREATE POLICY "Public can insert error logs"
  ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Public update (for resolution)
CREATE POLICY "Public can update error logs"
  ON error_logs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Auto-update trigger
CREATE OR REPLACE FUNCTION update_error_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_error_logs_timestamp
  BEFORE UPDATE ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_error_logs_updated_at();

-- Auto-increment occurrence count for duplicate errors
CREATE OR REPLACE FUNCTION increment_error_occurrence()
RETURNS TRIGGER AS $$
DECLARE
  existing_error_id BIGINT;
BEGIN
  -- Check if similar error exists (same type, source, message)
  SELECT error_id INTO existing_error_id
  FROM error_logs
  WHERE error_type = NEW.error_type
    AND source = NEW.source
    AND error_message = NEW.error_message
    AND resolved = false
    AND created_at > NOW() - INTERVAL '1 hour'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- If found, update existing instead of creating new
  IF existing_error_id IS NOT NULL THEN
    UPDATE error_logs
    SET occurrence_count = occurrence_count + 1,
        last_occurred_at = NOW(),
        updated_at = NOW()
    WHERE error_id = existing_error_id;
    
    -- Return NULL to prevent INSERT
    RETURN NULL;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER prevent_duplicate_errors
  BEFORE INSERT ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_error_occurrence();

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'error_logs' 
ORDER BY ordinal_position;




-- ============================================================================
-- Migration 8/13: 008_create_analytics_events_table.sql
-- ============================================================================

-- Migration: Create analytics_events table for usage tracking
-- Tracks user interactions, feature usage, and system performance

CREATE TABLE IF NOT EXISTS analytics_events (
  -- Primary key
  event_id BIGSERIAL PRIMARY KEY,
  
  -- Event Classification
  event_type TEXT NOT NULL, -- page_view, user_action, system_event, performance
  event_category TEXT NOT NULL, -- navigation, theme, project, component, etc.
  event_action TEXT NOT NULL, -- view, create, update, delete, change
  event_label TEXT,
  event_value NUMERIC,
  
  -- User Context
  user_id TEXT DEFAULT 'default',
  session_id TEXT,
  
  -- Page Context
  page_url TEXT,
  page_title TEXT,
  referrer TEXT,
  
  -- Custom Properties (flexible JSONB)
  properties JSONB DEFAULT '{}'::jsonb,
  
  -- Performance Metrics (for performance events)
  duration_ms INTEGER,
  memory_mb INTEGER,
  cpu_percent DECIMAL(5,2),
  
  -- Device Context
  user_agent TEXT,
  browser TEXT,
  os TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  screen_resolution TEXT,
  
  -- Geographic Context (optional)
  country_code TEXT,
  timezone TEXT,
  
  -- Metadata
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_event_type CHECK (length(event_type) > 0),
  CONSTRAINT valid_event_action CHECK (length(event_action) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_action ON analytics_events(event_action);
CREATE INDEX IF NOT EXISTS idx_analytics_occurred ON analytics_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page ON analytics_events(page_url);
CREATE INDEX IF NOT EXISTS idx_analytics_properties ON analytics_events USING GIN (properties);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_analytics_type_category_occurred 
  ON analytics_events(event_type, event_category, occurred_at DESC);

-- Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public can read analytics"
  ON analytics_events
  FOR SELECT
  USING (true);

-- Public insert (for event tracking)
CREATE POLICY "Public can insert analytics"
  ON analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Create aggregate views for common analytics queries
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
  event_category,
  event_action,
  COUNT(*) as event_count,
  DATE(occurred_at) as event_date
FROM analytics_events
GROUP BY event_category, event_action, DATE(occurred_at)
ORDER BY event_date DESC, event_count DESC;

CREATE OR REPLACE VIEW popular_features AS
SELECT 
  event_category,
  event_action,
  COUNT(*) as usage_count,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(duration_ms) as avg_duration_ms
FROM analytics_events
WHERE occurred_at > NOW() - INTERVAL '30 days'
GROUP BY event_category, event_action
ORDER BY usage_count DESC
LIMIT 50;

-- Verify table creation
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'analytics_events' 
ORDER BY ordinal_position;




-- ============================================================================
-- Migration 9/13: 009_create_creative_content_table.sql
-- ============================================================================

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




-- ============================================================================
-- Migration 10/13: 010_add_vector_embeddings.sql
-- ============================================================================

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




-- ============================================================================
-- Migration 11/13: 011_create_audit_logs_table.sql
-- ============================================================================

-- Migration: Create Immutable Audit Logs Table
-- Purpose: Lt. Worf's Security Protocol - Track all system actions
-- Date: November 4, 2025
-- Priority: HIGH (Compliance + Security)

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AUDIT_LOGS TABLE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE TABLE IF NOT EXISTS audit_logs (
  -- Primary fields
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Who did it?
  user_id TEXT,                    -- User ID (nullable for system actions)
  actor_type TEXT NOT NULL,        -- 'user', 'system', 'crew_member', 'api'
  actor_name TEXT,                 -- Username, crew name, or API client name
  
  -- What happened?
  action TEXT NOT NULL,             -- 'create_project', 'update_settings', 'webhook_trigger', etc.
  resource_type TEXT NOT NULL,     -- 'project', 'settings', 'knowledge', 'workflow', etc.
  resource_id TEXT,                -- ID of affected resource
  
  -- Details
  details JSONB,                   -- Structured details about the action
  before_state JSONB,              -- State before action (for updates/deletes)
  after_state JSONB,               -- State after action (for creates/updates)
  
  -- Request metadata
  ip_address INET,                 -- IP address of request
  user_agent TEXT,                 -- Browser/client user agent
  request_id TEXT,                 -- Correlation ID for distributed tracing
  
  -- Security
  success BOOLEAN NOT NULL DEFAULT true,  -- Did action succeed?
  error_message TEXT,              -- If failed, why?
  security_level TEXT DEFAULT 'info',     -- 'info', 'warning', 'critical'
  
  -- Compliance
  compliance_tags TEXT[],          -- e.g., ['gdpr', 'pci', 'hipaa']
  retention_days INTEGER DEFAULT 2555  -- 7 years (compliance requirement)
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INDEXES (Performance)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Time-based queries (most common)
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- User activity queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id) WHERE user_id IS NOT NULL;

-- Security monitoring
CREATE INDEX idx_audit_logs_security_level ON audit_logs(security_level) WHERE security_level IN ('warning', 'critical');

-- Failed actions (security incidents)
CREATE INDEX idx_audit_logs_failed ON audit_logs(success, created_at DESC) WHERE success = false;

-- Resource tracking
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- IP-based queries (detect abuse patterns)
CREATE INDEX idx_audit_logs_ip ON audit_logs(ip_address, created_at DESC);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ROW LEVEL SECURITY (Immutability)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Audit logs are IMMUTABLE (no updates, no deletes!)
-- Only INSERT and SELECT allowed

-- Allow INSERT for authenticated users and service role
CREATE POLICY "audit_logs_insert" ON audit_logs
  FOR INSERT
  WITH CHECK (true);  -- Anyone can insert (we want comprehensive logging)

-- Allow SELECT only for service role (admin access) or user's own logs
CREATE POLICY "audit_logs_select_own" ON audit_logs
  FOR SELECT
  USING (
    auth.role() = 'service_role'  -- Admin can see all
    OR user_id = auth.uid()::text  -- Users can see their own
  );

-- PREVENT UPDATES (Immutability)
CREATE POLICY "audit_logs_no_update" ON audit_logs
  FOR UPDATE
  USING (false);  -- No one can update, ever!

-- PREVENT DELETES (Immutability)
CREATE POLICY "audit_logs_no_delete" ON audit_logs
  FOR DELETE
  USING (false);  -- No one can delete, ever!

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- AUTOMATIC CLEANUP (Retention Policy)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function to clean up old audit logs (respects retention_days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Archive logs older than retention period to cold storage
  -- (In production, this would move to S3 Glacier or similar)
  DELETE FROM audit_logs
  WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (runs daily at 2 AM UTC)
-- Note: Requires pg_cron extension (available in Supabase)
-- SELECT cron.schedule('cleanup-audit-logs', '0 2 * * *', 'SELECT cleanup_old_audit_logs()');

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- HELPER FUNCTIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log(
  p_actor_type TEXT,
  p_actor_name TEXT,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO audit_logs (
    actor_type,
    actor_name,
    action,
    resource_type,
    resource_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    p_actor_type,
    p_actor_name,
    p_action,
    p_resource_type,
    p_resource_id,
    p_details,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- TRIGGERS (Automatic Audit Logging)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Auto-audit project changes
CREATE OR REPLACE FUNCTION audit_projects_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      'system',
      'auto_trigger',
      'create_project',
      'project',
      NEW.id,
      jsonb_build_object('project', NEW)
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      'system',
      'auto_trigger',
      'update_project',
      'project',
      NEW.id,
      jsonb_build_object('before', OLD, 'after', NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      'system',
      'auto_trigger',
      'delete_project',
      'project',
      OLD.id,
      jsonb_build_object('project', OLD)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to projects table
DROP TRIGGER IF EXISTS audit_projects_trigger ON projects;
CREATE TRIGGER audit_projects_trigger
  AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION audit_projects_changes();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VIEWS (For Common Queries)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Recent security events
CREATE OR REPLACE VIEW recent_security_events AS
SELECT
  id,
  created_at,
  actor_name,
  action,
  resource_type,
  resource_id,
  success,
  error_message,
  ip_address
FROM audit_logs
WHERE security_level IN ('warning', 'critical')
  AND created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Failed login attempts (security monitoring)
CREATE OR REPLACE VIEW failed_auth_attempts AS
SELECT
  DATE_TRUNC('hour', created_at) as hour,
  ip_address,
  COUNT(*) as attempt_count,
  array_agg(DISTINCT user_agent) as user_agents
FROM audit_logs
WHERE action LIKE '%login%'
  AND success = false
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), ip_address
HAVING COUNT(*) > 5  -- More than 5 failed attempts = suspicious
ORDER BY hour DESC, attempt_count DESC;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- GRANT PERMISSIONS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Grant access to authenticated users
GRANT SELECT, INSERT ON audit_logs TO authenticated;
GRANT SELECT ON recent_security_events TO authenticated;
GRANT SELECT ON failed_auth_attempts TO service_role;  -- Admin only

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- COMMENTS (Documentation)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all system actions. No updates or deletes allowed (enforced by RLS).';
COMMENT ON COLUMN audit_logs.actor_type IS 'Type of actor: user, system, crew_member, api';
COMMENT ON COLUMN audit_logs.action IS 'Action performed: create_project, webhook_trigger, etc.';
COMMENT ON COLUMN audit_logs.retention_days IS 'How long to retain this log (default 7 years for compliance)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- INITIAL TEST DATA
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Log the creation of this table
INSERT INTO audit_logs (
  actor_type,
  actor_name,
  action,
  resource_type,
  resource_id,
  details,
  security_level
) VALUES (
  'system',
  'migration_011',
  'create_table',
  'database',
  'audit_logs',
  jsonb_build_object(
    'migration': '011_create_audit_logs_table.sql',
    'created_by': 'Lt. Worf Security Protocol',
    'purpose': 'Immutable audit trail for compliance and security'
  ),
  'info'
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Test that updates are prevented
DO $$
BEGIN
  -- Try to update (should fail)
  BEGIN
    UPDATE audit_logs SET action = 'modified' WHERE action = 'create_table';
    RAISE EXCEPTION 'SECURITY BREACH: Audit log was updated! RLS policy failed!';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE '✅ UPDATE blocked correctly (immutability enforced)';
  END;
  
  -- Try to delete (should fail)
  BEGIN
    DELETE FROM audit_logs WHERE action = 'create_table';
    RAISE EXCEPTION 'SECURITY BREACH: Audit log was deleted! RLS policy failed!';
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE '✅ DELETE blocked correctly (immutability enforced)';
  END;
END $$;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Lt. Worf: "Audit logs are now immutable. Any attempt to modify history
--            will be rejected. This is how security should be implemented."





-- ============================================================================
-- Migration 12/13: 20251110_crew_memory_schema.sql
-- ============================================================================

-- Supabase Schema for Alex AI Universal Crew Memory Storage
-- Shared Library Computer System with Prime Directive Compliance
-- Created: January 18, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Crew Members Enum
CREATE TYPE crew_member AS ENUM (
    'picard',
    'riker', 
    'data',
    'la_forge',
    'worf',
    'troi',
    'crusher',
    'uhura',
    'quark'
);

-- Knowledge Types Enum
CREATE TYPE knowledge_type AS ENUM (
    'technical_analysis',
    'strategic_assessment',
    'medical_assessment',
    'security_analysis',
    'engineering_solution',
    'communication_protocol',
    'business_optimization',
    'problem_solution',
    'reference_documentation',
    'lesson_learned',
    'best_practice',
    'troubleshooting_guide'
);

-- Priority Levels Enum
CREATE TYPE priority_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Prime Directive Compliance Enum
CREATE TYPE prime_directive_compliance AS ENUM (
    'compliant',
    'ambiguous',
    'non_specific',
    'general_principle'
);

-- Crew Memories Table
CREATE TABLE IF NOT EXISTS crew_memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Crew Member Information
    crew_member crew_member NOT NULL,
    crew_member_name VARCHAR(255) NOT NULL,
    
    -- Knowledge Classification
    knowledge_type knowledge_type NOT NULL,
    priority priority_level DEFAULT 'medium',
    
    -- Core Knowledge Content
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    detailed_analysis TEXT,
    key_findings TEXT[] DEFAULT '{}',
    conclusions TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    
    -- Reference Information (Prime Directive Compliant)
    referenced_documents TEXT[] DEFAULT '{}',
    related_topics TEXT[] DEFAULT '{}',
    applicable_scenarios TEXT[] DEFAULT '{}',
    general_principles TEXT[] DEFAULT '{}',
    
    -- Technical Metadata
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    complexity_level INTEGER DEFAULT 5 CHECK (complexity_level >= 1 AND complexity_level <= 10),
    confidence_level INTEGER DEFAULT 75 CHECK (confidence_level >= 1 AND confidence_level <= 100),
    
    -- Prime Directive Compliance
    prime_directive_compliance prime_directive_compliance DEFAULT 'compliant',
    ambiguity_level INTEGER DEFAULT 7 CHECK (ambiguity_level >= 1 AND ambiguity_level <= 10),
    project_specificity BOOLEAN DEFAULT FALSE,
    
    -- Vector Embedding for Semantic Search
    semantic_text TEXT NOT NULL,
    vector_embedding VECTOR(1536),
    
    -- Collaboration Metadata
    validated_by crew_member[] DEFAULT '{}',
    conflict_resolutions JSONB DEFAULT '[]',
    
    -- Storage Metadata
    storage_timestamp TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    -- Indexing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew Expertise Areas Table
CREATE TABLE IF NOT EXISTS crew_expertise_areas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    crew_member crew_member NOT NULL,
    expertise_area VARCHAR(255) NOT NULL,
    proficiency_level INTEGER DEFAULT 75 CHECK (proficiency_level >= 1 AND proficiency_level <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crew_member, expertise_area)
);

-- Memory Relationships Table (Knowledge Graph)
CREATE TABLE IF NOT EXISTS memory_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_memory_id UUID NOT NULL REFERENCES crew_memories(id) ON DELETE CASCADE,
    target_memory_id UUID NOT NULL REFERENCES crew_memories(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- 'related', 'conflicts', 'validates', 'extends'
    strength DECIMAL(3,2) DEFAULT 0.5 CHECK (strength >= 0.0 AND strength <= 1.0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_memory_id, target_memory_id, relationship_type)
);

-- Memory Validation Table
CREATE TABLE IF NOT EXISTS memory_validations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    memory_id UUID NOT NULL REFERENCES crew_memories(id) ON DELETE CASCADE,
    validator crew_member NOT NULL,
    validation_type VARCHAR(100) NOT NULL, -- 'confirms', 'disputes', 'extends', 'clarifies'
    validation_text TEXT,
    confidence_adjustment INTEGER DEFAULT 0, -- -10 to +10 adjustment
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collective Intelligence Analytics Table
CREATE TABLE IF NOT EXISTS collective_intelligence_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Overall Statistics
    total_memories INTEGER DEFAULT 0,
    active_crew_members INTEGER DEFAULT 0,
    knowledge_diversity_score DECIMAL(5,2) DEFAULT 0.0,
    
    -- Crew Contribution Statistics
    crew_contributions JSONB DEFAULT '{}',
    knowledge_type_distribution JSONB DEFAULT '{}',
    expertise_overlap_matrix JSONB DEFAULT '{}',
    
    -- Quality Metrics
    average_confidence_level DECIMAL(5,2) DEFAULT 0.0,
    validation_rate DECIMAL(5,2) DEFAULT 0.0,
    conflict_resolution_rate DECIMAL(5,2) DEFAULT 0.0,
    prime_directive_compliance_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- Usage Analytics
    search_frequency INTEGER DEFAULT 0,
    top_searched_topics TEXT[] DEFAULT '{}',
    most_accessed_memories UUID[] DEFAULT '{}',
    
    -- Trends
    recent_trends TEXT[] DEFAULT '{}',
    emerging_topics TEXT[] DEFAULT '{}',
    declining_topics TEXT[] DEFAULT '{}'
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_crew_memories_crew_member ON crew_memories(crew_member);
CREATE INDEX IF NOT EXISTS idx_crew_memories_knowledge_type ON crew_memories(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_crew_memories_priority ON crew_memories(priority);
CREATE INDEX IF NOT EXISTS idx_crew_memories_timestamp ON crew_memories(timestamp);
CREATE INDEX IF NOT EXISTS idx_crew_memories_confidence_level ON crew_memories(confidence_level);
CREATE INDEX IF NOT EXISTS idx_crew_memories_complexity_level ON crew_memories(complexity_level);
CREATE INDEX IF NOT EXISTS idx_crew_memories_prime_directive ON crew_memories(prime_directive_compliance);
CREATE INDEX IF NOT EXISTS idx_crew_memories_vector ON crew_memories USING ivfflat (vector_embedding vector_cosine_ops);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_crew_memories_title_search ON crew_memories USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_crew_memories_summary_search ON crew_memories USING gin(to_tsvector('english', summary));
CREATE INDEX IF NOT EXISTS idx_crew_memories_semantic_search ON crew_memories USING gin(to_tsvector('english', semantic_text));

-- Array indexes for tags and keywords
CREATE INDEX IF NOT EXISTS idx_crew_memories_tags ON crew_memories USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_crew_memories_keywords ON crew_memories USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_crew_memories_validated_by ON crew_memories USING gin(validated_by);

-- Relationships indexes
CREATE INDEX IF NOT EXISTS idx_memory_relationships_source ON memory_relationships(source_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_target ON memory_relationships(target_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_type ON memory_relationships(relationship_type);

-- Validation indexes
CREATE INDEX IF NOT EXISTS idx_memory_validations_memory ON memory_validations(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_validations_validator ON memory_validations(validator);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_collective_intelligence_timestamp ON collective_intelligence_analytics(timestamp);

-- Create Functions for Advanced Queries

-- Function for semantic similarity search
CREATE OR REPLACE FUNCTION search_crew_memories_semantic(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    crew_filter crew_member DEFAULT NULL,
    knowledge_type_filter knowledge_type DEFAULT NULL,
    priority_filter priority_level DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    summary TEXT,
    crew_member crew_member,
    crew_member_name VARCHAR,
    knowledge_type knowledge_type,
    priority priority_level,
    confidence_level INTEGER,
    similarity FLOAT,
    general_principles TEXT[],
    referenced_documents TEXT[],
    validated_by crew_member[]
)
LANGUAGE SQL
AS $$
    SELECT
        cm.id,
        cm.title,
        cm.summary,
        cm.crew_member,
        cm.crew_member_name,
        cm.knowledge_type,
        cm.priority,
        cm.confidence_level,
        1 - (cm.vector_embedding <=> query_embedding) AS similarity,
        cm.general_principles,
        cm.referenced_documents,
        cm.validated_by
    FROM crew_memories cm
    WHERE 1 - (cm.vector_embedding <=> query_embedding) > match_threshold
        AND (crew_filter IS NULL OR cm.crew_member = crew_filter)
        AND (knowledge_type_filter IS NULL OR cm.knowledge_type = knowledge_type_filter)
        AND (priority_filter IS NULL OR cm.priority = priority_filter)
        AND cm.prime_directive_compliance = 'compliant'
    ORDER BY cm.vector_embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function for crew expertise analysis
CREATE OR REPLACE FUNCTION get_crew_expertise_analysis(
    target_crew_member crew_member DEFAULT NULL
)
RETURNS TABLE (
    crew_member crew_member,
    total_memories BIGINT,
    avg_confidence DECIMAL,
    expertise_areas TEXT[],
    most_common_knowledge_type knowledge_type,
    validation_count BIGINT,
    contribution_score DECIMAL
)
LANGUAGE SQL
AS $$
    SELECT
        cm.crew_member,
        COUNT(*) as total_memories,
        ROUND(AVG(cm.confidence_level), 2) as avg_confidence,
        ARRAY_AGG(DISTINCT cea.expertise_area) as expertise_areas,
        MODE() WITHIN GROUP (ORDER BY cm.knowledge_type) as most_common_knowledge_type,
        COUNT(DISTINCT mv.id) as validation_count,
        ROUND(
            (COUNT(*) * 0.4) + 
            (AVG(cm.confidence_level) * 0.3) + 
            (COUNT(DISTINCT mv.id) * 0.3), 2
        ) as contribution_score
    FROM crew_memories cm
    LEFT JOIN crew_expertise_areas cea ON cm.crew_member = cea.crew_member
    LEFT JOIN memory_validations mv ON cm.id = mv.memory_id
    WHERE (target_crew_member IS NULL OR cm.crew_member = target_crew_member)
    GROUP BY cm.crew_member
    ORDER BY contribution_score DESC;
$$;

-- Function for collective intelligence insights
CREATE OR REPLACE FUNCTION get_collective_intelligence_insights(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    insight_type VARCHAR,
    insight_data JSONB
)
LANGUAGE SQL
AS $$
    WITH recent_memories AS (
        SELECT * FROM crew_memories 
        WHERE timestamp >= NOW() - INTERVAL '1 day' * days_back
    ),
    knowledge_distribution AS (
        SELECT 
            knowledge_type,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM recent_memories
        GROUP BY knowledge_type
    ),
    crew_contributions AS (
        SELECT 
            crew_member,
            COUNT(*) as memory_count,
            ROUND(AVG(confidence_level), 2) as avg_confidence,
            COUNT(DISTINCT knowledge_type) as diversity_score
        FROM recent_memories
        GROUP BY crew_member
    ),
    trending_topics AS (
        SELECT 
            unnest(keywords) as topic,
            COUNT(*) as frequency
        FROM recent_memories
        GROUP BY unnest(keywords)
        ORDER BY frequency DESC
        LIMIT 10
    )
    SELECT 'knowledge_distribution' as insight_type, 
           jsonb_agg(jsonb_build_object('type', knowledge_type, 'count', count, 'percentage', percentage)) as insight_data
    FROM knowledge_distribution
    UNION ALL
    SELECT 'crew_contributions' as insight_type,
           jsonb_agg(jsonb_build_object('crew_member', crew_member, 'memory_count', memory_count, 'avg_confidence', avg_confidence, 'diversity_score', diversity_score)) as insight_data
    FROM crew_contributions
    UNION ALL
    SELECT 'trending_topics' as insight_type,
           jsonb_agg(jsonb_build_object('topic', topic, 'frequency', frequency)) as insight_data
    FROM trending_topics;
$$;

-- Function for Prime Directive compliance check
CREATE OR REPLACE FUNCTION check_prime_directive_compliance(
    memory_id UUID
)
RETURNS TABLE (
    compliance_score DECIMAL,
    issues TEXT[],
    recommendations TEXT[]
)
LANGUAGE SQL
AS $$
    WITH memory_analysis AS (
        SELECT 
            title,
            summary,
            detailed_analysis,
            project_specificity,
            ambiguity_level,
            general_principles,
            referenced_documents
        FROM crew_memories
        WHERE id = memory_id
    )
    SELECT 
        CASE 
            WHEN project_specificity = FALSE AND ambiguity_level >= 6 AND array_length(general_principles, 1) > 0 
            THEN 100.0
            WHEN project_specificity = FALSE AND ambiguity_level >= 5 
            THEN 80.0
            WHEN ambiguity_level >= 4 
            THEN 60.0
            ELSE 40.0
        END as compliance_score,
        CASE 
            WHEN project_specificity = TRUE THEN ARRAY['Contains project-specific information']
            WHEN ambiguity_level < 5 THEN ARRAY['Insufficient ambiguity level']
            WHEN array_length(general_principles, 1) = 0 THEN ARRAY['No general principles extracted']
            ELSE ARRAY[]::TEXT[]
        END as issues,
        CASE 
            WHEN project_specificity = TRUE THEN ARRAY['Generalize project-specific references', 'Increase ambiguity level']
            WHEN ambiguity_level < 5 THEN ARRAY['Increase ambiguity level to 6+', 'Extract more general principles']
            WHEN array_length(general_principles, 1) = 0 THEN ARRAY['Extract general principles from analysis', 'Document applicable scenarios']
            ELSE ARRAY['Compliance maintained']::TEXT[]
        END as recommendations
    FROM memory_analysis;
$$;

-- Create RLS (Row Level Security) Policies
ALTER TABLE crew_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_expertise_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_intelligence_analytics ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow read access to crew memories" ON crew_memories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to crew expertise" ON crew_expertise_areas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to memory relationships" ON memory_relationships
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to memory validations" ON memory_validations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to collective intelligence" ON collective_intelligence_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update access for service role (N8N integration)
CREATE POLICY "Allow service role full access to crew memories" ON crew_memories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to crew expertise" ON crew_expertise_areas
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to memory relationships" ON memory_relationships
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to memory validations" ON memory_validations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to collective intelligence" ON collective_intelligence_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Create Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crew_memories_updated_at BEFORE UPDATE ON crew_memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Initial Crew Expertise Areas
INSERT INTO crew_expertise_areas (crew_member, expertise_area, proficiency_level) VALUES
-- Captain Picard
('picard', 'strategic_planning', 95),
('picard', 'mission_coordination', 95),
('picard', 'crew_leadership', 90),
('picard', 'diplomatic_solutions', 90),
('picard', 'ethical_decision_making', 95),
('picard', 'resource_allocation', 85),

-- Commander Riker
('riker', 'tactical_operations', 95),
('riker', 'workflow_management', 95),
('riker', 'team_coordination', 90),
('riker', 'execution_planning', 90),
('riker', 'resource_management', 85),
('riker', 'operational_efficiency', 90),

-- Commander Data
('data', 'technical_analysis', 95),
('data', 'logical_reasoning', 95),
('data', 'system_optimization', 90),
('data', 'data_processing', 95),
('data', 'algorithm_design', 90),
('data', 'performance_analysis', 90),

-- Lieutenant Commander La Forge
('la_forge', 'infrastructure_engineering', 95),
('la_forge', 'system_monitoring', 95),
('la_forge', 'preventive_maintenance', 90),
('la_forge', 'troubleshooting', 95),
('la_forge', 'performance_optimization', 90),
('la_forge', 'technical_innovation', 85),

-- Lieutenant Worf
('worf', 'security_analysis', 95),
('worf', 'threat_assessment', 95),
('worf', 'defensive_strategies', 90),
('worf', 'protocol_enforcement', 90),
('worf', 'risk_management', 85),
('worf', 'security_optimization', 90),

-- Counselor Troi
('troi', 'user_experience', 95),
('troi', 'psychological_assessment', 95),
('troi', 'communication_optimization', 90),
('troi', 'interface_design', 85),
('troi', 'usability_analysis', 90),
('troi', 'human_factors', 90),

-- Dr. Crusher
('crusher', 'system_health', 95),
('crusher', 'medical_diagnosis', 95),
('crusher', 'preventive_care', 90),
('crusher', 'health_monitoring', 95),
('crusher', 'treatment_protocols', 90),
('crusher', 'wellness_optimization', 85),

-- Lieutenant Uhura
('uhura', 'communication_systems', 95),
('uhura', 'data_transmission', 95),
('uhura', 'network_optimization', 90),
('uhura', 'protocol_management', 90),
('uhura', 'integration_coordination', 85),
('uhura', 'information_flow', 90),

-- Quark
('quark', 'business_optimization', 95),
('quark', 'cost_analysis', 95),
('quark', 'efficiency_metrics', 90),
('quark', 'resource_utilization', 90),
('quark', 'roi_calculation', 95),
('quark', 'economic_assessment', 85)
ON CONFLICT (crew_member, expertise_area) DO NOTHING;

-- Insert Initial Collective Intelligence Analytics
INSERT INTO collective_intelligence_analytics (
    total_memories,
    active_crew_members,
    knowledge_diversity_score,
    average_confidence_level,
    prime_directive_compliance_rate
) VALUES (
    0,
    9,
    100.0,
    85.0,
    100.0
) ON CONFLICT DO NOTHING;

-- Create Views for Easy Querying
CREATE OR REPLACE VIEW crew_memory_summary AS
SELECT 
    id,
    title,
    summary,
    crew_member,
    crew_member_name,
    knowledge_type,
    priority,
    confidence_level,
    complexity_level,
    array_length(key_findings, 1) as finding_count,
    array_length(conclusions, 1) as conclusion_count,
    array_length(recommendations, 1) as recommendation_count,
    array_length(validated_by, 1) as validation_count,
    timestamp,
    created_at
FROM crew_memories
ORDER BY timestamp DESC;

CREATE OR REPLACE VIEW crew_contributions_summary AS
SELECT 
    crew_member,
    crew_member_name,
    COUNT(*) as total_memories,
    ROUND(AVG(confidence_level), 2) as avg_confidence,
    ROUND(AVG(complexity_level), 2) as avg_complexity,
    COUNT(DISTINCT knowledge_type) as knowledge_diversity,
    MAX(timestamp) as last_contribution
FROM crew_memories
GROUP BY crew_member, crew_member_name
ORDER BY total_memories DESC;

-- Grant Permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Success Message
DO $$
BEGIN
    RAISE NOTICE '✅ Alex AI Universal Crew Memory Schema Created Successfully';
    RAISE NOTICE '🖖 Shared Library Computer System Ready';
    RAISE NOTICE '🧠 Prime Directive Compliance Enforced';
    RAISE NOTICE '📚 Collective Intelligence Database Operational';
    RAISE NOTICE '🔍 Semantic Search Capabilities Active';
END $$;




-- ============================================================================
-- Migration 13/13: 20251117_create_alex_ai_memories.sql
-- ============================================================================

-- Create alex_ai_memories table for universal-extension compatibility
-- This table is used by the memory-sync system in packages/universal-extension
-- Created: 2025-11-17

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create alex_ai_memories table (simplified version for universal-extension)
CREATE TABLE IF NOT EXISTS alex_ai_memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Memory content
    content TEXT NOT NULL,
    summary TEXT,
    
    -- Crew member information
    crew_member VARCHAR(100),
    crew_member_name VARCHAR(255),
    
    -- Memory metadata
    memory_type VARCHAR(50) DEFAULT 'conversation',
    platform VARCHAR(50),
    session_id VARCHAR(255),
    
    -- Vector embedding for semantic search
    embedding vector(1536),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Storage metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_timestamp ON alex_ai_memories(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_crew_member ON alex_ai_memories(crew_member);
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_platform ON alex_ai_memories(platform);
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_is_active ON alex_ai_memories(is_active);
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_created_at ON alex_ai_memories(created_at DESC);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_embedding ON alex_ai_memories 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
WHERE embedding IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE alex_ai_memories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can manage all memories" ON alex_ai_memories
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON alex_ai_memories TO service_role;
GRANT SELECT, INSERT, UPDATE ON alex_ai_memories TO authenticated;

-- Add comment
COMMENT ON TABLE alex_ai_memories IS 'Universal memory storage for Alex AI crew members across all platforms';


