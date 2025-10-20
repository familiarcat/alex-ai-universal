#!/usr/bin/env node
/**
 * Sync project-specific tokens from a single Figma file using prefixed Variables.
 * Usage:
 *   FIGMA_TOKEN=... FIGMA_FILE_KEY=... node scripts/figma-project-sync.js <projectId> <themeId>
 *
 * It writes universal-theme-system/project-overrides/<projectId>.json
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!FIGMA_TOKEN || !FILE_KEY) {
  console.error('FIGMA_TOKEN and FIGMA_FILE_KEY required');
  process.exit(1);
}

function figmaGet(endpoint) {
  const opts = {
    hostname: 'api.figma.com',
    path: `/v1${endpoint}`,
    method: 'GET',
    headers: { 'X-FIGMA-TOKEN': FIGMA_TOKEN }
  };
  return new Promise((resolve, reject) => {
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { reject(new Error('Bad JSON')); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function colorToHex({ r, g, b }) {
  const to = (v) => Math.round(v * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mapVariablesToTokens(vars, prefixes) {
  const tokens = {};
  const setToken = (name, value) => { if (value != null) tokens[name] = value; };
  for (const v of vars || []) {
    if (!v || !v.name || !v.valuesByMode) continue;
    const n = v.name.toLowerCase();
    if (prefixes?.length && !prefixes.some((p) => n.startsWith(p))) continue;

    const anyMode = Object.values(v.valuesByMode)[0];
    let value = null;
    if (anyMode && typeof anyMode === 'object' && 'r' in anyMode && 'g' in anyMode && 'b' in anyMode) value = colorToHex(anyMode);
    else if (typeof anyMode === 'number') value = anyMode;
    else if (anyMode && typeof anyMode === 'object' && 'value' in anyMode) value = anyMode.value;

    if (n.includes('surface')) setToken('--surface', value);
    else if (n.includes('border')) setToken('--border', value);
    else if (n.includes('text-muted')) setToken('--text-muted', value);
    else if (n.includes('text')) setToken('--text', value);
    else if (n.includes('heading')) setToken('--heading', value);
    else if (n.includes('primary') && !n.includes('on-primary')) setToken('--primary-solid', value);
    else if (n.includes('on-primary')) setToken('--on-primary', value);
    else if (n.startsWith('spacing/') || n.startsWith('space/')) {
      const key = n.split('/')[1]?.replace(/[^a-z0-9-]/g, '-') || 'base';
      setToken(`--space-${key}`, value);
    } else if (n.startsWith('radius/')) {
      const key = n.split('/')[1]?.replace(/[^a-z0-9-]/g, '-') || 'md';
      setToken(`--radius-${key}`, value);
    } else if (n.startsWith('type/')) {
      const parts = n.split('/');
      const cat = parts[1] || 'body';
      const prop = parts[2] || 'size';
      setToken(`--type-${cat}-${prop}`, value);
    }
  }
  return tokens;
}

(async () => {
  const projectId = process.argv[2];
  const themeId = (process.argv[3] || 'gradient').toLowerCase();
  if (!projectId) {
    console.error('Usage: node scripts/figma-project-sync.js <projectId> <themeId>');
    process.exit(1);
  }

  try {
    const variables = await figmaGet(`/files/${FILE_KEY}/variables/local`);
    const prefixes = [
      `${projectId.toLowerCase()}/${themeId}/`,
      `${projectId.toLowerCase()}-${themeId}/`,
      `${themeId}/${projectId.toLowerCase()}/`,
      `${themeId}-project-${projectId.toLowerCase()}/`,
    ];
    const css = mapVariablesToTokens(variables?.meta?.variables, prefixes);
    const outDir = path.join(process.cwd(), 'universal-theme-system', 'project-overrides');
    fs.mkdirSync(outDir, { recursive: true });
    const outFile = path.join(outDir, `${projectId}.json`);
    fs.writeFileSync(outFile, JSON.stringify({ css }, null, 2));
    console.log('FIGMA_PROJECT_SYNC_OK', outFile);
  } catch (e) {
    console.error('FIGMA_PROJECT_SYNC_ERR', e.message);
    process.exit(1);
  }
})();


