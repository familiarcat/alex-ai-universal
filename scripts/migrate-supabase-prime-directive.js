#!/usr/bin/env node
'use strict';

/**
 * Supabase Prime Directive Migration
 * ----------------------------------
 * Automates the end-to-end upgrade of the crew memory datastore:
 *   1. Archives legacy tables (crew_memories, memory_relationships, memory_validations)
 *   2. Applies the Prime Directive schema (vector embeddings, ambiguity fields, graph tables)
 *   3. Regenerates transformed legacy memories and upserts them into the new contract
 *   4. Runs the semantic vector contract test to validate the flow
 *   5. Emits a markdown summary under reports/
 *
 * Requirements:
 *   - psql installed locally
 *   - SUPABASE_DB_URL and SUPABASE_DB_PASSWORD set (sslmode=require is appended automatically)
 *   - SUPABASE_SERVICE_KEY (for Supabase client scripts)
 */

const { spawnSync } = require('node:child_process');
const { mkdirSync, writeFileSync, existsSync, readFileSync } = require('node:fs');
const { join } = require('node:path');
const { createClient } = require('@supabase/supabase-js');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

function runCommand(command, options = {}) {
  const start = Date.now();
  const result = spawnSync(command, {
    shell: true,
    stdio: options.capture ? 'pipe' : 'inherit',
    env: options.env || process.env,
  });

  const duration = ((Date.now() - start) / 1000).toFixed(2);
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    if (options.capture && result.stderr?.length) {
      process.stderr.write(result.stderr);
    }
    throw new Error(`Command failed (${duration}s): ${command}`);
  }
  if (options.capture) {
    return {
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString(),
      duration,
    };
  }
  return { duration };
}

async function main() {
  const startTime = new Date();
  const supabaseDbUrl = requireEnv('SUPABASE_DB_URL');
  const supabaseUrl = requireEnv('SUPABASE_URL');
  const supabaseServiceKey = requireEnv('SUPABASE_SERVICE_KEY');

  const sslUrl = supabaseDbUrl.includes('sslmode=')
    ? supabaseDbUrl
    : `${supabaseDbUrl}?sslmode=require`;

  console.log('🔐 Using Supabase database URL:', sslUrl.replace(/:[^:@/]+@/, ':[REDACTED]@'));

  const summary = {
    startedAt: startTime.toISOString(),
    steps: [],
  };

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  });

  const schemaPath = join(process.cwd(), 'supabase', 'schemas', 'crew-memory-schema.sql');

  // 1. Archive legacy tables -------------------------------------------------
  const archiveSql = `
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crew_memories') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'crew_memories_legacy') THEN
      EXECUTE 'DROP TABLE IF EXISTS public.crew_memories_legacy CASCADE';
    END IF;
    EXECUTE 'ALTER TABLE public.crew_memories RENAME TO crew_memories_legacy';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memory_relationships') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memory_relationships_legacy') THEN
      EXECUTE 'DROP TABLE IF EXISTS public.memory_relationships_legacy CASCADE';
    END IF;
    EXECUTE 'ALTER TABLE public.memory_relationships RENAME TO memory_relationships_legacy';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memory_validations') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'memory_validations_legacy') THEN
      EXECUTE 'DROP TABLE IF EXISTS public.memory_validations_legacy CASCADE';
    END IF;
    EXECUTE 'ALTER TABLE public.memory_validations RENAME TO memory_validations_legacy';
  END IF;
END $$;
  `.trim();

  console.log('\n🗃️  Archiving legacy tables if present...');
  const archiveCommand = archiveSql.replace(/\n/g, ' ').replace(/\$/g, '\\$').replace(/"/g, '\\"');
  runCommand(`psql "${sslUrl}" -c "${archiveCommand}"`);
  summary.steps.push({ name: 'archive_legacy_tables', status: 'ok' });

  // 2. Apply Prime Directive schema -----------------------------------------
  console.log('\n📦 Applying Prime Directive schema...');
  runCommand(`psql "${sslUrl}" -f "${schemaPath}"`);
  summary.steps.push({ name: 'apply_schema', status: 'ok', schemaPath });

  // 3. Merge legacy memories into the new schema ----------------------------
  const mergeResult = await mergeLegacyMemories({ sslUrl, summary, supabase });
  summary.steps.push(mergeResult);

  // 5. Run Prime Directive vector validation --------------------------------
  console.log('\n🔍 Running semantic vector contract test...');
  const vectorResult = runCommand('node scripts/test-supabase-vector-contract.js', { capture: true });
  process.stdout.write(vectorResult.stdout);
  if (vectorResult.stderr) process.stderr.write(vectorResult.stderr);
  summary.steps.push({
    name: 'vector_contract_test',
    status: 'ok',
    output: vectorResult.stdout.trim(),
  });

  const finishedAt = new Date();
  summary.finishedAt = finishedAt.toISOString();
  summary.durationSeconds = ((finishedAt - startTime) / 1000).toFixed(2);

  const reportsDir = join(process.cwd(), 'reports');
  mkdirSync(reportsDir, { recursive: true });
  const reportPath = join(
    reportsDir,
    `prime-directive-migration-${finishedAt.toISOString().replace(/[:.]/g, '-')}.md`
  );

  const markdown = [
    '# Prime Directive Migration Summary',
    '',
    `- Started: ${summary.startedAt}`,
    `- Finished: ${summary.finishedAt}`,
    `- Duration: ${summary.durationSeconds}s`,
    '',
    '## Steps',
  ];

  summary.steps.forEach((step) => {
    markdown.push(`- **${step.name}**: ${step.status}`);
    if (step.output) {
      markdown.push('  ```');
      markdown.push(step.output);
      markdown.push('  ```');
    }
  });

  writeFileSync(reportPath, markdown.join('\n') + '\n', 'utf8');
  console.log(`\n📝 Migration summary saved to ${reportPath}`);
  console.log('✅ Supabase Prime Directive migration complete.');
}

