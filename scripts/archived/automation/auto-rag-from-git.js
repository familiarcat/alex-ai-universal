#!/usr/bin/env node
/**
 * Auto-derive Supabase RAG memories from recent git changes and post via n8n webhook.
 *
 * Usage:
 *   node scripts/auto-rag-from-git.js [--range HEAD~1..HEAD] [--plan PLAN_ID]
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function sh(cmd) {
  return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { range: 'HEAD~1..HEAD', plan: '' };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--range') out.range = args[++i];
    else if (args[i] === '--plan') out.plan = args[++i];
  }
  return out;
}

function crewForFile(file) {
  const f = file.toLowerCase();
  if (f.startsWith('dashboard/app') || f.startsWith('dashboard/components')) return 'Lieutenant Commander Geordi La Forge';
  if (f.startsWith('scripts') || f.includes('n8n')) return 'Lieutenant Uhura';
  if (f.includes('security') || f.includes('auth')) return 'Lieutenant Worf';
  if (f.startsWith('docs') || f.startsWith('milestones')) return 'Commander Data';
  if (f.includes('theme')) return 'Counselor Deanna Troi';
  return 'Captain Jean-Luc Picard';
}

async function postToN8N(payload) {
  const base = (process.env.N8N_BASE_URL || process.env.N8N_URL || '').replace(/\/$/, '');
  const url = process.env.N8N_COLLAB_COMPLETE_WEBHOOK || process.env.N8N_COLLABORATION_WEBHOOK || (base ? `${base}/webhook/collaboration-complete` : '');
  if (!url) throw new Error('No N8N webhook URL (N8N_* envs)');
  try {
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) return { ok: true, status: res.status, body: await res.text() };
    const txt = await res.text();
    // GET fallback (summary only)
    const qs = new URLSearchParams({ plan_id: payload.collaboration_result.plan_id, timestamp: payload.collaboration_result.timestamp, model: 'notes', topics: 'auto,rag,git', findings: String(payload.collaboration_result.findings.length), budgets: '0', mode: 'summary' });
    const res2 = await fetch(`${url}?${qs.toString()}`);
    return { ok: res2.ok, status: res2.status, body: await res2.text() };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

(async () => {
  const { range, plan } = parseArgs();
  const repoRoot = process.cwd();
  const files = sh(`git diff --name-only ${range}`).split('\n').filter(Boolean);
  if (!files.length) {
    console.log('No files changed in range', range);
    process.exit(0);
  }

  const now = new Date().toISOString();
  const planId = plan || `AUTO_RAG_${now.slice(0, 10)}`;

  const findings = [];
  const crew_memories = [];

  for (const file of files) {
    let diff = '';
    try { diff = sh(`git diff --unified=0 ${range} -- ${file}`); } catch {}
    const snippet = (diff || '').slice(0, 4000);
    const crew = crewForFile(file);
    const topic = `Change in ${file}`;
    const content = `File: ${file}\n\n${snippet}`;
    findings.push({ topic, content, cost_cents_estimate: 0, shared_by: [crew] });
    crew_memories.push({ crew_member: crew, topic, content, model: 'notes', plan_id: planId, timestamp: now });
  }

  const payload = {
    collaboration_result: { plan_id: planId, timestamp: now, model: 'notes', budgets: {}, findings },
    crew_memories
  };

  const res = await postToN8N(payload);
  console.log(JSON.stringify({ range, planId, files, result: res }, null, 2));
})();


