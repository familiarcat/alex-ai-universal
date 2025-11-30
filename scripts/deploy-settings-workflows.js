#!/usr/bin/env node

/**
 * Deploy User Settings Workflows to n8n
 * Automates deployment of settings-store and settings-retrieve workflows
 * 
 * Reuses patterns from deploy-ddd-workflows.js (O'Brien's efficiency)
 */

const fs = require('fs');
const path = require('path');

// Load environment from ~/.zshrc
function loadEnvFromZshrc() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL="([^"]+)"/);
  const n8nApiKeyMatch = zshrcContent.match(/export N8N_API_KEY="([^"]+)"/);
  const supabaseCredIdMatch = zshrcContent.match(/export N8N_SUPABASE_CREDENTIAL_ID="([^"]+)"/);
  
  if (!n8nUrlMatch || !n8nApiKeyMatch) {
    console.error('❌ Missing N8N_URL or N8N_API_KEY in ~/.zshrc');
    process.exit(1);
  }
  
  return {
    n8nUrl: n8nUrlMatch[1],
    n8nApiKey: n8nApiKeyMatch[1],
    supabaseCredId: supabaseCredIdMatch ? supabaseCredIdMatch[1] : null
  };
}

async function deployWorkflow(workflowPath, env) {
  const workflowName = path.basename(workflowPath, '.json');
  console.log(`\n📦 Deploying ${workflowName}...`);
  
  // Read workflow JSON
  let workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  
  // Replace credential ID placeholder if available
  if (env.supabaseCredId) {
    const workflowStr = JSON.stringify(workflowData);
    const updatedStr = workflowStr.replace(/SUPABASE_CREDENTIAL_ID/g, env.supabaseCredId);
    workflowData = JSON.parse(updatedStr);
    console.log(`   ✓ Linked Supabase credential: ${env.supabaseCredId}`);
  }
  
  // Remove read-only fields
  delete workflowData.active;
  delete workflowData.tags;
  
  // Import workflow
  try {
    const importResponse = await fetch(`${env.n8nUrl}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(workflowData)
    });
    
    if (!importResponse.ok) {
      const error = await importResponse.text();
      throw new Error(`Import failed (${importResponse.status}): ${error}`);
    }
    
    const workflow = await importResponse.json();
    console.log(`   ✓ Imported workflow ID: ${workflow.id}`);
    
    // Activate workflow
    const activateResponse = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflow.id}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey
      }
    });
    
    if (!activateResponse.ok) {
      throw new Error(`Activation failed (${activateResponse.status})`);
    }
    
    console.log(`   ✓ Activated workflow`);
    
    // Get webhook URL
    const detailResponse = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflow.id}`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey
      }
    });
    
    const details = await detailResponse.json();
    const webhookNode = details.nodes?.find(n => n.type === 'n8n-nodes-base.webhook');
    
    if (webhookNode) {
      const webhookPath = webhookNode.parameters.path;
      console.log(`   ✓ Webhook URL: ${env.n8nUrl}/webhook/${webhookPath}`);
    }
    
    return workflow.id;
  } catch (error) {
    console.error(`   ❌ Failed to deploy ${workflowName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║     🚀 DEPLOYING USER SETTINGS WORKFLOWS TO N8N                ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  // Load environment
  console.log('\n📋 Loading environment from ~/.zshrc...');
  const env = loadEnvFromZshrc();
  console.log(`   ✓ N8N URL: ${env.n8nUrl}`);
  console.log(`   ✓ API Key: ${env.n8nApiKey.substring(0, 10)}...`);
  if (env.supabaseCredId) {
    console.log(`   ✓ Supabase Credential ID: ${env.supabaseCredId}`);
  } else {
    console.log(`   ⚠ No Supabase Credential ID found - workflows may need manual linking`);
  }
  
  // Deploy workflows
  const workflowsDir = path.join(__dirname, '..', 'n8n-workflows', 'settings-workflows');
  const workflows = [
    path.join(workflowsDir, 'settings-store.json'),
    path.join(workflowsDir, 'settings-retrieve.json')
  ];
  
  const deployedIds = [];
  
  for (const workflowPath of workflows) {
    const id = await deployWorkflow(workflowPath, env);
    if (id) {
      deployedIds.push(id);
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(66));
  console.log(`✅ Deployed ${deployedIds.length}/${workflows.length} workflows`);
  
  if (deployedIds.length > 0) {
    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Run Supabase migration: scripts/open-supabase-sql-editor.sh');
    console.log('   2. Paste contents of: supabase/migrations/002_create_user_settings_table.sql');
    console.log('   3. Update state-manager.tsx to use n8n workflows');
    console.log('   4. Test settings sync');
  }
  
  console.log('\n🖖 Settings workflows deployed successfully!\n');
}

main().catch(error => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
});

