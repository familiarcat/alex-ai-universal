#!/usr/bin/env node
/**
 * Sync N8N workflows using direct HTTPS requests (more reliable than axios)
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

console.log('\n🔄 N8N Workflow Sync (Direct HTTPS)\n');
console.log(`📍 N8N URL: ${N8N_URL}`);
console.log(`🔑 API Key: ${N8N_API_KEY.substring(0, 20)}... (${N8N_API_KEY.length} chars)\n`);

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

// Get workflow files
function getWorkflowFiles() {
  const workflowsDir = path.join(process.cwd(), 'n8n-workflows');
  const workflowFiles = [];
  
  function findJsonFiles(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !file.includes('node_modules')) {
        findJsonFiles(filePath);
      } else if (file.endsWith('.json')) {
        workflowFiles.push(filePath);
      }
    });
  }
  
  findJsonFiles(workflowsDir);
  return workflowFiles.map(f => path.relative(process.cwd(), f));
}

// Main sync
async function syncWorkflows() {
  // Test API key
  console.log('🔍 Testing API key...');
  const testResponse = await makeRequest('GET', '/api/v1/workflows');
  
  if (testResponse.status !== 200) {
    console.error(`❌ API authentication failed: ${testResponse.status}`);
    console.error(`   Response: ${JSON.stringify(testResponse.data)}`);
    process.exit(1);
  }

  console.log('✅ API authentication successful!');
  const existingWorkflows = testResponse.data?.data || [];
  console.log(`   Found ${existingWorkflows.length} existing workflows\n`);

  const workflowByName = new Map(
    existingWorkflows
      .filter(w => w?.name)
      .map(w => [w.name, w])
  );

  const workflowFiles = getWorkflowFiles();
  console.log(`📦 Found ${workflowFiles.length} workflow files to sync\n`);

  let synced = 0;
  let created = 0;
  let failed = 0;

  for (const filePath of workflowFiles) {
    try {
      const workflow = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const workflowName = workflow.name || path.basename(filePath, '.json');
      
      const existing = workflowByName.get(workflowName);
      const workflowId = existing?.id || workflow.id;

      const payload = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings || {},
        staticData: workflow.staticData || null
      };

      let response;
      if (workflowId && existing) {
        // Update existing
        response = await makeRequest('PUT', `/api/v1/workflows/${workflowId}`, payload);
        if (response.status === 200) {
          console.log(`✅ Updated: ${workflowName} (${workflowId})`);
          synced++;
        } else {
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
        }
      } else {
        // Create new
        response = await makeRequest('POST', '/api/v1/workflows', payload);
        if (response.status === 200 || response.status === 201) {
          console.log(`✅ Created: ${workflowName} (${response.data.id})`);
          created++;
        } else {
          throw new Error(`HTTP ${response.status}: ${JSON.stringify(response.data)}`);
        }
      }
    } catch (error) {
      const fileName = path.basename(filePath);
      console.error(`❌ Failed: ${fileName} - ${error.message}`);
      failed++;
    }
  }

  console.log(`\n✨ Sync complete: ${synced} updated, ${created} created, ${failed} failed\n`);
}

syncWorkflows().catch(error => {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
});

