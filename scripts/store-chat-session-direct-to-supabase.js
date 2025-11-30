#!/usr/bin/env node
/**
 * Store Chat Session Memory Directly to Supabase
 * 
 * Fallback method when N8N is unavailable
 * Bypasses DDD architecture temporarily for direct storage
 * 
 * Note: This is a temporary workaround. Full DDD flow (Client => N8N => Supabase)
 * should be used when N8N is available for proper ambiguity and optimization workflows.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

// Load credentials
const creds = loadCrewCredentials();
const supabaseUrl = creds.supabase?.url;
const supabaseKey = creds.supabase?.key;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found');
  console.error('   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in ~/.zshrc');
  process.exit(1);
}

/**
 * Direct Supabase HTTP client
 */
function supabaseInsert(table, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
    const postData = JSON.stringify(data);
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation'
      }
    };
    
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(body);
            resolve({ 
              data: Array.isArray(json) ? json[0] : json, 
              error: null 
            });
          } catch (e) {
            resolve({ data: JSON.parse(body), error: null });
          }
        } else {
          const errorBody = body ? JSON.stringify(JSON.parse(body), null, 2) : body;
          reject(new Error(`Supabase returned ${res.statusCode}: ${errorBody}`));
        }
      });
    });
    
    req.on('error', (err) => {
      reject(new Error(`Request failed: ${err.message}`));
    });
    
    req.write(postData);
    req.end();
  });
}

/**
 * Fragment memory into semantic chunks for optimal vector storage
 */
function fragmentMemoryIntoVectors(content, maxChunkSize = 500) {
  const sentences = content.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
  const chunks = [];
  let currentChunk = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? '. ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks.map((chunk, index) => ({
    content: chunk,
    index,
    fragmentId: `fragment-${Date.now()}-${index}`
  }));
}

/**
 * Store chat session memory directly to Supabase
 */
async function storeChatSessionMemory(chatSummary) {
  console.log('📚 Storing Chat Session Memory Directly to Supabase...');
  console.log(`   Title: ${chatSummary.title}`);
  console.log(`   Supabase URL: ${supabaseUrl}`);
  console.log('');
  
  // Fragment memory for vector storage
  const fragments = fragmentMemoryIntoVectors(chatSummary.detailedAnalysis || chatSummary.content || '');
  
  console.log(`   Fragments created: ${fragments.length}`);
  console.log('   Storing to alex_ai_memories table...');
  
  try {
    // Prepare memory data
    const memoryData = {
      content: chatSummary.detailedAnalysis || chatSummary.summary || '',
      summary: chatSummary.summary || '',
      crew_member: chatSummary.crewMember || 'data',
      crew_member_name: chatSummary.crewMember === 'data' ? 'Commander Data' : 'Unknown',
      memory_type: chatSummary.memoryType || 'conversation',
      platform: chatSummary.platform || 'cursor-ai',
      session_id: chatSummary.sessionId || `chat-${Date.now()}`,
      metadata: {
        title: chatSummary.title,
        keyFindings: chatSummary.keyFindings || [],
        conclusions: chatSummary.conclusions || [],
        recommendations: chatSummary.recommendations || [],
        tags: chatSummary.tags || [],
        fragments: fragments.length,
        priority: chatSummary.priority || 'medium'
      },
      tags: chatSummary.tags || [],
      is_active: true
    };
    
    console.log('   Attempting to insert memory...');
    
    // Store main memory entry using direct HTTP
    const result = await supabaseInsert('alex_ai_memories', memoryData);
    
    const { data, error } = result;
    
    if (error) {
      console.error('   Supabase error:', error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from Supabase insert');
    }
    
    console.log('✅ Chat session memory stored successfully!');
    console.log(`   Memory ID: ${data.id}`);
    console.log(`   Session ID: ${data.session_id}`);
    console.log('');
    console.log('📊 Storage Details:');
    console.log(`   - Fragments: ${fragments.length}`);
    console.log(`   - Platform: ${data.platform}`);
    console.log(`   - Crew Member: ${data.crew_member_name}`);
    console.log(`   - Memory Type: ${data.memory_type}`);
    console.log('');
    console.log('⚠️  Note: This was stored directly to Supabase (bypassing N8N)');
    console.log('   For full DDD workflow with ambiguity/optimization, use N8N when available.');
    
    return { success: true, data };
    
  } catch (error) {
    console.error('❌ Failed to store chat session memory:', error.message);
    if (error.code === '42P01') {
      console.error('');
      console.error('💡 The alex_ai_memories table may not exist in Supabase.');
      console.error('   Run the migration: supabase/migrations/20251117_create_alex_ai_memories.sql');
    }
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  
  let chatSummary;
  
  if (args[0] && args[0].endsWith('.json')) {
    // Load from JSON file
    const filePath = path.resolve(process.cwd(), args[0]);
    chatSummary = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else if (args[0] === '--help' || args[0] === '-h') {
    console.log('Usage:');
    console.log('  node scripts/store-chat-session-direct-to-supabase.js chat-summary.json');
    console.log('');
    console.log('Stores chat session memory directly to Supabase (bypasses N8N)');
    console.log('Use this when N8N is unavailable. Full DDD flow preferred when N8N is available.');
    process.exit(0);
  } else {
    console.error('❌ Please provide a JSON file with chat summary');
    console.error('   Usage: node scripts/store-chat-session-direct-to-supabase.js chat-summary.json');
    process.exit(1);
  }
  
  try {
    await storeChatSessionMemory(chatSummary);
    console.log('\n✅ Sync complete!');
  } catch (error) {
    console.error('\n❌ Sync failed:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

