#!/usr/bin/env node

/**
 * 🤖 Comprehensive RAG Webhook Activation
 * 
 * Uses ALL available methods to ensure webhook registration:
 * 1. API activation with multiple strategies
 * 2. Container restart if needed
 * 3. Extended wait times
 * 4. Multiple retry attempts
 * 5. Webhook node verification
 */

const https = require('https');
const { execSync } = require('child_process');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { retryWithBackoff, formatErrorMessage } = require('./utils/test-helpers');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const WORKFLOW_ID = 'c0HYTqTFtktCE3Fk';
const WEBHOOK_PATH = 'ingest-knowledge';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 COMPREHENSIVE RAG WEBHOOK ACTIVATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('🎯 Using ALL available methods to ensure webhook registration\n');

function makeApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json',
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, body: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, body: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testWebhook(webhookPath) {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          registered: res.statusCode !== 404,
          body: body
        });
      });
    });

    req.on('error', () => resolve({ status: 0, registered: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ status: 0, registered: false });
    });

    req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
    req.end();
  });
}

async function checkWebhookNode() {
  console.log('🔍 Checking webhook node configuration...');
  try {
    const workflowResponse = await makeApiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
    const workflowData = workflowResponse.data.data || workflowResponse.data;
    const webhookNode = (workflowData.nodes || []).find(n => 
      n.type && (n.type.includes('webhook') || n.type.includes('Webhook'))
    );

    if (webhookNode) {
      console.log(`   ✅ Webhook node found: ${webhookNode.name}`);
      console.log(`   📍 Path: ${webhookNode.parameters?.path || webhookNode.parameters?.options?.path}`);
      console.log(`   ⚙️  Disabled: ${webhookNode.disabled ? 'Yes ⚠️' : 'No ✅'}\n`);

      if (webhookNode.disabled) {
        console.log('   ⚠️  CRITICAL: Webhook node is disabled!');
        console.log('   💡 Enable it in n8n UI: Open workflow → Find webhook node → Enable it\n');
        return false;
      }
      return true;
    } else {
      console.log('   ❌ No webhook node found in workflow\n');
      return false;
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check webhook node: ${error.message}\n`);
    return null; // Unknown
  }
}

async function strategy1_apiActivation() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 Strategy 1: API Activation (Deactivate/Activate Pattern)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    // Get current status
    const workflowResponse = await makeApiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
    const workflow = workflowResponse.data.data || workflowResponse.data;
    
    console.log(`   Current status: ${workflow.active ? 'Active' : 'Inactive'}\n`);

    // Deactivate
    if (workflow.active) {
      console.log('   📴 Deactivating workflow...');
      await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/deactivate`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      console.log('   ✅ Deactivated\n');
    }

    // Activate
    console.log('   📡 Activating workflow...');
    await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/activate`);
    console.log('   ✅ Activation command sent\n');

    // Wait longer for webhook registration
    console.log('   ⏳ Waiting 60 seconds for webhook registration...');
    for (let i = 0; i < 12; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      process.stdout.write(`   ${i + 1}/12... `);
      
      const test = await testWebhook(WEBHOOK_PATH);
      if (test.registered) {
        console.log(`\n   ✅ Webhook registered! (Status: ${test.status})\n`);
        return true;
      }
    }
    console.log('\n');

    // Final test
    const finalTest = await testWebhook(WEBHOOK_PATH);
    return finalTest.registered;
  } catch (error) {
    console.log(`   ❌ Strategy 1 failed: ${error.message}\n`);
    return false;
  }
}

async function strategy2_containerRestart() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Strategy 2: Container Restart + Activation');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    console.log('   🔄 Restarting n8n container...');
    execSync('node scripts/restart-n8n-container-ec2.js', { stdio: 'pipe' });
    console.log('   ✅ Container restarted\n');

    console.log('   ⏳ Waiting 90 seconds for n8n to fully initialize...');
    await new Promise(resolve => setTimeout(resolve, 90000));

    // Activate workflow
    console.log('   📡 Activating workflow after restart...');
    await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/activate`);
    console.log('   ✅ Workflow activated\n');

    // Wait for webhook
    console.log('   ⏳ Waiting 60 seconds for webhook registration...');
    await new Promise(resolve => setTimeout(resolve, 60000));

    // Test
    const test = await testWebhook(WEBHOOK_PATH);
    return test.registered;
  } catch (error) {
    console.log(`   ❌ Strategy 2 failed: ${error.message}\n`);
    return false;
  }
}

