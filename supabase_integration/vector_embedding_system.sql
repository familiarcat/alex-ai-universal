-- Comprehensive Vector Embedding System for Alex AI RAG
-- This creates vector embeddings for all memories with alignment to global knowledge and crew members

-- Enable vector extension (pgvector)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector embedding table for memories
CREATE TABLE IF NOT EXISTS alex_ai_memory_embeddings (
    id SERIAL PRIMARY KEY,
    memory_id TEXT NOT NULL REFERENCES alex_ai_memories(memory_id),
    embedding vector(1536), -- OpenAI ada-002 embedding dimension
    embedding_type TEXT NOT NULL, -- 'global', 'crew_specific', 'content', 'context'
    crew_member TEXT, -- NULL for global, crew name for crew-specific
    content_hash TEXT NOT NULL, -- Hash of content to detect changes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_memory_embeddings_vector 
ON alex_ai_memory_embeddings 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Create index for memory_id lookups
CREATE INDEX IF NOT EXISTS idx_memory_embeddings_memory_id 
ON alex_ai_memory_embeddings (memory_id);

-- Create index for crew member lookups
CREATE INDEX IF NOT EXISTS idx_memory_embeddings_crew 
ON alex_ai_memory_embeddings (crew_member) 
WHERE crew_member IS NOT NULL;

-- Function to generate embeddings for memory content
CREATE OR REPLACE FUNCTION generate_memory_embeddings(memory_id_param TEXT)
RETURNS VOID AS $$
DECLARE
    memory_record RECORD;
    content_text TEXT;
    global_embedding vector(1536);
    crew_embedding vector(1536);
    crew_member_name TEXT;
BEGIN
    -- Get memory record
    SELECT * INTO memory_record 
    FROM alex_ai_memories 
    WHERE memory_id = memory_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Memory not found: %', memory_id_param;
    END IF;
    
    -- Generate content text for embedding
    content_text := memory_record.title || ' ' || 
                   memory_record.description || ' ' || 
                   memory_record.content::text || ' ' ||
                   array_to_string(memory_record.tags, ' ');
    
    -- Generate global embedding (placeholder - would use actual embedding service)
    -- In production, this would call OpenAI API or similar
    global_embedding := array_to_vector(ARRAY[0.1, 0.2, 0.3]::real[] || 
                                       ARRAY(SELECT random() FROM generate_series(1, 1533))::real[]);
    
    -- Delete existing embeddings for this memory
    DELETE FROM alex_ai_memory_embeddings WHERE memory_id = memory_id_param;
    
    -- Insert global embedding
    INSERT INTO alex_ai_memory_embeddings (
        memory_id, embedding, embedding_type, content_hash
    ) VALUES (
        memory_id_param, 
        global_embedding, 
        'global',
        md5(content_text)
    );
    
    -- Generate crew-specific embeddings
    FOR crew_member_name IN 
        SELECT unnest(ARRAY[
            'captain_picard', 'commander_data', 'lieutenant_geordi', 
            'lieutenant_worf', 'dr_crusher', 'commander_riker', 
            'counselor_troi', 'lieutenant_uhura', 'quark'
        ])
    LOOP
        -- Generate crew-specific embedding (would be different based on crew role)
        crew_embedding := array_to_vector(ARRAY[0.1, 0.2, 0.3]::real[] || 
                                         ARRAY(SELECT random() FROM generate_series(1, 1533))::real[]);
        
        INSERT INTO alex_ai_memory_embeddings (
            memory_id, embedding, embedding_type, crew_member, content_hash
        ) VALUES (
            memory_id_param, 
            crew_embedding, 
            'crew_specific',
            crew_member_name,
            md5(content_text)
        );
    END LOOP;
    
    -- Generate content-specific embedding
    INSERT INTO alex_ai_memory_embeddings (
        memory_id, embedding, embedding_type, content_hash
    ) VALUES (
        memory_id_param, 
        global_embedding, 
        'content',
        md5(content_text)
    );
    
    -- Generate context-specific embedding
    INSERT INTO alex_ai_memory_embeddings (
        memory_id, embedding, embedding_type, content_hash
    ) VALUES (
        memory_id_param, 
        global_embedding, 
        'context',
        md5(content_text)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to search memories by vector similarity
CREATE OR REPLACE FUNCTION search_memories_by_vector(
    query_embedding vector(1536),
    similarity_threshold REAL DEFAULT 0.7,
    limit_results INTEGER DEFAULT 10,
    crew_member_filter TEXT DEFAULT NULL,
    embedding_type_filter TEXT DEFAULT 'global'
)
RETURNS TABLE (
    memory_id TEXT,
    title TEXT,
    description TEXT,
    similarity_score REAL,
    crew_member TEXT,
    embedding_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.memory_id,
        m.title,
        m.description,
        1 - (e.embedding <=> query_embedding) as similarity_score,
        e.crew_member,
        e.embedding_type
    FROM alex_ai_memory_embeddings e
    JOIN alex_ai_memories m ON e.memory_id = m.memory_id
    WHERE 1 - (e.embedding <=> query_embedding) > similarity_threshold
    AND (crew_member_filter IS NULL OR e.crew_member = crew_member_filter)
    AND e.embedding_type = embedding_type_filter
    ORDER BY e.embedding <=> query_embedding
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get crew-specific knowledge
CREATE OR REPLACE FUNCTION get_crew_knowledge(
    crew_member_name TEXT,
    query_embedding vector(1536),
    limit_results INTEGER DEFAULT 5
)
RETURNS TABLE (
    memory_id TEXT,
    title TEXT,
    description TEXT,
    similarity_score REAL,
    crew_responsibilities TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.memory_id,
        m.title,
        m.description,
        1 - (e.embedding <=> query_embedding) as similarity_score,
        m.content->'crew_integration'->>crew_member_name as crew_responsibilities
    FROM alex_ai_memory_embeddings e
    JOIN alex_ai_memories m ON e.memory_id = m.memory_id
    WHERE e.crew_member = crew_member_name
    AND e.embedding_type = 'crew_specific'
    ORDER BY e.embedding <=> query_embedding
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to get global knowledge
CREATE OR REPLACE FUNCTION get_global_knowledge(
    query_embedding vector(1536),
    limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    memory_id TEXT,
    title TEXT,
    description TEXT,
    similarity_score REAL,
    universal_applicability BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.memory_id,
        m.title,
        m.description,
        1 - (e.embedding <=> query_embedding) as similarity_score,
        m.universal_applicability
    FROM alex_ai_memory_embeddings e
    JOIN alex_ai_memories m ON e.memory_id = m.memory_id
    WHERE e.embedding_type = 'global'
    AND e.crew_member IS NULL
    ORDER BY e.embedding <=> query_embedding
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to update embeddings when memory changes
CREATE OR REPLACE FUNCTION update_memory_embeddings()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if content has changed
    IF OLD.content_hash != NEW.content_hash OR 
       OLD.title != NEW.title OR 
       OLD.description != NEW.description THEN
        -- Regenerate embeddings
        PERFORM generate_memory_embeddings(NEW.memory_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update embeddings
CREATE TRIGGER trigger_update_memory_embeddings
    AFTER UPDATE ON alex_ai_memories
    FOR EACH ROW
    EXECUTE FUNCTION update_memory_embeddings();

-- Function to get comprehensive knowledge for a query
CREATE OR REPLACE FUNCTION get_comprehensive_knowledge(
    query_text TEXT,
    query_embedding vector(1536),
    include_crew_knowledge BOOLEAN DEFAULT true,
    similarity_threshold REAL DEFAULT 0.7
)
RETURNS TABLE (
    knowledge_type TEXT,
    memory_id TEXT,
    title TEXT,
    description TEXT,
    similarity_score REAL,
    crew_member TEXT,
    crew_responsibilities TEXT
) AS $$
BEGIN
    -- Global knowledge
    RETURN QUERY
    SELECT 
        'global'::TEXT as knowledge_type,
        gk.memory_id,
        gk.title,
        gk.description,
        gk.similarity_score,
        NULL::TEXT as crew_member,
        NULL::TEXT as crew_responsibilities
    FROM get_global_knowledge(query_embedding, 5) gk;
    
    -- Crew-specific knowledge (if requested)
    IF include_crew_knowledge THEN
        RETURN QUERY
        SELECT 
            'crew_specific'::TEXT as knowledge_type,
            ck.memory_id,
            ck.title,
            ck.description,
            ck.similarity_score,
            ck.crew_member,
            ck.crew_responsibilities
        FROM (
            SELECT 
                'captain_picard'::TEXT as crew_member,
                (get_crew_knowledge('captain_picard', query_embedding, 2)).*
            UNION ALL
            SELECT 
                'commander_data'::TEXT as crew_member,
                (get_crew_knowledge('commander_data', query_embedding, 2)).*
            UNION ALL
            SELECT 
                'lieutenant_geordi'::TEXT as crew_member,
                (get_crew_knowledge('lieutenant_geordi', query_embedding, 2)).*
            UNION ALL
            SELECT 
                'lieutenant_worf'::TEXT as crew_member,
                (get_crew_knowledge('lieutenant_worf', query_embedding, 2)).*
            UNION ALL
            SELECT 
                'dr_crusher'::TEXT as crew_member,
                (get_crew_knowledge('dr_crusher', query_embedding, 2)).*
            UNION ALL
            SELECT 
                'commander_riker'::TEXT as crew_member,
                (get_crew_knowledge('commander_riker', query_embedding, 2)).*
            UNION ALL
            SELECT 
                'counselor_troi'::TEXT as crew_member,
                (get_crew_knowledge('counselor_troi', query_embedding, 2)).*
            UNION ALL
            SELECT 
                'lieutenant_uhura'::TEXT as crew_member,
                (get_crew_knowledge('lieutenant_uhura', query_embedding, 2)).*
            UNION ALL
            SELECT 
                'quark'::TEXT as crew_member,
                (get_crew_knowledge('quark', query_embedding, 2)).*
        ) ck
        WHERE ck.similarity_score > similarity_threshold;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Initialize embeddings for existing memories
DO $$
DECLARE
    memory_record RECORD;
BEGIN
    FOR memory_record IN 
        SELECT memory_id FROM alex_ai_memories 
        WHERE status = 'active'
    LOOP
        PERFORM generate_memory_embeddings(memory_record.memory_id);
    END LOOP;
END;
$$;
