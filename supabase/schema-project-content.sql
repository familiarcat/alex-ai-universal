-- Project Content Storage Schema
-- Proper DDD: Client <=> n8n <=> Supabase
-- Stores user-generated content (NOT AI templates)

-- Main project content table
CREATE TABLE IF NOT EXISTS project_content (
  -- Primary identification
  project_id TEXT PRIMARY KEY,
  
  -- Core user content
  headline TEXT NOT NULL,
  subheadline TEXT,
  description TEXT,
  
  -- Theme and metadata
  theme TEXT DEFAULT 'gradient',
  business_type TEXT,
  
  -- Structured content (JSONB for flexibility)
  components JSONB DEFAULT '[]'::jsonb,
  pages JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  updated_at BIGINT NOT NULL, -- Client timestamp (Date.now())
  synced_at TIMESTAMPTZ DEFAULT NOW(), -- Server timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Version control (for conflict resolution)
  version INTEGER DEFAULT 1,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_content_updated_at ON project_content(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_content_synced_at ON project_content(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_content_business_type ON project_content(business_type);
CREATE INDEX IF NOT EXISTS idx_project_content_theme ON project_content(theme);
CREATE INDEX IF NOT EXISTS idx_project_content_deleted_at ON project_content(deleted_at) WHERE deleted_at IS NULL;

-- Row Level Security (RLS)
ALTER TABLE project_content ENABLE ROW LEVEL SECURITY;

-- Policy: Allow n8n to read/write (using service role key)
CREATE POLICY IF NOT EXISTS "Allow n8n service role full access"
  ON project_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Project content changelog (audit log)
CREATE TABLE IF NOT EXISTS project_content_changelog (
  id BIGSERIAL PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES project_content(project_id) ON DELETE CASCADE,
  
  -- What changed
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  changed_fields JSONB, -- Which fields were modified
  old_values JSONB, -- Previous values
  new_values JSONB, -- New values
  
  -- Who/when/where
  source TEXT DEFAULT 'dashboard', -- 'dashboard', 'api', 'migration'
  user_agent TEXT,
  ip_address INET,
  
  -- Timestamps
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for changelog queries
CREATE INDEX IF NOT EXISTS idx_changelog_project_id ON project_content_changelog(project_id);
CREATE INDEX IF NOT EXISTS idx_changelog_changed_at ON project_content_changelog(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_changelog_action ON project_content_changelog(action);

-- Function: Automatically update version on content change
CREATE OR REPLACE FUNCTION increment_project_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.synced_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Increment version on update
DROP TRIGGER IF EXISTS trigger_increment_project_version ON project_content;
CREATE TRIGGER trigger_increment_project_version
  BEFORE UPDATE ON project_content
  FOR EACH ROW
  EXECUTE FUNCTION increment_project_version();

-- Function: Log changes to changelog
CREATE OR REPLACE FUNCTION log_project_content_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields_json JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO project_content_changelog (project_id, action, new_values)
    VALUES (NEW.project_id, 'create', row_to_json(NEW)::jsonb);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log if content actually changed (not just timestamps)
    IF (OLD.headline, OLD.subheadline, OLD.description, OLD.theme, OLD.components, OLD.pages) IS DISTINCT FROM
       (NEW.headline, NEW.subheadline, NEW.description, NEW.theme, NEW.components, NEW.pages) THEN
      INSERT INTO project_content_changelog (project_id, action, old_values, new_values)
      VALUES (NEW.project_id, 'update', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO project_content_changelog (project_id, action, old_values)
    VALUES (OLD.project_id, 'delete', row_to_json(OLD)::jsonb);
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Log all changes
DROP TRIGGER IF EXISTS trigger_log_project_content_changes ON project_content;
CREATE TRIGGER trigger_log_project_content_changes
  AFTER INSERT OR UPDATE OR DELETE ON project_content
  FOR EACH ROW
  EXECUTE FUNCTION log_project_content_changes();

-- View: Active projects (not deleted)
CREATE OR REPLACE VIEW active_projects AS
SELECT * FROM project_content
WHERE deleted_at IS NULL
ORDER BY synced_at DESC;

-- View: Recent changes (last 100)
CREATE OR REPLACE VIEW recent_project_changes AS
SELECT 
  c.project_id,
  p.headline,
  c.action,
  c.changed_at,
  c.source
FROM project_content_changelog c
LEFT JOIN project_content p ON c.project_id = p.project_id
ORDER BY c.changed_at DESC
LIMIT 100;

-- Grant permissions to n8n service role
GRANT ALL ON project_content TO service_role;
GRANT ALL ON project_content_changelog TO service_role;
GRANT ALL ON active_projects TO service_role;
GRANT ALL ON recent_project_changes TO service_role;

-- Comments for documentation
COMMENT ON TABLE project_content IS 'User-generated project content (NOT AI templates). Synced via n8n webhooks.';
COMMENT ON COLUMN project_content.project_id IS 'Unique project identifier (e.g., project_1234567890_abc12)';
COMMENT ON COLUMN project_content.components IS 'User-created components (hero, features, testimonials, etc.)';
COMMENT ON COLUMN project_content.pages IS 'Custom page content (about, pricing, etc.)';
COMMENT ON COLUMN project_content.version IS 'Incremented on each update for conflict resolution';
COMMENT ON TABLE project_content_changelog IS 'Audit log of all project content changes';

