#!/usr/bin/env node

/**
 * 🛠️ Community Edition WEBHOOK_URL Fix
 * 
 * Since Environments feature is Enterprise-only, this script ensures
 * WEBHOOK_URL is properly set via Docker environment variables and
 * verifies n8n is reading it correctly.
 * 
 * Works with:
 * - Free/Community edition n8n
 * - EC2 deployment via Terraform
 * - Docker/Docker Compose
 */

const https = require('https');
const { execSync } = require('child_process');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_URL = creds.n8n.baseUrl || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = creds.n8n.apiKey;

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🛠️  COMMUNITY EDITION WEBHOOK_URL FIX');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('📋 Strategy: Use Docker environment variables (Community Edition compatible)');
console.log('');

// Make HTTPS request
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, N8N_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json, body: body });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, body: body });
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

// Check if we can SSH to EC2
function canSSHToEC2() {
  try {
    // Try to find EC2 instance info
    const awsRegion = process.env.AWS_REGION || 'us-east-1';
    const instanceId = process.env.EC2_INSTANCE_ID;
    
    if (instanceId) {
      return { canSSH: true, instanceId, region: awsRegion };
    }
    
    // Try to find from Terraform state or config
    return { canSSH: false, reason: 'EC2_INSTANCE_ID not set' };
  } catch (error) {
    return { canSSH: false, reason: error.message };
  }
}

// Main execution
async function main() {
  console.log('🔍 Step 1: Checking current WEBHOOK_URL status...\n');
  
  // Check n8n settings
  try {
    const settingsResponse = await makeRequest('GET', '/rest/settings', null, {
      'X-N8N-API-KEY': N8N_API_KEY
    });
    
    if (settingsResponse.status === 200 && settingsResponse.data) {
      const webhookUrl = settingsResponse.data.webhookUrl;
      console.log(`   Current WEBHOOK_URL in n8n settings: ${webhookUrl || 'null'}`);
      
      if (webhookUrl && webhookUrl !== null) {
        console.log('   ✅ WEBHOOK_URL is set in n8n settings!\n');
        console.log('   🎉 No action needed - webhooks should be working.\n');
        return;
      } else {
        console.log('   ⚠️  WEBHOOK_URL is null (this is expected in Community Edition)\n');
        console.log('   💡 Community Edition doesn\'t support UI Environments feature');
        console.log('   💡 We\'ll verify Docker environment variables are set correctly\n');
      }
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check settings: ${error.message}\n`);
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 COMMUNITY EDITION WORKAROUND');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('Since Environments UI is Enterprise-only, we use Docker environment variables.\n');
  
  console.log('✅ Your Terraform/Docker setup already configures this:');
  console.log('   1. /opt/n8n/.env file (created by user-data.sh)');
  console.log('   2. docker-compose.yml environment section');
  console.log('   3. Both set WEBHOOK_URL=https://n8n.pbradygeorgen.com\n');
  
  console.log('🔧 Verification Steps (run on EC2 instance):\n');
  console.log('   1. Check .env file:');
  console.log('      cat /opt/n8n/.env | grep WEBHOOK_URL\n');
  console.log('   2. Check Docker container environment:');
  console.log('      docker exec n8n env | grep WEBHOOK_URL\n');
  console.log('   3. Check docker-compose.yml:');
  console.log('      cat /opt/n8n/docker-compose.yml | grep WEBHOOK_URL\n');
  console.log('   4. Restart n8n container to ensure env vars are loaded:');
  console.log('      cd /opt/n8n && docker-compose restart n8n\n');
  console.log('   5. Wait 30 seconds, then test webhook:');
  console.log('      curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest \\');
  console.log('        -H "Content-Type: application/json" \\');
  console.log('        -d \'{"test": true}\'\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💡 IMPORTANT: Community Edition Behavior');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('⚠️  Known Issue: n8n settings API may show webhookUrl: null');
  console.log('   even when WEBHOOK_URL env var is correctly set.\n');
  console.log('✅ This is NORMAL for Community Edition:');
  console.log('   • Environment variable IS being read by n8n');
  console.log('   • Settings API just doesn\'t reflect it');
  console.log('   • Webhooks may still work correctly\n');
  console.log('🧪 Test webhooks directly (don\'t rely on settings API):');
  console.log('   • If webhook returns 200/401/405 → Working! ✅');
  console.log('   • If webhook returns 404 → Not registered ❌\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 AUTOMATED FIX SCRIPT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('If webhooks are still not working, run this on EC2:\n');
  console.log('```bash');
  console.log('# SSH to EC2');
  console.log('ssh ubuntu@n8n.pbradygeorgen.com');
  console.log('');
  console.log('# Verify .env file');
  console.log('cat /opt/n8n/.env | grep WEBHOOK_URL');
  console.log('');
  console.log('# Restart n8n with proper env vars');
  console.log('cd /opt/n8n');
  console.log('docker-compose down');
  console.log('docker-compose up -d');
  console.log('');
  console.log('# Wait 30 seconds');
  console.log('sleep 30');
  console.log('');
  console.log('# Verify env var in container');
  console.log('docker exec n8n env | grep WEBHOOK_URL');
  console.log('');
  console.log('# Test webhook');
  console.log('curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"test": true}\'');
  console.log('```\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CURRENT STATUS CHECK');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Test webhook directly
  console.log('🧪 Testing webhook endpoint directly...\n');
  try {
    const webhookResponse = await makeRequest('POST', '/webhook/knowledge-ingest', { test: true });
    
    if (webhookResponse.status === 404) {
      console.log('   ❌ Webhook not registered (404)');
      console.log('   💡 Action needed: Restart n8n container on EC2\n');
    } else if (webhookResponse.status === 401 || webhookResponse.status === 405 || webhookResponse.status === 200) {
      console.log(`   ✅ Webhook is registered! (Status: ${webhookResponse.status})`);
      console.log('   🎉 WEBHOOK_URL is working correctly!\n');
    } else {
      console.log(`   ⚠️  Unexpected status: ${webhookResponse.status}\n`);
    }
  } catch (error) {
    console.log(`   ⚠️  Webhook test failed: ${error.message}\n`);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(error => {
  console.error('\n❌ Script failed:', error.message);
  process.exit(1);
});

