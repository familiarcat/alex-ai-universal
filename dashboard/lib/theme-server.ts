/**
 * Server-Side Theme Resolution
 * Reads theme from cookies to ensure SSR matches client hydration
 * 
 * Pattern: Universal theme system - no server/client split
 */

import { cookies } from 'next/headers';
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

/**
 * Resolves theme from cookies during SSR
 * This ensures server and client render with the same theme
 */
export async function getServerTheme(projectId?: string): Promise<UniversalTheme> {
  const cookieStore = await cookies();
  
  // Try project-specific theme first, then global theme
  const projectThemeCookie = projectId ? cookieStore.get(`project-theme-${projectId}`) : null;
  const globalThemeCookie = cookieStore.get('global-theme');
  
  // Default to mochaEarth if no cookie found
  const themeId = projectThemeCookie?.value || globalThemeCookie?.value || 'mochaEarth';
  
  const colors = getThemeColors(themeId);
  const isDark = isThemeDark(themeId);
  
  return {
    themeId,
    colors,
    isDark
  };
}

/**
 * Resolves project-specific data with theme from cookies
 * Used in project pages to ensure consistent SSR/client rendering
 */
export async function getServerProject(projectId: string) {
  const cookieStore = await cookies();
  
  // Get project data from cookie (if saved)
  const projectCookie = cookieStore.get(`project-${projectId}`);
  
  if (!projectCookie?.value) {
    return null;
  }
  
  try {
    const projectData = JSON.parse(projectCookie.value);
    const theme = await getServerTheme(projectId);
    
    return {
      ...projectData,
      theme
    };
  } catch (error) {
    console.error('Failed to parse project cookie:', error);
    return null;
  }
}

/**
 * Get theme ID from cookies (lightweight, sync-safe)
 * Used when you only need the theme ID, not full colors
 */
export function getThemeIdFromCookies(projectId?: string): string {
  try {
    // Note: This is a simplified version for server components
    // In practice, you'd use cookies() from next/headers
    return 'mochaEarth'; // Default fallback
  } catch {
    return 'mochaEarth';
  }
}

