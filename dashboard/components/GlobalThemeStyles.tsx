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
 * 
 * FIXED: Theme persistence - now properly updates when globalTheme changes
 * FIXED: Contrast-aware button text colors - ensures WCAG AA compliance
 */

import { useAppState } from '@/lib/state-manager';
import { getThemeColors, isThemeDark } from '@/lib/theme-colors';
import { getButtonTextColor, extractColor } from '@/lib/contrast-utils';
import { useEffect, useState } from 'react';

export default function GlobalThemeStyles() {
  const { globalTheme } = useAppState();
  const [mounted, setMounted] = useState(false);
  
  // Ensure we're mounted before applying theme (prevents hydration mismatch)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Don't render styles until mounted (prevents server/client mismatch)
  if (!mounted) {
    return null;
  }
  
  const colors = getThemeColors(globalTheme);
  const isDark = isThemeDark(globalTheme);
  
  // Calculate contrast-aware button text color
  const accentColor = extractColor(colors.accent);
  const buttonTextColor = accentColor ? getButtonTextColor(colors.accent, 3.0) : '#000000';
  
  // CSS variables scoped to .dashboard-theme-wrapper
  const cssVars = `
    .dashboard-theme-wrapper {
      --background: ${colors.background};
      --text: ${colors.text};
      --heading: ${colors.heading};
      --accent: ${colors.accent};
      --button-text: ${buttonTextColor};
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
    
    /* Contrast-aware button styles */
    .dashboard-theme-wrapper button[style*="var(--accent)"],
    .dashboard-theme-wrapper button[style*="background: var(--accent)"],
    .dashboard-theme-wrapper button[style*="background-color: var(--accent)"] {
      color: var(--button-text) !important;
    }
  `;
  
  // Key the style tag by globalTheme to force re-render when theme changes
  return <style key={globalTheme} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: cssVars }} />;
}


