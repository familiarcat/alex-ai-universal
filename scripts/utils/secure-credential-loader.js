/**
 * 🖖 Secure Credential Loader
 * 
 * Unified, secure credential loading system for Alex AI scripts.
 * Automatically loads credentials from ~/.zshrc with security best practices.
 * 
 * Security Features:
 * - Never logs secrets
 * - Prioritizes process.env (most secure)
 * - Falls back to ~/.zshrc for local development
 * - Handles errors gracefully
 * - Supports all credential types
 * 
 * Usage:
 *   const { loadCredentials, getCredential } = require('./utils/secure-credential-loader');
 *   
 *   // Load all credentials
 *   const creds = loadCredentials();
 *   
 *   // Or get specific credential
 *   const apiKey = getCredential('OPENROUTER_API_KEY');
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

// Cache for parsed zshrc to avoid repeated file reads
let zshrcCache = null;
let zshrcCacheTimestamp = null;
const CACHE_TTL = 60000; // 1 minute cache

/**
 * Parse ~/.zshrc and extract environment variables
 * Supports multiple formats:
 * - export KEY="value"
 * - export KEY='value'
 * - export KEY=value
 * - export KEY=$OTHER_VAR
 */
function parseZshrc(content) {
  const secrets = {};
  
  // Pattern 1: export KEY="value" or export KEY='value'
  const quotedPattern = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*["']([^"']*)["']\s*$/gm;
  let match;
  while ((match = quotedPattern.exec(content)) !== null) {
    const [, key, value] = match;
    secrets[key] = value.trim();
  }
  
  // Pattern 2: export KEY=value (unquoted, no spaces)
  const unquotedPattern = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^\s#\n]+)\s*$/gm;
  while ((match = unquotedPattern.exec(content)) !== null) {
    const [, key, value] = match;
    // Skip if already found (quoted takes precedence)
    if (!secrets[key]) {
      secrets[key] = value.trim();
    }
  }
  
  // Pattern 3: export KEY=value (with spaces, unquoted - less common)
  const spacedPattern = /^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)(?:\s*#|\s*$)/gm;
  while ((match = spacedPattern.exec(content)) !== null) {
    const [, key, value] = match;
    // Only use if not already found and value doesn't contain special chars
    if (!secrets[key] && !value.includes('$') && !value.includes('`')) {
      secrets[key] = value.trim();
    }
  }
  
  return secrets;
}

/**
 * Load credentials from ~/.zshrc with caching
 */
function loadFromZshrc() {
  const now = Date.now();
  
  // Return cached if still valid
  if (zshrcCache && zshrcCacheTimestamp && (now - zshrcCacheTimestamp) < CACHE_TTL) {
    return zshrcCache;
  }
  
  const zshrcPath = path.join(os.homedir(), '.zshrc');
  
  if (!fs.existsSync(zshrcPath)) {
    zshrcCache = {};
    zshrcCacheTimestamp = now;
    return zshrcCache;
  }
  
  try {
    const content = fs.readFileSync(zshrcPath, 'utf8');
    zshrcCache = parseZshrc(content);
    zshrcCacheTimestamp = now;
    return zshrcCache;
  } catch (error) {
    // Silently fail - don't expose file system errors
    zshrcCache = {};
    zshrcCacheTimestamp = now;
    return zshrcCache;
  }
}

/**
 * Get a specific credential
 * Priority: process.env > ~/.zshrc
 * 
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Optional default value
 * @returns {string|undefined} - The credential value or undefined
 */
function getCredential(key, defaultValue = undefined) {
  // First check process.env (highest priority, most secure)
  if (process.env[key]) {
    return process.env[key];
  }
  
  // Fall back to ~/.zshrc
  const zshrcCreds = loadFromZshrc();
  if (zshrcCreds[key]) {
    // Also populate process.env for downstream libraries
    process.env[key] = zshrcCreds[key];
    return zshrcCreds[key];
  }
  
  return defaultValue;
}

/**
 * Load multiple credentials at once
 * 
 * @param {string[]} keys - Array of credential keys to load
 * @returns {Object} - Object with credential keys and values
 */
function loadCredentials(keys = []) {
  const credentials = {};
  const zshrcCreds = loadFromZshrc();
  
  // If no keys specified, load common Alex AI credentials
  const keysToLoad = keys.length > 0 ? keys : [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'OPENROUTER_API_KEY',
    'N8N_API_KEY',
    'N8N_OWNER_API_KEY',
    'N8N_BASE_URL',
    'N8N_URL',
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
  ];
  
  keysToLoad.forEach(key => {
    const value = getCredential(key);
    if (value) {
      credentials[key] = value;
    }
  });
  
  return credentials;
}

/**
 * Load Supabase credentials specifically
 * 
 * @returns {Object} - { url, serviceKey, anonKey }
 */
function loadSupabaseCredentials() {
  return {
    url: getCredential('SUPABASE_URL'),
    serviceKey: getCredential('SUPABASE_SERVICE_ROLE_KEY') || getCredential('SUPABASE_SERVICE_KEY'),
    anonKey: getCredential('SUPABASE_ANON_KEY'),
  };
}

/**
 * Load OpenRouter credentials specifically
 * 
 * @returns {string|undefined} - OpenRouter API key
 */
function loadOpenRouterCredentials() {
  return getCredential('OPENROUTER_API_KEY');
}

/**
 * Load n8n credentials specifically
 * 
 * @returns {Object} - { baseUrl, apiKey, ownerApiKey }
 */
function loadN8NCredentials() {
  return {
    baseUrl: getCredential('N8N_BASE_URL') || getCredential('N8N_URL') || 'https://n8n.pbradygeorgen.com',
    apiKey: getCredential('N8N_API_KEY'),
    ownerApiKey: getCredential('N8N_OWNER_API_KEY'),
  };
}

/**
 * Verify credentials are available (without exposing values)
 * 
 * @param {string[]} requiredKeys - Keys that must be present
 * @returns {Object} - { valid: boolean, missing: string[] }
 */
function verifyCredentials(requiredKeys) {
  const missing = [];
  
  requiredKeys.forEach(key => {
    if (!getCredential(key)) {
      missing.push(key);
    }
  });
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

module.exports = {
  getCredential,
  loadCredentials,
  loadSupabaseCredentials,
  loadOpenRouterCredentials,
  loadN8NCredentials,
  verifyCredentials,
  // Expose for testing/debugging (use carefully)
  _parseZshrc: parseZshrc,
  _clearCache: () => {
    zshrcCache = null;
    zshrcCacheTimestamp = null;
  },
};

