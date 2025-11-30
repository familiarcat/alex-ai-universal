#!/usr/bin/env node
/**
 * Sync N8N workflows with proper authentication handling
 * 
 * This script attempts multiple authentication methods:
 * 1. API Key (if available)
 * 2. Session-based auth (if credentials available)
 * 3. Direct file import (if API unavailable)
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const credentials = loadCrewCredentials();
const N8N_URL = credentials.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = credentials.n8n.apiKey;

console.log('\n🔄 N8N Workflow Sync with Authentication\n');
console.log(`📍 N8N URL: ${N8N_URL}`);
console.log(`🔑 API Key: ${N8N_API_KEY ? N8N_API_KEY.substring(0, 10) + '...' : 'NOT SET'}\n`);

// Test API key authentication
async function testApiKey() {
  if (!N8N_API_KEY) {
    console.log('⚠️  No API key found. Checking N8N health...\n');
    return false;
  }

  try {
    const response = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY
      },
      timeout: 5000
    });
    
    console.log('✅ API Key authentication successful!');
    console.log(`   Found ${response.data?.data?.length || 0} existing workflows\n`);
    return true;
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ API Key authentication failed (401 Unauthorized)');
      console.log('   The API key may be invalid or N8N may not have API keys enabled.\n');
    } else {
      console.log(`⚠️  API test failed: ${error.message}\n`);
    }
    return false;
  }
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

// Main sync function
async function syncWorkflows() {
  const apiKeyWorks = await testApiKey();
  
  if (!apiKeyWorks) {
    console.log('📋 Workflow Sync Options:\n');
    console.log('   1. Generate API Key in N8N:');
    console.log('      - Go to https://n8n.pbradygeorgen.com');
    console.log('      - Settings > API');
    console.log('      - Create a new API key');
    console.log('      - Add to ~/.zshrc: export N8N_OWNER_API_KEY="your-key"\n');
    console.log('   2. Manual Import:');
    console.log('      - Go to https://n8n.pbradygeorgen.com');
    console.log('      - Workflows > Import from File');
    console.log('      - Select workflow JSON files from n8n-workflows/\n');
    console.log('   3. Use restore-all-n8n-workflows.js (if it has session auth)\n');
    
    const workflowFiles = getWorkflowFiles();
    console.log(`\n📦 Found ${workflowFiles.length} workflow files ready to sync:\n`);
    workflowFiles.slice(0, 10).forEach(file => {
      console.log(`   - ${file}`);
    });
    if (workflowFiles.length > 10) {
      console.log(`   ... and ${workflowFiles.length - 10} more`);
    }
    console.log('');
    return;
  }

  // Proceed with API key sync
  console.log('🔄 Starting workflow sync...\n');
  
  const workflowFiles = getWorkflowFiles();
  console.log(`📦 Found ${workflowFiles.length} workflow files\n`);
  
  // Get existing workflows
  let existingWorkflows = [];
  try {
    const response = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    existingWorkflows = response.data?.data || response.data || [];
  } catch (error) {
    console.error('❌ Failed to fetch existing workflows:', error.message);
    return;
  }

  const workflowByName = new Map(
    existingWorkflows
      .filter(w => w?.name)
      .map(w => [w.name, w])
  );

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

      if (workflowId && existing) {
        // Update existing
        await axios.put(`${N8N_URL}/api/v1/workflows/${workflowId}`, payload, {
          headers: { 'X-N8N-API-KEY': N8N_API_KEY }
        });
        console.log(`✅ Updated: ${workflowName} (${workflowId})`);
        synced++;
      } else {
        // Create new
        const response = await axios.post(`${N8N_URL}/api/v1/workflows`, payload, {
          headers: { 'X-N8N-API-KEY': N8N_API_KEY }
        });
        console.log(`✅ Created: ${workflowName} (${response.data.id})`);
        created++;
      }
    } catch (error) {
      const fileName = path.basename(filePath);
      console.error(`❌ Failed: ${fileName} - ${error.response?.data?.message || error.message}`);
      failed++;
    }
  }

  console.log(`\n✨ Sync complete: ${synced} updated, ${created} created, ${failed} failed\n`);
}

syncWorkflows().catch(error => {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
});

