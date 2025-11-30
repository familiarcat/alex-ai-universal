#!/usr/bin/env node
/**
 * N8N WORKFLOW TOGGLE - Force Webhook Re-registration
 * 
 * Purpose: Toggle n8n workflows off/on to force webhook re-registration
 * Use Cases:
 *   - After adding new workflows
 *   - After updating workflow webhooks
 *   - When webhooks show 404 errors
 *   - After n8n container restart
 *   - After bulk workflow imports
 * 
 * Philosophy: "Automate everything" - Commander Data
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

// Banner
log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🔄 N8N WORKFLOW TOGGLE - Force Webhook Registration                ║
║                                                                        ║
║   "Automate everything. Efficiency is logical." - Commander Data      ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

// Validation
if (!N8N_API_KEY) {
  log.error('❌ N8N_API_KEY environment variable not set');
  log.info('   Set it in ~/.zshrc: export N8N_API_KEY="your-key"');
  process.exit(1);
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  filter: 'CREW', // Default: only toggle crew workflows
  all: args.includes('--all'),
  dryRun: args.includes('--dry-run'),
  delay: 1000, // Delay between toggles (ms)
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node n8n-toggle-workflows.js [options]

Options:
  --all              Toggle ALL workflows (default: only CREW workflows)
  --dry-run          Show what would be toggled without actually doing it
  --help, -h         Show this help message

Examples:
  node n8n-toggle-workflows.js                  # Toggle only crew workflows
  node n8n-toggle-workflows.js --all            # Toggle all workflows
  node n8n-toggle-workflows.js --dry-run        # Preview without executing
  npm run n8n:toggle                            # Use npm script

Environment Variables:
  N8N_URL            n8n instance URL (default: https://n8n.pbradygeorgen.com)
  N8N_API_KEY        n8n API key (required)
`);
  process.exit(0);
}

/**
 * Main execution
 */
async function main() {
  const startTime = Date.now();
  
  log.info('📋 Configuration:');
  console.log(`   N8N URL: ${N8N_URL}`);
  console.log(`   API Key: ${N8N_API_KEY.substring(0, 20)}...`);
  console.log(`   Filter: ${options.all ? 'ALL workflows' : 'CREW workflows only'}`);
  console.log(`   Mode: ${options.dryRun ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log('');

  try {
    // Step 1: Fetch all workflows
    log.info('🔍 Step 1: Fetching workflows from n8n...');
    const response = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });

    const allWorkflows = response.data.data;
    log.success(`✅ Found ${allWorkflows.length} total workflows\n`);

    // Step 2: Filter workflows
    let workflowsToToggle = allWorkflows;
    
    if (!options.all) {
      workflowsToToggle = allWorkflows.filter(w => 
        w.name.includes('CREW') || w.name.includes('COORDINATION')
      );
      log.info(`🎯 Filtered to ${workflowsToToggle.length} crew/coordination workflows\n`);
    }

    if (workflowsToToggle.length === 0) {
      log.warn('⚠️  No workflows to toggle');
      return;
    }

    // Step 3: Display workflows
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

    // Step 4: Toggle workflows OFF
    log.info('🔄 Step 2: Toggling workflows OFF...');
    const toggleResults = { success: 0, failed: 0, skipped: 0 };

    for (const workflow of workflowsToToggle) {
      try {
        if (!workflow.active) {
          console.log(`   ⏭️  ${workflow.name} - already inactive`);
          toggleResults.skipped++;
          continue;
        }

        // Toggle OFF - Fetch full workflow first, then update
        const fullWorkflow = await axios.get(
          `${N8N_URL}/api/v1/workflows/${workflow.id}`,
          { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
        );
        
        // Extract only the fields n8n expects (remove metadata)
        const { id, createdAt, updatedAt, versionId, ...workflowData } = fullWorkflow.data;
        
        await axios.put(
          `${N8N_URL}/api/v1/workflows/${workflow.id}`,
          { ...workflowData, active: false },
          { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
        );
        console.log(`   ⚫ ${workflow.name} - deactivated`);
        toggleResults.success++;

        // Brief delay
        await sleep(options.delay);

      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.log(`   ❌ ${workflow.name} - failed: ${errorMsg}`);
        if (error.response?.data && toggleResults.failed === 0) {
          // Show details for first failure only
          console.log(`      Details: ${JSON.stringify(error.response.data).substring(0, 300)}`);
        }
        toggleResults.failed++;
      }
    }

    log.success(`✅ Deactivation complete: ${toggleResults.success} success, ${toggleResults.failed} failed, ${toggleResults.skipped} skipped\n`);

    // Step 5: Wait for webhooks to unregister
    log.info('⏳ Waiting 3 seconds for webhook unregistration...');
    await sleep(3000);

    // Step 6: Toggle workflows ON
    log.info('🔄 Step 3: Toggling workflows ON...');
    toggleResults.success = 0;
    toggleResults.failed = 0;
    toggleResults.skipped = 0;

    for (const workflow of workflowsToToggle) {
      try {
        // Toggle ON - Fetch full workflow first, then update
        const fullWorkflow = await axios.get(
          `${N8N_URL}/api/v1/workflows/${workflow.id}`,
          { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
        );
        
        // Extract only the fields n8n expects (remove metadata)
        const { id, createdAt, updatedAt, versionId, ...workflowData } = fullWorkflow.data;
        
        await axios.put(
          `${N8N_URL}/api/v1/workflows/${workflow.id}`,
          { ...workflowData, active: true },
          { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
        );
        console.log(`   🟢 ${workflow.name} - activated`);
        toggleResults.success++;

        // Brief delay
        await sleep(options.delay);

      } catch (error) {
        console.log(`   ❌ ${workflow.name} - failed: ${error.message}`);
        toggleResults.failed++;
      }
    }

    log.success(`✅ Activation complete: ${toggleResults.success} success, ${toggleResults.failed} failed\n`);

    // Step 7: Wait for webhook registration
    log.info('⏳ Waiting 5 seconds for webhook registration...');
    await sleep(5000);

    // Step 8: Verify webhook registration
    log.info('🧪 Step 4: Testing webhook registration...');
    
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
            validateStatus: (status) => status < 500 // Accept 404 as "not working"
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
    const allWebhooksWorking = webhookResults.notWorking === 0;

    log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ${allWebhooksWorking ? '✅ WORKFLOW TOGGLE COMPLETE' : '⚠️  WORKFLOW TOGGLE COMPLETE WITH WARNINGS'}                         ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

    console.log(`Workflows Toggled: ${workflowsToToggle.length}`);
    console.log(`Duration: ${duration}s`);
    console.log(`Webhooks Working: ${webhookResults.working}/${webhookTests.length}`);
    console.log('');

    if (!allWebhooksWorking) {
      log.warn('⚠️  Some webhooks are still not registered');
      log.info('   This can happen if:');
      log.info('   1. Workflows need more time to initialize');
      log.info('   2. n8n container needs a full restart: npm run n8n:restart');
      log.info('   3. Workflows have configuration issues');
      log.info('');
      log.info('💡 Try running again in 30 seconds, or restart n8n container');
    } else {
      log.success('🎉 All tested webhooks are working!');
      log.info('');
      log.info('Next steps:');
      log.info('   1. Test all crew webhooks: npm run rag:verify');
      log.info('   2. Monitor webhook health: node scripts/monitor-webhook-health.js');
    }

  } catch (error) {
    log.error(`\n❌ Error: ${error.message}`);
    if (error.response) {
      log.error(`   Status: ${error.response.status}`);
      log.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    process.exit(1);
  }
}

/**
 * Sleep helper
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run
main().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});

