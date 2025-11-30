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

