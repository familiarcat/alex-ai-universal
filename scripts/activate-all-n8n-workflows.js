#!/usr/bin/env node

/**
 * 🔄 Activate All n8n Workflows
 *
 * Uses the n8n REST API to ensure every workflow in the instance is marked
 * active. Intended for production webhook recovery runs when the crew needs
 * every endpoint online.
 *
 * Environment variables (usually sourced from ~/.zshrc):
 *   - N8N_URL        (default: https://n8n.pbradygeorgen.com)
 *   - N8N_API_KEY    (required)
 *
 * Usage:
 *   source ~/.zshrc
 *   node scripts/activate-all-n8n-workflows.js
 */

'use strict';

const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();

if (!creds.n8n.apiKey) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in your environment.');
  process.exit(1);
}

const api = axios.create({
  baseURL: creds.n8n.baseUrl,
  headers: {
    'X-N8N-API-KEY': creds.n8n.apiKey,
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

function printHeader(title) {
  const line = '━'.repeat(78);
  console.log(`\n\u001b[36m\u001b[1m${line}\n  ${title}\n${line}\u001b[0m\n`);
}

async function fetchWorkflows() {
  const { data } = await api.get('/api/v1/workflows');
  return Array.isArray(data?.data) ? data.data : data;
}

async function activateWorkflow(workflow) {
  try {
    await api.post(`/api/v1/workflows/${workflow.id}/activate`);
    console.log(`✅ Activated: ${workflow.name}`);
    return { workflow, success: true };
  } catch (error) {
    const status = error.response?.status ?? 'ERR';
    const message = error.response?.data?.message || error.message;
    console.log(`❌ Activation failed (${status}): ${workflow.name} — ${message}`);
    return { workflow, success: false, error: message, status };
  }
}

async function main() {
  printHeader('n8n Workflow Activation');
  console.log('🔑 Base URL:', creds.n8n.baseUrl);

  const workflows = await fetchWorkflows();
  console.log(`🔍 Found ${workflows.length} workflows\n`);

  const results = [];
  for (const workflow of workflows) {
    if (workflow.active) {
      console.log(`⏭️  Already active: ${workflow.name}`);
      results.push({ workflow, success: true, skipped: true });
      continue;
    }

    const result = await activateWorkflow(workflow);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  const activated = results.filter((r) => r.success && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.success).length;

  printHeader('Activation Summary');
  console.log(`✅ Activated now: ${activated}`);
  console.log(`⏭️  Already active: ${skipped}`);
  console.log(`❌ Failed: ${failed}\n`);

  if (failed > 0) {
    console.log('Review failed workflows above. Ensure the API key belongs to an owner or that the endpoint is enabled.');
    process.exit(1);
  }

  console.log('🎉 All workflows are confirmed active!');
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message || error);
  process.exit(1);
});

