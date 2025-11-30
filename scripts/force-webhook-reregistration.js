#!/usr/bin/env node
/**
 * Force Webhook Re-registration for Failed Webhooks
 * 
 * Uses Chief O'Brien's strategy: deactivate and reactivate workflows
 * to force N8N to re-register webhooks
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read API key directly from ~/.zshrc
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1] || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in ~/.zshrc');
  process.exit(1);
}

console.log('\n🔧 Force Webhook Re-registration (Chief O\'Brien\'s Method)\n');
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
function testWebhook(webhookPath, method = 'POST') {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const testPayload = { test: true, timestamp: Date.now() };
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + (method === 'GET' ? '?test=true' : ''),
      method: method,
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

    if (method === 'POST') {
      req.write(JSON.stringify(testPayload));
    }
    req.end();
  });
}

// Extract webhooks from workflow
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
  // Fetch all workflows
  console.log('📋 Fetching workflows...');
  const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
  const workflows = workflowsResponse.data?.data || workflowsResponse.data || [];
  console.log(`   Found ${workflows.length} workflows\n`);

  // Find workflows with webhooks that are returning 404
  console.log('🔍 Identifying workflows with unregistered webhooks...\n');
  const workflowsToFix = [];

  for (const workflow of workflows) {
    if (!workflow.active) continue;

    try {
      const detailResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
      if (detailResponse.status === 200) {
        const workflowData = detailResponse.data?.data || detailResponse.data;
        const webhooks = extractWebhooks(workflowData);
        
        for (const webhook of webhooks) {
          const testResult = await testWebhook(webhook.path, webhook.method);
          if (!testResult.registered) {
            workflowsToFix.push({
              workflowId: workflow.id,
              workflowName: workflow.name,
              webhook: webhook.path,
              method: webhook.method,
            });
          }
        }
      }
    } catch (error) {
      // Skip errors
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (workflowsToFix.length === 0) {
    console.log('✅ All webhooks are registered!\n');
    return;
  }

  console.log(`   Found ${workflowsToFix.length} webhooks that need re-registration\n`);

  // Group by workflow ID
  const workflowsById = {};
  workflowsToFix.forEach(item => {
    if (!workflowsById[item.workflowId]) {
      workflowsById[item.workflowId] = {
        workflowId: item.workflowId,
        workflowName: item.workflowName,
        webhooks: [],
      };
    }
    workflowsById[item.workflowId].webhooks.push(item);
  });

  // Force re-registration: deactivate and reactivate
  console.log('🔄 Forcing webhook re-registration...\n');
  let fixed = 0;
  let stillFailed = 0;

  for (const workflowInfo of Object.values(workflowsById)) {
    try {
      console.log(`   🔧 ${workflowInfo.workflowName}...`);
      
      // Deactivate
      await makeRequest('POST', `/api/v1/workflows/${workflowInfo.workflowId}/deactivate`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reactivate (this triggers webhook registration)
      await makeRequest('POST', `/api/v1/workflows/${workflowInfo.workflowId}/activate`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Test webhooks again
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

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 Re-registration Summary:`);
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ⚠️  Still Failed: ${stillFailed}\n`);
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

