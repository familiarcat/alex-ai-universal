#!/usr/bin/env node
/**
 * Create user_settings table using Supabase client
 * 
 * Uses table creation via Supabase client methods
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load credentials from ~/.zshrc
function loadCredentials() {
  const zshrc = fs.readFileSync(process.env.HOME + '/.zshrc', 'utf8');
  const supabaseUrl = zshrc.match(/export SUPABASE_URL="([^"]+)"/)?.[1];
  const supabaseKey = zshrc.match(/export SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not found in ~/.zshrc');
  }
  
  return { supabaseUrl, supabaseKey };
}

async function createTable() {
  console.log('🖖 Creating user_settings table via Supabase client...\n');
  
  const { supabaseUrl, supabaseKey } = loadCredentials();
  console.log('✅ Credentials loaded');
  console.log(`   URL: ${supabaseUrl}\n`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Check if table exists
  console.log('🔍 Checking if table exists...');
  const { data: existing, error: checkError } = await supabase
    .from('user_settings')
    .select('user_id')
    .limit(1);
  
  if (!checkError) {
    console.log('✅ Table already exists!');
    console.log('   Sample data:', existing);
    return;
  }
  
  if (checkError.code === '42P01') {
    console.log('❌ Table does not exist');
    console.log('\n📋 Since Supabase client cannot execute DDL, please run migration manually:\n');
    console.log('Option 1: Supabase Dashboard (Recommended)');
    console.log('   1. Go to: https://supabase.com/dashboard/project/rpkkkbufdwxmjaerbhbn/sql/new');
    console.log('   2. Copy SQL from: supabase/migrations/002_create_user_settings_table.sql');
    console.log('   3. Paste and click "Run"\n');
    
    console.log('Option 2: Use n8n webhook (if configured)');
    console.log('   POST to: https://n8n.pbradygeorgen.com/webhook/execute-sql');
    console.log('   Body: { "sql": "<migration SQL>" }\n');
    
    console.log('Option 3: Supabase CLI');
    console.log('   supabase db push\n');
    
    // Try to insert a test record to verify table creation
    console.log('💡 After creating the table, run this script again to verify.\n');
    process.exit(1);
  } else {
    console.error('❌ Error checking table:', checkError.message);
    process.exit(1);
  }
}

createTable().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});

