#!/usr/bin/env node
/**
 * 🔧 Activate Webhooks with Timeout
 * 
 * Forces webhook re-registration with a 2-minute timeout
 */

const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const https = require('https');

const creds = loadCrewCredentials();
if (!creds.n8n.apiKey) {
  console.error('❌ N8N API key not found');
  process.exit(1);
}

const N8N_URL = creds.n8n.baseUrl;
const N8N_API_KEY = creds.n8n.apiKey;
const TIMEOUT_MS = 120000; // 2 minutes

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
      timeout: 10000,
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

function testWebhook(webhookPath, method = 'POST') {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + (method === 'GET' ? '?test=true' : ''),
      method: method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
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

    req.on('error', () => resolve({ status: 0, registered: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false });
    });

    if (method === 'POST') {
      req.write(JSON.stringify({ test: true }));
    }
    req.end();
  });
}

function extractWebhooks(workflow) {
  const webhooks = [];
  if (!workflow.nodes) return webhooks;
  
  workflow.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.webhook') {
      const path = node.parameters?.path;
      const method = (node.parameters?.httpMethod || 'POST').toUpperCase();
      if (path) {
        webhooks.push({
          path: path.replace(/^\/+|\/+$/g, ''),
          method: method,
        });
      }
    }
  });
  return webhooks;
}

async function main() {
  const startTime = Date.now();
  
  console.log('🔧 Activating Webhooks (2-minute timeout)\n');
  console.log(`📍 N8N URL: ${N8N_URL}\n`);
  
  // Fetch all workflows
  console.log('📋 Fetching workflows...');
  const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
  let workflows = [];
  
  if (workflowsResponse.data) {
    if (Array.isArray(workflowsResponse.data)) {
      workflows = workflowsResponse.data;
    } else if (Array.isArray(workflowsResponse.data.data)) {
      workflows = workflowsResponse.data.data;
    } else if (workflowsResponse.data.data && Array.isArray(workflowsResponse.data.data)) {
      workflows = workflowsResponse.data.data;
    }
  }
  
  console.log(`   Found ${workflows.length} workflows\n`);
  
  // Find workflows with webhooks
  console.log('🔍 Identifying workflows with webhooks...\n');
  const workflowsWithWebhooks = [];
  
  for (const workflow of workflows) {
    if (!workflow.active) continue;
    
    try {
      const detailResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
      if (detailResponse.status === 200) {
        const workflowData = detailResponse.data?.data || detailResponse.data;
        const webhooks = extractWebhooks(workflowData);
        
        if (webhooks.length > 0) {
          workflowsWithWebhooks.push({
            id: workflow.id,
            name: workflow.name,
            webhooks: webhooks,
          });
        }
      }
    } catch (error) {
      // Skip errors
    }
    
    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log('\n⏱️  Timeout reached (2 minutes)');
      break;
    }
  }
  
  console.log(`   Found ${workflowsWithWebhooks.length} workflows with webhooks\n`);
  
  if (workflowsWithWebhooks.length === 0) {
    console.log('✅ No webhooks to register\n');
    return;
  }
  
  // Force re-registration
  console.log('🔄 Forcing webhook re-registration...\n');
  let fixed = 0;
  let stillFailed = 0;
  let skipped = 0;
  
  for (const workflowInfo of workflowsWithWebhooks) {
    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) {
      console.log('\n⏱️  Timeout reached (2 minutes)');
      break;
    }
    
    try {
      console.log(`   🔧 ${workflowInfo.name}...`);
      
      // Deactivate
      await makeRequest('POST', `/api/v1/workflows/${workflowInfo.id}/deactivate`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reactivate
      await makeRequest('POST', `/api/v1/workflows/${workflowInfo.id}/activate`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test webhooks
      let allFixed = true;
      for (const webhook of workflowInfo.webhooks) {
        const testResult = await testWebhook(webhook.path, webhook.method);
        if (!testResult.registered) {
          allFixed = false;
        }
      }
      
      if (allFixed) {
        console.log(`      ✅ All webhooks registered`);
        fixed++;
      } else {
        console.log(`      ⚠️  Some webhooks still not registered`);
        stillFailed++;
      }
    } catch (error) {
      console.log(`      ❌ Failed: ${error.message}`);
      stillFailed++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n📊 Re-registration Summary:`);
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ⚠️  Still Failed: ${stillFailed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ⏱️  Time: ${Math.round((Date.now() - startTime) / 1000)}s\n`);
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

