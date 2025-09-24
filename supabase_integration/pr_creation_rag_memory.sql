-- Supabase RAG Integration for Professional PR Creation Feature
-- This SQL creates the memory structure for the PR creation capability in Alex AI's RAG system

-- Insert into alex_ai_memories table
INSERT INTO alex_ai_memories (
    memory_id,
    title,
    description,
    category,
    priority,
    tags,
    content,
    created_at,
    updated_at,
    status,
    source_project,
    beam_up_date,
    universal_applicability,
    crew_integration_status
) VALUES (
    'professional_pr_creation_capability',
    'Professional Pull Request Creation - Universal Feature',
    'Comprehensive capability to create well-documented, professional pull requests with automatic content generation and standardized formatting',
    'feature_discovery',
    'high',
    ARRAY['git', 'pull-request', 'documentation', 'workflow', 'universal', 'beam-up', 'esai-discovery'],
    jsonb_build_object(
        'feature_type', 'Git Workflow Enhancement',
        'discovery_context', jsonb_build_object(
            'source_project', 'ESAI (Enterprise Secure AI)',
            'discovery_date', '2025-09-15',
            'discovery_context', 'Chat session discussing git workflow optimization',
            'discoverer', 'Alex AI Crew - Git Workflow Team'
        ),
        'technical_specification', jsonb_build_object(
            'interface', jsonb_build_object(
                'generatePRTitle', 'Creates clear, descriptive PR titles from change summaries',
                'createPRDescription', 'Generates comprehensive PR descriptions with milestone integration',
                'generateTestingInstructions', 'Creates explicit testing instructions based on changes',
                'createImpactAnalysis', 'Analyzes and documents business and technical impact',
                'formatPRTemplate', 'Formats content with proper markdown structure and templates'
            ),
            'implementation_pattern', 'TypeScript interface with git integration and template engine',
            'integration_points', ARRAY['git_operations', 'milestone_system', 'change_analysis', 'template_engine', 'review_system']
        ),
        'pr_template_structure', jsonb_build_object(
            'title', 'Clear, descriptive PR title with context',
            'description', 'Comprehensive overview of changes and rationale',
            'changes_made', 'Detailed list of modifications with file references',
            'impact_analysis', 'Business and technical impact assessment',
            'testing_instructions', 'Step-by-step testing guidelines',
            'review_guidelines', 'Specific areas for reviewer focus',
            'milestone_integration', 'Links to related milestones and tracking',
            'documentation_updates', 'Required documentation changes',
            'screenshots', 'Integration points for visual changes',
            'checklists', 'Interactive task lists for validation'
        ),
        'automatic_content_generation', jsonb_build_object(
            'change_summaries', 'Auto-generated from commit history and file analysis',
            'impact_assessment', 'Analysis of file changes, scope, and dependencies',
            'testing_scenarios', 'Suggested test cases based on change patterns',
            'documentation_detection', 'Auto-detect needed documentation updates',
            'code_examples', 'Syntax-highlighted code blocks for key changes',
            'link_generation', 'Automatic linking to issues, milestones, and documentation'
        ),
        'benefits', jsonb_build_object(
            'development_teams', jsonb_build_object(
                'consistency', 'Standardized PR format across all projects',
                'quality', 'Comprehensive documentation reduces review time',
                'efficiency', 'Faster PR creation with auto-generated content',
                'professionalism', 'High-quality PRs improve team reputation'
            ),
            'project_management', jsonb_build_object(
                'visibility', 'Clear understanding of changes and impact',
                'tracking', 'Better milestone and progress tracking',
                'communication', 'Improved stakeholder communication',
                'documentation', 'Automatic documentation of changes'
            ),
            'code_review', jsonb_build_object(
                'context', 'Rich context for reviewers',
                'focus', 'Clear guidelines on what to review',
                'testing', 'Explicit testing instructions',
                'risk_assessment', 'Impact analysis for risk evaluation'
            )
        ),
        'crew_integration', jsonb_build_object(
            'captain_picard', 'Strategic oversight of PR quality standards and team coordination',
            'commander_data', 'Analytics on PR effectiveness, patterns, and improvement metrics',
            'lieutenant_geordi', 'Technical integration with git systems and automation',
            'lieutenant_worf', 'Security validation of PR content and access controls',
            'dr_crusher', 'Health monitoring of PR creation system performance',
            'commander_riker', 'Tactical execution of PR creation workflows and processes',
            'counselor_troi', 'User experience optimization for PR creation and review flows',
            'lieutenant_uhura', 'Communication standards and documentation quality',
            'quark', 'Business optimization of PR efficiency and stakeholder value'
        ),
        'implementation_roadmap', jsonb_build_object(
            'phase_1', 'Core PR template engine and formatting system',
            'phase_2', 'Automatic content generation and change analysis',
            'phase_3', 'Git integration and milestone system connectivity',
            'phase_4', 'Crew workflow integration and quality standards',
            'phase_5', 'Universal deployment and continuous improvement'
        ),
        'success_metrics', jsonb_build_object(
            'pr_creation_time', 'Reduction in time to create comprehensive PRs',
            'review_quality', 'Improvement in review effectiveness and speed',
            'team_collaboration', 'Enhanced collaboration and communication',
            'documentation_completeness', 'Percentage of PRs with complete documentation',
            'stakeholder_satisfaction', 'Improved understanding and approval rates'
        )
    ),
    NOW(),
    NOW(),
    'active',
    'ESAI (Enterprise Secure AI)',
    '2025-09-15',
    true,
    'distributed'
);

-- Create RAG search index for this memory
CREATE INDEX IF NOT EXISTS idx_pr_creation_rag_search 
ON alex_ai_memories 
USING gin(to_tsvector('english', title || ' ' || description || ' ' || content::text));

-- Create specific tags index for PR creation
CREATE INDEX IF NOT EXISTS idx_pr_creation_tags 
ON alex_ai_memories 
USING gin(tags) 
WHERE 'pull-request' = ANY(tags) OR 'git' = ANY(tags) OR 'workflow' = ANY(tags);

-- Insert related RAG context for better retrieval
INSERT INTO alex_ai_rag_context (
    memory_id,
    context_type,
    search_terms,
    related_concepts,
    usage_scenarios,
    created_at
) VALUES (
    'professional_pr_creation_capability',
    'feature_capability',
    ARRAY[
        'pull request',
        'PR creation',
        'git workflow',
        'code review',
        'documentation',
        'milestone integration',
        'professional formatting',
        'automatic content generation',
        'review guidelines',
        'testing instructions',
        'impact analysis',
        'change summary',
        'PR template',
        'git integration'
    ],
    ARRAY[
        'git_operations',
        'milestone_system',
        'change_analysis',
        'template_engine',
        'review_system',
        'documentation_standards',
        'project_management',
        'code_review',
        'stakeholder_communication',
        'quality_assurance'
    ],
    ARRAY[
        'creating_pull_requests',
        'documenting_changes',
        'review_process',
        'milestone_tracking',
        'project_communication',
        'code_review_workflow',
        'stakeholder_updates',
        'change_management',
        'quality_assurance',
        'team_collaboration'
    ],
    NOW()
);

-- Update memory usage tracking
INSERT INTO alex_ai_memory_usage (
    memory_id,
    usage_count,
    last_accessed,
    access_context,
    success_rate,
    user_feedback
) VALUES (
    'professional_pr_creation_capability',
    0,
    NULL,
    'initial_creation',
    0.0,
    'feature_discovery_beam_up'
);
