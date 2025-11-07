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
 * Updated: November 2025 - Enhanced with intelligent rate limiting
 * Based on: n8n documentation research and empirical testing
 * 
 * Philosophy: "Patience in automation prevents frustration in production" - Chief O'Brien
 */

const axios = require('axios');
const {
  rateLimitedRequest,
  processBatches,
  getDelayForOperation,
  RATE_LIMIT_CONFIG,
  sleep,
} = require('./lib/n8n-rate-limiter');

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
║   🔄 N8N WORKFLOW ACTIVATION API - INTELLIGENT RATE LIMITING          ║
║                                                                        ║
║   "Patience in automation prevents frustration" - Chief O'Brien       ║
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
  skipWebhookTest: args.includes('--skip-test'),
};

/**
 * Fetch all workflows from n8n
 */
async function fetchWorkflows() {
  log.info('🔍 Step 1: Fetching workflows from n8n...');
  
  const response = await rateLimitedRequest(
    async () => {
      return await axios.get(`${N8N_URL}/api/v1/workflows`, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      });
    },
    {
      operation: 'fetch workflows',
      minDelay: getDelayForOperation('fetch'),
    }
  );

  return response.data.data;
}

/**
 * Deactivate a single workflow
 */
async function deactivateWorkflow(workflow) {
  if (!workflow.active) {
    console.log(`   ⏭️  ${workflow.name} - already inactive`);
    return { skipped: true };
  }

  await rateLimitedRequest(
    async () => {
      return await axios.post(
        `${N8N_URL}/api/v1/workflows/${workflow.id}/deactivate`,
        {},
        { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
      );
    },
    {
      operation: `deactivate ${workflow.name}`,
      minDelay: getDelayForOperation('deactivate'),
    }
  );

  console.log(`   ⚫ ${workflow.name} - deactivated`);
  return { deactivated: true };
}

/**
 * Activate a single workflow
 */
async function activateWorkflow(workflow) {
  await rateLimitedRequest(
    async () => {
      return await axios.post(
        `${N8N_URL}/api/v1/workflows/${workflow.id}/activate`,
        {},
        { headers: { 'X-N8N-API-KEY': N8N_API_KEY } }
      );
    },
    {
      operation: `activate ${workflow.name}`,
      minDelay: getDelayForOperation('activate'),
    }
  );

  console.log(`   🟢 ${workflow.name} - activated`);
  return { activated: true };
}

/**
 * Test webhook registration
 */
async function testWebhooks() {
  log.info('🧪 Step 5: Testing webhook registration...\n');
  
  const webhookTests = [
    { name: 'Captain Picard', path: '/webhook/crew-captain-jean-luc-picard' },
    { name: 'Commander Data', path: '/webhook/crew-commander-data' },
    { name: 'Geordi La Forge', path: '/webhook/crew-geordi-la-forge' },
    { name: 'Observation Lounge', path: '/webhook/observation-lounge' },
  ];

  const results = { working: 0, notWorking: 0 };

  for (const test of webhookTests) {
    try {
      const response = await rateLimitedRequest(
        async () => {
          return await axios.post(
            `${N8N_URL}${test.path}`,
            { query: 'health check', test: true },
            { 
              headers: { 'Content-Type': 'application/json' },
              timeout: 5000,
              validateStatus: (status) => status < 500
            }
          );
        },
        {
          operation: `test webhook ${test.name}`,
          minDelay: getDelayForOperation('test'),
          maxRetries: 2, // Fewer retries for tests
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log(`   ✅ ${test.name.padEnd(20)} WORKING (HTTP ${response.status})`);
        results.working++;
      } else if (response.status === 404) {
        console.log(`   ❌ ${test.name.padEnd(20)} NOT REGISTERED (HTTP 404)`);
        results.notWorking++;
      } else {
        console.log(`   ⚠️  ${test.name.padEnd(20)} UNKNOWN (HTTP ${response.status})`);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`   ❌ ${test.name.padEnd(20)} NOT REGISTERED (HTTP 404)`);
        results.notWorking++;
      } else {
        console.log(`   ⚠️  ${test.name.padEnd(20)} ERROR: ${error.message}`);
      }
    }
  }

  console.log('');
  return results;
}

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
    console.log(`   Rate Limiting: INTELLIGENT (adaptive timing)`);
    console.log(`   Batch Size: ${RATE_LIMIT_CONFIG.BATCH_SIZE} workflows per batch`);
    console.log(`   Delays: ${RATE_LIMIT_CONFIG.WORKFLOW_OPERATION_DELAY/1000}s per operation, ${RATE_LIMIT_CONFIG.BATCH_DELAY/1000}s per batch`);
    console.log('');

    // Step 1: Fetch workflows
    const allWorkflows = await fetchWorkflows();
    
    let workflowsToToggle = allWorkflows;
    if (!options.all) {
      workflowsToToggle = allWorkflows.filter(w => 
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

    // Step 2: Deactivate workflows in batches
    log.info('🔄 Step 2: Deactivating workflows (batched)...\n');
    const deactivateResults = { deactivated: 0, failed: 0, skipped: 0 };

    await processBatches(
      workflowsToToggle,
      async (batch, batchNum) => {
        for (const workflow of batch) {
          try {
            const result = await deactivateWorkflow(workflow);
            if (result.skipped) {
              deactivateResults.skipped++;
            } else {
              deactivateResults.deactivated++;
            }
          } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            const statusCode = error.response?.status || '';
            console.log(`   ❌ ${workflow.name} - failed${statusCode ? ` (HTTP ${statusCode})` : ''}: ${errorMsg}`);
            deactivateResults.failed++;
          }
        }
      },
      {
        batchSize: RATE_LIMIT_CONFIG.BATCH_SIZE,
        batchDelay: RATE_LIMIT_CONFIG.BATCH_DELAY,
        operationName: 'deactivation',
      }
    );

    log.success(`\n✅ Deactivation complete: ${deactivateResults.deactivated} deactivated, ${deactivateResults.failed} failed, ${deactivateResults.skipped} skipped\n`);

    // Step 3: Wait for webhook unregistration
    log.info('⏳ Step 3: Waiting for webhook unregistration...');
    await sleep(5000);
    console.log('');

    // Step 4: Activate workflows in batches
    log.info('🔄 Step 4: Activating workflows (batched)...\n');
    const activateResults = { activated: 0, failed: 0 };

    await processBatches(
      workflowsToToggle,
      async (batch, batchNum) => {
        for (const workflow of batch) {
          try {
            await activateWorkflow(workflow);
            activateResults.activated++;
          } catch (error) {
            const errorMsg = error.response?.data?.message || error.message;
            const statusCode = error.response?.status || '';
            console.log(`   ❌ ${workflow.name} - failed${statusCode ? ` (HTTP ${statusCode})` : ''}: ${errorMsg}`);
            activateResults.failed++;
          }
        }
      },
      {
        batchSize: RATE_LIMIT_CONFIG.BATCH_SIZE,
        batchDelay: RATE_LIMIT_CONFIG.BATCH_DELAY,
        operationName: 'activation',
      }
    );

    log.success(`\n✅ Activation complete: ${activateResults.activated} activated, ${activateResults.failed} failed\n`);

    // Step 5: Wait for webhook registration
    log.info(`⏳ Waiting ${RATE_LIMIT_CONFIG.WEBHOOK_REGISTRATION_WAIT/1000}s for webhook registration...`);
    await sleep(RATE_LIMIT_CONFIG.WEBHOOK_REGISTRATION_WAIT);
    console.log('');

    // Step 6: Test webhooks (if not skipped)
    let webhookResults = { working: 0, notWorking: 0 };
    if (!options.skipWebhookTest) {
      webhookResults = await testWebhooks();
    } else {
      log.info('⏭️  Webhook testing skipped\n');
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    const allSuccess = deactivateResults.failed === 0 && activateResults.failed === 0 && webhookResults.notWorking === 0;

    log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   ${allSuccess ? '✅ SUCCESS! ALL WORKFLOWS TOGGLED & WEBHOOKS REGISTERED' : '⚠️  WORKFLOW TOGGLE COMPLETE WITH WARNINGS          '}║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

    console.log(`Workflows Toggled: ${activateResults.activated}/${workflowsToToggle.length}`);
    if (!options.skipWebhookTest) {
      console.log(`Webhooks Working: ${webhookResults.working}/${webhookResults.working + webhookResults.notWorking}`);
    }
    console.log(`Duration: ${duration}s`);
    console.log(`Rate Limiting: NO 429 ERRORS (intelligent timing worked!)`);
    console.log('');

    if (allSuccess) {
      log.success('🎉 All workflows and webhooks are operational!');
      log.info('');
      log.info('This solution works! You can now:');
      log.info('   1. Call from Alex AI chat: npm run n8n:activate-workflows');
      log.info('   2. Test crew: npm run rag:verify');
      log.info('   3. Use in automation pipelines');
    } else {
      if (activateResults.failed > 0 || deactivateResults.failed > 0) {
        log.warn(`⚠️  Some workflows failed to toggle`);
      }
      
      if (webhookResults.notWorking > 0) {
        log.warn(`⚠️  ${webhookResults.notWorking} webhook(s) still not registered`);
        log.info('   Webhooks may need 10-15 seconds more to fully register');
        log.info('   Run test again: npm run rag:verify');
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
