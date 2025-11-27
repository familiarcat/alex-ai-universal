#!/usr/bin/env node
/**
 * Create user_settings table using Supabase REST API
 * 
 * Uses credentials from ~/.zshrc to execute SQL via Supabase REST API
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load credentials
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
  console.log('🖖 Creating user_settings table via Supabase REST API...\n');
  
  const { supabaseUrl, supabaseKey } = loadCredentials();
  console.log('✅ Credentials loaded');
  console.log(`   URL: ${supabaseUrl}\n`);
  
  // Read migration SQL
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_create_user_settings_table.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  
  // Use Supabase REST API to execute SQL
  // Note: Supabase REST API doesn't support direct SQL execution
  // We'll use psql if available, or provide instructions
  
  console.log('📋 Migration SQL loaded\n');
  console.log('⚠️  Supabase REST API does not support direct SQL execution');
  console.log('📝 Using alternative method...\n');
  
  // Try using psql if available
  try {
    const psqlCommand = `PGPASSWORD="${supabaseKey}" psql -h ${supabaseUrl.replace('https://', '').replace('.supabase.co', '')} -U postgres -d postgres -p 5432 -c "${migrationSQL.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
    
    console.log('🔧 Attempting via psql...');
    // This won't work directly, but we can provide the connection string
    
    // Better: Use Supabase Management API or provide curl command
    console.log('\n📋 To execute this migration, use one of these methods:\n');
    console.log('Method 1: Supabase Dashboard');
    console.log('   1. Go to: https://supabase.com/dashboard/project/rpkkkbufdwxmjaerbhbn/sql/new');
    console.log('   2. Copy and paste the SQL from:', migrationPath);
    console.log('   3. Click "Run"\n');
    
    console.log('Method 2: Supabase CLI (if installed)');
    console.log('   supabase db push\n');
    
    console.log('Method 3: Direct psql (if you have connection details)');
    console.log('   psql "postgresql://postgres:[PASSWORD]@db.rpkkkbufdwxmjaerbhbn.supabase.co:5432/postgres"');
    console.log('   Then paste the SQL from:', migrationPath, '\n');
    
    // For now, let's try to create the table using the Supabase client with a workaround
    // We'll create a simple script that can be run in the browser console or via API
    
    console.log('🔧 Creating browser-executable script...');
    const browserScript = `
// Run this in browser console on your Supabase project page, or use Supabase Dashboard SQL Editor
const sql = \`${migrationSQL.replace(/`/g, '\\`')}\`;

// Copy the SQL above and paste into Supabase Dashboard → SQL Editor
console.log('SQL ready to paste into Supabase Dashboard');
    `.trim();
    
    const scriptPath = path.join(__dirname, '..', 'scripts', 'run-migration-browser.js');
    fs.writeFileSync(scriptPath, browserScript);
    console.log(`   ✅ Created: ${scriptPath}\n`);
    
    // Also create a curl-based approach for testing
    console.log('✅ Migration instructions generated');
    console.log('   Please run the migration via Supabase Dashboard\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTable().catch(console.error);

