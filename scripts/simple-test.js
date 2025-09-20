#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const zshrcPath = path.join(os.homedir(), '.zshrc');
const content = fs.readFileSync(zshrcPath, 'utf8');

console.log('🔍 Simple test...\n');

// Test specific lines
const lines = content.split('\n');
lines.forEach((line, index) => {
  if (line.includes('N8N_API')) {
    console.log(`Line ${index + 1}: ${line}`);
    const match = line.match(/export\s+([A-Z_]+)=([^\n]+)/);
    if (match) {
      console.log(`  Matched: ${match[1]} = ${match[2].substring(0, 50)}...`);
    } else {
      console.log(`  No match`);
    }
  }
});

// Test the regex directly
const testLine = "export N8N_API_URL=https://n8n.pbradygeorgen.com/api/v1";
console.log(`\nTesting: ${testLine}`);
const match = testLine.match(/export\s+([A-Z_]+)=([^\n]+)/);
if (match) {
  console.log(`  Matched: ${match[1]} = ${match[2]}`);
} else {
  console.log(`  No match`);
}



