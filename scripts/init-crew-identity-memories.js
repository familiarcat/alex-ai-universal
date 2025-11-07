#!/usr/bin/env node
/**
 * Initialize crew identity memories from Memory Alpha and compare with RAG entries.
 *
 * Steps:
 *   1. Scrape https://memory-alpha.fandom.com/wiki/Portal:Main
 *   2. Extract identity snippets for each core crew member
 *   3. Compare with the latest entry in Supabase RAG (if credentials are present)
 *   4. Optionally ingest the scraped memories through the n8n knowledge-ingest webhook
 *
 * Usage:
 *   node scripts/init-crew-identity-memories.js          # scrape + compare only
 *   node scripts/init-crew-identity-memories.js --ingest # scrape + compare + ingest into RAG
 *   node scripts/init-crew-identity-memories.js --quiet  # minimal console noise
 */

const axios = require('axios');
const cheerio = require('cheerio');

const MEMORY_ALPHA_PORTAL_URL = process.env.MEMORY_ALPHA_PORTAL_URL ||
  'https://memory-alpha.fandom.com/wiki/Portal:Main';
const MEMORY_ALPHA_BASE_URL = process.env.MEMORY_ALPHA_BASE_URL ||
  'https://memory-alpha.fandom.com/wiki';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const KNOWLEDGE_INGEST_URL = process.env.N8N_KNOWLEDGE_INGEST_URL ||
  'https://n8n.pbradygeorgen.com/webhook/knowledge-ingest';
const N8N_EMAIL = process.env.N8N_EMAIL;
const N8N_PASSWORD = process.env.N8N_PASSWORD;

const args = process.argv.slice(2);
const SHOULD_INGEST = args.includes('--ingest');
const QUIET = args.includes('--quiet');

const CREW_ROSTER = [
  { name: 'Captain Jean-Luc Picard', slug: 'Jean-Luc_Picard', crewKey: 'crew-captain-jean-luc-picard' },
  { name: 'Commander William Riker', slug: 'William_T._Riker', crewKey: 'crew-commander-william-riker' },
  { name: 'Commander Data', slug: 'Data', crewKey: 'crew-commander-data' },
  { name: 'Lt. Commander Geordi La Forge', slug: 'Geordi_La_Forge', crewKey: 'crew-geordi-la-forge' },
  { name: 'Lieutenant Worf', slug: 'Worf', crewKey: 'crew-lieutenant-worf' },
  { name: 'Counselor Deanna Troi', slug: 'Deanna_Troi', crewKey: 'crew-counselor-deanna-troi' },
  { name: 'Dr. Beverly Crusher', slug: 'Beverly_Crusher', crewKey: 'crew-dr-beverly-crusher' },
  { name: 'Lieutenant Nyota Uhura', slug: 'Nyota_Uhura', crewKey: 'crew-lieutenant-uhura' },
  { name: "Chief Miles O'Brien", slug: 'Miles_O%27Brien', crewKey: 'crew-chief-obrien' },
  { name: 'Quark', slug: 'Quark', crewKey: 'crew-quark' }
];

function log(...messages) {
  if (!QUIET) {
    console.log(...messages);
  }
}

async function fetchCrewIdentitySnippet(crew) {
  const url = `${MEMORY_ALPHA_BASE_URL}/${crew.slug}`;
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Alex-AI-Memory-Sync/1.0 (+https://alex-ai-universal)'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    // Memory Alpha pages place the first canonical paragraph inside .portable-infobox or the lead paragraphs
    const candidateSelectors = [
      '#mw-content-text > div.mw-parser-output > p',
      '.portable-infobox .pi-data-value',
      '.portable-infobox .pi-data',
      '.portable-infobox'
    ];

    let snippet = null;
    for (const selector of candidateSelectors) {
      const element = $(selector).filter(function () {
        const text = $(this).text().replace(/\s+/g, ' ').trim();
        return text.length > 60; // ignore very short blurbs
      }).first();
      if (element && element.length) {
        snippet = element.text();
        break;
      }
    }

    if (!snippet) {
      // fallback to first paragraph with meaningful content
      const fallback = $('#mw-content-text p').filter(function () {
        const text = $(this).text().replace(/\s+/g, ' ').trim();
        return text.length > 40;
      }).first();

      snippet = fallback.text();
    }

    if (!snippet) {
      return null;
    }

    return snippet.replace(/\s+/g, ' ').trim();
  } catch (error) {
    log(`⚠️  Failed to fetch Memory Alpha page for ${crew.name}: ${error.message}`);
    return null;
  }
}

function isSupabaseConfigured() {
  return Boolean(
    SUPABASE_URL &&
    SUPABASE_SERVICE_ROLE_KEY &&
    SUPABASE_URL !== 'undefined' &&
    SUPABASE_SERVICE_ROLE_KEY !== 'undefined'
  );
}

