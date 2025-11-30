#!/usr/bin/env node

/**
 * 🔧 Force Webhook Registration via Database
 * 
 * Since n8n isn't registering webhooks automatically, we'll:
 * 1. Deactivate the workflow
 * 2. Remove any existing webhook entries from database
 * 3. Reactivate the workflow to trigger fresh registration
 * 4. Verify webhook is registered
 */

const https = require('https');
const { execSync } = require('child_process');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;
const WORKFLOW_ID = 'c0HYTqTFtktCE3Fk';
const WEBHOOK_PATH = 'ingest-knowledge';

const INSTANCE_ID = 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = 'us-east-2b';
const REGION = 'us-east-2';
const SSH_USER = 'ubuntu';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 FORCE WEBHOOK REGISTRATION VIA DATABASE');
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
          resolve({ status: res.statusCode, data: JSON.parse(body), body: body });
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

async function executeOnEC2(command) {
  const publicIP = execSync(
    `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
    { encoding: 'utf8', stdio: 'pipe' }
  ).trim();

  const tempKeyPath = `${process.env.HOME}/.ssh/ec2-instance-connect-temp`;

  // Inject key
  execSync(
    `aws ec2-instance-connect send-ssh-public-key --instance-id ${INSTANCE_ID} --availability-zone ${AVAILABILITY_ZONE} --instance-os-user ${SSH_USER} --ssh-public-key file://${tempKeyPath}.pub --region ${REGION}`,
    { stdio: 'pipe' }
  );

  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const result = execSync(
      `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "${command.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', stdio: 'pipe', timeout: 30000 }
    ).trim();
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout?.toString() || '' };
  }
}

async function main() {
  // Step 1: Deactivate workflow
  console.log('1️⃣  Deactivating workflow...');
  try {
    await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/deactivate`);
    console.log('   ✅ Workflow deactivated\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    console.log(`   ⚠️  Deactivation failed: ${error.message}\n`);
  }

  // Step 2: Remove webhook entry from database
  console.log('2️⃣  Removing webhook entry from database...');
  const deleteResult = await executeOnEC2(
    `sudo sqlite3 /home/ubuntu/.n8n/database.sqlite "DELETE FROM webhook_entity WHERE workflowId = '${WORKFLOW_ID}'; SELECT changes();"`
  );
  
  if (deleteResult.success) {
    const changes = parseInt(deleteResult.output) || 0;
    console.log(`   ✅ Removed ${changes} webhook entry(ies) from database\n`);
  } else {
    console.log(`   ⚠️  Database cleanup failed: ${deleteResult.error}\n`);
  }

  // Step 3: Reactivate workflow (this should trigger webhook registration)
  console.log('3️⃣  Reactivating workflow to trigger webhook registration...');
  try {
    await makeApiRequest('POST', `/api/v1/workflows/${WORKFLOW_ID}/activate`);
    console.log('   ✅ Workflow reactivated\n');
  } catch (error) {
    console.log(`   ❌ Activation failed: ${error.message}\n`);
    process.exit(1);
  }

  // Step 4: Wait for webhook registration
  console.log('4️⃣  Waiting for webhook registration (90 seconds)...');
  for (let i = 0; i < 18; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    process.stdout.write(`   ${i + 1}/18... `);
    
    const test = await testWebhook(WEBHOOK_PATH);
    if (test.registered) {
      console.log(`\n   ✅ Webhook registered! (Status: ${test.status})\n`);
      
      // Verify in database
      console.log('5️⃣  Verifying webhook in database...');
      const verifyResult = await executeOnEC2(
        `sudo sqlite3 /home/ubuntu/.n8n/database.sqlite "SELECT webhookPath, method FROM webhook_entity WHERE workflowId = '${WORKFLOW_ID}';"`
      );
      
      if (verifyResult.success && verifyResult.output) {
        console.log(`   ✅ Webhook found in database: ${verifyResult.output}\n`);
      }
      
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎉 SUCCESS: WEBHOOK IS NOW REGISTERED!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log(`Webhook URL: ${N8N_URL}/webhook/${WEBHOOK_PATH}`);
      console.log(`Status: ${test.status}\n`);
      process.exit(0);
    }
  }
  console.log('\n');

  // Final test
  console.log('🧪 Final verification...');
  const finalTest = await testWebhook(WEBHOOK_PATH);
  
  if (finalTest.registered) {
    console.log(`✅ Webhook is registered! (Status: ${finalTest.status})\n`);
    process.exit(0);
  }

  console.log('⚠️  Webhook still not registered after database cleanup and reactivation\n');
  console.log('💡 This may require n8n container restart or version upgrade\n');
  process.exit(1);
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

