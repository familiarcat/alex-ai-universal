#!/usr/bin/env node
/**
 * Force Webhook Registration by Updating Workflows
 * 
 * Chief O'Brien's insight: Updating a workflow via API forces N8N to re-register webhooks
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

console.log('\n🔧 Force Webhook Registration via Workflow Update\n');
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

async function main() {
  // Fetch all workflows
  console.log('📋 Fetching workflows...');
  const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
  const workflows = workflowsResponse.data?.data || workflowsResponse.data || [];
  console.log(`   Found ${workflows.length} workflows\n`);

  // Update all active workflows to force webhook registration
  console.log('🔄 Updating workflows to force webhook registration...\n');
  let updated = 0;
  let failed = 0;

  for (const workflow of workflows) {
    if (!workflow.active) {
      console.log(`⏭️  Skipping inactive: ${workflow.name}`);
      continue;
    }

    try {
      // Fetch full workflow
      const detailResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
      if (detailResponse.status !== 200) {
        console.log(`⚠️  Failed to fetch: ${workflow.name}`);
        failed++;
        continue;
      }

      const workflowData = detailResponse.data?.data || detailResponse.data;
      
      // Make a tiny update (add/update a tag or update settings)
      const payload = {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: {
          ...(workflowData.settings || {}),
          // Add a timestamp to force update
          executionOrder: workflowData.settings?.executionOrder || 'v1',
        },
        staticData: workflowData.staticData || null,
        tags: workflowData.tags || [],
      };

      // Update workflow (this forces webhook re-registration)
      const updateResponse = await makeRequest('PUT', `/api/v1/workflows/${workflow.id}`, payload);
      
      if (updateResponse.status === 200) {
        console.log(`✅ Updated: ${workflow.name}`);
        updated++;
      } else {
        console.log(`⚠️  Update returned ${updateResponse.status}: ${workflow.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Failed: ${workflow.name} - ${error.message}`);
      failed++;
    }

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log(`\n📊 Update Summary: ${updated} updated, ${failed} failed\n`);

  // Wait for webhook registration
  console.log('⏳ Waiting 20 seconds for webhook registration...');
  await new Promise(resolve => setTimeout(resolve, 20000));
  console.log('   Wait complete\n');

  // Test webhooks
  console.log('🧪 Testing webhook endpoints...\n');
  let registered = 0;
  let notRegistered = 0;

  for (const workflow of workflows) {
    if (!workflow.active) continue;

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
              
              if (testResult.registered) {
                console.log(`✅ ${workflow.name} - /webhook/${cleanPath} (${method})`);
                registered++;
              } else {
                console.log(`❌ ${workflow.name} - /webhook/${cleanPath} (${method}) - NOT REGISTERED`);
                notRegistered++;
              }
              
              // Wait for test to complete
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          }
        }
      }
    } catch (error) {
      // Skip errors
    }
  }

  console.log(`\n📊 Webhook Test Summary:`);
  console.log(`   ✅ Registered: ${registered}`);
  console.log(`   ❌ Not Registered: ${notRegistered}\n`);
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

