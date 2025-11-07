#!/usr/bin/env node
// Execute an n8n workflow by name via API, passing JSON payload; prints the returned data

const https = require('https');

function arg(name, def = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : def;
}

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
  const key = process.env.N8N_API_KEY; if (!key) { console.log('RUN_SKIPPED Missing N8N_API_KEY'); return; }
  const hdrs = { 'X-N8N-API-KEY': key, 'Authorization': `Bearer ${key}` };

  const name = arg('name');
  const payloadRaw = arg('payload', '{}');
  const payload = (() => { try { return JSON.parse(payloadRaw); } catch { return {}; } })();
  if (!name) { console.log('RUN_FAILED Missing --name'); return; }

  const list = await req('GET', `${base}/api/v1/workflows`, hdrs);
  if (list.status >= 400) { console.log('RUN_FAILED list', list.status); return; }
  const wfList = JSON.parse(list.body || '{}');
  const arr = Array.isArray(wfList?.data) ? wfList.data : Array.isArray(wfList) ? wfList : [];
  const wf = arr.find(w => (w.name || '').toLowerCase() === name.toLowerCase()) || arr.find(w => (w.name || '').toLowerCase().includes(name.toLowerCase()));
  if (!wf) { console.log('RUN_FAILED no_workflow'); return; }
  const id = wf.id || wf.data?.id; if (!id) { console.log('RUN_FAILED missing_id'); return; }

  // Execute by id with data
  const run = await req('POST', `${base}/api/v1/workflows/${id}/run`, hdrs, { data: payload });
  if (run.status >= 400) { console.log('RUN_FAILED http', run.status, run.body); return; }
  try {
    const json = JSON.parse(run.body || '{}');
    console.log('RUN_OK');
    console.log(JSON.stringify(json, null, 2));
  } catch {
    console.log('RUN_OK');
    console.log(run.body || '');
  }
}

main().catch(e => { console.log('RUN_FAILED', e.message || e); process.exit(0); });


