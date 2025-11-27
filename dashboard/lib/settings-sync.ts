/**
 * User Settings Sync - DDD Architecture with Proper Controller Layer
 * 
 * FIXED: Now uses Next.js API routes (proper DDD architecture)
 * 
 * Flow: Client => Next.js API => Supabase (Live) => Supabase
 * Fallback: Client => Next.js API => n8n Webhook => Supabase
 * 
 * Architecture: 
 *   PRIMARY: Supabase direct (Live instance) via Next.js API route
 *   FALLBACK: n8n Webhook (if Supabase unavailable)
 * 
 * Crew: Data (Architecture) + La Forge (Implementation) + O'Brien (Pragmatic)
 * Updated: 2025-11-27 - Fixed to use Next.js API routes instead of direct n8n calls
 */

let saveTimer: NodeJS.Timeout | null = null;

// REMOVED: syncSettingsFallback - Now handled by Next.js API route

/**
 * Debounced settings sync via Next.js API (DDD-compliant)
 * Prevents excessive API calls during rapid theme changes
 * 
 * FIXED: Now uses Next.js API route instead of direct n8n calls
 */
export function debouncedSettingsSync(settings: { globalTheme: string; preferences?: any }, delayMs: number = 1000) {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  
  saveTimer = setTimeout(async () => {
    // Use Next.js API route (proper DDD architecture)
    try {
      const response = await fetch('/api/settings/store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: 'default',
          globalTheme: settings.globalTheme,
          preferences: settings.preferences || {}
        })
      });
      
      if (!response.ok) {
        throw new Error(`Settings API returned ${response.status}`);
      }
      
      // Success - no console log to reduce noise
      return;
    } catch (error) {
      // Non-blocking: localStorage still works regardless
      // Error is handled silently to prevent console spam
    }
  }, delayMs);
}

// REMOVED: retrieveSettingsFallback - Now handled by Next.js API route

/**
 * Retrieve settings via Next.js API (DDD-compliant)
 * Returns settings object or null if not found
 * 
 * FIXED: Now uses Next.js API route instead of direct n8n calls
 */
export async function retrieveSettings(userId: string = 'default'): Promise<{ globalTheme: string; preferences: any; source?: string } | null> {
  try {
    const response = await fetch(`/api/settings/retrieve?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Settings API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      // Only return theme if it's explicitly set (not null/default)
      // This allows localStorage to be the source of truth if Supabase has no saved theme
      if (data.globalTheme !== null && data.globalTheme !== undefined) {
        return {
          globalTheme: data.globalTheme,
          preferences: data.preferences || {},
          source: data.source // Include source to distinguish saved vs default
        };
      }
      // If globalTheme is null, return null to indicate no saved settings
      return null;
    }
    
    return null;
  } catch (error) {
    // Silent fallback - return null if API unavailable
    return null;
  }
}

