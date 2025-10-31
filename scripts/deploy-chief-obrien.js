#!/usr/bin/env node
/**
 * Deploy Chief Miles O'Brien to n8n.pbradygeorgen.com
 * 
 * Creates and activates the pragmatic engineering crew member
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Load environment
function env(key, fallback = '') {
  return process.env[key] || fallback;
}

// HTTP Request Helper
function requestJSON(method, urlString, apiKey, body) {
  const url = new URL(urlString);
  const payload = body ? Buffer.from(JSON.stringify(body)) : null;
  
  const options = {
    hostname: url.hostname,
    port: url.port || 443,
    path: url.pathname + (url.search || ''),
    method,
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  };
  
  if (payload) options.headers['Content-Length'] = payload.length;
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('');
  console.log('🔧 CHIEF MILES O\'BRIEN DEPLOYMENT');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('Deploying the most pragmatic engineer to n8n...');
  console.log('');
  
  // Load credentials
  const N8N_URL = env('N8N_URL', 'https://n8n.pbradygeorgen.com');
  const N8N_API_KEY = env('N8N_API_KEY');
  
  if (!N8N_API_KEY) {
    console.error('❌ N8N_API_KEY not found in environment');
    console.error('   Run: source ~/.zshrc or npm run engage');
    process.exit(1);
  }
  
  // Load workflow
  const workflowPath = path.join(__dirname, '..', 'n8n-workflows', 'crew-workflows', 'crew-chief-miles-obrien-pragmatic-solutions-openrouter-production.json');
  
  if (!fs.existsSync(workflowPath)) {
    console.error(`❌ Workflow file not found: ${workflowPath}`);
    process.exit(1);
  }
  
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  console.log(`📄 Loaded workflow: ${workflow.name}`);
  console.log('');
  
  // Check if workflow already exists
  console.log('[1/4] Checking for existing Chief O\'Brien workflow...');
  const listResp = await requestJSON('GET', `${N8N_URL}/api/v1/workflows`, N8N_API_KEY);
  const workflows = Array.isArray(listResp.data) ? listResp.data : (listResp.data?.data || []);
  const existing = workflows.find(w => w.name === workflow.name);
  
  let workflowId;
  
  if (existing) {
    console.log(`   ✅ Found existing workflow: ${existing.id}`);
    console.log('');
    console.log('[2/4] Workflow already exists, skipping to activation...');
    workflowId = existing.id;
  } else {
    console.log('   ℹ️  No existing workflow found');
    console.log('');
    console.log('[2/4] Creating new Chief O\'Brien workflow...');
    
    const createResp = await requestJSON('POST', `${N8N_URL}/api/v1/workflows`, N8N_API_KEY, workflow);
    
    if (createResp.status >= 400) {
      console.error(`❌ Creation failed: ${createResp.status}`);
      console.error(JSON.stringify(createResp.data, null, 2));
      process.exit(1);
    }
    
    workflowId = createResp.data?.id || createResp.data?.data?.id;
    console.log(`   ✅ Workflow created: ${workflowId}`);
  }
  
  console.log('');
  console.log('[3/4] Activating Chief O\'Brien workflow...');
  
  // Get current workflow and activate (use PATCH for simpler activation)
  const activeResp = await requestJSON('PATCH', `${N8N_URL}/api/v1/workflows/${workflowId}`, N8N_API_KEY, {
    active: true
  });
  
  if (activeResp.status >= 400) {
    console.error(`❌ Activation failed: ${activeResp.status}`);
    console.error(JSON.stringify(activeResp.data, null, 2));
    process.exit(1);
  }
  
  console.log('   ✅ Workflow activated successfully');
  console.log('');
  
  // Test the webhook
  console.log('[4/4] Testing Chief O\'Brien webhook...');
  
  const testPayload = {
    userRequest: "We have a complex architecture decision - should we use cookies or Supabase for theme persistence?",
    context: {
      currentApproach: "Cookies + localStorage + Supabase (3 layers)",
      issue: "Over-engineered, complex",
      systemType: "dashboard"
    },
    timestamp: new Date().toISOString()
  };
  
  try {
    const testResp = await requestJSON('POST', `${N8N_URL}/webhook/crew-chief-obrien`, null, testPayload);
    
    if (testResp.status === 200 && testResp.data?.choices) {
      console.log('   ✅ Webhook test successful!');
      console.log('');
      console.log('🔧 Chief O\'Brien says:');
      console.log('   ─────────────────────────────────────');
      const response = testResp.data.choices[0].message.content;
      console.log('   ' + response.split('\\n').slice(0, 5).join('\\n   '));
      console.log('   ─────────────────────────────────────');
    } else {
      console.log('   ⚠️  Webhook test returned unexpected response');
      console.log('   Status:', testResp.status);
    }
  } catch (error) {
    console.log('   ⚠️  Webhook test failed (workflow may need manual activation)');
    console.log('   Error:', error.message);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('✅ CHIEF O\'BRIEN DEPLOYMENT COMPLETE!');
  console.log('═══════════════════════════════════════');
  console.log('');
  console.log('Deployment Summary:');
  console.log(`  • Workflow ID: ${workflowId}`);
  console.log(`  • Webhook URL: ${N8N_URL}/webhook/crew-chief-obrien`);
  console.log(`  • Status: Active ✅`);
  console.log(`  • Integration: Full Alex AI + n8n + Supabase`);
  console.log('');
  console.log('Chief O\'Brien is now available for:');
  console.log('  - Pragmatic solution suggestions');
  console.log('  - Cutting through over-engineering');
  console.log('  - Quick fix recommendations');
  console.log('  - Real-world tradeoff analysis');
  console.log('  - "Just make it work" approaches');
  console.log('');
  console.log('🖖 Live long and prosper with pragmatic engineering!');
  console.log('');
}

main().catch(err => {
  console.error('');
  console.error('❌ Deployment failed:', err.message || err);
  console.error('');
  process.exit(1);
});

