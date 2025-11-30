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

function isSupabaseConfigured() {
  return readSupabaseConfig().available;
}

async function fetchLatestCrewMemory(crewKey) {
  const config = readSupabaseConfig();

  if (!config.available) {
    return {
      memory: null,
      warning: 'Supabase credentials not supplied; skipping comparison'
    };
  }

  try {
    const response = await axios.get(`${config.url}/rest/v1/crew_memories`, {
      params: {
        crew_member: `eq.${crewKey}`,
        select: 'id,crew_member,content,timestamp,importance,mission_id,created_at',
        order: 'created_at.desc',
        limit: 1
      },
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        Accept: 'application/json',
        Prefer: 'return=representation'
      },
      timeout: 15000
    });

    return {
      memory: response.data?.[0] || null
    };
  } catch (error) {
    const detail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
    return {
      memory: null,
      warning: `Supabase request failed: ${detail}`
    };
  }
}

module.exports = {
  fetchLatestCrewMemory,
  isSupabaseConfigured
};

