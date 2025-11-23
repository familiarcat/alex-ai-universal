#!/usr/bin/env node

/**
 * 🚀 INITIALIZE CREW WEBHOOKS
 * 
 * Manually executes each crew workflow to force webhook registration in n8n
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

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
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    if (postData) req.write(postData);
    req.end();
  });
}

async function executeWorkflow(workflowId, workflowName) {
  try {
    console.log(`   🚀 Executing: ${workflowName}`);
    
    // Execute the workflow manually with test data
    const result = await httpsRequest(`${N8N_URL}/api/v1/workflows/${workflowId}/activate`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': N8N_API_KEY,
        'Content-Type': 'application/json'
      }
    }, JSON.stringify({}));
    
    if (result.statusCode >= 200 && result.statusCode < 300) {
      console.log(`   ✅ ${workflowName}: Webhook initialized`);
      return { success: true };
    } else {
      console.log(`   ⚠️  ${workflowName}: Status ${result.statusCode}`);
      return { success: false, status: result.statusCode };
    }
  } catch (error) {
    console.log(`   ❌ ${workflowName}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testWebhook(webhookPath, name) {
  try {
    const result = await httpsRequest(`${N8N_URL}/webhook/${webhookPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ message: 'Test initialization' }));
    
    return result.statusCode !== 404;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║   🚀 INITIALIZING CREW WEBHOOKS                                      ║');
  console.log('║                                                                        ║');
  console.log('║   Forcing webhook registration via workflow execution                 ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  
  // Get all workflows
  console.log('📊 Fetching workflows...\n');
  const result = await httpsRequest(`${N8N_URL}/api/v1/workflows`, {
    method: 'GET',
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  
  const workflows = result.data.data;
  const crewWorkflows = workflows.filter(w => w.name.includes('CREW -'));
  const coordWorkflows = workflows.filter(w => w.name.includes('COORDINATION - Observation Lounge'));
  
  console.log(`Found ${crewWorkflows.length} crew workflows\n`);
  
  // Execute each workflow to initialize webhooks
  console.log('🚀 Step 1: Executing workflows to initialize webhooks...\n');
  
  for (const workflow of [...crewWorkflows, ...coordWorkflows]) {
    await executeWorkflow(workflow.id, workflow.name);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay for initialization
  }
  
  // Wait for webhooks to fully register
  console.log('\n⏳ Waiting for webhook registration (10 seconds)...\n');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Test webhooks
  console.log('🧪 Step 2: Testing webhook registration...\n');
  
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
    const isWorking = await testWebhook(webhook.path, webhook.name);
    testResults.push({ ...webhook, working: isWorking });
    console.log(`   ${isWorking ? '✅' : '❌'} ${webhook.name.padEnd(25)} ${isWorking ? 'CONNECTED' : 'NOT REGISTERED'}`);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║   📊 WEBHOOK INITIALIZATION COMPLETE                                 ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');
  
  const workingWebhooks = testResults.filter(r => r.working).length;
  const totalWebhooks = testResults.length;
  const successRate = (workingWebhooks / totalWebhooks * 100).toFixed(1);
  
  console.log(`   Webhooks Working:       ${workingWebhooks}/${totalWebhooks} (${successRate}%)\n`);
  
  if (workingWebhooks === totalWebhooks) {
    console.log('   ✅ ALL WEBHOOKS OPERATIONAL!\n');
    console.log('   🎯 Ready for observation lounge meeting:');
    console.log('      node scripts/observation-lounge-meeting.js\n');
  } else if (workingWebhooks > 0) {
    console.log('   ⚠️  Some webhooks operational, others may need manual activation\n');
    console.log('   💡 Try opening non-working workflows in n8n UI and clicking "Execute Workflow"\n');
  } else {
    console.log('   ❌ Webhooks still not registered\n');
    console.log('   💡 RECOMMENDATIONS:\n');
    console.log('   1. Check n8n environment variables:');
    console.log('      - WEBHOOK_URL should be set to: https://n8n.pbradygeorgen.com/');
    console.log('      - N8N_PATH should be set if n8n is behind a proxy');
    console.log('');
    console.log('   2. Restart n8n service:');
    console.log('      sudo systemctl restart n8n');
    console.log('');
    console.log('   3. Manually open each workflow in n8n UI and save it');
    console.log('');
  }
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});

