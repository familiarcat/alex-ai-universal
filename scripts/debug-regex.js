#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const zshrcPath = path.join(os.homedir(), '.zshrc');
const content = fs.readFileSync(zshrcPath, 'utf8');

console.log('🔍 Debugging regex matching...\n');

// Test different regex patterns
const patterns = [
  /export\s+([A-Z_]+)=["']?([^"'\n]+)["']?/g,
  /export\s+([A-Z_]+)=["']([^"']+)["']/g,
  /export\s+([A-Z_]+)=([^"'\n]+)/g
];

patterns.forEach((pattern, index) => {
  console.log(`Pattern ${index + 1}: ${pattern}`);
  const matches = [];
  let match;
  while ((match = pattern.exec(content)) !== null) {
    const [, key, value] = match;
    if (key.includes('N8N') || key.includes('SUPABASE') || key.includes('OPENAI')) {
      matches.push({ key, value: value.substring(0, 50) + '...' });
    }
  }
  console.log(`  Matches: ${matches.length}`);
  matches.forEach(m => console.log(`    ${m.key}: ${m.value}`));
  console.log('');
});

// Test specific lines
console.log('Testing specific N8N lines:');
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('N8N_API')) {
    console.log(`Line ${index + 1}: ${line}`);
    const match = line.match(/export\s+([A-Z_]+)=["']?([^"'\n]+)["']?/);
    if (match) {
      console.log(`  Matched: ${match[1]} = ${match[2].substring(0, 50)}...`);
    } else {
      console.log(`  No match`);
    }
  }
});




