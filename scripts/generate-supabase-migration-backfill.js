#!/usr/bin/env node

/**
 * Generate INSERT statements to backfill supabase_migrations.schema_migrations
 * with all migration files currently on disk. Use this when the production
 * database was provisioned manually and the Supabase CLI needs to skip old
 * migrations.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const OUTPUT_FILE = path.join(__dirname, '..', 'reports', 'supabase-migration-backfill.sql');

if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error('❌ Migrations directory not found:', MIGRATIONS_DIR);
  process.exit(1);
}

fs.mkdirSync(path.join(__dirname, '..', 'reports'), { recursive: true });

function normalizeStatement(sql) {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeLiteral(sql) {
  return sql.replace(/'/g, "''");
}

const files = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter((file) => file.endsWith('.sql'))
  .sort();

const statements = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
  const version = file.split('_')[0];
  const rawStatements = content
    .split(';')
    .map((part) => normalizeStatement(part))
    .filter((part) => part.length > 0);
  if (rawStatements.length === 0) continue;
  const literalArray = rawStatements
    .map((stmt) => `  '${escapeLiteral(stmt)}'`)
    .join(',\n');
  statements.push(`-- ${file}\nINSERT INTO supabase_migrations.schema_migrations (version, statements, name)\nVALUES (\n  '${version}',\n  ARRAY[\n${literalArray}\n  ],\n  '${escapeLiteral(file)}'\n)\nON CONFLICT (version) DO NOTHING;\n`);
}

fs.writeFileSync(OUTPUT_FILE, statements.join('\n'));

console.log('✅ Generated backfill SQL:', OUTPUT_FILE);
console.log('Run this SQL once in the Supabase SQL editor, then rerun `supabase db push`.');
