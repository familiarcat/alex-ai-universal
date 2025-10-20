#!/usr/bin/env node
/*
  Innovation Day Executor
  - Reads latest or provided plan JSON (from scripts/innovation-day-runner.sh)
  - Coordinates shared queries to reduce duplication and token spend
  - Calls OpenRouter with strict per-crew budget caps (default $1)
  - Writes structured findings to crew-memories/active/innovation-day-findings-<timestamp>.json
  - Dry run supported via env INNOVATION_DRY_RUN=true
*/

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function findLatestPlan() {
  const dir = path.join(ROOT, 'crew-memories', 'active');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const plans = files.filter(f => f.startsWith('innovation-day-plan-') && f.endsWith('.json'));
  if (plans.length === 0) throw new Error('No plan file found. Run scripts/innovation-day-runner.sh first.');
  const latest = plans.sort().slice(-1)[0];
  return path.join(dir, latest);
}

function uniq(items) {
  return Array.from(new Set(items));
}

function buildSharedQueries(assignments) {
  // Flatten topics, normalize lowercase, deduplicate
  const pairs = [];
  for (const a of assignments) {
    for (const t of a.topics || []) {
      const key = String(t).trim().toLowerCase();
      if (key) pairs.push({ crew: a.crew, topic: key });
    }
  }
  const byTopic = new Map();
  for (const p of pairs) {
    if (!byTopic.has(p.topic)) byTopic.set(p.topic, new Set());
    byTopic.get(p.topic).add(p.crew);
  }
  // Shared query objects: one per topic with list of interested crew
  return Array.from(byTopic.entries()).map(([topic, set]) => ({ topic, crew: Array.from(set) }));
}

function pickModel(models) {
  // Prefer Claude Haiku 3.5 (configurable) for parallel, cost-efficient runs
  const preferred = process.env.PREFERRED_AGENT_MODEL || 'anthropic/claude-3-5-haiku';
  if (models.includes(preferred)) return preferred;

  // Fallback order
  const order = [
    preferred,
    'openai/gpt-4o-mini',
    'google/gemini-1.5-pro',
    'meta/llama-3.1-70b-instruct',
    'anthropic/claude-3-5-sonnet',
    'openai/gpt-4o'
  ];
  for (const m of order) if (models.includes(m)) return m;
  return models[0];
}

function getBudgetCentsForCrew(plan, crew) {
  // $1 per crew -> 100 cents
  return Math.round((plan.budgetUsdPerCrew ?? 1) * 100);
}

function centsUsedFromUsage(model, usage) {
  // Very conservative flat estimate: 0.1 cents per 1k tokens
  // Many mini models are around $0.15-$0.6 / 1M tokens; this keeps us under $1 easily.
  if (!usage) return 1; // minimal increment if unknown
  const total = (usage.input_tokens || 0) + (usage.output_tokens || 0);
  return Math.ceil(total / 1000 * 0.1);
}

async function queryOpenRouter(model, prompt, system) {
  const apiKey = process.env.OPENROUTER_API_KEY || '';
  const dry = String(process.env.INNOVATION_DRY_RUN || '').toLowerCase() === 'true';
  if (!apiKey && !dry) throw new Error('OPENROUTER_API_KEY is required (or set INNOVATION_DRY_RUN=true).');

  if (dry) {
    return {
      content: `DRY_RUN summary for: ${prompt.slice(0, 120)}...\n- Key insights...\n- Sources: https://example.com/doc, https://example.com/talk`,
      usage: { input_tokens: 300, output_tokens: 600 }
    };
  }

  const body = {
    model,
    messages: [
      system ? { role: 'system', content: system } : null,
      { role: 'user', content: prompt }
    ].filter(Boolean),
    max_tokens: 800,
    temperature: 0.5
  };

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://alex-ai-universal.local',
      'X-Title': 'Alex AI Innovation Day'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`OpenRouter error ${res.status}: ${txt}`);
  }
  const data = await res.json();
  const choice = data.choices && data.choices[0];
  return {
    content: choice?.message?.content || '',
    usage: data.usage || { input_tokens: 0, output_tokens: 0 }
  };
}

async function postFindingsToN8N(result) {
  const base = process.env.N8N_BASE_URL || process.env.N8N_URL || '';
  if (!base) {
    console.warn('N8N_BASE_URL/N8N_URL not set; skipping n8n storage webhook.');
    return { skipped: true };
  }
  const endpoint = process.env.N8N_COLLAB_COMPLETE_WEBHOOK 
    || process.env.N8N_COLLABORATION_WEBHOOK 
    || `${String(base).replace(/\/$/, '')}/webhook/collaboration-complete`;

  // Derive per-crew memory items from findings for easier ingestion downstream
  const crew_memories = [];
  const ts = result.timestamp || new Date().toISOString();
  for (const f of result.findings || []) {
    const crews = Array.isArray(f.shared_by) ? f.shared_by : [];
    for (const crew of crews) {
      crew_memories.push({
        crew_member: String(crew),
        topic: String(f.topic || ''),
        content: String(f.content || ''),
        cost_cents_estimate: Number(f.cost_cents_estimate || 0),
        model: String(result.model || ''),
        plan_id: String(result.plan_id || ''),
        timestamp: ts
      });
    }
  }

  const body = {
    collaboration_result: result,
    crew_memories
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timeout);
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      console.warn(`n8n webhook error ${res.status}: ${txt}`);
      return { ok: false, status: res.status, body: txt };
    }
    const json = await res.json().catch(() => ({}));
    return { ok: true, response: json };
  } catch (e) {
    console.warn(`n8n webhook failed: ${e.message || e}`);
    return { ok: false, error: String(e?.message || e) };
  }
}

