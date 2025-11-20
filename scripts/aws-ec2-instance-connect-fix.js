#!/usr/bin/env node

/**
 * 🔧 AWS EC2 Instance Connect - Configure WEBHOOK_URL
 * 
 * Uses EC2 Instance Connect to inject temporary SSH key and configure n8n
 * No permanent SSH keys needed - uses AWS API
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INSTANCE_ID = 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = 'us-east-2b';
const REGION = 'us-east-2';
const SSH_USER = 'ubuntu';

async function main() {
  console.log('🔧 AWS EC2 Instance Connect - Configure WEBHOOK_URL');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Get instance public IP
  console.log('🔍 Getting EC2 instance public IP...');
  const publicIP = execSync(
    `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
    { encoding: 'utf8', stdio: 'pipe' }
  ).trim();
  
  console.log(`✅ Instance IP: ${publicIP}\n`);
  
  // Generate temporary SSH key if needed
  const tempKeyPath = path.join(process.env.HOME, '.ssh', 'ec2-instance-connect-temp');
  const tempPubKeyPath = `${tempKeyPath}.pub`;
  
  if (!fs.existsSync(tempKeyPath)) {
    console.log('🔑 Generating temporary SSH key...');
    execSync(`ssh-keygen -t rsa -f "${tempKeyPath}" -N "" -C "ec2-instance-connect-temp"`, { stdio: 'pipe' });
    console.log('✅ Key generated\n');
  }
  
  // Read public key
  const publicKey = fs.readFileSync(tempPubKeyPath, 'utf8');
  
  // Inject SSH key via EC2 Instance Connect
  console.log('📤 Injecting SSH key via EC2 Instance Connect (60-second window)...');
  try {
    execSync(
      `aws ec2-instance-connect send-ssh-public-key \
        --instance-id ${INSTANCE_ID} \
        --availability-zone ${AVAILABILITY_ZONE} \
        --instance-os-user ${SSH_USER} \
        --ssh-public-key file://${tempPubKeyPath} \
        --region ${REGION}`,
      { stdio: 'inherit' }
    );
    console.log('✅ Key injected!\n');
  } catch (error) {
    console.log('❌ Failed to inject key:', error.message);
    process.exit(1);
  }
  
  // Wait a moment for key to be active
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Execute configuration commands
  console.log('🚀 Executing configuration commands...\n');
  
  const commands = `#!/bin/bash
set -e
echo "[EC2] Configuring n8n WEBHOOK_URL..."

# Ensure /opt/n8n/.env exists
if [ ! -f /opt/n8n/.env ]; then
  echo "[EC2] Creating /opt/n8n/.env..."
  sudo mkdir -p /opt/n8n
  sudo tee /opt/n8n/.env >/dev/null <<EOF
N8N_PROTOCOL=https
N8N_HOST=n8n.pbradygeorgen.com
N8N_PORT=5678
WEBHOOK_URL=https://n8n.pbradygeorgen.com
N8N_ENDPOINT_WEBHOOK=webhook
N8N_ENDPOINT_WEBHOOK_TEST=webhook-test
N8N_ENABLE_API=true
GENERIC_TIMEZONE=UTC
EOF
  echo "[EC2] ✅ Created /opt/n8n/.env"
else
  echo "[EC2] Updating WEBHOOK_URL..."
  sudo sed -i '/^WEBHOOK_URL=/d' /opt/n8n/.env
  echo "WEBHOOK_URL=https://n8n.pbradygeorgen.com" | sudo tee -a /opt/n8n/.env
  echo "[EC2] ✅ Updated WEBHOOK_URL"
fi

echo ""
echo "[EC2] Current /opt/n8n/.env:"
sudo cat /opt/n8n/.env
echo ""

# Restart n8n
echo "[EC2] Restarting n8n..."
if sudo systemctl restart n8n 2>/dev/null; then
  echo "[EC2] ✅ Restarted via systemd"
elif sudo docker restart n8n 2>/dev/null; then
  echo "[EC2] ✅ Restarted via Docker"
else
  echo "[EC2] ⚠️  Could not restart automatically"
fi

echo "[EC2] Waiting 5 seconds..."
sleep 5
echo "[EC2] ✅ Configuration complete!"
`;
  
  // Execute via SSH (key is valid for 60 seconds)
  try {
    execSync(
      `ssh -i "${tempKeyPath}" \
        -o StrictHostKeyChecking=no \
        -o UserKnownHostsFile=/dev/null \
        -o ConnectTimeout=10 \
        ${SSH_USER}@${publicIP} \
        "${commands.replace(/\$/g, '\\$').replace(/"/g, '\\"')}"`,
      { stdio: 'inherit', timeout: 30000 }
    );
    
    console.log('\n✅ Configuration complete!\n');
    
    // Wait for n8n to restart
    console.log('⏳ Waiting 15 seconds for n8n to fully restart...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // Verify webhook
    console.log('\n🔍 Verifying webhook...');
    const https = require('https');
    const testUrl = new URL('https://n8n.pbradygeorgen.com/webhook/knowledge-ingest');
    
    const testResult = await new Promise((resolve) => {
      const req = https.request({
        hostname: testUrl.hostname,
        port: 443,
        path: testUrl.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      }, (res) => {
        resolve({ status: res.statusCode, registered: res.statusCode !== 404 });
      });
      
      req.on('error', () => resolve({ status: 0, registered: false }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, registered: false });
      });
      
      req.write(JSON.stringify({ test: true }));
      req.end();
    });
    
    if (testResult.registered) {
      console.log(`✅ Webhook is registered! (HTTP ${testResult.status})`);
      console.log('\n🎉 Ready to push milestone!');
    } else {
      console.log(`⚠️  Webhook still not registered (HTTP ${testResult.status})`);
      console.log('   May need manual toggle in n8n UI');
    }
    
  } catch (error) {
    console.log('\n❌ SSH execution failed:', error.message);
    console.log('   The temporary key may have expired (60-second window)');
    console.log('   Try running the script again');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Failed:', error.message);
  process.exit(1);
});

