#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function importFile(file) {
  // Copy the file into the container at a stable path, then import
  execSync(`docker cp "${file}" n8n-local:/files/import.json`, { stdio: 'inherit' });
  execSync(`docker exec n8n-local n8n import:workflow --input=/files/import.json`, { stdio: 'inherit' });
}

async function main() {
  const dir = process.argv[2] || 'exported-workflows';
  // Ensure /files exists inside container
  try { execSync('docker exec n8n-local sh -lc "mkdir -p /files"', { stdio: 'inherit' }); } catch {}
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    console.log(`Importing ${f}...`);
    importFile(path.join(dir, f));
  }
}

if (require.main === module) {
  main().catch(e => { console.error('❌', e.message); process.exit(1); });
}


