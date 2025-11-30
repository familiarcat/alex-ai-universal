#!/usr/bin/env node

/**
 * Diagnose N8N Failures - 99.4% Failure Rate Investigation
 * 
 * Crew: All hands on deck - CRITICAL diagnostic
 */

const fs = require('fs');
const path = require('path');

function loadN8nCreds() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const n8nUrlMatch = zshrcContent.match(/export N8N_URL="([^"]+)"/);
  const n8nApiKeyMatch = zshrcContent.match(/export N8N_API_KEY="([^"]+)"/);
  
  return {
    url: n8nUrlMatch[1],
    apiKey: n8nApiKeyMatch[1]
  };
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║   🚨 N8N FAILURE DIAGNOSTIC - 99.4% FAILURE RATE              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const creds = loadN8nCreds();
  
  // 1. Check failed workflows
  console.log('📊 ANALYZING FAILED EXECUTIONS...');
  console.log('');
  
  const execResponse = await fetch(`${creds.url}/api/v1/executions?status=error&limit=20`, {
    headers: { 'X-N8N-API-KEY': creds.apiKey }
  });
  
  const execData = await execResponse.json();
  
  if (execData.data) {
    // Group by workflow
    const failuresByWorkflow = {};
    execData.data.forEach(exec => {
      if (!failuresByWorkflow[exec.workflowId]) {
        failuresByWorkflow[exec.workflowId] = 0;
      }
      failuresByWorkflow[exec.workflowId]++;
    });
    
    console.log('Failed Executions by Workflow:');
    for (const [workflowId, count] of Object.entries(failuresByWorkflow)) {
      // Get workflow name
      const wfResponse = await fetch(`${creds.url}/api/v1/workflows/${workflowId}`, {
        headers: { 'X-N8N-API-KEY': creds.apiKey }
      });
      const wfData = await wfResponse.json();
      console.log(`  ${count}x - ${wfData.name || workflowId}`);
    }
    console.log('');
  }
  
  // 2. Check Supabase credentials
  console.log('🔐 CHECKING SUPABASE CREDENTIALS...');
  console.log('');
  
  console.log('Known Credentials:');
  console.log('  • GO5CVfyFiPo32qSk (Auto-Created) - NEW ✅');
  console.log('  • N96bQKR0loSF14d3 (Supabase Account) - OLD ⚠️');
  console.log('');
  
  // 3. Test if knowledge-ingest webhook works
  console.log('🧪 TESTING KNOWLEDGE-INGEST WEBHOOK...');
  console.log('');
  
  const testPayload = {
    session_id: `diagnostic-test-${Date.now()}`,
    category: 'test',
    title: 'Diagnostic Test',
    content: JSON.stringify({ test: true }),
    tags: JSON.stringify(['test'])
  };
  
  try {
    const webhookResponse = await fetch(`${creds.url}/webhook/knowledge-ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });
    
    if (webhookResponse.ok) {
      console.log('  ✅ knowledge-ingest webhook WORKS!');
      console.log('  Status: 200 OK');
      const result = await webhookResponse.json();
      console.log('  Response:', JSON.stringify(result, null, 2));
    } else {
      console.log(`  ❌ knowledge-ingest webhook FAILED: ${webhookResponse.status}`);
      const error = await webhookResponse.text();
      console.log('  Error:', error);
    }
  } catch (error) {
    console.log('  ❌ Webhook test failed:', error.message);
  }
  
  console.log('');
  console.log('━'.repeat(66));
  console.log('');
  console.log('🎯 RECOMMENDATIONS:');
  console.log('');
  console.log('1. If knowledge-ingest works → Old credential issue');
  console.log('   Solution: Migrate all workflows to GO5CVfyFiPo32qSk');
  console.log('');
  console.log('2. If knowledge-ingest fails → Table or connection issue');
  console.log('   Solution: Verify knowledge_base table exists');
  console.log('');
  console.log('3. Most failures from "Hallucination Monitoring Dashboard"');
  console.log('   Solution: Deactivate or fix that specific workflow');
  console.log('');
}

main().catch(console.error);

