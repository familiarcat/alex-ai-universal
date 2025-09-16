-- Supabase RAG Queries for Professional PR Creation Feature
-- These queries enable retrieval of PR creation capabilities from the RAG system

-- Query 1: Get PR Creation Capability by Search Terms
-- Usage: Search for PR creation capabilities based on user query
CREATE OR REPLACE FUNCTION get_pr_creation_capability(search_query TEXT)
RETURNS TABLE (
    memory_id TEXT,
    title TEXT,
    description TEXT,
    content JSONB,
    relevance_score REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.memory_id,
        m.title,
        m.description,
        m.content,
        ts_rank(
            to_tsvector('english', m.title || ' ' || m.description || ' ' || m.content::text),
            plainto_tsquery('english', search_query)
        ) as relevance_score
    FROM alex_ai_memories m
    WHERE m.memory_id = 'professional_pr_creation_capability'
    AND (
        to_tsvector('english', m.title || ' ' || m.description || ' ' || m.content::text) @@ plainto_tsquery('english', search_query)
        OR search_query ILIKE ANY(SELECT unnest(m.tags))
    )
    ORDER BY relevance_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Query 2: Get All PR-Related Capabilities
-- Usage: Retrieve all PR and git workflow related capabilities
CREATE OR REPLACE FUNCTION get_all_pr_capabilities()
RETURNS TABLE (
    memory_id TEXT,
    title TEXT,
    category TEXT,
    priority TEXT,
    tags TEXT[],
    content JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.memory_id,
        m.title,
        m.category,
        m.priority,
        m.tags,
        m.content
    FROM alex_ai_memories m
    WHERE 'pull-request' = ANY(m.tags) 
    OR 'git' = ANY(m.tags) 
    OR 'workflow' = ANY(m.tags)
    OR m.category = 'feature_discovery'
    ORDER BY 
        CASE m.priority 
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
        END,
        m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Query 3: Get PR Template Structure
-- Usage: Retrieve the PR template structure for immediate use
CREATE OR REPLACE FUNCTION get_pr_template_structure()
RETURNS TABLE (
    template_section TEXT,
    description TEXT,
    required BOOLEAN,
    example_content TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        key as template_section,
        value->>'description' as description,
        COALESCE((value->>'required')::boolean, false) as required,
        value->>'example' as example_content
    FROM alex_ai_memories m,
    LATERAL jsonb_each(m.content->'pr_template_structure') as t(key, value)
    WHERE m.memory_id = 'professional_pr_creation_capability';
END;
$$ LANGUAGE plpgsql;

-- Query 4: Get PR Creation Benefits by Category
-- Usage: Retrieve benefits of PR creation system by category
CREATE OR REPLACE FUNCTION get_pr_creation_benefits(benefit_category TEXT DEFAULT NULL)
RETURNS TABLE (
    category TEXT,
    benefit_name TEXT,
    benefit_description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        key as category,
        benefit_key as benefit_name,
        benefit_value::text as benefit_description
    FROM alex_ai_memories m,
    LATERAL jsonb_each(m.content->'benefits') as benefits(category_key, category_value),
    LATERAL jsonb_each(category_value) as benefit(benefit_key, benefit_value)
    WHERE m.memory_id = 'professional_pr_creation_capability'
    AND (benefit_category IS NULL OR key = benefit_category);
END;
$$ LANGUAGE plpgsql;

-- Query 5: Get Crew Integration for PR Creation
-- Usage: Retrieve how each crew member integrates with PR creation
CREATE OR REPLACE FUNCTION get_crew_pr_integration()
RETURNS TABLE (
    crew_member TEXT,
    integration_role TEXT,
    responsibilities TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        key as crew_member,
        'PR Creation Integration' as integration_role,
        value::text as responsibilities
    FROM alex_ai_memories m,
    LATERAL jsonb_each(m.content->'crew_integration') as crew(crew_key, crew_value)
    WHERE m.memory_id = 'professional_pr_creation_capability';
END;
$$ LANGUAGE plpgsql;

-- Query 6: Search RAG Context for PR Creation
-- Usage: Search the RAG context for PR creation related information
CREATE OR REPLACE FUNCTION search_pr_creation_context(search_terms TEXT[])
RETURNS TABLE (
    memory_id TEXT,
    context_type TEXT,
    matching_terms TEXT[],
    usage_scenarios TEXT[],
    related_concepts TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.memory_id,
        rc.context_type,
        rc.search_terms,
        rc.usage_scenarios,
        rc.related_concepts
    FROM alex_ai_rag_context rc
    WHERE rc.memory_id = 'professional_pr_creation_capability'
    AND (
        search_terms && rc.search_terms
        OR search_terms && rc.related_concepts
        OR search_terms && rc.usage_scenarios
    );
END;
$$ LANGUAGE plpgsql;

-- Query 7: Update Memory Usage Statistics
-- Usage: Track usage of PR creation capability
CREATE OR REPLACE FUNCTION update_pr_creation_usage(
    access_context TEXT,
    success BOOLEAN,
    user_feedback TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO alex_ai_memory_usage (
        memory_id,
        usage_count,
        last_accessed,
        access_context,
        success_rate,
        user_feedback
    ) VALUES (
        'professional_pr_creation_capability',
        1,
        NOW(),
        access_context,
        CASE WHEN success THEN 1.0 ELSE 0.0 END,
        user_feedback
    )
    ON CONFLICT (memory_id) 
    DO UPDATE SET
        usage_count = alex_ai_memory_usage.usage_count + 1,
        last_accessed = NOW(),
        access_context = EXCLUDED.access_context,
        success_rate = (alex_ai_memory_usage.success_rate * alex_ai_memory_usage.usage_count + 
                       CASE WHEN success THEN 1.0 ELSE 0.0 END) / (alex_ai_memory_usage.usage_count + 1),
        user_feedback = COALESCE(EXCLUDED.user_feedback, alex_ai_memory_usage.user_feedback);
END;
$$ LANGUAGE plpgsql;

-- Example Usage Queries:

-- Example 1: Search for PR creation capability
-- SELECT * FROM get_pr_creation_capability('create pull request');

-- Example 2: Get all PR capabilities
-- SELECT * FROM get_all_pr_capabilities();

-- Example 3: Get PR template structure
-- SELECT * FROM get_pr_template_structure();

-- Example 4: Get benefits for development teams
-- SELECT * FROM get_pr_creation_benefits('development_teams');

-- Example 5: Get crew integration
-- SELECT * FROM get_crew_pr_integration();

-- Example 6: Search context
-- SELECT * FROM search_pr_creation_context(ARRAY['pull request', 'documentation']);

-- Example 7: Update usage
-- SELECT update_pr_creation_usage('user_request', true, 'helpful for PR creation');
