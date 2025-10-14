#!/usr/bin/env node

const https = require('https');

function getEnv(name, fallback) { return process.env[name] || fallback; }

function apiRequest(base, key, method, path, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, base);
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: u.hostname,
      port: u.port || 443,
      path: u.pathname + u.search,
      method,
      headers: {
        'X-N8N-API-KEY': key,
        'Content-Type': 'application/json'
      }
    };
    if (data) options.headers['Content-Length'] = Buffer.byteLength(data);
    const req = https.request(options, res => {
      let buf = '';
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
  const wfId = 'd9EJA1Q0uPsgX5H3';
  if (!key) { console.error('❌ N8N_API_KEY missing'); process.exit(1); }

  // 1) Fetch workflow
  const wf = await apiRequest(base, key, 'GET', `/api/v1/workflows/${wfId}`);

  // 2) Find LangChain splitter node(s)
  const nodes = wf.nodes || [];
  let changed = false;
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (typeof n.type === 'string' && n.type.startsWith('@n8n/n8n-nodes-langchain.')) {
      // Replace with core Function node performing chunking
      const newNode = {
        id: n.id,
        name: n.name || 'Text Chunker',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: n.position,
        parameters: {
          functionCode: `const text = $json.text || ($json.input || '') || '';
const size = $json.chunkSize || 1000;
const overlap = $json.chunkOverlap || 100;
const chunks = [];
for (let i = 0; i < text.length; i += Math.max(1, size - overlap)) {
  chunks.push({ chunk: text.slice(i, i + size) });
}
return chunks.map(c => ({ json: c }));`
        }
      };
      nodes[i] = newNode;
      changed = true;
    }
  }

  if (!changed) {
    console.log('ℹ️ No LangChain nodes found in workflow.');
    return;
  }

  // 3) Update (PUT) workflow without toggling active
  const updated = {
    name: wf.name,
    nodes: nodes,
    connections: wf.connections || {},
    settings: wf.settings || {},
    staticData: wf.staticData || null
  };
  await apiRequest(base, key, 'PUT', `/api/v1/workflows/${wfId}`, updated);
  console.log('✅ Workflow updated to remove LangChain nodes.');
}

if (require.main === module) {
  main().catch(e => { console.error('❌', e.message); process.exit(1); });
}


