#!/usr/bin/env node
/**
 * CLI adapter for bootstrapping crew identities from Memory Alpha
 * using the domain/application/infrastructure layers.
 */

const { bootstrapCrewIdentities } = require('../src/application/crew/bootstrapCrewIdentities');
const { isSupabaseConfigured } = require('../src/infrastructure/supabase/CrewMemoryRepository');

const MEMORY_ALPHA_PORTAL_URL = process.env.MEMORY_ALPHA_PORTAL_URL ||
  'https://memory-alpha.fandom.com/wiki/Portal:Main';

const args = process.argv.slice(2);
const SHOULD_INGEST = args.includes('--ingest');
const QUIET = args.includes('--quiet');
const STRICT_MODE = args.includes('--strict');

function log(...messages) {
  if (!QUIET) {
    console.log(...messages);
  }
}

function summarizeText(text, length = 140) {
  if (!text) {
    return 'Not found';
  }
  const trimmed = text.replace(/\s+/g, ' ').trim();
  return trimmed.length > length ? `${trimmed.slice(0, length)}…` : trimmed;
}

async function run() {
  const start = Date.now();
  const supabaseConfiguredBefore = isSupabaseConfigured();

  log('══════════════════════════════════════════════════════════════════════════════');
  log('  🚀 Crew Identity Bootstrap – Memory Alpha ↔ Supabase RAG');
  log('══════════════════════════════════════════════════════════════════════════════');
  log(`Portal       : ${MEMORY_ALPHA_PORTAL_URL}`);
  if (supabaseConfiguredBefore) {
    log(`Supabase     : ${process.env.SUPABASE_URL}`);
  } else {
    log('Supabase     : (skipped – set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY to compare)');
  }
  log(`Ingest mode  : ${SHOULD_INGEST ? 'Enabled (will push to knowledge-ingest)' : 'Disabled (preview only)'}`);
  log('');

  const { results, lowSimilarity, supabaseConfigured } = await bootstrapCrewIdentities({ ingest: SHOULD_INGEST });

  if (!supabaseConfigured) {
    log('⚠️  Supabase credentials not supplied; comparison performed without RAG baseline.');
    log('');
  }

  log('Crew Identity Alignment Report:');
  log('--------------------------------------------------------------------------');

  for (const entry of results) {
    const { crew, snippet, latestMemory, similarity, ingestResult, warnings } = entry;
    const similarityPercent = Math.round(similarity * 100);
    const latestSummary = latestMemory?.content
      ? summarizeText(latestMemory.content, 100)
      : '—';

    let action = 'skipped';
    if (ingestResult) {
      if (ingestResult.success && ingestResult.via === 'supabase') {
        action = 'stored directly in Supabase';
      } else if (ingestResult.success) {
        action = 'ingested via webhook';
      } else {
        action = `ingest failed (${ingestResult.warning})`;
      }
    }

    log(`• ${crew.name}`);
    log(`   Portal snippet   : ${summarizeText(snippet)}`);
    log(`   Latest RAG entry : ${latestSummary}`);
    log(`   Similarity       : ${similarityPercent}%`);
    log(`   Action           : ${action}`);

    (warnings || []).forEach(warning => {
      log(`   ⚠️  ${warning}`);
    });

    log('');
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  log('══════════════════════════════════════════════════════════════════════════════');
  log(`  ✅ Completed in ${duration}s`);
  log('══════════════════════════════════════════════════════════════════════════════');

  if (lowSimilarity.length) {
    const names = lowSimilarity.map(entry => entry.crew.name).join(', ');
    log('⚠️  Low similarity detected for:', names);
    if (STRICT_MODE) {
      process.exitCode = 2;
    }
  }
}

run().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
