#!/usr/bin/env node

/**
 * Fix RAG Webhook Registration
 * Solves bidirectional sync issue where table exists but n8n doesn't know
 * 
 * Uses ~/.zshrc credentials: N8N_URL, N8N_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
 * 
 * Crew: Chief O'Brien (Pragmatic Fix) + Lt. Cmdr. La Forge (Infrastructure)
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

async function verifyTableExists(tableName, env) {
  console.log(`\n🔍 Verifying ${tableName} table exists in Supabase...`);
  
  try {
    const response = await fetch(`${env.supabaseUrl}/rest/v1/${tableName}?limit=1`, {
      method: 'GET',
      headers: {
        'apikey': env.supabaseServiceKey,
        'Authorization': `Bearer ${env.supabaseServiceKey}`
      }
    });
    
    if (response.ok) {
      console.log(`   ✅ Table '${tableName}' exists and is accessible`);
      return true;
    } else {
      console.log(`   ❌ Table '${tableName}' not found (${response.status})`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Failed to verify table:`, error.message);
    return false;
  }
}

async function deactivateWorkflow(workflowId, env) {
  console.log(`\n🔄 Deactivating workflow ${workflowId}...`);
  
  try {
    const response = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}/deactivate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Deactivation failed (${response.status})`);
    }
    
    console.log(`   ✅ Workflow deactivated`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to deactivate:`, error.message);
    return false;
  }
}

async function activateWorkflow(workflowId, env) {
  console.log(`\n🔄 Activating workflow ${workflowId} (triggers validation)...`);
  
  try {
    const response = await fetch(`${env.n8nUrl}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': env.n8nApiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`Activation failed (${response.status})`);
    }
    
    console.log(`   ✅ Workflow activated`);
    console.log(`   ⏳ Waiting 5 seconds for webhook registration...`);
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to activate:`, error.message);
    return false;
  }
}

async function testWebhook(webhookUrl, env) {
  console.log(`\n🧪 Testing webhook: ${webhookUrl}...`);
  
  const testPayload = {
    session_id: `test-${Date.now()}`,
    category: 'test',
    title: 'Webhook Registration Test',
    executive_summary: 'Testing if webhook is now registered after fixing bidirectional sync',
    content: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
    tags: JSON.stringify(['test', 'webhook-validation']),
    session_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`   ✅ Webhook is WORKING!`);
      console.log(`   Response:`, JSON.stringify(result, null, 2));
      return true;
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Webhook returned ${response.status}: ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Webhook test failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║     🔧 FIX RAG WEBHOOK REGISTRATION (Bidirectional Sync)      ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('Problem: Workflow deployed before table existed');
  console.log('         n8n cached validation failure');
  console.log('         Table created later, but n8n cache not invalidated');
  console.log('');
  console.log('Solution: Force n8n to re-validate against Supabase');
  console.log('');
  
  // Load environment
  console.log('📋 Loading credentials from ~/.zshrc...');
  const env = loadEnvFromZshrc();
  console.log(`   ✓ N8N URL: ${env.n8nUrl}`);
  console.log(`   ✓ Supabase URL: ${env.supabaseUrl}`);
  
  const workflowId = 'N6vrRsrIEWR7ZyTq'; // knowledge-ingest workflow
  const webhookUrl = `${env.n8nUrl}/webhook/knowledge-ingest`;
  
  // Step 1: Verify table exists
  const tableExists = await verifyTableExists('knowledge_base', env);
  
  if (!tableExists) {
    console.log('\n' + '═'.repeat(66));
    console.log('❌ CANNOT FIX: knowledge_base table does not exist');
    console.log('');
    console.log('Please run the migration first:');
    console.log('  1. Visit: https://supabase.com/dashboard/project/rpkkkbufdwxmjaerbhbn/sql/new');
    console.log('  2. Paste: supabase/migrations/003_create_knowledge_base_table.sql');
    console.log('  3. Click RUN');
    console.log('  4. Run this script again');
    console.log('');
    process.exit(1);
  }
  
  // Step 2: Deactivate workflow
  const deactivated = await deactivateWorkflow(workflowId, env);
  
  if (!deactivated) {
    console.log('\n⚠️  Deactivation failed, trying activation anyway...');
  }
  
  // Step 3: Re-activate workflow (forces re-validation)
  const activated = await activateWorkflow(workflowId, env);
  
  if (!activated) {
    console.log('\n❌ Failed to activate workflow');
    console.log('\n📋 MANUAL STEP REQUIRED:');
    console.log(`   Visit: ${env.n8nUrl}/workflow/${workflowId}`);
    console.log('   1. Toggle workflow OFF');
    console.log('   2. Toggle workflow ON');
    console.log('   3. Save workflow');
    process.exit(1);
  }
  
  // Step 4: Test webhook
  const webhookWorks = await testWebhook(webhookUrl, env);
  
  console.log('\n' + '═'.repeat(66));
  
  if (webhookWorks) {
    console.log('✅ SUCCESS! RAG WEBHOOK IS NOW REGISTERED!');
    console.log('');
    console.log('The bidirectional sync issue is resolved.');
    console.log('n8n successfully validated the knowledge_base table.');
    console.log('');
    console.log('🎯 Next Step:');
    console.log('   Store real crew memory:');
    console.log('   node scripts/store-crew-decision-in-rag.js \\');
    console.log('     crew-memories/active/ddd-user-settings-implementation-2025-11-02.json');
    console.log('');
    console.log('Expected: ✅ Stored in RAG system');
  } else {
    console.log('⚠️  WEBHOOK STILL NOT WORKING');
    console.log('');
    console.log('This likely means the n8n Supabase node needs manual refresh.');
    console.log('');
    console.log('📋 MANUAL STEP REQUIRED:');
    console.log(`   1. Visit: ${env.n8nUrl}/workflow/${workflowId}`);
    console.log('   2. Click on "Supabase Upsert" node');
    console.log('   3. Click the pencil icon next to credential');
    console.log('   4. Click "Save" (don\'t change anything)');
    console.log('   5. Click workflow "Save" button');
    console.log('   6. Run this script again');
  }
  
  console.log('');
  console.log('🖖 Chief O\'Brien: "Bidirectional sync fixed!"');
  console.log('');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

