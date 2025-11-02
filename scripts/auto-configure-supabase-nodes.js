#!/usr/bin/env node

/**
 * AUTO-CONFIGURE SUPABASE NODES
 * 
 * Chief O'Brien: "Let's automate the Table dropdown configuration!"
 * 
 * This script updates the Supabase node parameters in all 3 workflows:
 * 1. Operation: "upsert" (or "insert" with upsert options)
 * 2. Table: "projects"
 * 3. Columns: Configured correctly
 * 4. Options: Upsert settings
 * 
 * Uses n8n API to update node parameters programmatically.
 */

const https = require('https');
const http = require('http');

// Load credentials from environment or ~/.zshrc
function loadCredentials() {
  const fs = require('fs');
  const zshrcPath = `${process.env.HOME}/.zshrc`;
  const zshrc = fs.readFileSync(zshrcPath, 'utf8');
  
  const getEnvVar = (name) => {
    const match = zshrc.match(new RegExp(`export ${name}="([^"]+)"`));
    return match ? match[1] : process.env[name];
  };
  
  return {
    n8nUrl: getEnvVar('N8N_URL'),
    n8nApiKey: getEnvVar('N8N_API_KEY')
  };
}

const { n8nUrl, n8nApiKey } = loadCredentials();

if (!n8nUrl || !n8nApiKey) {
  console.error('❌ Missing N8N_URL or N8N_API_KEY');
  process.exit(1);
}

// Workflow configurations - merge with existing parameters
const WORKFLOWS = {
  'Project Content Store': {
    workflowId: '2eoq8ycgL5M8dG7z',
    nodeId: 'supabase-upsert',
    parameterUpdates: {
      table: 'projects',
      columns: 'project_id,headline,subheadline,description,theme,project_type,business_type,components,pages,updated_at',
      options: {
        onConflict: 'project_id',
        skipOnConflict: false,
        upsert: true
      }
    }
  },
  'Project Content Retrieve': {
    workflowId: 'NmxfBurDWPEQDqeE',
    nodeId: 'supabase-select',
    parameterUpdates: {
      table: 'projects',
      filterType: 'manual',
      matchType: 'matchAll',
      filters: {
        conditions: [
          {
            keyName: 'project_id',
            keyValue: '={{ $json.project_id }}'
          },
          {
            keyName: 'deleted_at',
            keyValue: 'is.null'
          }
        ]
      },
      options: {
        limit: 1
      }
    }
  },
  'Project Content Delete': {
    workflowId: 'bgfljtVeLVCSnfI5',
    nodeId: 'supabase-soft-delete',
    parameterUpdates: {
      table: 'projects',
      filterType: 'manual',
      matchType: 'matchAll',
      filters: {
        conditions: [
          {
            keyName: 'project_id',
            keyValue: '={{ $json.body.projectId }}'
          }
        ]
      },
      columns: {
        mappings: [
          {
            column: 'deleted_at',
            value: '={{ $now }}'
          }
        ]
      }
    }
  }
};

// Fetch workflow, update node, save workflow
async function configureWorkflow(workflowName, config) {
  console.log(`\n📝 Configuring: ${workflowName}`);
  console.log(`   Workflow ID: ${config.workflowId}`);
  console.log(`   Node ID: ${config.nodeId}`);
  
  // 1. Fetch current workflow
  const workflowUrl = `${n8nUrl}/api/v1/workflows/${config.workflowId}`;
  const workflow = await apiRequest('GET', workflowUrl, null);
  
  if (!workflow || !workflow.nodes) {
    console.error(`❌ Failed to fetch workflow`);
    return false;
  }
  
  // 2. Find and update Supabase node
  const nodeIndex = workflow.nodes.findIndex(n => n.id === config.nodeId || n.name.toLowerCase().includes('supabase'));
  
  if (nodeIndex === -1) {
    console.error(`❌ Supabase node not found in workflow`);
    return false;
  }
  
  const node = workflow.nodes[nodeIndex];
  console.log(`   Found node: ${node.name} (${node.id})`);
  
  // 3. Merge node parameters (preserve existing, add/update specified)
  workflow.nodes[nodeIndex].parameters = {
    ...workflow.nodes[nodeIndex].parameters,
    ...config.parameterUpdates
  };
  
  // 4. Prepare minimal update payload (only fields API accepts)
  const updatePayload = {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings || {}
  };
  
  // 5. Save workflow
  const updateUrl = `${n8nUrl}/api/v1/workflows/${config.workflowId}`;
  const updated = await apiRequest('PUT', updateUrl, updatePayload);
  
  if (updated && updated.id) {
    console.log(`   ✅ Node configured!`);
    console.log(`      Table: ${config.parameterUpdates.table}`);
    
    // 5. Activate workflow
    const activateUrl = `${n8nUrl}/api/v1/workflows/${config.workflowId}/activate`;
    await apiRequest('POST', activateUrl, {});
    console.log(`   ✅ Workflow activated!`);
    
    return true;
  } else {
    console.error(`   ❌ Failed to save workflow`);
    return false;
  }
}

// HTTP request helper
function apiRequest(method, url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'X-N8N-API-KEY': n8nApiKey,
        'Content-Type': 'application/json'
      }
    };
    
    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          resolve(body);
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

// Main execution
(async () => {
  console.log('🔧 AUTO-CONFIGURE SUPABASE NODES');
  console.log('==================================');
  console.log('');
  console.log('Chief O\'Brien: "Setting Table dropdowns programmatically!"');
  console.log('');
  
  let successCount = 0;
  
  for (const [name, config] of Object.entries(WORKFLOWS)) {
    try {
      const success = await configureWorkflow(name, config);
      if (success) successCount++;
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('');
  console.log('=========================================');
  console.log('📊 Configuration Summary');
  console.log('=========================================');
  console.log(`✅ Success: ${successCount}/${Object.keys(WORKFLOWS).length} workflows`);
  console.log('');
  
  if (successCount === Object.keys(WORKFLOWS).length) {
    console.log('🎉 ALL NODES CONFIGURED!');
    console.log('');
    console.log('⏳ Waiting for n8n to register webhooks (5 seconds)...');
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('');
    console.log('🧪 Testing webhooks...');
    console.log('');
    
    // Test retrieve
    try {
      const testUrl = `${n8nUrl}/webhook/project-content-retrieve?projectId=temporal`;
      const testResponse = await apiRequest('GET', testUrl, null);
      
      if (testResponse && testResponse.headline) {
        console.log(`✅ WEBHOOKS REGISTERED!`);
        console.log(`   Retrieved temporal: ${testResponse.headline}`);
        console.log('');
        console.log('🎉 DDD ARCHITECTURE: 100% COMPLETE!');
        console.log('');
        console.log('   Client => n8n => Supabase ✅');
      } else {
        console.log('⚠️  Webhook test response:');
        console.log(JSON.stringify(testResponse, null, 2));
      }
    } catch (error) {
      console.log(`⚠️  Webhook test failed: ${error.message}`);
      console.log('   May need a few more seconds for webhook registration');
    }
  } else {
    console.log('⚠️  Some workflows failed to configure');
    console.log('   You may need to manually set Table dropdowns in n8n UI');
  }
  
  console.log('');
  console.log('🖖 Chief O\'Brien: "Parameters set, webhooks should work now!"');
})();

