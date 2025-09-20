#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const zshrcPath = path.join(os.homedir(), '.zshrc');
const content = fs.readFileSync(zshrcPath, 'utf8');

console.log('🔍 Debugging ~/.zshrc secrets extraction...\n');

// Extract all environment variables
const envVarRegex = /export\s+([A-Z_]+)=["']?([^"'\n]+)["']?/g;
let match;
const foundVars = {};

while ((match = envVarRegex.exec(content)) !== null) {
  const [, key, value] = match;
  foundVars[key] = value;
}

console.log('Found environment variables:');
Object.entries(foundVars).forEach(([key, value]) => {
  if (key.includes('N8N') || key.includes('SUPABASE') || key.includes('OPENAI') || key.includes('ALEX_AI')) {
    console.log(`  ${key}: ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  }
});

console.log('\nSpecific Alex AI variables:');
console.log(`  N8N_API_URL: ${foundVars.N8N_API_URL || 'NOT FOUND'}`);
console.log(`  N8N_API_KEY: ${foundVars.N8N_API_KEY ? 'FOUND' : 'NOT FOUND'}`);
console.log(`  SUPABASE_URL: ${foundVars.SUPABASE_URL || 'NOT FOUND'}`);
console.log(`  SUPABASE_ANON_KEY: ${foundVars.SUPABASE_ANON_KEY || 'NOT FOUND'}`);
console.log(`  OPENAI_API_KEY: ${foundVars.OPENAI_API_KEY ? 'FOUND' : 'NOT FOUND'}`);



