#!/usr/bin/env node

/**
 * 🎯 Auto-Activate Knowledge Ingest Webhook
 * 
 * Automatically activates the Knowledge Ingest workflow and ensures its webhook is registered.
 * Uses proven deactivate/reactivate pattern for reliable webhook registration.
 * 
 * This script is specifically designed to ensure the RAG ingestion webhook is operational.
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
console.log('🎯 AUTO-ACTIVATE KNOWLEDGE INGEST WEBHOOK');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`📍 N8N URL: ${N8N_URL}\n`);

// Make HTTPS request with API key
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

// Test webhook endpoint
function testWebhook(webhookPath, method = 'POST', retries = 3) {
  return new Promise((resolve) => {
    let attempt = 0;
    
    const attemptTest = () => {
      attempt++;
      const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
      const testPayload = { test: true, timestamp: Date.now(), attempt: attempt };
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          const registered = res.statusCode !== 404;
          resolve({
            status: res.statusCode,
            registered: registered,
            body: body,
            attempt: attempt
          });
        });
      });

      req.on('error', () => {
        if (attempt < retries) {
          setTimeout(attemptTest, 2000);
        } else {
          resolve({ status: 0, registered: false, attempt: attempt });
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (attempt < retries) {
          setTimeout(attemptTest, 2000);
        } else {
          resolve({ status: 0, registered: false, attempt: attempt, error: 'timeout' });
        }
      });

      req.write(JSON.stringify(testPayload));
      req.end();
    };
    
    attemptTest();
  });
}

// Extract webhook path from workflow
function extractWebhookPath(workflowData) {
  if (!workflowData || !workflowData.nodes) {
    return null;
  }
  
  for (const node of workflowData.nodes) {
    if (node.type === 'n8n-nodes-base.webhook' || node.type === '@n8n/n8n-nodes-langchain.webhook') {
      const path = node.parameters?.path || node.parameters?.options?.path;
      if (path) {
        return path.replace(/^\//, ''); // Remove leading slash
      }
    }
  }
  
  return null;
}

async function main() {
  // Step 1: Find Knowledge Ingest workflow
  console.log('🔍 Step 1: Finding Knowledge Ingest workflow...');
  const workflowsResponse = await makeApiRequest('GET', '/api/v1/workflows');
  
  if (workflowsResponse.status !== 200) {
    console.log(`❌ Failed to fetch workflows (Status: ${workflowsResponse.status})`);
    console.log(`   Response: ${workflowsResponse.body?.substring(0, 200)}...`);
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
  
  console.log(`   ✅ Found ${workflows.length} workflows\n`);
  
  // Find Knowledge Ingest workflow by name or ID
  const knowledgeIngestWorkflow = workflows.find(w => {
    const name = (w.name || '').toLowerCase();
    return name.includes('knowledge ingest') || 
           name.includes('knowledge-ingest') ||
           name.includes('rag ingestion') ||
           w.id === 'Ffdgv5Zd8hGeHJGe'; // Known ID
  });
  
  if (!knowledgeIngestWorkflow) {
    console.log('❌ Knowledge Ingest workflow not found!\n');
    console.log('Available workflows (first 10):');
    workflows.slice(0, 10).forEach(w => console.log(`   - ${w.name} (${w.id})`));
    process.exit(1);
  }
  
  console.log(`   ✅ Found: ${knowledgeIngestWorkflow.name}`);
  console.log(`   📋 ID: ${knowledgeIngestWorkflow.id}`);
  console.log(`   🔄 Active: ${knowledgeIngestWorkflow.active ? 'Yes' : 'No'}\n`);
  
  // Step 2: Get workflow details to extract webhook path
  console.log('🔍 Step 2: Fetching workflow details...');
  const detailResponse = await makeApiRequest('GET', `/api/v1/workflows/${knowledgeIngestWorkflow.id}`);
  
  if (detailResponse.status !== 200) {
    console.log(`❌ Failed to fetch workflow details (Status: ${detailResponse.status})`);
    process.exit(1);
  }
  
  const workflowData = detailResponse.data.data || detailResponse.data;
  const webhookPath = extractWebhookPath(workflowData);
  
  if (!webhookPath) {
    console.log('   ⚠️  Could not extract webhook path from workflow');
    console.log('   💡 Using default: knowledge-ingest\n');
  } else {
    console.log(`   ✅ Webhook path: ${webhookPath}\n`);
  }
  
  const finalWebhookPath = webhookPath || 'knowledge-ingest';
  
  // Step 3: Test webhook before activation
  console.log('🧪 Step 3: Testing webhook before activation...');
  const beforeTest = await testWebhook(finalWebhookPath);
  console.log(`   Status: ${beforeTest.status} (${beforeTest.registered ? 'Registered' : 'Not Registered'})\n`);
  
  // Step 4: Activate workflow using proven deactivate/reactivate pattern
  console.log('🔄 Step 4: Activating workflow (deactivate/reactivate pattern)...');
  
  try {
    // Deactivate first (if active)
    if (knowledgeIngestWorkflow.active) {
      console.log('   📴 Deactivating workflow...');
      await makeApiRequest('POST', `/api/v1/workflows/${knowledgeIngestWorkflow.id}/deactivate`);
      console.log('   ✅ Deactivated');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Activate
    console.log('   📡 Activating workflow...');
    const activateResponse = await makeApiRequest('POST', `/api/v1/workflows/${knowledgeIngestWorkflow.id}/activate`);
    
    if (activateResponse.status === 200 || activateResponse.status === 204) {
      console.log('   ✅ Workflow activated\n');
    } else {
      console.log(`   ⚠️  Unexpected status: ${activateResponse.status}`);
      console.log(`   Response: ${activateResponse.body?.substring(0, 200)}...\n`);
    }
  } catch (error) {
    console.log(`   ❌ Activation failed: ${error.message}\n`);
    process.exit(1);
  }
  
  // Step 5: Wait for webhook registration (longer wait for priority workflow)
  console.log('⏳ Step 5: Waiting for webhook registration...');
  console.log('   Waiting 10 seconds (Knowledge Ingest is priority workflow)...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Step 6: Test webhook after activation
  console.log('\n🧪 Step 6: Testing webhook after activation...');
  const afterTest = await testWebhook(finalWebhookPath, 'POST', 3);
  
  console.log(`   Status: ${afterTest.status}`);
  console.log(`   Registered: ${afterTest.registered ? '✅ Yes' : '❌ No'}`);
  if (afterTest.body) {
    const bodyPreview = afterTest.body.length > 100 
      ? afterTest.body.substring(0, 100) + '...' 
      : afterTest.body;
    console.log(`   Response: ${bodyPreview}`);
  }
  console.log('');
  
  // Step 7: Final verification
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (afterTest.registered) {
    console.log('✅ SUCCESS: Knowledge Ingest webhook is registered and operational!');
    console.log(`   Webhook URL: ${N8N_URL}/webhook/${finalWebhookPath}`);
    console.log(`   Status Code: ${afterTest.status}`);
    console.log('\n🎉 RAG ingestion is ready to use!\n');
    console.log('📤 Test ingestion:');
    console.log(`   curl -X POST ${N8N_URL}/webhook/${finalWebhookPath} \\`);
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"content": "test", "type": "milestone"}\'\n');
    process.exit(0);
  } else {
    console.log('⚠️  WARNING: Webhook not registered after activation');
    console.log(`   Status Code: ${afterTest.status}`);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Verify WEBHOOK_URL is set in n8n container:');
    console.log('      docker exec n8n env | grep WEBHOOK_URL');
    console.log('   2. Check n8n logs for webhook registration errors:');
    console.log('      docker logs n8n | grep -i webhook');
    console.log('   3. Try manual toggle in n8n UI:');
    console.log('      https://n8n.pbradygeorgen.com');
    console.log('   4. Wait 60 seconds and test again:');
    console.log(`      curl -X POST ${N8N_URL}/webhook/${finalWebhookPath} -H "Content-Type: application/json" -d \'{"test": true}\'\n`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

