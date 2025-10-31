/**
 * Content Sync: Proper DDD Flow for User Content
 * Client => n8n Controller => Supabase Database
 * 
 * ⚠️  SEPARATION OF CONCERNS:
 * - Client NEVER accesses Supabase directly
 * - ALL database operations flow through n8n
 * - n8n is the single controller for data access
 * 
 * Memory: Stored in n8n => Supabase RAG
 */

const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';

/**
 * ✅ Proper DDD: Client => n8n => Supabase
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
 * Store user content to Supabase via n8n
 * Proper DDD: Client => n8n => Supabase
 */
export async function storeProjectContent(content: ProjectContent): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_URL}/webhook/project-content-store`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Source': 'alex-ai-dashboard'
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
    
    console.log(`✅ Content synced to Supabase via n8n: ${content.projectId}`);
    return true;
  } catch (error) {
    console.warn('Content sync error (non-blocking):', error);
    return false;
  }
}

/**
 * Retrieve user content from Supabase via n8n
 * Proper DDD: Supabase => n8n => Client
 */
export async function retrieveProjectContent(projectId: string): Promise<ProjectContent | null> {
  try {
    const response = await fetch(`${N8N_URL}/webhook/project-content-retrieve?projectId=${projectId}`, {
      method: 'GET',
      headers: { 
        'X-Source': 'alex-ai-dashboard'
      }
    });
    
    if (!response.ok) {
      console.warn('Content retrieval failed:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    console.log(`✅ Content retrieved from Supabase via n8n: ${projectId}`);
    return data;
  } catch (error) {
    console.warn('Content retrieval error:', error);
    return null;
  }
}

/**
 * Delete project content from Supabase via n8n
 * Proper DDD: Client => n8n => Supabase (delete)
 */
export async function deleteProjectContent(projectId: string): Promise<boolean> {
  try {
    const response = await fetch(`${N8N_URL}/webhook/project-content-delete`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Source': 'alex-ai-dashboard'
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
    
    console.log(`✅ Content deleted from Supabase via n8n: ${projectId}`);
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

