#!/usr/bin/env node
/*
 * Post a milestone summary to n8n controller layer (no direct Supabase access).
 * Uses Crew Memory Storage webhook: /webhook/crew-memory-storage
 *
 * Usage:
 *   node scripts/n8n-post-milestone.js --summary "Compose flow shipped" \
 *     --features "Combined Wizard;Bento Editor;Advisor suggestions" \
 *     --tags compose,bento,advisors
 *
 * Env:
 *   N8N_URL (default: https://n8n.pbradygeorgen.com)
 */
const https = require('https');
const http = require('http');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : 'true';
      out[key] = val;
    }
  }
  return out;
}

async function postJson(urlString, body) {
  const url = new URL(urlString);
  const isHttps = url.protocol === 'https:';
  const payload = Buffer.from(JSON.stringify(body));
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname + (url.search || ''),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    },
    timeout: 15000
  };
  const client = isHttps ? https : http;
  return new Promise((resolve, reject) => {
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const args = parseArgs();
  const N8N_URL = (process.env.N8N_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, '');
  // Prefer RAG milestone storage workflow
  const webhook = `${N8N_URL}/webhook/milestone-storage`;

  const summary = args.summary || 'Milestone';
  const features = (args.features || '').split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const tags = (args.tags || 'milestone').split(',').map(s => s.trim()).filter(Boolean);

  const memory = {
    milestone_type: 'lcars_hallucination_integration',
    milestone_id: `MILESTONE_${Date.now()}`,
    technical_achievements: { items: features },
    crew_contributions: { system: { role: 'Controller', contribution: summary } },
    stress_test_results: { scenario: 'deployment', success: true },
    knowledge_insights: { notes: summary },
    tags
  };

  console.log(`📡 Posting milestone to n8n: ${webhook}`);
  const res = await postJson(webhook, { body: memory });
  console.log(`✅ n8n responded: HTTP ${res.status}`);
  if (res.body) console.log(res.body.slice(0, 500));
}

main().catch((err) => {
  console.error('❌ n8n milestone post failed:', err.message || err);
  process.exit(1);
});