async function fetchLatestSupabaseMemory(crewKey) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const response = await axios.get(`${SUPABASE_URL}/rest/v1/crew_memories`, {
      params: {
        crew_member: `eq.${crewKey}`,
        select: 'id,crew_member,source,category,observation,created_at',
        order: 'created_at.desc',
        limit: 1
      },
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Accept: 'application/json'
      },
      timeout: 15000
    });

    return response.data?.[0] || null;
  } catch (error) {
    log(`⚠️  Failed to fetch Supabase memory for ${crewKey}: ${error.message}`);
    return null;
  }
}

function computeSimilarity(a, b) {
  if (!a || !b) {
    return 0;
  }

  const wordsA = new Set(
    a.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  );
  const wordsB = new Set(
    b.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
  );

  const intersection = new Set([...wordsA].filter(w => wordsB.has(w)));
  const unionSize = new Set([...wordsA, ...wordsB]).size || 1;

  return intersection.size / unionSize;
}

async function ingestMemory(crew, snippet) {
  if (!snippet) {
    return { success: false, reason: 'No snippet to ingest' };
  }

  try {
    const payload = {
      source: 'Memory Alpha Portal Snapshot',
      category: 'crew_identity_bootstrap',
      timestamp: new Date().toISOString(),
      crew_member: crew.crewKey,
      title: `${crew.name} – canonical Memory Alpha identity`,
      observation: snippet,
      tags: ['memory-alpha', 'identity', 'bootstrap', crew.crewKey],
      metadata: {
        crewName: crew.name,
        memoryAlphaSlug: crew.slug,
        source_url: MEMORY_ALPHA_PORTAL_URL
      }
    };

    const config = {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    };

    if (N8N_EMAIL && N8N_PASSWORD) {
      config.auth = { username: N8N_EMAIL, password: N8N_PASSWORD };
    }

    await axios.post(KNOWLEDGE_INGEST_URL, payload, config);
    return { success: true };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

async function run() {
  const start = Date.now();
  log('══════════════════════════════════════════════════════════════════════════════');
  log('  🚀 Crew Identity Bootstrap – Memory Alpha ↔ Supabase RAG');
  log('══════════════════════════════════════════════════════════════════════════════');
  log(`Portal       : ${MEMORY_ALPHA_PORTAL_URL}`);
  if (isSupabaseConfigured()) {
    log(`Supabase     : ${SUPABASE_URL}`);
  } else {
    log('Supabase     : (skipped – set SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY to compare)');
  }
  log(`Ingest mode  : ${SHOULD_INGEST ? 'Enabled (will push to knowledge-ingest)' : 'Disabled (preview only)'}`);
  log('');

  const report = [];

  for (const crew of CREW_ROSTER) {
    const snippet = await fetchCrewIdentitySnippet(crew);
    const latestMemory = await fetchLatestSupabaseMemory(crew.crewKey);
    const similarity = computeSimilarity(snippet, latestMemory?.observation);

    let ingestResult = null;
    if (SHOULD_INGEST) {
      ingestResult = await ingestMemory(crew, snippet);
    }

    report.push({ crew, snippet, latestMemory, similarity, ingestResult });
  }

  log('Crew Identity Alignment Report:');
  log('--------------------------------------------------------------------------');

  for (const entry of report) {
    const { crew, snippet, latestMemory, similarity, ingestResult } = entry;
    const similarityPercent = Math.round(similarity * 100);
    const existingSummary = latestMemory?.observation ? `${latestMemory.observation.slice(0, 100)}${latestMemory.observation.length > 100 ? '…' : ''}` : '—';
    const ingestStatus = ingestResult
      ? ingestResult.success
        ? 'ingested'
        : `ingest failed (${ingestResult.reason})`
      : 'skipped';

    log(`• ${crew.name}`);
    log(`   Portal snippet   : ${snippet ? snippet.slice(0, 140).trim() + (snippet.length > 140 ? '…' : '') : 'Not found'}`);
    log(`   Latest RAG entry : ${existingSummary}`);
    log(`   Similarity       : ${similarityPercent}%`);
    log(`   Action           : ${ingestStatus}`);
    log('');
  }

  const duration = ((Date.now() - start) / 1000).toFixed(1);
  log('══════════════════════════════════════════════════════════════════════════════');
  log(`  ✅ Completed in ${duration}s`);
  log('══════════════════════════════════════════════════════════════════════════════');

  // Provide exit code summary so automation can detect misalignment.
  const needsAttention = report.filter(entry => entry.similarity < 0.25).map(entry => entry.crew.name);
  if (needsAttention.length) {
    log('⚠️  Low similarity detected for:', needsAttention.join(', '));
    process.exitCode = 2;
  }
}

run().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

