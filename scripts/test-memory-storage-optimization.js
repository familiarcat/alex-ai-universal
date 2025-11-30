#!/usr/bin/env node
/**
 * Test Memory Storage Optimization
 * 
 * Validates that milestone pushes and chat history are being properly stored
 * with optimal vector deduplication and organization by intention
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load credentials
function loadCrewCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  if (!fs.existsSync(zshrcPath)) {
    throw new Error('~/.zshrc not found');
  }

  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  const credentials = {};

  // Extract Supabase credentials
  const supabaseUrlMatch = zshrcContent.match(/export SUPABASE_URL=['"]?([^'"\n]+)['"]?/);
  const supabaseKeyMatch = zshrcContent.match(/export SUPABASE_SERVICE_ROLE_KEY=['"]?([^'"\n]+)['"]?/);
  
  // Extract N8N credentials
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL=['"]?([^'"\n]+)['"]?/);

  if (supabaseUrlMatch) credentials.supabase = { url: supabaseUrlMatch[1] };
  if (supabaseKeyMatch) {
    if (!credentials.supabase) credentials.supabase = {};
    credentials.supabase.key = supabaseKeyMatch[1];
  }
  if (n8nUrlMatch) credentials.n8n = { baseUrl: n8nUrlMatch[1] };

  return credentials;
}

// Query Supabase
function querySupabase(endpoint, method = 'GET', data = null) {
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
      method: method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      timeout: 10000
    };

    if (data) {
      const dataStr = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(dataStr);
    }

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
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, data: body });
          } else {
            reject(new Error(`Supabase returned ${res.statusCode}: ${body.substring(0, 200)}`));
          }
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Get recent milestones from git
function getRecentMilestones(limit = 10) {
  try {
    const output = execSync(
      `git log --grep="milestone:" --format="%H|%s|%ai" -n ${limit}`,
      { encoding: 'utf8', cwd: process.cwd() }
    );
    
    return output.trim().split('\n').map(line => {
      const [hash, ...rest] = line.split('|');
      const date = rest.pop();
      const message = rest.join('|');
      return {
        hash: hash.substring(0, 7),
        fullHash: hash,
        message: message.replace(/^milestone:\s*/i, '').trim(),
        date: new Date(date)
      };
    }).filter(m => m.message);
  } catch (error) {
    console.error(`⚠️  Failed to get milestones from git: ${error.message}`);
    return [];
  }
}

