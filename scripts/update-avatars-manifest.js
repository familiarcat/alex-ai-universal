#!/usr/bin/env node
/**
 * Update Supabase avatars manifest with static CDN URLs, then the Lounge can render without scraping.
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE for write.
 *
 * Usage:
 *   node scripts/update-avatars-manifest.js "Name=url" ...
 * If no args, writes a default canonical map using static CDN links you provide later.
 */
const { createClient } = require('@supabase/supabase-js');

function parseArgs() {
  const args = process.argv.slice(2);
  const map = {};
  for (const p of args) {
    const [k, v] = p.split('=');
    if (k && v) map[k.toLowerCase()] = v;
  }
  return map;
}

(async () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE; // write access
  if (!url || !key) {
    console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE are required');
    process.exit(1);
  }
  const supabase = createClient(url, key);
  const map = parseArgs();
  const payload = JSON.stringify(map, null, 2);
  const { data, error } = await supabase.storage.from('avatars').upload('manifest.json', new Blob([payload], { type: 'application/json' }), { upsert: true, contentType: 'application/json' });
  if (error) {
    console.error('Upload failed:', error.message || error);
    process.exit(1);
  }
  console.log('Manifest updated:', Object.keys(map).length, 'entries');
})();


