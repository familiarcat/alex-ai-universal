#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

function env(name, def) { return process.env[name] || def; }

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  try { return await res.json(); } catch { return {}; }
}

async function main() {
  const N8N_URL = env('N8N_URL', 'https://n8n.pbradygeorgen.com');
  const N8N_API_KEY = env('N8N_API_KEY');
  if (!N8N_API_KEY) { console.error('❌ N8N_API_KEY missing'); process.exit(1); }

  const SSH_HOST = env('N8N_SSH_HOST', 'n8n.pbradygeorgen.com');
  const SSH_USER = env('N8N_SSH_USER', 'ubuntu');
  const SSH_KEY = env('N8N_SSH_PRIVKEY', `${process.env.HOME}/.ssh/id_rsa`);
  let CONTAINER = env('N8N_CONTAINER', 'federation-agency-n8n');
  // Detect actual container name on remote host
  try {
    const detect = execSync(
      `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${SSH_KEY} ${SSH_USER}@${SSH_HOST} "docker ps --format '{{.Names}} {{.Image}}' | awk '/n8nio\\/n8n|n8n/ {print \\$1; exit}'"`,
      { stdio: 'pipe' }
    ).toString().trim();
    if (detect) CONTAINER = detect;
  } catch {}

  console.log('[1/3] Fetching all workflows...');
  const wfResp = await fetchJson(`${N8N_URL}/api/v1/workflows`, {
    headers: { 'X-N8N-API-KEY': N8N_API_KEY }
  });
  const workflows = Array.isArray(wfResp) ? wfResp : (wfResp.data || []);
  const ids = workflows.map(w => w.id);
  console.log(`   → Found ${ids.length} workflows`);

  if (process.env.SKIP_ACTIVATE !== '1') {
    console.log('[2/3] Activating all workflows via SSH + container CLI and restarting once...');
    const idsArg = ids.join(' ');
    const cmd = `ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i ${SSH_KEY} ${SSH_USER}@${SSH_HOST} ` +
                `"bash -lc 'set -e; C=${CONTAINER}; [ -n \"$C\" ] || exit 1; for id in ${idsArg}; do echo Activating \"$id\"; docker exec \"$C\" n8n update:workflow --id \"$id\" --active=true || true; done; echo Restart; docker restart \"$C\" >/dev/null'"`;
    execSync(cmd, { stdio: 'inherit' });
    await new Promise(r => setTimeout(r, 12000));
  } else {
    console.log('[2/3] SKIP_ACTIVATE=1 set, skipping activation step');
  }

  console.log('[3/3] Probing webhooks and API execute...');
  const results = [];
  for (const wf of workflows) {
    try {
      const detail = await fetchJson(`${N8N_URL}/api/v1/workflows/${wf.id}`, {
        headers: { 'X-N8N-API-KEY': N8N_API_KEY }
      });
      const nodes = detail.nodes || [];
      const webhookNode = nodes.find(n => n.type === 'n8n-nodes-base.webhook');
      let webhook = { method: 'N/A', path: 'N/A', code: 0 };
      if (webhookNode) {
        const method = (webhookNode.parameters?.httpMethod || 'POST').toUpperCase();
        const path = webhookNode.parameters?.path;
        const url = `${N8N_URL}/webhook/${path}`;
        let code = 0;
        try {
          const res = await fetch(url, {
            method,
            headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
            body: method === 'POST' ? JSON.stringify({ probe: true, workflowId: wf.id }) : undefined
          });
          code = res.status;
        } catch { code = 0; }
        webhook = { method, path, code };
      }

      let apiExecute = { code: 0 };
      try {
        const res = await fetch(`${N8N_URL}/api/v1/workflows/${wf.id}/execute`, {
          method: 'POST',
          headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' },
          body: '{}'
        });
        apiExecute.code = res.status;
      } catch { apiExecute.code = 0; }

      results.push({ id: wf.id, name: wf.name, webhook, apiExecute });
    } catch (e) {
      results.push({ id: wf.id, name: wf.name, error: e.message });
    }
  }

  fs.writeFileSync('n8n-e2e-results.json', JSON.stringify(results, null, 2));
  const total = results.length;
  const passWebhook = results.filter(r => (r.webhook?.code || 0) >= 200 && (r.webhook?.code || 0) < 300).length;
  const passExec = results.filter(r => (r.apiExecute?.code || 0) >= 200 && (r.apiExecute?.code || 0) < 300).length;
  console.log(`\n[E2E Summary] Workflows: ${total} | Webhook 2xx: ${passWebhook} | API execute 2xx: ${passExec}`);
  console.log('Sample:', results.slice(0, 5));
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });


