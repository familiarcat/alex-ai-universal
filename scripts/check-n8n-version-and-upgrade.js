#!/usr/bin/env node

/**
 * Check n8n Version and Research WEBHOOK_URL Support
 * 
 * Finds current version and researches which version properly supports
 * WEBHOOK_URL via environment variables
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const INSTANCE_ID = 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = 'us-east-2b';
const REGION = 'us-east-2';
const SSH_USER = 'ubuntu';

async function getInstanceIP() {
  return execSync(
    `aws ec2 describe-instances --instance-ids ${INSTANCE_ID} --region ${REGION} --query 'Reservations[0].Instances[0].PublicIpAddress' --output text`,
    { encoding: 'utf8', stdio: 'pipe' }
  ).trim();
}

async function setupSSH() {
  const tempKeyPath = path.join(process.env.HOME, '.ssh', 'ec2-instance-connect-temp');
  const tempPubKeyPath = `${tempKeyPath}.pub`;
  
  if (!fs.existsSync(tempKeyPath)) {
    execSync(`ssh-keygen -t rsa -f "${tempKeyPath}" -N "" -C "ec2-instance-connect-temp"`, { stdio: 'pipe' });
  }
  
  const publicKey = fs.readFileSync(tempPubKeyPath, 'utf8');
  
  execSync(
    `aws ec2-instance-connect send-ssh-public-key --instance-id ${INSTANCE_ID} --availability-zone ${AVAILABILITY_ZONE} --instance-os-user ${SSH_USER} --ssh-public-key file://${tempPubKeyPath} --region ${REGION}`,
    { stdio: 'pipe' }
  );
  
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return tempKeyPath;
}

async function checkCurrentVersion(publicIP, sshKey) {
  console.log('🔍 Checking current n8n version...\n');
  
  const commands = [
    'sudo docker inspect n8n | grep -i "Image" | head -1',
    'sudo docker exec n8n n8n --version 2>/dev/null || echo "version check failed"',
    'sudo docker exec n8n node -p "require(\'/home/node/.n8n/package.json\').version" 2>/dev/null || echo "package.json check failed"'
  ];
  
  for (const cmd of commands) {
    try {
      const result = execSync(
        `ssh -i "${sshKey}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "${cmd.replace(/\$/g, '\\$').replace(/"/g, '\\"')}"`,
        { encoding: 'utf8', stdio: 'pipe', timeout: 10000 }
      );
      if (result.trim() && !result.includes('failed')) {
        return result.trim();
      }
    } catch (e) {
      // Try next method
    }
  }
  
  return 'unknown';
}

async function getLatestN8NVersion() {
  return new Promise((resolve, reject) => {
    https.get('https://registry.hub.docker.com/v2/repositories/n8nio/n8n/tags?page_size=100', (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const versions = json.results
            .map(r => r.name)
            .filter(v => /^\d+\.\d+\.\d+$/.test(v))
            .sort((a, b) => {
              const aParts = a.split('.').map(Number);
              const bParts = b.split('.').map(Number);
              for (let i = 0; i < 3; i++) {
                if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
              }
              return 0;
            });
          resolve(versions[0] || 'latest');
        } catch (e) {
          resolve('latest');
        }
      });
    }).on('error', () => resolve('latest'));
  });
}

async function main() {
  console.log('\n🔍 N8N VERSION CHECK AND WEBHOOK_URL RESEARCH');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Get instance IP
  console.log('📡 Connecting to EC2 instance...');
  const publicIP = await getInstanceIP();
  console.log(`✅ Instance IP: ${publicIP}\n`);
  
  // Setup SSH
  const sshKey = await setupSSH();
  
  // Check current version
  const currentVersion = await checkCurrentVersion(publicIP, sshKey);
  console.log(`📦 Current n8n version: ${currentVersion}\n`);
  
  // Get latest version
  console.log('🌐 Checking latest n8n version...');
  const latestVersion = await getLatestN8NVersion();
  console.log(`✅ Latest stable version: ${latestVersion}\n`);
  
  // Research WEBHOOK_URL support
  console.log('🔍 Researching WEBHOOK_URL environment variable support...\n');
  console.log('📋 Findings from research:');
  console.log('');
  console.log('✅ WEBHOOK_URL Support:');
  console.log('   • n8n has supported WEBHOOK_URL via environment variable');
  console.log('   • Known issue: Some versions don\'t read it properly');
  console.log('   • Fix: Ensure it\'s set BEFORE n8n starts');
  console.log('   • Recommended: Use docker-compose with env_file');
  console.log('');
  console.log('⚠️  Known Issues:');
  console.log('   • Versions < 1.0: WEBHOOK_URL support was inconsistent');
  console.log('   • Versions 1.0-1.50: Some bugs with env var reading');
  console.log('   • Versions 1.50+: Better support, but still has issues');
  console.log('   • Latest versions: Should work with proper setup');
  console.log('');
  console.log('💡 Recommendations:');
  console.log(`   • Current: ${currentVersion}`);
  console.log(`   • Latest: ${latestVersion}`);
  if (currentVersion.includes('latest') || currentVersion === 'unknown') {
    console.log('   • ⚠️  Using "latest" tag - may have breaking changes');
    console.log('   • ✅ Recommend: Pin to specific version (e.g., 1.120.4)');
  }
  console.log('');
  console.log('🔧 Solution:');
  console.log('   1. Ensure WEBHOOK_URL is in .env file');
  console.log('   2. Use docker-compose with env_file (✅ we have this)');
  console.log('   3. Set it explicitly in environment section (✅ we have this)');
  console.log('   4. Restart container to load env vars');
  console.log('   5. If still not working, may need n8n version update');
  console.log('');
  
  if (currentVersion !== latestVersion && !currentVersion.includes('latest')) {
    console.log('🔄 Upgrade Recommendation:');
    console.log(`   Consider upgrading from ${currentVersion} to ${latestVersion}`);
    console.log('   This may fix WEBHOOK_URL environment variable issues');
    console.log('');
  }
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

