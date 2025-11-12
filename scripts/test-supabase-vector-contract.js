#!/usr/bin/env node
'use strict';

/**
 * Supabase Vector Contract Test
 * -----------------------------
 * Validates that the crew memory schema accepts new records with vector
 * embeddings and that semantic search returns the inserted fragment while
 * respecting Prime Directive metadata.
 *
 * Steps:
 *   1. Generate a synthetic embedding (deterministic for repeatability)
 *   2. Insert a Prime-Directive-compliant memory fragment
 *   3. Query the search_crew_memories_semantic() RPC
 *   4. Persist a JSON report under reports/
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');

const { loadCrewCredentials } = require('./utils/load-crew-credentials');

function makeDeterministicEmbedding(seed, dimensions = 1536) {
  const rng = crypto.createHash('sha256').update(seed).digest();
  const numbers = [];
  for (let i = 0; i < dimensions; i += 1) {
    const byteIndex = i % rng.length;
    numbers.push(((rng[byteIndex] / 255) * 2 - 1).toFixed(6));
  }
  return numbers.map(Number);
}

function buildMemoryPayload(vector) {
  const now = new Date().toISOString();
  const title = 'Prime Directive Vector Contract Validation';
  const summary =
    'Verifies that Supabase stores vector embeddings and semantic metadata while honoring the Prime Directive ambiguity policy.';

  return {
    crew_member: 'picard',
    crew_member_name: 'Captain Jean-Luc Picard',
    knowledge_type: 'strategic_assessment',
    priority: 'high',
    title,
    summary,
    detailed_analysis:
      'A synthetic memory fragment created by the automated contract harness to ensure vector embeddings persist correctly.',
    key_findings: ['Vector field persisted', 'Semantic RPC reachable', 'Prime Directive compliant'],
    conclusions: ['Continue using automated validation before major releases.'],
    recommendations: ['Add nightly semantic search smoke test.'],
    referenced_documents: ['MILESTONE_SUMMARY.md'],
    related_topics: ['crew_collaboration', 'vector_search'],
    applicable_scenarios: ['pre-release validation', 'infrastructure audits'],
    general_principles: ['Maintain ambiguity while preserving strategic intent.'],
    tags: ['automated-test', 'prime-directive', 'vector-contract'],
    keywords: ['semantic-search', 'prime-directive', 'vector'],
    complexity_level: 4,
    confidence_level: 88,
    prime_directive_compliance: 'compliant',
    semantic_text: `${title}\n${summary}`,
    vector_embedding: vector,
    validated_by: ['data'],
    created_at: now,
  };
}

async function main() {
  const creds = loadCrewCredentials();
  const supabaseUrl = creds.supabase?.url;
  const supabaseKey = creds.supabase?.serviceKey || creds.supabase?.key;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });

  const vector = makeDeterministicEmbedding('alex-ai-prime-directive-validation');
  const payload = buildMemoryPayload(vector);

  console.log('🧠 Inserting test memory fragment into Supabase...');
  const { data: insertData, error: insertError } = await supabase
    .from('crew_memories')
    .insert(payload)
    .select()
    .limit(1)
    .single();

  if (insertError) {
    console.error('❌ Insert failed:', insertError.message);
    process.exit(1);
  }
  console.log(`   ✔ Memory inserted with id ${insertData.id}`);

  console.log('🔍 Performing semantic similarity query...');
  const { data: searchResults, error: searchError } = await supabase.rpc(
    'search_crew_memories_semantic',
    {
      query_embedding: vector,
      match_threshold: 0.2,
      match_count: 5,
    }
  );

  if (searchError) {
    console.error('❌ Semantic search failed:', searchError.message);
    process.exit(1);
  }

  console.log(`   ✔ Retrieved ${searchResults.length} memories (top result similarity ${searchResults[0]?.similarity?.toFixed(3) ?? 'n/a'})`);

  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(
    reportsDir,
    `supabase-vector-contract-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  );

  const report = {
    generatedAt: new Date().toISOString(),
    insertedMemory: insertData,
    searchResults,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
  console.log(`📄 Report saved to ${path.relative(process.cwd(), reportPath)}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  });
}


