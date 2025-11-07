#!/usr/bin/env node
// Verify latest executions for the Knowledge Base RAG Ingestion workflow via n8n API

const https = require('https');
const { execSync } = require('child_process');

function req(method, urlString, headers = {}, body) {
  const u = new URL(urlString);
  const data = body ? Buffer.from(JSON.stringify(body)) : null;
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + (u.search || ''),
      method,
      headers: { 'Content-Type': 'application/json', ...headers, ...(data ? { 'Content-Length': data.length } : {}) },
      timeout: 15000
    }, (res) => {
      let buf = '';
      res.on('data', (c) => (buf += c));
      res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const { loadSecrets } = require('./lib/secret-loader');
  // First pass: file parser fallback (~/.zshrc)
  loadSecrets(['N8N_BASE_URL','N8N_API_KEY']);
  // Second pass: spawn a login shell to source ~/.zshrc and merge env if still missing
  if (!process.env.N8N_API_KEY || !process.env.N8N_BASE_URL) {
    try {
      const out = execSync('bash -lc "source ~/.zshrc >/dev/null 2>&1 || true; echo N8N_BASE_URL=$N8N_BASE_URL; echo N8N_API_KEY=$N8N_API_KEY"', { stdio: ['ignore','pipe','ignore'] }).toString();
      out.trim().split('\n').forEach(line => {
        const idx = line.indexOf('=');
        if (idx > 0) {
          const k = line.slice(0, idx).trim();
          const v = line.slice(idx + 1).trim();
          if (k && v && !process.env[k]) process.env[k] = v;
        }
      });
    } catch {}
  }
  const base = (process.env.N8N_BASE_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
  const key = process.env.N8N_API_KEY;
  if (!key) {
    console.error('Missing N8N_API_KEY');
    process.exit(1);
  }
  const hdrs = { 'X-N8N-API-KEY': key, 'Authorization': `Bearer ${key}` };

  // List workflows and find ingestion workflow
  const wfRes = await req('GET', `${base}/api/v1/workflows`, hdrs);
  if (wfRes.status >= 400) throw new Error(`List failed: ${wfRes.status}`);
  const wfList = JSON.parse(wfRes.body || '{}');
  const arr = Array.isArray(wfList?.data) ? wfList.data : Array.isArray(wfList) ? wfList : [];
  // Prefer an active ingestion workflow
  const lower = (s) => (s || '').toLowerCase();
  const candidates = arr.filter(w => {
    const n = lower(w.name);
    return n.includes('knowledge base rag ingestion') || n.includes('ingestion (clean)') || n.includes('ingest-knowledge') || n.includes('ingest knowledge');
  });
  let wf = candidates.find(w => w.active) || candidates[0];
  if (!wf) {
    console.error('Could not find RAG ingestion workflow in n8n list');
    process.exit(1);
  }

  // Fetch executions for that workflow
  const execRes = await req('GET', `${base}/api/v1/executions?limit=5&workflowId=${encodeURIComponent(wf.id)}`, hdrs);
  if (execRes.status >= 400) throw new Error(`Executions failed: ${execRes.status}`);
  const execData = JSON.parse(execRes.body || '{}');
  const items = Array.isArray(execData?.data) ? execData.data : Array.isArray(execData) ? execData : [];
  console.log(`Workflow: ${wf.name} (active: ${wf.active})`);
  console.log(`Recent executions (up to 5):`);
  items.forEach(e => {
    console.log(`- ${e.id} · ${e.status || e.finished ? 'success' : 'unknown'} · started: ${e.startedAt} · finished: ${e.stoppedAt || e.finishedAt || ''}`);
  });
}

main().catch(e => { console.error('ERROR', e.message || e); process.exit(1); });


