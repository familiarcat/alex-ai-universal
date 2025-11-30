-- Alex AI Universal - RAG-Based Documentation System Schema
-- Living documentation stored in Supabase for semantic search and auto-generation
-- Created: January 18, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Documentation Types Enum
CREATE TYPE doc_type AS ENUM (
    'getting_started',
    'installation',
    'configuration',
    'architecture',
    'api_reference',
    'integration_guide',
    'user_guide',
    'developer_guide',
    'contributor_guide',
    'troubleshooting',
    'deployment',
    'security',
    'testing',
    'best_practices',
    'changelog',
    'release_notes'
);

-- Audience Types Enum
CREATE TYPE audience_type AS ENUM (
    'user',
    'developer',
    'contributor',
    'enterprise',
    'integrator',
    'maintainer',
    'all'
);

-- Relationship Types Enum
CREATE TYPE relationship_type AS ENUM (
    'depends_on',
    'communicates_with',
    'extends',
    'implements',
    'uses',
    'provides',
    'integrates_with',
    'deployed_to'
);

-- ============================================================================
-- DOCUMENTATION KNOWLEDGE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS documentation_knowledge (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Classification
    doc_type doc_type NOT NULL,
    audience audience_type NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    
    -- Content
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    code_examples JSONB DEFAULT '[]',
    
    -- Relationships
    related_docs UUID[] DEFAULT '{}',
    prerequisites UUID[] DEFAULT '{}',
    see_also UUID[] DEFAULT '{}',
    
    -- Visual Content
    mermaid_diagrams JSONB DEFAULT '[]',
    system_relationships JSONB DEFAULT '{}',
    diagrams_metadata JSONB DEFAULT '{}',
    
    -- Metadata
    keywords TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    estimated_read_time INTEGER, -- minutes
    
    -- Vector Search
    semantic_text TEXT NOT NULL,
    vector_embedding VECTOR(1536),
    
    -- Versioning
    version VARCHAR(20) DEFAULT '1.0.0',
    is_current BOOLEAN DEFAULT TRUE,
    deprecated BOOLEAN DEFAULT FALSE,
    superseded_by UUID REFERENCES documentation_knowledge(id),
    
    -- Source Tracking
    source_type VARCHAR(50), -- 'crew_memory', 'milestone', 'manual', 'generated', 'code_analysis'
    source_id UUID,
    source_file VARCHAR(500),
    created_by VARCHAR(50),
    
    -- Quality Metrics
    view_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    helpfulness_score DECIMAL(3,2) DEFAULT 0.0 CHECK (helpfulness_score >= 0.0 AND helpfulness_score <= 5.0),
    feedback_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SYSTEM RELATIONSHIPS TABLE (for Mermaid diagram generation)
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Relationship Definition
    source_component VARCHAR(200) NOT NULL,
    target_component VARCHAR(200) NOT NULL,
    relationship_type relationship_type NOT NULL,
    
    -- Details
    description TEXT,
    direction VARCHAR(20) DEFAULT 'unidirectional', -- 'unidirectional', 'bidirectional'
    protocol VARCHAR(100), -- 'REST', 'WebSocket', 'GraphQL', 'N8N', 'SQL', etc.
    data_format VARCHAR(100), -- 'JSON', 'XML', 'Binary', 'Text', etc.
    
    -- Architecture Layers
    source_layer VARCHAR(50), -- 'frontend', 'api', 'integration', 'database'
    target_layer VARCHAR(50),
    
    -- Metadata
    is_critical BOOLEAN DEFAULT FALSE,
    is_async BOOLEAN DEFAULT FALSE,
    avg_latency_ms INTEGER,
    
    -- For Mermaid Generation
    mermaid_style VARCHAR(50) DEFAULT 'solid', -- 'solid', 'dashed', 'dotted', 'thick'
    diagram_group VARCHAR(100), -- Groups components in subgraphs
    
    -- Source Tracking
    discovered_from VARCHAR(100), -- 'code_analysis', 'manual', 'crew_memory'
    confidence_level INTEGER DEFAULT 80 CHECK (confidence_level >= 0 AND confidence_level <= 100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(source_component, target_component, relationship_type)
);

-- ============================================================================
-- DOCUMENTATION GENERATIONS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS documentation_generations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Generation Details
    doc_type doc_type NOT NULL,
    audience audience_type NOT NULL,
    query TEXT NOT NULL,
    rag_sources UUID[] DEFAULT '{}',
    relationship_sources UUID[] DEFAULT '{}',
    
    -- Output
    generated_content TEXT,
    mermaid_diagrams JSONB DEFAULT '[]',
    file_path VARCHAR(500),
    
    -- Quality Metrics
    relevance_score DECIMAL(3,2) CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
    completeness_score DECIMAL(3,2) CHECK (completeness_score >= 0.0 AND completeness_score <= 1.0),
    source_count INTEGER,
    
    -- User Feedback
    user_feedback TEXT,
    was_helpful BOOLEAN,
    improvement_suggestions TEXT[],
    
    -- Performance
    generation_time_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DOCUMENTATION FEEDBACK
-- ============================================================================

CREATE TABLE IF NOT EXISTS documentation_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Reference
    doc_knowledge_id UUID REFERENCES documentation_knowledge(id) ON DELETE CASCADE,
    generated_doc_id UUID REFERENCES documentation_generations(id) ON DELETE CASCADE,
    
    -- Feedback
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    was_helpful BOOLEAN,
    feedback_text TEXT,
    improvement_areas TEXT[],
    
    -- Context
    user_role audience_type,
    use_case TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- COMPONENT INVENTORY (for architecture diagrams)
-- ============================================================================

CREATE TABLE IF NOT EXISTS component_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Component Identity
    component_name VARCHAR(200) NOT NULL UNIQUE,
    component_type VARCHAR(100) NOT NULL, -- 'frontend', 'api', 'service', 'database', 'integration'
    
    -- Technical Details
    technology VARCHAR(100), -- 'React', 'Next.js', 'Supabase', 'N8N'
    repository_path VARCHAR(500),
    entry_point VARCHAR(500),
    
    -- Architecture
    layer VARCHAR(50) NOT NULL,
    diagram_group VARCHAR(100),
    
    -- Description
    description TEXT,
    purpose TEXT,
    key_features TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_critical BOOLEAN DEFAULT FALSE,
    deployment_status VARCHAR(50), -- 'deployed', 'development', 'deprecated'
    
    -- Metadata
    owner VARCHAR(100),
    documentation_url VARCHAR(500),
    
    -- Discovery
    discovered_from VARCHAR(100),
    last_verified TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MERMAID DIAGRAM TEMPLATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS mermaid_diagram_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Template Identity
    template_name VARCHAR(200) NOT NULL UNIQUE,
    diagram_type VARCHAR(50) NOT NULL, -- 'graph', 'sequence', 'state', 'class', 'er'
    
    -- Template
    template_code TEXT NOT NULL,
    description TEXT,
    
    -- Usage
    applicable_doc_types doc_type[],
    complexity_level INTEGER CHECK (complexity_level >= 1 AND complexity_level <= 5),
    
    -- Variables
    required_variables TEXT[],
    optional_variables TEXT[],
    
    -- Examples
    example_usage TEXT,
    example_output TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Documentation Knowledge Indexes
CREATE INDEX idx_doc_knowledge_type ON documentation_knowledge(doc_type);
CREATE INDEX idx_doc_knowledge_audience ON documentation_knowledge(audience);
CREATE INDEX idx_doc_knowledge_category ON documentation_knowledge(category);
CREATE INDEX idx_doc_knowledge_current ON documentation_knowledge(is_current) WHERE is_current = TRUE;
CREATE INDEX idx_doc_knowledge_deprecated ON documentation_knowledge(deprecated) WHERE deprecated = FALSE;
CREATE INDEX idx_doc_knowledge_vector ON documentation_knowledge USING ivfflat (vector_embedding vector_cosine_ops);
CREATE INDEX idx_doc_knowledge_helpfulness ON documentation_knowledge(helpfulness_score DESC);
CREATE INDEX idx_doc_knowledge_views ON documentation_knowledge(view_count DESC);

-- Full-text search indexes
CREATE INDEX idx_doc_knowledge_fts ON documentation_knowledge USING gin(to_tsvector('english', semantic_text));
CREATE INDEX idx_doc_knowledge_title_fts ON documentation_knowledge USING gin(to_tsvector('english', title));
CREATE INDEX idx_doc_knowledge_content_fts ON documentation_knowledge USING gin(to_tsvector('english', content));

-- Array indexes
CREATE INDEX idx_doc_knowledge_keywords ON documentation_knowledge USING gin(keywords);
CREATE INDEX idx_doc_knowledge_tags ON documentation_knowledge USING gin(tags);

-- System Relationships Indexes
CREATE INDEX idx_relationships_source ON system_relationships(source_component);
CREATE INDEX idx_relationships_target ON system_relationships(target_component);
CREATE INDEX idx_relationships_type ON system_relationships(relationship_type);
CREATE INDEX idx_relationships_layer ON system_relationships(source_layer, target_layer);
CREATE INDEX idx_relationships_critical ON system_relationships(is_critical) WHERE is_critical = TRUE;

-- Documentation Generations Indexes
CREATE INDEX idx_doc_generations_type ON documentation_generations(doc_type);
CREATE INDEX idx_doc_generations_audience ON documentation_generations(audience);
CREATE INDEX idx_doc_generations_timestamp ON documentation_generations(timestamp DESC);
CREATE INDEX idx_doc_generations_helpful ON documentation_generations(was_helpful) WHERE was_helpful = TRUE;

-- Component Inventory Indexes
CREATE INDEX idx_components_type ON component_inventory(component_type);
CREATE INDEX idx_components_layer ON component_inventory(layer);
CREATE INDEX idx_components_active ON component_inventory(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_components_critical ON component_inventory(is_critical) WHERE is_critical = TRUE;

-- ============================================================================
-- FUNCTIONS FOR DOCUMENTATION GENERATION
-- ============================================================================

-- Function: Search documentation knowledge semantically
CREATE OR REPLACE FUNCTION search_documentation_knowledge(
    query_embedding VECTOR(1536),
    p_doc_type doc_type DEFAULT NULL,
    p_audience audience_type DEFAULT NULL,
    p_category VARCHAR DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    summary TEXT,
    content TEXT,
    doc_type doc_type,
    audience audience_type,
    similarity FLOAT,
    mermaid_diagrams JSONB,
    code_examples JSONB,
    keywords TEXT[],
    helpfulness_score DECIMAL
)
LANGUAGE SQL
AS $$
    SELECT
        dk.id,
        dk.title,
        dk.summary,
        dk.content,
        dk.doc_type,
        dk.audience,
        1 - (dk.vector_embedding <=> query_embedding) AS similarity,
        dk.mermaid_diagrams,
        dk.code_examples,
        dk.keywords,
        dk.helpfulness_score
    FROM documentation_knowledge dk
    WHERE 1 - (dk.vector_embedding <=> query_embedding) > match_threshold
        AND dk.is_current = TRUE
        AND dk.deprecated = FALSE
        AND (p_doc_type IS NULL OR dk.doc_type = p_doc_type)
        AND (p_audience IS NULL OR dk.audience = p_audience OR dk.audience = 'all')
        AND (p_category IS NULL OR dk.category = p_category)
    ORDER BY dk.vector_embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function: Get component relationships for Mermaid diagram
CREATE OR REPLACE FUNCTION get_component_relationships(
    p_layer VARCHAR DEFAULT NULL,
    p_diagram_group VARCHAR DEFAULT NULL,
    include_non_critical BOOLEAN DEFAULT TRUE
)
RETURNS TABLE (
    source_component VARCHAR,
    target_component VARCHAR,
    relationship_type relationship_type,
    protocol VARCHAR,
    source_layer VARCHAR,
    target_layer VARCHAR,
    is_critical BOOLEAN,
    mermaid_style VARCHAR
)
LANGUAGE SQL
AS $$
    SELECT
        sr.source_component,
        sr.target_component,
        sr.relationship_type,
        sr.protocol,
        sr.source_layer,
        sr.target_layer,
        sr.is_critical,
        sr.mermaid_style
    FROM system_relationships sr
    WHERE (p_layer IS NULL OR sr.source_layer = p_layer OR sr.target_layer = p_layer)
        AND (p_diagram_group IS NULL OR sr.diagram_group = p_diagram_group)
        AND (include_non_critical = TRUE OR sr.is_critical = TRUE)
    ORDER BY sr.is_critical DESC, sr.source_component;
$$;

-- Function: Get active components for diagram
CREATE OR REPLACE FUNCTION get_active_components(
    p_layer VARCHAR DEFAULT NULL,
    p_component_type VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    component_name VARCHAR,
    component_type VARCHAR,
    layer VARCHAR,
    diagram_group VARCHAR,
    description TEXT,
    is_critical BOOLEAN
)
LANGUAGE SQL
AS $$
    SELECT
        ci.component_name,
        ci.component_type,
        ci.layer,
        ci.diagram_group,
        ci.description,
        ci.is_critical
    FROM component_inventory ci
    WHERE ci.is_active = TRUE
        AND (p_layer IS NULL OR ci.layer = p_layer)
        AND (p_component_type IS NULL OR ci.component_type = p_component_type)
    ORDER BY ci.layer, ci.component_name;
$$;

-- Function: Update documentation helpfulness score
CREATE OR REPLACE FUNCTION update_documentation_helpfulness(
    p_doc_id UUID,
    p_rating INTEGER,
    p_was_helpful BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_score DECIMAL(3,2);
    v_current_count INTEGER;
    v_new_score DECIMAL(3,2);
BEGIN
    -- Get current metrics
    SELECT helpfulness_score, feedback_count
    INTO v_current_score, v_current_count
    FROM documentation_knowledge
    WHERE id = p_doc_id;
    
    -- Calculate new average score
    v_new_score := ((v_current_score * v_current_count) + p_rating) / (v_current_count + 1);
    
    -- Update documentation
    UPDATE documentation_knowledge
    SET 
        helpfulness_score = v_new_score,
        feedback_count = v_current_count + 1,
        last_accessed = NOW(),
        view_count = view_count + 1
    WHERE id = p_doc_id;
END;
$$;

-- Function: Increment documentation view count
CREATE OR REPLACE FUNCTION increment_doc_view_count(p_doc_id UUID)
RETURNS VOID
LANGUAGE SQL
AS $$
    UPDATE documentation_knowledge
    SET 
        view_count = view_count + 1,
        last_accessed = NOW()
    WHERE id = p_doc_id;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Update updated_at on modification
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_doc_knowledge_updated_at BEFORE UPDATE ON documentation_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE ON system_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_components_updated_at BEFORE UPDATE ON component_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE documentation_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE mermaid_diagram_templates ENABLE ROW LEVEL SECURITY;

-- Read access for authenticated users
CREATE POLICY "Allow read access to documentation" ON documentation_knowledge
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow read access to relationships" ON system_relationships
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow read access to components" ON component_inventory
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

CREATE POLICY "Allow read access to templates" ON mermaid_diagram_templates
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');

-- Service role full access (for N8N and automation)
CREATE POLICY "Allow service role full access to documentation" ON documentation_knowledge
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to relationships" ON system_relationships
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to generations" ON documentation_generations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to feedback" ON documentation_feedback
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to components" ON component_inventory
    FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated users to submit feedback
CREATE POLICY "Allow users to submit feedback" ON documentation_feedback
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- INITIAL DATA POPULATION
-- ============================================================================

-- Insert initial component inventory
INSERT INTO component_inventory (component_name, component_type, layer, diagram_group, description, is_critical, technology) VALUES
('LCARS Library Terminal', 'frontend', 'frontend', 'User Interface', 'Personal LCARS terminal for crew members to access shared knowledge', TRUE, 'React/TypeScript'),
('Shared Library Computer System', 'service', 'api', 'Core Services', 'Central intelligence system managing all crew memories', TRUE, 'TypeScript'),
('Crew Memory API', 'api', 'api', 'API Layer', 'RESTful API for crew memory management', TRUE, 'Next.js API Routes'),
('N8N Workflows', 'integration', 'integration', 'Integration Layer', 'Workflow automation and processing', TRUE, 'N8N'),
('Supabase Vector Memory', 'database', 'database', 'Data Layer', 'Vector storage for semantic search', TRUE, 'Supabase pgvector'),
('OpenAI Embeddings', 'integration', 'integration', 'AI Services', 'Vector embedding generation', TRUE, 'OpenAI API'),
('LCARS Hallucination Monitor', 'service', 'api', 'Monitoring', 'Real-time hallucination detection and management', TRUE, 'TypeScript'),
('Prime Directive Filter', 'service', 'integration', 'Processing', 'Ensures project ambiguity in stored knowledge', TRUE, 'JavaScript')
ON CONFLICT (component_name) DO NOTHING;

-- Insert initial system relationships
INSERT INTO system_relationships (source_component, target_component, relationship_type, source_layer, target_layer, protocol, is_critical, mermaid_style) VALUES
('LCARS Library Terminal', 'Crew Memory API', 'communicates_with', 'frontend', 'api', 'REST', TRUE, 'solid'),
('Crew Memory API', 'N8N Workflows', 'communicates_with', 'api', 'integration', 'Webhook', TRUE, 'solid'),
('N8N Workflows', 'Prime Directive Filter', 'uses', 'integration', 'integration', 'Internal', TRUE, 'solid'),
('N8N Workflows', 'OpenAI Embeddings', 'uses', 'integration', 'integration', 'REST', TRUE, 'solid'),
('N8N Workflows', 'Supabase Vector Memory', 'uses', 'integration', 'database', 'PostgreSQL', TRUE, 'solid'),
('Shared Library Computer System', 'Crew Memory API', 'provides', 'api', 'api', 'Internal', TRUE, 'solid'),
('LCARS Hallucination Monitor', 'Supabase Vector Memory', 'uses', 'api', 'database', 'PostgreSQL', TRUE, 'solid')
ON CONFLICT (source_component, target_component, relationship_type) DO NOTHING;

-- Insert initial Mermaid diagram templates
INSERT INTO mermaid_diagram_templates (template_name, diagram_type, template_code, description, applicable_doc_types) VALUES
('System Architecture', 'graph', 'graph TB\n    {{#layers}}\n    subgraph "{{name}}"\n        {{#components}}{{id}}[{{name}}]{{/components}}\n    end\n    {{/layers}}\n    {{#relationships}}{{source}} --> {{target}}{{/relationships}}',
 'System-wide architecture diagram showing all layers and components',
 ARRAY['architecture'::doc_type]),
 
('Data Flow', 'sequence', 'sequenceDiagram\n    {{#participants}}participant {{id}} as {{name}}{{/participants}}\n    {{#steps}}{{from}}->>{{to}}: {{action}}{{/steps}}',
 'Data flow sequence diagram',
 ARRAY['architecture'::doc_type, 'integration_guide'::doc_type])
ON CONFLICT (template_name) DO NOTHING;

-- ============================================================================
-- VIEWS FOR EASY QUERYING
-- ============================================================================

-- View: Current documentation summary
CREATE OR REPLACE VIEW current_documentation_summary AS
SELECT 
    dk.id,
    dk.title,
    dk.summary,
    dk.doc_type,
    dk.audience,
    dk.category,
    dk.difficulty_level,
    dk.helpfulness_score,
    dk.view_count,
    dk.feedback_count,
    array_length(dk.keywords, 1) as keyword_count,
    dk.created_at,
    dk.last_accessed
FROM documentation_knowledge dk
WHERE dk.is_current = TRUE AND dk.deprecated = FALSE
ORDER BY dk.helpfulness_score DESC, dk.view_count DESC;

-- View: Component relationships summary
CREATE OR REPLACE VIEW component_relationships_summary AS
SELECT 
    sr.source_component,
    sr.target_component,
    sr.relationship_type,
    sr.protocol,
    ci_source.component_type as source_type,
    ci_target.component_type as target_type,
    sr.is_critical,
    sr.description
FROM system_relationships sr
LEFT JOIN component_inventory ci_source ON sr.source_component = ci_source.component_name
LEFT JOIN component_inventory ci_target ON sr.target_component = ci_target.component_name
WHERE ci_source.is_active = TRUE AND ci_target.is_active = TRUE
ORDER BY sr.is_critical DESC, sr.source_component;

-- View: Documentation generation performance
CREATE OR REPLACE VIEW documentation_generation_performance AS
SELECT 
    doc_type,
    audience,
    COUNT(*) as generation_count,
    AVG(relevance_score) as avg_relevance,
    AVG(completeness_score) as avg_completeness,
    AVG(generation_time_ms) as avg_generation_time_ms,
    COUNT(CASE WHEN was_helpful = TRUE THEN 1 END) as helpful_count,
    COUNT(CASE WHEN was_helpful = FALSE THEN 1 END) as not_helpful_count
FROM documentation_generations
GROUP BY doc_type, audience
ORDER BY avg_relevance DESC;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ RAG-Based Documentation System Schema Created Successfully';
    RAISE NOTICE '📚 Documentation knowledge storage: READY';
    RAISE NOTICE '🔄 System relationships tracking: READY';
    RAISE NOTICE '📊 Mermaid diagram generation: READY';
    RAISE NOTICE '🔍 Semantic search functions: READY';
    RAISE NOTICE '📈 Performance analytics: READY';
    RAISE NOTICE '🖖 Living documentation system: OPERATIONAL';
END $$;

