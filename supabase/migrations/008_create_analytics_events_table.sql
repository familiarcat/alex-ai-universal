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

