#!/usr/bin/env node

/**
 * Configure Knowledge Ingest Workflow Supabase Node
 * Automates setting the "Table" parameter to "knowledge_base"
 */

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

async function configureWorkflow(workflowId, env) {
  console.log(`\n📝 Configuring workflow ${workflowId}...`);
  
  // Fetch workflow
  const response = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}`, {
    headers: { 'X-N8N-API-KEY': env.n8nApiKey }
  });
  
  const workflow = await response.json();
  
  // Find Supabase node
  const supabaseNode = workflow.nodes.find(n => n.id === 'supabase-upsert');
  if (!supabaseNode) {
    console.log(`   ❌ Supabase node not found`);
    return false;
  }
  
  console.log(`   ✓ Found node: ${supabaseNode.name}`);
  
  // Update table parameter
  if (!supabaseNode.parameters) supabaseNode.parameters = {};
  supabaseNode.parameters.table = 'knowledge_base';
  
  console.log(`   ✓ Set table to: knowledge_base`);
  
  // Create clean workflow object with only required fields
  const cleanWorkflow = {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings || {},
    staticData: workflow.staticData || null
  };
  
  // Save workflow
  const updateResponse = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}`, {
    method: 'PUT',
    headers: {
      'X-N8N-API-KEY': env.n8nApiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(cleanWorkflow)
  });
  
  if (!updateResponse.ok) {
    const errorText = await updateResponse.text();
    console.log(`   ❌ Failed to update workflow: ${errorText}`);
    return false;
  }
  
  console.log(`   ✓ Workflow updated`);
  
  // Re-activate
  await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {
    method: 'POST',
    headers: { 'X-N8N-API-KEY': env.n8nApiKey }
  });
  
  console.log(`   ✅ Workflow configured and activated`);
  
  return true;
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🔧 CONFIGURE KNOWLEDGE INGEST WORKFLOW                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  const env = loadEnv();
  
  // Get workflow ID from command line or find it
  const workflowId = process.argv[2];
  
  if (!workflowId) {
    console.log('\n❌ Usage: node configure-knowledge-ingest-workflow.js <workflow-id>');
    console.log('\nExample:');
    console.log('  node configure-knowledge-ingest-workflow.js N6vrRsrIEWR7ZyTq');
    process.exit(1);
  }
  
  const success = await configureWorkflow(workflowId, env);
  
  if (success) {
    console.log('\n✅ Knowledge ingest workflow configured!\n');
    console.log('🧪 Test with:');
    console.log('  node scripts/store-crew-decision-in-rag.js \\');
    console.log('    crew-memories/active/ddd-user-settings-implementation-2025-11-02.json\n');
  } else {
    console.log('\n❌ Configuration failed\n');
    process.exit(1);
  }
}

main().catch(console.error);

