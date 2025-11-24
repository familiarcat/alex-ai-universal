-- ============================================================================
-- VECTOR-BASED ANTI-HALLUCINATION OPTIMIZATION SYSTEM
-- Supabase Schema for Vector Storage
-- ============================================================================
-- Purpose: Store vector embeddings for hallucination pattern detection
-- Integration: OpenRouter (LLM) + Supabase (Vector Storage)
-- Optimization: Riker (Organization) + Quark (Budget)
-- ============================================================================

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- VECTOR EMBEDDINGS TABLE
-- ============================================================================
-- Stores vector embeddings for hallucination patterns
-- Indexed for fast similarity search
-- ============================================================================

CREATE TABLE IF NOT EXISTS vector_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content identification
    content_hash TEXT UNIQUE NOT NULL,
    content_text TEXT,
    
    -- Vector embedding (1536 dimensions for OpenAI ada-002)
    embedding vector(1536) NOT NULL,
    
    -- Pattern metadata
    pattern_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    crew_member TEXT NOT NULL,
    
    -- Context and analysis
    context JSONB DEFAULT '{}'::jsonb,
    confidence_score FLOAT DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
    hallucination_probability FLOAT DEFAULT 0.5 CHECK (hallucination_probability >= 0 AND hallucination_probability <= 1),
    
    -- Organization (Riker's domain)
    workflow_stage TEXT,
    resource_allocation JSONB,
    task_dependencies JSONB,
    
    -- Budget optimization (Quark's domain)
    cost_center TEXT,
    estimated_cost FLOAT DEFAULT 0,
    model_used TEXT,
    tokens_used INTEGER DEFAULT 0,
    
    -- Security (Worf's domain)
    security_classification TEXT DEFAULT 'standard' CHECK (security_classification IN ('standard', 'confidential', 'restricted')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- VECTOR SIMILARITY INDEX
-- ============================================================================
-- IVFFlat index for fast cosine similarity search
-- ============================================================================

CREATE INDEX IF NOT EXISTS vector_embeddings_embedding_idx 
ON vector_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================================================
-- PATTERN SEARCH FUNCTION
-- ============================================================================
-- RPC function for vector similarity search
-- ============================================================================

CREATE OR REPLACE FUNCTION match_vectors(
    query_embedding vector(1536),
    match_threshold FLOAT DEFAULT 0.8,
    match_count INT DEFAULT 10,
    filter_pattern_type TEXT DEFAULT NULL,
    filter_crew_member TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content_hash TEXT,
    pattern_type TEXT,
    severity TEXT,
    crew_member TEXT,
    similarity FLOAT,
    context JSONB,
    confidence_score FLOAT,
    hallucination_probability FLOAT,
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ve.id,
        ve.content_hash,
        ve.pattern_type,
        ve.severity,
        ve.crew_member,
        1 - (ve.embedding <=> query_embedding) AS similarity,
        ve.context,
        ve.confidence_score,
        ve.hallucination_probability,
        ve.created_at
    FROM vector_embeddings ve
    WHERE
        (filter_pattern_type IS NULL OR ve.pattern_type = filter_pattern_type)
        AND (filter_crew_member IS NULL OR ve.crew_member = filter_crew_member)
        AND (1 - (ve.embedding <=> query_embedding)) >= match_threshold
    ORDER BY ve.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- PATTERN STATISTICS FUNCTION
-- ============================================================================
-- Get statistics for budget and organization optimization
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pattern_statistics(
    crew_member_filter TEXT DEFAULT NULL,
    date_from TIMESTAMPTZ DEFAULT NULL,
    date_to TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_patterns BIGINT,
    avg_confidence FLOAT,
    avg_hallucination_probability FLOAT,
    total_cost FLOAT,
    patterns_by_severity JSONB,
    patterns_by_type JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT AS total_patterns,
        AVG(confidence_score) AS avg_confidence,
        AVG(hallucination_probability) AS avg_hallucination_probability,
        SUM(estimated_cost) AS total_cost,
        jsonb_object_agg(severity, severity_count) AS patterns_by_severity,
        jsonb_object_agg(pattern_type, type_count) AS patterns_by_type
    FROM (
        SELECT
            severity,
            COUNT(*) AS severity_count,
            pattern_type,
            COUNT(*) AS type_count
        FROM vector_embeddings
        WHERE
            (crew_member_filter IS NULL OR crew_member = crew_member_filter)
            AND (date_from IS NULL OR created_at >= date_from)
            AND (date_to IS NULL OR created_at <= date_to)
        GROUP BY severity, pattern_type
    ) stats;
END;
$$;

-- ============================================================================
-- BUDGET OPTIMIZATION VIEW
-- ============================================================================
-- Quark's budget analysis view
-- ============================================================================

CREATE OR REPLACE VIEW budget_optimization_view AS
SELECT
    cost_center,
    model_used,
    COUNT(*) AS pattern_count,
    SUM(tokens_used) AS total_tokens,
    SUM(estimated_cost) AS total_cost,
    AVG(estimated_cost) AS avg_cost_per_pattern,
    DATE_TRUNC('day', created_at) AS date
FROM vector_embeddings
WHERE estimated_cost > 0
GROUP BY cost_center, model_used, DATE_TRUNC('day', created_at)
ORDER BY date DESC, total_cost DESC;

-- ============================================================================
-- ORGANIZATION OPTIMIZATION VIEW
-- ============================================================================
-- Riker's organization analysis view
-- ============================================================================

CREATE OR REPLACE VIEW organization_optimization_view AS
SELECT
    workflow_stage,
    crew_member,
    COUNT(*) AS pattern_count,
    AVG(confidence_score) AS avg_confidence,
    jsonb_object_agg(severity, severity_count) AS severity_distribution
FROM (
    SELECT
        workflow_stage,
        crew_member,
        severity,
        COUNT(*) AS severity_count
    FROM vector_embeddings
    WHERE workflow_stage IS NOT NULL
    GROUP BY workflow_stage, crew_member, severity
) org_stats
GROUP BY workflow_stage, crew_member
ORDER BY pattern_count DESC;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_vector_embeddings_crew_member 
ON vector_embeddings(crew_member);

CREATE INDEX IF NOT EXISTS idx_vector_embeddings_pattern_type 
ON vector_embeddings(pattern_type);

CREATE INDEX IF NOT EXISTS idx_vector_embeddings_severity 
ON vector_embeddings(severity);

CREATE INDEX IF NOT EXISTS idx_vector_embeddings_created_at 
ON vector_embeddings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vector_embeddings_cost_center 
ON vector_embeddings(cost_center);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vector_embeddings_updated_at
    BEFORE UPDATE ON vector_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Security policies for vector embeddings
-- ============================================================================

ALTER TABLE vector_embeddings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role full access
CREATE POLICY "Service role full access"
ON vector_embeddings
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Allow authenticated users to read standard classifications
CREATE POLICY "Authenticated users read standard"
ON vector_embeddings
FOR SELECT
TO authenticated
USING (security_classification = 'standard');

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE vector_embeddings IS 'Stores vector embeddings for hallucination pattern detection with Riker organization and Quark budget optimization';
COMMENT ON FUNCTION match_vectors IS 'Vector similarity search function for pattern matching';
COMMENT ON FUNCTION get_pattern_statistics IS 'Get statistics for budget and organization optimization';
COMMENT ON VIEW budget_optimization_view IS 'Quark''s budget analysis view for cost optimization';
COMMENT ON VIEW organization_optimization_view IS 'Riker''s organization analysis view for workflow optimization';

