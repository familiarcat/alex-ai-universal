#!/usr/bin/env node
/**
 * Register Figma Webhooks for all configured file keys.
 * Env:
 *  - FIGMA_TOKEN (required)
 *  - FIGMA_WEBHOOK_SECRET (required)
 *  - WEBHOOK_BASE_URL (required) e.g., https://your-host
 *  - FIGMA_FILE_KEY_* per theme, e.g., FIGMA_FILE_KEY_GRADIENT=xxxx
 */

const https = require('https');

function getEnv(name, required = true) {
  const v = process.env[name];
  if (required && !v) {
    console.error(`Missing env: ${name}`);
    process.exit(1);
  }
  return v || '';
}

const FIGMA_TOKEN = getEnv('FIGMA_TOKEN');
const SECRET = getEnv('FIGMA_WEBHOOK_SECRET');
const BASE = getEnv('WEBHOOK_BASE_URL');

const endpoint = `${BASE.replace(/\/$/, '')}/api/integrations/figma/webhook`;

function postJson(path, body) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.figma.com',
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-FIGMA-TOKEN': FIGMA_TOKEN,
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  // Collect file keys from env
  const entries = Object.entries(process.env)
    .filter(([k, v]) => k.startsWith('FIGMA_FILE_KEY_') && v)
    .map(([k, v]) => ({ var: k, fileKey: v }));

  if (entries.length === 0) {
    console.error('No FIGMA_FILE_KEY_* variables found.');
    process.exit(1);
  }

  console.log(`Registering webhooks to: ${endpoint}`);
  let ok = 0, fail = 0;

  for (const { var: varName, fileKey } of entries) {
    const payload = {
      event_type: 'FILE_UPDATE',
      file_key: fileKey,
      endpoint,
      passcode: SECRET,
      description: `Alex AI auto for ${varName}`,
    };
    try {
      const res = await postJson('/v2/webhooks', payload);
      console.log(`OK ${varName} -> id=${res?.id || 'n/a'}`);
      ok++;
    } catch (e) {
      console.error(`FAIL ${varName}:`, e.message);
      fail++;
    }
  }

  console.log(`Done. Success: ${ok}, Failed: ${fail}`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Unexpected error:', e);
    process.exit(1);
  });
}


