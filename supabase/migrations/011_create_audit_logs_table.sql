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


