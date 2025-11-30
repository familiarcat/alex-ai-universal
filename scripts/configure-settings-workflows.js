#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Load environment
function loadEnv() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL="([^"]+)"/);
  const n8nApiKeyMatch = zshrcContent.match(/export N8N_API_KEY="([^"]+)"/);
  
  return {
    n8nUrl: n8nUrlMatch[1],
    n8nApiKey: n8nApiKeyMatch[1]
  };
}

async function configureWorkflow(workflowId, tableName, nodeId, env) {
  console.log(`\n📝 Configuring workflow ${workflowId} for table: ${tableName}...`);
  
  // Fetch workflow
  const response = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}`, {
    headers: { 'X-N8N-API-KEY': env.n8nApiKey }
  });
  
  const workflow = await response.json();
  
  // Find Supabase node
  const supabaseNode = workflow.nodes.find(n => n.id === nodeId);
  if (!supabaseNode) {
    console.log(`   ❌ Node ${nodeId} not found`);
    return false;
  }
  
  console.log(`   ✓ Found node: ${supabaseNode.name}`);
  
  // Update table parameter
  if (!supabaseNode.parameters) supabaseNode.parameters = {};
  supabaseNode.parameters.table = tableName;
  
  // Save workflow
  const updateResponse = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': env.n8nApiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(workflow)
  });
  
  if (!updateResponse.ok) {
    console.log(`   ❌ Failed to update workflow`);
    return false;
  }
  
  console.log(`   ✓ Table set to: ${tableName}`);
  
  // Re-activate
  await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': env.n8nApiKey }
  });
  
  console.log(`   ✅ Workflow configured and activated`);
  return true;
}

async function main() {
  const env = loadEnv();
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🔧 CONFIGURE SETTINGS WORKFLOWS FOR SUPABASE              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  // Configure settings-store
  await configureWorkflow('xN7Lh0QbqJIukrha', 'user_settings', 'supabase-upsert', env);
  
  // Configure settings-retrieve
  await configureWorkflow('yPZwYv1VGm5pkTgE', 'user_settings', 'supabase-select', env);
  
  console.log('\n✅ Settings workflows configured!\n');
}

main().catch(console.error);
