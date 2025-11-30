#!/usr/bin/env node

/**
 * 🤖 Ensure RAG Webhook is Active
 * 
 * Automated script to ensure Knowledge Ingest webhook is registered and operational.
 * Uses all available APIs and methods to guarantee webhook registration.
 */

const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');
const { retryWithBackoff, formatErrorMessage } = require('./utils/test-helpers');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const WORKFLOW_ID = 'c0HYTqTFtktCE3Fk';
const WEBHOOK_PATH = 'ingest-knowledge';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 ENSURE RAG WEBHOOK IS ACTIVE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

async function main() {
  // Step 1: Check current webhook status
  console.log('🔍 Step 1: Checking current webhook status...');
  const currentTest = await testWebhook(WEBHOOK_PATH);
  console.log(`   Status: ${currentTest.status} (${currentTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);

  if (currentTest.registered) {
    console.log('✅ Webhook is already registered! No action needed.\n');
    process.exit(0);
  }

  // Step 2: Get workflow status
  console.log('🔍 Step 2: Checking workflow status...');
  const workflowResponse = await makeApiRequest('GET', `/api/v1/workflows/${WORKFLOW_ID}`);
  const workflow = workflowResponse.data.data || workflowResponse.data;
  console.log(`   Workflow: ${workflow.name}`);
  console.log(`   Active: ${workflow.active ? 'Yes' : 'No'}\n`);

  // Step 3: Force re-registration
  console.log('🔄 Step 3: Forcing webhook re-registration...');
  try {
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
    console.log('   ✅ Activated\n');

    // Wait for webhook registration
    console.log('⏳ Step 4: Waiting for webhook registration (30 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Test with retry
    console.log('🧪 Step 5: Testing webhook with retry logic...');
    const finalTest = await retryWithBackoff(
      () => testWebhook(WEBHOOK_PATH),
      {
        maxRetries: 5,
        initialDelay: 3000,
        retryableErrors: [404, 429, 500],
        onRetry: (attempt, maxRetries, delay) => {
          console.log(`   ⏳ Retry ${attempt}/${maxRetries} after ${delay/1000}s...`);
        }
      }
    );

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 FINAL STATUS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (finalTest.registered) {
      console.log('✅ SUCCESS: Webhook is now registered!');
      console.log(`   Status: ${finalTest.status}\n`);
      console.log(`🎉 RAG webhook is operational: ${N8N_URL}/webhook/${WEBHOOK_PATH}\n`);
      process.exit(0);
    } else {
      console.log('⚠️  Webhook still not registered after all attempts');
      console.log(`   Status: ${finalTest.status}\n`);
      console.log('💡 Manual intervention may be required:');
      console.log('   1. Visit n8n UI and toggle workflow manually');
      console.log('   2. Check n8n logs for webhook registration errors');
      console.log('   3. Verify WEBHOOK_URL is set in container\n');
      process.exit(1);
    }
  } catch (error) {
    console.log(`\n❌ Automation failed: ${formatErrorMessage(error, { webhookPath: WEBHOOK_PATH, baseUrl: N8N_URL })}\n`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});
