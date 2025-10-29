"use strict";

const { spawnSync } = require('node:child_process');

function runGh(args) {
  const r = spawnSync('gh', args, { encoding: 'utf8' });
  return r;
}

function main() {
  const out = { ok: true, notes: [] };

  // gh auth
  const gh = runGh(['auth', 'status']);
  if (gh.status !== 0) {
    out.ok = false;
    out.notes.push('GitHub CLI not authenticated. Fix: gh auth login');
  }

  // secrets
  const secrets = runGh(['secret', 'list']);
  const list = secrets.status === 0 ? secrets.stdout : '';
  const hasUrl = /ALEX_API_URL/m.test(list);
  const hasKey = /ALEX_API_KEY/m.test(list);
  if (!hasUrl) {
    out.ok = false;
    out.notes.push('Missing repo secret ALEX_API_URL. Fix: gh secret set ALEX_API_URL --body "https://your-endpoint"');
  }
  if (!hasKey) {
    out.ok = false;
    out.notes.push('Missing repo secret ALEX_API_KEY. Fix: gh secret set ALEX_API_KEY --body "your-key"');
  }

  // permissions cannot be verified locally; provide guidance
  out.notes.push('Ensure workflow permissions: issues:write, pull-requests:write, contents:read');

  console.log(out.ok ? '✅ Verify passed' : '❌ Verify failed');
  out.notes.forEach(n => console.log('- ' + n));
  process.exitCode = out.ok ? 0 : 1;
}

main();


