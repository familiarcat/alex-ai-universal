-- Task Progress Tracking Table
-- Stores real-time progress data for background tasks

CREATE TABLE IF NOT EXISTS task_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id TEXT UNIQUE NOT NULL,
    progress_data JSONB NOT NULL,
    status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_task_progress_task_id ON task_progress(task_id);
CREATE INDEX IF NOT EXISTS idx_task_progress_status ON task_progress(status);
CREATE INDEX IF NOT EXISTS idx_task_progress_updated_at ON task_progress(updated_at DESC);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_task_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_progress_updated_at
    BEFORE UPDATE ON task_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_task_progress_updated_at();

-- Enable RLS (optional - adjust based on your security needs)
-- ALTER TABLE task_progress ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE task_progress IS 'Real-time progress tracking for background tasks';
COMMENT ON COLUMN task_progress.task_id IS 'Unique identifier for the task';
COMMENT ON COLUMN task_progress.progress_data IS 'JSONB containing progress information (current, total, percentage, steps, etc.)';
COMMENT ON COLUMN task_progress.status IS 'Task status: running, completed, or failed';

