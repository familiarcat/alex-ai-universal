#!/usr/bin/env node

/**
 * 🎯 Ensure Knowledge Ingest Webhook is Active
 * 
 * Comprehensive script that:
 * 1. Verifies WEBHOOK_URL in container
 * 2. Activates workflow using multiple strategies
 * 3. Waits appropriately for webhook registration
 * 4. Tests webhook with correct path
 * 5. Provides detailed diagnostics
 */

const https = require('https');
const { execSync } = require('child_process');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

if (!N8N_API_KEY) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in ~/.zshrc');
  process.exit(1);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 ENSURE KNOWLEDGE INGEST WEBHOOK IS ACTIVE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Make API request
function makeApiRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
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

// Test webhook
async function testWebhook(webhookPath) {
  return new Promise((resolve) => {
    const url = new URL(`/webhook/${webhookPath}`, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
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
      resolve({ status: 0, registered: false, error: 'timeout' });
    });

    req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
    req.end();
  });
}

// Extract webhook path from workflow
function extractWebhookPath(workflowData) {
  if (!workflowData || !workflowData.nodes) return null;
  
  for (const node of workflowData.nodes) {
    if (node.type === 'n8n-nodes-base.webhook' || node.type === '@n8n/n8n-nodes-langchain.webhook') {
      const path = node.parameters?.path || node.parameters?.options?.path;
      if (path) {
        return path.replace(/^\//, '');
      }
    }
  }
  return null;
}

// Verify WEBHOOK_URL in container (via EC2)
async function verifyWebhookUrlInContainer() {
  console.log('🔍 Verifying WEBHOOK_URL in container...');
  
  try {
    // Use EC2 Instance Connect to check container
    const INSTANCE_ID = 'i-0afdf313f61f22df0';
    const AVAILABILITY_ZONE = 'us-east-2b';
    const REGION = 'us-east-2';
    const SSH_USER = 'ubuntu';
    
    // Get instance IP
    const publicIP = execSync(
      `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    
    // Check via SSH (using existing temp key if available)
    const tempKeyPath = `${process.env.HOME}/.ssh/ec2-instance-connect-temp`;
    
    if (require('fs').existsSync(tempKeyPath)) {
      try {
        const result = execSync(
          `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ${SSH_USER}@${publicIP} "docker exec n8n env | grep WEBHOOK_URL" 2>/dev/null`,
          { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
        ).trim();
        
        if (result && result.includes('WEBHOOK_URL')) {
          console.log(`   ✅ ${result}\n`);
          return true;
        }
      } catch (e) {
        // SSH failed, continue without verification
      }
    }
    
    console.log('   ⚠️  Could not verify via SSH (this is OK)\n');
    return null; // Unknown, not a failure
  } catch (error) {
    console.log(`   ⚠️  Verification skipped: ${error.message}\n`);
    return null;
  }
}

async function main() {
  // Step 1: Find workflow
  console.log('🔍 Step 1: Finding Knowledge Ingest workflow...');
  const workflowsResponse = await makeApiRequest('GET', '/api/v1/workflows');
  
  if (workflowsResponse.status !== 200) {
    console.log(`❌ Failed to fetch workflows`);
    process.exit(1);
  }
  
  let workflows = [];
  const data = workflowsResponse.data;
  if (Array.isArray(data)) {
    workflows = data;
  } else if (data.data && Array.isArray(data.data)) {
    workflows = data.data;
  } else if (data.results && Array.isArray(data.results)) {
    workflows = data.results;
  }
  
  const workflow = workflows.find(w => {
    const name = (w.name || '').toLowerCase();
    return name.includes('knowledge ingest') || 
           name.includes('knowledge-ingest') ||
           name.includes('rag ingestion');
  });
  
  if (!workflow) {
    console.log('❌ Knowledge Ingest workflow not found!');
    process.exit(1);
  }
  
  console.log(`   ✅ Found: ${workflow.name} (${workflow.id})\n`);
  
  // Step 2: Get webhook path
  console.log('🔍 Step 2: Extracting webhook path...');
  const detailResponse = await makeApiRequest('GET', `/api/v1/workflows/${workflow.id}`);
  const workflowData = detailResponse.data.data || detailResponse.data;
  const webhookPath = extractWebhookPath(workflowData) || 'ingest-knowledge';
  console.log(`   ✅ Webhook path: ${webhookPath}\n`);
  
  // Step 3: Verify WEBHOOK_URL in container
  await verifyWebhookUrlInContainer();
  
  // Step 4: Test webhook before activation
  console.log('🧪 Step 3: Testing webhook before activation...');
  const beforeTest = await testWebhook(webhookPath);
  console.log(`   Status: ${beforeTest.status} (${beforeTest.registered ? '✅ Registered' : '❌ Not Registered'})\n`);
  
  if (beforeTest.registered) {
    console.log('✅ Webhook is already registered! No action needed.\n');
    process.exit(0);
  }
  
  // Step 5: Activate workflow with multiple strategies
  console.log('🔄 Step 4: Activating workflow...');
  
  // Strategy 1: Deactivate then activate
  try {
    if (workflow.active) {
      console.log('   📴 Deactivating...');
      await makeApiRequest('POST', `/api/v1/workflows/${workflow.id}/deactivate`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('   📡 Activating...');
    await makeApiRequest('POST', `/api/v1/workflows/${workflow.id}/activate`);
    console.log('   ✅ Activation command sent\n');
  } catch (error) {
    console.log(`   ❌ Activation failed: ${error.message}\n`);
    process.exit(1);
  }
  
  // Step 6: Wait for webhook registration (longer wait)
  console.log('⏳ Step 5: Waiting for webhook registration...');
  console.log('   Waiting 30 seconds (webhooks may take time to register)...');
  
  for (let i = 0; i < 6; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.stdout.write(`   ${i + 1}/6... `);
    
    const test = await testWebhook(webhookPath);
    if (test.registered) {
      console.log(`\n   ✅ Webhook registered! (Status: ${test.status})\n`);
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ SUCCESS: Knowledge Ingest webhook is operational!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`Webhook URL: ${N8N_URL}/webhook/${webhookPath}`);
      console.log(`Status: ${test.status}\n`);
      console.log('🎉 RAG ingestion is ready!\n');
      process.exit(0);
    }
  }
  console.log('\n');
  
  // Step 7: Final test
  console.log('🧪 Step 6: Final webhook test...');
  const finalTest = await testWebhook(webhookPath);
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (finalTest.registered) {
    console.log('✅ SUCCESS: Webhook is registered!');
    console.log(`   Status: ${finalTest.status}\n`);
    process.exit(0);
  } else {
    console.log('⚠️  Webhook still not registered after 30 seconds');
    console.log(`   Status: ${finalTest.status}`);
    console.log(`   Response: ${finalTest.body?.substring(0, 150)}...\n`);
    
    console.log('💡 This is a known n8n Community Edition limitation.');
    console.log('   Webhooks may take longer to register or require manual UI toggle.\n');
    console.log('📋 Manual Steps:');
    console.log('   1. Visit: https://n8n.pbradygeorgen.com');
    console.log(`   2. Open workflow: "${workflow.name}"`);
    console.log('   3. Toggle activation switch (top-right)');
    console.log('   4. Wait 30 seconds');
    console.log(`   5. Test: curl -X POST ${N8N_URL}/webhook/${webhookPath} -H "Content-Type: application/json" -d '{"test": true}'\n`);
    
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

