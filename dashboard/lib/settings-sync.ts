/**
 * User Settings Sync - DDD Architecture with Intelligent Fallback
 * 
 * Preferred: Client => n8n => Supabase (when n8n webhooks available)
 * Fallback: Client => Supabase direct API (when n8n webhooks unavailable)
 * 
 * Pattern: Same intelligent fallback as RAG system (O'Brien's pragmatism)
 */

const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpkkkbufdwxmjaerbhbn.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let saveTimer: NodeJS.Timeout | null = null;

/**
 * Sync settings directly to Supabase (fallback)
 */
async function syncSettingsFallback(settings: { globalTheme: string; preferences?: any }, userId: string = 'default'): Promise<boolean> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return false;
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_settings`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        user_id: userId,
        global_theme: settings.globalTheme,
        preferences: settings.preferences || {}
      })
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Debounced settings sync to Supabase via n8n (with fallback)
 * Prevents excessive API calls during rapid theme changes
 */
export function debouncedSettingsSync(settings: { globalTheme: string; preferences?: any }, delayMs: number = 1000) {
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  
  saveTimer = setTimeout(async () => {
    // Try n8n first (preferred DDD architecture)
    try {
      const response = await fetch(`${N8N_URL}/webhook/settings-store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'alex-ai-dashboard'
        },
        body: JSON.stringify({
          userId: 'default',
          globalTheme: settings.globalTheme,
          preferences: settings.preferences || {}
        })
      });
      
      if (!response.ok) {
        throw new Error(`n8n returned ${response.status}`);
      }
      
      // Success via n8n - no console log to reduce noise
      return;
    } catch (error) {
      // Fallback to direct Supabase API (silent)
      await syncSettingsFallback(settings);
      // Non-blocking: localStorage still works regardless
    }
  }, delayMs);
}

/**
 * Retrieve settings directly from Supabase (fallback)
 * Silent mode - no console errors (table might not exist yet)
 */
async function retrieveSettingsFallback(userId: string = 'default'): Promise<{ globalTheme: string; preferences: any } | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null; // Silent - credentials not configured
  }

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_settings?user_id=eq.${userId}&select=global_theme,preferences`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null; // Silent - table might not exist or RLS blocking
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return null; // Silent - no settings found
    }

    return {
      globalTheme: data[0].global_theme || 'midnight',
      preferences: data[0].preferences || {}
    };
  } catch (error) {
    return null; // Silent - network error or table doesn't exist
  }
}

/**
 * Retrieve settings from Supabase via n8n (with fallback)
 * Returns settings object or null if not found
 */
export async function retrieveSettings(userId: string = 'default'): Promise<{ globalTheme: string; preferences: any } | null> {
  // Try n8n first (preferred DDD architecture)
  try {
    const response = await fetch(`${N8N_URL}/webhook/settings-retrieve?userId=${userId}`, {
      method: 'GET',
      headers: {
        'X-Source': 'alex-ai-dashboard-ssr',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`n8n returned ${response.status}`);
    }
    
    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('Empty response');
    }
    
    const data = JSON.parse(text);
    console.log('✅ Settings retrieved via n8n:', data.globalTheme);
    
    return {
      globalTheme: data.globalTheme || 'midnight',
      preferences: data.preferences || {}
    };
  } catch (error) {
    // Fallback to direct Supabase API (silent - no console spam)
    return await retrieveSettingsFallback(userId);
  }
}

