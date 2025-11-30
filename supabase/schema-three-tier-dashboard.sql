-- 🖖 Three-Tier Dashboard Architecture - Supabase Schema
-- 
-- Crew Design: Team Alpha (Data + La Forge) + Team Epsilon (Data + Crusher)
-- Mission: Vector-based state storage with RBAC and tier isolation
--
-- Features:
-- - Vector storage for project state (semantic search)
-- - RBAC (Role-Based Access Control)
-- - Tier isolation (Main, Project, Published)
-- - Version tracking and conflict resolution
-- - Permission-based access control

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TIER 1: PROJECT STATE VECTORS (Vector Storage)
-- ============================================================================

-- Project state with vector embeddings for semantic search
CREATE TABLE IF NOT EXISTS project_state_vectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('main', 'project', 'published')),
  
  -- State content
  content JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  
  -- Vector embedding (for semantic search)
  state_vector vector(1536), -- OpenAI text-embedding-3-small dimension
  
  -- Version tracking
  version INTEGER NOT NULL DEFAULT 1,
  updated_at BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Conflict resolution
  last_sync_by TEXT,
  conflict_resolution TEXT CHECK (conflict_resolution IN ('client', 'server', 'merge')),
  
  -- User context (for Tier 2 - project dashboards)
  user_id TEXT,
  
  -- Constraints
  CONSTRAINT unique_project_version UNIQUE (project_id, version)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_state_vectors_project 
  ON project_state_vectors(project_id);

CREATE INDEX IF NOT EXISTS idx_project_state_vectors_tier 
  ON project_state_vectors(tier);

CREATE INDEX IF NOT EXISTS idx_project_state_vectors_user 
  ON project_state_vectors(user_id) WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_project_state_vectors_version 
  ON project_state_vectors(project_id, version DESC);

-- Vector similarity search index (HNSW for fast approximate search)
CREATE INDEX IF NOT EXISTS idx_project_state_vectors_vector 
  ON project_state_vectors USING hnsw (state_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Full text search on content
CREATE INDEX IF NOT EXISTS idx_project_state_vectors_content_search 
  ON project_state_vectors USING gin(content);

-- ============================================================================
-- TIER 2: RBAC (Role-Based Access Control)
-- ============================================================================

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  project_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'project_owner', 'project_editor', 'project_viewer', 'public')),
  tier TEXT NOT NULL CHECK (tier IN ('main', 'project', 'published')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by TEXT,
  expires_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_user_project_role UNIQUE (user_id, project_id, role, tier)
);

-- Indexes for RBAC
CREATE INDEX IF NOT EXISTS idx_user_roles_user 
  ON user_roles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_project 
  ON user_roles(project_id) WHERE project_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_roles_tier 
  ON user_roles(tier);

CREATE INDEX IF NOT EXISTS idx_user_roles_role 
  ON user_roles(role);

-- ============================================================================
-- TIER 3: PERMISSIONS (Project-level permissions)
-- ============================================================================

-- Project permissions table
CREATE TABLE IF NOT EXISTS project_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('main', 'project', 'published')),
  
  -- Permission sets
  read_users TEXT[] DEFAULT '{}',
  write_users TEXT[] DEFAULT '{}',
  admin_users TEXT[] DEFAULT '{}',
  
  -- Public access (for Tier 3 - published sites)
  public_read BOOLEAN DEFAULT false,
  public_write BOOLEAN DEFAULT false,
  
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_project_permissions UNIQUE (project_id, tier)
);

-- Indexes for permissions
CREATE INDEX IF NOT EXISTS idx_project_permissions_project 
  ON project_permissions(project_id);

CREATE INDEX IF NOT EXISTS idx_project_permissions_tier 
  ON project_permissions(tier);

-- ============================================================================
-- SYNC LOG (Track synchronization operations)
-- ============================================================================

-- Sync operation log
CREATE TABLE IF NOT EXISTS sync_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  sync_action TEXT NOT NULL CHECK (sync_action IN ('push', 'pull', 'merge', 'no_action')),
  sync_result TEXT NOT NULL CHECK (sync_result IN ('success', 'conflict', 'error')),
  version INTEGER NOT NULL,
  conflict_resolution TEXT,
  user_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  duration_ms INTEGER,
  error_message TEXT
);

-- Indexes for sync log
CREATE INDEX IF NOT EXISTS idx_sync_log_project 
  ON sync_log(project_id);

