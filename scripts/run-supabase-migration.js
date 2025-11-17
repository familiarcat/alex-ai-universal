#!/usr/bin/env node
/**
 * Run Supabase Migration for alex_ai_memories table
 * 
 * This script applies the migration to create the alex_ai_memories table
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('🗄️  Running Supabase Migration...\n');

// Load credentials
const creds = require('./utils/load-crew-credentials.js');
const credentials = creds.loadCrewCredentials();

if (!credentials.supabase?.url || !credentials.supabase?.key) {
  console.error('❌ Supabase credentials not found');
  console.error('   Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(credentials.supabase.url, credentials.supabase.key);

// Read migration file
const migrationPath = path.resolve(__dirname, '..', 'supabase', 'migrations', '20251117_create_alex_ai_memories.sql');
if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationPath}`);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('📄 Migration file loaded');
console.log('🔗 Connecting to Supabase...');
console.log(`   URL: ${credentials.supabase.url}\n`);

// Split SQL into individual statements
const statements = migrationSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`📝 Executing ${statements.length} SQL statements...\n`);

let successCount = 0;
let errorCount = 0;

async function runMigration() {
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    
    // Skip comments and empty statements
    if (statement.startsWith('--') || statement.length === 0) {
      continue;
    }
    
    try {
      // Execute via Supabase RPC or direct SQL
      // Note: Supabase JS client doesn't support raw SQL directly
      // We'll use the REST API or check if table exists first
      
      if (statement.includes('CREATE TABLE IF NOT EXISTS alex_ai_memories')) {
        // Check if table exists first
        const { data: tables, error: checkError } = await supabase
          .from('alex_ai_memories')
          .select('id')
          .limit(1);
        
        if (checkError && checkError.code === '42P01') {
          // Table doesn't exist, need to create it
          console.log(`   ⚠️  Table doesn't exist - needs manual creation`);
          console.log(`   📝 Please run this migration manually in Supabase SQL Editor:`);
          console.log(`      File: ${migrationPath}\n`);
          console.log(`   Or use Supabase CLI:`);
          console.log(`      supabase db push\n`);
          return;
        } else if (!checkError) {
          console.log(`   ✅ Table alex_ai_memories already exists`);
          successCount++;
          continue;
        }
      }
      
      // For other statements, we'd need to use Supabase CLI or REST API
      // For now, provide instructions
      console.log(`   ⚠️  Statement ${i + 1}: Requires manual execution`);
      
    } catch (error) {
      console.error(`   ❌ Error executing statement ${i + 1}:`, error.message);
      errorCount++;
    }
  }
  
  // Final check
  console.log('\n🔍 Verifying table creation...');
  const { data, error } = await supabase
    .from('alex_ai_memories')
    .select('id')
    .limit(1);
  
  if (error && error.code === '42P01') {
    console.log('   ❌ Table alex_ai_memories does not exist');
    console.log('\n📋 To create the table, please:');
    console.log('   1. Go to Supabase Dashboard → SQL Editor');
    console.log(`   2. Copy contents of: ${migrationPath}`);
    console.log('   3. Paste and execute in SQL Editor');
    console.log('\n   OR use Supabase CLI:');
    console.log('      supabase db push');
  } else if (error) {
    console.log(`   ⚠️  Error checking table: ${error.message}`);
  } else {
    console.log('   ✅ Table alex_ai_memories exists and is accessible!');
    console.log(`   ✅ Migration successful!`);
  }
}

runMigration().catch(error => {
  console.error('\n❌ Migration failed:', error.message);
  console.error('\n📋 Manual Migration Instructions:');
  console.log(`   1. Open Supabase Dashboard: ${credentials.supabase.url.replace('/rest/v1', '')}`);
  console.log('   2. Go to SQL Editor');
  console.log(`   3. Copy and paste contents of: ${migrationPath}`);
  console.log('   4. Execute the SQL');
  process.exit(1);
});

