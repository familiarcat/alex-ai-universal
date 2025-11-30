#!/usr/bin/env node

/**
 * 🔄 RECREATE N8N WORKFLOWS FOR FRESH VALIDATION
 * 
 * Problem: n8n caches validation failures permanently
 * Solution: Delete and recreate workflows to force fresh validation
 * 
 * This script:
 * 1. Exports all workflows via API (backup to /tmp)
 * 2. Deletes workflows with cached validation issues
 * 3. Recreates from git JSON files
 * 4. Verifies webhooks register automatically
 * 
 * Risk: Workflow IDs change, execution history lost
 * Mitigation: All workflows in git, deterministic recreation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Extract credentials from ~/.zshrc
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1];
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];
const N8N_SUPABASE_CREDENTIAL_ID = zshrc.match(/export N8N_SUPABASE_CREDENTIAL_ID="([^"]+)"/)?.[1];

if (!N8N_URL || !N8N_API_KEY) {
  console.error('❌ Missing N8N_URL or N8N_API_KEY in ~/.zshrc');
  process.exit(1);
}

console.log(`\n🔄 WORKFLOW RECREATION SCRIPT`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`🎯 Target: ${N8N_URL}`);
console.log(`🔑 API Key: ${N8N_API_KEY.substring(0, 10)}...`);
console.log(`🔐 Supabase Credential: ${N8N_SUPABASE_CREDENTIAL_ID}\n`);

// Workflows to recreate (those with cached validation issues)
const WORKFLOWS_TO_RECREATE = [
  {
    name: 'knowledge-ingest',
    jsonFile: 'n8n-workflows/rag-workflows/knowledge-ingest.json',
    table: 'knowledge_base',
    id: null // Will be set after discovery
  },
  {
    name: 'settings-store',
    jsonFile: 'n8n-workflows/settings-workflows/settings-store.json',
    table: 'user_settings',
    id: null
  },
  {
    name: 'settings-retrieve',
    jsonFile: 'n8n-workflows/settings-workflows/settings-retrieve.json',
    table: 'user_settings',
    id: null
  },
  {
    name: 'project-content-store',
    jsonFile: 'n8n-workflows/project-workflows/project-content-store.json',
    table: 'projects',
    id: null
  },
  {
    name: 'project-content-delete',
    jsonFile: 'n8n-workflows/project-workflows/project-content-delete.json',
    table: 'projects',
    id: null
  }
];

// Step 1: Discover workflow IDs
console.log(`📋 STEP 1: Discovering workflow IDs...\n`);

const allWorkflows = JSON.parse(execSync(`curl -s "${N8N_URL}/api/v1/workflows" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' }));

WORKFLOWS_TO_RECREATE.forEach(workflow => {
  const found = allWorkflows.data.find(w => w.name === workflow.name);
  if (found) {
    workflow.id = found.id;
    console.log(`  ✅ Found: ${workflow.name} (ID: ${workflow.id})`);
  } else {
    console.log(`  ⚠️  NOT FOUND: ${workflow.name} (will create from scratch)`);
  }
});

console.log(`\n`);

// Step 2: Export workflows (backup to /tmp)
console.log(`💾 STEP 2: Backing up workflows to /tmp...\n`);

WORKFLOWS_TO_RECREATE.forEach(workflow => {
  if (workflow.id) {
    try {
      const workflowData = execSync(`curl -s "${N8N_URL}/api/v1/workflows/${workflow.id}" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' });
      const backupPath = `/tmp/n8n-backup-${workflow.name}-${Date.now()}.json`;
      fs.writeFileSync(backupPath, workflowData);
      console.log(`  ✅ Backed up: ${workflow.name} -> ${backupPath}`);
    } catch (error) {
      console.error(`  ❌ Failed to backup ${workflow.name}: ${error.message}`);
    }
  }
});

console.log(`\n`);

// Step 3: Delete workflows
console.log(`🗑️  STEP 3: Deleting workflows...\n`);

WORKFLOWS_TO_RECREATE.forEach(workflow => {
  if (workflow.id) {
    try {
      execSync(`curl -s -X DELETE "${N8N_URL}/api/v1/workflows/${workflow.id}" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' });
      console.log(`  ✅ Deleted: ${workflow.name} (ID: ${workflow.id})`);
    } catch (error) {
      console.error(`  ❌ Failed to delete ${workflow.name}: ${error.message}`);
    }
  }
});

console.log(`\n⏳ Waiting 3 seconds for n8n to process deletions...\n`);
execSync('sleep 3');

// Step 4: Recreate workflows from git JSON files
console.log(`🔨 STEP 4: Recreating workflows from git...\n`);

WORKFLOWS_TO_RECREATE.forEach(workflow => {
  try {
    // Read workflow JSON from git
    const workflowJson = JSON.parse(fs.readFileSync(workflow.jsonFile, 'utf8'));
    
    // Remove read-only fields
    delete workflowJson.id;
    delete workflowJson.createdAt;
    delete workflowJson.updatedAt;
    delete workflowJson.versionId;
    delete workflowJson.active; // Will activate separately
    delete workflowJson.tags;
    
    // Create workflow via API
    const createResponse = execSync(`curl -s -X POST "${N8N_URL}/api/v1/workflows" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(workflowJson).replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
    
    const created = JSON.parse(createResponse);
    workflow.newId = created.id;
    
    console.log(`  ✅ Created: ${workflow.name} (NEW ID: ${workflow.newId})`);
    
  } catch (error) {
    console.error(`  ❌ Failed to create ${workflow.name}: ${error.message}`);
  }
});

console.log(`\n⏳ Waiting 2 seconds for n8n to process creations...\n`);
execSync('sleep 2');

// Step 5: Configure Supabase nodes
console.log(`🔧 STEP 5: Configuring Supabase nodes...\n`);

WORKFLOWS_TO_RECREATE.forEach(workflow => {
  if (!workflow.newId) {
    console.log(`  ⏭️  Skipping ${workflow.name} (not created)`);
    return;
  }
  
  try {
    // Fetch current workflow
    const currentWorkflow = JSON.parse(execSync(`curl -s "${N8N_URL}/api/v1/workflows/${workflow.newId}" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' }));
    
    // Update Supabase node parameters
    currentWorkflow.nodes.forEach(node => {
      if (node.type === 'n8n-nodes-base.supabase') {
        node.credentials = {
          supabaseApi: {
            id: N8N_SUPABASE_CREDENTIAL_ID,
            name: 'Supabase (Universal)'
          }
        };
        
        // Set table parameter
        if (node.parameters && !node.parameters.table) {
          node.parameters.table = workflow.table;
        }
      }
    });
    
    // Create clean update payload (only mutable fields)
    const updatePayload = {
      name: currentWorkflow.name,
      nodes: currentWorkflow.nodes,
      connections: currentWorkflow.connections,
      settings: currentWorkflow.settings,
      staticData: currentWorkflow.staticData
    };
    
    // Update workflow
    execSync(`curl -s -X PUT "${N8N_URL}/api/v1/workflows/${workflow.newId}" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}" \
      -H "Content-Type: application/json" \
      -d '${JSON.stringify(updatePayload).replace(/'/g, "'\\''")}'`, { encoding: 'utf8' });
    
    console.log(`  ✅ Configured: ${workflow.name} (Table: ${workflow.table}, Credential: ${N8N_SUPABASE_CREDENTIAL_ID})`);
    
  } catch (error) {
    console.error(`  ❌ Failed to configure ${workflow.name}: ${error.message}`);
  }
});

console.log(`\n⏳ Waiting 2 seconds for n8n to validate configurations...\n`);
execSync('sleep 2');

// Step 6: Activate workflows
console.log(`🚀 STEP 6: Activating workflows...\n`);

WORKFLOWS_TO_RECREATE.forEach(workflow => {
  if (!workflow.newId) {
    console.log(`  ⏭️  Skipping ${workflow.name} (not created)`);
    return;
  }
  
  try {
    execSync(`curl -s -X POST "${N8N_URL}/api/v1/workflows/${workflow.newId}/activate" \
      -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' });
    
    console.log(`  ✅ Activated: ${workflow.name}`);
    
  } catch (error) {
    console.error(`  ❌ Failed to activate ${workflow.name}: ${error.message}`);
  }
});

console.log(`\n⏳ Waiting 3 seconds for webhooks to register...\n`);
execSync('sleep 3');

// Step 7: Verify webhooks
console.log(`🔍 STEP 7: Verifying webhook registration...\n`);

WORKFLOWS_TO_RECREATE.forEach(workflow => {
  if (!workflow.newId) {
    console.log(`  ⏭️  Skipping ${workflow.name} (not created)`);
    return;
  }
  
  try {
    const verifyWorkflow = JSON.parse(execSync(`curl -s "${N8N_URL}/api/v1/workflows/${workflow.newId}" -H "X-N8N-API-KEY: ${N8N_API_KEY}"`, { encoding: 'utf8' }));
    
    const webhookNode = verifyWorkflow.nodes.find(n => n.type === 'n8n-nodes-base.webhook');
    
    if (webhookNode && webhookNode.webhookId) {
      console.log(`  ✅ WEBHOOK REGISTERED: ${workflow.name}`);
      console.log(`     ID: ${webhookNode.webhookId}`);
      console.log(`     Path: ${webhookNode.parameters?.path || 'unknown'}`);
    } else if (webhookNode) {
      console.log(`  ❌ NO WEBHOOK ID: ${workflow.name} (validation may have failed)`);
    } else {
      console.log(`  ℹ️  NO WEBHOOK NODE: ${workflow.name}`);
    }
    
  } catch (error) {
    console.error(`  ❌ Failed to verify ${workflow.name}: ${error.message}`);
  }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`✅ WORKFLOW RECREATION COMPLETE!\n`);
console.log(`📊 Summary:`);
console.log(`   - Workflows backed up to /tmp/`);
console.log(`   - Old workflows deleted`);
console.log(`   - New workflows created from git`);
console.log(`   - Supabase credentials configured`);
console.log(`   - Workflows activated`);
console.log(`   - Webhook registration verified`);
console.log(`\n🎯 Next: Test webhooks with curl commands\n`);

