#!/usr/bin/env node
/**
 * N8N Webhook Status Report
 * 
 * Provides a comprehensive report of workflow activation and webhook status
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
          response: body.substring(0, 100),
        });
      });
    });

    req.on('error', () => {
      resolve({ status: 0, registered: false, error: 'Connection failed' });
    });

    if (method === 'POST') {
      req.write(JSON.stringify(testPayload));
    }
    req.end();
  });
}

async function main() {
  console.log('\n📊 N8N Workflow and Webhook Status Report\n');
  console.log(`📍 N8N URL: ${N8N_URL}\n`);

  // Fetch all workflows
  const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
  const workflows = workflowsResponse.data?.data || workflowsResponse.data || [];

  const activeWorkflows = workflows.filter(w => w.active);
  const inactiveWorkflows = workflows.filter(w => !w.active);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 WORKFLOW STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Active Workflows: ${activeWorkflows.length}`);
  console.log(`⏸️  Inactive Workflows: ${inactiveWorkflows.length}`);
  console.log(`📦 Total Workflows: ${workflows.length}\n`);

  // Analyze webhooks
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔗 WEBHOOK STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const webhookStatus = {
    registered: [],
    notRegistered: [],
    errors: [],
  };

  for (const workflow of activeWorkflows) {
    try {
      const detailResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
      if (detailResponse.status === 200) {
        const workflowData = detailResponse.data?.data || detailResponse.data;
        const nodes = workflowData.nodes || [];
        
        for (const node of nodes) {
          if (node.type === 'n8n-nodes-base.webhook') {
            const webhookPath = node.parameters?.path;
            const method = (node.parameters?.httpMethod || 'POST').toUpperCase();
            
            if (webhookPath) {
              const cleanPath = webhookPath.replace(/^\/+|\/+$/g, '');
              const testResult = await testWebhook(cleanPath, method);
              
              const webhookInfo = {
                workflow: workflow.name,
                path: cleanPath,
                method: method,
                status: testResult.status,
                registered: testResult.registered,
              };

              if (testResult.registered) {
                webhookStatus.registered.push(webhookInfo);
              } else {
                webhookStatus.notRegistered.push(webhookInfo);
              }
              
              await new Promise(resolve => setTimeout(resolve, 150));
            }
          }
        }
      }
    } catch (error) {
      webhookStatus.errors.push({ workflow: workflow.name, error: error.message });
    }
  }

  console.log(`✅ Registered Webhooks: ${webhookStatus.registered.length}`);
  console.log(`❌ Not Registered: ${webhookStatus.notRegistered.length}`);
  console.log(`⚠️  Errors: ${webhookStatus.errors.length}\n`);

  // Show registered webhooks
  if (webhookStatus.registered.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ REGISTERED WEBHOOKS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    webhookStatus.registered.forEach(w => {
      console.log(`   ✅ ${w.workflow}`);
      console.log(`      URL: ${N8N_URL}/webhook/${w.path}`);
      console.log(`      Method: ${w.method}`);
      console.log(`      Status: HTTP ${w.status}\n`);
    });
  }

  // Show unregistered webhooks
  if (webhookStatus.notRegistered.length > 0) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ UNREGISTERED WEBHOOKS (Need Manual Activation)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    webhookStatus.notRegistered.forEach(w => {
      console.log(`   ❌ ${w.workflow}`);
      console.log(`      Expected: ${N8N_URL}/webhook/${w.path} (${w.method})`);
      console.log(`      Status: HTTP ${w.status} (404 - Not Found)\n`);
    });
  }

  // Summary and recommendations
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY & RECOMMENDATIONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ ${activeWorkflows.length} workflows are active`);
  console.log(`✅ ${webhookStatus.registered.length} webhooks are registered and accessible`);
  console.log(`❌ ${webhookStatus.notRegistered.length} webhooks need manual activation\n`);

  if (webhookStatus.notRegistered.length > 0) {
    console.log('💡 To fix unregistered webhooks:');
    console.log('   1. Visit https://n8n.pbradygeorgen.com');
    console.log('   2. Open each workflow listed above');
    console.log('   3. Click "Save" (even without changes)');
    console.log('   4. Ensure the workflow is active (toggle switch)');
    console.log('   5. Wait 10-15 seconds for webhook registration\n');
  }

  console.log('🎯 Next Steps:');
  console.log(`   1. Test registered webhooks: curl -X POST ${N8N_URL}/webhook/<path>`);
  console.log(`   2. Monitor webhook health: node scripts/monitor-webhook-health.js`);
  console.log(`   3. Verify crew workflows: All 10 crew member webhooks should be registered\n`);
}

main().catch(error => {
  console.error('❌ Report failed:', error.message);
  process.exit(1);
});

