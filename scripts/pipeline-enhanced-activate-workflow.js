#!/usr/bin/env node

/**
 * Enhanced workflow activation that finds and activates Knowledge Ingest
 * Uses the workflow list to get correct ID and attempts multiple activation methods
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function loadCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const n8nUrlMatch = zshrcContent.match(/export\s+N8N_URL=['"]([^'"]+)['"]/);
  const n8nOwnerKeyMatch = zshrcContent.match(/export\s+N8N_OWNER_API_KEY=['"]([^'"]+)['"]/);
  const n8nApiKeyMatch = zshrcContent.match(/export\s+N8N_API_KEY=['"]([^'"]+)['"]/);
  
  return {
    n8nUrl: n8nUrlMatch ? n8nUrlMatch[1] : 'https://n8n.pbradygeorgen.com',
    n8nApiKey: n8nOwnerKeyMatch ? n8nOwnerKeyMatch[1] : (n8nApiKeyMatch ? n8nApiKeyMatch[1] : null)
  };
}

function findKnowledgeIngestWorkflow() {
  const workflowsPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'all-n8n-workflows.json');
  if (!fs.existsSync(workflowsPath)) {
    return null;
  }
  
  const workflows = JSON.parse(fs.readFileSync(workflowsPath, 'utf8'));
  
  // First try exact match
  let workflow = workflows.find(w => 
    w.name && w.name.toLowerCase().includes('knowledge ingest') &&
    w.name.toLowerCase().includes('rag')
  );
  
  // Then try webhook path match
  if (!workflow) {
    workflow = workflows.find(w => 
      w.nodes?.some(n => 
        n.type === 'n8n-nodes-base.webhook' &&
        (n.parameters?.path === 'knowledge-ingest' || 
         n.parameters?.options?.path === 'knowledge-ingest')
      )
    );
  }
  
  // Fallback: any with knowledge-ingest in name
  if (!workflow) {
    workflow = workflows.find(w => 
      w.name && w.name.toLowerCase().includes('knowledge')
    );
  }
  
  return workflow;
}

function makeRequest(url, method, data, headers) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname,
      method: method,
      headers: headers || {},
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function activateWorkflowEnhanced(workflowId, credentials) {
  console.log(`   Using proven deactivate/activate pattern...\n`);
  
  // Proven method: Deactivate then activate (from universal-webhook-manager.js)
  try {
    console.log('   Step 1: Deactivating workflow...');
    const deactivateResult = await makeRequest(
      `${credentials.n8nUrl}/api/v1/workflows/${workflowId}/deactivate`,
      'POST',
      null,
      { 'X-N8N-API-KEY': credentials.n8nApiKey }
    );
    
    if (deactivateResult.statusCode === 200 || deactivateResult.statusCode === 204) {
      console.log('   ✅ Deactivated');
    } else {
      console.log(`   ⚠️  Deactivate returned ${deactivateResult.statusCode}`);
    }
    
    // Wait for deactivation to process
    console.log('   ⏳ Waiting 1.5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('   Step 2: Activating workflow...');
    const activateResult = await makeRequest(
      `${credentials.n8nUrl}/api/v1/workflows/${workflowId}/activate`,
      'POST',
      null,
      { 'X-N8N-API-KEY': credentials.n8nApiKey }
    );
    
    if (activateResult.statusCode === 200 || activateResult.statusCode === 204) {
      console.log('   ✅ Activated');
      return true;
    } else {
      console.log(`   ⚠️  Activate returned ${activateResult.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

async function verifyWebhook(credentials, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await makeRequest(
        `${credentials.n8nUrl}/webhook/knowledge-ingest`,
        'POST',
        JSON.stringify({ test: 'connectivity' }),
        { 'Content-Type': 'application/json' }
      );
      
      if (result.statusCode !== 404) {
        return { success: true, statusCode: result.statusCode };
      }
      
      if (i < retries - 1) {
        console.log(`   ⏳ Retry ${i + 1}/${retries - 1} in 3 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    } catch (error) {
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }
  
  return { success: false, statusCode: 404 };
}

async function main() {
  console.log('🔄 Enhanced Workflow Activation');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const credentials = loadCredentials();
  
  // Find workflow
  console.log('📋 Finding Knowledge Ingest workflow...');
  const workflow = findKnowledgeIngestWorkflow();
  
  if (!workflow) {
    console.log('❌ Workflow not found in workflow list');
    console.log('   Run list-all-n8n-workflows.js first');
    process.exit(1);
  }
  
  console.log(`   Found: ${workflow.name}`);
  console.log(`   ID: ${workflow.id}`);
  console.log(`   Current Active: ${workflow.active}\n`);
  
  // If already active, try toggling
  if (workflow.active) {
    console.log('🔄 Workflow is marked active, but webhook not registered.');
    console.log('   Attempting toggle (deactivate → activate)...\n');
    
    // Deactivate first
    try {
      const getResult = await makeRequest(
        `${credentials.n8nUrl}/api/v1/workflows/${workflow.id}`,
        'GET',
        null,
        { 'X-N8N-API-KEY': credentials.n8nApiKey }
      );
      
      if (getResult.statusCode === 200) {
        const wfData = JSON.parse(getResult.body);
        const workflowData = wfData.data || wfData;
        
        // Deactivate
        await makeRequest(
          `${credentials.n8nUrl}/api/v1/workflows/${workflow.id}`,
          'PATCH',
          JSON.stringify({ ...workflowData, active: false }),
          {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': credentials.n8nApiKey
          }
        );
        
        console.log('   ✅ Deactivated');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.log(`   ⚠️  Deactivation attempt: ${error.message}`);
    }
  }
  
  // Activate
  console.log('\n🔄 Activating workflow...');
  const activated = await activateWorkflowEnhanced(workflow.id, credentials);
  
  if (!activated) {
    console.log('\n❌ All activation methods failed');
    console.log('   API activation may require different permissions');
    console.log('   Manual toggle in n8n UI may be required\n');
    process.exit(1);
  }
  
  // Wait for webhook registration (longer wait like universal-webhook-manager)
  console.log('\n⏳ Waiting 15 seconds for webhook registration...');
  await new Promise(resolve => setTimeout(resolve, 15000));
  
  // Verify with retries
  console.log('\n🔍 Verifying webhook registration (with retries)...');
  const verification = await verifyWebhook(credentials, 5);
  
  if (verification.success) {
    console.log(`✅ Webhook is registered! (HTTP ${verification.statusCode})`);
    console.log('\n🎉 Knowledge Ingest workflow is now active and ready!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Webhook still not registered after activation');
    console.log('   This may require manual toggle in n8n UI\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Failed:', error.message);
  process.exit(1);
});

