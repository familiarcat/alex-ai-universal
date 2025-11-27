#!/usr/bin/env node

/**
 * 🖖 Universal MCP CLI Utilities
 * 
 * Node.js CLI utilities for MCP access (scripts, automation)
 * Uses same credential loading as Next.js API routes
 * 
 * Usage:
 * ```javascript
 * const { getMCPCredentials, mcp } = require('./scripts/lib/mcp-cli-utils');
 * 
 * const creds = getMCPCredentials();
 * const supabase = mcp.supabase();
 * await mcp.n8n.webhook('path', { data });
 * ```
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Load credentials from ~/.zshrc (same logic as TypeScript version)
 */
function loadCredentialsFromZshrc() {
  const zshrcPath = path.join(os.homedir(), '.zshrc');
  
  if (!fs.existsSync(zshrcPath)) {
    throw new Error('~/.zshrc not found. Please configure MCP credentials.');
  }
  
  const contents = fs.readFileSync(zshrcPath, 'utf8');
  const lines = contents.split('\n');
  
  const env = {};
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/);
    if (!match) continue;
    
    const [, key, rawValue] = match;
    let value = rawValue.trim();
    
    // Remove quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    
    // Remove trailing comments
    const commentIndex = value.indexOf('#');
    if (commentIndex !== -1) {
      value = value.slice(0, commentIndex).trim();
    }
    
    if (!process.env[key]) {
      env[key] = value;
    }
  }
  
  // Merge with process.env (process.env takes priority)
  const allEnv = { ...env, ...process.env };
  
  return {
    supabase: {
      url: allEnv.SUPABASE_URL || allEnv.NEXT_PUBLIC_SUPABASE_URL || '',
      anonKey: allEnv.SUPABASE_ANON_KEY || allEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      serviceKey: allEnv.SUPABASE_SERVICE_ROLE_KEY || allEnv.SUPABASE_SERVICE_KEY || undefined,
    },
    n8n: {
      url: (allEnv.N8N_URL || allEnv.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com').replace(/\/$/, ''),
      apiKey: allEnv.N8N_API_KEY || allEnv.N8N_API_TOKEN || '',
      ownerApiKey: allEnv.N8N_OWNER_API_KEY || undefined,
      webhookUrl: (allEnv.N8N_WEBHOOK_URL || `${allEnv.N8N_URL || 'https://n8n.pbradygeorgen.com'}/webhook`).replace(/\/$/, ''),
    },
    openRouter: {
      apiKey: allEnv.OPENROUTER_API_KEY || '',
    },
    remoteMCP: allEnv.MCP_URL && allEnv.MCP_API_KEY ? {
      url: allEnv.MCP_URL.replace(/\/$/, ''),
      apiKey: allEnv.MCP_API_KEY,
    } : undefined,
  };
}

/**
 * Get MCP credentials (cached per process)
 */
let cachedCredentials = null;
function getMCPCredentials() {
  if (cachedCredentials) {
    return cachedCredentials;
  }
  
  cachedCredentials = loadCredentialsFromZshrc();
  
  // Validate required credentials
  const missing = [];
  if (!cachedCredentials.supabase.url) missing.push('SUPABASE_URL');
  if (!cachedCredentials.supabase.anonKey) missing.push('SUPABASE_ANON_KEY');
  if (!cachedCredentials.n8n.apiKey) missing.push('N8N_API_KEY');
  if (!cachedCredentials.openRouter.apiKey) missing.push('OPENROUTER_API_KEY');
  
  if (missing.length > 0) {
    throw new Error(`Missing required MCP credentials: ${missing.join(', ')}`);
  }
  
  return cachedCredentials;
}

/**
 * Get Supabase client (connection pooling)
 */
let supabaseClient = null;
function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient;
  }
  
  const creds = getMCPCredentials();
  const { createClient } = require('@supabase/supabase-js');
  
  supabaseClient = createClient(creds.supabase.url, creds.supabase.anonKey, {
    auth: {
      persistSession: false,
    },
  });
  
  return supabaseClient;
}

/**
 * Get n8n HTTP client (connection pooling)
 */
let n8nClient = null;
function getN8nClient() {
  if (n8nClient) {
    return n8nClient;
  }
  
  const creds = getMCPCredentials();
  const axios = require('axios');
  
  n8nClient = axios.create({
    baseURL: `${creds.n8n.url}/api/v1`,
    headers: {
      'Authorization': `Bearer ${creds.n8n.apiKey}`,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
  
  return n8nClient;
}

/**
 * Trigger n8n webhook
 */
async function triggerN8nWebhook(path, payload) {
  const creds = getMCPCredentials();
  const axios = require('axios');
  
  const url = `${creds.n8n.webhookUrl}/${path.replace(/^\//, '')}`;
  
  const response = await axios.post(url, payload || {}, {
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return response.data;
}

/**
 * Call OpenRouter API
 */
async function callOpenRouter(endpoint, options = {}) {
  const creds = getMCPCredentials();
  const axios = require('axios');
  
  const url = `https://openrouter.ai/api/v1${endpoint}`;
  
  const response = await axios({
    method: options.method || 'GET',
    url,
    data: options.body,
    headers: {
      'Authorization': `Bearer ${creds.openRouter.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    timeout: 30000,
  });
  
  return response.data;
}

/**
 * Convenience wrapper
 */
const mcp = {
  getCredentials: getMCPCredentials,
  supabase: getSupabaseClient,
  n8n: {
    client: getN8nClient,
    webhook: triggerN8nWebhook,
  },
  openRouter: {
    call: callOpenRouter,
  },
};

module.exports = {
  getMCPCredentials,
  getSupabaseClient,
  getN8nClient,
  triggerN8nWebhook,
  callOpenRouter,
  mcp,
};

