#!/usr/bin/env node
// Force re-register production webhook URLs by toggling workflows via API, then probing the endpoints.

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

async function toggleWorkflow(base, hdrs, id) {
  // try explicit deactivate then activate to force webhook registration
  try { await req('POST', `${base}/api/v1/workflows/${id}/deactivate`, hdrs); } catch {}
  const act = await req('POST', `${base}/api/v1/workflows/${id}/activate`, hdrs);
  if (act.status >= 200 && act.status < 300) return true;
  // fallback PUT merge
  const cur = await req('GET', `${base}/api/v1/workflows/${id}`, hdrs);
  if (cur.status < 400) {
    const body = JSON.parse(cur.body || '{}');
    const putBody = { name: body.name, nodes: body.nodes, connections: body.connections, settings: body.settings, active: true };
    const put = await req('PUT', `${base}/api/v1/workflows/${id}`, hdrs, putBody);
    if (put.status >= 200 && put.status < 300) return true;
  }
  return false;
}

async function probe(url) {
  const payload = { ping: true };
  const u = new URL(url);
  const data = Buffer.from(JSON.stringify(payload));
  return new Promise((resolve) => {
    const r = https.request({ hostname: u.hostname, port: u.port || 443, path: u.pathname + (u.search || ''), method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }, timeout: 15000 }, (res) => {
      let buf = ''; res.on('data', c => buf += c); res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    r.on('error', (e) => resolve({ status: 0, body: e.message || String(e) }));
    r.write(data); r.end();
  });
}

async function main() {
  const { loadSecrets } = require('./lib/secret-loader');
  loadSecrets(['N8N_BASE_URL','N8N_API_KEY']);
  const base = (process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
  const key = process.env.N8N_API_KEY; if (!key) { console.log('FORCE_REGISTER_SKIPPED Missing N8N_API_KEY'); return; }
  const hdrs = { 'X-N8N-API-KEY': key, 'Authorization': `Bearer ${key}` };

  const list = await req('GET', `${base}/api/v1/workflows`, hdrs);
  if (list.status >= 400) throw new Error(`List failed: ${list.status}`);
  const wfList = JSON.parse(list.body || '{}');
  const arr = Array.isArray(wfList?.data) ? wfList.data : Array.isArray(wfList) ? wfList : [];

  const targets = [
    { name: 'Milestone Orchestrator', path: 'milestone-orchestrator' },
    { name: 'Milestone Summary Webhook', path: 'summarize-milestone' },
  ];

  for (const t of targets) {
    const wf = arr.find(w => (w.name || '').toLowerCase() === t.name.toLowerCase()) || arr.find(w => (w.name || '').toLowerCase().includes(t.path));
    if (!wf) { console.log(`FORCE_REGISTER_SKIP_NO_WF ${t.name}`); continue; }
    const id = wf.id || wf.data?.id; if (!id) { console.log(`FORCE_REGISTER_SKIP_NO_ID ${t.name}`); continue; }
    const ok = await toggleWorkflow(base, hdrs, id);
    console.log(`FORCE_REGISTER_TOGGLED ${t.name} active=${ok}`);
    const url = `${base}/webhook/${t.path}`;
    // wait briefly for registrar to attach
    await new Promise(r => setTimeout(r, 3000));
    const res = await probe(url);
    console.log(`FORCE_REGISTER_PROBE ${t.path} -> ${res.status}`);
  }
}

main().catch(e => { console.error('FORCE_REGISTER_FAILED', e.message || e); process.exit(0); });


