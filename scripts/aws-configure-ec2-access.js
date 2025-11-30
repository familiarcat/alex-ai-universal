#!/usr/bin/env node

/**
 * 🔧 AWS CLI EC2 Access Configuration
 * 
 * Uses AWS CLI to:
 * 1. Get EC2 instance details
 * 2. Identify the correct key pair name
 * 3. Configure SSH access
 * 4. Use SSM to configure WEBHOOK_URL (no SSH needed)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load credentials from ~/.zshrc
function loadCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const credentials = {};
  
  // Extract AWS credentials
  const awsAccessKey = zshrcContent.match(/export\s+AWS_ACCESS_KEY_ID=['"]?([^'"\s\n]+)['"]?/);
  const awsSecretKey = zshrcContent.match(/export\s+AWS_SECRET_ACCESS_KEY=['"]?([^'"\s\n]+)['"]?/);
  const awsRegion = zshrcContent.match(/export\s+AWS_REGION=['"]?([^'"\s\n]+)['"]?/);
  const instanceId = zshrcContent.match(/export\s+N8N_AWS_INSTANCE_ID=['"]?([^'"\s\n]+)['"]?/);
  
  credentials.aws = {
    accessKeyId: awsAccessKey ? awsAccessKey[1] : null,
    secretAccessKey: awsSecretKey ? awsSecretKey[1] : null,
    region: awsRegion ? awsRegion[1].replace(/"/g, '') : null,
    instanceId: instanceId ? instanceId[1] : null
  };
  
  return credentials;
}

// Set AWS environment variables
function setAWSEnv(credentials) {
  if (credentials.aws.accessKeyId) {
    process.env.AWS_ACCESS_KEY_ID = credentials.aws.accessKeyId;
  }
  if (credentials.aws.secretAccessKey) {
    process.env.AWS_SECRET_ACCESS_KEY = credentials.aws.secretAccessKey;
  }
  if (credentials.aws.region) {
    process.env.AWS_REGION = credentials.aws.region;
    process.env.AWS_DEFAULT_REGION = credentials.aws.region;
  }
}

// Get EC2 instance details
function getInstanceDetails(instanceId, region) {
  try {
    const command = `aws ec2 describe-instances --instance-ids ${instanceId} --region ${region} --query 'Reservations[0].Instances[0]' --output json`;
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return JSON.parse(output);
  } catch (error) {
    return null;
  }
}

// Get instance key pair name
function getKeyPairName(instance) {
  return instance?.KeyName || null;
}

// Check if SSM is available
function checkSSMAvailable(instanceId, region) {
  try {
    const command = `aws ssm describe-instance-information --filters "Key=InstanceIds,Values=${instanceId}" --region ${region} --query 'InstanceInformationList[0].InstanceId' --output text 2>&1`;
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return output.trim() === instanceId;
  } catch {
    return false;
  }
}

// Use SSM to configure WEBHOOK_URL
async function configureViaSSM(instanceId, region) {
  console.log('\n📡 Configuring WEBHOOK_URL via AWS SSM...\n');
  
  const script = `#!/bin/bash
set -e
echo "[SSM] Configuring n8n WEBHOOK_URL..."

# Ensure /opt/n8n/.env exists
if [ ! -f /opt/n8n/.env ]; then
  echo "[SSM] Creating /opt/n8n/.env..."
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
  echo "[SSM] ✅ Created /opt/n8n/.env"
else
  echo "[SSM] Updating WEBHOOK_URL..."
  sudo sed -i '/^WEBHOOK_URL=/d' /opt/n8n/.env
  echo "WEBHOOK_URL=https://n8n.pbradygeorgen.com" | sudo tee -a /opt/n8n/.env
  echo "[SSM] ✅ Updated WEBHOOK_URL"
fi

echo ""
echo "[SSM] Current /opt/n8n/.env:"
sudo cat /opt/n8n/.env
echo ""

# Restart n8n
echo "[SSM] Restarting n8n..."
if sudo systemctl restart n8n 2>/dev/null; then
  echo "[SSM] ✅ Restarted via systemd"
elif sudo docker restart n8n 2>/dev/null; then
  echo "[SSM] ✅ Restarted via Docker"
else
  echo "[SSM] ⚠️  Could not restart automatically"
fi

echo "[SSM] Waiting 5 seconds..."
sleep 5
echo "[SSM] ✅ Configuration complete!"
`;

  try {
    // Send command via SSM
    const command = `aws ssm send-command \
      --instance-ids ${instanceId} \
      --document-name "AWS-RunShellScript" \
      --parameters "commands=[$(echo '${script}' | jq -Rs .)]" \
      --region ${region} \
      --query 'Command.CommandId' \
      --output text 2>&1`;
    
    const commandId = execSync(command, { encoding: 'utf8', stdio: 'pipe' }).trim();
    
    if (!commandId || commandId === 'None' || commandId.includes('error')) {
      return { success: false, error: 'Failed to send SSM command' };
    }
    
    console.log(`✅ Command sent! ID: ${commandId}`);
    console.log('⏳ Waiting for execution (30 seconds max)...\n');
    
    // Wait for command to complete
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const statusCmd = `aws ssm get-command-invocation \
          --command-id ${commandId} \
          --instance-id ${instanceId} \
          --region ${region} \
          --query 'Status' \
          --output text 2>&1`;
        
        const status = execSync(statusCmd, { encoding: 'utf8', stdio: 'pipe' }).trim();
        
        if (status === 'Success') {
          console.log('✅ Command executed successfully!\n');
          
          // Get output
          const outputCmd = `aws ssm get-command-invocation \
            --command-id ${commandId} \
            --instance-id ${instanceId} \
            --region ${region} \
            --query 'StandardOutputContent' \
            --output text`;
          
          const output = execSync(outputCmd, { encoding: 'utf8', stdio: 'pipe' });
          console.log('📋 Output:');
          console.log(output);
          
          return { success: true, commandId };
        } else if (status === 'Failed') {
          const errorCmd = `aws ssm get-command-invocation \
            --command-id ${commandId} \
            --instance-id ${instanceId} \
            --region ${region} \
            --query 'StandardErrorContent' \
            --output text`;
          
          const error = execSync(errorCmd, { encoding: 'utf8', stdio: 'pipe' });
          return { success: false, error };
        }
      } catch {
        // Still pending
      }
      
      process.stdout.write('.');
    }
    
    console.log('\n⚠️  Command still pending after 30 seconds');
    return { success: false, error: 'Timeout' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Main execution
async function main() {
  console.log('🔧 AWS CLI EC2 Access Configuration');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  const credentials = loadCredentials();
  
  // If instance ID not in zshrc, try to find it from existing scripts or use default
  if (!credentials.aws.instanceId) {
    // Try to find from existing scripts
    try {
      const grepResult = execSync('grep -r "i-[0-9a-f]\\{17\\}" scripts/*.sh scripts/*.js 2>/dev/null | head -1', { encoding: 'utf8', stdio: 'pipe' });
      const match = grepResult.match(/i-[0-9a-f]{17}/);
      if (match) {
        credentials.aws.instanceId = match[0];
        console.log(`✅ Found instance ID from scripts: ${credentials.aws.instanceId}\n`);
      }
    } catch {
      // Try default instance ID
      credentials.aws.instanceId = 'i-0afdf313f61f22df0';
      console.log(`⚠️  Using default instance ID: ${credentials.aws.instanceId}\n`);
    }
  }
  
  if (!credentials.aws.instanceId) {
    console.log('❌ Instance ID not found');
    console.log('\nPlease set in ~/.zshrc:');
    console.log('  export N8N_AWS_INSTANCE_ID="i-xxxxx"');
    console.log('\nOr pass as argument:');
    console.log('  node scripts/aws-configure-ec2-access.js i-xxxxx');
    process.exit(1);
  }
  
  // Get region from AWS CLI if not in zshrc
  if (!credentials.aws.region) {
    try {
      const regionOutput = execSync('aws configure get region', { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (regionOutput) {
        credentials.aws.region = regionOutput;
      } else {
        credentials.aws.region = 'us-east-2'; // Default
      }
    } catch {
      credentials.aws.region = 'us-east-2'; // Default
    }
  }
  
  console.log('📋 Loaded Credentials:');
  console.log(`   Region: ${credentials.aws.region}`);
  console.log(`   Instance ID: ${credentials.aws.instanceId}\n`);
  
  // Set AWS environment (if credentials found)
  if (credentials.aws.accessKeyId) {
    setAWSEnv(credentials);
  } else {
    console.log('⚠️  No AWS credentials in ~/.zshrc, using AWS CLI default credentials...\n');
  }
  
  // Try to get region from AWS CLI config if not in zshrc
  if (!credentials.aws.region) {
    try {
      const regionOutput = execSync('aws configure get region', { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (regionOutput) {
        credentials.aws.region = regionOutput;
        process.env.AWS_REGION = regionOutput;
        process.env.AWS_DEFAULT_REGION = regionOutput;
        console.log(`✅ Using AWS CLI region: ${regionOutput}\n`);
      }
    } catch {
      // No region configured
    }
  }
  
  // Get instance details
  console.log('🔍 Getting EC2 instance details...');
  const instance = getInstanceDetails(credentials.aws.instanceId, credentials.aws.region);
  
  if (!instance) {
    console.log('❌ Failed to get instance details');
    console.log('   Check: AWS credentials, instance ID, region');
    process.exit(1);
  }
  
  console.log(`✅ Instance found: ${instance.InstanceId}`);
  console.log(`   State: ${instance.State.Name}`);
  console.log(`   Key Pair: ${instance.KeyName || 'Not set'}`);
  console.log(`   Public IP: ${instance.PublicIpAddress || 'Not set'}\n`);
  
  if (instance.State.Name !== 'running') {
    console.log('❌ Instance is not running!');
    console.log(`   Current state: ${instance.State.Name}`);
    process.exit(1);
  }
  
  // Check SSM availability
  console.log('🔍 Checking SSM availability...');
  const ssmAvailable = checkSSMAvailable(credentials.aws.instanceId, credentials.aws.region);
  
  if (ssmAvailable) {
    console.log('✅ SSM is available! (Best method - no SSH needed)\n');
    
    // Configure via SSM
    const result = await configureViaSSM(credentials.aws.instanceId, credentials.aws.region);
    
    if (result.success) {
      console.log('\n🎉 Configuration complete via SSM!');
      console.log('\n⏳ Waiting 10 seconds for n8n to restart...');
      await new Promise(resolve => setTimeout(resolve, 10000));
      
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
        console.log('\n🚀 Ready to push milestone!');
      } else {
        console.log(`⚠️  Webhook still not registered (HTTP ${testResult.status})`);
        console.log('   May need manual toggle in n8n UI');
      }
      
      process.exit(0);
    } else {
      console.log(`❌ SSM configuration failed: ${result.error}`);
    }
  } else {
    console.log('❌ SSM not available');
    console.log('\n💡 To enable SSM:');
    console.log('   1. Install SSM agent on EC2 instance');
    console.log('   2. Attach IAM role with AmazonSSMManagedInstanceCore policy');
    console.log('   3. Wait for instance to register with SSM');
  }
  
  // If SSM not available, provide key pair info
  if (instance.KeyName) {
    console.log(`\n📋 Key Pair Name: ${instance.KeyName}`);
    console.log(`\n🔍 Looking for matching key in ~/.ssh/...`);
    
    const sshDir = path.join(process.env.HOME, '.ssh');
    const keyFiles = fs.readdirSync(sshDir).filter(f => 
      f.includes(instance.KeyName.toLowerCase()) || 
      f.includes('n8n') ||
      f.endsWith('.pem')
    );
    
    if (keyFiles.length > 0) {
      console.log('   Found potential keys:');
      keyFiles.forEach(f => console.log(`     • ${f}`));
    } else {
      console.log('   No matching keys found');
      console.log(`\n💡 You may need to download the key pair "${instance.KeyName}" from AWS`);
    }
  }
  
  process.exit(1);
}

main().catch(error => {
  console.error('❌ Failed:', error.message);
  process.exit(1);
});

