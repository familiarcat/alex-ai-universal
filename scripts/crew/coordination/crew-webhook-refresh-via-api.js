#!/usr/bin/env node
'use strict';

/**
 * Automated crew webhook registration using the n8n REST API.
 *
 * This script:
 *   1. Logs into n8n using the owner credentials sourced from ~/.zshrc (via load-crew-credentials).
 *   2. Fetches all active crew/coordination workflows.
 *   3. Executes each workflow manually through /rest/workflows/{id}/run to force webhook registration.
 *   4. Verifies production webhook availability via /rest/webhooks/find.
 *   5. Prints a JSON summary that can be consumed by dashboards or automation.
 *
 * Requirements:
 *   - N8N_OWNER_API_KEY (preferred) or N8N_API_KEY
 *   - N8N_EMAIL and N8N_PASSWORD for session-based /rest access
 *   - Network access to the n8n instance defined by N8N_URL
 *
 * Usage:
 *   node scripts/crew-webhook-refresh-via-api.js
 *
 * Example output:
 *   {
 *     "timestamp": "2025-11-09T12:05:00.123Z",
 *     "baseUrl": "https://n8n.pbradygeorgen.com",
 *     "triggered": [
 *       {
 *         "workflowId": "...",
 *         "name": "CREW - Captain Jean-Luc Picard - Strategic Leadership - OpenRouter - Production",
 *         "status": "success",
 *         "waitingForWebhook": true,
 *         "webhookPaths": ["crew-captain-jean-luc-picard"]
 *       }
 *     ],
 *     "webhooks": [
 *       {
 *         "path": "crew-captain-jean-luc-picard",
 *         "method": "POST",
 *         "registered": true,
 *         "workflowId": "...",
 *         "workflowName": "CREW - Captain Jean-Luc Picard - Strategic Leadership - OpenRouter - Production"
 *       }
 *     ]
 *   }
 */

