#!/usr/bin/env node
// Verify latest knowledge entries via a read-only n8n webhook (controller layer)

const https = require('https');
const http = require('http');

function post(urlString, json) {
  const data = Buffer.from(JSON.stringify(json));
  return new Promise((resolve, reject) => {
    const client = urlString.startsWith('https') ? https : http;
    const req = client.request(urlString, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
      timeout: 15000
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const { loadSecrets } = require('./lib/secret-loader');
  loadSecrets(['N8N_VERIFY_URL','SUPABASE_URL','SUPABASE_ANON_KEY','SUPABASE_KEY']);
  const endpoint = process.env.N8N_VERIFY_URL || 'https://n8n.pbradygeorgen.com/webhook/knowledge-recent';
  const limit = Number(process.env.N8N_VERIFY_LIMIT || '5');
  try {
    const res = await post(endpoint, { limit });
    if (res.status < 400) {
      const json = JSON.parse(res.body || '{}');
      const items = Array.isArray(json.items) ? json.items : (Array.isArray(json) ? json : []);
      console.log(`Latest ${Math.min(items.length, limit)} knowledge titles (n8n):`);
      items.slice(0, limit).forEach((it) => {
        const title = it.title || it.document_title || it.name || '(untitled)';
        const ts = it.timestamp || it.created_at || '';
        console.log(`- ${title}${ts ? ' · ' + ts : ''}`);
      });
      return;
    }
  } catch {}

  // Fallback: query Supabase REST directly if configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('Verification fallback requires SUPABASE_URL and SUPABASE_ANON_KEY');
    process.exit(1);
  }

  const url = new URL(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/knowledge_base?select=title,created_at&order=created_at.desc&limit=${limit}`);
  const data = await new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      timeout: 15000
    }, (res) => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: b }));
    });
    req.on('error', reject);
    req.end();
  });

  if (data.status >= 400) {
    console.error('Supabase verification failed:', data.body?.slice(0, 400) || data.status);
    process.exit(1);
  }
  const items = JSON.parse(data.body || '[]');
  console.log(`Latest ${Math.min(items.length, limit)} knowledge titles (supabase):`);
  items.slice(0, limit).forEach((it) => {
    console.log(`- ${it.title || '(untitled)'} · ${it.created_at || ''}`);
  });
}

main().catch(err => { console.error('ERROR', err.message || err); process.exit(1); });


