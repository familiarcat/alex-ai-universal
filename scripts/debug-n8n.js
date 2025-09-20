#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const zshrcPath = path.join(os.homedir(), '.zshrc');
const content = fs.readFileSync(zshrcPath, 'utf8');

console.log('🔍 Debugging N8N variable extraction...\n');

// Test the flexible regex
const flexibleRegex = /export\s+([A-Z_]+)=([^\n]+)/g;
let match;
const foundVars = {};

while ((match = flexibleRegex.exec(content)) !== null) {
  const [, key, value] = match;
  const cleanValue = value.replace(/^["']|["']$/g, '').trim();
  foundVars[key] = cleanValue;
}

console.log('Found variables with flexible regex:');
Object.entries(foundVars).forEach(([key, value]) => {
  if (key.includes('N8N') || key.includes('SUPABASE') || key.includes('OPENAI')) {
    console.log(`  ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  }
});

console.log('\nSpecific N8N variables:');
console.log(`  N8N_API_URL: ${foundVars.N8N_API_URL || 'NOT FOUND'}`);
console.log(`  N8N_API_KEY: ${foundVars.N8N_API_KEY ? 'FOUND' : 'NOT FOUND'}`);
console.log(`  N8N_URL: ${foundVars.N8N_URL || 'NOT FOUND'}`);
console.log(`  N8N_BASE_URL: ${foundVars.N8N_BASE_URL || 'NOT FOUND'}`);

// Test the mapping logic
const mappings = {
  'N8N_API_URL': foundVars.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1',
  'N8N_API_KEY': foundVars.N8N_API_KEY,
  'N8N_WEBHOOK_URL': foundVars.N8N_WEBHOOK_URL || 'https://n8n.pbradygeorgen.com/webhook',
  'SUPABASE_URL': foundVars.SUPABASE_URL,
  'SUPABASE_ANON_KEY': foundVars.SUPABASE_ANON_KEY || foundVars.SUPABASE_KEY,
  'OPENAI_API_KEY': foundVars.OPENAI_API_KEY,
};

console.log('\nMapped variables:');
Object.entries(mappings).forEach(([key, value]) => {
  console.log(`  ${key}: ${value ? 'FOUND' : 'NOT FOUND'}`);
});
