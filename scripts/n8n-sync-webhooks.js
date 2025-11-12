#!/usr/bin/env node
'use strict';

/**
 * Normalize crew webhook nodes to match the working configuration used by
 * Chief Miles O'Brien. This script assigns deterministic webhook IDs to every
 * crew/system workflow and optionally re-registers the webhooks via the n8n
 * REST API.
 *
 * Usage:
 *   node scripts/n8n-sync-webhooks.js [--register] [--dry-run] [--output report.json]
 */

const fs = require('node:fs');
const path = require('node:path');

const {
  fetchAllWorkflows,
  fetchWorkflow,
  sanitizeWorkflowData,
  collectWebhookPaths,
  triggerWorkflow,
  ensureSession,
  n8nBaseUrl,
} = require('./crew-webhook-refresh-via-api');

function parseArgs() {
  const args = process.argv.slice(2);
  const flags = {
    register: false,
    dryRun: false,
    output: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--register') {
      flags.register = true;
    } else if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--output' || arg === '-o') {
      flags.output = args[i + 1];
      i += 1;
    }
  }

  return flags;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'webhook';
}

function buildWebhookId(workflowName, nodeName, pathName) {
  const slugParts = [
    slugify(workflowName.replace(/^CREW -\s*/i, '')),
    slugify(nodeName),
    slugify(pathName),
  ].filter(Boolean);
  return `${slugParts.join('-')}-webhook`;
}

function normalizeWebhookNode(workflow, node) {
  const parameters = node.parameters || {};
  const currentId = node.webhookId || null;
  const desiredId = buildWebhookId(workflow.name, node.name, parameters.path);
  const changes = [];

  if (!currentId) {
    node.webhookId = desiredId;
    changes.push(`webhookId: null -> ${desiredId}`);
  }

  if (!parameters.httpMethod) {
    parameters.httpMethod = 'POST';
    changes.push('httpMethod: <missing> -> POST');
  }

  if (!parameters.responseMode) {
    parameters.responseMode = 'responseNode';
    changes.push('responseMode: <missing> -> responseNode');
  }

  if (!parameters.options) {
    parameters.options = {};
  }

  node.parameters = parameters;
  return changes;
}

async function syncWorkflows({ dryRun, register, output }) {
  const summary = {
    timestamp: new Date().toISOString(),
    baseUrl: n8nBaseUrl,
    dryRun,
    register,
    workflowsChecked: 0,
    workflowsUpdated: 0,
    nodesUpdated: 0,
    details: [],
    registrationResults: [],
  };

  const restClient = await ensureSession();
  if (!restClient) {
    throw new Error('Unable to obtain n8n owner session.');
  }

  const allWorkflows = await fetchAllWorkflows();
  const crewWorkflows = allWorkflows.filter((wf) => {
    const name = wf.name || '';
    return (
      wf.active &&
      (name.startsWith('CREW -') ||
        name.startsWith('COORDINATION -') ||
        name.startsWith('SYSTEM -') ||
        name.includes('Observation Lounge') ||
        name.includes('Knowledge Ingest'))
    );
  });

  summary.workflowsChecked = crewWorkflows.length;

  for (const wfSummary of crewWorkflows) {
    const workflow = await fetchWorkflow(wfSummary.id);
    if (!workflow) {
      summary.details.push({
        workflowId: wfSummary.id,
        workflowName: wfSummary.name,
        status: 'error',
        error: 'Unable to fetch workflow via REST API.',
      });
      continue;
    }

    let nodesUpdated = 0;
    let nodeChanges = [];

    for (const node of workflow.nodes || []) {
      if (node.type === 'n8n-nodes-base.webhook') {
        const changes = normalizeWebhookNode(workflow, node);
        if (changes.length > 0) {
          nodesUpdated += 1;
          nodeChanges.push({
            nodeName: node.name,
            path: node.parameters?.path ?? null,
            changes,
          });
        }
      }
    }

    if (nodesUpdated > 0) {
      summary.nodesUpdated += nodesUpdated;
      summary.workflowsUpdated += 1;

      summary.details.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodesUpdated,
        nodeChanges,
      });

      if (!dryRun) {
        const payload = sanitizeWorkflowData(workflow);
        try {
          await restClient.patch(`/rest/workflows/${workflow.id}`, payload);
        } catch (error) {
          summary.details.push({
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: 'error',
            error: `Failed to update workflow: ${error.message}`,
          });
        }
      }
    } else {
      summary.details.push({
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodesUpdated: 0,
        message: 'No webhook changes required.',
      });
    }

    if (!dryRun && register) {
      const triggerResult = await triggerWorkflow(workflow);
      summary.registrationResults.push(triggerResult);
    }
  }

  if (output) {
    const outputPath = path.resolve(output);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf8');
    console.log(`📝 Sync summary written to ${outputPath}`);
  } else {
    console.log(JSON.stringify(summary, null, 2));
  }

  return summary;
}

async function main() {
  try {
    const flags = parseArgs();
    await syncWorkflows(flags);
  } catch (error) {
    console.error('❌ Failed to synchronize webhooks:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  syncWorkflows,
};