async function strategy3_multipleActivations() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 Strategy 3: Multiple Activation Cycles');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    for (let cycle = 1; cycle <= 3; cycle++) {
      console.log(`   Cycle ${cycle}/3:`);
      
      // Deactivate
      console.log('      📴 Deactivating...');
      await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/deactivate`);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Activate
      console.log('      📡 Activating...');
      await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/activate`);
      await new Promise(resolve => setTimeout(resolve, 20000));

      // Test
      const test = await testWebhook(WEBHOOK_PATH);
      if (test.registered) {
        console.log(`      ✅ Webhook registered! (Status: ${test.status})\n`);
        return true;
      }
      console.log(`      ❌ Not registered yet (Status: ${test.status})\n`);
    }

    return false;
  } catch (error) {
    console.log(`   ❌ Strategy 3 failed: ${error.message}\n`);
    return false;
  }
}

async function main() {
  // Pre-flight checks
  console.log('🔍 Pre-flight Checks:\n');
  
  const webhookNodeOk = await checkWebhookNode();
  if (webhookNodeOk === false) {
    console.log('❌ Webhook node is disabled or missing. Fix in n8n UI first.\n');
    process.exit(1);
  }

  // Test current status
  console.log('🧪 Testing current webhook status...');
  const initialTest = await testWebhook(WEBHOOK_PATH);
  console.log(`   Status: ${initialTest.status} (${initialTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);

  if (initialTest.registered) {
    console.log('✅ Webhook is already registered! No action needed.\n');
    process.exit(0);
  }

  // Try all strategies
  console.log('🚀 Attempting all activation strategies...\n');

  let success = false;

  // Strategy 1: API Activation
  success = await strategy1_apiActivation();
  if (success) {
    console.log('🎉 SUCCESS: Strategy 1 worked!\n');
    process.exit(0);
  }

  // Strategy 2: Container Restart
  console.log('⚠️  Strategy 1 did not register webhook. Trying Strategy 2...\n');
  success = await strategy2_containerRestart();
  if (success) {
    console.log('🎉 SUCCESS: Strategy 2 worked!\n');
    process.exit(0);
  }

  // Strategy 3: Multiple Cycles
  console.log('⚠️  Strategy 2 did not register webhook. Trying Strategy 3...\n');
  success = await strategy3_multipleActivations();
  if (success) {
    console.log('🎉 SUCCESS: Strategy 3 worked!\n');
    process.exit(0);
  }

  // Final status
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const finalTest = await testWebhook(WEBHOOK_PATH);
  if (finalTest.registered) {
    console.log('✅ SUCCESS: Webhook is now registered!\n');
    process.exit(0);
  }

  console.log('❌ All strategies failed. Webhook still not registered.\n');
  console.log('💡 This appears to be a known n8n Community Edition limitation.');
  console.log('   Webhook registration may require manual UI toggle.\n');
  console.log('📋 Manual Steps:');
  console.log('   1. Visit: https://n8n.pbradygeorgen.com');
  console.log('   2. Open workflow: "Alex AI Knowledge Base RAG Ingestion"');
  console.log('   3. Toggle activation switch (top-right)');
  console.log('   4. Wait 60 seconds');
  console.log(`   5. Test: curl -X POST ${N8N_URL}/webhook/${WEBHOOK_PATH} -H "Content-Type: application/json" -d '{"test": true}'\n`);

  process.exit(1);
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

