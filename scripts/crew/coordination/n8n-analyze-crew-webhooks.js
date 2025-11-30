#!/usr/bin/env node
'use strict';

/**
 * Analyze crew webhook configuration differences in n8n.
 *
 * Reuses the authenticated helpers from crew-webhook-refresh-via-api.js to avoid
 * duplicating REST login logic. The script fetches every active crew/system workflow,
 * extracts the configuration of each webhook node, and prints a JSON report that
 * highlights which nodes are missing webhook IDs or differ from Chief O'Brien's
 * working configuration.
 *
 * Usage:
 *   node scripts/n8n-analyze-crew-webhooks.js [--output reports/crew-webhook-analysis.json]
 */

const fs = require('node:fs');
const path = require('node:path');

const {
  fetchAllWorkflows,
  fetchWorkflow,
  collectWebhookPaths,
} = require('./crew-webhook-refresh-via-api');

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      result.output = args[i + 1];
      i += 1;
    }
  }
  return result;
}

function normalizeBoolean(value) {
  if (value === undefined || value === null) return false;
  return Boolean(value);
}

function extractWebhookDetails(workflow) {
  if (!workflow?.nodes) {
    return [];
  }

  return workflow.nodes
    .filter((node) => node.type === 'n8n-nodes-base.webhook')
    .map((node) => {
      const parameters = node.parameters || {};
      return {
        workflowId: workflow.id,
        workflowName: workflow.name,
        nodeName: node.name,
        nodeDisabled: node.disabled === true,
        path: parameters.path ?? null,
        webhookId: node.webhookId ?? null,
        httpMethod: parameters.httpMethod ?? 'POST',
        responseMode: parameters.responseMode ?? null,
        restartWebhook: normalizeBoolean(parameters.restartWebhook),
        isFullPath: normalizeBoolean(parameters.isFullPath),
        hasWebhookId: Boolean(node.webhookId),
        rawParameters: parameters,
      };
    });
}

async function main() {
  const { output } = parseArgs();
  const report = {
    timestamp: new Date().toISOString(),
    analytics: {
      totalWorkflows: 0,
      totalWebhookNodes: 0,
      nodesMissingWebhookId: 0,
      nodesDisabled: 0,
    },
    webhooks: [],
  };

  try {
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

    report.analytics.totalWorkflows = crewWorkflows.length;

    const webhookDetails = [];

    for (const wfSummary of crewWorkflows) {
      const fullWorkflow = await fetchWorkflow(wfSummary.id);
      if (!fullWorkflow) {
        webhookDetails.push({
          workflowId: wfSummary.id,
          workflowName: wfSummary.name,
          error: 'Unable to fetch workflow details via REST API.',
        });
        continue;
      }

      const nodes = extractWebhookDetails(fullWorkflow);
      if (nodes.length === 0) {
        webhookDetails.push({
          workflowId: fullWorkflow.id,
          workflowName: fullWorkflow.name,
          warning: 'No webhook nodes detected.',
        });
      } else {
        webhookDetails.push(...nodes);
      }
    }

    report.analytics.totalWebhookNodes = webhookDetails.filter(
      (entry) => !entry.error && !entry.warning
    ).length;

    const baselineNodes = webhookDetails.filter(
      (entry) =>
        !entry.error &&
        !entry.warning &&
        entry.workflowName.includes("Miles O'Brien")
    );

    const baselineSummary = {
      total: baselineNodes.length,
      webhookIdPresence: baselineNodes.map((entry) => entry.hasWebhookId),
    };

    report.analytics.baseline = baselineSummary;

    webhookDetails.forEach((entry) => {
      if (entry.hasWebhookId === false) {
        report.analytics.nodesMissingWebhookId += 1;
      }
      if (entry.nodeDisabled === true) {
        report.analytics.nodesDisabled += 1;
      }

      if (!entry.error && !entry.warning) {
        entry.comparisonToBrien =
          baselineNodes.length > 0
            ? {
                webhookIdMatches: baselineNodes.every((b) => b.hasWebhookId)
                  ? entry.hasWebhookId
                  : null,
                httpMethodMatches: baselineNodes.every(
                  (b) => b.httpMethod === baselineNodes[0].httpMethod
                )
                  ? entry.httpMethod === baselineNodes[0].httpMethod
                  : null,
                responseModeMatches: baselineNodes.every(
                  (b) => b.responseMode === baselineNodes[0].responseMode
                )
                  ? entry.responseMode === baselineNodes[0].responseMode
                  : null,
              }
            : null;
      }
    });

    report.webhooks = webhookDetails;

    const outputJson = JSON.stringify(report, null, 2);

    if (output) {
      const outPath = path.resolve(process.cwd(), output);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, outputJson, 'utf8');
      console.log(`📝 Webhook analysis written to ${outPath}`);
    } else {
      console.log(outputJson);
    }
  } catch (error) {
    console.error('❌ Failed to analyze webhooks:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}


