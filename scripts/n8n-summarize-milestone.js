#!/usr/bin/env node
// Ask controller (n8n) to summarize a milestone's scope from summary+features
// Requires N8N_SUMMARY_URL to point to a summarization webhook in n8n

const https = require('https');
const http = require('http');

function arg(name, def = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : def;
}

function post(urlString, json) {
  const isHttps = urlString.startsWith('https');
  const data = Buffer.from(JSON.stringify(json));
  return new Promise((resolve, reject) => {
    const req = (isHttps ? https : http).request(urlString, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
      timeout: 20000
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
  loadSecrets(['N8N_SUMMARY_URL']);
  const endpoint = process.env.N8N_SUMMARY_URL;
  if (!endpoint) {
    console.log('SUMMARY_SKIPPED No N8N_SUMMARY_URL set');
    return;
  }

  const summary = arg('summary', 'Milestone');
  const features = arg('features', '').split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const payload = {
    input: {
      type: 'milestone',
      title: summary,
      bullets: features,
      context: 'Summarize the scope and intent for non-technical stakeholders in 2-3 sentences.'
    }
  };

  const res = await post(endpoint, payload);
  if (res.status >= 400) {
    console.log(`SUMMARY_FAILED HTTP ${res.status}`);
    return;
  }
  try {
    const json = JSON.parse(res.body || '{}');
    const text = json.summary || json.output || json.result || res.body;
    console.log('SUMMARY_OK');
    console.log(String(text).trim());
  } catch {
    console.log('SUMMARY_OK');
    console.log((res.body || '').trim());
  }
}

main().catch(err => { console.log('SUMMARY_FAILED', err.message || err); process.exit(0); });


