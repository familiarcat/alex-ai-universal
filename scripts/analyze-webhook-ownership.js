#!/usr/bin/env node

/**
 * 🔍 Analyze webhook ownership and status across crew workflows.
 *
 * Output: reports/webhook-analysis.json with ownership, paths, and live status
 */

'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const creds = loadCrewCredentials();

if (!creds.n8n.apiKey) {
  console.error('❌ N8N API key not found. Set N8N_OWNER_API_KEY or N8N_API_KEY.');
  process.exit(1);
}

const client = axios.create({
  baseURL: creds.n8n.baseUrl,
  headers: {
    'X-N8N-API-KEY': creds.n8n.apiKey,
    'Content-Type': 'application/json',
  },
  timeout: 20000,
  withCredentials: true,
});

function printInfo(msg) {
  console.log(`ℹ️  ${msg}`);
}

async function fetchWorkflows() {
  try {
    const { data } = await client.get('/rest/workflows');
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
      const { data } = await client.get('/api/v1/workflows');
      return Array.isArray(data?.data) ? data.data : data;
    }
    throw error;
  }
}

async function fetchDetail(id) {
  try {
    const { data } = await client.get(`/rest/workflows/${id}`);
    return data;
  } catch (error) {
    if (error.response?.status === 401 || error.response?.status === 403 || error.response?.status === 404) {
      const { data } = await client.get(`/api/v1/workflows/${id}`);
      return data;
    }
    throw error;
  }
}

async function testWebhook(path, method) {
  const url = `${creds.n8n.baseUrl}/webhook/${path}`;
  const payload = {
    source: 'analyze-webhook-ownership',
    timestamp: new Date().toISOString(),
  };
  try {
    const response = await axios({
      method,
      url,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
      data: method === 'GET' || method === 'DELETE' ? undefined : payload,
      params: method === 'GET' || method === 'DELETE' ? payload : undefined,
    });
    return { success: true, status: response.status };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status ?? 0,
      message: error.message,
    };
  }
}

function extractOwners(workflow) {
  const owners = [];
  if (workflow.ownedBy) {
    owners.push({
      role: workflow.ownedBy.role || 'owner',
      userId: workflow.ownedBy.id || workflow.ownedBy.userId,
      email: workflow.ownedBy.email || workflow.ownedBy.user?.email,
    });
  }
  if (Array.isArray(workflow.shared)) {
    workflow.shared.forEach((share) => {
      owners.push({
        role: share.role,
        userId: share.user?.id,
        email: share.user?.email,
      });
    });
  }
  return owners.filter((o) => o.userId || o.email);
}

async function main() {
  printInfo('Fetching workflows...');
  const all = await fetchWorkflows();
  const crewWorkflows = all.filter((wf) =>
    /CREW|COORDINATION|KNOWLEDGE INGEST|ANTI-HALLUCINATION|PROJECT/i.test(wf.name)
  );
  printInfo(`Analyzing ${crewWorkflows.length} crew/coordination workflows`);

  const results = [];

  for (const wf of crewWorkflows) {
    const detail = await fetchDetail(wf.id);
    const owners = extractOwners(detail);
    const webhookNodes = (detail.nodes || []).filter(
      (node) => node.type === 'n8n-nodes-base.webhook'
    );

    const paths = [];
    for (const node of webhookNodes) {
      const method = (node.parameters?.httpMethod || 'POST').toUpperCase();
      const pathParam = node.parameters?.path;
      if (!pathParam) continue;
      const status = await testWebhook(pathParam, method);
      paths.push({
        nodeName: node.name,
        path: pathParam,
        method,
        status,
      });
    }

    results.push({
      id: detail.id,
      name: detail.name,
      active: detail.active,
      createdAt: detail.createdAt,
      updatedAt: detail.updatedAt,
      owners,
      webhookCount: webhookNodes.length,
      webhooks: paths,
    });
  }

  const reportDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  const filePath = path.join(reportDir, `webhook-analysis-${Date.now()}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2));
  printInfo(`Report saved to ${filePath}`);

  const working = results
    .filter((r) => r.webhooks.some((w) => w.status.success))
    .map((r) => ({ name: r.name, owner: r.owners }));
  const failing = results.filter((r) => r.webhooks.every((w) => !w.status.success));

  console.log('\n=== Webhooks Working ===');
  working.forEach((w) => console.log(`   • ${w.name}`));

  console.log('\n=== Webhooks Failing ===');
  failing.forEach((wf) => {
    console.log(`   • ${wf.name} — owners: ${wf.owners.map((o) => o.email || o.userId).join(', ') || 'unknown'}`);
  });
}

main().catch((error) => {
  console.error('❌ Fatal error:', error.message || error);
  process.exit(1);
});

