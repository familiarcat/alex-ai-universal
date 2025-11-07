#!/usr/bin/env node
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Alex AI Universal - Force n8n Webhook Registration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Team Gamma: Chief O'Brien (Pragmatic Fix) + Commander Data (Implementation)
// LLMs: Claude 3.7 Sonnet (Both)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// O'Brien's Insight:
// "The webhooks aren't registering because n8n's internal registry is stale.
// When you UPDATE a workflow via API, n8n re-registers its webhooks.
// So we fetch each workflow, make a tiny harmless change, and update it.
// This forces n8n to re-register the webhook. Simple."
//
// Strategy:
// 1. Fetch all crew workflows
// 2. For each workflow:
//    a) GET full workflow definition
//    b) Make tiny change (add/update a tag or meta field)
//    c) PUT workflow back
//    d) This triggers webhook re-registration
// 3. Verify all webhooks are healthy
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const axios = require('axios');

// Load from environment
const N8N_URL = process.env.N8N_URL || process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;

if (!N8N_API_KEY) {
  console.error('❌ N8N_API_KEY not found in environment');
  console.error('   Set it in ~/.zshrc or run: export N8N_API_KEY=your-key');
  process.exit(1);
}

const api = axios.create({
  baseURL: N8N_URL,
  headers: { 'X-N8N-API-KEY': N8N_API_KEY },
  timeout: 30000
});

// O'Brien's Pragmatic Sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function forceWebhookRegistration() {
  console.log('\n🔧 Chief O\'Brien\'s Webhook Registration Fix\n');
  console.log(`Target: ${N8N_URL}`);
  console.log('Strategy: Force re-registration by updating each workflow\n');

  try {
    // Step 1: Fetch all crew workflows
    console.log('📋 Step 1: Fetching crew workflows...');
    const { data: workflowsResponse } = await api.get('/api/v1/workflows');
    
    const crewWorkflows = workflowsResponse.data.filter(w => 
      w.name.includes('CREW') || 
      w.name.includes('COORDINATION') ||
      w.name.includes('Knowledge')
    );

    console.log(`   Found ${crewWorkflows.length} crew/coordination workflows\n`);

    // Step 2: Update each workflow to force webhook registration
    console.log('🔄 Step 2: Forcing webhook re-registration...');
    let successCount = 0;
    let failCount = 0;

    for (const workflow of crewWorkflows) {
      try {
        console.log(`   🔧 ${workflow.name.substring(0, 60)}...`);
        
        // O'Brien's Minimal Update Strategy:
        // Don't fetch full workflow - just deactivate and reactivate via API
        // This is simpler and forces webhook re-registration
        
        // Deactivate
        await api.post(`/api/v1/workflows/${workflow.id}/deactivate`);
        await sleep(1000);
        
        // Activate (this triggers webhook registration)
        await api.post(`/api/v1/workflows/${workflow.id}/activate`);
        
        console.log(`      ✅ Updated successfully`);
        successCount++;
        
        // Rate limiting: wait 2 seconds between updates
        await sleep(2000);
        
      } catch (error) {
        console.log(`      ❌ Failed: ${error.response?.data?.message || error.message}`);
        failCount++;
      }
    }

    console.log(`\n✅ Step 2 complete: ${successCount} successful, ${failCount} failed\n`);

    // Step 3: Wait for webhook registration
    console.log('⏳ Step 3: Waiting 10 seconds for webhook registration...');
    await sleep(10000);

    // Step 4: Verify webhook health
    console.log('\n🧪 Step 4: Verifying webhook health...\n');
    
    const webhooksToTest = [
      { name: 'Knowledge Ingest', path: 'knowledge-ingest' },
      { name: 'Knowledge Query', path: 'knowledge-query' },
      { name: 'Observation Lounge', path: 'observation-lounge' },
      { name: 'Captain Picard', path: 'crew-captain-jean-luc-picard' },
      { name: 'Commander Data', path: 'crew-commander-data' },
      { name: 'Geordi La Forge', path: 'crew-geordi-la-forge' },
      { name: 'Lieutenant Worf', path: 'crew-lieutenant-worf' },
      { name: 'Lieutenant Uhura', path: 'crew-lieutenant-uhura' },
      { name: 'Counselor Troi', path: 'crew-counselor-troi' },
      { name: 'Dr. Crusher', path: 'crew-dr-crusher' },
      { name: 'Chief O\'Brien', path: 'crew-chief-obrien' },
      { name: 'Commander Riker', path: 'crew-commander-riker' }
    ];

    let healthyCount = 0;
    let unhealthyCount = 0;

    for (const webhook of webhooksToTest) {
      try {
        await axios.post(`${N8N_URL}/webhook/${webhook.path}`, { test: true }, { timeout: 5000 });
        console.log(`   ✅ ${webhook.name.padEnd(25)} HEALTHY`);
        healthyCount++;
      } catch (error) {
        if (error.response && error.response.status !== 404) {
          console.log(`   ✅ ${webhook.name.padEnd(25)} HEALTHY (${error.response.status})`);
          healthyCount++;
        } else {
          console.log(`   ❌ ${webhook.name.padEnd(25)} NOT REGISTERED`);
          unhealthyCount++;
        }
      }
    }

    // Results
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Summary:');
    console.log(`   Total Webhooks: ${webhooksToTest.length}`);
    console.log(`   Healthy: ${healthyCount} ✅`);
    console.log(`   Unhealthy: ${unhealthyCount} ❌`);
    console.log(`   Health Rate: ${((healthyCount / webhooksToTest.length) * 100).toFixed(1)}%`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (healthyCount === webhooksToTest.length) {
      console.log('🎉 SUCCESS! All webhooks registered and healthy!\n');
      console.log('Next step:');
      console.log('  node scripts/store-crew-dashboard-observations.js');
      return 0;
    } else {
      console.log('⚠️  Some webhooks still not registered.\n');
      console.log('Try:');
      console.log('  1. Run this script again: node scripts/n8n-force-webhook-registration.js');
      console.log('  2. Check n8n logs: ssh ubuntu@n8n.pbradygeorgen.com "docker logs n8n --tail 50"');
      console.log('  3. Manual UI toggle as last resort: https://n8n.pbradygeorgen.com');
      return 1;
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
    return 1;
  }
}

// Execute
forceWebhookRegistration()
  .then(code => process.exit(code))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

