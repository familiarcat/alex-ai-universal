#!/usr/bin/env node

/**
 * 🔄 Restart n8n Container on EC2
 * 
 * Unified script to restart n8n container on EC2 using:
 * - Docker Compose (preferred, uses --env-file automatically)
 * - Ensures WEBHOOK_URL is loaded from /opt/n8n/.env
 * - Verifies restart success
 * - Tests webhooks after restart
 * 
 * Uses EC2 Instance Connect or AWS SSM for remote execution
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

// EC2 Configuration (can be overridden by environment variables)
const INSTANCE_ID = process.env.EC2_INSTANCE_ID || 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = process.env.EC2_AVAILABILITY_ZONE || 'us-east-2b';
const REGION = process.env.AWS_REGION || 'us-east-2';
const SSH_USER = 'ubuntu';

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔄 RESTART N8N CONTAINER ON EC2');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Strategy: Use docker-compose restart (ensures --env-file is used)');
console.log(`   Instance: ${INSTANCE_ID}`);
console.log(`   Region: ${REGION}\n`);

// Get EC2 instance public IP
function getInstanceIP() {
  try {
    const ip = execSync(
      `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    return ip;
  } catch (error) {
    console.error(`❌ Failed to get instance IP: ${error.message}`);
    return null;
  }
}

// Restart using EC2 Instance Connect
async function restartViaInstanceConnect() {
  console.log('🔍 Method: EC2 Instance Connect\n');
  
  const publicIP = getInstanceIP();
  if (!publicIP) {
    return false;
  }
  
  console.log(`✅ Instance IP: ${publicIP}\n`);
  
  // Generate temp key if needed
  const tempKeyPath = path.join(process.env.HOME, '.ssh', 'ec2-instance-connect-temp');
  const tempPubKeyPath = `${tempKeyPath}.pub`;
  
  if (!fs.existsSync(tempKeyPath)) {
    console.log('🔑 Generating temporary SSH key...');
    execSync(`ssh-keygen -t rsa -f "${tempKeyPath}" -N "" -C "ec2-instance-connect-temp"`, { stdio: 'pipe' });
    console.log('✅ Key generated\n');
  }
  
  const publicKey = fs.readFileSync(tempPubKeyPath, 'utf8');
  
  // Inject key
  console.log('📤 Injecting SSH key via EC2 Instance Connect...');
  try {
    execSync(
      `aws ec2-instance-connect send-ssh-public-key --instance-id ${INSTANCE_ID} --availability-zone ${AVAILABILITY_ZONE} --instance-os-user ${SSH_USER} --ssh-public-key file://${tempPubKeyPath} --region ${REGION}`,
      { stdio: 'pipe' }
    );
    console.log('✅ Key injected\n');
  } catch (error) {
    console.log(`⚠️  EC2 Instance Connect failed: ${error.message}\n`);
    return false;
  }
  
  // Wait for key
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Restart command
  const restartScript = `#!/bin/bash
set -e
cd /opt/n8n

echo '[EC2] Checking docker-compose.yml...'
if [ -f docker-compose.yml ]; then
  echo '[EC2] Using docker-compose restart...'
  docker-compose restart n8n
else
  echo '[EC2] docker-compose.yml not found, using docker restart...'
  docker restart n8n || {
    echo '[EC2] Container not running, starting with --env-file...'
    docker stop n8n 2>/dev/null || true
    docker rm n8n 2>/dev/null || true
    docker run -d --name n8n --restart always -p 5678:5678 --env-file /opt/n8n/.env -v /home/ubuntu/.n8n:/home/node/.n8n n8nio/n8n:latest
  }
fi

echo '[EC2] Waiting 10 seconds for n8n to initialize...'
sleep 10

echo '[EC2] Verifying container is running...'
docker ps --filter name=n8n --format '{{.Names}} - {{.Status}}'

echo '[EC2] Verifying WEBHOOK_URL in container...'
docker exec n8n env | grep WEBHOOK_URL || echo '[EC2] WEBHOOK_URL not found in container environment'
`;
  
  try {
    console.log('🚀 Executing restart command...\n');
    execSync(
      `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "${restartScript.replace(/\$/g, '\\$').replace(/"/g, '\\"')}"`,
      { stdio: 'inherit', timeout: 60000 }
    );
    
    console.log('\n✅ Container restart command executed');
    return true;
  } catch (error) {
    console.log(`\n⚠️  SSH execution failed: ${error.message}`);
    return false;
  }
}

// Restart using AWS SSM
async function restartViaSSM() {
  console.log('🔍 Method: AWS Systems Manager (SSM)\n');
  
  const restartCommands = [
    'cd /opt/n8n',
    'if [ -f docker-compose.yml ]; then docker-compose restart n8n; else docker restart n8n || (docker stop n8n 2>/dev/null; docker rm n8n 2>/dev/null; docker run -d --name n8n --restart always -p 5678:5678 --env-file /opt/n8n/.env -v /home/ubuntu/.n8n:/home/node/.n8n n8nio/n8n:latest); fi',
    'sleep 10',
    'docker ps --filter name=n8n --format "{{.Names}} - {{.Status}}"',
    'docker exec n8n env | grep WEBHOOK_URL || echo "WEBHOOK_URL not found"'
  ];
  
  try {
    console.log('📤 Sending restart command via SSM...');
    const commandId = execSync(
      `aws ssm send-command --instance-ids ${INSTANCE_ID} --document-name "AWS-RunShellScript" --parameters "commands=[${restartCommands.map(c => `"${c.replace(/"/g, '\\"')}"`).join(',')}]" --region ${REGION} --output text --query 'Command.CommandId'`,
      { encoding: 'utf8', stdio: 'pipe' }
    ).trim();
    
    console.log(`✅ Command sent (ID: ${commandId})`);
    console.log('⏳ Waiting 20 seconds for execution...\n');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    // Get command output
    console.log('📊 Command output:');
    execSync(
      `aws ssm get-command-invocation --command-id ${commandId} --instance-id ${INSTANCE_ID} --region ${REGION} --query 'StandardOutputContent' --output text`,
      { stdio: 'inherit' }
    );
    
    return true;
  } catch (error) {
    console.log(`⚠️  SSM execution failed: ${error.message}\n`);
    return false;
  }
}

// Test webhook after restart
async function testWebhookAfterRestart() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 VERIFYING WEBHOOK AFTER RESTART');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('⏳ Waiting 30 seconds for n8n to fully initialize and register webhooks...');
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  console.log('🔗 Testing Knowledge Ingest webhook...\n');
  
  return new Promise((resolve) => {
    const url = new URL('/webhook/knowledge-ingest', N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode === 404) {
          console.log('   ❌ Webhook still not registered (404)');
          console.log('   💡 May need to force webhook re-registration\n');
          resolve(false);
        } else if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 405) {
          console.log(`   ✅ Webhook is registered! (Status: ${res.statusCode})\n`);
          resolve(true);
        } else {
          console.log(`   ⚠️  Unexpected status: ${res.statusCode}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`   ❌ Webhook test failed: ${error.message}\n`);
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('   ⚠️  Webhook test timeout\n');
      resolve(false);
    });

    req.write(JSON.stringify({ test: true, timestamp: Date.now() }));
    req.end();
  });
}

// Main execution
async function main() {
  // Try EC2 Instance Connect first
  let success = await restartViaInstanceConnect();
  
  // Fallback to SSM if Instance Connect fails
  if (!success) {
    console.log('🔄 Falling back to AWS SSM...\n');
    success = await restartViaSSM();
  }
  
  if (!success) {
    console.log('❌ Failed to restart container via both methods');
    console.log('\n💡 Manual restart required:');
    console.log('   ssh ubuntu@n8n.pbradygeorgen.com');
    console.log('   cd /opt/n8n');
    console.log('   docker-compose restart n8n\n');
    process.exit(1);
  }
  
  // Test webhook after restart
  const webhookWorking = await testWebhookAfterRestart();
  
  // Final summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 RESTART SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Container Restart: ${success ? '✅ Success' : '❌ Failed'}`);
  console.log(`Webhook Status: ${webhookWorking ? '✅ Registered' : '⚠️  Not registered'}\n`);
  
  if (success && webhookWorking) {
    console.log('🎉 n8n container restarted and webhooks are registered!\n');
    console.log('✅ RAG system should now be fully operational.\n');
    console.log('🧪 Run test suite to verify:');
    console.log('   node scripts/test-rag-system-e2e.js\n');
  } else if (success && !webhookWorking) {
    console.log('⚠️  Container restarted but webhooks not registered yet.\n');
    console.log('💡 Next steps:');
    console.log('   1. Wait 60 seconds for webhook registration');
    console.log('   2. Run: node scripts/force-webhook-reregistration.js');
    console.log('   3. Test: node scripts/test-rag-system-e2e.js\n');
  } else {
    console.log('❌ Restart failed. Manual intervention required.\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  console.error(error.stack);
  process.exit(1);
});

