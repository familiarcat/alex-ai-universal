#!/usr/bin/env node

const https = require('https');

function getEnv(n, d) { return process.env[n] || d; }

function api(base, key, method, path, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, base);
    const data = body ? JSON.stringify(body) : null;
    const opt = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method,
      headers: { 'X-N8N-API-KEY': key, 'Content-Type': 'application/json' }
    };
    if (data) opt.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(opt, res => {
      let buf='';
      res.on('data', c => buf += c);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(buf)); } catch { resolve({ raw: buf }); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const base = getEnv('N8N_URL', 'https://n8n.pbradygeorgen.com');
  const key = getEnv('N8N_API_KEY');
  if (!key) { console.error('❌ N8N_API_KEY missing'); process.exit(1); }

  // If exists, exit
  const all = await api(base, key, 'GET', '/api/v1/workflows');
  const exists = (all.data || all).find(w => w.name === 'System Health Endpoint');
  if (exists) {
    console.log(`ℹ️ Health workflow already exists (${exists.id})`);
    process.stdout.write(String(exists.id));
    return;
  }

  const wf = {
    name: 'System Health Endpoint',
    nodes: [
      {
        id: '1',
        name: 'Health Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [300, 300],
        parameters: {
          httpMethod: 'GET',
          path: 'health',
          responseMode: 'responseNode'
        }
      },
      {
        id: '2',
        name: 'Respond',
        type: 'n8n-nodes-base.respondToWebhook',
        typeVersion: 1,
        position: [600, 300],
        parameters: {
          responseFormat: 'json',
          responseBody: '{"status":"ok"}',
          responseCode: 200
        }
      }
    ],
    connections: {
      'Health Webhook': { main: [ [ { node: 'Respond', type: 'main', index: 0 } ] ] }
    },
    settings: {},
    staticData: null
  };

  const created = await api(base, key, 'POST', '/api/v1/workflows', wf);
  console.log(`✅ Created health workflow ${created.id}`);
  process.stdout.write(String(created.id));
}

if (require.main === module) {
  main().catch(e => { console.error('❌', e.message); process.exit(1); });
}


