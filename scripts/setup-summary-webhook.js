#!/usr/bin/env node
// Create (or find) a simple milestone summary webhook in n8n and try to activate it.

const https = require('https');

function req(method, urlString, headers = {}, body) {
  const u = new URL(urlString);
  const data = body ? Buffer.from(JSON.stringify(body)) : null;
  return new Promise((resolve, reject) => {
    const r = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + (u.search || ''),
      method,
      headers: { 'Content-Type': 'application/json', ...headers, ...(data ? { 'Content-Length': data.length } : {}) },
      timeout: 20000
    }, (res) => {
      let buf = '';
      res.on('data', c => buf += c);
      res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

async function main() {
  const { loadSecrets } = require('./lib/secret-loader');
  loadSecrets(['N8N_BASE_URL','N8N_API_KEY']);
  const base = (process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
  const key = process.env.N8N_API_KEY;
  if (!key) {
    console.log('SUMMARY_SETUP_SKIPPED Missing N8N_API_KEY');
    return;
  }
  const hdrs = { 'X-N8N-API-KEY': key };

  // List workflows and find existing summarizer
  const list = await req('GET', `${base}/api/v1/workflows`, hdrs);
  if (list.status >= 400) throw new Error(`List failed: ${list.status}`);
  const wfList = JSON.parse(list.body || '{}');
  const arr = Array.isArray(wfList?.data) ? wfList.data : Array.isArray(wfList) ? wfList : [];
  let wf = arr.find(w => (w.name || '').toLowerCase().includes('milestone summary webhook'));

  // Construct minimal workflow definition
  const name = 'Milestone Summary Webhook';
  const path = 'summarize-milestone';
  const codeJs = [
    'const input = $input.first().json.input || $input.first().json || {}',
    'const title = String(input.title || input.summary || "Milestone").trim()',
    'const bullets = (input.bullets || []).filter(Boolean).slice(0,6)',
    'const sentence = bullets.length ? bullets.join("; ") : ""',
    'const text = sentence ? `${title}: ${sentence}` : `${title} updated.`',
    'return { json: { summary: text } }'
  ].join('\n');

  const nodes = [
    { parameters: { httpMethod: 'POST', path, responseMode: 'responseNode', options: {} }, id: 'webhook', name: 'Milestone Summarizer Webhook', type: 'n8n-nodes-base.webhook', typeVersion: 1, position: [240, 300] },
    { parameters: { jsCode: codeJs }, id: 'summarize', name: 'Compose Summary', type: 'n8n-nodes-base.code', typeVersion: 2, position: [520, 300] },
    { parameters: { respondWith: 'json', responseBody: '={{ $json }}', options: {} }, id: 'respond', name: 'Return Summary', type: 'n8n-nodes-base.respondToWebhook', typeVersion: 1, position: [760, 300] }
  ];
  const connections = {
    'Milestone Summarizer Webhook': { main: [[{ node: 'Compose Summary', type: 'main', index: 0 }]] },
    'Compose Summary': { main: [[{ node: 'Return Summary', type: 'main', index: 0 }]] }
  };

  if (!wf) {
    const create = await req('POST', `${base}/api/v1/workflows`, hdrs, { name, nodes, connections, settings: { executionOrder: 'v1' } });
    if (create.status >= 400) throw new Error(`Create failed: ${create.status} ${create.body}`);
    wf = JSON.parse(create.body || '{}');
  }

  const id = wf.id || wf.data?.id;
  if (!id) throw new Error('No workflow id after create');

  // Try to activate
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

  const url = `${base.replace(/\/$/,'')}/webhook/${path}`;
  console.log('SUMMARY_URL', url);
  console.log('SUMMARY_ACTIVE', String(activated))
}

main().catch(e => { console.error('SUMMARY_SETUP_FAILED', e.message || e); process.exit(0); });


