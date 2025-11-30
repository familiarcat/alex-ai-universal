#!/usr/bin/env node

/**
 * 🔄 Complete Webhook Setup Automation
 * 
 * This script automates the complete process of:
 * 1. Setting WEBHOOK_URL on EC2 (via multiple methods)
 * 2. Restarting n8n
 * 3. Waiting for webhook registration
 * 4. Verifying webhooks are active
 * 5. Activating workflows
 * 6. Pushing milestone to RAG
 * 
 * Methods tried in order:
 * - AWS SSM (Systems Manager)
 * - SSH (if key available)
 * - Manual instructions (fallback)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

// Load credentials
function loadCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const credentials = {};
  
  // AWS credentials
  const awsAccessKey = zshrcContent.match(/export\s+AWS_ACCESS_KEY_ID=['"]?([^'"\s]+)['"]?/);
  const awsSecretKey = zshrcContent.match(/export\s+AWS_SECRET_ACCESS_KEY=['"]?([^'"\s]+)['"]?/);
  const awsRegion = zshrcContent.match(/export\s+AWS_REGION=['"]?([^'"\s]+)['"]?/);
  const instanceId = zshrcContent.match(/export\s+N8N_AWS_INSTANCE_ID=['"]?([^'"\s]+)['"]?/);
  
  credentials.aws = {
    accessKeyId: awsAccessKey ? awsAccessKey[1] : null,
    secretAccessKey: awsSecretKey ? awsSecretKey[1] : null,
    region: awsRegion ? awsRegion[1].replace(/"/g, '') : null,
    instanceId: instanceId ? instanceId[1] : null
  };
  
  // SSH credentials
  const sshKey = zshrcContent.match(/export\s+N8N_SSH_KEY=['"]?([^'"\s]+)['"]?/);
  const sshHost = zshrcContent.match(/export\s+N8N_SSH_HOST=['"]?([^'"\s]+)['"]?/);
  const sshUser = zshrcContent.match(/export\s+N8N_SSH_USER=['"]?([^'"\s]+)['"]?/);
  
  credentials.ssh = {
    key: sshKey ? sshKey[1] : path.join(process.env.HOME, '.ssh', 'AlexKeyPair.pem'),
    host: sshHost ? sshHost[1] : 'n8n.pbradygeorgen.com',
    user: sshUser ? sshUser[1] : 'ubuntu'
  };
  
  // N8N credentials
  const n8nUrl = zshrcContent.match(/export\s+N8N_URL=['"]?([^'"\s]+)['"]?/);
  credentials.n8n = {
    url: n8nUrl ? n8nUrl[1] : 'https://n8n.pbradygeorgen.com'
  };
  
  return credentials;
}

// Test AWS SSM access
function testAWSSSM(credentials) {
  try {
    const result = execSync(
      `aws ssm get-command-invocation --command-id test --instance-id ${credentials.aws.instanceId} 2>&1 || echo "SSM_NOT_CONFIGURED"`,
      { encoding: 'utf8', stdio: 'pipe' }
    );
    return !result.includes('SSM_NOT_CONFIGURED') && !result.includes('InvalidCommandId');
  } catch {
    return false;
  }
}

// Test SSH access
function testSSH(credentials) {
  try {
    const sshKey = credentials.ssh.key;
    if (!fs.existsSync(sshKey)) {
      return false;
    }
    
    const result = execSync(
      `ssh -i "${sshKey}" -o BatchMode=yes -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${credentials.ssh.user}@${credentials.ssh.host} "echo 'SSH_OK'" 2>&1`,
      { encoding: 'utf8', stdio: 'pipe', timeout: 5000 }
    );
    return result.includes('SSH_OK');
  } catch {
    return false;
  }
}

// Method 1: AWS SSM
async function fixViaSSM(credentials) {
  console.log('📡 Method 1: Attempting AWS SSM...\n');
  
  try {
    // Set AWS credentials
    process.env.AWS_ACCESS_KEY_ID = credentials.aws.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = credentials.aws.secretAccessKey;
    process.env.AWS_REGION = credentials.aws.region;
    process.env.AWS_DEFAULT_REGION = credentials.aws.region;
    
    const scriptPath = path.join(__dirname, 'fix-n8n-webhooks-automated.sh');
    const output = execSync(`bash "${scriptPath}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    if (output.includes('✅ N8N CONFIGURATION COMPLETE') || output.includes('✅ WEBHOOK IS REGISTERED')) {
      console.log('✅ AWS SSM method succeeded!\n');
      return true;
    }
    
    console.log('⚠️  AWS SSM method had issues\n');
    return false;
  } catch (error) {
    console.log(`❌ AWS SSM method failed: ${error.message}\n`);
    return false;
  }
}

// Method 2: SSH
async function fixViaSSH(credentials) {
  console.log('🔐 Method 2: Attempting SSH...\n');
  
  try {
    const scriptPath = path.join(__dirname, 'fix-n8n-webhook-url.sh');
    const output = execSync(`bash "${scriptPath}"`, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: path.join(__dirname, '..')
    });
    
    if (output.includes('✅ N8N CONFIGURATION UPDATED')) {
      console.log('✅ SSH method succeeded!\n');
      return true;
    }
    
    console.log('⚠️  SSH method had issues\n');
    return false;
  } catch (error) {
    console.log(`❌ SSH method failed: ${error.message}\n`);
    return false;
  }
}

// Verify webhook is registered
function verifyWebhook(credentials, retries = 5) {
  return new Promise((resolve) => {
    const url = new URL('/webhook/knowledge-ingest', credentials.n8n.url);
    
    let attempts = 0;
    const check = () => {
      attempts++;
      
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      };
      
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode !== 404) {
            resolve({ success: true, statusCode: res.statusCode, attempt: attempts });
          } else if (attempts < retries) {
            setTimeout(check, 3000);
          } else {
            resolve({ success: false, statusCode: 404, attempt: attempts });
          }
        });
      });
      
      req.on('error', () => {
        if (attempts < retries) {
          setTimeout(check, 3000);
        } else {
          resolve({ success: false, statusCode: 0, attempt: attempts });
        }
      });
      
      req.on('timeout', () => {
        req.destroy();
        if (attempts < retries) {
          setTimeout(check, 3000);
        } else {
          resolve({ success: false, statusCode: 0, attempt: attempts });
        }
      });
      
      req.write(JSON.stringify({ test: true }));
      req.end();
    };
    
    check();
  });
}

// Generate manual instructions
function generateManualInstructions(credentials) {
  const instructions = {
    title: 'Manual WEBHOOK_URL Configuration',
    methods: []
  };
  
  // AWS Console method
  instructions.methods.push({
    name: 'AWS Console (Browser Terminal)',
    steps: [
      `1. Visit: https://${credentials.aws.region || 'us-east-2'}.console.aws.amazon.com/ec2/home?region=${credentials.aws.region || 'us-east-2'}#Instances:instanceId=${credentials.aws.instanceId}`,
      '2. Click on the instance',
      '3. Click "Connect" → "EC2 Instance Connect" → "Connect"',
      '4. Run these commands:',
      '',
      '```bash',
      'sudo mkdir -p /opt/n8n',
      'sudo tee /opt/n8n/.env >/dev/null <<EOF',
      'N8N_PROTOCOL=https',
      'N8N_HOST=n8n.pbradygeorgen.com',
      'N8N_PORT=5678',
      'WEBHOOK_URL=https://n8n.pbradygeorgen.com',
      'N8N_ENDPOINT_WEBHOOK=webhook',
      'N8N_ENDPOINT_WEBHOOK_TEST=webhook-test',
      'N8N_ENABLE_API=true',
      'GENERIC_TIMEZONE=UTC',
      'EOF',
      '',
      '# Or update existing file:',
      'sudo sed -i \'/^WEBHOOK_URL=/d\' /opt/n8n/.env',
      'echo "WEBHOOK_URL=https://n8n.pbradygeorgen.com" | sudo tee -a /opt/n8n/.env',
      '',
      '# Restart n8n',
      'sudo systemctl restart n8n || sudo docker restart n8n',
      'sleep 10',
      '```'
    ]
  });
  
  // SSH method
  if (fs.existsSync(credentials.ssh.key)) {
    instructions.methods.push({
      name: 'SSH (Command Line)',
      steps: [
        `1. Ensure SSH key exists: ${credentials.ssh.key}`,
        `2. Run: bash scripts/fix-n8n-webhook-url.sh`,
        '   Or manually:',
        `   ssh -i "${credentials.ssh.key}" ${credentials.ssh.user}@${credentials.ssh.host}`
      ]
    });
  }
  
  return instructions;
}

// Main execution
async function main() {
  console.log('🔄 Complete Webhook Setup Automation');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const credentials = loadCredentials();
  
  console.log('📋 Loaded Credentials:');
  console.log(`   AWS Region: ${credentials.aws.region || 'Not set'}`);
  console.log(`   EC2 Instance: ${credentials.aws.instanceId || 'Not set'}`);
  console.log(`   SSH Key: ${credentials.ssh.key} ${fs.existsSync(credentials.ssh.key) ? '✅' : '❌'}`);
  console.log(`   N8N URL: ${credentials.n8n.url}\n`);
  
  // Test available methods
  console.log('🔍 Testing Available Methods...\n');
  const ssmAvailable = testAWSSSM(credentials);
  const sshAvailable = testSSH(credentials);
  
  console.log(`   AWS SSM: ${ssmAvailable ? '✅ Available' : '❌ Not available'}`);
  console.log(`   SSH: ${sshAvailable ? '✅ Available' : '❌ Not available'}\n`);
  
  let success = false;
  
  // Try SSM first (most automated)
  if (ssmAvailable && credentials.aws.instanceId) {
    success = await fixViaSSM(credentials);
  }
  
  // Fallback to SSH
  if (!success && sshAvailable) {
    success = await fixViaSSH(credentials);
  }
  
  // Wait for n8n to restart
  if (success) {
    console.log('⏳ Waiting 20 seconds for n8n to fully restart...\n');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
    // Verify webhook
    console.log('🔍 Verifying webhook registration...\n');
    const verification = await verifyWebhook(credentials, 10);
    
    if (verification.success) {
      console.log(`✅ Webhook is registered! (HTTP ${verification.statusCode}, attempt ${verification.attempt})\n`);
      
      // Activate workflows and push milestone
      console.log('🚀 Proceeding with workflow activation and milestone push...\n');
      
      try {
        execSync('node scripts/pipeline-enhanced-activate-workflow.js', {
          encoding: 'utf8',
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
      } catch (error) {
        console.log('⚠️  Workflow activation had issues, but continuing...\n');
      }
      
      // Push milestone
      try {
        execSync('node scripts/push-milestone-to-rag.js MILESTONE_2025-11-19_OBSERVATION_LOUNGE_STATUS_BRIEFING.md', {
          encoding: 'utf8',
          stdio: 'inherit',
          cwd: path.join(__dirname, '..')
        });
      } catch (error) {
        console.log('⚠️  Milestone push had issues\n');
      }
      
      console.log('\n🎉 Complete automation finished!\n');
      process.exit(0);
    } else {
      console.log(`⚠️  Webhook still not registered after ${verification.attempt} attempts\n`);
    }
  }
  
  // If automation failed, provide manual instructions
  if (!success) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  AUTOMATION FAILED - Manual Configuration Required');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    const instructions = generateManualInstructions(credentials);
    console.log(`📋 ${instructions.title}:\n`);
    
    instructions.methods.forEach((method, i) => {
      console.log(`Method ${i + 1}: ${method.name}`);
      method.steps.forEach(step => console.log(`   ${step}`));
      console.log('');
    });
    
    // Save instructions to file
    const docPath = path.join(__dirname, '..', '.backup-ec2-emergency', 'MANUAL_WEBHOOK_SETUP_INSTRUCTIONS.md');
    fs.writeFileSync(docPath, `# ${instructions.title}\n\n` +
      instructions.methods.map((m, i) => 
        `## Method ${i + 1}: ${m.name}\n\n${m.steps.map(s => s.startsWith('```') ? s : `- ${s}`).join('\n')}\n`
      ).join('\n'));
    
    console.log(`📄 Instructions saved to: ${docPath}\n`);
  }
  
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Automation failed:', error);
  process.exit(1);
});

