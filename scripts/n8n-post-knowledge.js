#!/usr/bin/env node
// Post a knowledge doc to the active RAG ingestion webhook

const https = require('https');

function arg(name, def = '') {
  const idx = process.argv.indexOf(`--${name}`);
  return idx > -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')
    ? process.argv[idx + 1]
    : def;
}

function post(urlString, json) {
  const data = Buffer.from(JSON.stringify(json));
  return new Promise((resolve, reject) => {
    const req = https.request(urlString, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
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
  const summary = arg('summary', 'Milestone');
  const features = arg('features', '').split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const tags = arg('tags', 'milestone').split(',').map(s => s.trim()).filter(Boolean);
  const endpoint = process.env.N8N_INGEST_URL || 'https://n8n.pbradygeorgen.com/webhook/ingest-knowledge';

  const payload = {
    title: summary,
    text: features.length ? `Features:\n- ${features.join('\n- ')}` : summary,
    tags,
    source: 'milestone',
    doc_id: `MILESTONE_${Date.now()}`
  };

  const res = await post(endpoint, payload);
  console.log('STATUS', res.status);
  if (res.body) console.log(res.body.slice(0, 500));
}

main().catch(err => { console.error('ERROR', err.message || err); process.exit(1); });


