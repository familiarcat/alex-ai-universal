#!/usr/bin/env node
/**
 * Activate All N8N Workflows and Verify Webhooks
 * 
 * This script:
 * 1. Activates all workflows in N8N
 * 2. Waits for webhook registration
 * 3. Verifies webhook endpoints are accessible
 * 4. Reports on webhook health
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read API key directly from ~/.zshrc (reliable method)
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1] || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in ~/.zshrc');
  process.exit(1);
}

console.log('\n🔄 N8N Workflow Activation and Webhook Verification\n');
console.log(`📍 N8N URL: ${N8N_URL}`);
console.log(`🔑 API Key: ${N8N_API_KEY.substring(0, 20)}...\n`);

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

// Test webhook endpoint
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
          response: body.substring(0, 200),
        });
      });
    });

    req.on('error', (error) => {
      resolve({ status: 0, registered: false, error: error.message });
    });

    if (method === 'POST') {
      req.write(JSON.stringify(testPayload));
    }
    req.end();
  });
}

// Extract webhook paths from workflow
function extractWebhooks(workflow) {
  const webhooks = [];
  
  if (!workflow.nodes) return webhooks;
  
  workflow.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.webhook') {
      const path = node.parameters?.path;
      const method = (node.parameters?.httpMethod || 'POST').toUpperCase();
      
      if (path) {
        // Clean up webhook path (remove leading/trailing slashes)
        const cleanPath = path.replace(/^\/+|\/+$/g, '');
        
        webhooks.push({
          path: cleanPath,
          method: method,
          nodeId: node.id,
          nodeName: node.name,
          webhookId: node.webhookId,
        });
      }
    }
  });
  
  return webhooks;
}

// Main function
async function main() {
  // Step 1: Fetch all workflows
  console.log('📋 Step 1: Fetching all workflows...');
  const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
  
  if (workflowsResponse.status !== 200) {
    console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
    console.error(`   Response: ${JSON.stringify(workflowsResponse.data)}`);
    process.exit(1);
  }

  const workflows = workflowsResponse.data?.data || workflowsResponse.data || [];
  console.log(`   Found ${workflows.length} workflows\n`);

  // Step 2: Activate all workflows
  console.log('⚡ Step 2: Activating workflows...\n');
  let activated = 0;
  let alreadyActive = 0;
  let failed = 0;

  for (const workflow of workflows) {
    if (workflow.active) {
      console.log(`⏭️  Already active: ${workflow.name}`);
      alreadyActive++;
      continue;
    }

    try {
      const activateResponse = await makeRequest('POST', `/api/v1/workflows/${workflow.id}/activate`);
      if (activateResponse.status === 200 || activateResponse.status === 204) {
        console.log(`✅ Activated: ${workflow.name}`);
        activated++;
      } else {
        console.log(`⚠️  Activation returned ${activateResponse.status}: ${workflow.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Failed to activate: ${workflow.name} - ${error.message}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  console.log(`\n📊 Activation Summary: ${activated} activated, ${alreadyActive} already active, ${failed} failed\n`);

  // Step 3: Wait for webhook registration
  console.log('⏳ Step 3: Waiting 15 seconds for webhook registration...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  console.log('   Wait complete\n');

  // Step 4: Fetch workflow details and extract webhooks
  console.log('🔍 Step 4: Extracting webhook information...\n');
  const workflowWebhooks = [];

  for (const workflow of workflows) {
    if (!workflow.active) {
      continue;
    }

    try {
      const detailResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
      if (detailResponse.status === 200) {
        const workflowData = detailResponse.data?.data || detailResponse.data;
        const webhooks = extractWebhooks(workflowData);
        if (webhooks.length > 0) {
          workflowWebhooks.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            webhooks: webhooks,
          });
          console.log(`   ✅ ${workflow.name}: ${webhooks.length} webhook(s) found`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Failed to fetch details for: ${workflow.name} - ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`   Found ${workflowWebhooks.length} workflows with webhooks\n`);

  // Step 5: Test webhook endpoints
  console.log('🧪 Step 5: Testing webhook endpoints...\n');
  let webhooksRegistered = 0;
  let webhooksFailed = 0;
  const webhookResults = [];

  for (const { workflowName, webhooks } of workflowWebhooks) {
    for (const webhook of webhooks) {
      const webhookPath = webhook.path;
      const testResult = await testWebhook(webhookPath, webhook.method);
      
      const result = {
        workflow: workflowName,
        webhook: webhookPath,
        method: webhook.method,
        status: testResult.status,
        registered: testResult.registered,
      };

      if (testResult.registered) {
        console.log(`✅ ${workflowName} - /webhook/${webhookPath} (${webhook.method}) - HTTP ${testResult.status}`);
        webhooksRegistered++;
      } else {
        console.log(`❌ ${workflowName} - /webhook/${webhookPath} (${webhook.method}) - HTTP ${testResult.status} (NOT REGISTERED)`);
        webhooksFailed++;
      }

      webhookResults.push(result);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 FINAL SUMMARY');
  console.log('═'.repeat(80));
  console.log(`\n✅ Workflows Activated: ${activated}`);
  console.log(`⏭️  Already Active: ${alreadyActive}`);
  console.log(`❌ Activation Failed: ${failed}`);
  console.log(`\n✅ Webhooks Registered: ${webhooksRegistered}`);
  console.log(`❌ Webhooks Not Registered: ${webhooksFailed}`);
  console.log(`\n📋 Total Workflows: ${workflows.length}`);
  console.log(`🔗 Workflows with Webhooks: ${workflowWebhooks.length}`);
  console.log(`\n🎯 Next Steps:`);
  console.log(`   1. Review failed webhooks above`);
  console.log(`   2. Visit ${N8N_URL} to manually activate any failed workflows`);
  console.log(`   3. Test webhook endpoints: curl -X POST ${N8N_URL}/webhook/<path>`);
  console.log(`   4. Monitor webhook health: node scripts/monitor-webhook-health.js\n`);
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

