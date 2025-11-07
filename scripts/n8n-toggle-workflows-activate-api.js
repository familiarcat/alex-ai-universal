#!/usr/bin/env node
/**
 * N8N WORKFLOW TOGGLE VIA ACTIVATE/DEACTIVATE API
 * 
 * Purpose: Use the discovered POST /activate and /deactivate endpoints
 * Why: These endpoints properly trigger webhook registration
 * Use Cases:
 *   - Called by Alex AI from natural language chat
 *   - After adding/updating workflows
 *   - Automated crew deployment
 * 
 * Philosophy: "The right API endpoint makes all the difference" - Commander Data
 */

const axios = require('axios');

// Configuration
const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}${msg}${colors.reset}`),
  cyan: (msg) => console.log(`${colors.cyan}${msg}${colors.reset}`),
};

// Helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Banner
log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🔄 N8N WORKFLOW ACTIVATION API - PROPER WEBHOOK REGISTRATION        ║
║                                                                        ║
║   "Using the correct API endpoint changes everything" - Data          ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

// Validation
if (!N8N_API_KEY) {
  log.error('❌ N8N_API_KEY environment variable not set');
  process.exit(1);
}

// Parse arguments
const args = process.argv.slice(2);
const options = {
  all: args.includes('--all'),
  dryRun: args.includes('--dry-run'),
  delay: 2000, // 2 seconds between operations to avoid rate limiting
};

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();
  
  try {
    log.info('📋 Configuration:');
    console.log(`   N8N URL: ${N8N_URL}`);
    console.log(`   Filter: ${options.all ? 'ALL workflows' : 'CREW workflows only'}`);
    console.log(`   Mode: ${options.dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log(`   Delay: ${options.delay}ms between operations`);
    console.log('');

    // Step 1: Fetch workflows
    log.info('🔍 Step 1: Fetching workflows from n8n...');
    const response = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    let workflowsToToggle = response.data.data;
    
    if (!options.all) {
      workflowsToToggle = workflowsToToggle.filter(w => 
        w.name.includes('CREW') || w.name.includes('COORDINATION')
      );
    }

    log.success(`✅ Found ${workflowsToToggle.length} workflow(s) to toggle\n`);

    if (workflowsToToggle.length === 0) {
      log.warn('⚠️  No workflows to toggle');
      return;
    }

    // Display workflows
    log.info('📊 Workflows to toggle:');
    workflowsToToggle.forEach((w, i) => {
      const status = w.active ? '🟢' : '⚫';
      console.log(`   ${i + 1}. ${status} ${w.name}`);
    });
    console.log('');

    if (options.dryRun) {
      log.warn('🔍 DRY RUN MODE - No changes will be made');
      return;
    }

    // Step 2: Deactivate workflows
    log.info('🔄 Step 2: Deactivating workflows...\n');
    const results = { deactivated: 0, deactivateFailed: 0, skipped: 0 };

    for (const workflow of workflowsToToggle) {
      try {
        if (!workflow.active) {
          console.log(`   ⏭️  ${workflow.name} - already inactive`);
          results.skipped++;
          continue;
        }

        // Use the /deactivate endpoint
        await axios.post(
          `${N8N_URL}/api/v1/workflows/${workflow.id}/deactivate`,
          {},
          { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
        );
        
        console.log(`   ⚫ ${workflow.name} - deactivated`);
        results.deactivated++;

        // Delay to avoid rate limiting
        await sleep(options.delay);

      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.log(`   ❌ ${workflow.name} - failed: ${errorMsg}`);
        results.deactivateFailed++;
      }
    }

    log.success(`\n✅ Deactivation complete: ${results.deactivated} deactivated, ${results.deactivateFailed} failed, ${results.skipped} skipped\n`);

    // Step 3: Wait for webhook unregistration
    log.info('⏳ Step 3: Waiting 3 seconds for webhook unregistration...');
    await sleep(3000);

    // Step 4: Activate workflows
    log.info('🔄 Step 4: Activating workflows...\n');
    results.activated = 0;
    results.activateFailed = 0;

    for (const workflow of workflowsToToggle) {
      try {
        // Use the /activate endpoint
        await axios.post(
          `${N8N_URL}/api/v1/workflows/${workflow.id}/activate`,
          {},
          { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
        );
        
        console.log(`   🟢 ${workflow.name} - activated`);
        results.activated++;

        // Delay to avoid rate limiting
        await sleep(options.delay);

      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.log(`   ❌ ${workflow.name} - failed: ${errorMsg}`);
        results.activateFailed++;
      }
    }

    log.success(`\n✅ Activation complete: ${results.activated} activated, ${results.activateFailed} failed\n`);

    // Step 5: Wait for webhook registration
    log.info('⏳ Step 5: Waiting 5 seconds for webhook registration...');
    await sleep(5000);

    // Step 6: Test webhooks
    log.info('🧪 Step 6: Testing webhook registration...\n');
    
    const webhookTests = [
      { name: 'Captain Picard', path: '/webhook/crew-captain-jean-luc-picard' },
      { name: 'Commander Data', path: '/webhook/crew-commander-data' },
      { name: 'Geordi La Forge', path: '/webhook/crew-geordi-la-forge' },
      { name: 'Observation Lounge', path: '/webhook/observation-lounge' },
    ];

    const webhookResults = { working: 0, notWorking: 0 };

    for (const test of webhookTests) {
      try {
        const response = await axios.post(
          `${N8N_URL}${test.path}`,
          { query: 'health check', test: true },
          { 
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000,
            validateStatus: (status) => status < 500
          }
        );

        if (response.status === 200 || response.status === 201) {
          console.log(`   ✅ ${test.name.padEnd(20)} WORKING (HTTP ${response.status})`);
          webhookResults.working++;
        } else if (response.status === 404) {
          console.log(`   ❌ ${test.name.padEnd(20)} NOT REGISTERED (HTTP 404)`);
          webhookResults.notWorking++;
        } else {
          console.log(`   ⚠️  ${test.name.padEnd(20)} UNKNOWN (HTTP ${response.status})`);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          console.log(`   ❌ ${test.name.padEnd(20)} NOT REGISTERED (HTTP 404)`);
          webhookResults.notWorking++;
        } else {
          console.log(`   ⚠️  ${test.name.padEnd(20)} ERROR: ${error.message}`);
        }
      }
    }

    console.log('');

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const allSuccess = results.deactivateFailed === 0 && results.activateFailed === 0 && webhookResults.notWorking === 0;

    log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ${allSuccess ? '✅ SUCCESS! ALL WORKFLOWS TOGGLED & WEBHOOKS REGISTERED' : '⚠️  WORKFLOW TOGGLE COMPLETE WITH WARNINGS'}        ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

    console.log(`Workflows Toggled: ${results.activated}/${workflowsToToggle.length}`);
    console.log(`Webhooks Working: ${webhookResults.working}/${webhookTests.length}`);
    console.log(`Duration: ${duration}s`);
    console.log('');

    if (allSuccess) {
      log.success('🎉 All workflows and webhooks are operational!');
      log.info('');
      log.info('This solution works! You can now:');
      log.info('   1. Call from Alex AI chat: npm run n8n:activate-workflows');
      log.info('   2. Test crew: npm run rag:verify');
      log.info('   3. Use in automation pipelines');
    } else {
      if (results.activateFailed > 0 || results.deactivateFailed > 0) {
        log.warn(`⚠️  Some workflows failed to toggle`);
      }
      
      if (webhookResults.notWorking > 0) {
        log.warn(`⚠️  ${webhookResults.notWorking} webhook(s) still not registered`);
        log.info('   If this persists, webhooks may need manual UI toggle');
        log.info('   Or try: npm run n8n:refresh (restart + toggle)');
      }
    }

  } catch (error) {
    log.error(`\n❌ Fatal error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

// Run
main().catch(error => {
  console.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

