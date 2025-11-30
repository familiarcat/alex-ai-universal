#!/usr/bin/env node

/**
 * 🎯 Activate Knowledge Ingest - Exact Process
 * 
 * Replicates the exact manual process shown:
 * 1. Deactivate workflow (toggle OFF)
 * 2. Wait for deactivation
 * 3. Activate workflow (toggle ON)
 * 4. Wait for webhook registration
 * 5. Verify webhook is registered
 * 
 * This matches the manual UI process exactly.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

if (!N8N_API_KEY) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
  process.exit(1);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 ACTIVATE KNOWLEDGE INGEST - EXACT PROCESS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Replicating manual UI process:');
console.log('   1. Deactivate workflow (toggle OFF)');
console.log('   2. Wait for deactivation');
console.log('   3. Activate workflow (toggle ON)');
console.log('   4. Wait for webhook registration');
console.log('   5. Verify webhook\n');

// Make API request
function makeApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, body: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, body: body });
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

// Test webhook
async function testWebhook(webhookPath) {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          registered: res.statusCode !== 404,
          body: body
        });
      });
    });

    req.on('error', () => resolve({ status: 0, registered: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false, error: 'timeout' });
    });

    req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
    req.end();
  });
}

// Extract webhook path
function extractWebhookPath(workflowData) {
  if (!workflowData || !workflowData.nodes) return null;
  for (const node of workflowData.nodes) {
    if (node.type === 'n8n-nodes-base.webhook' || node.type === '@n8n/n8n-nodes-langchain.webhook') {
      const path = node.parameters?.path || node.parameters?.options?.path;
      if (path) return path.replace(/^\//, '');
    }
  }
  return null;
}

async function main() {
  // Step 1: Find workflow
  console.log('🔍 Step 1: Finding Knowledge Ingest workflow...');
  const workflowsResponse = await makeApiRequest('GET', '/api/v1/workflows');
  
  if (workflowsResponse.status !== 200) {
    console.log(`❌ Failed to fetch workflows`);
    process.exit(1);
  }
  
  let workflows = [];
  const data = workflowsResponse.data;
  if (Array.isArray(data)) {
    workflows = data;
  } else if (data.data && Array.isArray(data.data)) {
    workflows = data.data;
  } else if (data.results && Array.isArray(data.results)) {
    workflows = data.results;
  }
  
  // Find the main workflow (not the "Clean" version)
  const workflow = workflows.find(w => {
    const name = (w.name || '').toLowerCase();
    return (name.includes('knowledge ingest') || name.includes('rag ingestion')) &&
           !name.includes('clean');
  });
  
  if (!workflow) {
    console.log('❌ Knowledge Ingest workflow not found!');
    process.exit(1);
  }
  
  console.log(`   ✅ Found: ${workflow.name} (${workflow.id})`);
  console.log(`   📊 Current Status: ${workflow.active ? 'Active' : 'Inactive'}\n`);
  
  // Step 2: Get webhook path
  console.log('🔍 Step 2: Extracting webhook path...');
  const detailResponse = await makeApiRequest('GET', `/api/v1/workflows/${workflow.id}`);
  const workflowData = detailResponse.data.data || detailResponse.data;
  const webhookPath = extractWebhookPath(workflowData) || 'ingest-knowledge';
  console.log(`   ✅ Webhook path: ${webhookPath}\n`);
  
  // Step 3: Test webhook before
  console.log('🧪 Step 3: Testing webhook before activation...');
  const beforeTest = await testWebhook(webhookPath);
  console.log(`   Status: ${beforeTest.status} (${beforeTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);
  
  if (beforeTest.registered) {
    console.log('✅ Webhook is already registered! No action needed.\n');
    process.exit(0);
  }
  
  // Step 4: EXACT PROCESS - Deactivate first
  console.log('🔄 Step 4: Deactivating workflow (toggle OFF)...');
  try {
    if (workflow.active) {
      const deactivateResponse = await makeApiRequest('POST', `/api/v1/workflows/${workflow.id}/deactivate`);
      if (deactivateResponse.status === 200 || deactivateResponse.status === 204) {
        console.log('   ✅ Workflow deactivated');
      } else {
        console.log(`   ⚠️  Unexpected status: ${deactivateResponse.status}`);
      }
    } else {
      console.log('   ⏭️  Workflow already inactive');
    }
  } catch (error) {
    console.log(`   ❌ Deactivation failed: ${error.message}`);
    process.exit(1);
  }
  
  // Step 5: Wait for deactivation to complete
  console.log('\n⏳ Step 5: Waiting 5 seconds for deactivation to complete...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Step 6: Activate workflow (toggle ON)
  console.log('🔄 Step 6: Activating workflow (toggle ON)...');
  try {
    const activateResponse = await makeApiRequest('POST', `/api/v1/workflows/${workflow.id}/activate`);
    if (activateResponse.status === 200 || activateResponse.status === 204) {
      console.log('   ✅ Workflow activated');
    } else {
      console.log(`   ⚠️  Unexpected status: ${activateResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Activation failed: ${error.message}`);
    process.exit(1);
  }
  
  // Step 7: Wait for webhook registration (longer wait)
  console.log('\n⏳ Step 7: Waiting 30 seconds for webhook registration...');
  console.log('   (This matches the manual process timing)');
  
  for (let i = 0; i < 6; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.stdout.write(`   ${i + 1}/6... `);
    
    const test = await testWebhook(webhookPath);
    if (test.registered) {
      console.log(`\n   ✅ Webhook registered! (Status: ${test.status})\n`);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SUCCESS: Knowledge Ingest webhook is operational!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`Webhook URL: ${N8N_URL}/webhook/${webhookPath}`);
      console.log(`Status: ${test.status}\n`);
      console.log('🎉 RAG ingestion is ready!\n');
      process.exit(0);
    }
  }
  console.log('\n');
  
  // Step 8: Final verification
  console.log('🧪 Step 8: Final webhook verification...');
  const finalTest = await testWebhook(webhookPath);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (finalTest.registered) {
    console.log('✅ SUCCESS: Webhook is registered!');
    console.log(`   Status: ${finalTest.status}\n`);
    process.exit(0);
  } else {
    console.log('⚠️  Webhook still not registered after exact process');
    console.log(`   Status: ${finalTest.status}`);
    console.log(`   Response: ${finalTest.body?.substring(0, 150)}...\n`);
    console.log('💡 The process was executed correctly, but webhook may need more time.');
    console.log('   Try waiting 60 seconds and test again:\n');
    console.log(`   curl -X POST ${N8N_URL}/webhook/${webhookPath} \\`);
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"test": true}\'\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

