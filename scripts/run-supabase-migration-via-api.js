#!/usr/bin/env node

/**
 * Run Supabase Migration via API
 * Executes DDL (CREATE TABLE) using Supabase service_role key
 * 
 * Uses ~/.zshrc credentials: SUPABASE_URL, SUPABASE_SERVICE_KEY
 */

const fs = require('fs');
const path = require('path');

// Load environment from ~/.zshrc
function loadEnvFromZshrc() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const supabaseUrlMatch = zshrcContent.match(/export SUPABASE_URL="([^"]+)"/);
  const supabaseServiceKeyMatch = zshrcContent.match(/export SUPABASE_SERVICE_KEY="([^"]+)"/);
  
  if (!supabaseUrlMatch || !supabaseServiceKeyMatch) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in ~/.zshrc');
    process.exit(1);
  }
  
  return {
    supabaseUrl: supabaseUrlMatch[1],
    supabaseServiceKey: supabaseServiceKeyMatch[1]
  };
}

async function runMigration(migrationPath, env) {
  console.log(`\n📝 Reading migration: ${path.basename(migrationPath)}...`);
  
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  
  // Extract project reference from URL (e.g., rpkkkbufdwxmjaerbhbn)
  const projectRef = env.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  if (!projectRef) {
    console.error('❌ Could not extract project reference from SUPABASE_URL');
    return false;
  }
  
  console.log(`   ✓ Project: ${projectRef}`);
  console.log(`   ✓ SQL size: ${sqlContent.length} bytes`);
  
  // Use Supabase Management API to execute SQL
  // Endpoint: /database/query (with service_role permissions)
  const apiUrl = `${env.supabaseUrl}/rest/v1/rpc/exec_sql`;
  
  try {
    // Try using pg_rest RPC function (if available)
    console.log(`\n🔄 Attempting to execute SQL via Supabase API...`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'apikey': env.supabaseServiceKey,
        'Authorization': `Bearer ${env.supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });
    
    if (!response.ok) {
      // RPC function doesn't exist, try direct SQL execution via psql-like endpoint
      console.log(`   ⚠ RPC method not available, trying alternative...`);
      
      // Alternative: Use PostgREST's direct query execution
      // This requires a stored procedure or function in Supabase
      
      // For now, fall back to a pragmatic approach:
      // Execute each statement separately via REST API
      
      console.log(`   ℹ️  Supabase REST API limitation: DDL operations require CLI or UI`);
      console.log(`   ℹ️  Attempting workaround: Separate statement execution...`);
      
      // Split SQL into separate statements
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));
      
      console.log(`   Found ${statements.length} SQL statements`);
      
      // We can't execute DDL via REST API, need to provide instructions
      console.log(`\n❌ LIMITATION: Supabase REST API doesn't support DDL (CREATE TABLE)`);
      console.log(`\n📋 MANUAL STEP REQUIRED:`);
      console.log(`   1. Visit: ${env.supabaseUrl.replace('.supabase.co', '.supabase.co/project')}/sql`);
      console.log(`   2. Paste contents of: ${migrationPath}`);
      console.log(`   3. Click "RUN"`);
      console.log(`\nOr use Supabase CLI:`);
      console.log(`   supabase db push`);
      
      return false;
    }
    
    console.log(`   ✅ Migration executed successfully!`);
    return true;
    
  } catch (error) {
    console.error(`   ❌ Migration failed:`, error.message);
    return false;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║     🗄️  RUN SUPABASE MIGRATION VIA API                        ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  // Load environment
  console.log('\n📋 Loading credentials from ~/.zshrc...');
  const env = loadEnvFromZshrc();
  console.log(`   ✓ Supabase URL: ${env.supabaseUrl}`);
  console.log(`   ✓ Service Key: ${env.supabaseServiceKey.substring(0, 20)}...`);
  
  // Get migration path
  const migrationPath = process.argv[2] || path.join(__dirname, '..', 'supabase', 'migrations', '003_create_knowledge_base_table.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`\n❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  // Run migration
  const success = await runMigration(migrationPath, env);
  
  if (!success) {
    console.log('\n⚠️  Falling back to helper script...\n');
    console.log('Run: scripts/open-supabase-sql-editor.sh');
    process.exit(1);
  }
  
  console.log('\n✅ Migration complete!\n');
}

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

