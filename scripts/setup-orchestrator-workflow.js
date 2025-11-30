#!/usr/bin/env node
// Create/activate an orchestrator workflow that:
// Webhook (POST /webhook/milestone-orchestrator) -> HTTP Request (POST ingest-knowledge)
// -> HTTP Request (POST summarize-milestone) -> Respond

const https = require('https');

function req(method, urlString, headers = {}, body) {
  const u = new URL(urlString);
  const data = body ? Buffer.from(JSON.stringify(body)) : null;
  return new Promise((resolve, reject) => {
    const r = https.request({ hostname: u.hostname, port: u.port || 443, path: u.pathname + (u.search || ''), method, headers: { 'Content-Type': 'application/json', ...headers, ...(data ? { 'Content-Length': data.length } : {}) }, timeout: 20000 }, (res) => {
      let buf = ''; res.on('data', c => buf += c); res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    r.on('error', reject); if (data) r.write(data); r.end();
  });
}

async function main() {
  const { loadSecrets } = require('./lib/secret-loader');
  loadSecrets(['N8N_BASE_URL','N8N_API_KEY']);
  const base = (process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
  const key = process.env.N8N_API_KEY; if (!key) { console.log('ORCH_SETUP_SKIPPED Missing N8N_API_KEY'); return; }
  const hdrs = { 'X-N8N-API-KEY': key, 'Authorization': `Bearer ${key}` };

  const list = await req('GET', `${base}/api/v1/workflows`, hdrs);
  if (list.status >= 400) throw new Error(`List failed: ${list.status}`);
  const wfList = JSON.parse(list.body || '{}');
  const arr = Array.isArray(wfList?.data) ? wfList.data : Array.isArray(wfList) ? wfList : [];
  let wf = arr.find(w => (w.name || '').toLowerCase().includes('milestone orchestrator'));

  const name = 'Milestone Orchestrator';
  const webhookPath = 'milestone-orchestrator';
  const ingestUrl = `${base}/webhook/ingest-knowledge`;
  const summaryUrl = `${base}/webhook/summarize-milestone`;

  const nodes = [
    { parameters: { httpMethod: 'POST', path: webhookPath, responseMode: 'responseNode', options: {} }, id: 'webhook', name: 'Orchestrator Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 1, position: [180, 300] },
    { parameters: { requestMethod: 'POST', url: ingestUrl, jsonParameters: true, options: {}, sendBody: true, bodyParametersJson: '={"body": {"summary": $json.summary, "features": $json.features, "tags": $json.tags}}' }, id: 'ingest', name: 'Post to Ingest', type: 'n8n-nodes-base.httpRequest', typeVersion: 4, position: [440, 300] },
    { parameters: { requestMethod: 'POST', url: summaryUrl, jsonParameters: true, options: {}, sendBody: true, bodyParametersJson: '={"input": {"title": $json.summary || $json.title || "Milestone", "bullets": $json.features || [], "context": "Milestone summary"}}' }, id: 'summary', name: 'Get Summary', type: 'n8n-nodes-base.httpRequest', typeVersion: 4, position: [700, 300] },
    { parameters: { respondWith: 'json', responseBody: '={{ { ingestion: $node["Post to Ingest"].json || { ok: true }, summary: $json.summary || $json.output || $json.result || $json || "ok" } }}', options: {} }, id: 'respond', name: 'Respond', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1, position: [960, 300] }
  ];
  const connections = {
    'Orchestrator Webhook': { main: [[{ node: 'Post to Ingest', type: 'main', index: 0 }]] },
    'Post to Ingest': { main: [[{ node: 'Get Summary', type: 'main', index: 0 }]] },
    'Get Summary': { main: [[{ node: 'Respond', type: 'main', index: 0 }]] }
  };

  if (!wf) {
    const create = await req('POST', `${base}/api/v1/workflows`, hdrs, { name, nodes, connections, settings: { executionOrder: 'v1' } });
    if (create.status >= 400) throw new Error(`Create failed: ${create.status} ${create.body}`);
    wf = JSON.parse(create.body || '{}');
  }
  const id = wf.id || wf.data?.id; if (!id) throw new Error('No workflow id after create');

  let activated = false;
  const act = await req('POST', `${base}/api/v1/workflows/${id}/activate`, hdrs);
  if (act.status >= 200 && act.status < 300) activated = true;
  if (!activated) {
    const cur = await req('GET', `${base}/api/v1/workflows/${id}`, hdrs);
    if (cur.status < 400) {
      const body = JSON.parse(cur.body || '{}');
      const putBody = { name: body.name, nodes: body.nodes, connections: body.connections, settings: body.settings, active: true };
      const put = await req('PUT', `${base}/api/v1/workflows/${id}`, hdrs, putBody);
      if (put.status >= 200 && put.status < 300) activated = true;
    }
  }

  const url = `${base.replace(/\/$/,'')}/webhook/${webhookPath}`;
  console.log('ORCH_URL', url);
  console.log('ORCH_ACTIVE', String(activated));
}

main().catch(e => { console.error('ORCH_SETUP_FAILED', e.message || e); process.exit(0); });


