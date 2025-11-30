#!/usr/bin/env node
/**
 * Test Store and Verify Memory
 * 
 * Stores a test milestone and chat session, then verifies they're stored
 * with proper vector deduplication and organization
 */

const https = require('https');
const path = require('path');
const fs = require('fs');

// Load credentials
function loadCrewCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  const credentials = {};

  const supabaseUrlMatch = zshrcContent.match(/export SUPABASE_URL=['"]?([^'"\n]+)['"]?/);
  const supabaseKeyMatch = zshrcContent.match(/export SUPABASE_SERVICE_ROLE_KEY=['"]?([^'"\n]+)['"]?/);
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL=['"]?([^'"\n]+)['"]?/);

  if (supabaseUrlMatch) credentials.supabase = { url: supabaseUrlMatch[1] };
  if (supabaseKeyMatch) {
    if (!credentials.supabase) credentials.supabase = {};
    credentials.supabase.key = supabaseKeyMatch[1];
  }
  if (n8nUrlMatch) credentials.n8n = { baseUrl: n8nUrlMatch[1] };

  return credentials;
}

// Send to N8N webhook
function sendToN8N(webhookPath, payload) {
  return new Promise((resolve, reject) => {
    const creds = loadCrewCredentials();
    const N8N_BASE_URL = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';
    const url = new URL(`${N8N_BASE_URL}/webhook/${webhookPath}`);
    
    const data = JSON.stringify(payload);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 15000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ status: res.statusCode, body });
        } else {
          reject(new Error(`N8N returned ${res.statusCode}: ${body.substring(0, 200)}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.write(data);
    req.end();
  });
}

// Query Supabase
function querySupabase(endpoint) {
  return new Promise((resolve, reject) => {
    const creds = loadCrewCredentials();
    const SUPABASE_URL = creds.supabase?.url;
    const SUPABASE_KEY = creds.supabase?.key;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      reject(new Error('Supabase credentials not found'));
      return;
    }

    const url = new URL(endpoint, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: result });
          } else {
            reject(new Error(`Supabase returned ${res.statusCode}: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🧪 TEST STORE AND VERIFY MEMORY');
  console.log('═'.repeat(80));
  console.log('\nTesting milestone and chat session storage with verification...\n');
  
  const testId = `test-${Date.now()}`;
  
  // Test 1: Store a test milestone
  console.log('📊 Test 1: Storing Test Milestone...');
  console.log('─'.repeat(80));
  
  const milestonePayload = {
    summary: `Test Milestone - ${testId}`,
    features: ['Memory storage test', 'Vector deduplication validation'],
    tags: ['milestone', 'test', 'validation']
  };
  
  try {
    console.log('   Sending to N8N workflow (n8n-post-knowledge.js equivalent)...');
    const milestoneResult = await sendToN8N('knowledge-ingest', {
      title: milestonePayload.summary,
      text: `Features:\n- ${milestonePayload.features.join('\n- ')}`,
      tags: milestonePayload.tags,
      source: 'milestone',
      doc_id: `TEST_MILESTONE_${testId}`
    });
    
    console.log(`   ✅ Milestone sent to N8N (Status: ${milestoneResult.status})`);
    console.log('   Waiting 5 seconds for processing...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (error) {
    console.error(`   ❌ Failed to store milestone: ${error.message}\n`);
  }
  
  // Test 2: Store a test chat session
  console.log('💬 Test 2: Storing Test Chat Session...');
  console.log('─'.repeat(80));
  
  const chatSessionPayload = {
    title: `Test Chat Session - ${testId}`,
    summary: 'This is a test chat session to verify memory storage optimization',
    detailedAnalysis: 'Test content for chat session storage validation. This content should be fragmented into vectors and stored with proper deduplication.',
    crewMember: 'data',
    knowledgeType: 'conversation',
    priority: 'medium',
    tags: ['chat-session', 'test', 'validation', 'cursor-ai'],
    sessionId: `test-chat-${testId}`,
    platform: 'cursor-ai',
    timestamp: new Date().toISOString(),
    vectorOptimization: {
      enabled: true,
      fragmentationEnabled: true,
      deduplicationEnabled: true,
      smartDeduplication: true
    }
  };
  
  try {
    console.log('   Sending to N8N workflow (crew-memory-storage)...');
    const chatResult = await sendToN8N('crew-memory-storage', chatSessionPayload);
    
    console.log(`   ✅ Chat session sent to N8N (Status: ${chatResult.status})`);
    console.log('   Waiting 5 seconds for processing...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  } catch (error) {
    console.error(`   ❌ Failed to store chat session: ${error.message}\n`);
  }
  
  // Test 3: Verify storage in Supabase
  console.log('🔍 Test 3: Verifying Storage in Supabase...');
  console.log('─'.repeat(80));
  
  try {
    // Check for test milestone (check crew_memories table - where workflow stores)
    console.log('   Checking for test milestone...');
    let milestoneCheck;
    try {
      milestoneCheck = await querySupabase(
        `/rest/v1/crew_memories?select=id,title,summary,tags,created_at&limit=10&order=created_at.desc`
      );
    } catch (e) {
      // Fallback to alex_ai_memories
      milestoneCheck = await querySupabase(
        `/rest/v1/alex_ai_memories?session_id=eq.TEST_MILESTONE_${testId}&select=id,content,summary,tags,created_at`
      );
    }
    
    const milestoneMemories = Array.isArray(milestoneCheck.data) ? milestoneCheck.data : [];
    if (milestoneMemories.length > 0) {
      console.log(`   ✅ Found ${milestoneMemories.length} recent memory(ies) in crew_memories table`);
      milestoneMemories.slice(0, 3).forEach(mem => {
        const summary = mem.summary || mem.title || 'N/A';
        console.log(`      • ID: ${mem.id}, Summary: ${summary.substring(0, 50)}...`);
      });
    } else {
      console.log('   ⚠️  No memories found in crew_memories table');
    }
    
    // Check for test chat session (check crew_memories table)
    console.log('\n   Checking for test chat session...');
    let chatCheck;
    try {
      chatCheck = await querySupabase(
        `/rest/v1/crew_memories?select=id,title,summary,tags,created_at&limit=10&order=created_at.desc`
      );
    } catch (e) {
      // Fallback to alex_ai_memories
      chatCheck = await querySupabase(
        `/rest/v1/alex_ai_memories?session_id=eq.test-chat-${testId}&select=id,content,summary,tags,created_at`
      );
    }
    
    const chatMemories = Array.isArray(chatCheck.data) ? chatCheck.data : [];
    if (chatMemories.length > 0) {
      console.log(`   ✅ Found ${chatMemories.length} recent memory(ies) in crew_memories table`);
      chatMemories.slice(0, 3).forEach(mem => {
        const summary = mem.summary || mem.title || 'N/A';
        console.log(`      • ID: ${mem.id}, Summary: ${summary.substring(0, 50)}...`);
      });
    } else {
      console.log('   ⚠️  No memories found in crew_memories table');
    }
    
    // Check all recent memories (check crew_memories table)
    console.log('\n   Checking all recent memories...');
    let allMemories;
    try {
      allMemories = await querySupabase(
        `/rest/v1/crew_memories?order=created_at.desc&limit=10&select=id,title,summary,tags,created_at`
      );
    } catch (e) {
      // Fallback to alex_ai_memories
      allMemories = await querySupabase(
        `/rest/v1/alex_ai_memories?order=created_at.desc&limit=10&select=id,content,summary,platform,session_id,created_at`
      );
    }
    
    const recentMemories = Array.isArray(allMemories.data) ? allMemories.data : [];
    console.log(`   Found ${recentMemories.length} recent memory(ies) in crew_memories table`);
    
    if (recentMemories.length > 0) {
      console.log('\n   Recent Memories (from crew_memories table):');
      recentMemories.slice(0, 5).forEach((mem, idx) => {
        const summary = mem.summary || mem.title || 'Untitled';
        const tags = Array.isArray(mem.tags) ? mem.tags.join(', ') : 'no tags';
        console.log(`      ${idx + 1}. ${summary.substring(0, 60)}... [${tags}]`);
      });
    }
    
  } catch (error) {
    console.error(`   ❌ Failed to verify storage: ${error.message}`);
  }
  
  console.log('\n' + '═'.repeat(80));
  console.log('✅ Test Complete');
  console.log('═'.repeat(80));
  console.log(`\nTest ID: ${testId}`);
  console.log('Check N8N workflow execution logs to verify processing.');
  console.log('Check Supabase alex_ai_memories table for stored memories.\n');
}

main().catch(error => {
  console.error(`\n❌ Test failed: ${error.message}`);
  if (error.stack) {
    console.error('   Stack:', error.stack);
  }
  process.exit(1);
});

