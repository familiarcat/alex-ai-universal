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

