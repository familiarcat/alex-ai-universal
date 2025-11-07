'use strict';

const axios = require('axios');

function readSupabaseConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || url === 'undefined' || key === 'undefined') {
    return { available: false };
  }

  return {
    available: true,
    url,
    key
  };
}

async function storeIdentitySnapshot(crew, snippet, options = {}) {
  const config = readSupabaseConfig();

  if (!config.available) {
    return {
      success: false,
      warning: 'Supabase credentials not supplied; cannot store identity snapshot'
    };
  }

  if (!snippet) {
    return {
      success: false,
      warning: `No snippet for ${crew.name}; skipping Supabase insert`
    };
  }

  const now = new Date().toISOString();
  const sessionId = `crew-identity-${crew.crewKey}-${now}`;

  const payload = {
    session_id: sessionId,
    category: 'crew_identity_bootstrap',
    title: `${crew.name} identity snapshot`,
    crew_members: [crew.name],
    tags: ['crew-identity', crew.crewKey, 'memory-alpha-bootstrap'],
    content: {
      crewMember: crew.name,
      crewKey: crew.crewKey,
      source: options.sourceUrl || null,
      snippet,
      captured_at: now
    }
  };

  try {
    await axios.post(`${config.url}/rest/v1/knowledge_base`, payload, {
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      timeout: 15000
    });

    return { success: true };
  } catch (error) {
    const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    return {
      success: false,
      warning: `Supabase insert failed for ${crew.name}: ${detail}`
    };
  }
}

module.exports = {
  storeIdentitySnapshot
};

