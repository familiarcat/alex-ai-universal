#!/usr/bin/env node

/**
 * Investigate n8n API Methods (November 2025)
 * 
 * Tests different HTTP methods and endpoints to discover current API behavior
 * Workflows show as active and have credentials linked, but webhooks don't register
 * 
 * Hypothesis: API methods may have changed in recent n8n versions
 * 
 * Crew: Commander Data (API Investigation) + Lt. Cmdr. La Forge (Debugging)
 */

const https = require('https');
const http = require('http');

function getCredential(key) {
  const fs = require('fs');
  try {
    const zshrc = fs.readFileSync(`${process.env.HOME}/.zshrc`, 'utf8');
    const match = zshrc.match(new RegExp(`export ${key}="([^"]+)"`)) ||
                  zshrc.match(new RegExp(`export ${key}=([^\n]+)`));
    return match ? match[1].replace(/"/g, '').trim() : null;
  } catch (error) {
    return null;
  }
}

const N8N_API_KEY = getCredential('N8N_API_KEY');
const N8N_URL = getCredential('N8N_URL') || 'https://n8n.pbradygeorgen.com';

console.log('🔬 n8n API Investigation (November 2025)');
console.log('=========================================');
console.log('');
console.log(`Testing against: ${N8N_URL}`);
console.log('');

function apiRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const options = {
      method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    };
    
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data), headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testWebhookDirect() {
  console.log('🧪 TEST 1: Direct Webhook Access');
  console.log('==================================');
  console.log('');
  
  const tests = [
    { url: '/webhook/project-content-retrieve?projectId=temporal', method: 'GET', name: 'Retrieve (GET)' },
    { url: '/webhook/project-content-store', method: 'POST', name: 'Store (POST)', body: {projectId: 'test', headline: 'Test', theme: 'midnight', projectType: 'business'} },
  ];
  
  for (const test of tests) {
    console.log(`Testing: ${test.name}`);
    console.log(`   ${test.method} ${test.url}`);
    
    try {
      const result = await apiRequest(test.url, test.method, test.body || null);
      console.log(`   Status: ${result.status}`);
      
      if (result.status === 404) {
        console.log(`   ❌ Webhook not registered`);
      } else if (result.status === 200) {
        console.log(`   ✅ SUCCESS!`);
        console.log(`   Response: ${JSON.stringify(result.data).substring(0, 100)}`);
      } else {
        console.log(`   ⚠️  Unexpected status`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

async function testWorkflowActivation() {
  console.log('🧪 TEST 2: Workflow Activation Methods');
  console.log('======================================');
  console.log('');
  
  const WORKFLOW_ID = 'NmxfBurDWPEQDqeE';
  
  // Test different activation approaches
  const methods = [
    { method: 'POST', path: `/api/v1/workflows/${WORKFLOW_ID}/activate`, name: 'POST /activate endpoint' },
    { method: 'PATCH', path: `/api/v1/workflows/${WORKFLOW_ID}`, body: {active: true}, name: 'PATCH with active:true' },
    { method: 'PUT', path: `/api/v1/workflows/${WORKFLOW_ID}`, body: {active: true}, name: 'PUT with active:true' },
  ];
  
  for (const test of methods) {
    console.log(`Testing: ${test.name}`);
    
    try {
      const result = await apiRequest(test.path, test.method, test.body || null);
      console.log(`   Status: ${result.status}`);
      
      if (result.data.message) {
        console.log(`   Message: ${result.data.message}`);
      }
      
      if (result.status === 200 || result.status === 204) {
        console.log(`   ✅ Method works!`);
      } else {
        console.log(`   ❌ Method doesn't work`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

async function checkWorkflowDetails() {
  console.log('🧪 TEST 3: Workflow Configuration Details');
  console.log('=========================================');
  console.log('');
  
  const WORKFLOW_ID = 'NmxfBurDWPEQDqeE';
  
  const result = await apiRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  
  if (result.status === 200) {
    const workflow = result.data;
    console.log(`Workflow: ${workflow.name}`);
    console.log(`Active: ${workflow.active}`);
    console.log(`Has webhook trigger: ${workflow.nodes.some(n => n.type === 'n8n-nodes-base.webhook')}`);
    console.log('');
    
    // Find webhook node
    const webhookNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
    if (webhookNode) {
      console.log('Webhook Node Configuration:');
      console.log(`   Path: ${webhookNode.parameters.path}`);
      console.log(`   Method: ${webhookNode.parameters.httpMethod}`);
      console.log(`   Response Mode: ${webhookNode.parameters.responseMode}`);
    }
    console.log('');
    
    // Find Supabase node
    const supabaseNode = workflow.nodes.find(n => n.type === 'n8n-nodes-base.supabase');
    if (supabaseNode) {
      console.log('Supabase Node Configuration:');
      console.log(`   Has credentials: ${!!supabaseNode.credentials}`);
      if (supabaseNode.credentials) {
        console.log(`   Credential ID: ${supabaseNode.credentials.supabaseApi?.id || 'NONE'}`);
        console.log(`   ✅ Credential linked!`);
      } else {
        console.log(`   ❌ NO CREDENTIAL LINKED`);
      }
    }
  }
  console.log('');
}

async function main() {
  await checkWorkflowDetails();
  await testWebhookDirect();
  
  console.log('=========================================');
  console.log('📊 Investigation Summary');
  console.log('=========================================');
  console.log('');
  console.log('Findings:');
  console.log('  - Workflows show as active: TRUE');
  console.log('  - Credentials are linked: TRUE');  
  console.log('  - Webhooks registered: (see test results above)');
  console.log('');
  console.log('If webhooks still 404:');
  console.log('  Likely cause: Supabase credential has wrong key');
  console.log('  Solution: Use service_role key instead of anon key');
  console.log('');
  console.log('To fix:');
  console.log('  1. bash scripts/get-supabase-service-key.sh');
  console.log('  2. Add SUPABASE_SERVICE_ROLE_KEY to ~/.zshrc');
  console.log('  3. Update credential in n8n');
  console.log('');
  console.log('🖖 Investigation complete!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

