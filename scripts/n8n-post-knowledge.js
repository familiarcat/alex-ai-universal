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
    const TIMEOUT_MS = 5000; // 5 second timeout
    let req;
    const timeout = setTimeout(() => {
      if (req) req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);

    req = https.request(
      urlString,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length },
        timeout: TIMEOUT_MS,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          clearTimeout(timeout);
          resolve({ status: res.statusCode, body });
        });
      },
    );
    req.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      clearTimeout(timeout);
      reject(new Error(`Request timeout after ${TIMEOUT_MS}ms`));
    });
    req.write(data);
    req.end();
  });
}

async function main() {
  const summary = arg('summary', 'Milestone');
  const features = arg('features', '')
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const tags = arg('tags', 'milestone')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const { loadSecrets } = require('./lib/secret-loader');
  loadSecrets(['N8N_ORCH_URL', 'N8N_INGEST_URL']);
  const orchUrl = process.env.N8N_ORCH_URL;
  const ingestUrl =
    process.env.N8N_INGEST_URL || 'https://n8n.pbradygeorgen.com/webhook/knowledge-ingest';

  // Base knowledge doc (for direct ingest)
  const knowledgeDoc = {
    title: summary,
    text: features.length ? `Features:\n- ${features.join('\n- ')}` : summary,
    tags,
    source: 'milestone',
    doc_id: `MILESTONE_${Date.now()}`,
  };

  // Orchestrator expects summary/features/tags
  const orchPayload = {
    summary,
    features,
    tags,
  };

  let target = ingestUrl;
  let body = knowledgeDoc;
  let usedOrchestrator = false;
  if (orchUrl) {
    target = orchUrl;
    body = orchPayload;
    usedOrchestrator = true;
  }

  const res = await post(target, usedOrchestrator ? body : { body: knowledgeDoc });
  console.log('STATUS', res.status);
  let printed = false;
  try {
    const json = JSON.parse(res.body || '{}');
    const summaryText = json.summary || json.output || json.result || json?.data?.summary;
    if (summaryText) {
      console.log('SUMMARY', String(summaryText).trim());
      printed = true;
    }
  } catch {}
  if (!printed) {
    // Fallback heuristic summary
    const sentence = features.length ? features.join('; ') : summary;
    console.log('SUMMARY', `${summary}: ${sentence}`);
  }
}

main().catch((err) => {
  console.error('ERROR', err.message || err);
  process.exit(1);
});


