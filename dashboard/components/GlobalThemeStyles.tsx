'use client';

import { useEffect } from 'react';
import { useAppState } from '@/lib/state-manager';
import { getThemeColors, isThemeDark } from '@/lib/theme-colors';

export default function GlobalThemeStyles() {
  const { globalTheme } = useAppState();
  
  useEffect(() => {
    // Use the proper theme system that matches theme-definitions.js
    const colors = getThemeColors(globalTheme);
    const isDark = isThemeDark(globalTheme);
    const r = document.documentElement.style;
    
    // Set all CSS variables that the dashboard uses
    r.setProperty('--background', colors.background);
    r.setProperty('--text', colors.text);
    r.setProperty('--heading', colors.heading);
    r.setProperty('--accent', colors.accent);
    r.setProperty('--text-muted', isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)');
    r.setProperty('--card', isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)');
    r.setProperty('--card-alt', isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)');
    r.setProperty('--surface', isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)');
    r.setProperty('--border', isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)');
    r.setProperty('--subtle', isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)');
    r.setProperty('--shadow', isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)');
    r.setProperty('--radius', '12px');
    r.setProperty('--blur', '10px');
    
    // Set body background to match theme
    document.body.style.background = colors.background;
    document.body.style.color = colors.text;
  }, [globalTheme]);
  
  return null;
}


