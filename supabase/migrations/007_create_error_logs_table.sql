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

