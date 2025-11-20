#!/usr/bin/env node

/**
 * 🤖 Automate Activation of All Inactive N8N Workflows
 * 
 * Reads webhook status report and automatically activates all inactive workflows
 * Then verifies activation and retries milestone push
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load credentials from ~/.zshrc
function loadCredentials() {
  try {
    const zshrcPath = path.join(process.env.HOME, '.zshrc');
    const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
    
    const n8nUrlMatch = zshrcContent.match(/export\s+N8N_URL=['"]([^'"]+)['"]/);
    const n8nApiKeyMatch = zshrcContent.match(/export\s+N8N_API_KEY=['"]([^'"]+)['"]/);
    const n8nOwnerKeyMatch = zshrcContent.match(/export\s+N8N_OWNER_API_KEY=['"]([^'"]+)['"]/);
    
    const n8nUrl = n8nUrlMatch ? n8nUrlMatch[1] : 'https://n8n.pbradygeorgen.com';
    const n8nApiKey = n8nOwnerKeyMatch ? n8nOwnerKeyMatch[1] : (n8nApiKeyMatch ? n8nApiKeyMatch[1] : null);
    
    if (!n8nApiKey) {
      console.error('❌ N8N_API_KEY or N8N_OWNER_API_KEY not found in ~/.zshrc');
      process.exit(1);
    }
    
    return { n8nUrl, n8nApiKey };
  } catch (error) {
    console.error('❌ Failed to load credentials:', error.message);
    process.exit(1);
  }
}

// Get workflow details
function getWorkflow(workflowId, credentials) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/api/v1/workflows/${workflowId}`, credentials.n8nUrl);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': credentials.n8nApiKey
      },
      timeout: 10000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve({ data: body });
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Activate a workflow via n8n API using PATCH
function activateWorkflow(workflowId, credentials) {
  return new Promise(async (resolve, reject) => {
    try {
      // First get the workflow
      const workflow = await getWorkflow(workflowId, credentials);
      const workflowData = workflow.data || workflow;
      
      // Then update it with active: true
      const url = new URL(`/api/v1/workflows/${workflowId}`, credentials.n8nUrl);
      const updateData = JSON.stringify({ ...workflowData, active: true });
      
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(updateData),
          'X-N8N-API-KEY': credentials.n8nApiKey
        },
        timeout: 10000
      };
      
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 204) {
            resolve({ success: true, statusCode: res.statusCode });
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          }
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.write(updateData);
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Test webhook to verify activation
function testWebhook(webhookPath, method, credentials) {
  return new Promise((resolve) => {
    const url = new URL(webhookPath, credentials.n8nUrl);
    const testPayload = method === 'POST' 
      ? JSON.stringify({ test: 'connectivity', timestamp: new Date().toISOString() })
      : null;
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(testPayload && { 'Content-Length': Buffer.byteLength(testPayload) })
      },
      timeout: 5000
    };
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        const isActive = res.statusCode !== 404;
        resolve({ isActive, statusCode: res.statusCode, body: body.substring(0, 200) });
      });
    });
    
    req.on('error', () => resolve({ isActive: false, statusCode: 0, body: 'Connection error' }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ isActive: false, statusCode: 0, body: 'Timeout' });
    });
    
    if (testPayload) {
      req.write(testPayload);
    }
    req.end();
  });
}

// Load inactive workflows from status report
function loadInactiveWorkflows() {
  const reportPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'n8n-webhook-status-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ Status report not found. Run check-all-n8n-webhooks.js first.');
    process.exit(1);
  }
  
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  return report.results.filter(r => !r.isActive && r.workflowId);
}

// Main execution
async function main() {
  console.log('🤖 Automate Activation of All Inactive N8N Workflows');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Load credentials
  console.log('📋 Loading credentials...');
  const credentials = loadCredentials();
  console.log(`   ✅ N8N URL: ${credentials.n8nUrl}`);
  console.log(`   ✅ API Key: ${credentials.n8nApiKey.substring(0, 20)}...\n`);
  
  // Load inactive workflows
  console.log('📄 Loading inactive workflows from status report...');
  const inactiveWorkflows = loadInactiveWorkflows();
  console.log(`   Found ${inactiveWorkflows.length} inactive workflows with workflow IDs\n`);
  
  if (inactiveWorkflows.length === 0) {
    console.log('✅ No inactive workflows found! All workflows are active.');
    return;
  }
  
  // Group by priority
  const critical = inactiveWorkflows.filter(w => w.priority === 'P0');
  const high = inactiveWorkflows.filter(w => w.priority === 'P1');
  const medium = inactiveWorkflows.filter(w => w.priority === 'P2');
  
  console.log('📊 Workflow Priority Breakdown:');
  console.log(`   🚨 Critical (P0): ${critical.length}`);
  console.log(`   🟡 High (P1): ${high.length}`);
  console.log(`   🟢 Medium (P2): ${medium.length}\n`);
  
  // Activate workflows by priority
  const results = [];
  
  // Critical first
  if (critical.length > 0) {
    console.log('🚨 ACTIVATING CRITICAL WORKFLOWS (P0)');
    console.log('─'.repeat(70) + '\n');
    
    for (const workflow of critical) {
      console.log(`🔄 Activating: ${workflow.name}`);
      console.log(`   Workflow ID: ${workflow.workflowId}`);
      console.log(`   Path: ${workflow.path}`);
      
      try {
        await activateWorkflow(workflow.workflowId, credentials);
        console.log('   ✅ Activation request sent');
        
        // Wait for webhook registration
        console.log('   ⏳ Waiting 5 seconds for webhook registration...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Verify activation
        console.log('   🔍 Verifying webhook registration...');
        const test = await testWebhook(workflow.path, workflow.method, credentials);
        
        if (test.isActive) {
          console.log(`   ✅ VERIFIED: Webhook is active (HTTP ${test.statusCode})\n`);
          results.push({ ...workflow, activated: true, verified: true });
        } else {
          console.log(`   ⚠️  Webhook not yet registered (HTTP ${test.statusCode})`);
          console.log(`   💡 May need additional time or manual activation\n`);
          results.push({ ...workflow, activated: true, verified: false });
        }
      } catch (error) {
        console.log(`   ❌ Activation failed: ${error.message}\n`);
        results.push({ ...workflow, activated: false, error: error.message });
      }
    }
  }
  
  // High priority
  if (high.length > 0) {
    console.log('🟡 ACTIVATING HIGH PRIORITY WORKFLOWS (P1)');
    console.log('─'.repeat(70) + '\n');
    
    for (const workflow of high) {
      console.log(`🔄 Activating: ${workflow.name}`);
      console.log(`   Workflow ID: ${workflow.workflowId}`);
      
      try {
        await activateWorkflow(workflow.workflowId, credentials);
        console.log('   ✅ Activation request sent');
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const test = await testWebhook(workflow.path, workflow.method, credentials);
        if (test.isActive) {
          console.log(`   ✅ VERIFIED: Webhook is active\n`);
          results.push({ ...workflow, activated: true, verified: true });
        } else {
          console.log(`   ⚠️  Webhook not yet registered\n`);
          results.push({ ...workflow, activated: true, verified: false });
        }
      } catch (error) {
        console.log(`   ❌ Activation failed: ${error.message}\n`);
        results.push({ ...workflow, activated: false, error: error.message });
      }
    }
  }
  
  // Medium priority
  if (medium.length > 0) {
    console.log('🟢 ACTIVATING MEDIUM PRIORITY WORKFLOWS (P2)');
    console.log('─'.repeat(70) + '\n');
    
    for (const workflow of medium) {
      console.log(`🔄 Activating: ${workflow.name}`);
      if (workflow.workflowId) {
        console.log(`   Workflow ID: ${workflow.workflowId}`);
        
        try {
          await activateWorkflow(workflow.workflowId, credentials);
          console.log('   ✅ Activation request sent');
          await new Promise(resolve => setTimeout(resolve, 2000));
          results.push({ ...workflow, activated: true });
        } catch (error) {
          console.log(`   ❌ Activation failed: ${error.message}\n`);
          results.push({ ...workflow, activated: false, error: error.message });
        }
      } else {
        console.log('   ⚠️  No workflow ID found, skipping\n');
        results.push({ ...workflow, activated: false, error: 'No workflow ID' });
      }
    }
  }
  
  // Summary
  console.log('\n' + '═'.repeat(70));
  console.log('📊 ACTIVATION SUMMARY');
  console.log('═'.repeat(70) + '\n');
  
  const activated = results.filter(r => r.activated).length;
  const verified = results.filter(r => r.verified).length;
  const failed = results.filter(r => !r.activated).length;
  
  console.log(`Total Workflows Processed: ${results.length}`);
  console.log(`✅ Activation Requests Sent: ${activated}`);
  console.log(`✅ Verified Active: ${verified}`);
  console.log(`❌ Failed: ${failed}\n`);
  
  // Critical workflows status
  const criticalActivated = results.filter(r => r.priority === 'P0' && r.activated).length;
  const criticalVerified = results.filter(r => r.priority === 'P0' && r.verified).length;
  
  console.log('🚨 Critical Workflows:');
  console.log(`   Activated: ${criticalActivated}/${critical.length}`);
  console.log(`   Verified: ${criticalVerified}/${critical.length}\n`);
  
  // Save results
  const resultsPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'workflow-activation-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      activated,
      verified,
      failed
    },
    results
  }, null, 2));
  
  console.log('📄 Detailed results saved to:');
  console.log(`   ${resultsPath}\n`);
  
  // If Knowledge Ingest was activated, suggest milestone push
  const knowledgeIngest = results.find(r => r.path === '/webhook/knowledge-ingest' && r.verified);
  if (knowledgeIngest) {
    console.log('═'.repeat(70));
    console.log('🎯 MILESTONE PUSH READY');
    console.log('═'.repeat(70) + '\n');
    console.log('✅ Knowledge Ingest workflow is now active!');
    console.log('You can now push the milestone to Supabase:\n');
    console.log('   node scripts/push-milestone-to-rag.js MILESTONE_2025-11-19_OBSERVATION_LOUNGE_STATUS_BRIEFING.md\n');
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