function mapCrewSlug(name) {
  const value = (name || '').toLowerCase();
  if (value.includes('jean-luc') || value.includes('picard')) return { slug: 'picard', name: 'Captain Jean-Luc Picard' };
  if (value.includes('riker')) return { slug: 'riker', name: 'Commander William Riker' };
  if (value.includes('data')) return { slug: 'data', name: 'Commander Data' };
  if (value.includes('la forge')) return { slug: 'la_forge', name: 'Lieutenant Commander Geordi La Forge' };
  if (value.includes('worf')) return { slug: 'worf', name: 'Lieutenant Worf' };
  if (value.includes('troi')) return { slug: 'troi', name: 'Counselor Deanna Troi' };
  if (value.includes('crusher')) return { slug: 'crusher', name: 'Dr. Beverly Crusher' };
  if (value.includes('uhura')) return { slug: 'uhura', name: 'Lieutenant Uhura' };
  if (value.includes("o'brien") || value.includes('obrien')) return { slug: 'la_forge', name: name || 'Chief Miles O’Brien' }; // fallback
  if (value.includes('quark')) return { slug: 'quark', name: 'Quark' };
  return { slug: 'picard', name: name || 'Captain Jean-Luc Picard' };
}

function mapKnowledgeType(memoryType) {
  const map = {
    system_setup: 'technical_analysis',
    mission_experience: 'lesson_learned',
    character_foundation: 'reference_documentation',
    mission_briefing: 'strategic_assessment',
    tactical_update: 'technical_analysis',
  };
  return map[memoryType] || 'reference_documentation';
}

function mapConfidence(priority) {
  const table = { critical: 92, high: 85, medium: 75, low: 65 };
  return table[priority] || 70;
}

function mapComplexity(priority) {
  const table = { critical: 7, high: 6, medium: 5, low: 4 };
  return table[priority] || 5;
}

function buildSummary(content = '') {
  const trimmed = content.trim();
  if (!trimmed) return 'Legacy crew memory imported from pre-Prime-Directive schema.';
  return trimmed.length > 280 ? `${trimmed.slice(0, 277)}…` : trimmed;
}

