#!/usr/bin/env node

/**
 * Crew Memory Contract Audit & Migration Helper
 * ---------------------------------------------
 * Fetches legacy crew memories from Supabase, compares them with the
 * post-O'Brien contract, and prepares enriched records ready for re-insertion
 * once the new schema is applied.
 *
 * Output:
 *   reports/crew-memory-contract-audit.json   // summary + stats
 *   reports/crew-memory-transformed.json     // transformed payloads
 */

'use strict';

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const OUTPUT_DIR = path.join(__dirname, '..', 'reports');
const TRANSFORMED_FILE = path.join(OUTPUT_DIR, 'crew-memory-transformed.json');
const AUDIT_FILE = path.join(OUTPUT_DIR, 'crew-memory-contract-audit.json');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function loadCrewProfiles() {
  const directory = path.join(__dirname, '..', 'crew-members');
  const entries = fs.readdirSync(directory).filter((file) => file.endsWith('.json'));
  const profiles = {};
  for (const file of entries) {
    const slug = file.replace(/\.json$/, '')
      .replace(/_/g, '-')
      .replace(/\s+/g, '-')
      .toLowerCase();
    try {
      const data = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
      profiles[slug] = data;
    } catch (error) {
      console.error(`⚠️  Failed to load crew profile ${file}: ${error.message}`);
    }
  }
  return profiles;
}

function slugifyCrewName(name = '') {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .replace(/captain-/, '')
    .replace(/commander-/, '')
    .replace(/lieutenant-/, '')
    .replace(/chief-/, '')
    .replace(/dr-/, '')
    .replace(/-/g, '_');
}

async function fetchLegacyMemories(credentials) {
  const base = credentials.supabase.url.replace(/\/$/, '');
  const headers = {
    apikey: credentials.supabase.key,
    Authorization: `Bearer ${credentials.supabase.key}`,
    'Content-Type': 'application/json',
  };
  const url = `${base}/rest/v1/crew_memories?select=*&order=created_at.asc`;
  const { data } = await axios.get(url, { headers, timeout: 20000 });
  return Array.isArray(data) ? data : [];
}

function recommendTitle(entry) {
  if (entry.mission_id && entry.mission_id !== 'legacy') return entry.mission_id.replace(/[_-]+/g, ' ');
  const snippet = (entry.content || '').split(/[.!?]/)[0] || 'Crew update';
  return snippet.trim().slice(0, 80) || 'Crew update';
}

function buildContext(entry, profile) {
  const context = {
    legacy_mission_id: entry.mission_id || null,
    legacy_importance: entry.importance || null,
  };
  if (profile?.personality) context.personality = profile.personality;
  if (profile?.expertise) context.expertise = profile.expertise;
  return context;
}

(async () => {
  console.log('🔍 Auditing crew memory contracts...');
  const credentials = loadCrewCredentials();
  if (!credentials.supabase.url || !credentials.supabase.key) {
    console.error('❌ Supabase credentials missing (check environment variables).');
    process.exit(1);
  }

  const profiles = loadCrewProfiles();
  const legacyMemories = await fetchLegacyMemories(credentials);
  console.log(`   • Found ${legacyMemories.length} legacy records`);

  const transformed = [];
  const issues = [];
  const counters = {
    total: legacyMemories.length,
    byCrew: {},
  };

  for (const entry of legacyMemories) {
    const slug = slugifyCrewName(entry.crew_member || '');
    counters.byCrew[slug] = (counters.byCrew[slug] || 0) + 1;

    const profile = profiles[slug];
    if (!profile) {
      issues.push({
        id: entry.id,
        crew_member: entry.crew_member,
        reason: 'missing_crew_profile',
      });
    }

    const record = {
      legacy_id: entry.id,
      crew_member_slug: slug,
      crew_member_name: entry.crew_member,
      knowledge_type: 'legacy_import',
      memory_type: entry.memory_type || 'legacy_note',
      title: recommendTitle(entry),
      summary: entry.content?.slice(0, 200) || 'Legacy crew memory',
      content: entry.content,
      context: buildContext(entry, profile),
      tags: profile?.personality?.traits || [],
      recommendations: profile?.expertise?.recommendations || [],
      confidence_level: profile?.expertise?.confidence || 75,
      complexity_level: profile?.expertise?.experience ? Math.min(10, Math.max(1, Math.round(profile.expertise.experience / 3))) : 5,
      created_at: entry.created_at || entry.timestamp,
      updated_at: entry.created_at || entry.timestamp,
    };

    transformed.push(record);
  }

  fs.writeFileSync(TRANSFORMED_FILE, JSON.stringify(transformed, null, 2));
  fs.writeFileSync(AUDIT_FILE, JSON.stringify({ summary: counters, issues }, null, 2));

  console.log(`   • Wrote transformed payload: ${TRANSFORMED_FILE}`);
  console.log(`   • Wrote audit summary:      ${AUDIT_FILE}`);
  console.log('✅ Audit complete. Apply new schema, then upsert transformed payloads.');
})();
