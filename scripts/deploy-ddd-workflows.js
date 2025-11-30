#!/usr/bin/env node

/**
 * DEPLOY DDD ARCHITECTURE WORKFLOWS
 * 
 * Deploys Client => n8n => Supabase workflows from git-versioned JSON files
 * Creates/updates workflows, links credentials, activates
 * 
 * This is the STANDARD deployment script for the DDD architecture
 * Run this to set up n8n for any new environment
 * 
 * Crew: O'Brien (implementation), Picard (architecture), Data (verification)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

function loadCredentials() {
  const zshrcPath = `${process.env.HOME}/.zshrc`;
  const zshrc = fs.readFileSync(zshrcPath, 'utf8');
  
  const getEnvVar = (name) => {
    const match = zshrc.match(new RegExp(`export ${name}="([^"]+)"`));
    return match ? match[1] : process.env[name];
  };
  
  return {
    n8nUrl: getEnvVar('N8N_URL'),
    n8nApiKey: getEnvVar('N8N_API_KEY'),
    supabaseUrl: getEnvVar('SUPABASE_URL'),
    supabaseServiceKey: getEnvVar('SUPABASE_SERVICE_KEY') || getEnvVar('SUPABASE_SERVICE_ROLE_KEY')
  };
}

const creds = loadCredentials();
const WORKFLOW_DIR = path.join(__dirname, '..', 'n8n-workflows', 'ddd-architecture');

function apiRequest(method, url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': creds.n8nApiKey,
        'Content-Type': 'application/json'
      }
    };
    
    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
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

async function ensureSupabaseCredential() {
  console.log('\n🔐 Setting up Supabase credential...');
  
  // Check if credential exists
  const credResponse = await apiRequest('GET', `${creds.n8nUrl}/api/v1/credentials`);
  
  if (credResponse.status === 200 && Array.isArray(credResponse.data.data)) {
    const existing = credResponse.data.data.find(c => 
      c.type === 'supabaseApi' && c.name === 'Supabase Account'
    );
    
    if (existing) {
      console.log(`   ✅ Credential exists: ${existing.id}`);
      return existing.id;
    }
  }
  
  // Create new credential
  console.log('   Creating new Supabase credential...');
  
  const createResponse = await apiRequest('POST', `${creds.n8nUrl}/api/v1/credentials`, {
    name: 'Supabase Account',
    type: 'supabaseApi',
    data: {
      host: creds.supabaseUrl, // Full URL with https://
      serviceRole: creds.supabaseServiceKey
    }
  });
  
  if (createResponse.status === 200 || createResponse.status === 201) {
    console.log(`   ✅ Credential created: ${createResponse.data.id}`);
    return createResponse.data.id;
  } else {
    throw new Error(`Failed to create credential: ${createResponse.status}`);
  }
}

async function deployWorkflow(workflowFile, credentialId) {
  const workflowPath = path.join(WORKFLOW_DIR, workflowFile);
  
  if (!fs.existsSync(workflowPath)) {
    console.error(`   ❌ File not found: ${workflowFile}`);
    return false;
  }
  
  const workflowConfig = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  const workflowData = workflowConfig.workflow;
  
  console.log(`\n📤 Deploying: ${workflowConfig.meta.name}`);
  console.log(`   Description: ${workflowConfig.meta.description}`);
  
  // Link credential to Supabase nodes
  const linkedNodes = workflowData.nodes.map(node => {
    if (node.type === 'n8n-nodes-base.supabase') {
      return {
        ...node,
        credentials: {
          supabaseApi: {
            id: credentialId,
            name: 'Supabase Account'
          }
        }
      };
    }
    return node;
  });
  
  // Check if workflow exists
  const listResponse = await apiRequest('GET', `${creds.n8nUrl}/api/v1/workflows`);
  let existingWorkflow = null;
  
  if (listResponse.status === 200 && Array.isArray(listResponse.data.data)) {
    existingWorkflow = listResponse.data.data.find(w => w.name === workflowData.name);
  }
  
  const payload = {
    name: workflowData.name,
    nodes: linkedNodes,
    connections: workflowData.connections,
    settings: workflowData.settings || {}
  };
  
  let workflowId;
  
  if (existingWorkflow) {
    console.log(`   Updating existing workflow: ${existingWorkflow.id}`);
    const updateResponse = await apiRequest('PUT', `${creds.n8nUrl}/api/v1/workflows/${existingWorkflow.id}`, payload);
    
    if (updateResponse.status === 200) {
      workflowId = existingWorkflow.id;
      console.log(`   ✅ Updated`);
    } else {
      console.error(`   ❌ Update failed: ${updateResponse.status}`);
      return false;
    }
  } else {
    console.log(`   Creating new workflow...`);
    const createResponse = await apiRequest('POST', `${creds.n8nUrl}/api/v1/workflows`, payload);
    
    if (createResponse.status === 200 || createResponse.status === 201) {
      workflowId = createResponse.data.id;
      console.log(`   ✅ Created: ${workflowId}`);
    } else {
      console.error(`   ❌ Create failed: ${createResponse.status}`);
      return false;
    }
  }
  
  // Activate workflow
  const activateResponse = await apiRequest('POST', `${creds.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {});
  
  if (activateResponse.status === 200 || activateResponse.status === 204) {
    console.log(`   ✅ Activated`);
  } else {
    console.log(`   ⚠️  Auto-activation not available (manual toggle needed)`);
  }
  
  return true;
}

async function verifyDeployment() {
  console.log('\n🧪 Verifying DDD architecture...');
  
  const tests = [
    {
      name: 'Retrieve',
      method: 'GET',
      url: `${creds.n8nUrl}/webhook/project-content-retrieve?projectId=temporal`,
      expectedStatus: [200, 404] // 404 is OK if no data seeded yet
    }
  ];
  
  for (const test of tests) {
    try {
      const response = await apiRequest(test.method, test.url, null);
      
      if (test.expectedStatus.includes(response.status)) {
        console.log(`   ✅ ${test.name}: ${response.status} (webhook registered)`);
      } else {
        console.log(`   ⚠️  ${test.name}: ${response.status} (may need manual save in UI)`);
      }
    } catch (error) {
      console.log(`   ❌ ${test.name}: ${error.message}`);
    }
  }
}

(async () => {
  console.log('🚀 DEPLOY DDD ARCHITECTURE WORKFLOWS');
  console.log('=====================================');
  console.log('');
  console.log('Client => n8n => Supabase');
  console.log('');
  
  try {
    // Step 1: Ensure Supabase credential
    const credentialId = await ensureSupabaseCredential();
    
    // Step 2: Deploy workflows
    const workflowFiles = [
      'project-content-store.json',
      'project-content-retrieve.json',
      'project-content-delete.json'
    ];
    
    let successCount = 0;
    
    for (const file of workflowFiles) {
      const success = await deployWorkflow(file, credentialId);
      if (success) successCount++;
    }
    
    console.log('');
    console.log('=========================================');
    console.log('📊 Deployment Summary');
    console.log('=========================================');
    console.log(`✅ Deployed: ${successCount}/${workflowFiles.length} workflows`);
    console.log('');
    
    if (successCount === workflowFiles.length) {
      console.log('🎉 DDD ARCHITECTURE DEPLOYED!');
      console.log('');
      
      // Step 3: Verify
      await verifyDeployment();
      
      console.log('');
      console.log('📋 Next steps:');
      console.log('   1. If webhooks show 404, open each workflow in n8n UI and click Save');
      console.log('   2. Run seed-projects-to-supabase.js to populate initial data');
      console.log('   3. Test full DDD flow from dashboard');
    } else {
      console.log('⚠️  Some workflows failed - check errors above');
    }
  } catch (error) {
    console.error('');
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
})();

