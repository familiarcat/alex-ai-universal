#!/usr/bin/env node

/**
 * Synchronize local n8n workflow JSON files with the remote n8n instance.
 *
 * Uses the shared crew credentials (see scripts/utils/load-crew-credentials.js)
 * so we respect the same environment configuration that's already in place for
 * all Alex AI automations.
 *
 * Only the workflows listed in WORKFLOW_FILES are pushed. Update the list if
 * additional workflows need to be synchronized.
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const WORKFLOW_FILES = [
  'n8n-workflows/crew-memory-storage-workflow-optimized.json',,
'n8n-workflows/crew-workflows/crew-captain-jean-luc-picard-strategic-leadership-openrouter-production.json',
'n8n-workflows/crew-workflows/crew-commander-data-android-analytics-openrouter-production.json',
'n8n-workflows/crew-workflows/crew-commander-william-riker-tactical-execution-openrouter-production.json',
'n8n-workflows/crew-workflows/crew-counselor-deanna-troi-user-experience-openrouter-production.json',
'n8n-workflows/crew-workflows/crew-dr-beverly-crusher-health-diagnostics-openrouter-production.json',
'n8n-workflows/crew-workflows/crew-lieutenant-commander-geordi-la-forge-infrastructure-openrouter-production.json',
'n8n-workflows/crew-workflows/crew-lieutenant-uhura-communications-io-openrouter-production.json',
'n8n-workflows/crew-workflows/crew-lieutenant-worf-security-compliance-openrouter-production.json',
'n8n-workflows/crew-workflows/crew-chief-miles-obrien-pragmatic-solutions-openrouter-production.json'
];;

async function main() {
  const projectRoot = process.cwd();
  const credentials = loadCrewCredentials();

  if (!credentials?.n8n?.apiKey) {
    throw new Error('Missing N8N API key. Ensure N8N_OWNER_API_KEY or N8N_API_KEY is set.');
  }

  const apiBase =
    (credentials.n8n.baseUrl || '').replace(/\/$/, '') +
    '/api/v1';

  const axiosClient = axios.create({
    baseURL: apiBase,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': credentials.n8n.apiKey
    }
  });

  console.log('🔄 Synchronizing n8n workflows with', apiBase);

  let existingWorkflows = [];
  try {
    const response = await axiosClient.get('/workflows');
    existingWorkflows = Array.isArray(response.data?.data)
      ? response.data.data
      : Array.isArray(response.data)
      ? response.data
      : [];
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      'Unknown error';
    console.warn('⚠️  Could not fetch existing workflows from n8n. Falling back to local IDs only.');
    console.warn(`   Status: ${status ?? 'unknown'}`);
    console.warn(`   Message: ${message}`);
  }

  const workflowByName = new Map(
    existingWorkflows
      .filter((wf) => wf?.name)
      .map((wf) => [wf.name, wf])
  );

  for (const relativePath of WORKFLOW_FILES) {
    const absolutePath = path.join(projectRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️  Skipping ${relativePath} (file not found).`);
      continue;
    }

    const raw = fs.readFileSync(absolutePath, 'utf8');
    const workflow = JSON.parse(raw);
    let workflowId = workflow.id;

    const existing = workflowByName.get(workflow.name);
    if (existing?.id && existing.id !== workflowId) {
      if (workflowId) {
        console.log(
          `ℹ️  Replacing local workflow ID ${workflowId} with remote ID ${existing.id} for ${workflow.name}.`
        );
      } else {
        console.log(
          `ℹ️  Resolved workflow ID ${existing.id} for ${workflow.name} via remote lookup.`
        );
      }
      workflowId = existing.id;
    }

    if (!workflowId) {
      console.warn(`⚠️  Skipping ${relativePath} (no workflow id).`);
      continue;
    }

    const payload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
      staticData: workflow.staticData || null
    };

    try {
      await axiosClient.put(`/workflows/${workflowId}`, payload);
      console.log(`✅ Synced workflow ${workflow.name} (${workflowId})`);
    } catch (error) {
      const status = error.response?.status;
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      console.error(`❌ Failed to sync ${workflow.name} (${workflowId})`);
      if (status) {
        console.error(`   Status: ${status}`);
      }
      console.error(`   Message: ${message}`);
      if (error.response?.data) {
        console.error(`   Response body: ${JSON.stringify(error.response.data)}`);
      }
    }
  }

  console.log('✨ n8n workflow synchronization complete.');
}

main().catch((error) => {
  console.error('❌ Sync failed:', error.message);
  process.exit(1);
});

