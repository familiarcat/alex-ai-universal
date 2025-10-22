#!/usr/bin/env node

/**
 * Auto-ingest YouTube links into RAG via N8N using ~/.zshrc creds.
 * - Discovers active "Knowledge Base RAG" workflow and webhook path
 * - Enriches each YouTube URL to per-file payloads
 * - Merges to youtube-rag-payload.json
 * - POSTs to webhook
 *
 * Usage:
 *   node scripts/auto-youtube-ingest.js <url1> <url2> ...
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { N8NClient } = require('./n8n-cli-tools');

function log(msg) { console.log(`🖖 ${msg}`); }

async function discoverWebhookAndActivate() {
  const url = process.env.N8N_URL;
  const apiKey = process.env.N8N_API_KEY;
  if (!url || !apiKey) throw new Error('N8N_URL or N8N_API_KEY not set');
  const client = new N8NClient(url, apiKey);
  const workflows = await client.listWorkflows();
  const rag = workflows.data?.find(w => /Knowledge Base RAG/i.test(w.name)) || workflows.data?.[0];
  if (!rag) throw new Error('No workflows found to derive webhook');
  // Ensure active
  try { await client.activateWorkflow(rag.id); } catch (_) {}
  const wf = await client.getWorkflow(rag.id);
  const node = (wf.nodes || []).find(n => n.type === 'n8n-nodes-base.webhook');
  if (!node) throw new Error('No webhook node found');
  const pathPart = node.parameters?.path;
  if (!pathPart) throw new Error('Webhook path missing');
  return `${client.baseUrl}/webhook/${pathPart}`;
}

async function enrichAll(urls) {
  const outputs = [];
  urls.forEach((u, i) => {
    const out = `youtube${i + 1}.json`;
    execSync(`node scripts/enrich-youtube-to-rag.js "${u}" ${out}`, { stdio: 'inherit' });
    outputs.push(out);
  });
  const merged = { documents: [] };
  outputs.forEach((p) => {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    merged.documents.push(...(j.documents || []));
  });
  fs.writeFileSync('youtube-rag-payload.json', JSON.stringify(merged, null, 2));
  log(`Merged ${merged.documents.length} docs → youtube-rag-payload.json`);
}

async function postToWebhook(webhookUrl) {
  execSync(`node scripts/ingest-to-rag.js ${webhookUrl}`, { stdio: 'inherit' });
}

async function main() {
  const urls = process.argv.slice(2).filter(Boolean);
  if (urls.length === 0) {
    console.error('Usage: node scripts/auto-youtube-ingest.js <url1> <url2> ...');
    process.exit(1);
  }
  log('Discovering and activating webhook via N8N API...');
  const webhook = await discoverWebhookAndActivate();
  log(`Webhook: ${webhook}`);
  log('Enriching YouTube content...');
  await enrichAll(urls);
  log('Posting to webhook...');
  await postToWebhook(webhook);
  log('Done');
}

if (require.main === module) {
  main().catch((e) => { console.error('❌', e.message); process.exit(1); });
}


