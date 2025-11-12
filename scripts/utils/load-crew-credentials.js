/**
 * Shared credential loader for crew automation.
 *
 * Priorities:
 * 1. Owner-level API key (N8N_OWNER_API_KEY)
 * 2. Service-level API key (N8N_API_KEY)
 * 3. Optional login credentials (N8N_EMAIL / N8N_PASSWORD) for future session cookies
 *
 * Also exposes Supabase credentials so callers can inject RAG context.
 */
'use strict';

const path = require('path');

try {
  require('dotenv').config({ path: path.join(process.cwd(), '.env') });
} catch (_) {
  // dotenv is optional; ignore if not installed
}

function normalize(value) {
  if (!value) return undefined;
  const trimmed = value.toString().trim();
  return trimmed.length === 0 ? undefined : trimmed;
}

function loadCrewCredentials() {
  const baseUrl = normalize(process.env.N8N_URL) || 'https://n8n.pbradygeorgen.com';
  const ownerApiKey = normalize(process.env.N8N_OWNER_API_KEY);
  const serviceApiKey = normalize(process.env.N8N_API_KEY);
  const email = normalize(process.env.N8N_EMAIL);
  const password = normalize(process.env.N8N_PASSWORD);
  const supabaseUrl = normalize(process.env.SUPABASE_URL);
  const supabaseKey =
    normalize(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    normalize(process.env.SUPABASE_ANON_KEY);

  return {
    n8n: {
      baseUrl: baseUrl.replace(/\/$/, ''),
      ownerApiKey,
      serviceApiKey,
      apiKey: ownerApiKey || serviceApiKey,
      email,
      password,
    },
    supabase: {
      url: supabaseUrl,
      key: supabaseKey,
      serviceKey: supabaseKey,
    },
  };
}

module.exports = {
  loadCrewCredentials,
};

