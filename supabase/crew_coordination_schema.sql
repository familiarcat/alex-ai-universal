-- ============================================================================
-- CREW COORDINATION SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Purpose: Enable crew communication and learning independent of n8n webhooks
-- Pattern: Task queue → Execution → Response → Memory storage
-- ============================================================================

-- Drop existing tables if recreating
DROP TABLE IF EXISTS crew_responses CASCADE;
DROP TABLE IF EXISTS crew_tasks CASCADE;

-- ============================================================================
-- CREW TASKS TABLE
-- ============================================================================
-- Stores incoming coordination requests from any source
-- Status flow: pending → processing → completed/failed
-- ============================================================================

CREATE TABLE IF NOT EXISTS crew_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Task details
    query TEXT NOT NULL,
    context JSONB DEFAULT '{}'::jsonb,
    priority INTEGER DEFAULT 0,
    
    -- Routing
    crew_member_id TEXT,  -- NULL = auto-assign
    assigned_to TEXT,     -- Actual crew member who got it
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    execution_method TEXT,  -- 'webhook', 'ai', 'rag'
    error TEXT,
    
    -- Metadata
    source TEXT DEFAULT 'api',
    requester_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Indexes
    CONSTRAINT valid_priority CHECK (priority >= 0 AND priority <= 10)
);

-- Indexes for fast querying
CREATE INDEX idx_crew_tasks_status ON crew_tasks(status);
CREATE INDEX idx_crew_tasks_created ON crew_tasks(created_at DESC);
CREATE INDEX idx_crew_tasks_priority ON crew_tasks(priority DESC, created_at ASC);
CREATE INDEX idx_crew_tasks_assigned ON crew_tasks(assigned_to);

-- ============================================================================
-- CREW RESPONSES TABLE
-- ============================================================================
-- Stores crew member responses to tasks
-- One response per task (1:1 relationship)
-- ============================================================================

CREATE TABLE IF NOT EXISTS crew_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Links to task
    task_id UUID REFERENCES crew_tasks(id) ON DELETE CASCADE,
    
    -- Response details
    crew_member TEXT NOT NULL,
    response TEXT NOT NULL,
    
    -- Execution metadata
    execution_method TEXT NOT NULL,  -- 'webhook', 'ai', 'rag'
    execution_time_ms INTEGER,
    model_used TEXT,
    
    -- Quality metrics
    confidence_score DECIMAL(3,2),  -- 0.00 to 1.00
    tokens_used INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_task_response UNIQUE(task_id)
);

-- Indexes
CREATE INDEX idx_crew_responses_task ON crew_responses(task_id);
CREATE INDEX idx_crew_responses_crew ON crew_responses(crew_member);
CREATE INDEX idx_crew_responses_created ON crew_responses(created_at DESC);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- View: Pending tasks with priority
CREATE OR REPLACE VIEW pending_tasks_prioritized AS
SELECT 
    id,
    query,
    priority,
    crew_member_id,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at)) as age_seconds
FROM crew_tasks
WHERE status = 'pending'
ORDER BY priority DESC, created_at ASC;

-- View: Completed tasks with responses
CREATE OR REPLACE VIEW completed_tasks_with_responses AS
SELECT 
    t.id as task_id,
    t.query,
    t.assigned_to as crew_member,
    t.execution_method,
    r.response,
    r.execution_time_ms,
    t.created_at as requested_at,
    t.completed_at,
    EXTRACT(EPOCH FROM (t.completed_at - t.created_at)) as total_time_seconds
FROM crew_tasks t
JOIN crew_responses r ON t.id = r.task_id
WHERE t.status = 'completed'
ORDER BY t.completed_at DESC;

-- View: Crew performance metrics
CREATE OR REPLACE VIEW crew_performance_metrics AS
SELECT 
    t.assigned_to as crew_member,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE t.status = 'completed') as completed,
    COUNT(*) FILTER (WHERE t.status = 'failed') as failed,
    AVG(r.execution_time_ms) as avg_execution_ms,
    AVG(r.confidence_score) as avg_confidence,
    COUNT(*) FILTER (WHERE t.execution_method = 'webhook') as via_webhook,
    COUNT(*) FILTER (WHERE t.execution_method = 'ai') as via_ai,
    COUNT(*) FILTER (WHERE t.execution_method = 'rag') as via_rag
FROM crew_tasks t
LEFT JOIN crew_responses r ON t.id = r.task_id
WHERE t.assigned_to IS NOT NULL
GROUP BY t.assigned_to;

-- ============================================================================
-- FUNCTIONS FOR AUTOMATION
-- ============================================================================

-- Function: Auto-cleanup old completed tasks (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_tasks()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM crew_tasks
    WHERE status = 'completed'
    AND completed_at < NOW() - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get next task for execution (with priority)
CREATE OR REPLACE FUNCTION get_next_task()
RETURNS TABLE (
    task_id UUID,
    task_query TEXT,
    task_context JSONB,
    task_crew_member TEXT,
    task_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT id, query, context, crew_member_id, priority
    FROM crew_tasks
    WHERE status = 'pending'
    ORDER BY priority DESC, created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS for security
ALTER TABLE crew_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for service role (API calls)
CREATE POLICY "Allow service role full access to crew_tasks"
ON crew_tasks FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow service role full access to crew_responses"
ON crew_responses FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow anon key to read and insert (for public API)
CREATE POLICY "Allow anon read crew_tasks"
ON crew_tasks FOR SELECT
TO anon
USING (true);

CREATE POLICY "Allow anon insert crew_tasks"
ON crew_tasks FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Allow anon read crew_responses"
ON crew_responses FOR SELECT
TO anon
USING (true);

-- ============================================================================
-- SEED DATA (FOR TESTING)
-- ============================================================================

-- Insert test task
INSERT INTO crew_tasks (query, priority, crew_member_id)
VALUES 
    ('What is the status of the Alex AI Universal project?', 5, 'captain-picard'),
    ('Analyze the webhook registration failure', 8, 'commander-data'),
    ('How can we improve system resilience?', 6, NULL)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE crew_tasks IS 'Task queue for crew coordination system';
COMMENT ON TABLE crew_responses IS 'Crew member responses to tasks';
COMMENT ON COLUMN crew_tasks.status IS 'Task status: pending → processing → completed/failed';
COMMENT ON COLUMN crew_tasks.execution_method IS 'How task was executed: webhook, ai, or rag';
COMMENT ON COLUMN crew_responses.confidence_score IS 'AI confidence in response (0.00 to 1.00)';

-- ============================================================================
-- COMPLETION
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Crew coordination schema deployed successfully';
    RAISE NOTICE '📊 Tables created: crew_tasks, crew_responses';
    RAISE NOTICE '👁️  Views created: 3 analytical views';
    RAISE NOTICE '⚙️  Functions created: cleanup, get_next_task';
    RAISE NOTICE '🔒 RLS policies enabled';
    RAISE NOTICE '🎯 System ready for crew coordination';
END $$;

