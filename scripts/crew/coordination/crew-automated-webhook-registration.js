#!/usr/bin/env node

/**
 * 🖖 Crew-Coordinated Automated Webhook Registration
 * 
 * Uses n8n configuration from ~/.zshrc to automatically:
 * 1. Verify n8n connectivity
 * 2. Activate all workflows
 * 3. Register all webhooks
 * 4. Verify webhook registration
 * 
 * Crew Coordination:
 * - Commander Data: Analyzes workflow structure and webhook patterns
 * - Commander Riker: Executes tactical activation sequence
 * - Lieutenant Commander La Forge: Monitors infrastructure health
 * - Chief O'Brien: Implements pragmatic re-registration strategy
 * - Lieutenant Worf: Validates security and authentication
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const readline = require('readline');

// Load credentials
const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey || creds.n8n.ownerApiKey;

if (!N8N_API_KEY) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
  process.exit(1);
}

// Progress bar helper
function updateProgressBar(current, total, prefix = '', suffix = '') {
  const percentage = Math.floor((current / total) * 100);
  const progressBarLength = 30;
  const filled = Math.floor((percentage / 100) * progressBarLength);
  const empty = progressBarLength - filled;
  const progressBar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r${prefix} [${progressBar}] ${percentage}% (${current}/${total})${suffix}`);
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

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

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
async function testWebhook(path, method = 'POST') {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${path}`, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      // 404 = not registered, 401/405/200 = registered
      resolve({ 
        registered: res.statusCode !== 404,
        status: res.statusCode,
        path: path
      });
    });

    req.on('error', () => {
      resolve({ registered: false, status: 'ERR', path: path });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ registered: false, status: 'TIMEOUT', path: path });
    });

    req.end();
  });
}

// Extract webhooks from workflow
function extractWebhooks(workflow) {
  const webhooks = [];
  
  if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
    return webhooks;
  }

  for (const node of workflow.nodes) {
    if (node.type === 'n8n-nodes-base.webhook') {
      const path = node.parameters?.path || node.webhookId || 'unknown';
      const method = node.parameters?.httpMethod || 'POST';
      webhooks.push({ path, method, nodeId: node.id, nodeName: node.name });
    }
  }

  return webhooks;
}

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main execution
async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 CREW-COORDINATED AUTOMATED WEBHOOK REGISTRATION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🤖 Commander Data: Analyzing n8n configuration...');
  console.log(`   Base URL: ${N8N_URL}`);
  console.log(`   API Key: ${N8N_API_KEY.substring(0, 20)}...`);
  console.log('');

  // Step 1: Verify connectivity
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 1: Verifying n8n Connectivity');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('⚡ Commander Riker: Testing API connection...');
  try {
    const testResponse = await makeRequest('GET', '/api/v1/workflows?limit=1');
    if (testResponse.status === 200) {
      console.log('   ✅ n8n API is reachable and authenticated\n');
    } else if (testResponse.status === 401 || testResponse.status === 403) {
      console.log(`   ❌ API unauthorized (${testResponse.status})\n`);
      console.log('   🛡️  Lieutenant Worf: API key validation failed\n');
      console.log('   💡 Recommendation: Verify N8N_OWNER_API_KEY in ~/.zshrc has owner permissions\n');
      process.exit(1);
    } else {
      console.log(`   ⚠️  Unexpected status: ${testResponse.status}\n`);
    }
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}\n`);
    console.log('   🔧 Lieutenant Commander La Forge: Check network connectivity and n8n instance status\n');
    process.exit(1);
  }

  // Step 2: Fetch all workflows
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 2: Fetching Workflows');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🤖 Commander Data: Fetching workflow list...');
  let workflows = [];
  try {
    const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
    
    if (workflowsResponse.status === 200) {
      const data = workflowsResponse.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        workflows = data;
      } else if (data.data && Array.isArray(data.data)) {
        workflows = data.data;
      } else if (data.results && Array.isArray(data.results)) {
        workflows = data.results;
      } else {
        // Try to find array in response
        for (const key in data) {
          if (Array.isArray(data[key])) {
            workflows = data[key];
            break;
          }
        }
      }
      
      console.log(`   ✅ Found ${workflows.length} workflows\n`);
    } else if (workflowsResponse.status === 401 || workflowsResponse.status === 403) {
      console.log('   ❌ API unauthorized - check API key permissions\n');
      console.log('   🛡️  Lieutenant Worf: API key validation failed\n');
      process.exit(1);
    } else {
      console.log(`   ⚠️  Unexpected status: ${workflowsResponse.status}\n`);
      process.exit(1);
    }
  } catch (error) {
    console.log(`   ❌ Failed to fetch workflows: ${error.message}\n`);
    process.exit(1);
  }

  if (workflows.length === 0) {
    console.log('   ⚠️  No workflows found. Nothing to activate.\n');
    return;
  }

  // Step 3: Identify workflows with webhooks
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 3: Identifying Webhook Workflows');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🤖 Commander Data: Analyzing workflow structure...');
  const workflowsWithWebhooks = [];
  let processedCount = 0;

  for (const workflow of workflows) {
    processedCount++;
    updateProgressBar(processedCount, workflows.length, '   Analyzing workflows ');
    
    try {
      const detailResponse = await makeRequest('GET', `/api/v1/workflows/${workflow.id}`);
      if (detailResponse.status === 200) {
        const workflowData = detailResponse.data?.data || detailResponse.data;
        const webhooks = extractWebhooks(workflowData);
        
        if (webhooks.length > 0) {
          workflowsWithWebhooks.push({
            workflow,
            webhooks,
            active: workflow.active || false
          });
        }
      }
    } catch (error) {
      // Skip errors
    }
    
    await sleep(100);
  }
  
  process.stdout.write('\n');
  console.log(`   ✅ Found ${workflowsWithWebhooks.length} workflows with webhooks\n`);

  // Prioritize Knowledge Ingest workflow
  const knowledgeIngestIndex = workflowsWithWebhooks.findIndex(w => 
    w.workflow.name.toLowerCase().includes('knowledge ingest') ||
    w.workflow.name.toLowerCase().includes('knowledge-ingest')
  );
  
  if (knowledgeIngestIndex > 0) {
    const [knowledgeIngest] = workflowsWithWebhooks.splice(knowledgeIngestIndex, 1);
    workflowsWithWebhooks.unshift(knowledgeIngest);
    console.log('   🎯 Prioritized Knowledge Ingest workflow\n');
  }

  // Step 4: Activate workflows and register webhooks
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 4: Activating Workflows & Registering Webhooks');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('⚡ Commander Riker: Executing activation sequence...');
  console.log('🔧 Chief O\'Brien: Implementing pragmatic re-registration strategy...\n');
  
  let activated = 0;
  let alreadyActive = 0;
  let failed = 0;
  let processed = 0;

  for (const { workflow, webhooks, active } of workflowsWithWebhooks) {
    processed++;
    const isPriority = workflow.name.toLowerCase().includes('knowledge ingest');
    const prefix = isPriority ? '🎯' : '🔧';
    
    console.log(`${prefix} ${workflow.name}`);
    
    if (active) {
      console.log(`   ⏭️  Already active`);
      alreadyActive++;
      
      // Test webhooks even if already active
      process.stdout.write('   Testing webhooks...   ');
      let allRegistered = true;
      for (const webhook of webhooks) {
        const testResult = await testWebhook(webhook.path, webhook.method);
        if (!testResult.registered) {
          allRegistered = false;
        }
      }
      
      if (allRegistered) {
        console.log('✅ All webhooks registered\n');
      } else {
        console.log('⚠️  Some webhooks not registered - forcing re-registration...\n');
        
        // Force re-registration
        try {
          await makeRequest('POST', `/api/v1/workflows/${workflow.id}/deactivate`);
          await sleep(1000);
          await makeRequest('POST', `/api/v1/workflows/${workflow.id}/activate`);
          await sleep(isPriority ? 5000 : 2000);
          console.log('   ✅ Re-registration complete\n');
        } catch (error) {
          console.log(`   ❌ Re-registration failed: ${error.message}\n`);
          failed++;
        }
      }
    } else {
      // Activate workflow
      try {
        await makeRequest('POST', `/api/v1/workflows/${workflow.id}/activate`);
        console.log(`   ✅ Activated`);
        
        // Wait for webhook registration
        const waitTime = isPriority ? 5000 : 2000;
        process.stdout.write(`   Waiting ${waitTime / 1000}s for webhook registration...   `);
        await sleep(waitTime);
        console.log('✅ Wait complete\n');
        
        activated++;
      } catch (error) {
        console.log(`   ❌ Activation failed: ${error.message}\n`);
        failed++;
      }
    }
    
    await sleep(500);
  }

  // Step 5: Final verification
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('STEP 5: Final Webhook Verification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('🔧 Lieutenant Commander La Forge: Verifying infrastructure health...');
  console.log('🛡️  Lieutenant Worf: Validating security...\n');
  
  let verified = 0;
  let unregistered = 0;
  let totalWebhooks = 0;
  
  for (const { workflow, webhooks } of workflowsWithWebhooks) {
    for (const webhook of webhooks) {
      totalWebhooks++;
      const testResult = await testWebhook(webhook.path, webhook.method);
      
      if (testResult.registered) {
        verified++;
      } else {
        unregistered++;
        console.log(`   ❌ ${workflow.name}: /webhook/${webhook.path} (${testResult.status})`);
      }
    }
  }
  
  console.log('');

  // Final summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Workflows:`);
  console.log(`   ✅ Activated: ${activated}`);
  console.log(`   ⏭️  Already active: ${alreadyActive}`);
  console.log(`   ❌ Failed: ${failed}\n`);
  
  console.log(`Webhooks:`);
  console.log(`   ✅ Registered: ${verified}/${totalWebhooks}`);
  console.log(`   ❌ Unregistered: ${unregistered}/${totalWebhooks}\n`);
  
  if (verified === totalWebhooks) {
    console.log('🎉 All webhooks successfully registered!\n');
    console.log('🖖 Crew coordination complete. All systems operational.\n');
  } else if (verified > 0) {
    console.log('⚠️  Some webhooks require manual intervention.\n');
    console.log('💡 Recommendation: Check n8n UI for workflow activation status.\n');
  } else {
    console.log('❌ Webhook registration failed. Manual intervention required.\n');
    console.log('💡 Recommendation: Verify WEBHOOK_URL is set correctly on n8n instance.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

