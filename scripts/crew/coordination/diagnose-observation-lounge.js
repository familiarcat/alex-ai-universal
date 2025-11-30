#!/usr/bin/env node

/**
 * Diagnose observation lounge system
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Extract credentials
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1];
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];

async function httpsRequest(url, options, postData = null) {
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
    if (postData) req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('\n🔍 OBSERVATION LOUNGE DIAGNOSTICS\n');
  
  // Get all workflows
  const result = await httpsRequest(`${N8N_URL}/api/v1/workflows`, {
    method: 'GET',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  const workflows = result.data.data;
  
  console.log(`Total workflows in n8n: ${workflows.length}\n`);
  
  // Find crew workflows
  const crewWorkflows = workflows.filter(w => w.name.includes('CREW -'));
  const coordWorkflows = workflows.filter(w => w.name.includes('COORDINATION -'));
  
  console.log('👥 CREW MEMBER WORKFLOWS:\n');
  crewWorkflows.forEach(w => {
    console.log(`   ${w.active ? '✅' : '❌'} ${w.name}`);
    console.log(`      ID: ${w.id}`);
    console.log(`      Active: ${w.active}`);
    console.log(`      Nodes: ${w.nodes?.length || 0}`);
    
    // Find webhook nodes
    const webhooks = w.nodes?.filter(n => n.type === 'n8n-nodes-base.webhook') || [];
    if (webhooks.length > 0) {
      webhooks.forEach(wh => {
        const path = wh.parameters?.path || 'unknown';
        console.log(`      Webhook: /webhook/${path}`);
      });
    }
    console.log('');
  });
  
  console.log('\n🏛️  COORDINATION WORKFLOWS:\n');
  coordWorkflows.forEach(w => {
    console.log(`   ${w.active ? '✅' : '❌'} ${w.name}`);
    console.log(`      ID: ${w.id}`);
    console.log(`      Active: ${w.active}`);
    console.log(`      Nodes: ${w.nodes?.length || 0}`);
    
    // Find webhook nodes
    const webhooks = w.nodes?.filter(n => n.type === 'n8n-nodes-base.webhook') || [];
    if (webhooks.length > 0) {
      webhooks.forEach(wh => {
        const path = wh.parameters?.path || 'unknown';
        console.log(`      Webhook: /webhook/${path}`);
      });
    }
    console.log('');
  });
  
  // Test each crew webhook
  console.log('\n🧪 TESTING CREW WEBHOOKS:\n');
  
  const crewWebhooks = [
    'crew-captain-jean-luc-picard',
    'crew-commander-data',
    'crew-commander-william-riker',
    'crew-lieutenant-commander-geordi-la-forge',
    'crew-lieutenant-worf',
    'crew-counselor-deanna-troi',
    'crew-dr-beverly-crusher',
    'crew-lieutenant-uhura',
    'crew-quark',
    'crew-chief-obrien'
  ];
  
  for (const webhook of crewWebhooks) {
    try {
      const testResult = await httpsRequest(`${N8N_URL}/webhook/${webhook}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, JSON.stringify({ message: 'Test' }));
      
      if (testResult.statusCode === 200) {
        console.log(`   ✅ ${webhook}: Working`);
      } else if (testResult.statusCode === 404) {
        console.log(`   ❌ ${webhook}: Not registered`);
      } else {
        console.log(`   ⚠️  ${webhook}: Status ${testResult.statusCode}`);
      }
    } catch (error) {
      console.log(`   ❌ ${webhook}: Error - ${error.message}`);
    }
  }
  
  console.log('\n📊 DIAGNOSIS COMPLETE\n');
}

main().catch(console.error);

