#!/usr/bin/env node
/**
 * Delete a specific N8N workflow by name
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

// Get workflow name from command line or use default
const WORKFLOW_NAME = process.argv[2] || 'UTILITY - Generic Sub-workflow - OpenRouter - Production';

console.log('\n🗑️  N8N Workflow Deletion\n');
console.log(`📍 N8N URL: ${N8N_URL}`);
console.log(`🎯 Target Workflow: ${WORKFLOW_NAME}\n`);

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

async function main() {
  // Step 1: Find the workflow
  console.log('🔍 Searching for workflow...');
  const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
  
  if (workflowsResponse.status !== 200) {
    console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
    process.exit(1);
  }

  const workflows = workflowsResponse.data?.data || workflowsResponse.data || [];
  const workflow = workflows.find(w => w.name === WORKFLOW_NAME);

  if (!workflow) {
    console.log(`⚠️  Workflow "${WORKFLOW_NAME}" not found`);
    console.log(`\nAvailable workflows:`);
    workflows.slice(0, 10).forEach(w => {
      console.log(`   - ${w.name}`);
    });
    if (workflows.length > 10) {
      console.log(`   ... and ${workflows.length - 10} more`);
    }
    process.exit(1);
  }

  console.log(`✅ Found workflow: ${workflow.name}`);
  console.log(`   ID: ${workflow.id}`);
  console.log(`   Active: ${workflow.active ? 'Yes' : 'No'}\n`);

  // Step 2: Deactivate if active
  if (workflow.active) {
    console.log('⏸️  Deactivating workflow...');
    const deactivateResponse = await makeRequest('POST', `/api/v1/workflows/${workflow.id}/deactivate`);
    if (deactivateResponse.status === 200 || deactivateResponse.status === 204) {
      console.log('✅ Workflow deactivated\n');
    } else {
      console.log(`⚠️  Deactivation returned ${deactivateResponse.status}\n`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Step 3: Delete the workflow
  console.log('🗑️  Deleting workflow...');
  const deleteResponse = await makeRequest('DELETE', `/api/v1/workflows/${workflow.id}`);
  
  if (deleteResponse.status === 200 || deleteResponse.status === 204) {
    console.log(`✅ Workflow "${WORKFLOW_NAME}" deleted successfully\n`);
  } else {
    console.error(`❌ Failed to delete workflow: ${deleteResponse.status}`);
    console.error(`   Response: ${JSON.stringify(deleteResponse.data)}`);
    process.exit(1);
  }

  // Step 4: Verify deletion
  console.log('🔍 Verifying deletion...');
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const verifyResponse = await makeRequest('GET', '/api/v1/workflows');
  const updatedWorkflows = verifyResponse.data?.data || verifyResponse.data || [];
  const stillExists = updatedWorkflows.find(w => w.id === workflow.id);

  if (stillExists) {
    console.log('⚠️  Workflow still exists after deletion attempt');
  } else {
    console.log('✅ Workflow successfully removed from N8N\n');
  }
}

main().catch(error => {
  console.error('❌ Deletion failed:', error.message);
  process.exit(1);
});

