#!/usr/bin/env node
'use strict';

/**
 * Seeds the Prime Directive crew memory table using the structured crew profile
 * JSON files under `crew-members/`. Each profile is transformed into a
 * compliant memory entry with deterministic vector embeddings so semantic
 * search remains stable across runs.
 */

const { readdirSync, readFileSync } = require('node:fs');
const { join, basename } = require('node:path');
const { createClient } = require('@supabase/supabase-js');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const CREW_PROFILE_DIR = join(process.cwd(), 'crew-members');
const CREW_ENUM_MAP = {
  captain_picard: { slug: 'picard', name: 'Captain Jean-Luc Picard' },
  commander_riker: { slug: 'riker', name: 'Commander William Riker' },
  commander_data: { slug: 'data', name: 'Commander Data' },
  geordi_la_forge: { slug: 'la_forge', name: 'Lieutenant Commander Geordi La Forge' },
  lieutenant_worf: { slug: 'worf', name: 'Lieutenant Worf' },
  counselor_troi: { slug: 'troi', name: 'Counselor Deanna Troi' },
  dr_crusher: { slug: 'crusher', name: 'Dr. Beverly Crusher' },
  lieutenant_uhura: { slug: 'uhura', name: 'Lieutenant Uhura' },
  quark: { slug: 'quark', name: 'Quark' },
  chief_obrien: { slug: 'chief_obrien', name: "Chief Miles O'Brien" },
};

function makeDeterministicEmbedding(seed, dimensions = 1536) {
  const crypto = require('node:crypto');
  const hash = crypto.createHash('sha256').update(seed).digest();
  const values = new Array(dimensions);
  for (let i = 0; i < dimensions; i += 1) {
    const byte = hash[i % hash.length];
    values[i] = Number(((byte / 255) * 2 - 1).toFixed(6));
  }
  return values;
}

function buildMemoryFromProfile(profile) {
  const enumEntry = CREW_ENUM_MAP[profile.id];
  if (!enumEntry) {
    return null;
  }

  const responsibilities = profile.responsibilities || [];
  const guidelines = profile.aiConfiguration?.guidelines || [];
  const specialization = profile.specialization || [];
  const typicalUseCases = profile.typicalUseCases || [];
  const worksWith = profile.worksWith || [];

  const summary = `${profile.name} (${profile.role}) – ${profile.personality?.archetype || 'Crew member'} providing ${profile.expertise?.primary || 'specialized'} support.`;

  const detailedSections = [
    `Role: ${profile.role}`,
    `Department: ${profile.department}`,
    `Specialization: ${specialization.join(', ')}`,
    `Primary Expertise: ${profile.expertise?.primary || 'N/A'}`,
    `Secondary Expertise: ${(profile.expertise?.secondary || []).join(', ')}`,
    `Personality Traits: ${(profile.personality?.traits || []).join(', ')}`,
    `Guidelines: ${guidelines.join('; ')}`,
    `Responsibilities: ${responsibilities.join('; ')}`,
    `Typical Use Cases: ${typicalUseCases.join('; ')}`,
  ].join('\n');

  const vector = makeDeterministicEmbedding(profile.id);

  return {
    crew_member: enumEntry.slug,
    crew_member_name: enumEntry.name,
    knowledge_type: 'reference_documentation',
    priority: 'high',
    title: `${enumEntry.name} Crew Profile`,
    summary,
    detailed_analysis: detailedSections,
    key_findings: specialization,
    conclusions: [],
    recommendations: responsibilities.slice(0, 5),
    referenced_documents: [],
    related_topics: worksWith.map((id) => id.replace(/_/g, ' ')),
    applicable_scenarios: typicalUseCases,
    general_principles: guidelines,
    tags: ['crew-profile', profile.department?.toLowerCase() || 'crew'],
    keywords: [
      profile.role,
      profile.department,
      ...(profile.capabilities || []),
      ...(profile.specialization || []),
    ].filter(Boolean),
    complexity_level: 5,
    confidence_level: 90,
    prime_directive_compliance: 'compliant',
    project_specificity: false,
    semantic_text: `${summary}\n\n${detailedSections}`,
    validated_by: [],
    conflict_resolutions: [],
    vector_embedding: vector,
    timestamp: profile.metadata?.updated || new Date().toISOString(),
  };
}

async function main() {
  const creds = loadCrewCredentials();
  if (!creds.supabase?.url || !creds.supabase?.serviceKey) {
    console.error('❌ Supabase credentials missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
    process.exit(1);
  }

  const supabase = createClient(creds.supabase.url, creds.supabase.serviceKey, {
    auth: { persistSession: false },
  });

  console.log('📂 Reading crew profiles from', CREW_PROFILE_DIR);
  const files = readdirSync(CREW_PROFILE_DIR).filter((name) => name.endsWith('.json'));

  const memories = [];
  for (const file of files) {
  let raw;
  try {
    raw = JSON.parse(readFileSync(join(CREW_PROFILE_DIR, file), 'utf8'));
  } catch (error) {
    console.warn(`⚠️  Skipping ${file} (invalid JSON: ${error.message})`);
    continue;
  }
    const normalizedId = raw.id || basename(file, '.json').replace(/-/g, '_');
    raw.id = normalizedId;

    const memory = buildMemoryFromProfile(raw);
    if (!memory) {
      console.warn(`⚠️  Skipping ${file} (crew member not mapped in enum).`);
      continue;
    }
    memories.push(memory);
  }

  if (memories.length === 0) {
    console.warn('⚠️  No crew memories to insert.');
    process.exit(0);
  }

  console.log(`🧹 Removing existing crew-profile memories (${memories.length})...`);
  const { error: deleteError } = await supabase
    .from('crew_memories')
    .delete()
    .contains('tags', ['crew-profile']);
  if (deleteError) {
    console.error('❌ Failed to delete existing crew-profile memories:', deleteError.message);
    process.exit(1);
  }

  console.log('🧠 Inserting new crew-profile memories...');
  const batchSize = 25;
  for (let i = 0; i < memories.length; i += batchSize) {
    const batch = memories.slice(i, i + batchSize);
    const { error } = await supabase.from('crew_memories').insert(batch);
    if (error) {
      console.error('❌ Failed to insert memories batch:', error.message);
      process.exit(1);
    }
  }

  console.log(`✅ Inserted ${memories.length} crew memories.`);
}

main().catch((error) => {
  console.error('❌ Seed failed:', error.message);
  process.exit(1);
});


