#!/usr/bin/env node

/**
 * 🔄 COMPLETE N8N WORKFLOW RESTORATION
 * 
 * Restores ALL workflows from git to n8n instance
 * 
 * Categories:
 * - 12 Crew Member workflows
 * - System workflows (Observation Lounge, Mission Control, etc.)
 * - RAG workflows (knowledge-ingest, query, update, etc.)
 * - DDD workflows (project CRUD)
 * - Anti-hallucination workflows
 * - Utility workflows
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
console.log('║   🔄 COMPLETE N8N WORKFLOW RESTORATION FROM GIT                       ║');
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
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Categorize workflows
const categories = {
  'Crew Members': [],
  'System (Observation Lounge, Mission Control)': [],
  'RAG (Knowledge Base)': [],
  'DDD Architecture': [],
  'Anti-Hallucination': [],
  'Utilities': [],
  'Other': []
};

workflowFiles.forEach(file => {
  if (file.includes('crew-workflows/crew-')) {
    categories['Crew Members'].push(file);
  } else if (file.includes('system-workflows/')) {
    categories['System (Observation Lounge, Mission Control)'].push(file);
  } else if (file.includes('rag-workflows/')) {
    categories['RAG (Knowledge Base)'].push(file);
  } else if (file.includes('ddd-architecture/') || file.includes('project-workflows/project-content')) {
    categories['DDD Architecture'].push(file);
  } else if (file.includes('anti-hallucination')) {
    categories['Anti-Hallucination'].push(file);
  } else if (file.includes('utility-workflows/')) {
    categories['Utilities'].push(file);
  } else {
    categories['Other'].push(file);
  }
});

// Display categories
Object.entries(categories).forEach(([category, files]) => {
  if (files.length > 0) {
    console.log(`📁 ${category}: ${files.length} workflows`);
  }
});

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Ask user which categories to restore
console.log('🤔 Restore ALL workflows? (This may take 5-10 minutes)');
console.log('   Press Enter to continue, or Ctrl+C to cancel\n');

// Give user 5 seconds to cancel
try {
  execSync('read -t 5 -p "Starting in 5 seconds... "', { stdio: 'inherit', shell: '/bin/bash' });
} catch (e) {
  // Timeout or Enter pressed
}

console.log('\n\n🚀 Starting restoration...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

let successCount = 0;
let skipCount = 0;
let failCount = 0;

workflowFiles.forEach((file, index) => {
  try {
    const workflowJson = JSON.parse(fs.readFileSync(file, 'utf8'));
    const workflowName = workflowJson.name || path.basename(file, '.json');
    
    console.log(`[${index + 1}/${workflowFiles.length}] 📦 ${workflowName}`);
    
    // Check if workflow already exists
    const exists = currentWorkflows.data.find(w => w.name === workflowName);
    if (exists) {
      console.log(`   ⏭️  Already exists (ID: ${exists.id}), skipping\n`);
      skipCount++;
      return;
    }
    
    // Remove read-only fields
    delete workflowJson.id;
    delete workflowJson.createdAt;
    delete workflowJson.updatedAt;
    delete workflowJson.versionId;
    delete workflowJson.active;
    delete workflowJson.tags;
    
    // Create workflow
    const createResponse = JSON.parse(
      execSync(
        `curl -s -X POST "${N8N_URL}/api/v1/workflows" ` +
        `-H "X-N8N-API-KEY: ${N8N_API_KEY}" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${JSON.stringify(workflowJson).replace(/'/g, "'\\''")}'`,
        { encoding: 'utf8' }
      )
    );
    
    if (!createResponse.id) {
      console.log(`   ❌ Failed: ${createResponse.message || 'Unknown error'}\n`);
      failCount++;
      return;
    }
    
    console.log(`   ✅ Created (ID: ${createResponse.id})`);
    
    // Configure Supabase nodes if present
    const currentWorkflow = JSON.parse(
      execSync(`curl -s "${N8N_URL}/api/v1/workflows/${createResponse.id}" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' })
    );
    
    let hasSupabaseNode = false;
    currentWorkflow.nodes.forEach(node => {
      if (node.type === 'n8n-nodes-base.supabase') {
        hasSupabaseNode = true;
        node.credentials = {
          supabaseApi: {
            id: CREDENTIAL_ID,
            name: 'Supabase (Universal)'
          }
        };
        // Try to auto-detect table name from workflow
        if (!node.parameters) node.parameters = {};
        if (!node.parameters.table) {
          if (file.includes('knowledge')) node.parameters.table = 'knowledge_base';
          else if (file.includes('settings')) node.parameters.table = 'user_settings';
          else if (file.includes('project')) node.parameters.table = 'projects';
        }
      }
    });
    
    if (hasSupabaseNode) {
      const updatePayload = {
        name: currentWorkflow.name,
        nodes: currentWorkflow.nodes,
        connections: currentWorkflow.connections,
        settings: currentWorkflow.settings,
        staticData: currentWorkflow.staticData
      };
      
      execSync(
        `curl -s -X PUT "${N8N_URL}/api/v1/workflows/${createResponse.id}" ` +
        `-H "X-N8N-API-KEY: ${N8N_API_KEY}" ` +
        `-H "Content-Type: application/json" ` +
        `-d '${JSON.stringify(updatePayload).replace(/'/g, "'\\''")}'`,
        { encoding: 'utf8' }
      );
      
      console.log(`   ✅ Configured Supabase nodes`);
    }
    
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
console.log(`   ⏭️  Skipped (already exist): ${skipCount}`);
console.log(`   ❌ Failed: ${failCount}`);
console.log(`   📦 Total in git: ${workflowFiles.length}\n`);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n✅ RESTORATION COMPLETE!\n');
console.log('🎯 Next steps:');
console.log('   1. Verify workflows in n8n UI');
console.log('   2. Test Observation Lounge workflow');
console.log('   3. Test crew member workflows');
console.log('   4. Fix WEBHOOK_URL in Docker (still null)\n');

