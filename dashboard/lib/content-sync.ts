/**
 * Content Sync: Proper DDD Flow for User Content
 * Client => Next.js API (Controller) => MCP => n8n => Supabase Database
 * 
 * ⚠️  SEPARATION OF CONCERNS:
 * - Client NEVER accesses Supabase directly
 * - Client NEVER accesses n8n directly
 * - ALL database operations flow through Next.js API routes (controller layer)
 * - Controller layer handles MCP → n8n → Supabase fallback chain
 * 
 * Memory: Stored in n8n => Supabase RAG
 * 
 * Crew: Data (Architecture) + La Forge (Implementation)
 * Updated: 2025-11-27 - Fixed to use API routes instead of direct n8n calls
 */

/**
 * ✅ Proper DDD: Client => Next.js API => MCP => n8n => Supabase
 * ❌ Never: Client => Supabase (violates separation of concerns)
 * ❌ Never: Client => n8n (violates separation of concerns)
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
 * Store user content via Next.js API (DDD-compliant)
 * Proper DDD: Client => Next.js API => MCP => n8n => Supabase
 */
export async function storeProjectContent(content: ProjectContent): Promise<boolean> {
  try {
    const response = await fetch('/api/content/store', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...content,
        action: 'upsert',
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.warn('Content sync failed (non-blocking):', response.statusText);
      return false;
    }
    
    console.log(`✅ Content synced: ${content.projectId}`);
    return true;
  } catch (error) {
    console.warn('Content sync error (non-blocking):', error);
    return false;
  }
}

/**
 * Retrieve user content via Next.js API (DDD-compliant)
 * Proper DDD: Client => Next.js API => MCP => n8n => Supabase
 */
export async function retrieveProjectContent(projectId: string): Promise<ProjectContent | null> {
  try {
    const response = await fetch(`/api/content/retrieve?projectId=${projectId}`, {
      method: 'GET',
      headers: { 
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.warn('Content retrieval failed:', response.statusText);
      return null;
    }
    
    const result = await response.json();
    if (result.success && result.data) {
      console.log(`✅ Content retrieved: ${projectId}`);
      return result.data;
    }
    
    return null;
  } catch (error) {
    console.warn('Content retrieval error:', error);
    return null;
  }
}

/**
 * Delete project content via Next.js API (DDD-compliant)
 * Proper DDD: Client => Next.js API => MCP => n8n => Supabase
 */
export async function deleteProjectContent(projectId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/content/delete', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId,
        timestamp: new Date().toISOString()
      })
    });
    
    if (!response.ok) {
      console.warn('Content deletion failed (non-blocking):', response.statusText);
      return false;
    }
    
    console.log(`✅ Content deleted: ${projectId}`);
    return true;
  } catch (error) {
    console.warn('Content deletion error (non-blocking):', error);
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

