-- Migration: Create Project Templates System
-- Master Dashboard + Project-Specific Dashboard Architecture
-- Date: November 27, 2025
-- Crew: Data (Architecture) + La Forge (Implementation)

-- ============================================================================
-- 1. CREATE PROJECT_TEMPLATES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_templates (
  -- Primary key
  template_id TEXT PRIMARY KEY,
  
  -- Template metadata
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('business', 'creative', 'ecommerce', 'saas')),
  version TEXT NOT NULL DEFAULT '1.0.0',
  
  -- Template configuration (JSONB for flexibility)
  base_config JSONB NOT NULL DEFAULT '{}', -- Default project config (headline, subheadline, theme, etc.)
  base_components JSONB NOT NULL DEFAULT '[]', -- Default components array
  default_theme TEXT DEFAULT 'midnight',
  
  -- Variation control
  variation_fields JSONB DEFAULT '[]', -- Fields that CAN be customized (whitelist)
  locked_fields JSONB DEFAULT '[]', -- Fields that CANNOT be customized (blacklist)
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  -- Constraints
  CONSTRAINT valid_template_id CHECK (length(template_id) > 0),
  CONSTRAINT valid_template_name CHECK (length(name) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_type ON project_templates(type) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_templates_active ON project_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_updated ON project_templates(updated_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active templates
CREATE POLICY "Public can read active templates"
  ON project_templates
  FOR SELECT
  USING (is_active = true);

-- Allow authenticated users to manage templates
CREATE POLICY "Authenticated users can manage templates"
  ON project_templates
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger to auto-update updated_at timestamp
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON project_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. ENHANCE PROJECTS TABLE WITH TEMPLATE SUPPORT
-- ============================================================================

-- Add template-related columns to projects table
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS template_id TEXT REFERENCES project_templates(template_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS template_version TEXT,
  ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '{}', -- Only fields that differ from template
  ADD COLUMN IF NOT EXISTS template_customizations JSONB DEFAULT '{}'; -- Template overrides

-- Index for template lookups
CREATE INDEX IF NOT EXISTS idx_projects_template ON projects(template_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_template_version ON projects(template_id, template_version) WHERE deleted_at IS NULL;

-- ============================================================================
-- 3. INSERT DEFAULT TEMPLATES
-- ============================================================================

-- Business Starter Template
INSERT INTO project_templates (
  template_id,
  name,
  description,
  type,
  version,
  base_config,
  base_components,
  default_theme,
  variation_fields,
  locked_fields
) VALUES (
  'business-starter-v1',
  'Business Starter',
  'Standard business website template with hero, features, testimonials, and CTA sections',
  'business',
  '1.0.0',
  '{
    "headline": "Welcome to [Project Name]",
    "subheadline": "Your business solution",
    "description": "Professional business website with modern design",
    "theme": "midnight",
    "project_type": "business"
  }'::jsonb,
  '[
    {
      "id": "hero-default",
      "title": "Hero Section",
      "body": "Welcome to our business",
      "role": "hero",
      "priority": 5,
      "intent": "acquire",
      "tone": "professional"
    },
    {
      "id": "features-default",
      "title": "Features",
      "body": "Our key features",
      "role": "feature",
      "priority": 4,
      "intent": "educate",
      "tone": "professional"
    },
    {
      "id": "testimonials-default",
      "title": "Testimonials",
      "body": "What our clients say",
      "role": "testimonial",
      "priority": 3,
      "intent": "trust",
      "tone": "professional"
    },
    {
      "id": "cta-default",
      "title": "Call to Action",
      "body": "Get started today",
      "role": "cta",
      "priority": 5,
      "intent": "convert",
      "tone": "bold"
    }
  ]'::jsonb,
  'midnight',
  '["headline", "subheadline", "description", "theme", "components"]'::jsonb,
  '[]'::jsonb
) ON CONFLICT (template_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_config = EXCLUDED.base_config,
  base_components = EXCLUDED.base_components,
  updated_at = NOW();

-- Creative Portfolio Template
INSERT INTO project_templates (
  template_id,
  name,
  description,
  type,
  version,
  base_config,
  base_components,
  default_theme,
  variation_fields,
  locked_fields
) VALUES (
  'creative-portfolio-v1',
  'Creative Portfolio',
  'Creative portfolio template with galleries, narratives, and media showcases',
  'creative',
  '1.0.0',
  '{
    "headline": "Creative Portfolio",
    "subheadline": "Showcasing creative work",
    "description": "Beautiful portfolio for creative professionals",
    "theme": "gradient",
    "project_type": "creative"
  }'::jsonb,
  '[
    {
      "id": "gallery-default",
      "title": "Gallery",
      "body": "Featured work",
      "role": "gallery",
      "priority": 5,
      "intent": "delight",
      "tone": "playful"
    },
    {
      "id": "narrative-default",
      "title": "Story",
      "body": "About the work",
      "role": "content",
      "priority": 4,
      "intent": "educate",
      "tone": "calm"
    }
  ]'::jsonb,
  'gradient',
  '["headline", "subheadline", "description", "theme", "components"]'::jsonb,
  '[]'::jsonb
) ON CONFLICT (template_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  base_config = EXCLUDED.base_config,
  base_components = EXCLUDED.base_components,
  updated_at = NOW();

-- ============================================================================
-- 4. UPDATE EXISTING PROJECTS WITH DEFAULT TEMPLATE
-- ============================================================================

-- Assign business-starter template to existing business projects
UPDATE projects
SET 
  template_id = 'business-starter-v1',
  template_version = '1.0.0',
  variations = '{}'::jsonb
WHERE project_type = 'business' 
  AND template_id IS NULL
  AND deleted_at IS NULL;

-- Assign creative-portfolio template to existing creative projects
UPDATE projects
SET 
  template_id = 'creative-portfolio-v1',
  template_version = '1.0.0',
  variations = '{}'::jsonb
WHERE project_type = 'creative' 
  AND template_id IS NULL
  AND deleted_at IS NULL;

-- ============================================================================
-- 5. VERIFY MIGRATION
-- ============================================================================

-- Verify templates were created
SELECT template_id, name, type, version, is_active 
FROM project_templates 
ORDER BY type, name;

-- Verify projects have templates assigned
SELECT project_id, template_id, template_version, 
       CASE WHEN variations = '{}'::jsonb THEN 'No variations' ELSE 'Has variations' END as variation_status
FROM projects 
WHERE deleted_at IS NULL
ORDER BY project_id;

