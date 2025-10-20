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
}

main().catch(err => { console.error(err); process.exit(1); });





