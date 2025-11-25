-- Migration: Create authorized_users table for authentication whitelist
-- Supports both development and production modes
-- Reviewed by: Lieutenant Worf (Security) & Commander Data (Implementation)

CREATE TABLE IF NOT EXISTS authorized_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  active BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'user',
  development_only BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false, -- For production: requires email verification
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validation
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'user', 'viewer'))
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_authorized_users_email ON authorized_users(email);
CREATE INDEX IF NOT EXISTS idx_authorized_users_active ON authorized_users(active) WHERE active = true;

-- Row Level Security (RLS) Policies
ALTER TABLE authorized_users ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything (for API access)
CREATE POLICY "Service role has full access"
  ON authorized_users
  FOR ALL
  USING (auth.role() = 'service_role');

-- Policy: Authenticated users can read their own record
CREATE POLICY "Users can read their own authorization"
  ON authorized_users
  FOR SELECT
  USING (auth.uid()::text = (SELECT id::text FROM auth.users WHERE email = authorized_users.email LIMIT 1));

-- Trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_authorized_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_authorized_users_timestamp
  BEFORE UPDATE ON authorized_users
  FOR EACH ROW
  EXECUTE FUNCTION update_authorized_users_updated_at();

-- Insert development admin user (only if not exists)
-- ⚠️ DEVELOPMENT ONLY - Must be removed or changed for production
INSERT INTO authorized_users (email, active, role, development_only, verified)
VALUES (
  'admin@alex-ai.local',
  true,
  'admin',
  true, -- Development only flag
  true  -- Auto-verified for development
)
ON CONFLICT (email) DO UPDATE
SET 
  active = true,
  development_only = true,
  verified = true;

-- Comment for documentation
COMMENT ON TABLE authorized_users IS 'User whitelist for authentication. Only users in this table can sign in.';
COMMENT ON COLUMN authorized_users.development_only IS 'If true, this user is only valid in development mode';
COMMENT ON COLUMN authorized_users.verified IS 'If true, user email is verified (required for production)';

