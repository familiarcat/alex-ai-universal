#!/usr/bin/env node

/**
 * EXPORT N8N WORKFLOWS TO GIT
 * 
 * Exports current n8n workflows to version-controlled JSON files
 * This creates the source of truth for Client => n8n => Supabase architecture
 * 
 * Crew: Data (documentation), O'Brien (automation), Picard (architecture)
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
    n8nApiKey: getEnvVar('N8N_API_KEY')
  };
}

const { n8nUrl, n8nApiKey } = loadCredentials();

const OUTPUT_DIR = path.join(__dirname, '..', 'n8n-workflows', 'ddd-architecture');

// Core DDD workflows
const WORKFLOWS_TO_EXPORT = [
  { id: '2eoq8ycgL5M8dG7z', name: 'project-content-store', description: 'Client => n8n => Supabase (Create/Update)' },
  { id: 'NmxfBurDWPEQDqeE', name: 'project-content-retrieve', description: 'Supabase => n8n => Client (Read)' },
  { id: 'bgfljtVeLVCSnfI5', name: 'project-content-delete', description: 'Client => n8n => Supabase (Soft Delete)' }
];

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

async function exportWorkflow(workflow) {
  console.log(`\n📥 Exporting: ${workflow.name}`);
  console.log(`   ID: ${workflow.id}`);
  
  const response = await apiRequest('GET', `${n8nUrl}/api/v1/workflows/${workflow.id}`);
  
  if (response.status !== 200) {
    console.error(`   ❌ Failed to fetch: ${response.status}`);
    return false;
  }
  
  const workflowData = response.data;
  
  // Clean workflow data for git versioning
  const cleanedWorkflow = {
    meta: {
      name: workflow.name,
      description: workflow.description,
      exported: new Date().toISOString(),
      n8nVersion: workflowData.versionId || 'unknown'
    },
    workflow: {
      name: workflowData.name,
      nodes: workflowData.nodes,
      connections: workflowData.connections,
      settings: workflowData.settings || {},
      staticData: workflowData.staticData || null
    }
  };
  
  // Write to file
  const outputPath = path.join(OUTPUT_DIR, `${workflow.name}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(cleanedWorkflow, null, 2));
  
  console.log(`   ✅ Exported to: ${path.relative(process.cwd(), outputPath)}`);
  console.log(`   Nodes: ${workflowData.nodes.length}`);
  console.log(`   Active: ${workflowData.active ? 'Yes' : 'No'}`);
  
  return true;
}

(async () => {
  console.log('📦 EXPORT N8N WORKFLOWS TO GIT');
  console.log('================================');
  console.log('');
  console.log('Creating source of truth for DDD architecture...');
  console.log('');
  
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`✅ Created directory: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
  }
  
  let successCount = 0;
  
  for (const workflow of WORKFLOWS_TO_EXPORT) {
    const success = await exportWorkflow(workflow);
    if (success) successCount++;
  }
  
  console.log('');
  console.log('=========================================');
  console.log('📊 Export Summary');
  console.log('=========================================');
  console.log(`✅ Exported: ${successCount}/${WORKFLOWS_TO_EXPORT.length} workflows`);
  console.log(`📁 Location: ${path.relative(process.cwd(), OUTPUT_DIR)}`);
  console.log('');
  
  if (successCount === WORKFLOWS_TO_EXPORT.length) {
    console.log('🎉 ALL WORKFLOWS EXPORTED!');
    console.log('');
    console.log('These files are now the source of truth.');
    console.log('Commit them to git for version control.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review exported workflows');
    console.log('  2. Run deploy-ddd-workflows.js to recreate in fresh n8n');
    console.log('  3. Commit to git');
  }
})();

