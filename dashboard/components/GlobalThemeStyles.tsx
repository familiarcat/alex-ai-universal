'use client';

/**
 * Global Theme Styles - Dashboard Theme Only
 * 
 * TWO-LAYER THEME SYSTEM:
 * 1. Dashboard theme (globalTheme) - controls dashboard UI
 * 2. Project themes (project.theme) - controls project pages (in iframes)
 * 
 * This component ONLY affects the dashboard, NOT project iframes!
 * 
 * Crew Decision: 7/7 unanimous - maintain theme isolation
 */

import { useAppState } from '@/lib/state-manager';
import { getThemeColors, isThemeDark } from '@/lib/theme-colors';

export default function GlobalThemeStyles() {
  const { globalTheme } = useAppState();
  
  // Don't use useEffect - render inline style tag for dashboard
  // This ensures theme is applied immediately without flash
  
  const colors = getThemeColors(globalTheme);
  const isDark = isThemeDark(globalTheme);
  
  // CSS variables scoped to .dashboard-theme-wrapper
  const cssVars = `
    .dashboard-theme-wrapper {
      --background: ${colors.background};
      --text: ${colors.text};
      --heading: ${colors.heading};
      --accent: ${colors.accent};
      --text-muted: ${isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
      --card: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'};
      --card-alt: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'};
      --surface: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)'};
      --border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
      --subtle: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)'};
      --shadow: ${isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)'};
      --radius: 12px;
      --blur: 10px;
      background: ${colors.background};
      color: ${colors.text};
      min-height: 100vh;
    }
  `;
  
  // suppressHydrationWarning: Server renders with default theme, client hydrates with localStorage theme
  // This is intentional - we allow server/client mismatch for theme styles
  return <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: cssVars }} />;
}


