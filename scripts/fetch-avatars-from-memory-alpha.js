#!/usr/bin/env node
/**
 * Fetch avatar images from Memory Alpha and upload to Supabase storage bucket 'avatars'.
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE (service key) to upload.
 *
 * Usage:
 *   node scripts/fetch-avatars-from-memory-alpha.js [name=url ...]
 * If none provided, uses a default crew map.
 */
const { createClient } = require('@supabase/supabase-js');

const DEFAULT = {
  'captain jean-luc picard': 'https://memory-alpha.fandom.com/wiki/Jean-Luc_Picard',
  'commander data': 'https://memory-alpha.fandom.com/wiki/Data',
  'lieutenant commander geordi la forge': 'https://memory-alpha.fandom.com/wiki/Geordi_La_Forge',
  'deanna troi': 'https://memory-alpha.fandom.com/wiki/Deanna_Troi',
  'worf': 'https://memory-alpha.fandom.com/wiki/Worf',
  'beverly crusher': 'https://memory-alpha.fandom.com/wiki/Beverly_Crusher',
  'william t. riker': 'https://memory-alpha.fandom.com/wiki/William_T._Riker',
  'nyota uhura': 'https://memory-alpha.fandom.com/wiki/Nyota_Uhura',
  'quark': 'https://memory-alpha.fandom.com/wiki/Quark'
};

// Preferred file names for Special:FilePath on Memory Alpha (can be overridden via CLI name=file)
const FILE_MAP_DEFAULT = {
  'captain jean-luc picard': 'Jean-Luc_Picard.jpg',
  'commander data': 'Data.jpg',
  'lieutenant commander geordi la forge': 'Geordi_La_Forge.jpg',
  'deanna troi': 'Deanna_Troi.jpg',
  'worf': 'Worf.jpg',
  'beverly crusher': 'Beverly_Crusher.jpg',
  'william t. riker': 'William_T._Riker.jpg',
  'nyota uhura': 'Nyota_Uhura.jpg',
  'quark': 'Quark.jpg'
};

function parseArgs() {
  const args = process.argv.slice(2);
  if (!args.length) return { urls: DEFAULT, files: FILE_MAP_DEFAULT };
  const urls = {};
  const files = { ...FILE_MAP_DEFAULT };
  for (const pair of args) {
    const [k, v] = pair.split('=');
    if (!k || !v) continue;
    if (v.toLowerCase().startsWith('http')) urls[k.toLowerCase()] = v;
    else files[k.toLowerCase()] = v; // treat as filename override
  }
  return { urls: Object.keys(urls).length ? urls : DEFAULT, files };
}

function htmlToImage(html) {
  // Try og:image first
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1];
  // Fallback first infobox image
  const img = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return img ? img[1] : '';
}

async function fetchImageUrl(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'AlexAI/1.0 (Avatar fetcher)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  // Prefer static CDN image if present
  const cdn = html.match(/https?:\/\/static\.wikia\.nocookie\.net\/memoryalpha\/images\/[^\s"']+\.(?:jpg|jpeg|png)/i);
  const imageUrl = (cdn && cdn[0]) || htmlToImage(html);
  if (!imageUrl) throw new Error('no image found');
  return imageUrl.startsWith('http') ? imageUrl : `https:${imageUrl}`;
}

async function uploadToSupabase(name, buffer, contentType) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE; // service role required for write
  if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE required');
  const supabase = createClient(url, key);
  const filename = `${name.replace(/[^a-z0-9]+/g, '_')}.jpg`;
  const { data, error } = await supabase.storage.from('avatars').upload(filename, buffer, { contentType, upsert: true });
  if (error) throw error;
  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(filename);
  return pub?.publicUrl || '';
}

(async () => {
  const { urls: targets, files: FILE_MAP } = parseArgs();
  const results = [];
  for (const [name, url] of Object.entries(targets)) {
    try {
      // Prefer Special:FilePath if we have a filename mapping
      let imgUrl = '';
      const file = FILE_MAP[name] || FILE_MAP[name.toLowerCase()];
      if (file) {
        imgUrl = `https://memory-alpha.fandom.com/wiki/Special:FilePath/${encodeURIComponent(file)}`;
      } else {
        imgUrl = await fetchImageUrl(url);
      }
      const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': 'AlexAI/1.0 (Avatar fetcher)', 'Referer': 'https://memory-alpha.fandom.com/wiki/Portal:Main' } });
      if (!imgRes.ok) throw new Error(`image HTTP ${imgRes.status}`);
      const buf = Buffer.from(await imgRes.arrayBuffer());
      const pub = await uploadToSupabase(name, buf, imgRes.headers.get('content-type') || 'image/jpeg');
      results.push({ name, source: url, image: pub || imgUrl, stored: Boolean(pub) });
    } catch (e) {
      results.push({ name, source: url, error: String(e.message || e) });
    }
  }
  console.log(JSON.stringify({ count: results.length, results }, null, 2));
})();


