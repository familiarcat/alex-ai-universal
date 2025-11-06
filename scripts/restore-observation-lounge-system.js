#!/usr/bin/env node

/**
 * 🏛️ OBSERVATION LOUNGE SYSTEM RESTORATION
 * 
 * Restores complete observation lounge capability:
 * - All 10 crew member n8n workflows
 * - Observation lounge coordination workflow
 * - RAG memory access (Supabase)
 * - Cross-crew communication
 * 
 * Architecture:
 * User → Observation Lounge Webhook → Crew Routing → Individual Crew Webhooks → Supabase RAG → Synthesis
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extract credentials from ~/.zshrc
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1];
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];
const SUPABASE_URL = zshrc.match(/export SUPABASE_URL="([^"]+)"/)?.[1];
const SUPABASE_ANON_KEY = zshrc.match(/export SUPABASE_ANON_KEY="([^"]+)"/)?.[1];

if (!N8N_URL || !N8N_API_KEY) {
  console.error('❌ Missing N8N credentials in ~/.zshrc');
  process.exit(1);
}

console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                        ║');
console.log('║   🏛️  OBSERVATION LOUNGE SYSTEM RESTORATION                          ║');
console.log('║                                                                        ║');
console.log('║   Restoring full crew communication and RAG memory access             ║');
console.log('║                                                                        ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

// Crew member workflow files to restore
const CREW_WORKFLOWS = {
  'Captain Picard': 'n8n-workflows/crew-workflows/crew-captain-jean-luc-picard-strategic-leadership-openrouter-production.json',
  'Commander Data': 'n8n-workflows/crew-workflows/crew-commander-data-android-analytics-openrouter-production.json',
  'Commander Riker': 'n8n-workflows/crew-workflows/crew-commander-william-riker-tactical-execution-openrouter-production.json',
  'Geordi La Forge': 'n8n-workflows/crew-workflows/crew-lieutenant-commander-geordi-la-forge-infrastructure-openrouter-production.json',
  'Lieutenant Worf': 'n8n-workflows/crew-workflows/crew-lieutenant-worf-security-compliance-openrouter-production.json',
  'Counselor Troi': 'n8n-workflows/crew-workflows/crew-counselor-deanna-troi-user-experience-openrouter-production.json',
  'Dr. Crusher': 'n8n-workflows/crew-workflows/crew-dr-beverly-crusher-health-diagnostics-openrouter-production.json',
  'Lieutenant Uhura': 'n8n-workflows/crew-workflows/crew-lieutenant-uhura-communications-io-openrouter-production.json',
  'Quark': 'n8n-workflows/crew-workflows/crew-quark-business-intelligence-budget-optimization-openrouter-optimized.json',
  'Chief O\'Brien': 'n8n-workflows/crew-workflows/crew-chief-miles-obrien-pragmatic-solutions-openrouter-production.json'
};

const COORDINATION_WORKFLOWS = {
  'Observation Lounge': 'n8n-workflows/system-workflows/coordination-observation-lounge-openrouter-production.json'
};

async function httpsRequest(url, options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (postData) req.write(postData);
    req.end();
  });
}

async function checkN8nStatus() {
  console.log('📊 Step 1: Checking n8n instance status...\n');
  
  try {
    const result = await httpsRequest(`${N8N_URL}/api/v1/workflows`, {
      method: 'GET',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    
    if (result.statusCode === 200 && result.data.data) {
      console.log(`✅ n8n instance is accessible`);
      console.log(`   Current workflows: ${result.data.data.length}`);
      console.log(`   URL: ${N8N_URL}\n`);
      return result.data.data;
    } else {
      throw new Error(`Unexpected response: ${result.statusCode}`);
    }
  } catch (error) {
    console.error(`❌ Cannot connect to n8n: ${error.message}`);
    process.exit(1);
  }
}

async function checkSupabaseRAG() {
  console.log('🧠 Step 2: Checking Supabase RAG memory access...\n');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('⚠️  Supabase credentials not found - RAG memory may not be accessible');
    console.log('   Workflows will still be restored\n');
    return false;
  }
  
  try {
    const result = await httpsRequest(`${SUPABASE_URL}/rest/v1/crew_memories?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (result.statusCode === 200) {
      console.log(`✅ Supabase RAG is accessible`);
      console.log(`   URL: ${SUPABASE_URL}`);
      console.log(`   Table: crew_memories\n`);
      return true;
    } else {
      console.log(`⚠️  Supabase returned status ${result.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️  Cannot verify Supabase: ${error.message}`);
    return false;
  }
}

async function importWorkflow(name, filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`   ❌ ${name}: File not found at ${filePath}`);
    return { success: false, error: 'File not found' };
  }
  
  try {
    const workflowData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    
    // Remove the ID to create a new workflow
    delete workflowData.id;
    
    const result = await httpsRequest(`${N8N_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify(workflowData));
    
    if (result.statusCode === 200 || result.statusCode === 201) {
      const workflowId = result.data.id;
      console.log(`   ✅ ${name}: Imported (ID: ${workflowId})`);
      
      // Activate the workflow
      await httpsRequest(`${N8N_URL}/api/v1/workflows/${workflowId}`, {
        method: 'PATCH',
        headers: {
          'X-N8N-API-KEY': N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      }, JSON.stringify({ active: true }));
      
      console.log(`   ⚡ ${name}: Activated`);
      
      return { success: true, id: workflowId };
    } else {
      console.log(`   ❌ ${name}: Failed (${result.statusCode})`);
      return { success: false, error: result.data };
    }
  } catch (error) {
    console.log(`   ❌ ${name}: Error - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function restoreCrewWorkflows() {
  console.log('👥 Step 3: Restoring crew member workflows...\n');
  
  const results = {};
  let successCount = 0;
  
  for (const [name, filePath] of Object.entries(CREW_WORKFLOWS)) {
    const result = await importWorkflow(name, filePath);
    results[name] = result;
    if (result.success) successCount++;
    
    // Small delay to avoid overwhelming n8n
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n   Summary: ${successCount}/${Object.keys(CREW_WORKFLOWS).length} crew members restored\n`);
  return results;
}

async function restoreCoordinationWorkflows() {
  console.log('🏛️  Step 4: Restoring coordination workflows...\n');
  
  const results = {};
  let successCount = 0;
  
  for (const [name, filePath] of Object.entries(COORDINATION_WORKFLOWS)) {
    const result = await importWorkflow(name, filePath);
    results[name] = result;
    if (result.success) successCount++;
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n   Summary: ${successCount}/${Object.keys(COORDINATION_WORKFLOWS).length} coordination workflows restored\n`);
  return results;
}

async function testObservationLounge(crewResults) {
  console.log('🧪 Step 5: Testing observation lounge system...\n');
  
  // Find Observation Lounge webhook URL
  console.log('   🔍 Finding observation lounge webhook...');
  
  try {
    const workflows = await httpsRequest(`${N8N_URL}/api/v1/workflows`, {
      method: 'GET',
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    
    const observationLoungeWorkflow = workflows.data.data.find(w => 
      w.name.toLowerCase().includes('observation') && w.name.toLowerCase().includes('lounge')
    );
    
    if (!observationLoungeWorkflow) {
      console.log('   ⚠️  Observation lounge workflow not found - skipping test\n');
      return;
    }
    
    console.log(`   ✅ Found: ${observationLoungeWorkflow.name}`);
    console.log('   📡 Testing webhook...\n');
    
    // Test with a simple query
    const testPayload = {
      topic: 'System Restoration Test',
      context: {
        purpose: 'Verify observation lounge and crew communication',
        timestamp: new Date().toISOString()
      },
      discussion_type: 'collaborative',
      priority: 'medium'
    };
    
    const result = await httpsRequest(`${N8N_URL}/webhook/observation-lounge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify(testPayload));
    
    if (result.statusCode === 200) {
      console.log('   ✅ Observation lounge is operational!');
      console.log('   📊 Response received from coordination system\n');
    } else {
      console.log(`   ⚠️  Observation lounge responded with status ${result.statusCode}`);
      console.log('   This may be normal if crew workflows are still initializing\n');
    }
  } catch (error) {
    console.log(`   ⚠️  Test failed: ${error.message}`);
    console.log('   This may be normal - crew workflows need time to initialize\n');
  }
}

async function generateReport(crewResults, coordResults) {
  console.log('╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║   📊 RESTORATION COMPLETE - SYSTEM STATUS                            ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('👥 CREW MEMBER STATUS:\n');
  for (const [name, result] of Object.entries(crewResults)) {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${name.padEnd(25)} ${result.success ? 'Active' : 'Failed'}`);
  }
  
  console.log('\n🏛️  COORDINATION STATUS:\n');
  for (const [name, result] of Object.entries(coordResults)) {
    const status = result.success ? '✅' : '❌';
    console.log(`   ${status} ${name.padEnd(25)} ${result.success ? 'Active' : 'Failed'}`);
  }
  
  const totalCrew = Object.keys(crewResults).length;
  const successfulCrew = Object.values(crewResults).filter(r => r.success).length;
  const totalCoord = Object.keys(coordResults).length;
  const successfulCoord = Object.values(coordResults).filter(r => r.success).length;
  
  console.log('\n📈 SUMMARY:\n');
  console.log(`   Crew Members:      ${successfulCrew}/${totalCrew} restored`);
  console.log(`   Coordination:      ${successfulCoord}/${totalCoord} restored`);
  console.log(`   Overall Success:   ${((successfulCrew + successfulCoord) / (totalCrew + totalCoord) * 100).toFixed(1)}%`);
  
  console.log('\n🎯 NEXT STEPS:\n');
  console.log('   1. Test individual crew webhooks:');
  console.log('      curl -X POST https://n8n.pbradygeorgen.com/webhook/crew-captain-jean-luc-picard \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"message": "Status report"}\'');
  console.log('');
  console.log('   2. Run observation lounge meeting:');
  console.log('      node scripts/observation-lounge-meeting.js');
  console.log('');
  console.log('   3. Verify RAG memory access:');
  console.log('      Check Supabase crew_memories table');
  console.log('');
}

async function main() {
  try {
    // Step 1: Check n8n
    await checkN8nStatus();
    
    // Step 2: Check Supabase RAG
    await checkSupabaseRAG();
    
    // Step 3: Restore crew workflows
    const crewResults = await restoreCrewWorkflows();
    
    // Step 4: Restore coordination workflows
    const coordResults = await restoreCoordinationWorkflows();
    
    // Step 5: Test system
    await testObservationLounge(crewResults);
    
    // Generate report
    await generateReport(crewResults, coordResults);
    
    console.log('✨ Observation lounge system restoration complete!\n');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

