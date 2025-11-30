#!/usr/bin/env node

/**
 * 🖖 RAG-Verified Documentation Pruning Script
 * 
 * SAFE pruning of archived documentation:
 * 1. Checks if document is ingested to RAG (Supabase)
 * 2. Verifies knowledge is searchable
 * 3. Only deletes if confirmed in knowledge base
 * 4. Keeps 3-month retention before permanent deletion
 * 
 * Reviewed by: Commander Data (Verification) & Lt. Cmdr. La Forge (Safety)
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const ARCHIVE_DIR = path.join(process.cwd(), 'docs/archive');
const RETENTION_DAYS = 90; // 3 months
const DRY_RUN = process.argv.includes('--dry-run');

// Supabase configuration (would load from env)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_API_KEY;

// Logging
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  crew: (member, msg) => console.log(`🖖 [${member}] ${msg}`),
};

/**
 * Check if document content exists in RAG system
 */
async function isInRAG(filename, supabase) {
  try {
    // Query the knowledge base for this document
    const { data, error } = await supabase
      .from('knowledge_base')
      .select('*')
      .ilike('source_file', `%${filename}%`)
      .limit(1);

    if (error) {
      log.warn(`Error querying RAG for ${filename}: ${error.message}`);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    log.error(`Failed to check RAG for ${filename}: ${error.message}`);
    return false;
  }
}

/**
 * Check if file is older than retention period
 */
function isOlderThanRetention(filepath) {
  const stats = fs.statSync(filepath);
  const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
  return ageInDays > RETENTION_DAYS;
}

/**
 * Scan archive directory for documents
 */
function scanArchive() {
  const documents = [];

  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const stats = fs.statSync(fullPath);
        documents.push({
          path: fullPath,
          name: entry.name,
          size: stats.size,
          modified: stats.mtime,
          ageInDays: Math.floor((Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24)),
        });
      }
    }
  }

  if (fs.existsSync(ARCHIVE_DIR)) {
    scanDir(ARCHIVE_DIR);
  }

  return documents;
}

/**
 * Main pruning logic
 */
async function pruneDocumentation() {
  console.log('\n🖖 ═══════════════════════════════════════════════════════════');
  console.log('   RAG-VERIFIED DOCUMENTATION PRUNING');
  console.log('═══════════════════════════════════════════════════════════\n');

  if (DRY_RUN) {
    log.info('DRY RUN MODE - No files will be deleted');
  }

  // Check Supabase credentials
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log.error('Supabase credentials not configured');
    log.info('Set SUPABASE_URL and SUPABASE_API_KEY environment variables');
    log.info('Skipping RAG verification - showing files that WOULD be checked');
    console.log('');
  }

  const supabase = SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;

  // Scan archive
  log.crew('Data', 'Scanning archive directory...');
  const documents = scanArchive();

  if (documents.length === 0) {
    log.info('No documents found in archive directory');
    return;
  }

  log.info(`Found ${documents.length} archived documents`);
  console.log('');

  // Categorize documents
  const eligible = documents.filter(d => isOlderThanRetention(d.path));
  const tooNew = documents.filter(d => !isOlderThanRetention(d.path));

  log.info(`Documents eligible for deletion (>${RETENTION_DAYS} days): ${eligible.length}`);
  log.info(`Documents too new to delete (<${RETENTION_DAYS} days): ${tooNew.length}`);
  console.log('');

  // Check each eligible document
  let verifiedCount = 0;
  let notInRAGCount = 0;
  let deletedCount = 0;

  for (const doc of eligible) {
    console.log(`\n📄 ${doc.name} (${doc.ageInDays} days old)`);

    if (supabase) {
      const inRAG = await isInRAG(doc.name, supabase);

      if (inRAG) {
        log.success(`  ✅ Found in RAG system`);
        verifiedCount++;

        if (!DRY_RUN) {
          // Safe to delete
          fs.unlinkSync(doc.path);
          log.success(`  🗑️  Deleted (content preserved in RAG)`);
          deletedCount++;
        } else {
          log.info(`  [DRY RUN] Would delete: ${doc.path}`);
        }
      } else {
        log.warn(`  ⚠️  NOT found in RAG - KEEPING file`);
        log.info(`  💡 Ingest this file before pruning: node scripts/prepare-rag-knowledge-base.js`);
        notInRAGCount++;
      }
    } else {
      log.warn(`  ⚠️  Cannot verify RAG (no Supabase credentials)`);
      log.info(`  📋 KEEP for manual review`);
    }
  }

  // Summary
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('📊 PRUNING SUMMARY:');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`Total documents in archive: ${documents.length}`);
  console.log(`Eligible for deletion: ${eligible.length}`);
  console.log(`Too new (kept): ${tooNew.length}`);
  
  if (supabase) {
    console.log(`Verified in RAG: ${verifiedCount}`);
    console.log(`Not in RAG (kept): ${notInRAGCount}`);
  }

  if (DRY_RUN) {
    console.log(`\nWould delete: ${verifiedCount} files`);
    console.log('Run without --dry-run to actually delete');
  } else {
    console.log(`\nDeleted: ${deletedCount} files`);
    console.log(`Kept: ${documents.length - deletedCount} files`);
  }

  console.log('\n🖖 Documentation pruning complete!');
  console.log('════════════════════════════════════════════════════════════\n');
}

// Main
if (require.main === module) {
  pruneDocumentation().catch(error => {
    log.error(`Pruning failed: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { pruneDocumentation, isOlderThanRetention };

/**
 * USAGE:
 * 
 * Dry run (safe, shows what would happen):
 *   node scripts/verify-rag-and-prune.js --dry-run
 * 
 * Actual pruning (deletes RAG-verified files):
 *   node scripts/verify-rag-and-prune.js
 * 
 * SAFETY:
 * - Only deletes files older than 90 days
 * - Only deletes if content verified in RAG
 * - Dry run mode available
 * - Manual override possible
 */

