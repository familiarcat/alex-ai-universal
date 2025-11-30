/**
 * Server-Side Theme Resolution via Supabase
 * Proper DDD: Server => n8n => Supabase (not cookies!)
 * 
 * Pattern: Supabase is the single source of truth
 */

import { getThemeColors, isThemeDark } from './theme-colors';

export interface UniversalTheme {
  themeId: string;
  colors: {
    background: string;
    text: string;
    heading: string;
    accent: string;
  };
  isDark: boolean;
}

const N8N_URL = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';

/**
 * Fetch project content from Supabase via n8n (SSR-safe)
 * Proper DDD: Server => n8n => Supabase
 */
export async function getServerProject(projectId: string): Promise<{ theme: UniversalTheme; content: any } | null> {
  try {
    const response = await fetch(`${N8N_URL}/webhook/project-content-retrieve?projectId=${projectId}`, {
      method: 'GET',
      headers: { 
        'X-Source': 'alex-ai-dashboard-ssr',
        'Cache-Control': 'no-cache' // Always get fresh data
      },
      cache: 'no-store' // Next.js: don't cache this
    });
    
    if (!response.ok) {
      console.warn(`[SSR] Project ${projectId} not found in Supabase (${response.status})`);
      return null;
    }
    
    // Check if response has content before parsing
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.warn(`[SSR] Empty response for project ${projectId} - falling back to localStorage`);
      return null;
    }
    
    // Parse JSON safely
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error(`[SSR] Invalid JSON for project ${projectId}:`, text.substring(0, 100));
      return null;
    }
    
    const themeId = data.theme || 'mochaEarth';
    
    return {
      theme: {
        themeId,
        colors: getThemeColors(themeId),
        isDark: isThemeDark(themeId)
      },
      content: data
    };
  } catch (error) {
    console.error(`[SSR] Failed to fetch project ${projectId}:`, error);
    return null;
  }
}

/**
 * Get default theme for new projects or fallback
 */
export function getDefaultTheme(): UniversalTheme {
  const themeId = 'mochaEarth';
  return {
    themeId,
    colors: getThemeColors(themeId),
    isDark: isThemeDark(themeId)
  };
}

