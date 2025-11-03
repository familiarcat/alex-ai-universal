#!/usr/bin/env node

/**
 * 🔄 WHITELIST-BASED N8N WORKFLOW RESTORATION
 * 
 * Only keeps fields that n8n API explicitly allows
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

// Whitelist-based cleanup - ONLY keep allowed fields
function cleanWorkflowForCreate(workflow) {
  const cleaned = {
    name: workflow.name,
    nodes: workflow.nodes.map(node => ({
      name: node.name,
      parameters: node.parameters || {},
      position: node.position || [0, 0],
      type: node.type,
      typeVersion: node.typeVersion || 1
    })),
    connections: workflow.connections || {},
    settings: workflow.settings || {},
  };
  
  return cleaned;
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
console.log('║   🔄 WHITELIST-BASED N8N WORKFLOW RESTORATION                         ║');
console.log('║                                                                        ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

console.log(`🎯 Target: ${N8N_URL}`);
console.log(`🔑 API Key: ${N8N_API_KEY.substring(0, 10)}...\n`);

// Find crew and system workflows (priority)
const workflowsDir = path.join(process.cwd(), 'n8n-workflows');
const allFiles = findJsonFiles(workflowsDir).map(f => path.relative(process.cwd(), f));

const crewFiles = allFiles.filter(f => f.includes('crew-workflows/'));
const systemFiles = allFiles.filter(f => f.includes('system-workflows/'));

console.log(`📦 Found ${crewFiles.length} crew workflows`);
console.log(`📦 Found ${systemFiles.length} system workflows\n`);

const priorityFiles = [...systemFiles, ...crewFiles];

console.log(`🚀 Restoring ${priorityFiles.length} priority workflows...\n`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let successCount = 0;
let skipCount = 0;
let failCount = 0;

priorityFiles.forEach((file, index) => {
  try {
    const workflowJson = JSON.parse(fs.readFileSync(file, 'utf8'));
    const workflowName = workflowJson.name || path.basename(file, '.json');
    
    console.log(`[${index + 1}/${priorityFiles.length}] 📦 ${workflowName}`);
    
    // Whitelist cleanup
    const cleanedWorkflow = cleanWorkflowForCreate(workflowJson);
    
    // Create workflow
    const createResponse = JSON.parse(
      execSync(
        `curl -s -X POST "${N8N_URL}/api/v1/workflows" ` +
        `-H "X-N8N-API-KEY: ${N8N_API_KEY}" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${JSON.stringify(cleanedWorkflow).replace(/'/g, "'\\''")}'`,
        { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
      )
    );
    
    if (!createResponse.id) {
      console.log(`   ❌ Failed: ${createResponse.message || JSON.stringify(createResponse).substring(0, 100)}\n`);
      failCount++;
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
  }
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📊 RESTORATION SUMMARY:\n');
console.log(`   ✅ Successfully created: ${successCount}`);
console.log(`   ❌ Failed: ${failCount}\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (successCount > 0) {
  console.log('\n✅ Success! Crew and system workflows restored!');
  console.log('   • Test Observation Lounge');
  console.log('   • Test crew member endpoints\n');
}

EOF

