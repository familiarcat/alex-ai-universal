#!/usr/bin/env node

/**
 * Restart n8n Docker container with --env-file flag
 * This ensures WEBHOOK_URL is properly loaded
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INSTANCE_ID = 'i-0afdf313f61f22df0';
const AVAILABILITY_ZONE = 'us-east-2b';
const REGION = 'us-east-2';
const SSH_USER = 'ubuntu';

async function main() {
  console.log('🔄 Restarting n8n Docker Container with --env-file\n');
  
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
  
  // Restart Docker container with env file
  console.log('🚀 Restarting Docker container with --env-file...\n');
  const restartCmd = `#!/bin/bash
set -e
echo '[EC2] Stopping n8n container...'
sudo docker stop n8n 2>/dev/null || true
echo '[EC2] Removing n8n container...'
sudo docker rm n8n 2>/dev/null || true
echo '[EC2] Killing any process on port 5678...'
sudo lsof -ti:5678 | xargs sudo kill -9 2>/dev/null || true
sleep 2
echo '[EC2] Starting n8n with --env-file...'
sudo docker run -d --name n8n --restart always -p 5678:5678 --env-file /opt/n8n/.env -v /home/ubuntu/.n8n:/home/node/.n8n n8nio/n8n:latest
echo '[EC2] ✅ Container restarted'
sleep 5
echo '[EC2] Container status:'
sudo docker ps --filter name=n8n --format '{{.Names}} - {{.Status}}'
`;
  
  try {
    execSync(
      `ssh -i "${tempKeyPath}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=10 ${SSH_USER}@${publicIP} "${restartCmd.replace(/\$/g, '\\$').replace(/"/g, '\\"')}"`,
      { stdio: 'inherit', timeout: 60000 }
    );
    
    console.log('\n✅ Docker container restarted with env file');
    console.log('⏳ Waiting 20 seconds for n8n to initialize...\n');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    // Check if webhookUrl is now set
    console.log('🔍 Verifying WEBHOOK_URL is loaded...');
    const https = require('https');
    const testResult = await new Promise((resolve) => {
      const req = https.request({
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/rest/settings',
        method: 'GET',
        headers: { 'X-N8N-API-KEY': process.env.N8N_OWNER_API_KEY || process.env.N8N_API_KEY || '' },
        timeout: 5000
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const json = JSON.parse(body);
            resolve({ webhookUrl: json.webhookUrl });
          } catch (e) {
            resolve({ webhookUrl: null });
          }
        });
      });
      req.on('error', () => resolve({ webhookUrl: null }));
      req.end();
    });
    
    if (testResult.webhookUrl) {
      console.log(`✅ WEBHOOK_URL is now set: ${testResult.webhookUrl}\n`);
    } else {
      console.log('⚠️  WEBHOOK_URL is still null - may need manual toggle in UI\n');
    }
    
  } catch (error) {
    console.log('\n❌ Failed to restart container:', error.message);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

