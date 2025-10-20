#!/usr/bin/env node
/**
 * Figma Live Sync
 * Periodically pulls variables from a single master Figma file and
 * writes per-theme overrides for the app to read dynamically.
 *
 * Env:
 *  - FIGMA_TOKEN (required)
 *  - FIGMA_FILE_KEY_MASTER (required)
 *  - FIGMA_SYNC_INTERVAL_SEC (optional, default 120)
 */

const { spawn } = require('child_process');
const path = require('path');

const FIGMA_TOKEN = process.env.FIGMA_TOKEN || '';
const FILE_KEY = process.env.FIGMA_FILE_KEY_MASTER || '';
const INTERVAL_SEC = Number(process.env.FIGMA_SYNC_INTERVAL_SEC || '120');

if (!FIGMA_TOKEN || !FILE_KEY) {
  console.error('FIGMA_LIVE_SYNC_ERR Missing FIGMA_TOKEN or FIGMA_FILE_KEY_MASTER');
  process.exit(1);
}

const THEMES = [
  'gradient',
  'glassmorphism',
  'neumorphism',
  'material',
  'corporate',
  'midnight',
  'pastel',
  'neubrutalism',
  'organic',
  'cyberpunk',
];

const rootDir = path.join(__dirname, '..');
const syncScript = path.join(rootDir, 'scripts', 'figma-token-sync.js');

async function syncOne(theme) {
  return new Promise((resolve) => {
    const child = spawn('node', [syncScript, theme], {
      env: { ...process.env, FIGMA_FILE_KEY: FILE_KEY },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let out = '';
    let err = '';
    child.stdout.on('data', (d) => (out += d.toString()));
    child.stderr.on('data', (d) => (err += d.toString()));
    child.on('close', (code) => {
      const ok = code === 0;
      if (!ok) console.error(`FIGMA_LIVE_SYNC_THEME_ERR ${theme}:`, err.trim() || out.trim());
      resolve({ theme, ok });
    });
  });
}

async function syncAll() {
  const started = Date.now();
  const results = await Promise.all(THEMES.map(syncOne));
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  const ms = Date.now() - started;
  console.log(`FIGMA_LIVE_SYNC_OK ${ok}/${results.length} themes in ${ms}ms${fail ? `, failed: ${fail}` : ''}`);
}

let timer = null;
async function loop() {
  try {
    await syncAll();
  } catch (e) {
    console.error('FIGMA_LIVE_SYNC_ERR', e.message);
  } finally {
    timer = setTimeout(loop, INTERVAL_SEC * 1000);
  }
}

process.on('SIGINT', () => {
  if (timer) clearTimeout(timer);
  console.log('FIGMA_LIVE_SYNC_STOP');
  process.exit(0);
});

console.log(`FIGMA_LIVE_SYNC_START every ${INTERVAL_SEC}s from file ${FILE_KEY}`);
loop();




