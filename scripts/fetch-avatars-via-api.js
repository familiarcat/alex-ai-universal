#!/usr/bin/env node
/**
 * Resolve Memory Alpha CDN avatar URLs via MediaWiki API and send manifest to n8n.
 * n8n owns persistence (e.g., writing to Supabase), preserving DDD boundaries.
 */

const CREW = [
  'Captain Jean-Luc Picard',
  'Commander Data',
  'Lieutenant Commander Geordi La Forge',
  'Deanna Troi',
  'Worf',
  'Beverly Crusher',
  'William T. Riker',
  'Nyota Uhura',
  'Quark',
];

function titleFor(name) {
  // Map canonical name to Memory Alpha page title
  return name
    .replace(/ /g, '_')
    .replace(/^Lieutenant_Commander_Geordi_La_Forge$/, 'Geordi_La_Forge');
}

async function resolveThumb(name) {
  const title = titleFor(name);
  const api = `https://memory-alpha.fandom.com/api.php?action=query&format=json&prop=pageimages&pithumbsize=256&titles=${encodeURIComponent(title)}&origin=*`;
  const res = await fetch(api, { headers: { 'User-Agent': 'AlexAI/1.0 (Avatar resolver)' } });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json();
  const pages = json?.query?.pages || {};
  const first = Object.values(pages)[0] || {};
  const src = first?.thumbnail?.source || '';
  if (!src) throw new Error('no thumbnail');
  return src;
}

(async () => {
  const manifest = {};
  for (const name of CREW) {
    try {
      const thumb = await resolveThumb(name);
      manifest[name.toLowerCase()] = thumb;
    } catch (e) {
      manifest[name.toLowerCase()] = '';
    }
  }

  const webhook = process.env.N8N_AVATARS_MANIFEST_WEBHOOK || process.env.NEXT_PUBLIC_N8N_AVATARS_MANIFEST_WEBHOOK;
  if (!webhook) {
    console.error('N8N_AVATARS_MANIFEST_WEBHOOK is required');
    process.exit(1);
  }
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ manifest, source: 'alex-ai/fetch-avatars-via-api', ts: new Date().toISOString() })
  });
  if (!res.ok) {
    console.error('Webhook failed:', res.status, await res.text());
    process.exit(1);
  }
  console.log('Posted manifest with', Object.keys(manifest).length, 'entries to n8n');
})();


