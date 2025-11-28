/**
 * 🖖 Universal MCP Credential Loader
 * 
 * Secure, efficient credential loading from ~/.zshrc
 * Works in both Node.js (CLI) and Next.js (API routes) contexts
 * 
 * Security:
 * - Never logs credentials
 * - Sanitizes errors
 * - Validates credentials before use
 * - Caches parsed credentials (memory only, never persisted)
 * 
 * Efficiency:
 * - Single parse of ~/.zshrc per process
 * - Lazy loading (only when needed)
 * - Connection pooling ready
 * 
 * Crew: Commander Data (Architecture) + Lieutenant Worf (Security) + Chief O'Brien (Efficiency)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface MCPCredentials {
  // Supabase (Local MCP)
  supabase: {
    url: string;
    anonKey: string;
    serviceKey?: string;
  };
  
  // n8n (Workflow Engine)
  n8n: {
    url: string;
    apiKey: string;
    ownerApiKey?: string;
    webhookUrl: string;
  };
  
  // OpenRouter (LLM API)
  openRouter: {
    apiKey: string;
  };
  
  // Remote MCP Server (optional)
  remoteMCP?: {
    url: string;
    apiKey: string;
  };
}

interface CredentialCache {
  credentials: MCPCredentials | null;
  loaded: boolean;
  error: Error | null;
}

// In-memory cache (never persisted, cleared on process exit)
const credentialCache: CredentialCache = {
  credentials: null,
  loaded: false,
  error: null,
};

/**
 * Parse export statements from ~/.zshrc
 * Handles quoted and unquoted values
 */
function parseZshrcExport(line: string): { key: string; value: string } | null {
  const trimmed = line.trim();
  
  // Skip comments and empty lines
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }
  
  // Match: export KEY="value" or export KEY='value' or export KEY=value
  const match = trimmed.match(/^\s*export\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.+?)\s*$/);
  if (!match) {
    return null;
  }
  
  const [, key, rawValue] = match;
  let value = rawValue.trim();
  
  // Remove quotes if present
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  
  // Remove any trailing comments
  const commentIndex = value.indexOf('#');
  if (commentIndex !== -1) {
    value = value.slice(0, commentIndex).trim();
  }
  
  return { key, value };
}

/**
 * Load credentials from ~/.zshrc
 * Cached per process (efficient, secure)
 */
function loadCredentialsFromZshrc(): MCPCredentials {
  // Return cached credentials if already loaded
  if (credentialCache.loaded && credentialCache.credentials) {
    return credentialCache.credentials;
  }
  
  // If we've already tried and failed, throw the cached error
  if (credentialCache.loaded && credentialCache.error) {
    throw credentialCache.error;
  }
  
  const zshrcPath = path.join(os.homedir(), '.zshrc');
  
  // Check if ~/.zshrc exists
  if (!fs.existsSync(zshrcPath)) {
    const error = new Error('~/.zshrc not found. Please configure MCP credentials.');
    credentialCache.loaded = true;
    credentialCache.error = error;
    throw error;
  }
  
  try {
    const contents = fs.readFileSync(zshrcPath, 'utf8');
    const lines = contents.split('\n');
    
    const env: Record<string, string> = {};
    
    // Parse all export statements
    for (const line of lines) {
      const parsed = parseZshrcExport(line);
      if (parsed) {
        // Only set if not already in process.env (process.env takes priority)
        if (!process.env[parsed.key]) {
          env[parsed.key] = parsed.value;
        }
      }
    }
    
    // Merge with process.env (process.env takes priority)
    const allEnv = { ...env, ...process.env };
    
    // Build credentials object
    const credentials: MCPCredentials = {
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
    
    // Cache credentials
    credentialCache.credentials = credentials;
    credentialCache.loaded = true;
    credentialCache.error = null;
    
    return credentials;
  } catch (error: any) {
    const safeError = new Error(`Failed to load credentials from ~/.zshrc: ${error.message}`);
    credentialCache.loaded = true;
    credentialCache.error = safeError;
    throw safeError;
  }
}

/**
 * Validate credentials (without exposing values)
 */
export function validateCredentials(credentials: MCPCredentials): {
  isValid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];
  
  // Validate Supabase
  if (!credentials.supabase.url) {
    missing.push('SUPABASE_URL');
  }
  if (!credentials.supabase.anonKey) {
    missing.push('SUPABASE_ANON_KEY');
  }
  
  // Validate n8n
  if (!credentials.n8n.apiKey) {
    missing.push('N8N_API_KEY');
  }
  
  // Validate OpenRouter
  if (!credentials.openRouter.apiKey) {
    missing.push('OPENROUTER_API_KEY');
  }
  
  // Warnings (optional but recommended)
  if (!credentials.supabase.serviceKey) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY (optional, for admin operations)');
  }
  if (!credentials.n8n.ownerApiKey) {
    warnings.push('N8N_OWNER_API_KEY (optional, for owner-level operations)');
  }
  if (!credentials.remoteMCP) {
    warnings.push('Remote MCP Server (optional, local MCP is primary)');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * Get MCP credentials (cached, secure, efficient)
 * 
 * Priority:
 * 1. Process environment variables (highest priority)
 * 2. ~/.zshrc exports
 * 3. Defaults (for URLs only)
 * 
 * @throws Error if required credentials are missing
 */
export function getMCPCredentials(): MCPCredentials {
  try {
    const credentials = loadCredentialsFromZshrc();
    const validation = validateCredentials(credentials);
    
    if (!validation.isValid) {
      throw new Error(
        `Missing required MCP credentials: ${validation.missing.join(', ')}\n` +
        `Please add them to ~/.zshrc or set as environment variables.`
      );
    }
    
    return credentials;
  } catch (error: any) {
    // Sanitize error (never expose file paths or credential values)
    throw new Error(`MCP credential loading failed: ${error.message}`);
  }
}

/**
 * Get MCP credentials with validation (safe for public use)
 * Returns null if credentials are invalid (doesn't throw)
 */
export function getMCPCredentialsSafe(): MCPCredentials | null {
  try {
    const credentials = getMCPCredentials();
    const validation = validateCredentials(credentials);
    
    if (!validation.isValid) {
      return null;
    }
    
    return credentials;
  } catch {
    return null;
  }
}

/**
 * Clear credential cache (useful for testing or credential updates)
 */
export function clearCredentialCache(): void {
  credentialCache.credentials = null;
  credentialCache.loaded = false;
  credentialCache.error = null;
}

/**
 * Get credential status (for diagnostics, never exposes values)
 */
export function getCredentialStatus(): {
  loaded: boolean;
  hasSupabase: boolean;
  hasN8n: boolean;
  hasOpenRouter: boolean;
  hasRemoteMCP: boolean;
  missing: string[];
  warnings: string[];
} {
  try {
    const credentials = getMCPCredentials();
    const validation = validateCredentials(credentials);
    
    return {
      loaded: true,
      hasSupabase: !!(credentials.supabase.url && credentials.supabase.anonKey),
      hasN8n: !!(credentials.n8n.url && credentials.n8n.apiKey),
      hasOpenRouter: !!credentials.openRouter.apiKey,
      hasRemoteMCP: !!credentials.remoteMCP,
      missing: validation.missing,
      warnings: validation.warnings,
    };
  } catch {
    return {
      loaded: false,
      hasSupabase: false,
      hasN8n: false,
      hasOpenRouter: false,
      hasRemoteMCP: false,
      missing: ['All credentials'],
      warnings: [],
    };
  }
}


