#!/usr/bin/env node

/**
 * Check webhook configuration details
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1];
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];

async function httpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, data: data });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('\n🔍 WEBHOOK CONFIGURATION CHECK\n');
  
  // Get Captain Picard workflow details
  const result = await httpsRequest(`${N8N_URL}/api/v1/workflows`, {
    method: 'GET',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  const picard = result.data.data.find(w => w.name.includes('Captain Jean-Luc Picard'));
  
  if (!picard) {
    console.log('❌ Captain Picard workflow not found');
    return;
  }
  
  console.log(`Found workflow: ${picard.name}`);
  console.log(`ID: ${picard.id}`);
  console.log(`Active: ${picard.active}`);
  console.log(`\nWebhook nodes:\n`);
  
  picard.nodes.forEach(node => {
    if (node.type === 'n8n-nodes-base.webhook') {
      console.log(`Node: ${node.name}`);
      console.log(`Type: ${node.type}`);
      console.log(`Parameters:`, JSON.stringify(node.parameters, null, 2));
      console.log(`Position:`, node.position);
      console.log(`Webhook ID:`, node.webhookId);
      console.log('');
    }
  });
  
  // Check if n8n is in production mode
  console.log('\n📊 Testing webhook URLs:\n');
  
  const testWebhook = async (path) => {
    try {
      const res = await httpsRequest(`${N8N_URL}/webhook-test/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`   Test mode (/webhook-test/): ${res.statusCode}`);
    } catch (e) {
      console.log(`   Test mode (/webhook-test/): Error`);
    }
    
    try {
      const res = await httpsRequest(`${N8N_URL}/webhook/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      console.log(`   Production mode (/webhook/): ${res.statusCode}`);
    } catch (e) {
      console.log(`   Production mode (/webhook/): Error`);
    }
  };
  
  await testWebhook('crew-captain-jean-luc-picard');
  
  console.log('\n💡 DIAGNOSIS:\n');
  console.log('If test mode works but production mode returns 404:');
  console.log('- Webhooks are in test/development mode');
  console.log('- n8n may need WEBHOOK_URL environment variable set');
  console.log('- Workflows may need to be executed once to initialize production webhooks');
  console.log('');
}

main().catch(console.error);

