#!/usr/bin/env node
/**
 * Force Webhook Re-registration for Failed Webhooks
 * 
 * Uses Chief O'Brien's strategy: deactivate and reactivate workflows
 * to force N8N to re-register webhooks
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

// Load credentials using universal credential loader
const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

if (!N8N_API_KEY) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
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

// Progress indicator
function showProgress(message, current, total) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;
  const barLength = 30;
  const filled = Math.round((percent / 100) * barLength);
  const empty = barLength - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r   ${message} [${bar}] ${percent}% (${current}/${total})`);
  if (current === total) {
    process.stdout.write('\n');
  }
}

async function main() {
  // Fetch all workflows
  console.log('📋 Fetching workflows...');
  process.stdout.write('   Connecting to n8n API...');
  
  let workflows = [];
  try {
    const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
    process.stdout.write('\r   ✅ Connected to n8n API\n');
    
    if (workflowsResponse.status === 200) {
      process.stdout.write('   Parsing response...');
      try {
        const data = typeof workflowsResponse.data === 'string' 
          ? JSON.parse(workflowsResponse.data) 
          : workflowsResponse.data;
        
        if (Array.isArray(data)) {
          workflows = data;
        } else if (data.data && Array.isArray(data.data)) {
          workflows = data.data;
        } else if (data.results && Array.isArray(data.results)) {
          workflows = data.results;
        } else if (typeof data === 'object' && Object.keys(data).length > 0) {
          // Try to find array in response
          for (const key in data) {
            if (Array.isArray(data[key])) {
              workflows = data[key];
              break;
            }
          }
        }
        process.stdout.write(`\r   ✅ Parsed ${workflows.length} workflows\n\n`);
      } catch (e) {
        process.stdout.write(`\r   ⚠️  Failed to parse response: ${e.message}\n`);
        console.log(`   Response status: ${workflowsResponse.status}`);
        console.log(`   Response body: ${workflowsResponse.data?.substring(0, 200)}...\n`);
        return;
      }
    } else if (workflowsResponse.status === 401 || workflowsResponse.status === 403) {
      process.stdout.write('\r   ❌ API unauthorized - check API key\n\n');
      return;
    } else {
      process.stdout.write(`\r   ⚠️  Unexpected status: ${workflowsResponse.status}\n\n`);
      return;
    }
  } catch (error) {
    process.stdout.write(`\r   ❌ Failed to fetch workflows: ${error.message}\n\n`);
    return;
  }
  
  if (workflows.length === 0) {
    console.log('   ⚠️  No workflows found\n');
    return;
  }

  // Find workflows with webhooks that are returning 404
  console.log('🔍 Identifying workflows with unregistered webhooks...\n');
  const workflowsToFix = [];
  
  // Prioritize Knowledge Ingest workflow
  const knowledgeIngestWorkflow = workflows.find(w => 
    w.name.toLowerCase().includes('knowledge ingest') || 
    w.name.toLowerCase().includes('knowledge-ingest') ||
    w.id === 'Ffdgv5Zd8hGeHJGe'
  );

  // Check Knowledge Ingest first if it exists
  if (knowledgeIngestWorkflow) {
    console.log('🎯 Checking Knowledge Ingest workflow first...');
    process.stdout.write('   Fetching workflow details...');
    try {
      const detailResponse = await makeRequest('GET', `/api/v1/workflows/${knowledgeIngestWorkflow.id}`);
      process.stdout.write('\r   ✅ Fetched workflow details\n');
      
      if (detailResponse.status === 200) {
        const workflowData = detailResponse.data?.data || detailResponse.data;
        const webhooks = extractWebhooks(workflowData);
        
        process.stdout.write(`   Testing ${webhooks.length} webhook(s)...`);
        for (let i = 0; i < webhooks.length; i++) {
          const webhook = webhooks[i];
          showProgress(`Testing webhook ${i + 1}/${webhooks.length}`, i, webhooks.length);
          
          // Specifically check for knowledge-ingest webhook
          if (webhook.path === 'knowledge-ingest' || webhook.path.includes('knowledge')) {
            const testResult = await testWebhook(webhook.path, webhook.method);
            if (!testResult.registered) {
              workflowsToFix.unshift({ // Add to beginning for priority
                workflowId: knowledgeIngestWorkflow.id,
                workflowName: knowledgeIngestWorkflow.name,
                webhook: webhook.path,
                method: webhook.method,
                priority: true, // Mark as priority
              });
            } else {
              console.log(`\n   ✅ Knowledge Ingest webhook is registered`);
            }
          }
        }
        if (webhooks.length > 0) process.stdout.write('\n');
      }
    } catch (error) {
      process.stdout.write(`\r   ⚠️  Could not check Knowledge Ingest: ${error.message}\n`);
    }
  }

  // Check remaining workflows
  console.log(`\n   Checking ${workflows.length} workflows for webhook issues...`);
  let checked = 0;
  for (const workflow of workflows) {
    // Skip Knowledge Ingest if already processed
    if (knowledgeIngestWorkflow && workflow.id === knowledgeIngestWorkflow.id) {
      checked++;
      showProgress('Checking workflows', checked, workflows.length);
      continue;
    }
    
    if (!workflow.active) {
      checked++;
      showProgress('Checking workflows', checked, workflows.length);
      continue;
    }

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
    checked++;
    showProgress('Checking workflows', checked, workflows.length);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log('');

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
  // Sort to prioritize Knowledge Ingest
  const sortedWorkflows = Object.values(workflowsById).sort((a, b) => {
    const aIsKnowledgeIngest = a.workflowName.toLowerCase().includes('knowledge ingest') || 
                                a.workflowName.toLowerCase().includes('knowledge-ingest');
    const bIsKnowledgeIngest = b.workflowName.toLowerCase().includes('knowledge ingest') || 
                                b.workflowName.toLowerCase().includes('knowledge-ingest');
    if (aIsKnowledgeIngest && !bIsKnowledgeIngest) return -1;
    if (!aIsKnowledgeIngest && bIsKnowledgeIngest) return 1;
    return 0;
  });

  console.log(`\n🔄 Forcing webhook re-registration for ${sortedWorkflows.length} workflow(s)...\n`);
  let fixed = 0;
  let stillFailed = 0;
  let processed = 0;

  for (const workflowInfo of sortedWorkflows) {
    const isKnowledgeIngest = workflowInfo.workflowName.toLowerCase().includes('knowledge ingest') || 
                              workflowInfo.workflowName.toLowerCase().includes('knowledge-ingest');
    
    processed++;
    showProgress(`Processing ${workflowInfo.workflowName}`, processed, sortedWorkflows.length);
    
    try {
      if (isKnowledgeIngest) {
        console.log(`\n   🎯 ${workflowInfo.workflowName} (Priority: Knowledge Ingest)`);
      } else {
        console.log(`\n   🔧 ${workflowInfo.workflowName}`);
      }
      
      process.stdout.write('      Deactivating...');
      await makeRequest('POST', `/api/v1/workflows/${workflowInfo.workflowId}/deactivate`);
      process.stdout.write('\r      ✅ Deactivated\n');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      process.stdout.write('      Activating...');
      await makeRequest('POST', `/api/v1/workflows/${workflowInfo.workflowId}/activate`);
      process.stdout.write('\r      ✅ Activated\n');
      
      // Wait longer for Knowledge Ingest to ensure webhook registration
      const waitTime = isKnowledgeIngest ? 5000 : 2000;
      process.stdout.write(`      Waiting ${waitTime/1000}s for webhook registration...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      process.stdout.write('\r      ✅ Wait complete\n');
      
      // Test webhooks again
      process.stdout.write('      Testing webhooks...');
      let allFixed = true;
      for (let i = 0; i < workflowInfo.webhooks.length; i++) {
        const webhook = workflowInfo.webhooks[i];
        const testResult = await testWebhook(webhook.path, webhook.method);
        if (!testResult.registered) {
          allFixed = false;
        }
      }
      
      if (allFixed) {
        process.stdout.write('\r      ✅ All webhooks registered!\n');
        fixed++;
      } else {
        process.stdout.write('\r      ⚠️  Some webhooks still not registered\n');
        stillFailed++;
      }
    } catch (error) {
      process.stdout.write(`\r      ❌ Failed: ${error.message}\n`);
      stillFailed++;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('');

  console.log(`\n📊 Re-registration Summary:`);
  console.log(`   ✅ Fixed: ${fixed}`);
  console.log(`   ⚠️  Still Failed: ${stillFailed}\n`);
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

