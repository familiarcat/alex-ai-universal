#!/usr/bin/env node
/**
 * Figma Token Sync
 * Pulls Figma Variables/Styles and maps to theme override JSON
 * Env: FIGMA_TOKEN, FIGMA_FILE_KEY
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
  const to = (v) => {
    const n = Math.round(v * 255);
    return n.toString(16).padStart(2, '0');
  };
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mapVariablesToTokens(vars) {
  const tokens = {};
  const setToken = (name, value) => {
    if (value == null) return;
    tokens[name] = value;
  };
  for (const v of vars || []) {
    if (!v || !v.name || !v.valuesByMode) continue;
    const anyMode = Object.values(v.valuesByMode)[0];
    let value = null;
    // Color
    if (anyMode && typeof anyMode === 'object' && 'r' in anyMode && 'g' in anyMode && 'b' in anyMode) {
      value = colorToHex(anyMode);
    } else if (typeof anyMode === 'number') {
      value = anyMode;
    } else if (anyMode && typeof anyMode === 'object' && 'value' in anyMode) {
      value = anyMode.value;
    }
    const n = v.name.toLowerCase();
    // Color tokens
    if (n.includes('surface')) setToken('--surface', value);
    else if (n.includes('border')) setToken('--border', value);
    else if (n.includes('text-muted')) setToken('--text-muted', value);
    else if (n.includes('text')) setToken('--text', value);
    else if (n.includes('heading')) setToken('--heading', value);
    else if (n.includes('primary') && !n.includes('on-primary')) setToken('--primary-solid', value);
    else if (n.includes('on-primary')) setToken('--on-primary', value);
    // Spacing (e.g., spacing/4 -> --space-4)
    else if (n.startsWith('spacing/') || n.startsWith('space/')) {
      const key = n.split('/')[1]?.replace(/[^a-z0-9-]/g, '-') || 'base';
      setToken(`--space-${key}`, value);
    }
    // Radius (radius/sm|md|lg or radius/8)
    else if (n.startsWith('radius/')) {
      const key = n.split('/')[1]?.replace(/[^a-z0-9-]/g, '-') || 'md';
      setToken(`--radius-${key}`, value);
    }
    // Typography
    else if (n.startsWith('type/')) {
      // e.g., type/heading-1/size or type/body/line-height
      const parts = n.split('/');
      const cat = parts[1] || 'body';
      const prop = parts[2] || 'size';
      setToken(`--type-${cat}-${prop}`, value);
    }
  }
  return tokens;
}

(async () => {
  try {
    const variables = await figmaGet(`/files/${FILE_KEY}/variables/local`);
    const merged = mapVariablesToTokens(variables?.meta?.variables);
    const outDir = path.join(process.cwd(), 'universal-theme-system', 'overrides');
    fs.mkdirSync(outDir, { recursive: true });
    const theme = process.argv[2] || 'gradient';
    const outFile = path.join(outDir, `${theme}.json`);
    fs.writeFileSync(outFile, JSON.stringify({ css: merged }, null, 2));
    console.log('FIGMA_SYNC_OK', outFile);
  } catch (e) {
    console.error('FIGMA_SYNC_ERR', e.message);
    process.exit(1);
  }
})();


