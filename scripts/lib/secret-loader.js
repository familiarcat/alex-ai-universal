// Unified secret loader for server-side scripts
// Prefers process.env; optionally falls back to ~/.zshrc for local dev

const fs = require('fs');
const os = require('os');
const path = require('path');

function parseZshrc(content) {
  const secrets = {};
  const re = /export\s+([A-Z0-9_]+)=["']?([^"'\n]+)["']?/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const key = m[1];
    const val = (m[2] || '').trim();
    secrets[key] = val;
  }
  return secrets;
}

function loadLocalFallback(keys) {
  try {
    const zshrc = path.join(os.homedir(), '.zshrc');
    if (!fs.existsSync(zshrc)) return {};
    const content = fs.readFileSync(zshrc, 'utf8');
    const found = parseZshrc(content);
    const out = {};
    keys.forEach(k => {
      if (found[k]) out[k] = found[k];
    });
    return out;
  } catch {
    return {};
  }
}

function loadSecrets(requiredKeys = []) {
  const out = {};
  requiredKeys.forEach(k => {
    if (process.env[k]) out[k] = process.env[k];
  });
  const missing = requiredKeys.filter(k => !out[k]);
  if (missing.length) {
    const fb = loadLocalFallback(missing);
    Object.assign(out, fb);
    // Populate process.env for downstream libraries
    Object.keys(fb).forEach(k => { if (!process.env[k]) process.env[k] = fb[k]; });
  }
  return out;
}

module.exports = { loadSecrets };


