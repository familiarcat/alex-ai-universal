-- RAG Vector Queries for Comprehensive Knowledge Retrieval
-- These queries enable semantic search across all memories with crew member alignment

-- Query 1: Semantic Search with Crew Member Alignment
-- Usage: Find relevant knowledge across global and crew-specific embeddings
CREATE OR REPLACE FUNCTION semantic_search_with_crew_alignment(
    query_text TEXT,
    query_embedding vector(1536),
    crew_member_filter TEXT DEFAULT NULL,
    similarity_threshold REAL DEFAULT 0.7,
    max_results INTEGER DEFAULT 20
)
RETURNS TABLE (
    knowledge_source TEXT,
    memory_id TEXT,
    title TEXT,
    description TEXT,
    similarity_score REAL,
    crew_member TEXT,
    crew_responsibilities TEXT,
    universal_applicability BOOLEAN,
    content_preview TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH global_knowledge AS (
        SELECT 
            'global'::TEXT as knowledge_source,
            m.memory_id,
            m.title,
            m.description,
            1 - (e.embedding <=> query_embedding) as similarity_score,
            NULL::TEXT as crew_member,
            NULL::TEXT as crew_responsibilities,
            m.universal_applicability,
            LEFT(m.content::text, 200) as content_preview
        FROM alex_ai_memory_embeddings e
        JOIN alex_ai_memories m ON e.memory_id = m.memory_id
        WHERE e.embedding_type = 'global'
        AND e.crew_member IS NULL
        AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
    ),
    crew_knowledge AS (
        SELECT 
            'crew_specific'::TEXT as knowledge_source,
            m.memory_id,
            m.title,
            m.description,
            1 - (e.embedding <=> query_embedding) as similarity_score,
            e.crew_member,
            m.content->'crew_integration'->>e.crew_member as crew_responsibilities,
            m.universal_applicability,
            LEFT(m.content::text, 200) as content_preview
        FROM alex_ai_memory_embeddings e
        JOIN alex_ai_memories m ON e.memory_id = m.memory_id
        WHERE e.embedding_type = 'crew_specific'
        AND (crew_member_filter IS NULL OR e.crew_member = crew_member_filter)
        AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
    )
    SELECT * FROM global_knowledge
    UNION ALL
    SELECT * FROM crew_knowledge
    ORDER BY similarity_score DESC
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Query 2: Get Crew Member Expertise
-- Usage: Find what each crew member knows about a specific topic
CREATE OR REPLACE FUNCTION get_crew_expertise(
    query_embedding vector(1536),
    topic TEXT DEFAULT NULL,
    similarity_threshold REAL DEFAULT 0.6
)
RETURNS TABLE (
    crew_member TEXT,
    expertise_area TEXT,
    memory_id TEXT,
    title TEXT,
    similarity_score REAL,
    responsibilities TEXT,
    knowledge_depth TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.crew_member,
        CASE 
            WHEN e.crew_member = 'captain_picard' THEN 'Strategic Leadership'
            WHEN e.crew_member = 'commander_data' THEN 'Analytics & Pattern Recognition'
            WHEN e.crew_member = 'lieutenant_geordi' THEN 'Technical Integration'
            WHEN e.crew_member = 'lieutenant_worf' THEN 'Security & Validation'
            WHEN e.crew_member = 'dr_crusher' THEN 'Health & Diagnostics'
            WHEN e.crew_member = 'commander_riker' THEN 'Tactical Execution'
            WHEN e.crew_member = 'counselor_troi' THEN 'User Experience'
            WHEN e.crew_member = 'lieutenant_uhura' THEN 'Communication'
            WHEN e.crew_member = 'quark' THEN 'Business Optimization'
        END as expertise_area,
        m.memory_id,
        m.title,
        1 - (e.embedding <=> query_embedding) as similarity_score,
        m.content->'crew_integration'->>e.crew_member as responsibilities,
        CASE 
            WHEN 1 - (e.embedding <=> query_embedding) > 0.8 THEN 'Expert'
            WHEN 1 - (e.embedding <=> query_embedding) > 0.6 THEN 'Knowledgeable'
            WHEN 1 - (e.embedding <=> query_embedding) > 0.4 THEN 'Familiar'
            ELSE 'Basic'
        END as knowledge_depth
    FROM alex_ai_memory_embeddings e
    JOIN alex_ai_memories m ON e.memory_id = m.memory_id
    WHERE e.embedding_type = 'crew_specific'
    AND e.crew_member IS NOT NULL
    AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
    AND (topic IS NULL OR m.title ILIKE '%' || topic || '%' OR m.description ILIKE '%' || topic || '%')
    ORDER BY e.crew_member, similarity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Query 3: Find Related Memories
-- Usage: Discover related knowledge based on vector similarity
CREATE OR REPLACE FUNCTION find_related_memories(
    source_memory_id TEXT,
    query_embedding vector(1536),
    max_relations INTEGER DEFAULT 10,
    similarity_threshold REAL DEFAULT 0.5
)
RETURNS TABLE (
    related_memory_id TEXT,
    title TEXT,
    description TEXT,
    similarity_score REAL,
    relationship_type TEXT,
    shared_concepts TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.memory_id as related_memory_id,
        m.title,
        m.description,
        1 - (e.embedding <=> query_embedding) as similarity_score,
        CASE 
            WHEN 1 - (e.embedding <=> query_embedding) > 0.8 THEN 'Highly Related'
            WHEN 1 - (e.embedding <=> query_embedding) > 0.6 THEN 'Related'
            WHEN 1 - (e.embedding <=> query_embedding) > 0.4 THEN 'Somewhat Related'
            ELSE 'Loosely Related'
        END as relationship_type,
        m.tags as shared_concepts
    FROM alex_ai_memory_embeddings e
    JOIN alex_ai_memories m ON e.memory_id = m.memory_id
    WHERE e.memory_id != source_memory_id
    AND e.embedding_type = 'global'
    AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
    ORDER BY similarity_score DESC
    LIMIT max_relations;
END;
$$ LANGUAGE plpgsql;

-- Query 4: Get Knowledge Gaps
-- Usage: Identify areas where knowledge might be missing
CREATE OR REPLACE FUNCTION identify_knowledge_gaps(
    query_embedding vector(1536),
    crew_member_filter TEXT DEFAULT NULL,
    similarity_threshold REAL DEFAULT 0.3
)
RETURNS TABLE (
    crew_member TEXT,
    knowledge_gap_area TEXT,
    existing_knowledge_count INTEGER,
    gap_severity TEXT,
    recommended_actions TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH crew_knowledge_counts AS (
        SELECT 
            e.crew_member,
            COUNT(*) as knowledge_count
        FROM alex_ai_memory_embeddings e
        WHERE e.embedding_type = 'crew_specific'
        AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
        GROUP BY e.crew_member
    )
    SELECT 
        ckc.crew_member,
        CASE 
            WHEN ckc.knowledge_count = 0 THEN 'No Knowledge'
            WHEN ckc.knowledge_count < 3 THEN 'Limited Knowledge'
            WHEN ckc.knowledge_count < 5 THEN 'Moderate Knowledge'
            ELSE 'Good Knowledge'
        END as knowledge_gap_area,
        ckc.knowledge_count as existing_knowledge_count,
        CASE 
            WHEN ckc.knowledge_count = 0 THEN 'Critical'
            WHEN ckc.knowledge_count < 3 THEN 'High'
            WHEN ckc.knowledge_count < 5 THEN 'Medium'
            ELSE 'Low'
        END as gap_severity,
        CASE 
            WHEN ckc.knowledge_count = 0 THEN ARRAY['Create new memory', 'Train crew member', 'Assign mentor']
            WHEN ckc.knowledge_count < 3 THEN ARRAY['Expand knowledge', 'Add more examples', 'Cross-train']
            WHEN ckc.knowledge_count < 5 THEN ARRAY['Refine knowledge', 'Add edge cases', 'Update practices']
            ELSE ARRAY['Maintain knowledge', 'Share expertise', 'Mentor others']
        END as recommended_actions
    FROM crew_knowledge_counts ckc
    WHERE (crew_member_filter IS NULL OR ckc.crew_member = crew_member_filter)
    ORDER BY ckc.knowledge_count ASC;
END;
$$ LANGUAGE plpgsql;

-- Query 5: Get Knowledge Evolution
-- Usage: Track how knowledge has evolved over time
CREATE OR REPLACE FUNCTION get_knowledge_evolution(
    memory_id_param TEXT,
    time_period_months INTEGER DEFAULT 6
)
RETURNS TABLE (
    evolution_stage TEXT,
    date_range TEXT,
    memory_count INTEGER,
    key_topics TEXT[],
    crew_involvement TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH memory_timeline AS (
        SELECT 
            m.memory_id,
            m.created_at,
            m.updated_at,
            m.title,
            m.tags,
            EXTRACT(MONTH FROM AGE(m.created_at)) as months_old
        FROM alex_ai_memories m
        WHERE m.memory_id = memory_id_param
        OR m.memory_id IN (
            SELECT related_memory_id 
            FROM find_related_memories(memory_id_param, 
                (SELECT embedding FROM alex_ai_memory_embeddings WHERE memory_id = memory_id_param LIMIT 1),
                20, 0.5
            )
        )
    )
    SELECT 
        CASE 
            WHEN months_old < 1 THEN 'Recent'
            WHEN months_old < 3 THEN 'Current'
            WHEN months_old < 6 THEN 'Established'
            ELSE 'Legacy'
        END as evolution_stage,
        CASE 
            WHEN months_old < 1 THEN 'Last Month'
            WHEN months_old < 3 THEN 'Last 3 Months'
            WHEN months_old < 6 THEN 'Last 6 Months'
            ELSE 'Older than 6 Months'
        END as date_range,
        COUNT(*) as memory_count,
        array_agg(DISTINCT unnest(tags)) as key_topics,
        ARRAY['captain_picard', 'commander_data', 'lieutenant_geordi'] as crew_involvement
    FROM memory_timeline
    GROUP BY 
        CASE 
            WHEN months_old < 1 THEN 'Recent'
            WHEN months_old < 3 THEN 'Current'
            WHEN months_old < 6 THEN 'Established'
            ELSE 'Legacy'
        END,
        CASE 
            WHEN months_old < 1 THEN 'Last Month'
            WHEN months_old < 3 THEN 'Last 3 Months'
            WHEN months_old < 6 THEN 'Last 6 Months'
            ELSE 'Older than 6 Months'
        END
    ORDER BY months_old ASC;
END;
$$ LANGUAGE plpgsql;

-- Query 6: Get Comprehensive Knowledge Summary
-- Usage: Get a complete overview of knowledge for a specific query
CREATE OR REPLACE FUNCTION get_comprehensive_knowledge_summary(
    query_text TEXT,
    query_embedding vector(1536)
)
RETURNS TABLE (
    summary_type TEXT,
    summary_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH global_summary AS (
        SELECT 
            'global_knowledge'::TEXT as summary_type,
            jsonb_build_object(
                'total_memories', COUNT(*),
                'avg_similarity', AVG(1 - (e.embedding <=> query_embedding)),
                'top_memories', jsonb_agg(
                    jsonb_build_object(
                        'memory_id', m.memory_id,
                        'title', m.title,
                        'similarity', 1 - (e.embedding <=> query_embedding)
                    ) ORDER BY 1 - (e.embedding <=> query_embedding) DESC
                )
            ) as summary_data
        FROM alex_ai_memory_embeddings e
        JOIN alex_ai_memories m ON e.memory_id = m.memory_id
        WHERE e.embedding_type = 'global'
        AND 1 - (e.embedding <=> query_embedding) > 0.5
    ),
    crew_summary AS (
        SELECT 
            'crew_knowledge'::TEXT as summary_type,
            jsonb_build_object(
                'crew_members', jsonb_agg(
                    jsonb_build_object(
                        'crew_member', e.crew_member,
                        'knowledge_count', COUNT(*),
                        'avg_similarity', AVG(1 - (e.embedding <=> query_embedding))
                    )
                )
            ) as summary_data
        FROM alex_ai_memory_embeddings e
        WHERE e.embedding_type = 'crew_specific'
        AND 1 - (e.embedding <=> query_embedding) > 0.5
        GROUP BY e.crew_member
    )
    SELECT * FROM global_summary
    UNION ALL
    SELECT * FROM crew_summary;
END;
$$ LANGUAGE plpgsql;

-- Example Usage Queries:

-- Example 1: Semantic search with crew alignment
-- SELECT * FROM semantic_search_with_crew_alignment(
--     'create pull request',
--     array_to_vector(ARRAY[0.1, 0.2, 0.3]::real[] || ARRAY(SELECT random() FROM generate_series(1, 1533))::real[]),
--     'captain_picard',
--     0.7,
--     10
-- );

-- Example 2: Get crew expertise
-- SELECT * FROM get_crew_expertise(
--     array_to_vector(ARRAY[0.1, 0.2, 0.3]::real[] || ARRAY(SELECT random() FROM generate_series(1, 1533))::real[]),
--     'pull request',
--     0.6
-- );

-- Example 3: Find related memories
-- SELECT * FROM find_related_memories(
--     'professional_pr_creation_capability',
--     array_to_vector(ARRAY[0.1, 0.2, 0.3]::real[] || ARRAY(SELECT random() FROM generate_series(1, 1533))::real[]),
--     10,
--     0.5
-- );
