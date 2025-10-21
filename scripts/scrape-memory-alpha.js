#!/usr/bin/env node
/**
 * Scrape Memory Alpha character pages and store summaries in Supabase RAG via n8n.
 *
 * Usage:
 *   node scripts/scrape-memory-alpha.js [--plan PLAN_ID] [url1 url2 ...]
 *   (defaults to key crew members if no URLs are provided)
 */

const DEFAULT_TARGETS = [
  { crew: 'Captain Jean-Luc Picard', url: 'https://memory-alpha.fandom.com/wiki/Jean-Luc_Picard' },
  { crew: 'Commander Data', url: 'https://memory-alpha.fandom.com/wiki/Data' },
  { crew: 'Lieutenant Commander Geordi La Forge', url: 'https://memory-alpha.fandom.com/wiki/Geordi_La_Forge' },
  { crew: 'Deanna Troi', url: 'https://memory-alpha.fandom.com/wiki/Deanna_Troi' },
  { crew: 'Worf', url: 'https://memory-alpha.fandom.com/wiki/Worf' },
  { crew: 'Beverly Crusher', url: 'https://memory-alpha.fandom.com/wiki/Beverly_Crusher' },
  { crew: 'William T. Riker', url: 'https://memory-alpha.fandom.com/wiki/William_T._Riker' },
  { crew: 'Nyota Uhura', url: 'https://memory-alpha.fandom.com/wiki/Nyota_Uhura' },
  { crew: 'Quark', url: 'https://memory-alpha.fandom.com/wiki/Quark' },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { plan: '', urls: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--plan') out.plan = args[++i];
    else out.urls.push(args[i]);
  }
  return out;
}

function htmlToText(html) {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'AlexAI/1.0 (RAG scraper)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const paraMatch = html.match(/<p>([\s\S]*?)<\/p>/i);
  const title = titleMatch ? htmlToText(titleMatch[1]) : url;
  const para = paraMatch ? htmlToText(paraMatch[1]) : '';
  const summary = `${title}\n\n${para}\n\nSource: ${url}`;
  return { title, summary };
}

async function postToN8N(payload) {
  const base = (process.env.N8N_BASE_URL || process.env.N8N_URL || '').replace(/\/$/, '');
  const url = process.env.N8N_COLLAB_COMPLETE_WEBHOOK || process.env.N8N_COLLABORATION_WEBHOOK || (base ? `${base}/webhook/collaboration-complete` : '');
  if (!url) throw new Error('No N8N webhook URL configured');
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (res.ok) return { ok: true, status: res.status, body: await res.text() };
  // Fallback GET summary
  const qs = new URLSearchParams({ plan_id: payload.collaboration_result.plan_id, timestamp: payload.collaboration_result.timestamp, model: 'notes', topics: 'memory-alpha', findings: String(payload.collaboration_result.findings.length), budgets: '0', mode: 'summary' });
  const res2 = await fetch(`${url}?${qs.toString()}`);
  return { ok: res2.ok, status: res2.status, body: await res2.text() };
}

(async () => {
  const { plan, urls } = parseArgs();
  const now = new Date().toISOString();
  const planId = plan || `MEMORY_ALPHA_${now.slice(0, 10)}`;

  const targets = urls.length
    ? urls.map(u => ({ crew: 'Crew', url: u }))
    : DEFAULT_TARGETS;

  const findings = [];
  const crew_memories = [];
  for (const t of targets) {
    try {
      const page = await fetchPage(t.url);
      findings.push({ topic: `Memory Alpha: ${page.title}`, content: page.summary, cost_cents_estimate: 0, shared_by: [t.crew] });
      crew_memories.push({ crew_member: t.crew, topic: `Memory Alpha: ${page.title}`, content: page.summary, model: 'notes', plan_id: planId, timestamp: now });
    } catch (e) {
      findings.push({ topic: `Memory Alpha: ${t.url}`, content: `Failed to fetch: ${e.message || e}`, cost_cents_estimate: 0, shared_by: [t.crew] });
    }
  }

  const payload = { collaboration_result: { plan_id: planId, timestamp: now, model: 'notes', budgets: {}, findings }, crew_memories };
  const result = await postToN8N(payload);
  console.log(JSON.stringify({ planId, count: targets.length, result }, null, 2));
})();


