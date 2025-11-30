-- Supabase Schema for Alex AI Universal Crew Memory Storage
-- Shared Library Computer System with Prime Directive Compliance
-- Created: January 18, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Crew Members Enum
CREATE TYPE crew_member AS ENUM (
    'picard',
    'riker', 
    'data',
    'la_forge',
    'worf',
    'troi',
    'crusher',
    'uhura',
    'quark'
);

-- Knowledge Types Enum
CREATE TYPE knowledge_type AS ENUM (
    'technical_analysis',
    'strategic_assessment',
    'medical_assessment',
    'security_analysis',
    'engineering_solution',
    'communication_protocol',
    'business_optimization',
    'problem_solution',
    'reference_documentation',
    'lesson_learned',
    'best_practice',
    'troubleshooting_guide'
);

-- Priority Levels Enum
CREATE TYPE priority_level AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Prime Directive Compliance Enum
CREATE TYPE prime_directive_compliance AS ENUM (
    'compliant',
    'ambiguous',
    'non_specific',
    'general_principle'
);

-- Crew Memories Table
CREATE TABLE IF NOT EXISTS crew_memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Crew Member Information
    crew_member crew_member NOT NULL,
    crew_member_name VARCHAR(255) NOT NULL,
    
    -- Knowledge Classification
    knowledge_type knowledge_type NOT NULL,
    priority priority_level DEFAULT 'medium',
    
    -- Core Knowledge Content
    title VARCHAR(500) NOT NULL,
    summary TEXT NOT NULL,
    detailed_analysis TEXT,
    key_findings TEXT[] DEFAULT '{}',
    conclusions TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    
    -- Reference Information (Prime Directive Compliant)
    referenced_documents TEXT[] DEFAULT '{}',
    related_topics TEXT[] DEFAULT '{}',
    applicable_scenarios TEXT[] DEFAULT '{}',
    general_principles TEXT[] DEFAULT '{}',
    
    -- Technical Metadata
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    complexity_level INTEGER DEFAULT 5 CHECK (complexity_level >= 1 AND complexity_level <= 10),
    confidence_level INTEGER DEFAULT 75 CHECK (confidence_level >= 1 AND confidence_level <= 100),
    
    -- Prime Directive Compliance
    prime_directive_compliance prime_directive_compliance DEFAULT 'compliant',
    ambiguity_level INTEGER DEFAULT 7 CHECK (ambiguity_level >= 1 AND ambiguity_level <= 10),
    project_specificity BOOLEAN DEFAULT FALSE,
    
    -- Vector Embedding for Semantic Search
    semantic_text TEXT NOT NULL,
    vector_embedding VECTOR(1536),
    
    -- Collaboration Metadata
    validated_by crew_member[] DEFAULT '{}',
    conflict_resolutions JSONB DEFAULT '[]',
    
    -- Storage Metadata
    storage_timestamp TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    -- Indexing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crew Expertise Areas Table
CREATE TABLE IF NOT EXISTS crew_expertise_areas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    crew_member crew_member NOT NULL,
    expertise_area VARCHAR(255) NOT NULL,
    proficiency_level INTEGER DEFAULT 75 CHECK (proficiency_level >= 1 AND proficiency_level <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(crew_member, expertise_area)
);

-- Memory Relationships Table (Knowledge Graph)
CREATE TABLE IF NOT EXISTS memory_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    source_memory_id UUID NOT NULL REFERENCES crew_memories(id) ON DELETE CASCADE,
    target_memory_id UUID NOT NULL REFERENCES crew_memories(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL, -- 'related', 'conflicts', 'validates', 'extends'
    strength DECIMAL(3,2) DEFAULT 0.5 CHECK (strength >= 0.0 AND strength <= 1.0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_memory_id, target_memory_id, relationship_type)
);

