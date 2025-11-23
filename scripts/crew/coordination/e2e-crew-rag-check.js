#!/usr/bin/env node

/**
 * Crew → RAG end-to-end verification
 * ----------------------------------
 * 1. Creates a test memory for each crew member using Supabase knowledge_base.
 * 2. Reads back the latest entry for that crew member to confirm retrieval.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars (load via
 * scripts/lib/load-supabase-env.sh before running).
 */

const { CREW_ROSTER } = require('../src/domain/crew/identity');
const {
  storeIdentitySnapshot,
  fetchLatestSnapshots
} = require('../src/infrastructure/supabase/KnowledgeBaseRepository');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m'
};

function header(title) {
  console.log('\n' + colors.bright + colors.cyan + '━'.repeat(80) + colors.reset);
  console.log(colors.bright + colors.cyan + `  ${title}` + colors.reset);
  console.log(colors.bright + colors.cyan + '━'.repeat(80) + colors.reset + '\n');
}

async function run() {
  const start = Date.now();
  header('CREW ↔ RAG END-TO-END VERIFICATION');

  const results = [];
  const timestamp = new Date().toISOString();

  for (const crew of CREW_ROSTER) {
    const snippet = `${crew.name} test memory created at ${timestamp}`;
    const storeResult = await storeIdentitySnapshot(crew, snippet, { sourceUrl: 'automatic-e2e-test' });

    if (!storeResult.success) {
      results.push({ crew, storeResult, fetchResult: null });
      console.log(`${colors.red}❌ ${crew.name}: ${storeResult.warning}${colors.reset}`);
      continue;
    }

    const fetchResult = await fetchLatestSnapshots(crew.crewKey, 1);

    if (fetchResult.warning) {
      console.log(`${colors.yellow}⚠️  ${crew.name}: ${fetchResult.warning}${colors.reset}`);
    }

    const latest = fetchResult.entries[0];
    if (latest) {
      console.log(`${colors.green}✅ ${crew.name}: retrieved memory → ${latest.title}${colors.reset}`);
      console.log(`    Content preview: ${JSON.stringify(latest.content, null, 2)}`);
    } else {
      console.log(`${colors.red}❌ ${crew.name}: no memory retrieved${colors.reset}`);
    }

    results.push({ crew, storeResult, fetchResult });
  }

  header('SUMMARY');

  const successes = results.filter(r => r.storeResult.success && r.fetchResult?.entries?.length);
  const failures = results.filter(r => !r.storeResult.success || !(r.fetchResult?.entries?.length));

  console.log(`${colors.green}Successful crew: ${successes.length}/${results.length}${colors.reset}`);
  if (failures.length) {
    console.log(`${colors.red}Failures: ${failures.map(r => r.crew.name).join(', ')}${colors.reset}`);
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nCompleted in ${duration}s.`);
}

run().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

