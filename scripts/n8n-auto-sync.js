#!/usr/bin/env node
/*
 * n8n Auto Sync - endpoint discovery + import + activate via PUT
 */
const fs = require('fs');
const path = require('path');
const { N8NClient, importWorkflow } = require('./n8n-cli-tools.js');

async function discoverEndpoint(baseUrl, headers) {
  const candidates = [
    '/rest/workflows',
    '/api/v1/workflows',
    `/api/v1/projects/${process.env.N8N_PROJECT_ID || ''}/workflows`,
  ];
  for (const ep of candidates) {
    try {
      const res = await fetch(baseUrl.replace(/\/$/, '') + ep, { headers });
      if (res.ok) return ep;
    } catch {}
  }
  return null;
}

async function main() {
  const url = process.env.N8N_URL;
  const key = process.env.N8N_API_KEY;
  const project = process.env.N8N_PROJECT_ID;
  if (!url || !key) {
    console.error('❌ N8N_URL and N8N_API_KEY are required');
    process.exit(1);
  }
  const headers = {
    'Authorization': `Bearer ${key}`,
    'X-N8N-API-KEY': key,
  };
  if (project) headers['X-N8N-Project-ID'] = project;

  const endpoint = await discoverEndpoint(url, headers);
  if (!endpoint) {
    console.error('❌ Could not discover workflows endpoint (401/404 on candidates).');
    process.exit(1);
  }
  console.log(`ℹ️  Using endpoint: ${endpoint}`);

  const client = new N8NClient(url, key);

  const dir = path.join(process.cwd(), 'exported-workflows');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

  const results = { imported: [], skipped: [], activated: [], failed: [] };

  for (const f of files) {
    const full = path.join(dir, f);
    const json = JSON.parse(fs.readFileSync(full, 'utf8'));
    const hasLangchain = JSON.stringify(json).includes('@n8n/n8n-nodes-langchain');
    try {
      const { workflow } = await importWorkflow(client, full);
      results.imported.push(workflow.name);
      if (hasLangchain) {
        console.log(`⚠️  Skipping activation (LangChain nodes): ${workflow.name}`);
        results.skipped.push(workflow.name);
        continue;
      }
      // Activate via PUT active=true using client helper
      await client.activateWorkflow(workflow.id);
      results.activated.push(workflow.name);
      console.log(`✅ Activated: ${workflow.name}`);
    } catch (e) {
      console.error(`❌ ${f}: ${e.message}`);
      results.failed.push({ file: f, error: e.message });
    }
  }

  console.log('\n📊 Summary');
  console.log(`  Imported:  ${results.imported.length}`);
  console.log(`  Activated: ${results.activated.length}`);
  console.log(`  Skipped:   ${results.skipped.length} (LangChain nodes)`);
  console.log(`  Failed:    ${results.failed.length}`);
}

// lightweight fetch polyfill for Node 18+
const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

main().catch(e => { console.error('❌', e.message); process.exit(1); });