-- Memory Validation Table
CREATE TABLE IF NOT EXISTS memory_validations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    memory_id UUID NOT NULL REFERENCES crew_memories(id) ON DELETE CASCADE,
    validator crew_member NOT NULL,
    validation_type VARCHAR(100) NOT NULL, -- 'confirms', 'disputes', 'extends', 'clarifies'
    validation_text TEXT,
    confidence_adjustment INTEGER DEFAULT 0, -- -10 to +10 adjustment
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collective Intelligence Analytics Table
CREATE TABLE IF NOT EXISTS collective_intelligence_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Overall Statistics
    total_memories INTEGER DEFAULT 0,
    active_crew_members INTEGER DEFAULT 0,
    knowledge_diversity_score DECIMAL(5,2) DEFAULT 0.0,
    
    -- Crew Contribution Statistics
    crew_contributions JSONB DEFAULT '{}',
    knowledge_type_distribution JSONB DEFAULT '{}',
    expertise_overlap_matrix JSONB DEFAULT '{}',
    
    -- Quality Metrics
    average_confidence_level DECIMAL(5,2) DEFAULT 0.0,
    validation_rate DECIMAL(5,2) DEFAULT 0.0,
    conflict_resolution_rate DECIMAL(5,2) DEFAULT 0.0,
    prime_directive_compliance_rate DECIMAL(5,2) DEFAULT 0.0,
    
    -- Usage Analytics
    search_frequency INTEGER DEFAULT 0,
    top_searched_topics TEXT[] DEFAULT '{}',
    most_accessed_memories UUID[] DEFAULT '{}',
    
    -- Trends
    recent_trends TEXT[] DEFAULT '{}',
    emerging_topics TEXT[] DEFAULT '{}',
    declining_topics TEXT[] DEFAULT '{}'
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_crew_memories_crew_member ON crew_memories(crew_member);
CREATE INDEX IF NOT EXISTS idx_crew_memories_knowledge_type ON crew_memories(knowledge_type);
CREATE INDEX IF NOT EXISTS idx_crew_memories_priority ON crew_memories(priority);
CREATE INDEX IF NOT EXISTS idx_crew_memories_timestamp ON crew_memories(timestamp);
CREATE INDEX IF NOT EXISTS idx_crew_memories_confidence_level ON crew_memories(confidence_level);
CREATE INDEX IF NOT EXISTS idx_crew_memories_complexity_level ON crew_memories(complexity_level);
CREATE INDEX IF NOT EXISTS idx_crew_memories_prime_directive ON crew_memories(prime_directive_compliance);
CREATE INDEX IF NOT EXISTS idx_crew_memories_vector ON crew_memories USING ivfflat (vector_embedding vector_cosine_ops);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_crew_memories_title_search ON crew_memories USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_crew_memories_summary_search ON crew_memories USING gin(to_tsvector('english', summary));
CREATE INDEX IF NOT EXISTS idx_crew_memories_semantic_search ON crew_memories USING gin(to_tsvector('english', semantic_text));

-- Array indexes for tags and keywords
CREATE INDEX IF NOT EXISTS idx_crew_memories_tags ON crew_memories USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_crew_memories_keywords ON crew_memories USING gin(keywords);
CREATE INDEX IF NOT EXISTS idx_crew_memories_validated_by ON crew_memories USING gin(validated_by);

