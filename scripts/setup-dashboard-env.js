#!/usr/bin/env node

/**
 * Dashboard Environment Setup Script
 * 
 * Helps set up dashboard/.env.local with required environment variables
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function main() {
  console.log('\n🖖 Dashboard Environment Setup');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const envPath = path.join(__dirname, '../dashboard/.env.local');
  const existingEnv = fs.existsSync(envPath) 
    ? fs.readFileSync(envPath, 'utf8')
    : '';
  
  // Check if already configured
  const hasSupabase = existingEnv.includes('NEXT_PUBLIC_SUPABASE_URL') && 
                      existingEnv.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1] &&
                      !existingEnv.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1].includes('your-');
  const hasOpenRouter = existingEnv.includes('OPENROUTER_API_KEY') &&
                        existingEnv.match(/OPENROUTER_API_KEY=(.+)/)?.[1] &&
                        !existingEnv.match(/OPENROUTER_API_KEY=(.+)/)?.[1].includes('your-');
  
  if (hasSupabase && hasOpenRouter) {
    console.log('✅ Environment appears to be configured');
    console.log('   Run: node scripts/diagnose-mcp-status.js to verify\n');
    rl.close();
    return;
  }
  
  console.log('This script will help you set up dashboard/.env.local');
  console.log('Required variables:\n');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL (for Local MCP)');
  console.log('  - NEXT_PUBLIC_SUPABASE_ANON_KEY (for Local MCP)');
  console.log('  - OPENROUTER_API_KEY (for LLM access)\n');
  
  const supabaseUrl = hasSupabase 
    ? existingEnv.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim()
    : await question('Enter NEXT_PUBLIC_SUPABASE_URL (or press Enter to skip): ');
  
  const supabaseKey = existingEnv.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim() ||
    (supabaseUrl && !hasSupabase 
      ? await question('Enter NEXT_PUBLIC_SUPABASE_ANON_KEY (or press Enter to skip): ')
      : '');
  
  const openRouterKey = hasOpenRouter
    ? existingEnv.match(/OPENROUTER_API_KEY=(.+)/)?.[1]?.trim()
    : await question('Enter OPENROUTER_API_KEY (or press Enter to skip): ');
  
  // Build env file content
  let envContent = existingEnv || '';
  
  if (supabaseUrl && !envContent.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
    envContent += `\n# Supabase (Local MCP)\n`;
    envContent += `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}\n`;
  }
  
  if (supabaseKey && !envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    envContent += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}\n`;
  }
  
  if (openRouterKey && !envContent.includes('OPENROUTER_API_KEY=')) {
    envContent += `\n# OpenRouter\n`;
    envContent += `OPENROUTER_API_KEY=${openRouterKey}\n`;
  }
  
  // Write file
  if (supabaseUrl || supabaseKey || openRouterKey) {
    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');
    console.log(`\n✅ Environment file updated: ${envPath}`);
    console.log('\n⚠️  Important: Restart your Next.js dev server for changes to take effect!\n');
  } else {
    console.log('\n⚠️  No changes made. Run this script again to configure.\n');
  }
  
  rl.close();
}

main().catch(error => {
  console.error('\n❌ Setup failed:', error.message);
  rl.close();
  process.exit(1);
});

