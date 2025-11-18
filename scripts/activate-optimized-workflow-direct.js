#!/usr/bin/env node
/**
 * Activate Optimized Memory Workflow - Direct Method
 * Uses the same authentication as sync-n8n-workflows-direct.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Read API key directly from ~/.zshrc (same method as sync-n8n-workflows-direct.js)
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL=["']([^"']+)["']/)?.[1] || 
             zshrc.match(/export N8N_BASE_URL=["']([^"']+)["']/)?.[1] || 
             'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY=["']([^"']+)["']/)?.[1] ||
                   zshrc.match(/export N8N_OWNER_API_KEY=["']([^"']+)["']/)?.[1];

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY or N8N_OWNER_API_KEY not found in ~/.zshrc');
  process.exit(1);
}

console.log('\n' + '═'.repeat(80));
console.log('🖖 ACTIVATING OPTIMIZED MEMORY WORKFLOW');
console.log('═'.repeat(80));
console.log(`\n📍 N8N URL: ${N8N_URL}`);
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
      timeout: 10000
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
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  try {
    // Step 1: Get all workflows
    console.log('🔍 Fetching workflows from N8N...');
    const workflowsResponse = await makeRequest('GET', '/api/v1/workflows');
    
    if (workflowsResponse.status !== 200) {
      console.error(`❌ Failed to fetch workflows: ${workflowsResponse.status}`);
      console.error(`   Response: ${JSON.stringify(workflowsResponse.data)}`);
      process.exit(1);
    }
    
    const workflows = Array.isArray(workflowsResponse.data) ? workflowsResponse.data : 
                     Array.isArray(workflowsResponse.data?.data) ? workflowsResponse.data.data : [];
    
    console.log(`   ✅ Found ${workflows.length} workflows\n`);
    
    // Step 2: Find optimized workflow
    const optimizedWorkflow = workflows.find(w => 
      w.name && w.name.includes('Crew Memory Storage') && w.name.includes('Optimized')
    );
    
    // Step 3: Find old workflow
    const oldWorkflow = workflows.find(w => 
      w.name && 
      w.name.includes('Crew Memory Storage') && 
      !w.name.includes('Optimized')
    );
    
    if (!optimizedWorkflow) {
      console.log('⚠️  Optimized workflow not found in N8N');
      console.log('   💡 Syncing workflow first...\n');
      
      // Try to sync the workflow
      const workflowPath = path.join(process.cwd(), 'n8n-workflows', 'crew-memory-storage-workflow-optimized.json');
      if (!fs.existsSync(workflowPath)) {
        console.error(`❌ Workflow file not found: ${workflowPath}`);
        console.log('\n💡 Please run: node scripts/sync-n8n-workflows-direct.js');
        process.exit(1);
      }
      
      console.log('📤 Importing optimized workflow...');
      const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
      
      const importResponse = await makeRequest('POST', '/api/v1/workflows', {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings || {},
        staticData: workflowData.staticData || null
      });
      
      if (importResponse.status === 200 || importResponse.status === 201) {
        console.log(`✅ Workflow imported: ${importResponse.data.name} (${importResponse.data.id})`);
        
        // Now activate it
        console.log('🔄 Activating workflow...');
        const activateResponse = await makeRequest('POST', `/api/v1/workflows/${importResponse.data.id}/activate`);
        
        if (activateResponse.status === 200 || activateResponse.status === 201) {
          console.log('✅ Optimized workflow activated successfully!\n');
        } else {
          console.log(`⚠️  Workflow imported but activation returned ${activateResponse.status}`);
          console.log('   💡 Please activate manually in N8N UI\n');
        }
      } else {
        console.error(`❌ Failed to import workflow: ${importResponse.status}`);
        console.error(`   Response: ${JSON.stringify(importResponse.data)}`);
        process.exit(1);
      }
    } else {
      console.log(`📍 Found optimized workflow: ${optimizedWorkflow.name} (${optimizedWorkflow.id})`);
      console.log(`   Current status: ${optimizedWorkflow.active ? '✅ Active' : '❌ Inactive'}\n`);
      
      if (!optimizedWorkflow.active) {
        // Activate optimized workflow
        console.log('🔄 Activating optimized workflow...');
        const activateResponse = await makeRequest('POST', `/api/v1/workflows/${optimizedWorkflow.id}/activate`);
        
        if (activateResponse.status === 200 || activateResponse.status === 201) {
          console.log('✅ Optimized workflow activated successfully!');
        } else {
          console.log(`⚠️  Activation returned ${activateResponse.status}`);
          console.log(`   Response: ${JSON.stringify(activateResponse.data)}`);
          console.log('   💡 Please activate manually in N8N UI');
        }
      } else {
        console.log('✅ Optimized workflow is already active!');
      }
      
      // Deactivate old workflow if it exists and is active
      if (oldWorkflow && oldWorkflow.active) {
        console.log(`\n📍 Found old workflow: ${oldWorkflow.name} (${oldWorkflow.id})`);
        console.log('🔄 Deactivating old workflow...');
        const deactivateResponse = await makeRequest('POST', `/api/v1/workflows/${oldWorkflow.id}/deactivate`);
        
        if (deactivateResponse.status === 200 || deactivateResponse.status === 201) {
          console.log('✅ Old workflow deactivated');
        } else {
          console.log(`⚠️  Failed to deactivate old workflow: ${deactivateResponse.status}`);
          console.log('   💡 Please deactivate manually in N8N UI');
        }
      }
    }
    
    console.log('\n' + '═'.repeat(80));
    console.log('✅ ACTIVATION COMPLETE');
    console.log('═'.repeat(80));
    console.log('\n🎯 Next steps:');
    console.log('   • Monitor workflow execution in N8N');
    console.log('   • Run memory tests: node scripts/test-memory-storage-optimization.js');
    console.log('   • Track deduplication effectiveness\n');
    
  } catch (error) {
    console.error(`\n❌ Activation failed: ${error.message}`);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

main();