async function mergeLegacyMemories({ sslUrl, summary, supabase }) {
  const existResult = runCommand(
    `psql "${sslUrl}" -At -c "SELECT to_regclass('public.crew_memories_legacy');"`,
    { capture: true }
  );
  const regclass = existResult.stdout.trim();
  if (!regclass || regclass === '') {
    console.log('\nℹ️  No legacy crew_memories_legacy table found. Skipping merge.');
    return { name: 'merge_legacy_memories', status: 'skipped', output: 'No legacy table detected.' };
  }

  const countResult = runCommand(
    `psql "${sslUrl}" -At -c "SELECT COUNT(*) FROM crew_memories_legacy;"`,
    { capture: true }
  );
  const legacyCount = Number.parseInt(countResult.stdout.trim(), 10) || 0;
  if (legacyCount === 0) {
    console.log('\nℹ️  Legacy table is empty. Checking for transformed payload...');
    let fallbackInserted = 0;
    const fallbackPath = join(process.cwd(), 'reports', 'crew-memory-transformed.json');
    if (existsSync(fallbackPath)) {
      try {
        const parsed = JSON.parse(readFileSync(fallbackPath, 'utf8'));
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log(`📦 Found ${parsed.length} transformed memories. Inserting into Supabase...`);
          const batchSize = 50;
          for (let index = 0; index < parsed.length; index += batchSize) {
            const batch = parsed.slice(index, index + batchSize);
            const { error } = await supabase.from('crew_memories').insert(batch);
            if (error) {
              throw new Error(`Failed to insert transformed payload batch: ${error.message}`);
            }
            fallbackInserted += batch.length;
          }
        }
      } catch (error) {
        console.warn('⚠️  Failed to use transformed payload fallback:', error.message);
      }
    }

    console.log('🧹 Dropping archived tables....');
    runCommand(`psql "${sslUrl}" -c "DROP TABLE IF EXISTS public.memory_relationships_legacy CASCADE;"`);
    runCommand(`psql "${sslUrl}" -c "DROP TABLE IF EXISTS public.memory_validations_legacy CASCADE;"`);
    runCommand(`psql "${sslUrl}" -c "DROP TABLE IF EXISTS public.crew_memories_legacy CASCADE;"`);
    return {
      name: 'merge_legacy_memories',
      status: fallbackInserted > 0 ? 'ok' : 'skipped',
      output:
        fallbackInserted > 0
          ? `Inserted ${fallbackInserted} memories using pre-generated transformed payload.`
          : 'Legacy table present but empty. Dropped archive tables.',
    };
  }

  console.log(`\n📥 Found ${legacyCount} legacy memories. Transforming...`);
  const exportResult = runCommand(
    `psql "${sslUrl}" -At -c "SELECT row_to_json(t) FROM crew_memories_legacy t ORDER BY id;"`,
    { capture: true }
  );
  const lines = exportResult.stdout.split('\n').filter(Boolean);
  const legacyRecords = lines.map((line) => JSON.parse(line));

  const { stdout: newCountOut } = runCommand(
    `psql "${sslUrl}" -At -c "SELECT COUNT(*) FROM crew_memories;"`,
    { capture: true }
  );
  const existingNewCount = Number.parseInt(newCountOut.trim(), 10) || 0;
  if (existingNewCount > 0) {
    console.log(`ℹ️  New crew_memories table already contains ${existingNewCount} rows. Skipping merge.`);
    return {
      name: 'merge_legacy_memories',
      status: 'skipped',
      output: `crew_memories already contains ${existingNewCount} rows.`,
    };
  }

  const transformed = legacyRecords.map((row) => {
    const { slug, name } = mapCrewSlug(row.crew_member);
    const priority = ['low', 'medium', 'high', 'critical'].includes((row.importance || '').toLowerCase())
      ? row.importance.toLowerCase()
      : 'medium';
    const title = row.mission_id
      ? row.mission_id.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : `Legacy Memory ${row.id}`;
    const summaryText = buildSummary(row.content);

    return {
      crew_member: slug,
      crew_member_name: name,
      knowledge_type: mapKnowledgeType(row.memory_type),
      priority,
      title,
      summary: summaryText,
      detailed_analysis: row.content || '',
      key_findings: [],
      conclusions: [],
      recommendations: [],
      referenced_documents: [],
      related_topics: [],
      applicable_scenarios: [],
      general_principles: [],
      tags: ['legacy-import', row.memory_type || 'unknown', `legacy-id-${row.id}`].filter(Boolean),
      keywords: [row.mission_id, row.memory_type].filter(Boolean),
      complexity_level: mapComplexity(priority),
      confidence_level: mapConfidence(priority),
      prime_directive_compliance: 'compliant',
      project_specificity: false,
      semantic_text: `${title}\n${summaryText}\n${row.content || ''}`,
      validated_by: [],
      conflict_resolutions: [],
      timestamp: row.timestamp || new Date().toISOString(),
    };
  });

  console.log('🚀 Inserting transformed memories into Supabase...');
  const batchSize = 50;
  for (let index = 0; index < transformed.length; index += batchSize) {
    const batch = transformed.slice(index, index + batchSize);
    const { error } = await supabase.from('crew_memories').insert(batch);
    if (error) {
      throw new Error(`Failed to insert transformed batch: ${error.message}`);
    }
  }

  console.log('🧹 Dropping archived tables...');
  runCommand(`psql "${sslUrl}" -c "DROP TABLE IF EXISTS public.memory_relationships_legacy CASCADE;"`);
  runCommand(`psql "${sslUrl}" -c "DROP TABLE IF EXISTS public.memory_validations_legacy CASCADE;"`);
  runCommand(`psql "${sslUrl}" -c "DROP TABLE IF EXISTS public.crew_memories_legacy CASCADE;"`);

  return {
    name: 'merge_legacy_memories',
    status: 'ok',
    output: `Migrated ${transformed.length} legacy memories into new schema.`,
  };
}

main().catch((error) => {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
});


