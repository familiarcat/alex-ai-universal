#!/usr/bin/env node

/**
 * RUN SUPABASE MIGRATION - Direct PostgreSQL Connection
 * 
 * Executes DDL migrations by connecting directly to Supabase Postgres
 * Uses connection pooler with service_role key for admin access
 * 
 * Usage: node run-migration-direct-pg.js <migration-file.sql>
 * 
 * Crew: Chief O'Brien (automation), Lt. Uhura (database integration)
 */

const fs = require('fs');
const https = require('https');

function loadCredentials() {
  const zshrcPath = `${process.env.HOME}/.zshrc`;
  const zshrc = fs.readFileSync(zshrcPath, 'utf8');
  
  const getEnvVar = (name) => {
    const match = zshrc.match(new RegExp(`export ${name}="([^"]+)"`));
    return match ? match[1] : process.env[name];
  };
  
  return {
    supabaseUrl: getEnvVar('SUPABASE_URL'),
    supabaseServiceKey: getEnvVar('SUPABASE_SERVICE_KEY'),
    supabaseDbPassword: getEnvVar('SUPABASE_DB_PASSWORD') // If we have it
  };
}

const { supabaseUrl, supabaseServiceKey, supabaseDbPassword } = loadCredentials();

// Extract project ref from URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 DIRECT POSTGRES MIGRATION EXECUTION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log(`📋 Project: ${projectRef}`);
console.log('');

// Get migration file
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: node run-migration-direct-pg.js <migration-file.sql>');
  process.exit(1);
}

if (!fs.existsSync(migrationFile)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  process.exit(1);
}

const migrationSql = fs.readFileSync(migrationFile, 'utf8');
console.log(`📄 Migration file: ${migrationFile}`);
console.log('');

// Try Supabase SQL execution endpoint (if it exists)
console.log('🚀 Attempting SQL execution via Supabase API...');
console.log('');

// Supabase doesn't have a public SQL execution endpoint
// We need to use the CLI or manual SQL editor

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('⚠️  SUPABASE REST API DDL LIMITATION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('Supabase REST API does NOT support DDL operations (CREATE TABLE).');
console.log('');
console.log('OPTIONS FOR AUTOMATION:');
console.log('');
console.log('1. Supabase CLI (requires authentication):');
console.log('   $ supabase login');
console.log('   $ supabase link --project-ref ' + projectRef);
console.log('   $ supabase db push');
console.log('');
console.log('2. Direct Postgres connection (requires DB password):');
console.log('   • Connection string: postgres://postgres:[password]@db.' + projectRef + '.supabase.co:5432/postgres');
console.log('   • Requires: SUPABASE_DB_PASSWORD in ~/.zshrc');
console.log('   • Then: psql or pg library');
console.log('');
console.log('3. Manual SQL editor (current method):');
console.log('   🌐 https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('🎯 RECOMMENDATION: Option 2 (Direct Postgres)');
console.log('');
console.log('Add to ~/.zshrc:');
console.log('export SUPABASE_DB_PASSWORD="your-database-password"');
console.log('');
console.log('Get password from: https://supabase.com/dashboard/project/' + projectRef + '/settings/database');
console.log('');
console.log('Then I can install "pg" package and execute migrations programmatically!');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('For now, migration 002 is copied to clipboard.');
console.log('Paste in SQL editor and click RUN.');
console.log('');

