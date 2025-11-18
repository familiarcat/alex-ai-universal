#!/usr/bin/env node
/**
 * Generate Consolidated Migration File
 * 
 * This script combines all migration files into a single SQL file
 * that can be executed manually in the Supabase Dashboard SQL Editor.
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '═'.repeat(80));
console.log('📝 GENERATING CONSOLIDATED MIGRATION FILE');
console.log('═'.repeat(80) + '\n');

// Get all migration files sorted by name
function getMigrationFiles() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error(`❌ Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  return files.map(file => ({
    name: file,
    path: path.join(migrationsDir, file),
  }));
}

// Main execution
function main() {
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

  // Read all migration files
  const consolidatedSQL = [];
  consolidatedSQL.push('-- ============================================================================');
  consolidatedSQL.push('-- CONSOLIDATED SUPABASE MIGRATION');
  consolidatedSQL.push('-- Generated: ' + new Date().toISOString());
  consolidatedSQL.push('-- Total migrations: ' + migrations.length);
  consolidatedSQL.push('-- ============================================================================');
  consolidatedSQL.push('');
  consolidatedSQL.push('-- This file contains all migrations in chronological order.');
  consolidatedSQL.push('-- Execute this entire file in the Supabase Dashboard SQL Editor.');
  consolidatedSQL.push('');
  consolidatedSQL.push('-- ============================================================================\n');

  migrations.forEach((migration, index) => {
    console.log(`   📄 Reading: ${migration.name}`);
    const content = fs.readFileSync(migration.path, 'utf8');
    
    consolidatedSQL.push('');
    consolidatedSQL.push('-- ============================================================================');
    consolidatedSQL.push(`-- Migration ${index + 1}/${migrations.length}: ${migration.name}`);
    consolidatedSQL.push('-- ============================================================================');
    consolidatedSQL.push('');
    consolidatedSQL.push(content);
    consolidatedSQL.push('');
  });

  // Write consolidated file
  const outputPath = path.join(process.cwd(), 'supabase', 'CONSOLIDATED_MIGRATION.sql');
  fs.writeFileSync(outputPath, consolidatedSQL.join('\n'), 'utf8');

  console.log(`\n✅ Consolidated migration file created:`);
  console.log(`   ${outputPath}\n`);

  // Read credentials for dashboard URL
  const zshrc = fs.readFileSync(path.join(process.env.HOME, '.zshrc'), 'utf8');
  const SUPABASE_URL = zshrc.match(/export SUPABASE_URL="([^"]+)"/)?.[1];
  const SUPABASE_PROJECT_REF = SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  console.log('═'.repeat(80));
  console.log('📋 MANUAL EXECUTION INSTRUCTIONS');
  console.log('═'.repeat(80));
  console.log('\n1. Open Supabase Dashboard SQL Editor:');
  if (SUPABASE_PROJECT_REF) {
    console.log(`   https://app.supabase.com/project/${SUPABASE_PROJECT_REF}/sql/new\n`);
  } else {
    console.log(`   https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new\n`);
  }
  console.log('2. Open the consolidated migration file:');
  console.log(`   ${outputPath}\n`);
  console.log('3. Copy the entire contents of the file');
  console.log('4. Paste into the SQL Editor');
  console.log('5. Click "Run" to execute all migrations\n');
  console.log('6. Verify execution was successful');
  console.log('7. Run verification script:');
  console.log('   node scripts/verify-supabase-n8n-access.js\n');
  console.log('═'.repeat(80) + '\n');
}

main();

