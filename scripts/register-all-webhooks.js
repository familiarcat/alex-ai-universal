#!/usr/bin/env node

/**
 * 🚀 Register All n8n Webhooks
 *
 * Fetches every workflow, identifies webhook nodes, and hits both the
 * /webhook-test and production /webhook endpoints so n8n lazily registers them.
 *
 * Environment variables:
 *   - N8N_URL        (default: https://n8n.pbradygeorgen.com)
 *   - N8N_API_KEY    (required for workflow enumeration)
 *   - N8N_EMAIL / N8N_PASSWORD (optional basic auth for webhook endpoints)
 *
 * Usage:
 *   source ~/.zshrc
 *   node scripts/register-all-webhooks.js
 */

'use strict';

const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const N8N_BASE_URL = creds.n8n.baseUrl;
const N8N_API_KEY = creds.n8n.apiKey;
const N8N_EMAIL = creds.n8n.email;
const N8N_PASSWORD = creds.n8n.password;

if (!N8N_API_KEY) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY in your environment.');
  process.exit(1);
}

const api = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
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

async function fetchWorkflowDetail(id) {
  const { data } = await api.get(`/api/v1/workflows/${id}`);
  return data;
}

function buildRequestConfig(path, method, payload) {
  const config = {
    method,
    url: `${N8N_BASE_URL}/${path}`,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (N8N_EMAIL && N8N_PASSWORD) {
    config.auth = {
      username: N8N_EMAIL,
      password: N8N_PASSWORD,
    };
  }

  if (method === 'GET' || method === 'DELETE') {
    config.params = payload;
  } else {
    config.data = payload;
  }

  return config;
}

async function hitWebhook(path, method, payload) {
  const config = buildRequestConfig(path, method, payload);
  try {
    const response = await axios(config);
    return { success: response.status >= 200 && response.status < 300, status: response.status };
  } catch (error) {
    const status = error.response?.status ?? 0;
    return { success: false, status, error: error.message };
  }
}

async function main() {
  printHeader('n8n Webhook Registration');
  console.log('🔑 Base URL:', N8N_BASE_URL);

  const workflows = await fetchWorkflows();
  console.log(`🔍 Found ${workflows.length} workflows\n`);

  const webhookEntries = [];
  for (const workflow of workflows) {
    const detail = await fetchWorkflowDetail(workflow.id);
    const nodes = detail.nodes || [];
    nodes
      .filter((node) => node.type === 'n8n-nodes-base.webhook')
      .forEach((node) => webhookEntries.push({ workflow, node }));
  }

  console.log(`📡 Identified ${webhookEntries.length} webhook nodes\n`);

  const results = [];
  for (const entry of webhookEntries) {
    const method = (entry.node.parameters?.httpMethod || 'POST').toUpperCase();
    const path = entry.node.parameters?.path;

    if (!path) {
      results.push({
        workflow: entry.workflow.name,
        path: '(missing)',
        method,
        test: { success: false, status: 0, error: 'No path parameter set' },
        prod: { success: false, status: 0, error: 'No path parameter set' },
      });
      console.log(`❌ ${entry.workflow.name} → missing webhook path`);
      continue;
    }

    const payload = {
      source: 'register-all-webhooks.js',
      timestamp: new Date().toISOString(),
      workflowId: entry.workflow.id,
      webhookPath: path,
    };

    const testResult = await hitWebhook(`webhook-test/${path}`, method, payload);
    const prodResult = await hitWebhook(`webhook/${path}`, method, payload);

    const statusTest = testResult.success ? '✅' : '❌';
    const statusProd = prodResult.success ? '✅' : '❌';
    console.log(`${statusTest}/${statusProd} ${entry.workflow.name} → ${path} (test ${testResult.status}, prod ${prodResult.status})`);

    results.push({
      workflow: entry.workflow.name,
      path,
      method,
      test: testResult,
      prod: prodResult,
    });

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const registered = results.filter((r) => r.prod.success).length;
  const failed = results.length - registered;

  printHeader('Registration Summary');
  console.log(`✅ Production webhooks returning 2xx: ${registered}/${results.length}`);
  console.log(`❌ Still returning errors: ${failed}`);

  if (failed > 0) {
    console.log('\nReview the entries above. Any persistent 404 indicates the workflow hasn’t initialized its webhook despite warm-up attempts.');
    process.exit(1);
  }

  console.log('\n🎉 All webhooks responded successfully!');
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error.message || error);
  process.exit(1);
});

