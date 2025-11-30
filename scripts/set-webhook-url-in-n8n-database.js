#!/usr/bin/env node

/**
 * Set WEBHOOK_URL directly in n8n's database
 * 
 * This bypasses the environment variable reading bug in n8n
 * by setting it directly in the settings table
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INSTANCE_ID = 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = 'us-east-2b';
const REGION = 'us-east-2';
const SSH_USER = 'ubuntu';
const WEBHOOK_URL = 'https://n8n.pbradygeorgen.com';

async function main() {
  console.log('\n🔧 SET WEBHOOK_URL IN N8N DATABASE');
  console.log('════════════════════════════════════════════════\n');
  
  // Get public IP
  console.log('🔍 Getting EC2 instance public IP...');
  const publicIP = execSync(
    `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
    { encoding: 'utf8', stdio: 'pipe' }
  ).trim();
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
  execSync(
    `aws ec2-instance-connect send-ssh-public-key --instance-id ${INSTANCE_ID} --availability-zone ${AVAILABILITY_ZONE} --instance-os-user ${SSH_USER} --ssh-public-key file://${tempPubKeyPath} --region ${REGION}`,
    { stdio: 'pipe' }
  );
  console.log('✅ Key injected\n');
  
  // Wait for key
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Set WEBHOOK_URL in database
  console.log('💾 Setting WEBHOOK_URL in n8n database...\n');
  const dbCmd = `#!/bin/bash
set -e
echo "[EC2] Finding n8n database..."
# Database is mounted as volume, find it on host
DB_PATH=\$(sudo find /home/ubuntu/.n8n -name "database.sqlite" 2>/dev/null | head -1)
if [ -z "\$DB_PATH" ]; then
  # Try container volume mount path
  DB_PATH=\$(sudo docker inspect n8n | grep -A 10 "Mounts" | grep "Source" | head -1 | awk '{print \$2}' | tr -d '",')/database.sqlite
  if [ ! -f "\$DB_PATH" ]; then
    DB_PATH=""
  fi
fi

if [ -z "\$DB_PATH" ] || [ ! -f "\$DB_PATH" ]; then
  echo "[EC2] ❌ Database not found"
  exit 1
fi

echo "[EC2] Database found: \$DB_PATH"
echo "[EC2] Setting WEBHOOK_URL to: ${WEBHOOK_URL}"

# Install sqlite3 if needed
if ! command -v sqlite3 &> /dev/null; then
  echo "[EC2] Installing sqlite3..."
  sudo apt-get update -qq && sudo apt-get install -y sqlite3 >/dev/null 2>&1
fi

# Update or insert WEBHOOK_URL
sudo sqlite3 "\$DB_PATH" "INSERT OR REPLACE INTO settings (key, value) VALUES ('webhookUrl', '${WEBHOOK_URL}');" 2>/dev/null
if [ \$? -eq 0 ]; then
  echo "[EC2] ✅ Database updated"
else
  echo "[EC2] ⚠️  Update failed, trying UPDATE instead..."
  sudo sqlite3 "\$DB_PATH" "UPDATE settings SET value='${WEBHOOK_URL}' WHERE key='webhookUrl';" 2>/dev/null
  if [ \$? -eq 0 ]; then
    echo "[EC2] ✅ Database updated (UPDATE)"
  else
    echo "[EC2] ❌ Failed to update database"
    exit 1
  fi
fi

echo "[EC2] Verifying..."
VERIFY=\$(sudo sqlite3 "\$DB_PATH" "SELECT value FROM settings WHERE key='webhookUrl';" 2>/dev/null)
echo "[EC2] Current value: \$VERIFY"
echo "[EC2] ✅ Database update complete"
`;
  
  try {
    execSync(
      `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "${dbCmd.replace(/\$/g, '\\$').replace(/"/g, '\\"')}"`,
      { stdio: 'inherit', timeout: 60000 }
    );
    
    console.log('\n✅ WEBHOOK_URL set in database');
    console.log('🔄 Restarting n8n to load the setting...\n');
    
    // Restart n8n
    const restartCmd = `sudo docker restart n8n`;
    execSync(
      `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "${restartCmd.replace(/\$/g, '\\$').replace(/"/g, '\\"')}"`,
      { stdio: 'inherit', timeout: 30000 }
    );
    
    console.log('\n⏳ Waiting 30 seconds for n8n to restart...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('\n✅ Complete! WEBHOOK_URL should now be set in n8n.\n');
    
  } catch (error) {
    console.log(`\n❌ Failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

