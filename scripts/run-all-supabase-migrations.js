#!/usr/bin/env node
/**
 * Run All Supabase Migrations
 * 
 * This script executes all migration files in the supabase/migrations directory
 * in chronological order.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read credentials from ~/.zshrc
const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
const SUPABASE_URL = zshrc.match(/export SUPABASE_URL="([^"]+)"/)?.[1];
const SUPABASE_SERVICE_KEY = zshrc.match(/export SUPABASE_SERVICE_KEY="([^"]+)"/)?.[1] || 
                             zshrc.match(/export SUPABASE_SERVICE_ROLE_KEY="([^"]+)"/)?.[1];

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_KEY not found in ~/.zshrc');
  process.exit(1);
}

// Extract project reference and build database URL
const SUPABASE_PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
const DATABASE_URL = `postgresql://postgres.${SUPABASE_PROJECT_REF}:${SUPABASE_SERVICE_KEY}@aws-0-us-east-2.pooler.supabase.com:6543/postgres`;

console.log('\n' + '═'.repeat(80));
console.log('🗄️  RUNNING ALL SUPABASE MIGRATIONS');
console.log('═'.repeat(80));
console.log(`📍 Supabase URL: ${SUPABASE_URL}`);
console.log(`🔑 Project Ref: ${SUPABASE_PROJECT_REF}`);
console.log('═'.repeat(80) + '\n');

// Get all migration files sorted by name (chronological order)
function getMigrationFiles() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort(); // Sort alphabetically (should be chronological if named with dates)

  return files.map(file => ({
    name: file,
    path: path.join(migrationsDir, file),
  }));
}

// Check if psql is available
function hasPsql() {
  try {
    execSync('which psql', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Check if Supabase CLI is available
function hasSupabaseCLI() {
  try {
    execSync('which supabase', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Execute migration via psql
function executeMigrationWithPsql(migrationPath) {
  try {
    console.log(`   🔄 Executing via psql...`);
    const command = `psql "${DATABASE_URL}" -f "${migrationPath}"`;
    execSync(command, { 
      stdio: 'inherit',
      env: { ...process.env, PGPASSWORD: SUPABASE_SERVICE_KEY }
    });
    return { success: true, method: 'psql' };
  } catch (error) {
    return { success: false, error: error.message, method: 'psql' };
  }
}

// Execute migration via Supabase CLI
function executeMigrationWithSupabaseCLI(migrationPath) {
  try {
    console.log(`   🔄 Executing via Supabase CLI...`);
    // Supabase CLI uses project linking, so we'd need to link first
    // For now, just try direct execution
    const command = `supabase db push --db-url "${DATABASE_URL}" --file "${migrationPath}"`;
    execSync(command, { stdio: 'inherit' });
    return { success: true, method: 'supabase-cli' };
  } catch (error) {
    return { success: false, error: error.message, method: 'supabase-cli' };
  }
}

// Main execution
async function main() {
  const migrations = getMigrationFiles();
  
  if (migrations.length === 0) {
    console.log('⚠️  No migration files found');
    process.exit(0);
  }

  console.log(`📋 Found ${migrations.length} migration file(s):\n`);
  migrations.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name}`);
  });
  console.log('');

  // Check available tools
  const hasPsqlTool = hasPsql();
  const hasSupabaseTool = hasSupabaseCLI();

  console.log('🔧 Available tools:');
  console.log(`   ${hasPsqlTool ? '✅' : '❌'} psql`);
  console.log(`   ${hasSupabaseTool ? '✅' : '❌'} supabase CLI`);
  console.log('');

  if (!hasPsqlTool && !hasSupabaseTool) {
    console.log('⚠️  Neither psql nor Supabase CLI is available.');
    console.log('📋 Manual Migration Instructions:\n');
    console.log('   1. Install psql: brew install postgresql');
    console.log('   OR');
    console.log('   2. Install Supabase CLI: npm install -g supabase');
    console.log('   OR');
    console.log('   3. Run migrations manually via Supabase Dashboard:\n');
    console.log('      a. Go to: https://app.supabase.com/project/' + SUPABASE_PROJECT_REF + '/sql/new');
    console.log('      b. Copy and paste each migration file content');
    console.log('      c. Execute in order\n');
    
    migrations.forEach((m, i) => {
      console.log(`   Migration ${i + 1}: ${m.path}`);
    });
    
    process.exit(1);
  }

  // Execute migrations
  console.log('🚀 Executing migrations...\n');
  
  const results = {
    total: migrations.length,
    successful: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  for (let i = 0; i < migrations.length; i++) {
    const migration = migrations[i];
    console.log(`\n[${i + 1}/${migrations.length}] ${migration.name}`);
    console.log('─'.repeat(80));

    let result = null;

    // Try psql first (most reliable)
    if (hasPsqlTool) {
      result = executeMigrationWithPsql(migration.path);
    } else if (hasSupabaseTool) {
      result = executeMigrationWithSupabaseCLI(migration.path);
    }

    if (result && result.success) {
      console.log(`   ✅ Migration executed successfully via ${result.method}`);
      results.successful++;
    } else if (result) {
      console.log(`   ❌ Migration failed: ${result.error}`);
      results.failed++;
      results.errors.push({
        file: migration.name,
        error: result.error,
      });
      
      // Ask if we should continue
      console.log(`   ⚠️  Continuing with next migration...`);
    } else {
      console.log(`   ⚠️  Could not execute migration`);
      results.skipped++;
    }
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 MIGRATION SUMMARY');
  console.log('═'.repeat(80));
  console.log(`\n📋 Total migrations: ${results.total}`);
  console.log(`✅ Successful: ${results.successful}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⏭️  Skipped: ${results.skipped}`);

  if (results.errors.length > 0) {
    console.log(`\n❌ Failed Migrations:`);
    results.errors.forEach(err => {
      console.log(`   - ${err.file}: ${err.error}`);
    });
  }

  if (results.failed > 0 || results.skipped > 0) {
    console.log(`\n📋 Manual Migration Instructions:`);
    console.log(`   1. Go to Supabase Dashboard: https://app.supabase.com/project/${SUPABASE_PROJECT_REF}/sql/new`);
    console.log(`   2. For each failed/skipped migration:`);
    console.log(`      a. Open the migration file`);
    console.log(`      b. Copy its contents`);
    console.log(`      c. Paste into SQL Editor`);
    console.log(`      d. Execute`);
    console.log('');
  }

  if (results.successful === results.total) {
    console.log('\n🎉 All migrations executed successfully!\n');
    console.log('✅ Next step: Run verification script');
    console.log('   node scripts/verify-supabase-n8n-access.js\n');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some migrations failed or were skipped\n');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Migration execution failed:', error.message);
  if (error.stack) {
    console.error('   Stack:', error.stack);
  }
  process.exit(1);
});

