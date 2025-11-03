#!/usr/bin/env node

/**
 * 🔄 AGGRESSIVE N8N WORKFLOW RESTORATION
 * 
 * Aggressively cleans workflow JSONs to remove ALL read-only fields
 * before importing to n8n
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper function to recursively find JSON files
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Aggressive cleanup of workflow JSON
function cleanWorkflowJson(workflow) {
  // Remove top-level read-only fields
  delete workflow.id;
  delete workflow.createdAt;
  delete workflow.updatedAt;
  delete workflow.versionId;
  delete workflow.active;
  delete workflow.tags;
  delete workflow.pinData;
  delete workflow.hash;
  delete workflow.staticData;
  delete workflow.meta;
  
  // Clean each node
  if (workflow.nodes) {
    workflow.nodes = workflow.nodes.map(node => {
      // Remove read-only node fields
      delete node.webhookId;
      delete node.id;
      
      return node;
    });
  }
  
  return workflow;
}

// Extract credentials from ~/.zshrc
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1];
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];
const CREDENTIAL_ID = zshrc.match(/export N8N_SUPABASE_CREDENTIAL_ID="([^"]+)"/)?.[1];

if (!N8N_URL || !N8N_API_KEY || !CREDENTIAL_ID) {
  console.error('❌ Missing required credentials in ~/.zshrc');
  process.exit(1);
}

console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                        ║');
console.log('║   🔄 AGGRESSIVE N8N WORKFLOW RESTORATION                              ║');
console.log('║                                                                        ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

console.log(`🎯 Target: ${N8N_URL}`);
console.log(`🔑 API Key: ${N8N_API_KEY.substring(0, 10)}...`);
console.log(`🔐 Supabase Credential: ${CREDENTIAL_ID}\n`);

// Find all workflow JSON files
const workflowsDir = path.join(process.cwd(), 'n8n-workflows');
const workflowFiles = findJsonFiles(workflowsDir).map(f => path.relative(process.cwd(), f));

console.log(`📦 Found ${workflowFiles.length} workflow files in git\n`);

// Get currently deployed workflows
const currentWorkflows = JSON.parse(
  execSync(`curl -s "${N8N_URL}/api/v1/workflows" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' })
);

console.log(`📋 Currently deployed: ${currentWorkflows.data.length} workflows\n`);

// Priority workflows (restore these first)
const priorityNames = [
  'Observation Lounge',
  'Captain Jean-Luc Picard',
  'Commander Data',
  'Commander William Riker',
  'Lieutenant Commander Geordi La Forge',
  'Lieutenant Worf',
  'Counselor Deanna Troi',
  'Dr. Beverly Crusher',
  'Lieutenant Uhura',
  'Quark',
  'Chief Miles OBrien',
  'Mission Control',
  'Democratic Collaboration'
];

// Sort files by priority
workflowFiles.sort((a, b) => {
  const aPriority = priorityNames.findIndex(name => a.toLowerCase().includes(name.toLowerCase()));
  const bPriority = priorityNames.findIndex(name => b.toLowerCase().includes(name.toLowerCase()));
  
  if (aPriority !== -1 && bPriority !== -1) return aPriority - bPriority;
  if (aPriority !== -1) return -1;
  if (bPriority !== -1) return 1;
  return 0;
});

console.log('🚀 Starting aggressive restoration...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let successCount = 0;
let skipCount = 0;
let failCount = 0;
const failedWorkflows = [];

workflowFiles.forEach((file, index) => {
  try {
    const workflowJson = JSON.parse(fs.readFileSync(file, 'utf8'));
    const workflowName = workflowJson.name || path.basename(file, '.json');
    
    console.log(`[${index + 1}/${workflowFiles.length}] 📦 ${workflowName}`);
    
    // Check if workflow already exists
    const exists = currentWorkflows.data.find(w => w.name === workflowName);
    if (exists) {
      console.log(`   ⏭️  Already exists, skipping\n`);
      skipCount++;
      return;
    }
    
    // Aggressive cleanup
    const cleanedWorkflow = cleanWorkflowJson(JSON.parse(JSON.stringify(workflowJson)));
    
    // Create workflow
    const createResponse = JSON.parse(
      execSync(
        `curl -s -X POST "${N8N_URL}/api/v1/workflows" ` +
        `-H "X-N8N-API-KEY: ${N8N_API_KEY}" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${JSON.stringify(cleanedWorkflow).replace(/'/g, "'\\''")}'`,
        { encoding: 'utf8' }
      )
    );
    
    if (!createResponse.id) {
      console.log(`   ❌ Failed: ${createResponse.message || 'Unknown error'}\n`);
      failCount++;
      failedWorkflows.push({ name: workflowName, error: createResponse.message });
      return;
    }
    
    console.log(`   ✅ Created (ID: ${createResponse.id})`);
    
    // Activate workflow
    execSync(
      `curl -s -X POST "${N8N_URL}/api/v1/workflows/${createResponse.id}/activate" ` +
      `-H "X-N8N-API-KEY: ${N8N_API_KEY}"`,
      { encoding: 'utf8' }
    );
    
    console.log(`   ✅ Activated\n`);
    successCount++;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
    failCount++;
    failedWorkflows.push({ name: path.basename(file), error: error.message });
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📊 RESTORATION SUMMARY:\n');
console.log(`   ✅ Successfully created: ${successCount}`);
console.log(`   ⏭️  Skipped (already exist): ${skipCount}`);
console.log(`   ❌ Failed: ${failCount}`);
console.log(`   📦 Total in git: ${workflowFiles.length}\n`);

if (failedWorkflows.length > 0 && failedWorkflows.length <= 10) {
  console.log('❌ Failed workflows:');
  failedWorkflows.forEach(({ name, error }) => {
    console.log(`   - ${name}: ${error}`);
  });
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n✅ RESTORATION COMPLETE!\n');

if (successCount > 0) {
  console.log('🎉 Success! Key workflows restored:');
  console.log('   • All crew members should be available');
  console.log('   • Observation Lounge should be functional');
  console.log('   • System workflows should be operational\n');
}

console.log('🎯 Next: Test the Observation Lounge and crew workflows!\n');

