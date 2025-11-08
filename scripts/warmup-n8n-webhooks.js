#!/usr/bin/env node
/**
 * Warm up n8n webhooks by fetching workflow definitions and triggering
 * their webhook endpoints once. This encourages n8n to register each
 * webhook lazily without requiring manual UI interaction.
 */

const axios = require('axios');

const BASE_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
const API_KEY = process.env.N8N_API_KEY;
const N8N_EMAIL = process.env.N8N_EMAIL || process.env.N8N_USER_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD || process.env.N8N_USER_PASSWORD;

if (!API_KEY) {
  console.error('❌ Missing N8N_API_KEY environment variable.');
  process.exit(1);
}

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function buildAxiosConfig(method) {
  const config = {
    method,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: () => true,
  };

  if (N8N_EMAIL && N8N_PASSWORD) {
    config.auth = {
      username: N8N_EMAIL,
      password: N8N_PASSWORD,
    };
  }

  return config;
}

async function fetchWorkflows() {
  const response = await axios.get(`${BASE_URL}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': API_KEY },
    timeout: 15000,
  });

  return Array.isArray(response.data?.data) ? response.data.data : response.data;
}

function shouldWarmWorkflow(name) {
  if (!name) return false;
  return (
    name.includes('CREW -') ||
    name.includes('COORDINATION -') ||
    name.toLowerCase().includes('knowledge ingest')
  );
}

function makeWarmupPayload(workflow) {
  return {
    warmup: true,
    workflowId: workflow.id,
    workflowName: workflow.name,
    timestamp: new Date().toISOString(),
    source: 'warmup-n8n-webhooks.js',
  };
}

async function triggerUrl(url, method, payload) {
  const config = buildAxiosConfig(method);

  if (method === 'GET') {
    config.params = payload;
  } else {
    config.data = payload;
  }

  return axios(url, config);
}

async function triggerWebhook(workflow, node) {
  const method = (node.parameters?.httpMethod || 'POST').toUpperCase();
  const path = node.parameters?.path;

  if (!path) {
    log('yellow', `⚠️  ${workflow.name}: Webhook node missing path; skipping`);
    return false;
  }

  const payload = makeWarmupPayload(workflow);

  try {
    // First hit the test webhook to encourage registration
    const testUrl = `${BASE_URL}/webhook-test/${path}`;
    const prodUrl = `${BASE_URL}/webhook/${path}`;

    let response = await triggerUrl(testUrl, method, payload);

    if (!(response.status >= 200 && response.status < 300)) {
      log('yellow', `⚠️  ${workflow.name}: Test webhook HTTP ${response.status}`);
    }

    // Small delay to allow registration
    await new Promise((resolve) => setTimeout(resolve, 500));

    response = await triggerUrl(prodUrl, method, payload);

    if (response.status >= 200 && response.status < 300) {
      log('green', `✅ ${workflow.name}: HTTP ${response.status}`);
      return true;
    }

    log('yellow', `⚠️  ${workflow.name}: Prod webhook HTTP ${response.status}`);
    return false;
  } catch (error) {
    log('red', `❌ ${workflow.name}: ${error.message}`);
    return false;
  }
}

async function main() {
  log('cyan', '\n╔══════════════════════════════════════════════════════════════════╗');
  log('cyan', '║                                                                  ║');
  log('cyan', '║   🔥 N8N WEBHOOK WARMUP - DIRECT TRIGGER                        ║');
  log('cyan', '║                                                                  ║');
  log('cyan', '╚══════════════════════════════════════════════════════════════════╝\n');

  try {
    const workflows = await fetchWorkflows();
    const warmTargets = workflows.filter((wf) => shouldWarmWorkflow(wf.name));

    log('cyan', `Discovered ${warmTargets.length} workflows to warm.`);

    let successes = 0;
    let failures = 0;

    for (const workflow of warmTargets) {
      const webhookNodes = (workflow.nodes || []).filter(
        (node) => node.type === 'n8n-nodes-base.webhook'
      );

      if (webhookNodes.length === 0) {
        log('yellow', `⚠️  ${workflow.name}: No webhook nodes found; skipping`);
        continue;
      }

      for (const node of webhookNodes) {
        const result = await triggerWebhook(workflow, node);
        if (result) successes += 1;
        else failures += 1;
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    log('cyan', '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    log('cyan', `Result: ${successes} success, ${failures} failed`);
    log('cyan', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(failures > 0 ? 1 : 0);
  } catch (error) {
    log('red', `Fatal error: ${error.message}`);
    process.exit(1);
  }
}

main();

