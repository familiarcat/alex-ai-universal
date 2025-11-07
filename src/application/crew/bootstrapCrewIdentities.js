'use strict';

const { CREW_ROSTER, computeSimilarity } = require('../../domain/crew/identity');
const { fetchIdentitySnippet } = require('../../infrastructure/memory-alpha/IdentityRepository');
const { fetchLatestCrewMemory, isSupabaseConfigured } = require('../../infrastructure/supabase/CrewMemoryRepository');
const { ingestCrewIdentity } = require('../../infrastructure/n8n/KnowledgeIngestClient');

async function bootstrapCrewIdentities(options = {}) {
  const {
    ingest = false,
    roster = CREW_ROSTER
  } = options;

  const results = [];

  for (const crew of roster) {
    const snippetResult = await fetchIdentitySnippet(crew);
    const supabaseResult = await fetchLatestCrewMemory(crew.crewKey);

    let ingestResult = null;
    if (ingest) {
      ingestResult = await ingestCrewIdentity(crew, snippetResult.snippet, {
        sourceUrl: snippetResult.sourceUrl
      });
    }

    const similarity = computeSimilarity(
      snippetResult.snippet,
      supabaseResult.memory?.content
    );

    const warnings = [];
    if (snippetResult.warning) warnings.push(snippetResult.warning);
    if (supabaseResult.warning) warnings.push(supabaseResult.warning);
    if (ingestResult && ingestResult.warning) warnings.push(ingestResult.warning);

    results.push({
      crew,
      snippet: snippetResult.snippet,
      latestMemory: supabaseResult.memory,
      similarity,
      ingestResult,
      sourceUrl: snippetResult.sourceUrl,
      warnings
    });
  }

  const lowSimilarity = results.filter(entry => entry.similarity < 0.25);

  return {
    results,
    lowSimilarity,
    supabaseConfigured: isSupabaseConfigured()
  };
}

module.exports = {
  bootstrapCrewIdentities
};

