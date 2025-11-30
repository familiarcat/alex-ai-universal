/**
 * Content Sync: Proper DDD Flow for User Content
 * Client => Controller (MCP <-> n8n) => Supabase Database
 * 
 * ⚠️  SEPARATION OF CONCERNS:
 * - Client NEVER accesses Supabase directly
 * - ALL database operations flow through Controller
 * - Controller intelligently routes: MCP (primary) <-> n8n (fallback/extensibility)
 * 
 * Memory: Stored via Controller => Supabase RAG
 * 
 * Updated: Now uses MCP-N8N Controller for intelligent routing
 */

import { triggerN8NWorkflow } from './mcp-n8n-controller-service';

const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';

/**
 * ✅ Proper DDD: Client => Controller (MCP <-> n8n) => Supabase
 * ❌ Never: Client => Supabase (violates separation of concerns)
 */

export interface ProjectContent {
  projectId: string;
  headline: string;
  subheadline: string;
  description: string;
  theme: string;
  businessType?: string;
  components?: any[];
  pages?: Record<string, any>;
  updatedAt: number;
}

/**
 * Store user content to Supabase via Controller
 * Proper DDD: Client => Controller (MCP <-> n8n) => Supabase
 */
export async function storeProjectContent(content: ProjectContent): Promise<boolean> {
  try {
    // Use controller for intelligent routing (MCP first, n8n fallback)
    const result = await triggerN8NWorkflow('/webhook/project-content-store', {
      ...content,
      action: 'upsert',
      timestamp: new Date().toISOString(),
      source: 'alex-ai-dashboard'
    });
    
    if (!result.success) {
      console.warn('Content sync failed (non-blocking):', result.error);
      return false;
    }
    
    console.log(`✅ Content synced to Supabase via ${result.method}: ${content.projectId}`);
    return true;
  } catch (error: any) {
    console.warn('Content sync error (non-blocking):', error.message);
    return false;
  }
}

/**
 * Retrieve user content from Supabase via Controller
 * Proper DDD: Supabase => Controller (MCP <-> n8n) => Client
 */
export async function retrieveProjectContent(projectId: string): Promise<ProjectContent | null> {
  try {
    // Use controller for intelligent routing
    const result = await triggerN8NWorkflow(`/webhook/project-content-retrieve?projectId=${projectId}`, {
      projectId,
      source: 'alex-ai-dashboard'
    });
    
    if (!result.success) {
      console.warn('Content retrieval failed:', result.error);
      return null;
    }
    
    const data = result.data;
    console.log(`✅ Content retrieved from Supabase via ${result.method}: ${projectId}`);
    return data;
  } catch (error: any) {
    console.warn('Content retrieval error:', error.message);
    return null;
  }
}

/**
 * Delete project content from Supabase via Controller
 * Proper DDD: Client => Controller (MCP <-> n8n) => Supabase (delete)
 */
export async function deleteProjectContent(projectId: string): Promise<boolean> {
  try {
    // Use controller for intelligent routing
    const result = await triggerN8NWorkflow('/webhook/project-content-delete', {
      projectId,
      timestamp: new Date().toISOString(),
      source: 'alex-ai-dashboard'
    });
    
    if (!result.success) {
      console.warn('Content deletion failed (non-blocking):', result.error);
      return false;
    }
    
    console.log(`✅ Content deleted from Supabase via ${result.method}: ${projectId}`);
    return true;
  } catch (error: any) {
    console.warn('Content deletion error (non-blocking):', error.message);
    return false;
  }
}

/**
 * Debounced sync for frequent updates
 * Prevents excessive n8n calls during rapid editing
 */
let syncTimeout: NodeJS.Timeout | null = null;

export function debouncedContentSync(content: ProjectContent, delayMs: number = 2000) {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }
  
  syncTimeout = setTimeout(() => {
    storeProjectContent(content);
    syncTimeout = null;
  }, delayMs);
}

