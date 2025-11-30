#!/usr/bin/env node
/**
 * Create user_settings table in Supabase using credentials from ~/.zshrc
 * 
 * Crew: Data (Database) + La Forge (Infrastructure)
 */

const { createClient } = require('@supabase/supabase-js');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load credentials from ~/.zshrc
function loadCredentials() {
  try {
    const zshrc = fs.readFileSync(process.env.HOME + '/.zshrc', 'utf8');
    const supabaseUrl = zshrc.match(/export SUPABASE_URL="([^"]+)"/)?.[1];
    const supabaseKey = zshrc.match(/export SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1] ||
                       zshrc.match(/export SUPABASE_SERVICE_KEY="([^"]+)"/)?.[1];
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not found in ~/.zshrc');
    }
    
    return { supabaseUrl, supabaseKey };
  } catch (error) {
    console.error('❌ Failed to load credentials:', error.message);
    process.exit(1);
  }
}

async function createTable() {
  console.log('🖖 Creating user_settings table in Supabase...\n');
  
  const { supabaseUrl, supabaseKey } = loadCredentials();
  console.log('✅ Credentials loaded from ~/.zshrc');
  console.log(`   URL: ${supabaseUrl}\n`);
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Read migration file
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_user_settings_table.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('📄 Migration file loaded:', migrationPath);
  console.log('🔧 Executing migration...\n');
  
  // Split migration into individual statements
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const statement of statements) {
    if (statement.includes('SELECT')) {
      // For SELECT statements, use query
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement + ';' }).catch(async () => {
          // RPC might not exist, try direct query
          const tableName = statement.match(/FROM\s+(\w+)/i)?.[1];
          if (tableName === 'user_settings') {
            const { data, error } = await supabase
              .from('user_settings')
              .select('*')
              .limit(1);
            return { data, error };
          }
          return { data: null, error: { message: 'Cannot execute SELECT via RPC' } };
        });
        
        if (!error) {
          console.log('✅ Query executed:', statement.substring(0, 50) + '...');
          if (data) {
            console.log('   Result:', JSON.stringify(data, null, 2));
          }
          successCount++;
        } else {
          console.log('⚠️  Query result:', error.message);
        }
      } catch (err) {
        console.log('⚠️  Query skipped (expected for SELECT):', err.message);
      }
    } else {
      // For DDL statements, we need to use Supabase REST API or direct SQL
      // Since Supabase client doesn't support DDL directly, we'll use the REST API
      try {
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql: statement + ';' })
        });
        
        if (response.ok) {
          console.log('✅ Statement executed:', statement.substring(0, 50) + '...');
          successCount++;
        } else {
          const errorText = await response.text();
          // Some statements might fail if they already exist (CREATE IF NOT EXISTS)
          if (errorText.includes('already exists') || errorText.includes('duplicate')) {
            console.log('ℹ️  Statement skipped (already exists):', statement.substring(0, 50) + '...');
            successCount++;
          } else {
            console.log('⚠️  Statement failed:', errorText.substring(0, 100));
            errorCount++;
          }
        }
      } catch (err) {
        // If RPC doesn't exist, try direct table operations
        if (statement.includes('CREATE TABLE')) {
          // Check if table exists first
          const { data, error } = await supabase
            .from('user_settings')
            .select('user_id')
            .limit(1);
          
          if (error && error.code === '42P01') {
            // Table doesn't exist - we need to create it via SQL
            console.log('⚠️  Cannot create table via client - please run migration via Supabase Dashboard');
            console.log('   Migration file:', migrationPath);
            errorCount++;
          } else {
            console.log('✅ Table already exists');
            successCount++;
          }
        } else {
          console.log('⚠️  Statement skipped (requires SQL execution):', statement.substring(0, 50) + '...');
        }
      }
    }
  }
  
  console.log('\n📊 Migration Summary:');
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ⚠️  Errors/Skipped: ${errorCount}`);
  
  // Verify table exists
  console.log('\n🔍 Verifying table...');
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .limit(1);
  
  if (error) {
    if (error.code === '42P01') {
      console.log('❌ Table does not exist - migration needs to be run via Supabase Dashboard');
      console.log('\n📋 To complete migration:');
      console.log('   1. Go to Supabase Dashboard → SQL Editor');
      console.log('   2. Copy contents of:', migrationPath);
      console.log('   3. Paste and execute');
    } else {
      console.log('❌ Error verifying table:', error.message);
    }
    process.exit(1);
  } else {
    console.log('✅ Table exists and is accessible!');
    console.log('   Sample data:', data);
    process.exit(0);
  }
}

// Run migration
createTable().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});

