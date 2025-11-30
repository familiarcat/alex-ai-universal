#!/usr/bin/env node

/**
 * 🛠️ Crew-Implemented Database-Level Webhook Registration
 * 
 * Chief O'Brien's pragmatic solution: Manually register webhook
 * in database to bypass n8n's broken registration service.
 */

const { execSync } = require('child_process');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const WORKFLOW_ID = 'c0HYTqTFtktCE3Fk';
const WEBHOOK_PATH = 'ingest-knowledge';
const WEBHOOK_METHOD = 'POST';
const WEBHOOK_NODE = 'Webhook Trigger';

const INSTANCE_ID = 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = 'us-east-2b';
const REGION = 'us-east-2';
const SSH_USER = 'ubuntu';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🛠️  CREW-IMPLEMENTED DATABASE WEBHOOK REGISTRATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('👨‍🔧 Chief O\'Brien: "Simple solutions are usually the best solutions."\n');

async function executeOnEC2(command) {
  const publicIP = execSync(
    `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
    { encoding: 'utf8', stdio: 'pipe' }
  ).trim();

  const tempKeyPath = `${process.env.HOME}/.ssh/ec2-instance-connect-temp`;

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
  // Step 1: Backup database
  console.log('1️⃣  Backing up database...');
  const backupResult = await executeOnEC2(
    `sudo cp /home/ubuntu/.n8n/database.sqlite /home/ubuntu/.n8n/database.sqlite.backup-$(date +%Y%m%d-%H%M%S) && echo "backup created"`
  );
  if (backupResult.success) {
    console.log('   ✅ Database backup created\n');
  } else {
    console.log(`   ⚠️  Backup warning: ${backupResult.error}\n`);
  }

  // Step 2: Get webhook node ID from workflow
  console.log('2️⃣  Getting webhook node information...');
  const https = require('https');
  const { loadCrewCredentials } = require('./utils/load-crew-credentials');
  const creds = loadCrewCredentials();
  const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
  const N8N_API_KEY = creds.n8n.apiKey;

  function makeApiRequest(path) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, N8N_URL);
      const req = https.request({
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'GET',
        headers: { 'X-N8N-API-KEY': N8N_API_KEY },
        timeout: 15000
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  }

  const workflowResponse = await makeApiRequest(`/api/v1/workflows/${WORKFLOW_ID}`);
  const workflow = workflowResponse.data || workflowResponse;
  const webhookNode = (workflow.nodes || []).find(n => n.type && n.type.includes('webhook'));
  
  if (!webhookNode) {
    console.log('   ❌ Webhook node not found in workflow\n');
    process.exit(1);
  }

  const webhookNodeId = webhookNode.id;
  const webhookNodeName = webhookNode.name || WEBHOOK_NODE;
  console.log(`   Node ID: ${webhookNodeId}`);
  console.log(`   Node Name: ${webhookNodeName}\n`);

  // Step 3: Construct webhook path (n8n format: {workflowId}/webhook/{path})
  // Based on database analysis, n8n stores paths in format: {workflowId}/webhook/{path}
  const fullWebhookPath = `${WORKFLOW_ID}/webhook/${WEBHOOK_PATH}`;
  const pathLength = fullWebhookPath.length;

  console.log('3️⃣  Registering webhook in database...');
  console.log(`   Workflow ID: ${WORKFLOW_ID}`);
  console.log(`   Webhook Path: ${fullWebhookPath}`);
  console.log(`   Method: ${WEBHOOK_METHOD}`);
  console.log(`   Node: ${webhookNodeName}\n`);

  // Step 4: Insert webhook entry
  // First, remove any existing entry
  const deleteResult = await executeOnEC2(
    `sudo sqlite3 /home/ubuntu/.n8n/database.sqlite "DELETE FROM webhook_entity WHERE workflowId = '${WORKFLOW_ID}' AND method = '${WEBHOOK_METHOD}'; SELECT changes();"`
  );

  if (deleteResult.success) {
    const deleted = parseInt(deleteResult.output) || 0;
    if (deleted > 0) {
      console.log(`   ✅ Removed ${deleted} existing entry(ies)\n`);
    }
  }

  // Insert new entry
  const insertSQL = `INSERT INTO webhook_entity (workflowId, webhookPath, method, node, pathLength) VALUES ('${WORKFLOW_ID}', '${fullWebhookPath}', '${WEBHOOK_METHOD}', '${webhookNodeName}', ${pathLength});`;
  
  const insertResult = await executeOnEC2(
    `sudo sqlite3 /home/ubuntu/.n8n/database.sqlite "${insertSQL}" && echo "inserted"`
  );

  if (insertResult.success && insertResult.output.includes('inserted')) {
    console.log('   ✅ Webhook entry inserted into database\n');
  } else {
    console.log(`   ❌ Insert failed: ${insertResult.error || insertResult.output}\n`);
    process.exit(1);
  }

  // Step 5: Verify entry
  console.log('4️⃣  Verifying webhook entry...');
  const verifyResult = await executeOnEC2(
    `sudo sqlite3 /home/ubuntu/.n8n/database.sqlite "SELECT workflowId, webhookPath, method, node FROM webhook_entity WHERE workflowId = '${WORKFLOW_ID}';"`
  );

  if (verifyResult.success && verifyResult.output) {
    console.log('   ✅ Webhook entry verified:');
    console.log(`      ${verifyResult.output}\n`);
  } else {
    console.log('   ⚠️  Could not verify entry\n');
  }

  // Step 6: Restart n8n to load webhook from database
  console.log('5️⃣  Restarting n8n to load webhook from database...');
  const restartResult = await executeOnEC2(
    'cd /opt/n8n && sudo docker-compose restart n8n && sleep 5 && echo "restarted"'
  );

  if (restartResult.success) {
    console.log('   ✅ Container restarted\n');
  } else {
    console.log(`   ⚠️  Restart warning: ${restartResult.error}\n`);
  }

  // Step 7: Wait and test
  console.log('6️⃣  Waiting for n8n to initialize (30 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  console.log('   ✅ Wait complete\n');

  console.log('7️⃣  Testing webhook registration...');
  const testResult = await new Promise((resolve) => {
    const req = https.request({
      hostname: 'n8n.pbradygeorgen.com',
      port: 443,
      path: `/webhook/${WEBHOOK_PATH}`,
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
          body: body.substring(0, 200)
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

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (testResult.registered) {
    console.log('🎉 SUCCESS: Webhook is now registered!');
    console.log(`   Status: ${testResult.status}`);
    console.log(`   Webhook URL: https://n8n.pbradygeorgen.com/webhook/${WEBHOOK_PATH}\n`);
    console.log('✅ Chief O\'Brien\'s database-level solution worked!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Webhook still not responding');
    console.log(`   Status: ${testResult.status}`);
    console.log(`   Response: ${testResult.body}\n`);
    console.log('💡 May need to check webhook path format or n8n version compatibility\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

