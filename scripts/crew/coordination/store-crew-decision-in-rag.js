#!/usr/bin/env node

/**
 * STORE CREW DECISION IN RAG SYSTEM
 * 
 * Captures crew architectural decisions, unanimous votes, and technical solutions
 * Stores them in Supabase via n8n for future reference
 * 
 * Usage: node store-crew-decision-in-rag.js <decision-file.json>
 * 
 * Crew: Commander Data (knowledge management), Chief O'Brien (automation)
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

function loadCredentials() {
  const zshrcPath = `${process.env.HOME}/.zshrc`;
  const zshrc = fs.readFileSync(zshrcPath, 'utf8');
  
  const getEnvVar = (name) => {
    const match = zshrc.match(new RegExp(`export ${name}="([^"]+)"`));
    return match ? match[1] : process.env[name];
  };
  
  return {
    n8nUrl: getEnvVar('N8N_URL') || 'https://n8n.pbradygeorgen.com',
    supabaseUrl: getEnvVar('SUPABASE_URL'),
    supabaseServiceKey: getEnvVar('SUPABASE_SERVICE_KEY')
  };
}

const { n8nUrl, supabaseUrl, supabaseServiceKey } = loadCredentials();

/**
 * Create crew decision payload for RAG storage
 */
function createCrewDecisionPayload(crewMemory) {
  // Handle both simple and complex crew memory formats
  const isRichFormat = crewMemory.critical_decisions && crewMemory.crew_members_involved;
  
  if (isRichFormat) {
    // Rich format from comprehensive crew memory
    return {
      session_id: crewMemory.conversation_id || `crew-decision-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'crew_memory_comprehensive',
      
      // Core data
      title: crewMemory.title,
      executive_summary: crewMemory.executive_summary,
      session_duration: crewMemory.session_duration,
      crew_members: crewMemory.crew_members_involved || [],
      
      // Decisions
      critical_decisions: crewMemory.critical_decisions || [],
      bugs_fixed: crewMemory.bugs_fixed || [],
      technical_patterns: crewMemory.technical_patterns_discovered || [],
      
      // Knowledge
      lessons_learned: crewMemory.lessons_learned || [],
      user_insights: crewMemory.user_insights || [],
      architectural_decisions: crewMemory.architectural_decisions_for_rag || [],
      knowledge_base_entries: crewMemory.knowledge_base_entries || [],
      
      // Metadata
      tags: [
        'crew-memory',
        'comprehensive-session',
        ...(crewMemory.key_topics || []),
        ...(crewMemory.rag_storage_metadata?.tags || [])
      ],
      
      // Searchable content for vector embedding
      searchable_content: JSON.stringify(crewMemory, null, 2),
      
      // Milestones and artifacts
      git_data: crewMemory.git_milestone_data,
      artifacts: crewMemory.technical_artifacts
    };
  } else {
    // Simple format (backward compatibility)
    return {
      session_id: `crew-decision-${Date.now()}`,
      timestamp: new Date().toISOString(),
      category: 'crew_architectural_decision',
      title: crewMemory.title,
      issue: crewMemory.issue,
      severity: crewMemory.severity || 'medium',
      crew_votes: crewMemory.crew_votes || {},
      unanimous: crewMemory.unanimous || false,
      tags: ['crew-decision', 'architectural-decision'],
      searchable_content: JSON.stringify(crewMemory)
    };
  }
}

/**
 * Store in RAG via Supabase directly (fallback when n8n webhooks are down)
 */
async function storeViaSupabase(payload) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/knowledge_base', supabaseUrl);
    
    // Transform payload for Supabase schema
    const supabaseData = {
      session_id: payload.session_id,
      category: payload.category || 'crew_memory_comprehensive',
      title: payload.title,
      executive_summary: payload.executive_summary || '',
      content: JSON.parse(payload.searchable_content || '{}'),
      tags: payload.tags || [],
      session_date: payload.session_date || new Date().toISOString().split('T')[0],
      crew_members: payload.crew_members || [],
      critical_decisions: payload.critical_decisions || [],
      bugs_fixed: payload.bugs_fixed || [],
      technical_patterns: payload.technical_patterns || [],
      lessons_learned: payload.lessons_learned || [],
      user_insights: payload.user_insights || [],
      architectural_decisions: payload.architectural_decisions || [],
      knowledge_base_entries: payload.knowledge_base_entries || []
    };
    
    const data = JSON.stringify(supabaseData);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, data: body, method: 'supabase-direct' });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Store in RAG via n8n webhook (preferred) with Supabase fallback
 */
async function storeInRAG(payload) {
  // Try n8n webhook first (proper DDD architecture)
  try {
    const result = await new Promise((resolve, reject) => {
      const url = new URL('/webhook/knowledge-ingest', n8nUrl);
      
      const data = JSON.stringify(payload);
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        }
      };
      
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: body, method: 'n8n-webhook' });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
    
    return result;
  } catch (error) {
    console.warn('⚠️  n8n webhook failed, using Supabase fallback...');
    console.warn(`   Reason: ${error.message}`);
    console.log('');
    
    // Fallback to direct Supabase API
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase credentials not found in ~/.zshrc (fallback unavailable)');
    }
    
    return await storeViaSupabase(payload);
  }
}

/**
 * Main execution
 */
(async () => {
  console.log('📚 STORE CREW DECISION IN RAG');
  console.log('==============================');
  console.log('');
  
  // Check if decision file provided
  const decisionFile = process.argv[2];
  
  if (!decisionFile) {
    console.log('Usage: node store-crew-decision-in-rag.js <decision-file.json>');
    console.log('');
    console.log('Or create decision inline:');
    console.log('');
    console.log('Example decision file:');
    console.log(JSON.stringify({
      title: 'Two-Layer Theme System',
      issue: 'Theme system regression - lost project-level themes',
      severity: 'high',
      unanimous: true,
      approval_count: 7,
      total_crew: 7,
      crew_votes: {
        picard: { vote: 'approve', reason: 'Separation of concerns is paramount' },
        obrien: { vote: 'approve', reason: 'Simple fix - scope the CSS variables' },
        data: { vote: 'approve', reason: 'Logical. Projects maintain isolation' }
      },
      problem_statement: 'GlobalThemeStyles contaminated project themes',
      solution_approved: 'Scope CSS variables to .dashboard-theme-wrapper class',
      implementation_steps: [
        'Modify GlobalThemeStyles to scope to dashboard only',
        'Ensure project iframes use their own theme',
        'Test independence'
      ],
      files_affected: [
        'dashboard/components/GlobalThemeStyles.tsx',
        'dashboard/app/dashboard/dashboard-content.tsx'
      ],
      commits: ['6676ce8', 'eaadd8c'],
      milestone: 'v1.4.1',
      architectural_pattern: 'two-layer-theme-isolation',
      lessons_learned: 'Always maintain clear separation between dashboard and project themes'
    }, null, 2));
    process.exit(0);
  }
  
  // Load decision from file
  const decisionPath = path.resolve(decisionFile);
  
  if (!fs.existsSync(decisionPath)) {
    console.error(`❌ Decision file not found: ${decisionPath}`);
    process.exit(1);
  }
  
  const decision = JSON.parse(fs.readFileSync(decisionPath, 'utf8'));
  
  console.log(`📋 Decision: ${decision.title}`);
  console.log(`   Issue: ${decision.issue}`);
  console.log(`   Severity: ${decision.severity || 'medium'}`);
  console.log(`   Crew Vote: ${decision.approval_count}/${decision.total_crew} ${decision.unanimous ? '(UNANIMOUS)' : ''}`);
  console.log('');
  
  // Create RAG payload
  const payload = createCrewDecisionPayload(decision);
  
  console.log('📤 Storing in RAG system...');
  console.log(`   Webhook: ${n8nUrl}/webhook/knowledge-ingest`);
  console.log(`   Session: ${payload.session_id}`);
  console.log('');
  
  try {
    const result = await storeInRAG(payload);
    console.log('✅ STORED IN RAG!');
    console.log(`   Status: ${result.status}`);
    console.log(`   Method: ${result.method || 'n8n-webhook'}`);
    if (result.method === 'supabase-direct') {
      console.log('   ⚠️  Used Supabase fallback (n8n webhooks unavailable)');
    }
    console.log('');
    console.log('🎉 Crew decision saved for future reference!');
    console.log('');
    console.log('Future crews can now learn from this decision when facing similar issues.');
  } catch (error) {
    console.error('❌ Failed to store in RAG:', error.message);
    console.error('');
    console.error('⚠️  Decision file saved locally but not in RAG system');
    process.exit(1);
  }
})();