function toCrewSlug(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fanoutCrewMemoriesToN8N(crew_memories) {
  const base = process.env.N8N_BASE_URL || process.env.N8N_URL || '';
  if (!base) return { skipped: true };
  const baseUrl = String(base).replace(/\/$/, '');
  let sent = 0; let ok = 0; let errors = 0;
  for (const mem of crew_memories) {
    const slug = toCrewSlug(mem.crew_member || '');
    if (!slug) continue;
    const path = `crew-${slug}`;
    const url = `${baseUrl}/webhook/${path}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mem)
      });
      sent++;
      if (res.ok) ok++; else errors++;
    } catch {
      sent++; errors++;
    }
  }
  return { ok: ok > 0, sent, okCount: ok, errorCount: errors };
}

async function main() {
  const planArgIdx = process.argv.indexOf('--plan');
  let planPath = planArgIdx > -1 ? process.argv[planArgIdx + 1] : '';
  if (planPath === 'latest' || !planPath) planPath = findLatestPlan();
  const plan = readJson(planPath);

  const system = 'You are part of a crew conducting an Innovation Day. Provide concise, high-signal findings with sources (links), practical actions, and risks. Assume 2 hours total across the team and $1 per crew member.';
  const model = pickModel(plan.models || plan.openrouter?.models || ['openai/gpt-4o-mini']);

  const shared = buildSharedQueries(plan.assignments || []);

  // Execute shared queries first to maximize reuse
  const findings = [];
  const perCrewCents = new Map();
  for (const a of plan.assignments || []) perCrewCents.set(a.crew, 0);

  for (const q of shared) {
    // Skip if every involved crew is already near cap (>95 cents)
    const oversubscribed = q.crew.every(c => (perCrewCents.get(c) || 0) >= getBudgetCentsForCrew(plan, c) - 5);
    if (oversubscribed) continue;

    const prompt = `Research topic: ${q.topic}.\nReturn:\n- Key insights\n- 3–5 authoritative sources (links)\n- 2 actionable proposals\n- Risks / tradeoffs`;
    let result;
    try {
      result = await queryOpenRouter(model, prompt, system);
    } catch (e) {
      result = { content: `Error: ${e.message}`, usage: { input_tokens: 0, output_tokens: 0 } };
    }

    const cents = centsUsedFromUsage(model, result.usage);
    // Split cost among interested crew
    const share = Math.max(1, Math.ceil(cents / q.crew.length));
    q.crew.forEach(c => perCrewCents.set(c, (perCrewCents.get(c) || 0) + share));

    findings.push({ topic: q.topic, model, usage: result.usage, cost_cents_estimate: cents, content: result.content, shared_by: q.crew });
  }

  // Summarize per-crew budgets
  const budgets = {};
  for (const [crew, cents] of perCrewCents.entries()) {
    budgets[crew] = { used_cents: cents, cap_cents: getBudgetCentsForCrew(plan, crew) };
  }

  const out = {
    plan_id: plan.id,
    timestamp: new Date().toISOString(),
    model,
    budgets,
    findings
  };

  const outDir = path.join(ROOT, 'crew-memories', 'active');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `innovation-day-findings-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  console.log(`✅ Innovation Day findings -> ${outFile}`);

  // Post to n8n so Supabase memory system can store per-crew findings
  const n8nPost = await postFindingsToN8N(out);
  if (n8nPost?.ok || n8nPost?.skipped) {
    console.log('✅ Findings delivered to n8n storage webhook');
  } else {
    console.log('⚠️  Findings not confirmed by n8n storage webhook');
    // Attempt per-crew fanout to existing crew webhooks to persist memories
    const crewFanout = await fanoutCrewMemoriesToN8N(
      (out.findings || []).flatMap(f => (Array.isArray(f.shared_by) ? f.shared_by : []).map(crew => ({
        crew_member: String(crew),
        topic: String(f.topic || ''),
        content: String(f.content || ''),
        cost_cents_estimate: Number(f.cost_cents_estimate || 0),
        model: String(out.model || ''),
        plan_id: String(out.plan_id || ''),
        timestamp: out.timestamp
      })))
    );
    console.log(`ℹ️  Crew fanout: sent=${crewFanout.sent || 0}, ok=${crewFanout.okCount || 0}, errors=${crewFanout.errorCount || 0}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });





