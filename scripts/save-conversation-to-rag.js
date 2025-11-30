#!/usr/bin/env node

/**
 * Save Cursor AI Conversation to RAG System
 * 
 * Captures the current conversation and sends it to n8n => Supabase RAG
 * for crew learning and future reference
 * 
 * Crew: Lieutenant Uhura (Knowledge Capture) + Commander Data (Memory Systems)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get credentials
function getCredential(key) {
  try {
    const zshrc = fs.readFileSync(`${process.env.HOME}/.zshrc`, 'utf8');
    const match = zshrc.match(new RegExp(`export ${key}="([^"]+)"`)) ||
                  zshrc.match(new RegExp(`export ${key}=([^\n]+)`));
    return match ? match[1].replace(/"/g, '').trim() : null;
  } catch (error) {
    return null;
  }
}

const N8N_URL = getCredential('N8N_URL') || 'https://n8n.pbradygeorgen.com';

console.log('💾 Saving Conversation to RAG System');
console.log('=====================================');
console.log('');
console.log('DDD Flow: Script => n8n => Supabase RAG');
console.log('');

// Conversation summary
const conversationSummary = {
  title: 'DDD Architecture Completion - Temporal Wake Integration',
  date: new Date().toISOString(),
  topics: [
    'Temporal Wake diplomatic integration (foreign system embedding)',
    'DDD architecture completion (Client => n8n => Supabase)',
    'n8n workflow automation deployment',
    'Supabase migration strategy',
    'Creative vs Business project differentiation',
    'localStorage violations and proper architecture',
    'Crew-based decision making process',
    'Terminal automation philosophy'
  ],
  keyDecisions: [
    {
      decision: 'Integrate Temporal Wake as embedded creative project',
      crew: ['Captain Picard', 'Chief O\'Brien', 'Counselor Troi', 'Lt. Cmdr. La Forge'],
      rationale: 'Diplomatic integration - embed foreign systems rather than rebuild',
      outcome: 'Created /creative/[projectId] route with tab navigation'
    },
    {
      decision: 'Build n8n workflows to complete DDD architecture',
      crew: ['Captain Picard', 'Commander Data', 'Lt. Cmdr. La Forge', 'Chief O\'Brien'],
      vote: '5-0-1 in favor',
      rationale: 'Architectural integrity over temporary shortcuts',
      outcome: '3 n8n workflows deployed and active'
    },
    {
      decision: 'Accept 95% automation with pragmatic manual steps',
      crew: ['Chief O\'Brien', 'Captain Picard'],
      rationale: 'Supabase REST API cannot execute DDL - platform limitation',
      outcome: '7 minutes one-time manual setup, everything else automated'
    }
  ],
  technicalAchievements: [
    'Added projectType field to differentiate business vs creative projects',
    'Created tab-based navigation UI for Temporal Wake content',
    'Built 3 n8n workflows (store, retrieve, delete)',
    'Automated n8n deployment via API',
    'Created Supabase migration SQL with RLS policies',
    'Temporal project now shows screenplay, novel, outline, character map, timeline',
    'Fixed monorepo workspace conflicts (@alex-ai/vscode-extension, @alex-ai/universal-core)',
    'Resolved Next.js routing errors (removed [page]/page.tsx)',
    'Created pure terminal automation scripts'
  ],
  architecturalLessons: [
    'localStorage as source of truth violates DDD - identified and corrected',
    'Foreign system integration via iframe embedding preserves functionality',
    'Automation scripts should extract credentials from ~/.zshrc',
    'Platform limitations (REST API DDL) require pragmatic exceptions',
    'One-time infrastructure setup can be manual, ongoing operations must be automated',
    'Tab navigation superior to dropdown for content exploration',
    'Creative projects need different UX than business projects'
  ],
  filesCreated: [
    'dashboard/app/creative/[projectId]/page.tsx - Creative project route with navigation',
    'n8n-workflows/project-workflows/*.json - 3 DDD workflows',
    'scripts/deploy-project-workflows.sh - Automated n8n deployment',
    'scripts/automated-ddd-setup.sh - Master automation script',
    'scripts/supabase-migrate-automated.js - Pure Node.js migration',
    'scripts/open-supabase-sql-editor.sh - One-click SQL editor',
    'supabase/migrations/001_create_projects_table.sql - Complete schema',
    'DDD_COMPLETION_GUIDE.md - Comprehensive documentation'
  ],
  crewContributions: {
    'Captain Picard': 'Strategic architecture decisions, DDD philosophy enforcement',
    'Commander Data': 'Technical analysis of storage strategies, API limitations',
    'Lt. Cmdr. La Forge': 'Infrastructure automation, deployment scripts',
    'Chief O\'Brien': 'Pragmatic implementation, automation philosophy',
    'Counselor Troi': 'UX design for creative vs business projects',
    'Lieutenant Uhura': 'Documentation, knowledge capture'
  },
  userInsights: [
    'Identified localStorage as DDD violation',
    'Questioned why manual UI when we have terminal access',
    'Emphasized consistency in automation approach',
    'Correctly pushed for proper architecture over shortcuts'
  ],
  nextSteps: [
    'Run Supabase migration (2 min manual)',
    'Configure n8n Supabase credential (3 min manual)',
    'Link workflows to credential (2 min manual)',
    'Update dashboard to fetch from Supabase on mount',
    'Deprecate clear-state utility (no longer needed)'
  ]
};

async function saveToRAG() {
  try {
    console.log('📤 Posting to n8n knowledge-ingest webhook...');
    
    const response = await fetch(`${N8N_URL}/webhook/knowledge-ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'cursor-ai-conversation'
      },
      body: JSON.stringify({
        event_type: 'cursor_conversation',
        conversation_summary: conversationSummary,
        timestamp: new Date().toISOString(),
        session_id: `cursor-${Date.now()}`,
        metadata: {
          total_duration: '~2 hours',
          commits_made: 12,
          workflows_deployed: 3,
          automation_percentage: 95,
          crew_members_consulted: 6
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Conversation saved to RAG successfully!');
      console.log('');
      console.log('📊 Summary:');
      console.log(`   Topics: ${conversationSummary.topics.length}`);
      console.log(`   Key Decisions: ${conversationSummary.keyDecisions.length}`);
      console.log(`   Technical Achievements: ${conversationSummary.technicalAchievements.length}`);
      console.log(`   Files Created: ${conversationSummary.filesCreated.length}`);
      console.log('');
      console.log('🧠 Crew will now have access to this knowledge for future queries!');
      console.log('');
      return true;
    } else {
      const error = await response.text();
      console.log('⚠️  Knowledge ingest returned non-OK:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Failed to save to RAG:', error.message);
    console.log('');
    console.log('⚠️  Non-blocking - continuing with DDD setup');
    return false;
  }
}

console.log('📝 Conversation Summary:');
console.log('');
console.log(`   Title: ${conversationSummary.title}`);
console.log(`   Topics: ${conversationSummary.topics.length}`);
console.log(`   Decisions: ${conversationSummary.keyDecisions.length}`);
console.log(`   Achievements: ${conversationSummary.technicalAchievements.length}`);
console.log('');

saveToRAG().then(success => {
  if (success) {
    console.log('🖖 Knowledge preserved for the crew!');
    console.log('');
    console.log('Next: Run Supabase migration');
    console.log('  bash scripts/open-supabase-sql-editor.sh');
  } else {
    console.log('⚠️  Could not save to RAG (webhook may not exist)');
    console.log('   Continuing anyway...');
  }
});

