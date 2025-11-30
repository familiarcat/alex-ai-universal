#!/usr/bin/env node
// Deploy a local n8n workflow JSON to a remote n8n via API and activate it.

const fs = require('fs');
const https = require('https');
const http = require('http');

function requestJSON(method, urlString, apiKey, body) {
  const url = new URL(urlString);
  const isHttps = url.protocol === 'https:';
  const payload = body ? Buffer.from(JSON.stringify(body)) : null;
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname + (url.search || ''),
    method,
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    timeout: 15000
  };
  if (payload) options.headers['Content-Length'] = payload.length;
  const client = isHttps ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: deploy-n8n-workflow.js <workflow.json>');
    process.exit(1);
  }
  const baseUrl = (process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
  const apiKey = process.env.N8N_API_KEY;
  if (!apiKey) {
    console.error('Missing N8N_API_KEY in env');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const workflow = {
    name: raw.name,
    nodes: raw.nodes,
    connections: raw.connections || {},
    settings: raw.settings || { executionOrder: 'v1' },
    staticData: raw.staticData ?? null
  };

  const list = await requestJSON('GET', `${baseUrl}/api/v1/workflows`, apiKey);
  if (list.status >= 400) throw new Error(`List failed: ${list.status}`);
  const arr = Array.isArray(list.data?.data) ? list.data.data : Array.isArray(list.data) ? list.data : [];
  const existing = arr.find(w => w.name === workflow.name);

  if (existing) {
    // Fetch existing full definition, merge nodes/settings, activate
    const cur = await requestJSON('GET', `${baseUrl}/api/v1/workflows/${existing.id}`, apiKey);
    const body = { ...cur.data, ...workflow, active: true };
    const res = await requestJSON('PUT', `${baseUrl}/api/v1/workflows/${existing.id}`, apiKey, body);
    if (res.status >= 400) throw new Error(`Update failed: ${res.status} ${JSON.stringify(res.data)}`);
    console.log(`✅ Updated and activated workflow: ${workflow.name}`);
  } else {
    const res = await requestJSON('POST', `${baseUrl}/api/v1/workflows`, apiKey, workflow);
    if (res.status >= 400) throw new Error(`Create failed: ${res.status} ${JSON.stringify(res.data)}`);
    // Activate newly created workflow
    const createdId = res.data?.id || res.data?.data?.id;
    if (createdId) {
      const cur = await requestJSON('GET', `${baseUrl}/api/v1/workflows/${createdId}`, apiKey);
      const act = await requestJSON('PUT', `${baseUrl}/api/v1/workflows/${createdId}`, apiKey, { ...cur.data, active: true });
      if (act.status >= 400) throw new Error(`Activation failed: ${act.status} ${JSON.stringify(act.data)}`);
    }
    console.log(`✅ Created and activated workflow: ${workflow.name}`);
  }
}

main().catch(err => {
  console.error('❌ Deployment failed:', err.message || err);
  process.exit(1);
});