-- Relationships indexes
CREATE INDEX IF NOT EXISTS idx_memory_relationships_source ON memory_relationships(source_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_target ON memory_relationships(target_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_type ON memory_relationships(relationship_type);

-- Validation indexes
CREATE INDEX IF NOT EXISTS idx_memory_validations_memory ON memory_validations(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_validations_validator ON memory_validations(validator);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_collective_intelligence_timestamp ON collective_intelligence_analytics(timestamp);

-- Create Functions for Advanced Queries

-- Function for semantic similarity search
CREATE OR REPLACE FUNCTION search_crew_memories_semantic(
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10,
    crew_filter crew_member DEFAULT NULL,
    knowledge_type_filter knowledge_type DEFAULT NULL,
    priority_filter priority_level DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    summary TEXT,
    crew_member crew_member,
    crew_member_name VARCHAR,
    knowledge_type knowledge_type,
    priority priority_level,
    confidence_level INTEGER,
    similarity FLOAT,
    general_principles TEXT[],
    referenced_documents TEXT[],
    validated_by crew_member[]
)
LANGUAGE SQL
AS $$
    SELECT
        cm.id,
        cm.title,
        cm.summary,
        cm.crew_member,
        cm.crew_member_name,
        cm.knowledge_type,
        cm.priority,
        cm.confidence_level,
        1 - (cm.vector_embedding <=> query_embedding) AS similarity,
        cm.general_principles,
        cm.referenced_documents,
        cm.validated_by
    FROM crew_memories cm
    WHERE 1 - (cm.vector_embedding <=> query_embedding) > match_threshold
        AND (crew_filter IS NULL OR cm.crew_member = crew_filter)
        AND (knowledge_type_filter IS NULL OR cm.knowledge_type = knowledge_type_filter)
        AND (priority_filter IS NULL OR cm.priority = priority_filter)
        AND cm.prime_directive_compliance = 'compliant'
    ORDER BY cm.vector_embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function for crew expertise analysis
CREATE OR REPLACE FUNCTION get_crew_expertise_analysis(
    target_crew_member crew_member DEFAULT NULL
)
RETURNS TABLE (
    crew_member crew_member,
    total_memories BIGINT,
    avg_confidence DECIMAL,
    expertise_areas TEXT[],
    most_common_knowledge_type knowledge_type,
    validation_count BIGINT,
    contribution_score DECIMAL
)
LANGUAGE SQL
AS $$
    SELECT
        cm.crew_member,
        COUNT(*) as total_memories,
        ROUND(AVG(cm.confidence_level), 2) as avg_confidence,
        ARRAY_AGG(DISTINCT cea.expertise_area) as expertise_areas,
        MODE() WITHIN GROUP (ORDER BY cm.knowledge_type) as most_common_knowledge_type,
        COUNT(DISTINCT mv.id) as validation_count,
        ROUND(
            (COUNT(*) * 0.4) + 
            (AVG(cm.confidence_level) * 0.3) + 
            (COUNT(DISTINCT mv.id) * 0.3), 2
        ) as contribution_score
    FROM crew_memories cm
    LEFT JOIN crew_expertise_areas cea ON cm.crew_member = cea.crew_member
    LEFT JOIN memory_validations mv ON cm.id = mv.memory_id
    WHERE (target_crew_member IS NULL OR cm.crew_member = target_crew_member)
    GROUP BY cm.crew_member
    ORDER BY contribution_score DESC;
$$;

-- Function for collective intelligence insights
CREATE OR REPLACE FUNCTION get_collective_intelligence_insights(
    days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
    insight_type VARCHAR,
    insight_data JSONB
)
LANGUAGE SQL
AS $$
    WITH recent_memories AS (
        SELECT * FROM crew_memories 
        WHERE timestamp >= NOW() - INTERVAL '1 day' * days_back
    ),
    knowledge_distribution AS (
        SELECT 
            knowledge_type,
            COUNT(*) as count,
            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM recent_memories
        GROUP BY knowledge_type
    ),
    crew_contributions AS (
        SELECT 
            crew_member,
            COUNT(*) as memory_count,
            ROUND(AVG(confidence_level), 2) as avg_confidence,
            COUNT(DISTINCT knowledge_type) as diversity_score
        FROM recent_memories
        GROUP BY crew_member
    ),
    trending_topics AS (
        SELECT 
            unnest(keywords) as topic,
            COUNT(*) as frequency
        FROM recent_memories
        GROUP BY unnest(keywords)
        ORDER BY frequency DESC
        LIMIT 10
    )
    SELECT 'knowledge_distribution' as insight_type, 
           jsonb_agg(jsonb_build_object('type', knowledge_type, 'count', count, 'percentage', percentage)) as insight_data
    FROM knowledge_distribution
    UNION ALL
    SELECT 'crew_contributions' as insight_type,
           jsonb_agg(jsonb_build_object('crew_member', crew_member, 'memory_count', memory_count, 'avg_confidence', avg_confidence, 'diversity_score', diversity_score)) as insight_data
    FROM crew_contributions
    UNION ALL
    SELECT 'trending_topics' as insight_type,
           jsonb_agg(jsonb_build_object('topic', topic, 'frequency', frequency)) as insight_data
    FROM trending_topics;
$$;

-- Function for Prime Directive compliance check
CREATE OR REPLACE FUNCTION check_prime_directive_compliance(
    memory_id UUID
)
RETURNS TABLE (
    compliance_score DECIMAL,
    issues TEXT[],
    recommendations TEXT[]
)
LANGUAGE SQL
AS $$
    WITH memory_analysis AS (
        SELECT 
            title,
            summary,
            detailed_analysis,
            project_specificity,
            ambiguity_level,
            general_principles,
            referenced_documents
        FROM crew_memories
        WHERE id = memory_id
    )
    SELECT 
        CASE 
            WHEN project_specificity = FALSE AND ambiguity_level >= 6 AND array_length(general_principles, 1) > 0 
            THEN 100.0
            WHEN project_specificity = FALSE AND ambiguity_level >= 5 
            THEN 80.0
            WHEN ambiguity_level >= 4 
            THEN 60.0
            ELSE 40.0
        END as compliance_score,
        CASE 
            WHEN project_specificity = TRUE THEN ARRAY['Contains project-specific information']
            WHEN ambiguity_level < 5 THEN ARRAY['Insufficient ambiguity level']
            WHEN array_length(general_principles, 1) = 0 THEN ARRAY['No general principles extracted']
            ELSE ARRAY[]::TEXT[]
        END as issues,
        CASE 
            WHEN project_specificity = TRUE THEN ARRAY['Generalize project-specific references', 'Increase ambiguity level']
            WHEN ambiguity_level < 5 THEN ARRAY['Increase ambiguity level to 6+', 'Extract more general principles']
            WHEN array_length(general_principles, 1) = 0 THEN ARRAY['Extract general principles from analysis', 'Document applicable scenarios']
            ELSE ARRAY['Compliance maintained']::TEXT[]
        END as recommendations
    FROM memory_analysis;
$$;

-- Create RLS (Row Level Security) Policies
ALTER TABLE crew_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_expertise_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE collective_intelligence_analytics ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users
CREATE POLICY "Allow read access to crew memories" ON crew_memories
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to crew expertise" ON crew_expertise_areas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to memory relationships" ON memory_relationships
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to memory validations" ON memory_validations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read access to collective intelligence" ON collective_intelligence_analytics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow insert/update access for service role (N8N integration)
CREATE POLICY "Allow service role full access to crew memories" ON crew_memories
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to crew expertise" ON crew_expertise_areas
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to memory relationships" ON memory_relationships
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to memory validations" ON memory_validations
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to collective intelligence" ON collective_intelligence_analytics
    FOR ALL USING (auth.role() = 'service_role');

-- Create Triggers for Updated At
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_crew_memories_updated_at BEFORE UPDATE ON crew_memories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Initial Crew Expertise Areas
INSERT INTO crew_expertise_areas (crew_member, expertise_area, proficiency_level) VALUES
-- Captain Picard
('picard', 'strategic_planning', 95),
('picard', 'mission_coordination', 95),
('picard', 'crew_leadership', 90),
('picard', 'diplomatic_solutions', 90),
('picard', 'ethical_decision_making', 95),
('picard', 'resource_allocation', 85),

-- Commander Riker
('riker', 'tactical_operations', 95),
('riker', 'workflow_management', 95),
('riker', 'team_coordination', 90),
('riker', 'execution_planning', 90),
('riker', 'resource_management', 85),
('riker', 'operational_efficiency', 90),

-- Commander Data
('data', 'technical_analysis', 95),
('data', 'logical_reasoning', 95),
('data', 'system_optimization', 90),
('data', 'data_processing', 95),
('data', 'algorithm_design', 90),
('data', 'performance_analysis', 90),

-- Lieutenant Commander La Forge
('la_forge', 'infrastructure_engineering', 95),
('la_forge', 'system_monitoring', 95),
('la_forge', 'preventive_maintenance', 90),
('la_forge', 'troubleshooting', 95),
('la_forge', 'performance_optimization', 90),
('la_forge', 'technical_innovation', 85),

-- Lieutenant Worf
('worf', 'security_analysis', 95),
('worf', 'threat_assessment', 95),
('worf', 'defensive_strategies', 90),
('worf', 'protocol_enforcement', 90),
('worf', 'risk_management', 85),
('worf', 'security_optimization', 90),

-- Counselor Troi
('troi', 'user_experience', 95),
('troi', 'psychological_assessment', 95),
('troi', 'communication_optimization', 90),
('troi', 'interface_design', 85),
('troi', 'usability_analysis', 90),
('troi', 'human_factors', 90),

-- Dr. Crusher
('crusher', 'system_health', 95),
('crusher', 'medical_diagnosis', 95),
('crusher', 'preventive_care', 90),
('crusher', 'health_monitoring', 95),
('crusher', 'treatment_protocols', 90),
('crusher', 'wellness_optimization', 85),

-- Lieutenant Uhura
('uhura', 'communication_systems', 95),
('uhura', 'data_transmission', 95),
('uhura', 'network_optimization', 90),
('uhura', 'protocol_management', 90),
('uhura', 'integration_coordination', 85),
('uhura', 'information_flow', 90),

-- Quark
('quark', 'business_optimization', 95),
('quark', 'cost_analysis', 95),
('quark', 'efficiency_metrics', 90),
('quark', 'resource_utilization', 90),
('quark', 'roi_calculation', 95),
('quark', 'economic_assessment', 85)
ON CONFLICT (crew_member, expertise_area) DO NOTHING;

-- Insert Initial Collective Intelligence Analytics
INSERT INTO collective_intelligence_analytics (
    total_memories,
    active_crew_members,
    knowledge_diversity_score,
    average_confidence_level,
    prime_directive_compliance_rate
) VALUES (
    0,
    9,
    100.0,
    85.0,
    100.0
) ON CONFLICT DO NOTHING;

-- Create Views for Easy Querying
CREATE OR REPLACE VIEW crew_memory_summary AS
SELECT 
    id,
    title,
    summary,
    crew_member,
    crew_member_name,
    knowledge_type,
    priority,
    confidence_level,
    complexity_level,
    array_length(key_findings, 1) as finding_count,
    array_length(conclusions, 1) as conclusion_count,
    array_length(recommendations, 1) as recommendation_count,
    array_length(validated_by, 1) as validation_count,
    timestamp,
    created_at
FROM crew_memories
ORDER BY timestamp DESC;

CREATE OR REPLACE VIEW crew_contributions_summary AS
SELECT 
    crew_member,
    crew_member_name,
    COUNT(*) as total_memories,
    ROUND(AVG(confidence_level), 2) as avg_confidence,
    ROUND(AVG(complexity_level), 2) as avg_complexity,
    COUNT(DISTINCT knowledge_type) as knowledge_diversity,
    MAX(timestamp) as last_contribution
FROM crew_memories
GROUP BY crew_member, crew_member_name
ORDER BY total_memories DESC;

-- Grant Permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Success Message
DO $$
BEGIN
    RAISE NOTICE '✅ Alex AI Universal Crew Memory Schema Created Successfully';
    RAISE NOTICE '🖖 Shared Library Computer System Ready';
    RAISE NOTICE '🧠 Prime Directive Compliance Enforced';
    RAISE NOTICE '📚 Collective Intelligence Database Operational';
    RAISE NOTICE '🔍 Semantic Search Capabilities Active';
END $$;

