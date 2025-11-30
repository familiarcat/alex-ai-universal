#!/usr/bin/env node

/**
 * Deploy and Activate Knowledge Ingest Workflow
 * Automates deployment of knowledge-ingest workflow to n8n using API
 * 
 * Uses credentials from ~/.zshrc
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
  console.log(`\n📦 Deploying knowledge-ingest workflow...`);
  
  // Read workflow JSON
  let workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  
  // Replace credential ID placeholder if available
  if (env.supabaseCredId) {
    const workflowStr = JSON.stringify(workflowData);
    const updatedStr = workflowStr.replace(/SUPABASE_CREDENTIAL_ID/g, env.supabaseCredId);
    workflowData = JSON.parse(updatedStr);
    console.log(`   ✓ Linked Supabase credential: ${env.supabaseCredId}`);
  } else {
    console.log(`   ⚠ No Supabase credential ID - will need manual linking`);
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
    console.log(`\n🔄 Activating workflow...`);
    const activateResponse = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflow.id}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey
      }
    });
    
    if (!activateResponse.ok) {
      throw new Error(`Activation failed (${activateResponse.status})`);
    }
    
    console.log(`   ✓ Workflow activated`);
    
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
      const webhookUrl = `${env.n8nUrl}/webhook/${webhookPath}`;
      console.log(`   ✓ Webhook URL: ${webhookUrl}`);
      
      // Test webhook
      console.log(`\n🧪 Testing webhook...`);
      const testResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: 'test-' + Date.now(),
          category: 'test',
          title: 'Test Knowledge Ingest',
          content: JSON.stringify({ test: true })
        })
      });
      
      if (testResponse.ok) {
        const testResult = await testResponse.json();
        console.log(`   ✅ Webhook test successful!`);
        console.log(`   Response:`, JSON.stringify(testResult, null, 2));
      } else {
        const errorText = await testResponse.text();
        console.log(`   ⚠ Webhook test returned ${testResponse.status}: ${errorText}`);
        console.log(`   Note: May need to configure Supabase table in n8n UI`);
      }
    }
    
    return workflow.id;
  } catch (error) {
    console.error(`   ❌ Deployment failed:`, error.message);
    return null;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║     🚀 DEPLOY & ACTIVATE KNOWLEDGE INGEST WORKFLOW             ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  // Load environment
  console.log('\n📋 Loading environment from ~/.zshrc...');
  const env = loadEnvFromZshrc();
  console.log(`   ✓ N8N URL: ${env.n8nUrl}`);
  console.log(`   ✓ API Key: ${env.n8nApiKey.substring(0, 10)}...`);
  if (env.supabaseCredId) {
    console.log(`   ✓ Supabase Credential ID: ${env.supabaseCredId}`);
  }
  
  // Deploy workflow
  const workflowPath = path.join(__dirname, '..', 'n8n-workflows', 'rag-workflows', 'knowledge-ingest.json');
  const workflowId = await deployWorkflow(workflowPath, env);
  
  if (workflowId) {
    console.log('\n' + '═'.repeat(66));
    console.log('✅ KNOWLEDGE INGEST WORKFLOW DEPLOYED AND ACTIVE!');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('   1. Verify Supabase table "knowledge_base" exists');
    console.log('   2. Configure Supabase node in n8n (if needed):');
    console.log(`      - Visit: ${env.n8nUrl}/workflow/${workflowId}`);
    console.log('      - Set "Table" to: knowledge_base');
    console.log('      - Save workflow');
    console.log('   3. Test crew memory ingestion:');
    console.log('      node scripts/store-crew-decision-in-rag.js \\');
    console.log('        crew-memories/active/ddd-user-settings-implementation-2025-11-02.json');
    console.log('');
    console.log('🖖 Workflow ready for crew memory storage!\n');
  } else {
    console.log('\n❌ Deployment failed. Check errors above.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

