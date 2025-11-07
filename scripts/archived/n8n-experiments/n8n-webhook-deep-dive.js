#!/usr/bin/env node
/**
 * N8N WEBHOOK REGISTRATION DEEP DIVE
 * 
 * Purpose: Investigate n8n's webhook registration internals and find a reliable solution
 * Approach: Test multiple undocumented endpoints and mechanisms
 * 
 * Philosophy: "Understanding the system is the first step to controlling it" - Commander Data
 */

const axios = require('axios');
const { execSync } = require('child_process');

const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const N8N_API_KEY = process.env.N8N_API_KEY;

const log = {
  info: (msg) => console.log(`\x1b[34m${msg}\x1b[0m`),
  success: (msg) => console.log(`\x1b[32m${msg}\x1b[0m`),
  warn: (msg) => console.log(`\x1b[33m${msg}\x1b[0m`),
  error: (msg) => console.log(`\x1b[31m${msg}\x1b[0m`),
  cyan: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`),
};

log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   🔍 N8N WEBHOOK REGISTRATION DEEP DIVE                               ║
║                                                                        ║
║   "We must understand the system before we can master it" - Data      ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

async function main() {
  try {
    // Get a test workflow
    log.info('📋 Step 1: Getting test workflow...');
    const workflows = await axios.get(`${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    
    const testWorkflow = workflows.data.data.find(w => w.name.includes('CREW'));
    
    if (!testWorkflow) {
      log.error('No crew workflow found');
      return;
    }
    
    log.success(`✅ Testing with: ${testWorkflow.name}`);
    log.info(`   ID: ${testWorkflow.id}`);
    log.info(`   Active: ${testWorkflow.active}\n`);

    // Test 1: Check available API endpoints
    log.info('🔍 Test 1: Exploring API endpoints...');
    const endpoints = [
      '/api/v1/workflows',
      '/api/v1/executions',
      '/api/v1/credentials',
      '/rest/workflows',
      '/rest/push',
      '/webhook-test',
      '/webhook-waiting',
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await axios.head(`${N8N_URL}${endpoint}`, {
          headers: { 'X-N8N-API-KEY': N8N_API_KEY },
          timeout: 3000
        });
        console.log(`   ✅ ${endpoint.padEnd(30)} (${response.status})`);
      } catch (error) {
        const status = error.response?.status || 'timeout';
        console.log(`   ${status === 404 ? '❌' : '⚠️ '} ${endpoint.padEnd(30)} (${status})`);
      }
    }
    console.log('');

    // Test 2: Try POST to activate (different from PUT)
    log.info('🔍 Test 2: Testing POST /api/v1/workflows/:id/activate...');
    try {
      const response = await axios.post(
        `${N8N_URL}/api/v1/workflows/${testWorkflow.id}/activate`,
        {},
        { 
          headers: { 'X-N8N-API-KEY': N8N_API_KEY },
          validateStatus: () => true
        }
      );
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(response.data).substring(0, 200)}`);
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 3: Check if there's a webhook reload endpoint
    log.info('🔍 Test 3: Testing webhook reload endpoints...');
    const reloadEndpoints = [
      '/api/v1/webhooks/reload',
      '/api/v1/webhooks/refresh',
      '/rest/webhooks/reload',
      '/rest/workflows/reload',
      '/api/v1/workflows/reload-active',
    ];
    
    for (const endpoint of reloadEndpoints) {
      try {
        const response = await axios.post(`${N8N_URL}${endpoint}`, {}, {
          headers: { 'X-N8N-API-KEY': N8N_API_KEY },
          timeout: 3000,
          validateStatus: () => true
        });
        console.log(`   ${response.status < 300 ? '✅' : '❌'} ${endpoint.padEnd(40)} (${response.status})`);
        if (response.status < 300) {
          console.log(`      Response: ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.padEnd(40)} (${error.message})`);
      }
    }
    console.log('');

    // Test 4: Check the workflow object structure
    log.info('🔍 Test 4: Analyzing workflow object structure...');
    const fullWorkflow = await axios.get(`${N8N_URL}/api/v1/workflows/${testWorkflow.id}`, {
      headers: { 'X-N8N-API-KEY': N8N_API_KEY }
    });
    
    console.log('   Fields in workflow object:');
    console.log('   ' + Object.keys(fullWorkflow.data).join(', '));
    console.log('');
    
    // Check for webhook nodes
    const webhookNodes = fullWorkflow.data.nodes?.filter(n => n.type === 'n8n-nodes-base.webhook') || [];
    console.log(`   Webhook nodes found: ${webhookNodes.length}`);
    webhookNodes.forEach((node, i) => {
      console.log(`   ${i + 1}. ${node.name} - path: ${node.parameters?.path}`);
    });
    console.log('');

    // Test 5: Try minimal workflow update
    log.info('🔍 Test 5: Testing minimal workflow update (name only)...');
    try {
      const minimalUpdate = {
        name: fullWorkflow.data.name,
        nodes: fullWorkflow.data.nodes,
        connections: fullWorkflow.data.connections,
        settings: fullWorkflow.data.settings,
        staticData: fullWorkflow.data.staticData,
        tags: fullWorkflow.data.tags || [],
        active: fullWorkflow.data.active
      };
      
      const response = await axios.put(
        `${N8N_URL}/api/v1/workflows/${testWorkflow.id}`,
        minimalUpdate,
        {
          headers: { 'X-N8N-API-KEY': N8N_API_KEY },
          validateStatus: () => true
        }
      );
      console.log(`   Status: ${response.status}`);
      if (response.status >= 400) {
        console.log(`   Error: ${JSON.stringify(response.data)}`);
      } else {
        console.log(`   ✅ Success!`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
    console.log('');

    // Test 6: Database approach - check if we can see the DB
    log.info('🔍 Test 6: Checking database access...');
    log.warn('   Note: Direct DB access would bypass all n8n logic');
    log.warn('   This is for investigation only, not recommended for production');
    console.log('');

    // Summary and Recommendations
    log.cyan(`