const axios = require('axios');
const path = require('node:path');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();
const n8nBaseUrl = (creds.n8n?.baseUrl || creds.n8n?.url || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
const apiKey = creds.n8n?.ownerApiKey || creds.n8n?.apiKey;
const email = creds.n8n?.email;
const password = creds.n8n?.password;

if (!apiKey) {
  console.error('❌ Missing N8N_OWNER_API_KEY or N8N_API_KEY in environment.');
  process.exit(1);
}

if (!email || !password) {
  console.error('❌ Missing N8N_EMAIL or N8N_PASSWORD in environment. Cannot obtain session cookie.');
  process.exit(1);
}

const apiClient = axios.create({
  baseURL: n8nBaseUrl,
  headers: {
    'X-N8N-API-KEY': apiKey,
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

let restClient;
let sessionCookie;

function ensureArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function ensureSession(force = false) {
  if (restClient && sessionCookie && !force) {
    return restClient;
}

  try {
    const response = await axios.post(
      `${n8nBaseUrl}/rest/login`,
      {
        emailOrLdapLoginId: email,
        password,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );

    const setCookie = response.headers['set-cookie'];
    const authCookie = Array.isArray(setCookie)
      ? setCookie.find((cookie) => cookie.startsWith('n8n-auth='))
      : setCookie;

    if (!authCookie) {
      console.error('❌ Session login succeeded but no n8n-auth cookie was returned.');
      return null;
    }

    sessionCookie = authCookie.split(';')[0];
    restClient = axios.create({
      baseURL: n8nBaseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
        Cookie: sessionCookie,
      },
      timeout: 30000,
    });

    return restClient;
  } catch (error) {
    console.error('❌ Failed to create owner session:', error.message);
    return null;
  }
}

async function fetchAllWorkflows() {
  const response = await apiClient.get('/api/v1/workflows');
  return response.data?.data || response.data || [];
}

async function fetchWorkflow(workflowId) {
  const client = await ensureSession();
  if (!client) return null;

  const response = await client.get(`/rest/workflows/${workflowId}`);
  return response.data?.data || response.data || null;
}

function sanitizeWorkflowData(workflow) {
  if (!workflow) return null;
  const {
    id,
    name,
    nodes,
    connections,
    settings,
    staticData,
    active,
    pinData,
    meta,
    tags,
    versionId,
  } = workflow;

  return {
    id,
    name,
    nodes,
    connections,
    settings: settings || {},
    staticData: staticData ?? null,
    active: active ?? false,
    pinData: pinData ?? null,
    meta: meta ?? null,
    tags: tags ?? [],
    versionId,
  };
}

function collectWebhookPaths(workflow) {
  if (!workflow?.nodes) return [];
  const paths = [];
  for (const node of workflow.nodes) {
    if (node.type === 'n8n-nodes-base.webhook') {
      const nodePath = node.parameters?.path;
      const method = node.parameters?.httpMethod || 'POST';
      if (nodePath) {
        paths.push({
          path: nodePath.replace(/^\/|\/$/g, ''),
          method,
          nodeName: node.name,
        });
      }
    }
  }
  return paths;
}

async function triggerWorkflow(workflow) {
  const client = await ensureSession();
  if (!client) {
    return {
      workflowId: workflow.id,
      name: workflow.name,
      status: 'error',
      error: 'Failed to obtain owner session',
      waitingForWebhook: false,
      webhookPaths: collectWebhookPaths(workflow).map((p) => p.path),
    };
  }

  const payload = {
    workflowData: sanitizeWorkflowData(workflow),
  };

  if (!payload.workflowData || !payload.workflowData.id) {
    return {
      workflowId: workflow.id,
      name: workflow.name,
      status: 'error',
      error: 'Workflow data missing ID',
      waitingForWebhook: false,
      webhookPaths: collectWebhookPaths(workflow).map((p) => p.path),
    };
  }

  try {
    const response = await client.post(`/rest/workflows/${workflow.id}/run`, payload);
    const waiting =
      response.data?.data?.waitingForWebhook ??
      response.data?.waitingForWebhook ??
      false;

    return {
      workflowId: workflow.id,
      name: workflow.name,
      status: 'success',
      waitingForWebhook: Boolean(waiting),
      webhookPaths: collectWebhookPaths(workflow).map((p) => p.path),
    };
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      await ensureSession(true);
    }
    return {
      workflowId: workflow.id,
      name: workflow.name,
      status: 'error',
      error: error.message,
      waitingForWebhook: false,
      webhookPaths: collectWebhookPaths(workflow).map((p) => p.path),
    };
  }
}

async function checkWebhookRegistration(pathInfo) {
  const client = await ensureSession();
  if (!client) {
    return {
      path: pathInfo.path,
      method: pathInfo.method,
      workflowId: pathInfo.workflowId,
      workflowName: pathInfo.workflowName,
      registered: false,
      error: 'No owner session',
    };
  }

  try {
    const response = await client.post('/rest/webhooks/find', {
      path: pathInfo.path,
      method: pathInfo.method,
    });
    const registered = Boolean(response.data?.data);
    return {
      path: pathInfo.path,
      method: pathInfo.method,
      workflowId: pathInfo.workflowId,
      workflowName: pathInfo.workflowName,
      registered,
      error: registered ? undefined : 'Webhook not registered',
    };
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) {
      await ensureSession(true);
    }
    return {
      path: pathInfo.path,
      method: pathInfo.method,
      workflowId: pathInfo.workflowId,
      workflowName: pathInfo.workflowName,
      registered: false,
      error: error.message,
    };
  }
}

async function main() {
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

    if (crewWorkflows.length === 0) {
      console.warn('⚠️  No active crew workflows detected.');
    }

    const triggerResults = [];
    const webhookChecks = [];

    for (const wfSummary of crewWorkflows) {
      const workflow = await fetchWorkflow(wfSummary.id);
      if (!workflow) {
        triggerResults.push({
          workflowId: wfSummary.id,
          name: wfSummary.name,
          status: 'error',
          error: 'Unable to fetch workflow via REST API',
          waitingForWebhook: false,
          webhookPaths: [],
        });
        continue;
      }

      const triggerResult = await triggerWorkflow(workflow);
      triggerResults.push(triggerResult);

      const webhookPaths = collectWebhookPaths(workflow);
      for (const info of webhookPaths) {
        webhookChecks.push(
          checkWebhookRegistration({
            ...info,
            workflowId: workflow.id,
            workflowName: workflow.name,
          })
        );
      }
    }

    const resolvedChecks = await Promise.all(webhookChecks);
    const summary = {
      timestamp: new Date().toISOString(),
      baseUrl: n8nBaseUrl,
      triggered: triggerResults,
      webhooks: resolvedChecks,
    };

    console.log(JSON.stringify(summary, null, 2));

    const anyFailures =
      triggerResults.some((result) => result.status !== 'success') ||
      resolvedChecks.some((check) => !check.registered);

    process.exit(anyFailures ? 1 : 0);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  fetchAllWorkflows,
  fetchWorkflow,
  collectWebhookPaths,
  sanitizeWorkflowData,
  triggerWorkflow,
  checkWebhookRegistration,
  ensureSession,
  n8nBaseUrl,
};



