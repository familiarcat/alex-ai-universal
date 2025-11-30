"use strict";

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function writeFileSafe(targetPath, content) {
  if (fs.existsSync(targetPath)) return false;
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
  return true;
}

function copyTemplate(name) {
  const tpl = path.join(__dirname, '..', 'templates', name);
  return fs.readFileSync(tpl, 'utf8');
}

function hasGh() {
  const r = spawnSync('gh', ['--version'], { stdio: 'ignore' });
  return r.status === 0;
}

function main() {
  const cwd = process.cwd();
  const wfPath = path.join(cwd, '.github', 'workflows', 'alex-triage.yml');
  const envExamplePath = path.join(cwd, '.env.example');
  const localEnvPath = path.join(cwd, '.env.local');
  const configPath = path.join(cwd, '.alex-ai', 'config.json');

  const wf = copyTemplate('alex-triage.yml');
  const envExample = copyTemplate('env.example');
  const config = copyTemplate('config.json');

  const added = [];
  if (writeFileSafe(wfPath, wf)) added.push(wfPath);
  if (writeFileSafe(envExamplePath, envExample)) added.push(envExamplePath);
  if (!fs.existsSync(localEnvPath)) {
    fs.writeFileSync(localEnvPath, '', 'utf8');
    added.push(localEnvPath);
  }
  if (writeFileSafe(configPath, config)) added.push(configPath);

  if (added.length) {
    console.log('Added:');
    for (const p of added) console.log('  ' + path.relative(cwd, p));
  } else {
    console.log('All Alex AI files already present.');
  }

  if (hasGh()) {
    console.log('\nTip: set secrets with:');
    console.log('  gh secret set ALEX_API_URL --body "https://your-endpoint"');
    console.log('  gh secret set ALEX_API_KEY --body "your-key"');
  } else {
    console.log('\nInstall GitHub CLI (gh) to set repo secrets easily.');
  }
}

main();


