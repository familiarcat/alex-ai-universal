#!/usr/bin/env node
/**
 * Convert custom `n8n-nodes-base.openRouter` nodes to standard HTTP Request nodes
 * configured for OpenRouter. This keeps node ids/names/positions and only
 * changes `type`, `typeVersion` and `parameters`.
 */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_DIRS = [
  'exported-workflows',
  'local-n8n/files/exported-workflows',
  'n8n-workflows',
  'packages',
];

const OPENROUTER_BASE = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api').replace(/\/$/, '');
const OPENROUTER_CHAT_URL = `${OPENROUTER_BASE}/v1/chat/completions`;

/**
 * Produce HTTP Request parameters with OpenRouter defaults.
 */
function makeHttpParameters() {
  return {
    requestMethod: 'POST',
    url: OPENROUTER_CHAT_URL,
    jsonParameters: true,
    sendBody: true,
    bodyParametersJson: '={{$json.body || $json}}',
    headerParametersUi: {
      parameter: [
        { name: 'Authorization', value: '={{"Bearer "+$env.OPENROUTER_API_KEY}}' },
        { name: 'HTTP-Referer', value: '={{$env.OPENROUTER_REFERER}}' },
        { name: 'X-Title', value: '={{$env.OPENROUTER_TITLE}}' },
        { name: 'Content-Type', value: 'application/json' },
      ],
    },
    options: {},
  };
}

function walk(dir, out = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full, out);
    } else if (e.isFile() && e.name.endsWith('.json')) {
      out.push(full);
    }
  }
  return out;
}

function convertFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.includes('"n8n-nodes-base.openRouter"')) return { changed: false };
  let json;
  try { json = JSON.parse(raw); } catch { return { changed: false }; }
  if (!Array.isArray(json.nodes)) return { changed: false };

  let modified = false;
  json.nodes = json.nodes.map((node) => {
    if (node && node.type === 'n8n-nodes-base.openRouter') {
      const newNode = { ...node };
      newNode.type = 'n8n-nodes-base.httpRequest';
      newNode.typeVersion = 4;
      newNode.parameters = makeHttpParameters();
      modified = true;
      return newNode;
    }
    return node;
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
  }
  return { changed: modified };
}

function main() {
  const files = TARGET_DIRS.flatMap((d) => walk(path.join(ROOT, d)));
  let scanned = 0, changed = 0;
  for (const f of files) {
    scanned += 1;
    const res = convertFile(f);
    if (res.changed) {
      changed += 1;
      console.log(`🔁 Converted OpenRouter node(s): ${path.relative(ROOT, f)}`);
    }
  }
  console.log(`\n✅ Done. Scanned: ${scanned} files, Converted: ${changed}.`);
}

main();




