#!/usr/bin/env node
/**
 * Verify user_settings table exists and is accessible
 * 
 * Uses Supabase client with service role key for verification
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

async function verifyTable() {
  console.log('🔍 Verifying user_settings table...\n');
  
  const { supabaseUrl, supabaseKey } = loadCredentials();
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Try to query the table
    const { data, error } = await supabase
      .from('user_settings')
      .select('user_id, global_theme, created_at, updated_at')
      .limit(5);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Table does not exist');
        console.log('   Error: relation "public.user_settings" does not exist\n');
        console.log('💡 Run: bash scripts/automated-create-user-settings-table.sh\n');
        process.exit(1);
      } else {
        throw error;
      }
    }
    
    console.log('✅ Table exists and is accessible!');
    console.log(`   Found ${data.length} record(s)\n`);
    
    if (data.length > 0) {
      console.log('📊 Sample data:');
      data.forEach((record, i) => {
        console.log(`   ${i + 1}. user_id: ${record.user_id}, theme: ${record.global_theme}`);
      });
    } else {
      console.log('   No records yet (table is empty)');
    }
    
    console.log('\n✅ Verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification error:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);
  }
}

verifyTable();

