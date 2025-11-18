-- Migration: Add Deduplication and Organization Fields to crew_memories
-- Created: 2025-11-18
-- Purpose: Support vector deduplication and enhanced organization by intention

-- Add deduplication fields
ALTER TABLE crew_memories
ADD COLUMN IF NOT EXISTS semantic_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS content_fingerprint TEXT;

-- Add organization fields
ALTER TABLE crew_memories
ADD COLUMN IF NOT EXISTS functional_role VARCHAR(100) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS intention VARCHAR(100) DEFAULT 'knowledge_storage';

-- Create index for semantic hash (for fast duplicate detection)
CREATE INDEX IF NOT EXISTS idx_crew_memories_semantic_hash 
ON crew_memories(semantic_hash) 
WHERE semantic_hash IS NOT NULL;

-- Create index for functional role (for organization queries)
CREATE INDEX IF NOT EXISTS idx_crew_memories_functional_role 
ON crew_memories(functional_role);

-- Create index for intention (for intention-based queries)
CREATE INDEX IF NOT EXISTS idx_crew_memories_intention 
ON crew_memories(intention);

-- Create composite index for deduplication queries
CREATE INDEX IF NOT EXISTS idx_crew_memories_deduplication 
ON crew_memories(semantic_hash, functional_role, intention)
WHERE semantic_hash IS NOT NULL;

-- Add comment
COMMENT ON COLUMN crew_memories.semantic_hash IS 'Hash of normalized content for duplicate detection';
COMMENT ON COLUMN crew_memories.content_fingerprint IS 'First 200 chars of normalized content for similarity matching';
COMMENT ON COLUMN crew_memories.functional_role IS 'Functional role category (infrastructure, testing, cost_optimization, etc.)';
COMMENT ON COLUMN crew_memories.intention IS 'Intention/purpose (bug_fix, feature_implementation, optimization, etc.)';

