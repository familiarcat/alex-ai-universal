#!/usr/bin/env node

/**
 * Run Supabase Migration Using Credentials from ~/.zshrc
 * Uses service_role key to execute SQL directly via Supabase Management API
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

// Load credentials from ~/.zshrc
function loadCredentials() {
  const zshrcPath = path.join(process.env.HOME, '.zshrc');
  const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
  
  const supabaseUrl = zshrcContent.match(/export SUPABASE_URL="?([^"\n]+)"?/)?.[1];
  const supabaseServiceKey = zshrcContent.match(/export SUPABASE_SERVICE_KEY="([^"]+)"/)?.[1];
  const projectName = zshrcContent.match(/export SUPABASE_PROJECT_NAME="([^"]+)"/)?.[1];
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in ~/.zshrc');
    process.exit(1);
  }
  
  // Extract project reference from URL
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
  
  return {
    url: supabaseUrl,
    serviceKey: supabaseServiceKey,
    projectRef,
    projectName
  };
}

async function runMigration(migrationPath, credentials) {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║     🗄️  RUN MIGRATION WITH ~/.zshrc CREDENTIALS              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  console.log('📋 Loaded Credentials:');
  console.log(`   Supabase URL: ${credentials.url}`);
  console.log(`   Project Ref: ${credentials.projectRef}`);
  console.log(`   Project Name: ${credentials.projectName}`);
  console.log(`   Service Key: ${credentials.serviceKey.substring(0, 20)}...`);
  console.log('');
  
  // Read migration file
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  console.log(`📝 Migration: ${path.basename(migrationPath)}`);
  console.log(`   Size: ${sqlContent.length} bytes`);
  console.log('');
  
  // Method 1: Try using psql via connection string
  console.log('🔄 Attempting migration via PostgreSQL connection...');
  
  try {
    // Construct PostgreSQL connection string using service_role key as password
    const connectionString = `postgresql://postgres.${credentials.projectRef}:${encodeURIComponent(credentials.serviceKey)}@aws-0-us-west-1.pooler.supabase.com:6543/postgres`;
    
    // Try psql if available
    const { stdout, stderr } = await execPromise(`which psql`);
    
    if (stdout.trim()) {
      console.log('   ✓ psql found, executing migration...');
      
      // Execute SQL via psql
      const result = await execPromise(
        `psql "${connectionString}" -f "${migrationPath}"`,
        { env: { ...process.env } }
      );
      
      console.log('   ✅ Migration executed successfully!');
      console.log('');
      console.log(result.stdout);
      
      return true;
    }
  } catch (error) {
    console.log('   ⚠️  psql not available or connection failed');
  }
  
  // Method 2: Try REST API with each statement
  console.log('');
  console.log('🔄 Attempting via Supabase REST API...');
  
  try {
    // Split SQL into statements
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`   Found ${statements.length} SQL statements`);
    
    // Try to execute via REST API (will fail for DDL)
    for (let i = 0; i < Math.min(3, statements.length); i++) {
      const stmt = statements[i];
      if (stmt.toUpperCase().includes('CREATE TABLE')) {
        console.log(`   ⚠️  Statement ${i + 1} is DDL (CREATE TABLE) - REST API won't work`);
        throw new Error('DDL not supported by REST API');
      }
    }
  } catch (error) {
    console.log('   ❌ REST API cannot execute DDL operations');
  }
  
  // Method 3: Use Supabase CLI
  console.log('');
  console.log('🔄 Attempting via Supabase CLI...');
  
  try {
    // Check if project is linked
    const { stdout } = await execPromise('cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal && supabase status', {
      env: {
        ...process.env,
        SUPABASE_URL: credentials.url,
        SUPABASE_SERVICE_KEY: credentials.serviceKey
      }
    });
    
    console.log('   ✓ Supabase CLI available');
    console.log('');
    console.log(stdout);
    
  } catch (error) {
    console.log('   ⚠️  Supabase project not linked locally');
    console.log('');
    console.log('🔗 Linking project to Supabase CLI...');
    
    try {
      await execPromise(
        `cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal && supabase link --project-ref ${credentials.projectRef}`,
        {
          env: {
            ...process.env,
            SUPABASE_ACCESS_TOKEN: credentials.serviceKey
          }
        }
      );
      console.log('   ✅ Project linked!');
    } catch (linkError) {
      console.log('   ⚠️  Auto-link failed - manual link required');
      console.log('');
      console.log('   Run: supabase link --project-ref ' + credentials.projectRef);
    }
  }
  
  // Provide manual instructions
  console.log('');
  console.log('━'.repeat(66));
  console.log('📋 MANUAL EXECUTION REQUIRED:');
  console.log('━'.repeat(66));
  console.log('');
  console.log('Due to Supabase API limitations for DDL, please use ONE of:');
  console.log('');
  console.log('Option 1 - Supabase CLI (Recommended):');
  console.log('   cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal');
  console.log('   supabase db push');
  console.log('');
  console.log('Option 2 - Supabase Dashboard:');
  console.log('   1. Visit: https://supabase.com/dashboard/project/' + credentials.projectRef + '/sql/new');
  console.log('   2. Paste migration content');
  console.log('   3. Click RUN');
  console.log('');
  console.log('Option 3 - psql (if installed):');
  console.log('   psql "postgresql://postgres.' + credentials.projectRef + ':[SERVICE_KEY]@aws-0-us-west-1.pooler.supabase.com:6543/postgres" -f ' + migrationPath);
  console.log('');
  
  return false;
}

async function main() {
  const credentials = loadCredentials();
  const migrationPath = process.argv[2] || path.join(__dirname, '..', 'supabase', 'migrations', '003_create_knowledge_base_table.sql');
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const success = await runMigration(migrationPath, credentials);
  
  if (!success) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Script failed:', error.message);
  process.exit(1);
});

