/**
 * 🖖 Universal MCP Access - Public API
 * 
 * Single entry point for all MCP operations
 * 
 * Usage:
 * ```typescript
 * import { mcp } from '@/lib/mcp';
 * 
 * // Get credentials
 * const creds = mcp.getCredentials();
 * 
 * // Access Supabase
 * const supabase = mcp.supabase();
 * 
 * // Trigger n8n webhook
 * await mcp.n8n.webhook('path', { data });
 * 
 * // Call OpenRouter
 * await mcp.openRouter.call('/models', { method: 'GET' });
 * ```
 */

export {
  getMCPCredentials,
  getMCPCredentialsSafe,
  validateCredentials,
  getCredentialStatus,
  clearCredentialCache,
  type MCPCredentials,
} from './universal-credential-loader';

export {
  getSupabaseClient,
  getN8nClient,
  triggerN8nWebhook,
  callOpenRouter,
  callRemoteMCP,
  checkMCPHealth,
  clearConnectionPools,
} from './universal-client';

/**
 * Convenience wrapper for common operations
 */
export const mcp = {
  // Credentials
  getCredentials: () => require('./universal-credential-loader').getMCPCredentials(),
  getCredentialsSafe: () => require('./universal-credential-loader').getMCPCredentialsSafe(),
  getStatus: () => require('./universal-credential-loader').getCredentialStatus(),
  
  // Supabase (Local MCP)
  supabase: () => require('./universal-client').getSupabaseClient(),
  
  // n8n
  n8n: {
    client: () => require('./universal-client').getN8nClient(),
    webhook: (path: string, payload: any) => 
      require('./universal-client').triggerN8nWebhook(path, payload),
  },
  
  // OpenRouter
  openRouter: {
    call: (endpoint: string, options?: any) =>
      require('./universal-client').callOpenRouter(endpoint, options),
  },
  
  // Remote MCP (optional)
  remote: {
    call: (endpoint: string, options?: any) =>
      require('./universal-client').callRemoteMCP(endpoint, options),
  },
  
  // Health checks
  health: () => require('./universal-client').checkMCPHealth(),
};


