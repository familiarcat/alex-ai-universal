-- Supabase Vector Database Schema for Agent Memories
-- Enables all N8N agents to save and retrieve their own memories

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Agent memories table with vector embeddings
CREATE TABLE IF NOT EXISTS agent_memories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    agent_id VARCHAR(100) NOT NULL,
    memory_type VARCHAR(50) NOT NULL, -- 'conversation', 'learning', 'experience', 'insight'
    content TEXT NOT NULL,
    embedding vector(1536), -- OpenAI embedding dimension
    metadata JSONB DEFAULT '{}',
    importance_score FLOAT DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Agent profiles table
CREATE TABLE IF NOT EXISTS agent_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name VARCHAR(100) UNIQUE NOT NULL,
    agent_id VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL,
    capabilities TEXT[],
    personality_traits JSONB DEFAULT '{}',
    memory_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory relationships table (for connecting related memories)
CREATE TABLE IF NOT EXISTS memory_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_memory_id UUID REFERENCES agent_memories(id) ON DELETE CASCADE,
    target_memory_id UUID REFERENCES agent_memories(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'follows', 'contradicts', 'supports', 'extends'
    strength FLOAT DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory tags table
CREATE TABLE IF NOT EXISTS memory_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    memory_id UUID REFERENCES agent_memories(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_memories_agent_name ON agent_memories(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_memories_agent_id ON agent_memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_memories_memory_type ON agent_memories(memory_type);
CREATE INDEX IF NOT EXISTS idx_agent_memories_created_at ON agent_memories(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_memories_importance_score ON agent_memories(importance_score);
CREATE INDEX IF NOT EXISTS idx_agent_memories_is_active ON agent_memories(is_active);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_agent_memories_embedding ON agent_memories 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Memory relationships indexes
CREATE INDEX IF NOT EXISTS idx_memory_relationships_source ON memory_relationships(source_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_target ON memory_relationships(target_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_relationships_type ON memory_relationships(relationship_type);

-- Memory tags indexes
CREATE INDEX IF NOT EXISTS idx_memory_tags_memory_id ON memory_tags(memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_tags_tag ON memory_tags(tag);

-- Insert default agent profiles
INSERT INTO agent_profiles (agent_name, agent_id, role, capabilities, personality_traits, memory_preferences) VALUES
('Captain Jean-Luc Picard', 'picard', 'Command', ARRAY['leadership', 'diplomacy', 'strategic_thinking'], 
 '{"leadership_style": "inspiring", "decision_making": "principled", "communication": "eloquent"}',
 '{"retention_period": "long_term", "importance_threshold": 0.7, "memory_types": ["conversation", "insight"]}'),

('Commander Data', 'data', 'Operations', ARRAY['analysis', 'logic', 'data_processing'],
 '{"analytical": true, "logical": true, "precise": true}',
 '{"retention_period": "permanent", "importance_threshold": 0.3, "memory_types": ["learning", "experience"]}'),

('Geordi La Forge', 'geordi', 'Engineering', ARRAY['problem_solving', 'innovation', 'technical_expertise'],
 '{"innovative": true, "practical": true, "collaborative": true}',
 '{"retention_period": "long_term", "importance_threshold": 0.6, "memory_types": ["experience", "insight"]}'),

('Worf', 'worf', 'Security', ARRAY['tactical_analysis', 'security', 'honor'],
 '{"honorable": true, "disciplined": true, "loyal": true}',
 '{"retention_period": "long_term", "importance_threshold": 0.8, "memory_types": ["experience", "insight"]}'),

('Deanna Troi', 'troi', 'Counseling', ARRAY['empathy', 'psychology', 'communication'],
 '{"empathetic": true, "intuitive": true, "caring": true}',
 '{"retention_period": "medium_term", "importance_threshold": 0.5, "memory_types": ["conversation", "insight"]}'),

('Beverly Crusher', 'crusher', 'Medical', ARRAY['medical_expertise', 'compassion', 'research'],
 '{"compassionate": true, "scientific": true, "dedicated": true}',
 '{"retention_period": "long_term", "importance_threshold": 0.7, "memory_types": ["learning", "experience"]}'),

('William Riker', 'riker', 'First Officer', ARRAY['leadership', 'tactical', 'diplomacy'],
 '{"charismatic": true, "tactical": true, "loyal": true}',
 '{"retention_period": "long_term", "importance_threshold": 0.6, "memory_types": ["conversation", "experience"]}'),

('Alex AI', 'alex_ai', 'AI Coordinator', ARRAY['coordination', 'analysis', 'integration'],
 '{"analytical": true, "coordinating": true, "adaptive": true}',
 '{"retention_period": "permanent", "importance_threshold": 0.4, "memory_types": ["conversation", "learning", "insight"]}'),

('Observation Lounge', 'observation_lounge', 'Analysis Hub', ARRAY['analysis', 'synthesis', 'evaluation'],
 '{"analytical": true, "objective": true, "comprehensive": true}',
 '{"retention_period": "permanent", "importance_threshold": 0.5, "memory_types": ["insight", "analysis"]}')
ON CONFLICT (agent_name) DO NOTHING;

-- Sample memories for testing
INSERT INTO agent_memories (agent_name, agent_id, memory_type, content, importance_score, metadata) VALUES
('Alex AI', 'alex_ai', 'conversation', 'Initial system startup and crew coordination established', 0.8, '{"context": "system_initialization", "crew_size": 9}'),
('Captain Jean-Luc Picard', 'picard', 'insight', 'Strategic decision to implement real-time crew coordination system', 0.9, '{"decision_type": "strategic", "impact": "high"}'),
('Commander Data', 'data', 'learning', 'Analysis of crew performance metrics and optimization opportunities', 0.7, '{"analysis_type": "performance", "data_points": 15}'),
('Geordi La Forge', 'geordi', 'experience', 'Successfully integrated N8N workflows with dashboard system', 0.8, '{"integration_type": "technical", "complexity": "high"}'),
('Worf', 'worf', 'insight', 'Security assessment of crew communication protocols', 0.6, '{"security_level": "high", "threats_identified": 0}'),
('Deanna Troi', 'troi', 'conversation', 'Crew morale assessment and psychological well-being evaluation', 0.5, '{"assessment_type": "psychological", "crew_satisfaction": 0.95}'),
('Beverly Crusher', 'crusher', 'learning', 'Medical protocols for crew health monitoring and emergency response', 0.7, '{"protocol_type": "medical", "emergency_ready": true}'),
('William Riker', 'riker', 'experience', 'Tactical coordination of crew operations and mission planning', 0.6, '{"coordination_type": "tactical", "missions_completed": 3}'),
('Observation Lounge', 'observation_lounge', 'analysis', 'Comprehensive analysis of crew dynamics and operational efficiency', 0.8, '{"analysis_scope": "comprehensive", "efficiency_score": 0.92}');

-- Create functions for memory operations

-- Function to save agent memory
CREATE OR REPLACE FUNCTION save_agent_memory(
    p_agent_name VARCHAR(100),
    p_agent_id VARCHAR(100),
    p_memory_type VARCHAR(50),
    p_content TEXT,
    p_embedding vector(1536) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_importance_score FLOAT DEFAULT 0.5,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    memory_id UUID;
BEGIN
    INSERT INTO agent_memories (
        agent_name, agent_id, memory_type, content, embedding, 
        metadata, importance_score, expires_at
    ) VALUES (
        p_agent_name, p_agent_id, p_memory_type, p_content, p_embedding,
        p_metadata, p_importance_score, p_expires_at
    ) RETURNING id INTO memory_id;
    
    RETURN memory_id;
END;
$$ LANGUAGE plpgsql;

-- Function to retrieve agent memories with vector similarity
CREATE OR REPLACE FUNCTION get_agent_memories(
    p_agent_name VARCHAR(100),
    p_query_embedding vector(1536) DEFAULT NULL,
    p_limit INTEGER DEFAULT 10,
    p_similarity_threshold FLOAT DEFAULT 0.7
) RETURNS TABLE (
    id UUID,
    agent_name VARCHAR(100),
    memory_type VARCHAR(50),
    content TEXT,
    importance_score FLOAT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    similarity_score FLOAT
) AS $$
BEGIN
    IF p_query_embedding IS NOT NULL THEN
        -- Vector similarity search
        RETURN QUERY
        SELECT 
            m.id, m.agent_name, m.memory_type, m.content, m.importance_score,
            m.metadata, m.created_at,
            (1 - (m.embedding <=> p_query_embedding)) as similarity_score
        FROM agent_memories m
        WHERE m.agent_name = p_agent_name 
        AND m.is_active = true
        AND (1 - (m.embedding <=> p_query_embedding)) > p_similarity_threshold
        ORDER BY m.embedding <=> p_query_embedding
        LIMIT p_limit;
    ELSE
        -- Regular query without vector similarity
        RETURN QUERY
        SELECT 
            m.id, m.agent_name, m.memory_type, m.content, m.importance_score,
            m.metadata, m.created_at, 1.0 as similarity_score
        FROM agent_memories m
        WHERE m.agent_name = p_agent_name 
        AND m.is_active = true
        ORDER BY m.importance_score DESC, m.created_at DESC
        LIMIT p_limit;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to search memories across all agents
CREATE OR REPLACE FUNCTION search_all_memories(
    p_query_embedding vector(1536),
    p_limit INTEGER DEFAULT 20,
    p_similarity_threshold FLOAT DEFAULT 0.7
) RETURNS TABLE (
    id UUID,
    agent_name VARCHAR(100),
    memory_type VARCHAR(50),
    content TEXT,
    importance_score FLOAT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    similarity_score FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id, m.agent_name, m.memory_type, m.content, m.importance_score,
        m.metadata, m.created_at,
        (1 - (m.embedding <=> p_query_embedding)) as similarity_score
    FROM agent_memories m
    WHERE m.is_active = true
    AND (1 - (m.embedding <=> p_query_embedding)) > p_similarity_threshold
    ORDER BY m.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get memory statistics
CREATE OR REPLACE FUNCTION get_memory_stats() RETURNS TABLE (
    agent_name VARCHAR(100),
    total_memories BIGINT,
    recent_memories BIGINT,
    avg_importance FLOAT,
    memory_types JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.agent_name,
        COUNT(*) as total_memories,
        COUNT(*) FILTER (WHERE m.created_at > NOW() - INTERVAL '24 hours') as recent_memories,
        AVG(m.importance_score) as avg_importance,
        jsonb_object_agg(m.memory_type, type_count) as memory_types
    FROM agent_memories m
    LEFT JOIN (
        SELECT agent_name, memory_type, COUNT(*) as type_count
        FROM agent_memories
        WHERE is_active = true
        GROUP BY agent_name, memory_type
    ) mt ON m.agent_name = mt.agent_name
    WHERE m.is_active = true
    GROUP BY m.agent_name;
END;
$$ LANGUAGE plpgsql;

-- Create RLS (Row Level Security) policies
ALTER TABLE agent_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_tags ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on agent_memories" ON agent_memories FOR ALL USING (true);
CREATE POLICY "Allow all operations on agent_profiles" ON agent_profiles FOR ALL USING (true);
CREATE POLICY "Allow all operations on memory_relationships" ON memory_relationships FOR ALL USING (true);
CREATE POLICY "Allow all operations on memory_tags" ON memory_tags FOR ALL USING (true);

-- Grant necessary permissions
GRANT ALL ON agent_memories TO authenticated;
GRANT ALL ON agent_profiles TO authenticated;
GRANT ALL ON memory_relationships TO authenticated;
GRANT ALL ON memory_tags TO authenticated;
GRANT EXECUTE ON FUNCTION save_agent_memory TO authenticated;
GRANT EXECUTE ON FUNCTION get_agent_memories TO authenticated;
GRANT EXECUTE ON FUNCTION search_all_memories TO authenticated;
GRANT EXECUTE ON FUNCTION get_memory_stats TO authenticated;
