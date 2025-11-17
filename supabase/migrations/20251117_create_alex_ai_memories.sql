-- Create alex_ai_memories table for universal-extension compatibility
-- This table is used by the memory-sync system in packages/universal-extension
-- Created: 2025-11-17

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create alex_ai_memories table (simplified version for universal-extension)
CREATE TABLE IF NOT EXISTS alex_ai_memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Memory content
    content TEXT NOT NULL,
    summary TEXT,
    
    -- Crew member information
    crew_member VARCHAR(100),
    crew_member_name VARCHAR(255),
    
    -- Memory metadata
    memory_type VARCHAR(50) DEFAULT 'conversation',
    platform VARCHAR(50),
    session_id VARCHAR(255),
    
    -- Vector embedding for semantic search
    embedding vector(1536),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    
    -- Storage metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed TIMESTAMPTZ DEFAULT NOW(),
    access_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_timestamp ON alex_ai_memories(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_crew_member ON alex_ai_memories(crew_member);
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_platform ON alex_ai_memories(platform);
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_is_active ON alex_ai_memories(is_active);
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_created_at ON alex_ai_memories(created_at DESC);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_alex_ai_memories_embedding ON alex_ai_memories 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
WHERE embedding IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE alex_ai_memories ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role can manage all memories" ON alex_ai_memories
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant permissions
GRANT ALL ON alex_ai_memories TO service_role;
GRANT SELECT, INSERT, UPDATE ON alex_ai_memories TO authenticated;

-- Add comment
COMMENT ON TABLE alex_ai_memories IS 'Universal memory storage for Alex AI crew members across all platforms';