CREATE INDEX IF NOT EXISTS idx_sync_log_timestamp 
  ON sync_log(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_sync_log_result 
  ON sync_log(sync_result);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE project_state_vectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_state_vectors
-- Users can read their own project states or projects they have access to
CREATE POLICY "Users can read accessible project states"
  ON project_state_vectors FOR SELECT
  USING (
    -- Tier 1 (Main): Admin only
    (tier = 'main' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = current_setting('app.user_id', true)
      AND role = 'admin'
      AND tier = 'main'
    ))
    OR
    -- Tier 2 (Project): User has read/write/admin role
    (tier = 'project' AND (
      user_id = current_setting('app.user_id', true)
      OR EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = current_setting('app.user_id', true)
        AND project_id = project_state_vectors.project_id
        AND role IN ('project_owner', 'project_editor', 'project_viewer')
      )
    ))
    OR
    -- Tier 3 (Published): Public read
    (tier = 'published' AND EXISTS (
      SELECT 1 FROM project_permissions 
      WHERE project_id = project_state_vectors.project_id
      AND tier = 'published'
      AND public_read = true
    ))
  );

-- Users can write to projects they have write/admin access to
CREATE POLICY "Users can write to accessible projects"
  ON project_state_vectors FOR INSERT
  WITH CHECK (
    -- Tier 1: Admin only
    (tier = 'main' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = current_setting('app.user_id', true)
      AND role = 'admin'
      AND tier = 'main'
    ))
    OR
    -- Tier 2: User has write/admin role
    (tier = 'project' AND (
      user_id = current_setting('app.user_id', true)
      OR EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = current_setting('app.user_id', true)
        AND project_id = project_state_vectors.project_id
        AND role IN ('project_owner', 'project_editor')
      )
    ))
    OR
    -- Tier 3: No writes (read-only)
    false
  );

-- RLS Policies for user_roles (admin can manage)
CREATE POLICY "Admins can manage user roles"
  ON user_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = current_setting('app.user_id', true)
      AND role = 'admin'
      AND tier = 'main'
    )
  );

-- RLS Policies for project_permissions
CREATE POLICY "Admins and project owners can manage permissions"
  ON project_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = current_setting('app.user_id', true)
      AND (
        (role = 'admin' AND tier = 'main')
        OR (role = 'project_owner' AND project_id = project_permissions.project_id)
      )
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Get latest project state
CREATE OR REPLACE FUNCTION get_latest_project_state(
  p_project_id TEXT,
  p_tier TEXT DEFAULT NULL,
  p_user_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  project_id TEXT,
  tier TEXT,
  content JSONB,
  metadata JSONB,
  version INTEGER,
  updated_at BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.id,
    ps.project_id,
    ps.tier,
    ps.content,
    ps.metadata,
    ps.version,
    ps.updated_at
  FROM project_state_vectors ps
  WHERE ps.project_id = p_project_id
    AND (p_tier IS NULL OR ps.tier = p_tier)
    AND (p_user_id IS NULL OR ps.user_id = p_user_id)
  ORDER BY ps.version DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check user permission
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id TEXT,
  p_project_id TEXT,
  p_tier TEXT,
  p_permission TEXT -- 'read', 'write', 'admin'
)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN := false;
BEGIN
  -- Check user roles
  SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = p_user_id
      AND (ur.project_id = p_project_id OR ur.project_id IS NULL)
      AND ur.tier = p_tier
      AND (
        (p_permission = 'read' AND ur.role IN ('admin', 'project_owner', 'project_editor', 'project_viewer'))
        OR (p_permission = 'write' AND ur.role IN ('admin', 'project_owner', 'project_editor'))
        OR (p_permission = 'admin' AND ur.role = 'admin')
      )
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
  ) INTO has_permission;
  
  -- Check project permissions (for public access)
  IF NOT has_permission AND p_tier = 'published' AND p_permission = 'read' THEN
    SELECT EXISTS (
      SELECT 1 FROM project_permissions pp
      WHERE pp.project_id = p_project_id
        AND pp.tier = 'published'
        AND pp.public_read = true
    ) INTO has_permission;
  END IF;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE project_state_vectors IS 'Vector-based storage for project state across three tiers';
COMMENT ON TABLE user_roles IS 'Role-Based Access Control for three-tier dashboard system';
COMMENT ON TABLE project_permissions IS 'Project-level permissions for access control';
COMMENT ON TABLE sync_log IS 'Log of all synchronization operations for monitoring and debugging';

COMMENT ON FUNCTION get_latest_project_state IS 'Get the latest version of project state for a given project and tier';
COMMENT ON FUNCTION check_user_permission IS 'Check if a user has a specific permission for a project and tier';

