#!/usr/bin/env node

/**
 * Create and Link Supabase Credential in n8n
 * Uses n8n API to create Supabase credential and link to workflow
 * 
 * Uses ~/.zshrc credentials: N8N_URL, N8N_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const fs = require('fs');
const path = require('path');

// Load environment from ~/.zshrc
function loadEnvFromZshrc() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL="([^"]+)"/);
  const n8nApiKeyMatch = zshrcContent.match(/export N8N_API_KEY="([^"]+)"/);
  const supabaseUrlMatch = zshrcContent.match(/export SUPABASE_URL="([^"]+)"/);
  const supabaseServiceKeyMatch = zshrcContent.match(/export SUPABASE_SERVICE_KEY="([^"]+)"/);
  
  if (!n8nUrlMatch || !n8nApiKeyMatch) {
    console.error('❌ Missing N8N_URL or N8N_API_KEY in ~/.zshrc');
    process.exit(1);
  }
  
  if (!supabaseUrlMatch || !supabaseServiceKeyMatch) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in ~/.zshrc');
    process.exit(1);
  }
  
  return {
    n8nUrl: n8nUrlMatch[1],
    n8nApiKey: n8nApiKeyMatch[1],
    supabaseUrl: supabaseUrlMatch[1],
    supabaseServiceKey: supabaseServiceKeyMatch[1]
  };
}

async function createSupabaseCredential(env) {
  console.log(`\n🔐 Creating Supabase credential in n8n...`);
  
  const credentialData = {
    name: 'Supabase Account (Auto-Created)',
    type: 'supabaseApi',
    data: {
      host: env.supabaseUrl,
      serviceRole: env.supabaseServiceKey
    }
  };
  
  try {
    const response = await fetch(`${env.n8nUrl}/api/v1/credentials`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentialData)
    });
    
    if (!response.ok) {
      const error = await response.text();
      
      // Check if credential already exists
      if (error.includes('already exists') || response.status === 409) {
        console.log(`   ℹ️  Credential already exists, fetching existing...`);
        return await findExistingCredential(env);
      }
      
      throw new Error(`Failed to create credential (${response.status}): ${error}`);
    }
    
    const credential = await response.json();
    console.log(`   ✅ Created credential ID: ${credential.id}`);
    
    return credential.id;
  } catch (error) {
    console.error(`   ❌ Failed to create credential:`, error.message);
    return null;
  }
}

async function findExistingCredential(env) {
  console.log(`\n🔍 Looking for existing Supabase credentials...`);
  
  try {
    const response = await fetch(`${env.n8nUrl}/api/v1/credentials`, {
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to list credentials (${response.status})`);
    }
    
    const credentials = await response.json();
    const supabaseCred = credentials.find(c => c.type === 'supabaseApi');
    
    if (supabaseCred) {
      console.log(`   ✅ Found existing credential ID: ${supabaseCred.id}`);
      return supabaseCred.id;
    }
    
    console.log(`   ⚠️  No Supabase credentials found`);
    return null;
  } catch (error) {
    console.error(`   ❌ Failed to find credentials:`, error.message);
    return null;
  }
}

async function linkCredentialToWorkflow(workflowId, credentialId, env) {
  console.log(`\n🔗 Linking credential to workflow...`);
  
  try {
    // Fetch workflow
    const getResponse = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}`, {
      headers: { 'X-N8N-API-KEY': env.n8nApiKey }
    });
    
    if (!getResponse.ok) {
      throw new Error(`Failed to fetch workflow (${getResponse.status})`);
    }
    
    const workflow = await getResponse.json();
    
    // Find Supabase node and update credential
    const supabaseNode = workflow.nodes.find(n => n.id === 'supabase-upsert');
    
    if (!supabaseNode) {
      console.log(`   ❌ Supabase node not found in workflow`);
      return false;
    }
    
    console.log(`   ✓ Found node: ${supabaseNode.name}`);
    
    // Update credential
    if (!supabaseNode.credentials) {
      supabaseNode.credentials = {};
    }
    
    supabaseNode.credentials.supabaseApi = {
      id: credentialId,
      name: 'Supabase Account (Auto-Created)'
    };
    
    console.log(`   ✓ Credential linked to node`);
    
    // Save workflow (clean payload)
    const cleanWorkflow = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
      staticData: workflow.staticData || null
    };
    
    const updateResponse = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}`, {
      method: 'PUT',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cleanWorkflow)
    });
    
    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update workflow (${updateResponse.status}): ${error}`);
    }
    
    console.log(`   ✅ Workflow updated with credential`);
    
    // Re-activate
    await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: { 'X-N8N-API-KEY': env.n8nApiKey }
    });
    
    console.log(`   ✅ Workflow re-activated`);
    
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to link credential:`, error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║     🔐 CREATE & LINK SUPABASE CREDENTIAL IN N8N                ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  // Load environment
  console.log('\n📋 Loading credentials from ~/.zshrc...');
  const env = loadEnvFromZshrc();
  console.log(`   ✓ N8N URL: ${env.n8nUrl}`);
  console.log(`   ✓ N8N API Key: ${env.n8nApiKey.substring(0, 20)}...`);
  console.log(`   ✓ Supabase URL: ${env.supabaseUrl}`);
  console.log(`   ✓ Supabase Service Key: ${env.supabaseServiceKey.substring(0, 20)}...`);
  
  // Get workflow ID from command line
  const workflowId = process.argv[2] || 'N6vrRsrIEWR7ZyTq';
  console.log(`\n🎯 Target workflow: ${workflowId}`);
  
  // Create or find credential
  let credentialId = await createSupabaseCredential(env);
  
  if (!credentialId) {
    credentialId = await findExistingCredential(env);
  }
  
  if (!credentialId) {
    console.log('\n❌ Could not create or find Supabase credential');
    console.log('\n📋 MANUAL STEP:');
    console.log(`   Visit: ${env.n8nUrl}/credentials`);
    console.log('   Create a new "Supabase" credential manually');
    process.exit(1);
  }
  
  // Save credential ID to ~/.zshrc
  console.log(`\n💾 Saving credential ID to ~/.zshrc...`);
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  let zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  if (zshrcContent.includes('N8N_SUPABASE_CREDENTIAL_ID')) {
    // Update existing
    zshrcContent = zshrcContent.replace(
      /export N8N_SUPABASE_CREDENTIAL_ID="[^"]*"/,
      `export N8N_SUPABASE_CREDENTIAL_ID="${credentialId}"`
    );
  } else {
    // Add new
    zshrcContent += `\nexport N8N_SUPABASE_CREDENTIAL_ID="${credentialId}"\n`;
  }
  
  fs.writeFileSync(zshrcPath, zshrcContent);
  console.log(`   ✅ Saved N8N_SUPABASE_CREDENTIAL_ID="${credentialId}"`);
  
  // Link credential to workflow
  const success = await linkCredentialToWorkflow(workflowId, credentialId, env);
  
  if (success) {
    console.log('\n' + '═'.repeat(66));
    console.log('✅ SUPABASE CREDENTIAL CREATED AND LINKED!');
    console.log('');
    console.log('🎯 NEXT STEP:');
    console.log('   Test the workflow:');
    console.log('   node scripts/store-crew-decision-in-rag.js \\');
    console.log('     crew-memories/active/ddd-user-settings-implementation-2025-11-02.json');
    console.log('');
  } else {
    console.log('\n❌ Failed to link credential to workflow');
    console.log('\n📋 MANUAL STEP:');
    console.log(`   Visit: ${env.n8nUrl}/workflow/${workflowId}`);
    console.log(`   Link credential ID: ${credentialId}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

