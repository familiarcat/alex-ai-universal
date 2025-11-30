#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

function getEnv(name, fallback) {
  return process.env[name] || fallback;
}

async function fetchJson(url, apiKey) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const options = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'X-N8N-API-KEY': apiKey,
        'Accept': 'application/json'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const base = getEnv('N8N_URL', 'https://n8n.pbradygeorgen.com');
  const key = getEnv('N8N_API_KEY');
  if (!key) {
    console.error('❌ N8N_API_KEY missing');
    process.exit(1);
  }
  const outDir = path.join(process.cwd(), 'exported-workflows');
  fs.mkdirSync(outDir, { recursive: true });

  const list = await fetchJson(`${base}/api/v1/workflows`, key);
  const workflows = list.data || list;
  for (const w of workflows) {
    const wf = await fetchJson(`${base}/api/v1/workflows/${w.id}`, key);
    const safe = {
      name: wf.name,
      nodes: wf.nodes,
      connections: wf.connections,
      settings: wf.settings || {},
      staticData: wf.staticData || null,
      active: Boolean(wf.active)
    };
    const file = path.join(outDir, `${w.id}-${w.name.replace(/[^a-z0-9_-]+/gi,'_')}.json`);
    fs.writeFileSync(file, JSON.stringify(safe, null, 2));
    console.log(`Exported ${w.name} -> ${file}`);
  }
}

if (require.main === module) {
  main().catch(e => { console.error('❌', e.message); process.exit(1); });
}


