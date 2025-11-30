#!/usr/bin/env node
/**
 * Execute SQL directly via Supabase REST API
 * 
 * Uses pg_rest or direct SQL execution endpoint
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load credentials
function loadCredentials() {
  const zshrc = fs.readFileSync(process.env.HOME + '/.zshrc', 'utf8');
  const supabaseUrl = zshrc.match(/export SUPABASE_URL="([^"]+)"/)?.[1];
  const supabaseKey = zshrc.match(/export SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found');
  }
  
  return { supabaseUrl, supabaseKey };
}

async function executeSQL() {
  const { supabaseUrl, supabaseKey } = loadCredentials();
  const migrationPath = require('path').join(__dirname, '..', 'supabase', 'migrations', '002_create_user_settings_table.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('🖖 Executing SQL directly via Supabase Management API...\n');
  
  // Use Supabase Management API to execute SQL
  // Note: This requires the Management API which may not be available
  // Fallback: Use Supabase Dashboard or CLI
  
  try {
    // Try using the REST API's SQL execution endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ sql })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SQL executed successfully!');
      return;
    }
    
    throw new Error(`API returned ${response.status}`);
  } catch (error) {
    console.log('⚠️  Direct SQL execution not available via REST API');
    console.log('\n📋 Use Supabase CLI instead:');
    console.log('   supabase db push --include-all\n');
    console.log('Or use Supabase Dashboard:');
    console.log(`   https://supabase.com/dashboard/project/${supabaseUrl.match(/https:\/\/([^.]+)/)?.[1]}/sql/new\n`);
  }
}

executeSQL().catch(console.error);

