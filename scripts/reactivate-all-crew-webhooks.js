#!/usr/bin/env node

/**
 * 🔄 REACTIVATE ALL CREW WEBHOOKS
 * 
 * Forces webhook re-registration by deactivating and reactivating all workflows
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Extract credentials
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const N8N_URL = zshrc.match(/export N8N_URL="([^"]+)"/)?.[1];
const N8N_API_KEY = zshrc.match(/export N8N_API_KEY="([^"]+)"/)?.[1];

if (!N8N_URL || !N8N_API_KEY) {
  console.error('❌ Missing N8N credentials in ~/.zshrc');
  process.exit(1);
}

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
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    if (postData) req.write(postData);
    req.end();
  });
}

async function reactivateWorkflow(workflow) {
  const { id, name } = workflow;
  
  try {
    // Step 1: Deactivate
    console.log(`   🔄 ${name}...`);
    await httpsRequest(`${N8N_URL}/api/v1/workflows/${id}`, {
      method: 'PATCH',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({ active: false }));
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 2: Reactivate
    await httpsRequest(`${N8N_URL}/api/v1/workflows/${id}`, {
      method: 'PATCH',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({ active: true }));
    
    console.log(`   ✅ ${name}: Webhook re-registered`);
    return { success: true, name };
  } catch (error) {
    console.log(`   ❌ ${name}: ${error.message}`);
    return { success: false, name, error: error.message };
  }
}

async function testWebhook(webhookPath) {
  try {
    const result = await httpsRequest(`${N8N_URL}/webhook/${webhookPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ message: 'Connection test' }));
    
    return result.statusCode !== 404;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║   🔄 REACTIVATING ALL CREW WEBHOOKS                                  ║');
  console.log('║                                                                        ║');
  console.log('║   Forces webhook re-registration for observation lounge system        ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  
  // Get all workflows
  console.log('📊 Step 1: Fetching workflows from n8n...\n');
  const result = await httpsRequest(`${N8N_URL}/api/v1/workflows`, {
    method: 'GET',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  const workflows = result.data.data;
  const crewWorkflows = workflows.filter(w => w.name.includes('CREW -'));
  const coordWorkflows = workflows.filter(w => w.name.includes('COORDINATION -'));
  
  console.log(`   Found ${crewWorkflows.length} crew workflows`);
  console.log(`   Found ${coordWorkflows.length} coordination workflows\n`);
  
  // Reactivate crew workflows
  console.log('👥 Step 2: Reactivating crew member workflows...\n');
  const crewResults = [];
  for (const workflow of crewWorkflows) {
    const result = await reactivateWorkflow(workflow);
    crewResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Reactivate coordination workflows
  console.log('\n🏛️  Step 3: Reactivating coordination workflows...\n');
  const coordResults = [];
  for (const workflow of coordWorkflows) {
    const result = await reactivateWorkflow(workflow);
    coordResults.push(result);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Test webhooks
  console.log('\n🧪 Step 4: Testing webhook registration...\n');
  
  const webhooksToTest = [
    { name: 'Captain Picard', path: 'crew-captain-jean-luc-picard' },
    { name: 'Commander Data', path: 'crew-commander-data' },
    { name: 'Commander Riker', path: 'crew-commander-william-riker' },
    { name: 'Geordi La Forge', path: 'crew-lieutenant-commander-geordi-la-forge' },
    { name: 'Lieutenant Worf', path: 'crew-lieutenant-worf' },
    { name: 'Counselor Troi', path: 'crew-counselor-deanna-troi' },
    { name: 'Dr. Crusher', path: 'crew-dr-beverly-crusher' },
    { name: 'Lieutenant Uhura', path: 'crew-lieutenant-uhura' },
    { name: 'Chief O\'Brien', path: 'crew-chief-obrien' },
    { name: 'Observation Lounge', path: 'observation-lounge' }
  ];
  
  const testResults = [];
  for (const webhook of webhooksToTest) {
    const isWorking = await testWebhook(webhook.path);
    testResults.push({ ...webhook, working: isWorking });
    console.log(`   ${isWorking ? '✅' : '❌'} ${webhook.name.padEnd(25)} ${isWorking ? 'CONNECTED' : 'NOT REGISTERED'}`);
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║   📊 REACTIVATION COMPLETE                                           ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  
  const workingWebhooks = testResults.filter(r => r.working).length;
  const totalWebhooks = testResults.length;
  const successRate = (workingWebhooks / totalWebhooks * 100).toFixed(1);
  
  console.log(`   Workflows Reactivated:  ${crewResults.length + coordResults.length}`);
  console.log(`   Webhooks Working:       ${workingWebhooks}/${totalWebhooks} (${successRate}%)`);
  
  if (workingWebhooks === totalWebhooks) {
    console.log('\n   ✅ ALL SYSTEMS OPERATIONAL!');
    console.log('\n   🎯 Ready for observation lounge meeting:');
    console.log('      node scripts/observation-lounge-meeting.js\n');
  } else {
    console.log('\n   ⚠️  Some webhooks still not working');
    console.log('   💡 This may require manual activation via n8n UI\n');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});