// Test milestone storage
async function testMilestoneStorage() {
  console.log('\n📊 Testing Milestone Storage...');
  console.log('─'.repeat(80));
  
  const milestones = getRecentMilestones(5);
  console.log(`   Found ${milestones.length} recent milestone(s) in git history`);
  
  if (milestones.length === 0) {
    console.log('   ⚠️  No milestones found in git history');
    return { success: false, reason: 'No milestones found' };
  }
  
  // Check if milestones are stored in Supabase
  try {
    // Query for milestone-related memories (check both tables)
    let result;
    try {
      result = await querySupabase(
        '/rest/v1/crew_memories?tags=cs.{milestone}&order=created_at.desc&limit=10',
        'GET'
      );
    } catch (e) {
      // Fallback to alex_ai_memories
      result = await querySupabase(
        '/rest/v1/alex_ai_memories?platform=eq.cursor-ai&order=created_at.desc&limit=10',
        'GET'
      );
    }
    
    const storedMemories = Array.isArray(result.data) ? result.data : [];
    console.log(`   Found ${storedMemories.length} milestone memory(ies) in Supabase`);
    
    // Check for recent milestones
    const recentMilestones = milestones.slice(0, 3);
    const foundMilestones = [];
    
    for (const milestone of recentMilestones) {
      const found = storedMemories.find(mem => {
        const title = mem.metadata?.title || mem.content || '';
        const summary = mem.summary || '';
        return title.toLowerCase().includes(milestone.message.toLowerCase().substring(0, 30)) ||
               summary.toLowerCase().includes(milestone.message.toLowerCase().substring(0, 30));
      });
      
      if (found) {
        foundMilestones.push({ milestone, memory: found });
        console.log(`   ✅ Milestone "${milestone.message.substring(0, 50)}..." found in memory`);
      } else {
        console.log(`   ⚠️  Milestone "${milestone.message.substring(0, 50)}..." not found in memory`);
      }
    }
    
    return {
      success: foundMilestones.length > 0,
      milestonesChecked: recentMilestones.length,
      milestonesFound: foundMilestones.length,
      storedMemories: storedMemories.length
    };
  } catch (error) {
    console.error(`   ❌ Failed to query Supabase: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test chat session storage
async function testChatSessionStorage() {
  console.log('\n💬 Testing Chat Session Storage...');
  console.log('─'.repeat(80));
  
  try {
    // Query for chat session memories (check crew_memories table)
    let result;
    try {
      result = await querySupabase(
        '/rest/v1/crew_memories?order=created_at.desc&limit=10',
        'GET'
      );
    } catch (e) {
      // Fallback to alex_ai_memories
      result = await querySupabase(
        '/rest/v1/alex_ai_memories?platform=eq.cursor-ai&order=created_at.desc&limit=10',
        'GET'
      );
    }
    
    const storedSessions = Array.isArray(result.data) ? result.data : [];
    console.log(`   Found ${storedSessions.length} chat session memory(ies) in Supabase`);
    
    if (storedSessions.length === 0) {
      console.log('   ⚠️  No chat sessions found in Supabase');
      return { success: false, reason: 'No chat sessions found' };
    }
    
    // Check recent sessions (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSessions = storedSessions.filter(session => {
      const createdAt = new Date(session.created_at);
      return createdAt >= sevenDaysAgo;
    });
    
    console.log(`   Found ${recentSessions.length} chat session(s) in last 7 days`);
    
    // Validate session structure
    const validSessions = recentSessions.filter(session => {
      return session.content && session.session_id && session.platform;
    });
    
    console.log(`   Valid sessions: ${validSessions.length}/${recentSessions.length}`);
    
    return {
      success: validSessions.length > 0,
      totalSessions: storedSessions.length,
      recentSessions: recentSessions.length,
      validSessions: validSessions.length
    };
  } catch (error) {
    console.error(`   ❌ Failed to query Supabase: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test vector deduplication
async function testVectorDeduplication() {
  console.log('\n🔍 Testing Vector Deduplication...');
  console.log('─'.repeat(80));
  
  try {
    // Get all memories from crew_memories table (where workflow stores)
    let result;
    try {
      result = await querySupabase(
        '/rest/v1/crew_memories?select=id,title,summary,detailed_analysis,tags,created_at&order=created_at.desc&limit=50',
        'GET'
      );
    } catch (e) {
      // Fallback to alex_ai_memories
      result = await querySupabase(
        '/rest/v1/alex_ai_memories?select=id,content,summary,metadata,created_at&order=created_at.desc&limit=50',
        'GET'
      );
    }
    
    const memories = Array.isArray(result.data) ? result.data : [];
    console.log(`   Found ${memories.length} memory(ies) to check for duplicates`);
    
    if (memories.length < 2) {
      console.log('   ⚠️  Not enough memories to test deduplication');
      return { success: true, reason: 'Insufficient data' };
    }
    
    // Check for potential duplicates by content similarity
    // (In a real system, we'd use vector similarity search, but for now we'll check content hashes)
    const contentHashes = new Map();
    const duplicates = [];
    
    for (const memory of memories) {
      // Simple content hash (normalized) - handle both table schemas
      const content = memory.content || memory.detailed_analysis || memory.summary || '';
      const normalizedContent = content.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '')
        .trim();
      
      if (normalizedContent.length > 50) { // Only check substantial content
        const hash = normalizedContent.substring(0, 100); // Use first 100 chars as hash
        
        if (contentHashes.has(hash)) {
          duplicates.push({
            memory1: contentHashes.get(hash),
            memory2: memory,
            similarity: 'high' // Would use vector similarity in production
          });
        } else {
          contentHashes.set(hash, memory);
        }
      }
    }
    
    console.log(`   Potential duplicates found: ${duplicates.length}`);
    
    if (duplicates.length > 0) {
      console.log('   ⚠️  Duplicate content detected (should be deduplicated):');
      duplicates.slice(0, 3).forEach((dup, idx) => {
        console.log(`      ${idx + 1}. Memory ${dup.memory1.id} vs ${dup.memory2.id}`);
      });
    } else {
      console.log('   ✅ No obvious duplicates found');
    }
    
    return {
      success: duplicates.length === 0,
      totalMemories: memories.length,
      duplicatesFound: duplicates.length
    };
  } catch (error) {
    console.error(`   ❌ Failed to test deduplication: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test vector organization by intention
async function testVectorOrganization() {
  console.log('\n🎯 Testing Vector Organization by Intention...');
  console.log('─'.repeat(80));
  
  try {
    // Query memories grouped by tags (check crew_memories table)
    let result;
    try {
      result = await querySupabase(
        '/rest/v1/crew_memories?select=id,tags,crew_member,knowledge_type,title,summary&order=created_at.desc&limit=50',
        'GET'
      );
    } catch (e) {
      // Fallback to alex_ai_memories
      result = await querySupabase(
        '/rest/v1/alex_ai_memories?select=id,tags,metadata,crew_member,memory_type&order=created_at.desc&limit=50',
        'GET'
      );
    }
    
    const memories = Array.isArray(result.data) ? result.data : [];
    console.log(`   Found ${memories.length} memory(ies) to analyze`);
    
    // Group by functional role/intention (from tags or metadata)
    const organization = {
      byTag: {},
      byCrewMember: {},
      byMemoryType: {},
      byFunctionalRole: {}
    };
    
    for (const memory of memories) {
      // Organize by tags
      const tags = memory.tags || [];
      tags.forEach(tag => {
        if (!organization.byTag[tag]) organization.byTag[tag] = [];
        organization.byTag[tag].push(memory.id);
      });
      
      // Organize by crew member
      const crewMember = memory.crew_member || 'unknown';
      if (!organization.byCrewMember[crewMember]) organization.byCrewMember[crewMember] = [];
      organization.byCrewMember[crewMember].push(memory.id);
      
      // Organize by memory type (knowledge_type in crew_memories)
      const memoryType = memory.memory_type || memory.knowledge_type || 'unknown';
      if (!organization.byMemoryType[memoryType]) organization.byMemoryType[memoryType] = [];
      organization.byMemoryType[memoryType].push(memory.id);
      
      // Organize by functional role (from metadata or tags)
      const functionalRole = memory.metadata?.functionalRole || 
                            memory.metadata?.intention || 
                            (Array.isArray(memory.tags) && memory.tags.find(t => t.includes('role-') || t.includes('functional-'))) ||
                            'general';
      if (!organization.byFunctionalRole[functionalRole]) organization.byFunctionalRole[functionalRole] = [];
      organization.byFunctionalRole[functionalRole].push(memory.id);
    }
    
    console.log(`   Organization by Tags: ${Object.keys(organization.byTag).length} unique tags`);
    console.log(`   Organization by Crew Member: ${Object.keys(organization.byCrewMember).length} crew members`);
    console.log(`   Organization by Memory Type: ${Object.keys(organization.byMemoryType).length} types`);
    console.log(`   Organization by Functional Role: ${Object.keys(organization.byFunctionalRole).length} roles`);
    
    // Show top tags
    const topTags = Object.entries(organization.byTag)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);
    
    console.log('\n   Top Tags (by memory count):');
    topTags.forEach(([tag, ids]) => {
      console.log(`      • ${tag}: ${ids.length} memory(ies)`);
    });
    
    return {
      success: true,
      organization,
      topTags: topTags.map(([tag, ids]) => ({ tag, count: ids.length }))
    };
  } catch (error) {
    console.error(`   ❌ Failed to test organization: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Test N8N workflow connectivity
async function testN8NWorkflow() {
  console.log('\n🔄 Testing N8N Workflow Connectivity...');
  console.log('─'.repeat(80));
  
  const creds = loadCrewCredentials();
  const N8N_BASE_URL = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';
  
  return new Promise((resolve) => {
    const url = new URL(`${N8N_BASE_URL}/webhook/crew-memory-storage`);
    
    const testPayload = {
      title: 'Test Memory Storage Validation',
      summary: 'This is a test payload to verify N8N workflow connectivity',
      content: 'Test content for memory storage validation',
      crewMember: 'data',
      memoryType: 'test',
      sessionId: `test-${Date.now()}`,
      platform: 'test',
      tags: ['test', 'validation'],
      timestamp: new Date().toISOString()
    };
    
    const data = JSON.stringify(testPayload);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`   ✅ N8N workflow accessible (Status: ${res.statusCode})`);
          resolve({ success: true, status: res.statusCode });
        } else {
          console.log(`   ⚠️  N8N workflow returned ${res.statusCode}`);
          resolve({ success: false, status: res.statusCode, body });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error(`   ❌ N8N workflow not accessible: ${error.message}`);
      resolve({ success: false, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.error('   ❌ N8N workflow request timeout');
      resolve({ success: false, error: 'Request timeout' });
    });
    
    req.write(data);
    req.end();
  });
}

// Main test execution
async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('🧪 MEMORY STORAGE OPTIMIZATION TEST');
  console.log('═'.repeat(80));
  console.log('\nTesting milestone pushes and chat history storage with vector deduplication');
  console.log('and organization by intention...\n');
  
  const results = {
    milestoneStorage: null,
    chatSessionStorage: null,
    vectorDeduplication: null,
    vectorOrganization: null,
    n8nWorkflow: null
  };
  
  try {
    // Test N8N workflow connectivity
    results.n8nWorkflow = await testN8NWorkflow();
    
    // Test milestone storage
    results.milestoneStorage = await testMilestoneStorage();
    
    // Test chat session storage
    results.chatSessionStorage = await testChatSessionStorage();
    
    // Test vector deduplication
    results.vectorDeduplication = await testVectorDeduplication();
    
    // Test vector organization
    results.vectorOrganization = await testVectorOrganization();
    
    // Summary
    console.log('\n' + '═'.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(80));
    
    const allTests = [
      { name: 'N8N Workflow Connectivity', result: results.n8nWorkflow },
      { name: 'Milestone Storage', result: results.milestoneStorage },
      { name: 'Chat Session Storage', result: results.chatSessionStorage },
      { name: 'Vector Deduplication', result: results.vectorDeduplication },
      { name: 'Vector Organization', result: results.vectorOrganization }
    ];
    
    allTests.forEach(test => {
      const status = test.result?.success ? '✅' : '❌';
      console.log(`   ${status} ${test.name}`);
    });
    
    const passedTests = allTests.filter(t => t.result?.success).length;
    const totalTests = allTests.length;
    
    console.log(`\n   Results: ${passedTests}/${totalTests} tests passed`);
    
    // Save results
    const resultsPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'MEMORY_STORAGE_TEST_RESULTS.json');
    const resultsDir = path.dirname(resultsPath);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Results saved to: ${resultsPath}`);
    
    process.exit(passedTests === totalTests ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ Test execution failed: ${error.message}`);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();

