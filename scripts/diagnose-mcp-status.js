#!/usr/bin/env node

/**
 * MCP Status Diagnostic Script
 * 
 * Diagnoses why MCP and OpenRouter are showing as offline
 */

const fs = require('fs');
const path = require('path');

// Load environment variables
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
      }
    }
  });
  
  return env;
}

// Check environment variables
function checkEnvironment() {
  console.log('\n🔍 Environment Variable Check');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const rootEnv = loadEnvFile(path.join(__dirname, '../.env.local'));
  const dashboardEnv = loadEnvFile(path.join(__dirname, '../dashboard/.env.local'));
  
  // Merge env vars (dashboard takes precedence)
  const env = { ...rootEnv, ...dashboardEnv, ...process.env };
  
  const requiredVars = {
    'NEXT_PUBLIC_SUPABASE_URL': 'Local MCP (Supabase) URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'Local MCP (Supabase) Anon Key',
    'OPENROUTER_API_KEY': 'OpenRouter API Key',
    'MCP_API_KEY': 'MCP API Key (optional, for remote MCP)',
    'NEXT_PUBLIC_MCP_URL': 'Remote MCP URL (optional)'
  };
  
  const issues = [];
  const configured = [];
  
  for (const [varName, description] of Object.entries(requiredVars)) {
    const value = env[varName];
    const isOptional = varName.includes('MCP_API_KEY') || varName.includes('NEXT_PUBLIC_MCP_URL');
    
    if (value && value !== 'your-' && !value.includes('your-')) {
      configured.push(`✅ ${varName}: ${description} - Configured`);
    } else if (!isOptional) {
      issues.push(`❌ ${varName}: ${description} - MISSING`);
    } else {
      console.log(`⚠️  ${varName}: ${description} - Not configured (optional)`);
    }
  }
  
  configured.forEach(msg => console.log(msg));
  issues.forEach(msg => console.log(msg));
  
  return { env, issues, configured };
}

// Test Supabase connection
async function testSupabase(env) {
  console.log('\n🔍 Supabase Connection Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Supabase credentials not configured');
    return false;
  }
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`📡 Testing connection to: ${supabaseUrl.replace(/https?:\/\/([^/]+).*/, '$1')}`);
    
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log(`❌ Supabase connection failed: ${error.message}`);
      if (error.message.includes('relation "knowledge_base" does not exist')) {
        console.log('   💡 The knowledge_base table may not exist. Check your Supabase schema.');
      }
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log(`❌ Supabase connection error: ${error.message}`);
    if (error.message.includes('Cannot find module')) {
      console.log('   💡 Install @supabase/supabase-js: npm install @supabase/supabase-js');
    }
    return false;
  }
}

// Test OpenRouter connection
async function testOpenRouter(env) {
  console.log('\n🔍 OpenRouter Connection Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const apiKey = env.OPENROUTER_API_KEY;
  
  if (!apiKey) {
    console.log('❌ OpenRouter API key not configured');
    return false;
  }
  
  try {
    console.log('📡 Testing connection to: openrouter.ai');
    
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.log(`❌ OpenRouter API error: ${response.status} ${response.statusText}`);
      if (response.status === 401) {
        console.log('   💡 Invalid API key. Check your OPENROUTER_API_KEY.');
      }
      return false;
    }
    
    const data = await response.json();
    console.log(`✅ OpenRouter connection successful (${data.data?.length || 0} models available)`);
    return true;
  } catch (error) {
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      console.log('❌ OpenRouter connection timeout - check your internet connection');
    } else {
      console.log(`❌ OpenRouter connection error: ${error.message}`);
    }
    return false;
  }
}

// Main diagnostic function
async function main() {
  console.log('\n🖖 MCP & OpenRouter Status Diagnostic');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const { env, issues, configured } = checkEnvironment();
  
  if (issues.length > 0) {
    console.log('\n⚠️  Missing Required Configuration');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('To fix this, create or update dashboard/.env.local with:');
    console.log('');
    issues.forEach(issue => {
      const varName = issue.match(/^❌ (\w+):/)?.[1];
      if (varName) {
        console.log(`${varName}=your-value-here`);
      }
    });
    console.log('');
    console.log('💡 See dashboard/ENV_TEMPLATE.md for more details');
  }
  
  // Test connections
  const supabaseOk = await testSupabase(env);
  const openRouterOk = await testOpenRouter(env);
  
  // Summary
  console.log('\n📊 Diagnostic Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Local MCP (Supabase): ${supabaseOk ? '✅ Online' : '❌ Offline'}`);
  console.log(`OpenRouter: ${openRouterOk ? '✅ Online' : '❌ Offline'}`);
  
  if (!supabaseOk || !openRouterOk) {
    console.log('\n💡 Next Steps:');
    if (!supabaseOk) {
      console.log('   1. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in dashboard/.env.local');
      console.log('   2. Ensure your Supabase project is active and the knowledge_base table exists');
    }
    if (!openRouterOk) {
      console.log('   1. Verify OPENROUTER_API_KEY in dashboard/.env.local');
      console.log('   2. Get your API key from https://openrouter.ai/keys');
      console.log('   3. Check your internet connection');
    }
    console.log('');
    process.exit(1);
  } else {
    console.log('\n✅ All services are operational!\n');
  }
}

main().catch(error => {
  console.error('\n❌ Diagnostic failed:', error.message);
  process.exit(1);
});

