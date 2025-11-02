/**
 * User Settings Sync - DDD Architecture
 * 
 * Client => n8n => Supabase (single source of truth for user preferences)
 * 
 * Pattern: Reuse proven project-sync patterns (O'Brien's efficiency)
 */

const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';

let saveTimer: NodeJS.Timeout | null = null;

/**
 * Debounced settings sync to Supabase via n8n
 * Prevents excessive API calls during rapid theme changes
 */
export function debouncedSettingsSync(settings: { globalTheme: string; preferences?: any }, delayMs: number = 1000) {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  
  saveTimer = setTimeout(async () => {
    try {
      console.log('⚙️ Syncing settings to Supabase via n8n...', settings.globalTheme);
      
      const response = await fetch(`${N8N_URL}/webhook/settings-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'alex-ai-dashboard'
        },
        body: JSON.stringify({
          userId: 'default', // Single-user MVP
          globalTheme: settings.globalTheme,
          preferences: settings.preferences || {}
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`n8n settings sync failed: ${response.status} ${error}`);
      }
      
      const result = await response.json();
      console.log('✅ Settings synced to Supabase:', result);
    } catch (error) {
      console.error('❌ Settings sync error (non-blocking):', error);
      // Non-blocking: localStorage still works as fallback
    }
  }, delayMs);
}

/**
 * Retrieve settings from Supabase via n8n
 * Returns settings object or null if not found
 */
export async function retrieveSettings(userId: string = 'default'): Promise<{ globalTheme: string; preferences: any } | null> {
  try {
    console.log('🔍 Retrieving settings from Supabase via n8n...');
    
    const response = await fetch(`${N8N_URL}/webhook/settings-retrieve?userId=${userId}`, {
      method: 'GET',
      headers: {
        'X-Source': 'alex-ai-dashboard-ssr',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store' // Next.js: don't cache this
    });
    
    if (!response.ok) {
      console.warn(`Settings retrieval failed: ${response.status}`);
      return null;
    }
    
    // Check for empty response
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn('Empty response from settings-retrieve');
      return null;
    }
    
    // Parse JSON safely
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('Invalid JSON from settings-retrieve:', text.substring(0, 100));
      return null;
    }
    
    console.log('✅ Settings retrieved from Supabase:', data.globalTheme);
    
    return {
      globalTheme: data.globalTheme || 'midnight',
      preferences: data.preferences || {}
    };
  } catch (error) {
    console.error('Settings retrieval error (non-blocking):', error);
    return null;
  }
}

