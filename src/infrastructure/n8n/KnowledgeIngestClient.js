'use strict';

const axios = require('axios');

const KNOWLEDGE_INGEST_URL = process.env.N8N_KNOWLEDGE_INGEST_URL ||
  'https://n8n.pbradygeorgen.com/webhook/knowledge-ingest';

function hasIngestCredentials() {
  return Boolean(process.env.N8N_EMAIL && process.env.N8N_PASSWORD);
}

async function ingestCrewIdentity(crew, snippet, options = {}) {
  const { sourceUrl } = options;
  if (!snippet) {
    return { success: false, warning: `No snippet available for ${crew.name}; skipping ingest` };
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
        source_url: sourceUrl || null
      }
    };

    const config = {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000
    };

    if (hasIngestCredentials()) {
      config.auth = {
        username: process.env.N8N_EMAIL,
        password: process.env.N8N_PASSWORD
      };
    }

    await axios.post(KNOWLEDGE_INGEST_URL, payload, config);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      warning: `Ingest failed for ${crew.name}: ${error.message}`
    };
  }
}

module.exports = {
  ingestCrewIdentity
};

