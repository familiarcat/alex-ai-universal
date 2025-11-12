#!/usr/bin/env node
'use strict';

/**
 * Crew Collaboration Bootstrap
 * ----------------------------
 * Orchestrates the end-to-end setup that Cursor Chat should run before engaging
 * the Alex AI crew:
 *   1. Normalize webhooks across all crew/system workflows (sync + register)
 *   2. Trigger each workflow to verify the production/test webhooks are active
 *   3. Summon the Observation Lounge so the crew can produce an operational plan
 *
 * The script prints a concise summary to stdout and writes a JSON artifact to
 * reports/crew-collaboration-bootstrap-*.json for dashboards or RAG ingestion.
 */

const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');

const { syncWorkflows } = require('./n8n-sync-webhooks');
const {
  fetchAllWorkflows,
  fetchWorkflow,
  collectWebhookPaths,
  triggerWorkflow,
  checkWebhookRegistration,
  n8nBaseUrl,
} = require('./crew-webhook-refresh-via-api');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const webhookBase = `${n8nBaseUrl}/webhook`;

function color(code, text) {
  return process.stdout.isTTY ? `\u001b[${code}m${text}\u001b[0m` : text;
}

function loadMilestoneSnippets(limit = 3) {
  try {
    const files = fs
      .readdirSync(process.cwd())
      .filter((name) => /^MILESTONE.*\.md$/i.test(name))
      .map((name) => ({
        name,
        fullPath: path.join(process.cwd(), name),
        mtime: fs.statSync(path.join(process.cwd(), name)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, limit);

    return files.map(({ name, fullPath }) => ({
      file: name,
      excerpt: fs.readFileSync(fullPath, 'utf8').split('\n').slice(0, 20).join('\n'),
    }));
  } catch (error) {
    return [];
  }
}

async function ensureWebhookHealth() {
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

  const triggerResults = [];
  const registrationChecks = [];

  for (const wfSummary of crewWorkflows) {
    const workflow = await fetchWorkflow(wfSummary.id);
    if (!workflow) {
      triggerResults.push({
        workflowId: wfSummary.id,
        name: wfSummary.name,
        status: 'error',
        error: 'Unable to fetch workflow definition via REST API.',
      });
      continue;
    }

    triggerResults.push(await triggerWorkflow(workflow));

    const paths = collectWebhookPaths(workflow);
    for (const info of paths) {
      registrationChecks.push(
        checkWebhookRegistration({
          ...info,
          workflowId: workflow.id,
          workflowName: workflow.name,
        })
      );
    }
  }

  const registrations = await Promise.all(registrationChecks);
  return { triggerResults, registrations };
}

async function summonObservationLounge(summary) {
  const milestoneSnippets = loadMilestoneSnippets();
  const url = `${webhookBase}/observation-lounge`;

  const payload = {
    task: 'Establish default active-collaboration mode for Cursor Chat sessions.',
    summary,
    milestoneSnippets,
    timestamp: new Date().toISOString(),
    escalation: 'medium',
    meta: {
      source: 'crew-collaboration-bootstrap',
      goal: 'Ensure every Cursor session auto-enlists full crew with optimized OpenRouter models.',
    },
  };

  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
  });

  return response.data;
}

async function main() {
  console.log(color('1;35', '\n🚀 Crew Collaboration Bootstrap\n'));

  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const syncOutputPath = path.join(reportsDir, 'n8n-webhook-sync-latest.json');

  console.log(color('36', '1. Synchronizing webhook configuration...'));
  const syncSummary = await syncWorkflows({ dryRun: false, register: true, output: syncOutputPath });
  console.log(
    `   ✔ Updated ${syncSummary.nodesUpdated} webhook nodes across ${syncSummary.workflowsUpdated}/${syncSummary.workflowsChecked} workflows`
  );

  console.log(color('36', '\n2. Verifying active webhooks...'));
  const health = await ensureWebhookHealth();
  const triggerSuccess = health.triggerResults.filter((r) => r.status === 'success').length;
  const registrationSuccess = health.registrations.filter((r) => r.registered).length;
  console.log(`   ✔ Triggered ${triggerSuccess}/${health.triggerResults.length} workflows`);
  console.log(`   ✔ Webhooks registered: ${registrationSuccess}/${health.registrations.length}`);

  console.log(color('36', '\n3. Convening Observation Lounge for default-session plan...'));
  const loungeResponse = await summonObservationLounge({
    triggerResults: health.triggerResults,
    registrations: health.registrations,
    syncSummary: {
      workflowsUpdated: syncSummary.workflowsUpdated,
      nodesUpdated: syncSummary.nodesUpdated,
    },
  });
  console.log(color('32', '   ✔ Observation Lounge response received'));

  const artifact = {
    generatedAt: new Date().toISOString(),
    syncSummary,
    triggerResults: health.triggerResults,
    registrations: health.registrations,
    observationLounge: loungeResponse,
  };

  const outPath = path.join(
    reportsDir,
    `crew-collaboration-bootstrap-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );
  fs.writeFileSync(outPath, JSON.stringify(artifact, null, 2), 'utf8');

  console.log(color('1;34', `\n📄 Session artifact saved to ${path.relative(process.cwd(), outPath)}\n`));
  console.log(color('1;32', '✅ Crew automation ready for Cursor default engagement.\n'));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(color('31', `\n❌ Bootstrap failure: ${error.message}`));
    if (error.response?.data) {
      console.error(color('31', JSON.stringify(error.response.data, null, 2)));
    }
    process.exit(1);
  });
}