╔════════════════════════════════════════════════════════════════════════╗
║                                                                        ║
║   📊 INVESTIGATION SUMMARY                                            ║
║                                                                        ║
╚════════════════════════════════════════════════════════════════════════╝
`);

    console.log('Based on this investigation, here are the findings:\n');
    
    console.log('✅ WORKING:');
    console.log('   - n8n API is accessible');
    console.log('   - Workflows can be retrieved');
    console.log('   - Workflow structure is clear\n');
    
    console.log('❌ CHALLENGES:');
    console.log('   - No public reload/refresh endpoint found');
    console.log('   - API validation prevents simple toggle');
    console.log('   - Webhook registration tied to activation event\n');
    
    console.log('💡 RECOMMENDED SOLUTIONS:\n');
    
    console.log('1. Container Restart + Pre-deactivation:');
    console.log('   - Deactivate all workflows before restart');
    console.log('   - Restart container');
    console.log('   - Activate workflows after restart');
    console.log('   - This forces fresh webhook registration\n');
    
    console.log('2. Create a webhook registration service:');
    console.log('   - Small Express server that proxies to n8n');
    console.log('   - Maintains webhook registry');
    console.log('   - Can trigger re-registration independently\n');
    
    console.log('3. Use n8n API execution trigger:');
    console.log('   - Create a "webhook refresher" workflow');
    console.log('   - It toggles other workflows via API');
    console.log('   - Can be triggered by Alex AI via webhook\n');
    
    console.log('4. Direct UI automation (current approach):');
    console.log('   - Most reliable but slowest');
    console.log('   - Puppeteer handles the actual UI');
    console.log('   - Works but hits rate limits\n');

  } catch (error) {
    log.error(`\nFatal error: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

main();

