'use strict';

/**
 * Fire the crew-memory-storage webhook and verify the workflow completes.
 *
 * Usage:
 *   node scripts/validate-crew-memory-storage.js
 *
 * Requires:
 *   - Supabase credentials available to n8n (via env or credentials)
 *   - n8n API key accessible to this script (from ~/.zshrc or .env)
 */

const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    title: 'Crew Memory Storage Self-Test',
    summary: 'Automated validation of Supabase credential propagation.',
    detailedAnalysis:
      'Ensure the crew-memory-storage workflow can write to Supabase using environment injected credentials.',
    tags: ['diagnostic', 'automation'],
  };

  for (let i = 0; i < args.length; i += 1) {
    const key = args[i];
    const value = args[i + 1];

    switch (key) {
      case '--title':
        parsed.title = value;
        i += 1;
        break;
      case '--summary':
        parsed.summary = value;
        i += 1;
        break;
      case '--analysis':
        parsed.detailedAnalysis = value;
        i += 1;
        break;
      case '--tags':
        parsed.tags = value.split(',').map((entry) => entry.trim()).filter(Boolean);
        i += 1;
        break;
      default:
        break;
    }
  }

  return parsed;
}

async function triggerWebhook(baseUrl, overrides) {
  const payload = {
    body: {
      crewMember: 'diagnostic_officer',
      knowledgeType: 'workflow_validation',
      priority: 'routine',
      title: overrides.title,
      summary: overrides.summary,
      detailedAnalysis: overrides.detailedAnalysis,
      keyFindings: ['Credentials sourced from AWS Parameter Store'],
      conclusions: ['Workflow completed without 401 responses'],
      recommendations: ['Notify crew if failure occurs'],
      tags: overrides.tags,
    },
  };

  const webhookUrl = `${baseUrl.replace(/\/$/, '')}/webhook/crew-memory-storage`;
  const response = await axios.post(webhookUrl, payload, { timeout: 30000 });
  return response.data;
}

async function fetchLatestExecution(apiBase, apiKey) {
  const client = axios.create({
    baseURL: `${apiBase.replace(/\/$/, '')}/api/v1`,
    headers: { 'X-N8N-API-KEY': apiKey },
    timeout: 10000,
  });

  const list = await client.get('/executions', { params: { limit: 1 } });
  if (!list.data?.data?.length) return null;

  const execution = list.data.data[0];
  const details = await client.get(`/executions/${execution.id}`, {
    params: { includeData: true },
  });
  return details.data;
}

async function main() {
  const overrides = parseArgs();
  const creds = loadCrewCredentials();
  if (!creds.n8n.apiKey) {
    throw new Error('No n8n API key available. Populate N8N_OWNER_API_KEY or N8N_API_KEY.');
  }

  try {
    const webhookResult = await triggerWebhook(creds.n8n.baseUrl, overrides);
    console.log('Webhook response:', JSON.stringify(webhookResult, null, 2));
  } catch (error) {
    console.error(
      'Webhook call failed:',
      error.response ? error.response.data : error.message,
    );
  }

  try {
    const execution = await fetchLatestExecution(creds.n8n.baseUrl, creds.n8n.apiKey);
    if (!execution) {
      console.warn('No executions found after webhook trigger.');
      return;
    }

    console.log('Latest execution status:', execution.status);
    if (execution.status !== 'success') {
      console.log(JSON.stringify(execution, null, 2));
    } else {
      console.log('Crew memory storage workflow completed successfully.');
    }
  } catch (error) {
    console.error(
      'Failed to fetch execution details:',
      error.response ? error.response.data : error.message,
    );
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

