#!/usr/bin/env node
/**
 * List Workflows Requiring Manual Activation
 * 
 * This script identifies workflows with unregistered webhooks that require
 * manual activation in the N8N UI.
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
    req.setTimeout(30000, () => {
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
function testWebhook(webhookPath, method = 'POST') {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + (method === 'GET' ? '?test=true' : ''),
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    };

    const req = https.request(options, (res) => {
      resolve({
        status: res.statusCode,
        registered: res.statusCode !== 404,
      });
    });

    req.on('error', () => {
      resolve({ status: 0, registered: false });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false });
    });

    if (method === 'POST') {
      req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
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
        const cleanPath = path.replace(/^\/+|\/+$/g, '');
        webhooks.push({
          path: cleanPath,
          method: method,
          nodeId: node.id,
          nodeName: node.name,
        });
      }
    }
  });
  
  return webhooks;
}

async function main() {
  console.log('\n' + '═'.repeat(80));
  console.log('📋 WORKFLOWS REQUIRING MANUAL ACTIVATION');
  console.log('═'.repeat(80));
  console.log(`📍 N8N URL: ${N8N_URL}\n`);

  try {
    // Fetch all workflows
    const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
    
    if (workflowsResponse.status !== 200) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      process.exit(1);
    }

    const workflows = workflowsResponse.data?.data || workflowsResponse.data || [];
    const manualActivationRequired = [];

    // Check each workflow
    for (const workflow of workflows) {
      if (!workflow.active) {
        continue; // Skip inactive workflows
      }

      try {
        const detailResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
        if (detailResponse.status === 200) {
          const workflowData = detailResponse.data?.data || detailResponse.data;
          const webhooks = extractWebhooks(workflowData);
          
          if (webhooks.length === 0) {
            continue; // Skip workflows without webhooks
          }

          // Test each webhook
          let hasUnregistered = false;
          const unregisteredWebhooks = [];

          for (const webhook of webhooks) {
            const testResult = await testWebhook(webhook.path, webhook.method);
            if (!testResult.registered) {
              hasUnregistered = true;
              unregisteredWebhooks.push({
                path: webhook.path,
                method: webhook.method,
                status: testResult.status,
              });
            }
          }

          if (hasUnregistered) {
            manualActivationRequired.push({
              id: workflow.id,
              name: workflow.name,
              active: workflow.active,
              unregisteredWebhooks: unregisteredWebhooks,
              totalWebhooks: webhooks.length,
            });
          }
        }
      } catch (error) {
        // Skip workflows we can't check
      }
    }

    // Display results
    if (manualActivationRequired.length === 0) {
      console.log('✅ All webhooks are registered! No manual activation required.\n');
      process.exit(0);
    }

    console.log(`Found ${manualActivationRequired.length} workflow(s) requiring manual activation:\n`);

    manualActivationRequired.forEach((wf, index) => {
      console.log(`${index + 1}. ${wf.name}`);
      console.log(`   Workflow ID: ${wf.id}`);
      console.log(`   Status: ${wf.active ? 'Active' : 'Inactive'}`);
      console.log(`   Webhooks: ${wf.unregisteredWebhooks.length}/${wf.totalWebhooks} unregistered`);
      console.log(`   Unregistered webhooks:`);
      wf.unregisteredWebhooks.forEach(wh => {
        console.log(`      - /webhook/${wh.path} (${wh.method}) - HTTP ${wh.status}`);
      });
      console.log(`   Manual activation URL: ${N8N_URL}/workflow/${wf.id}`);
      console.log('');
    });

    console.log('═'.repeat(80));
    console.log('\n📝 Instructions:');
    console.log('   1. Visit each workflow URL above');
    console.log('   2. Toggle the workflow off and back on in the N8N UI');
    console.log('   3. Wait 10-15 seconds for webhook registration');
    console.log('   4. Re-run this script to verify: node scripts/list-manual-activation-required.js\n');
    console.log('═'.repeat(80) + '\n');

    // Exit with error code if manual activation is required
    process.exit(1);

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    process.exit(1);
  }
}

main();

