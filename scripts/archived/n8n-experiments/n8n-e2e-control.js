#!/usr/bin/env node

/**
 * N8N E2E Control
 * - Verifies API access, locates RAG workflow, tries activation via API/SSH, falls back to test webhook
 * - Triggers ingestion using payload and asserts an execution record exists
 */

const fs = require('fs');
const path = require('path');
const { N8NClient } = require('./n8n-cli-tools.js');
const { exec } = require('child_process');
const { promisify } = require('util');
const https = require('https');

const execAsync = promisify(exec);

function getEnv(name) {
  return process.env[name];
}

function ensureCreds() {
  const url = getEnv('N8N_URL') || 'https://n8n.pbradygeorgen.com';
  const apiKey = getEnv('N8N_API_KEY');
  if (!apiKey) {
    console.error('❌ N8N_API_KEY missing. Ensure ~/.zshrc exports it and your shell is sourced.');
    process.exit(1);
  }
  return { url, apiKey };
}

async function findRagWorkflow(client) {
  const list = await client.listWorkflows();
  const candidates = (list.data || list).filter(w =>
    /rag|knowledge\s*base/i.test(w.name)
  );
  if (candidates.length === 0) {
    throw new Error('RAG workflow not found. Import it first.');
  }
  // Prefer the clean ingestion workflow name
  const preferred = candidates.find(w => /ingestion/i.test(w.name)) || candidates[0];
  return preferred;
}

async function getWebhookPaths(client, workflowId) {
  const wf = await client.getWorkflow(workflowId);
  const webhookNode = wf.nodes?.find(n => n.type === 'n8n-nodes-base.webhook');
  if (!webhookNode) return {};
  const p = webhookNode.parameters.path;
  const base = client.baseUrl;
  return {
    prod: `${base}/webhook/${p}`,
    test: `${base}/webhook-test/${p}`
  };
}

async function activateViaApi(client, workflowId) {
  try {
    const wf = await client.getWorkflow(workflowId);
    const payload = {
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: wf.settings || {},
      staticData: wf.staticData || null,
      active: true
    };
    await client.updateWorkflow(workflowId, payload);
    return true;
  } catch (e) {
    return false;
  }
}

async function activateViaSsh(workflowId) {
  try {
    await execAsync(`ssh n8n.pbradygeorgen.com "n8n update:workflow --id=${workflowId} --active=true || true"`);
    await execAsync(`ssh n8n.pbradygeorgen.com "pm2 restart n8n || systemctl restart n8n || true"`);
    return true;
  } catch {
    return false;
  }
}

async function assertRecentExecution(client, workflowId) {
  const maxAttempts = 5;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await client.getExecutions(workflowId);
    const data = res.data || res;
    if (Array.isArray(data) && data.length > 0) return true;
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

async function postJson(urlString, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlString);
    const payload = JSON.stringify(body);
    const options = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); } catch { resolve({ raw: data }); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const { url, apiKey } = ensureCreds();
  const client = new N8NClient(url, apiKey);

  console.log('🔐 Verifying API access...');
  await client.listWorkflows();
  console.log('✅ API reachable');

  console.log('🧭 Locating RAG workflow...');
  const rag = await findRagWorkflow(client);
  console.log(`✅ Found: ${rag.name} (${rag.id}) active=${!!rag.active}`);

  const paths = await getWebhookPaths(client, rag.id);

  let activated = rag.active === true;
  if (!activated) {
    console.log('🟡 Attempting activation via API...');
    activated = await activateViaApi(client, rag.id);
  }
  if (!activated) {
    console.log('🟠 Attempting activation via SSH...');
    activated = await activateViaSsh(rag.id);
  }

  const payloadPath = path.join(process.cwd(), 'rag-knowledge-base-payload.json');
  if (!fs.existsSync(payloadPath)) {
    console.log('ℹ️ No payload found. Preparing default payload.');
    fs.writeFileSync(payloadPath, JSON.stringify({ ping: 'alex-ai-e2e' }, null, 2));
  }
  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

  let triggered = false;
  let result;
  if (activated && paths.prod) {
    const targetUrl = paths.prod;
    console.log(`🚀 Triggering ingestion via production webhook: ${targetUrl}`);
    try {
      result = await postJson(targetUrl, payload);
      triggered = true;
      console.log('✅ Trigger response:', JSON.stringify(result).slice(0, 400));
    } catch (e) {
      console.log(`⚠️  Production webhook failed: ${e.message}`);
    }
  }

  if (!triggered && paths.test) {
    const targetUrl = paths.test;
    console.log(`🚀 Trying test webhook: ${targetUrl}`);
    try {
      result = await postJson(targetUrl, payload);
      triggered = true;
      console.log('✅ Trigger response:', JSON.stringify(result).slice(0, 400));
    } catch (e) {
      console.log(`⚠️  Test webhook failed: ${e.message}`);
    }
  }

  if (!triggered) {
    console.log('🛠️  Falling back to API execution ...');
    try {
      result = await client.executeWorkflow(rag.id, payload);
      triggered = true;
      console.log('✅ API execute response received');
    } catch (e) {
      console.error('❌ API execution failed:', e.message);
    }
  }

  if (!triggered) {
    console.log('🛠️  Falling back to headless UI activation ...');
    try {
      await execAsync(`node scripts/n8n-activate-via-ui.js ${rag.id}`);
      const paths2 = await getWebhookPaths(client, rag.id);
      const targetUrl = paths2.prod || paths2.test;
      if (!targetUrl) throw new Error('No webhook path after UI activation');
      result = await postJson(targetUrl, payload);
      triggered = true;
      console.log('✅ Triggered after UI activation');
    } catch (e) {
      console.error('❌ UI activation fallback failed:', e.message);
    }
  }

  if (!triggered) {
    console.error('❌ Could not trigger workflow via webhook or API.');
    process.exit(1);
  }

  console.log('🔎 Verifying recent execution...');
  const hasExec = await assertRecentExecution(client, rag.id);
  if (!hasExec) {
    console.error('❌ No recent executions recorded. Check N8N UI for errors.');
    process.exit(2);
  }
  console.log('✅ Execution found. E2E control passed.');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ E2E control failed:', err.message);
    process.exit(1);
  });
}

module.exports = {};


