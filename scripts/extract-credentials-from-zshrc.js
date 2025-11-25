#!/usr/bin/env node

/**
 * Extract credentials from ~/.zshrc and update dashboard/.env.local
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function extractEnvFromZshrc() {
  const zshrcPath = path.join(os.homedir(), '.zshrc');
  
  if (!fs.existsSync(zshrcPath)) {
    console.log('❌ ~/.zshrc not found');
    return {};
  }
  
  const content = fs.readFileSync(zshrcPath, 'utf8');
  const env = {};
  
  // Match various export formats:
  // export KEY=value
  // export KEY="value"
  // export KEY='value'
  // KEY=value (without export)
  const patterns = [
    /^export\s+(\w+)=['"]?([^'"]+)['"]?/m,
    /^(\w+)=['"]?([^'"]+)['"]?\s*$/m
  ];
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    
    // Skip comments
    if (trimmed.startsWith('#')) return;
    
    // Try export pattern
    let match = trimmed.match(/^export\s+(\w+)=['"]?([^'"]+)['"]?/);
    if (!match) {
      // Try simple assignment
      match = trimmed.match(/^(\w+)=['"]?([^'"]+)['"]?$/);
    }
    
    if (match) {
      const [, key, value] = match;
      // Only capture SUPABASE and OPENROUTER related vars
      if (key.includes('SUPABASE') || key.includes('OPENROUTER') || key.includes('MCP')) {
        env[key] = value.trim();
      }
    }
  });
  
  return env;
}

function updateEnvLocal(zshrcEnv) {
  const envLocalPath = path.join(__dirname, '../dashboard/.env.local');
  
  if (!fs.existsSync(envLocalPath)) {
    console.log('❌ dashboard/.env.local not found');
    return false;
  }
  
  let content = fs.readFileSync(envLocalPath, 'utf8');
  let updated = false;
  
  // Map zshrc keys to .env.local keys
  const keyMappings = {
    'NEXT_PUBLIC_SUPABASE_URL': 'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_URL': 'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_ANON_KEY': 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'OPENROUTER_API_KEY': 'OPENROUTER_API_KEY',
    'NEXT_PUBLIC_MCP_URL': 'NEXT_PUBLIC_MCP_URL',
    'MCP_API_KEY': 'MCP_API_KEY'
  };
  
  for (const [zshrcKey, envLocalKey] of Object.entries(keyMappings)) {
    // Check if we have this key in zshrc
    const value = zshrcEnv[zshrcKey] || zshrcEnv[zshrcKey.replace('NEXT_PUBLIC_', '')];
    
    if (value && value !== 'your-' && !value.includes('your-')) {
      // Update the line in .env.local
      const regex = new RegExp(`^${envLocalKey}=.*$`, 'm');
      if (regex.test(content)) {
        content = content.replace(regex, `${envLocalKey}=${value}`);
        updated = true;
        console.log(`✅ Updated ${envLocalKey}`);
      } else {
        // Add it if it doesn't exist
        content += `\n${envLocalKey}=${value}\n`;
        updated = true;
        console.log(`✅ Added ${envLocalKey}`);
      }
    }
  }
  
  if (updated) {
    fs.writeFileSync(envLocalPath, content, 'utf8');
    return true;
  }
  
  return false;
}

// Main
console.log('\n🖖 Extracting Credentials from ~/.zshrc');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const zshrcEnv = extractEnvFromZshrc();

if (Object.keys(zshrcEnv).length === 0) {
  console.log('⚠️  No SUPABASE or OPENROUTER credentials found in ~/.zshrc');
  process.exit(1);
}

console.log('Found credentials:');
Object.keys(zshrcEnv).forEach(key => {
  const value = zshrcEnv[key];
  const displayValue = value.length > 20 ? value.substring(0, 20) + '...' : value;
  console.log(`  ${key}=${displayValue}`);
});

console.log('\n📝 Updating dashboard/.env.local...\n');

const updated = updateEnvLocal(zshrcEnv);

if (updated) {
  console.log('\n✅ Successfully updated dashboard/.env.local');
  console.log('\n💡 Next: Restart your Next.js dev server');
  console.log('   cd dashboard && npm run dev\n');
} else {
  console.log('\n⚠️  No updates needed or file not found\n');
}
