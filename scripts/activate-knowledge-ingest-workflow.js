#!/usr/bin/env node

/**
 * 🎯 Activate Knowledge Ingest Workflow
 * 
 * Specifically activates the Knowledge Ingest workflow and verifies its webhook
 * This is a focused script for ensuring the RAG ingestion webhook is available
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

console.log('\n🎯 Activate Knowledge Ingest Workflow');
console.log('═══════════════════════════════════════════════════════════\n');
console.log(`📍 N8N URL: ${N8N_URL}\n`);

// Make HTTPS request
function makeRequest(method, path, data = null) {
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
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test webhook
function testWebhook(webhookPath) {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const testPayload = { test: true, timestamp: Date.now() };
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          registered: res.statusCode !== 404,
        });
      });
    });

    req.on('error', () => {
      resolve({ status: 0, registered: false });
    });

    req.write(JSON.stringify(testPayload));
    req.end();
  });
}

async function main() {
  // Find Knowledge Ingest workflow
  console.log('🔍 Finding Knowledge Ingest workflow...');
  const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
  let workflows = [];
  
  if (workflowsResponse.data) {
    if (Array.isArray(workflowsResponse.data)) {
      workflows = workflowsResponse.data;
    } else if (workflowsResponse.data.data && Array.isArray(workflowsResponse.data.data)) {
      workflows = workflowsResponse.data.data;
    }
  }

  const knowledgeIngestWorkflow = workflows.find(w => 
    w.name.toLowerCase().includes('knowledge ingest') || 
    w.name.toLowerCase().includes('knowledge-ingest') ||
    w.id === 'Ffdgv5Zd8hGeHJGe'
  );

  if (!knowledgeIngestWorkflow) {
    console.log('❌ Knowledge Ingest workflow not found!\n');
    console.log('Available workflows:');
    workflows.forEach(w => console.log(`   - ${w.name} (${w.id})`));
    process.exit(1);
  }

  console.log(`✅ Found: ${knowledgeIngestWorkflow.name} (${knowledgeIngestWorkflow.id})\n`);

  // Check if already active
  if (knowledgeIngestWorkflow.active) {
    console.log('⏭️  Workflow is already active');
  } else {
    console.log('🔄 Activating workflow...');
    try {
      await makeRequest('POST', `/api/v1/workflows/${knowledgeIngestWorkflow.id}/activate`);
      console.log('✅ Workflow activated\n');
    } catch (error) {
      console.log(`❌ Failed to activate: ${error.message}\n`);
      process.exit(1);
    }
  }

  // Wait for webhook registration
  console.log('⏳ Waiting 5 seconds for webhook registration...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Test webhook
  console.log('🧪 Testing knowledge-ingest webhook...');
  const testResult = await testWebhook('knowledge-ingest');

  if (testResult.registered) {
    console.log(`✅ Webhook is registered! (Status: ${testResult.status})\n`);
    console.log('🎉 Knowledge Ingest workflow is ready for RAG ingestion!\n');
  } else {
    console.log(`❌ Webhook not registered (Status: ${testResult.status})\n`);
    console.log('💡 Try deactivating and reactivating the workflow manually in the n8n UI\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

