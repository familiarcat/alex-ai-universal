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
import { getComponentColors } from '@/lib/theme-component-colors';
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
  
  // Get comprehensive component color palette (from crew analysis)
  const componentColors = getComponentColors(globalTheme, colors);
  
  // CSS variables scoped to .dashboard-theme-wrapper
  const cssVars = `
    .dashboard-theme-wrapper {
      /* Base Colors */
      --background: ${colors.background};
      --text: ${colors.text};
      --heading: ${colors.heading};
      --accent: ${colors.accent};
      --button-text: ${componentColors.ctaPrimaryText};
      
      /* CTA Hierarchy (Quark's recommendation: action-compelling hierarchy) */
      --cta-primary: ${componentColors.ctaPrimary};
      --cta-primary-text: ${componentColors.ctaPrimaryText};
      --cta-secondary: ${componentColors.ctaSecondary};
      --cta-secondary-text: ${componentColors.ctaSecondaryText};
      --cta-tertiary: ${componentColors.ctaTertiary};
      --cta-tertiary-text: ${componentColors.ctaTertiaryText};
      
      /* Card Colors (La Forge's implementation) */
      --card-bg: ${componentColors.cardBackground};
      --card-border: ${componentColors.cardBorder};
      --card-elevated: ${componentColors.cardElevated};
      --card: ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'};
      --card-alt: ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'};
      
      /* Typography Hierarchy (Data's precision + Troi's UX) */
      --heading-primary: ${componentColors.headingPrimary};
      --heading-secondary: ${componentColors.headingSecondary};
      --heading-tertiary: ${componentColors.headingTertiary};
      --body-text: ${componentColors.bodyText};
      --text-muted: ${componentColors.bodyTextMuted};
      
      /* Interactive Elements */
      --link-color: ${componentColors.linkColor};
      --link-hover: ${componentColors.linkHover};
      --focus-ring: ${componentColors.focusRing};
      
      /* Status Colors (Theme-aware) */
      --status-success: ${componentColors.success};
      --status-warning: ${componentColors.warning};
      --status-error: ${componentColors.error};
      --status-info: ${componentColors.info};
      
      /* Legacy Support */
      --surface: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.9)'};
      --border: 1px solid ${componentColors.cardBorder};
      --subtle: ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.05)'};
      --shadow: ${isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.1)'};
      --radius: 12px;
      --blur: 10px;
      
      background: ${colors.background};
      color: ${colors.text};
      min-height: 100vh;
    }
    
    /* CTA Hierarchy Styles (Quark's action-compelling design) */
    .dashboard-theme-wrapper .cta-primary {
      background: var(--cta-primary);
      color: var(--cta-primary-text);
      font-weight: 600;
      padding: clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px);
      font-size: clamp(14px, 1.5vw, 18px);
      min-height: clamp(44px, 6vw, 56px);
      border-radius: var(--radius);
      transition: all 0.2s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
      box-shadow: 0 4px 12px ${componentColors.ctaPrimary}66;
    }
    
    .dashboard-theme-wrapper .cta-secondary {
      background: var(--cta-secondary);
      color: var(--cta-secondary-text);
      font-weight: 500;
      padding: clamp(10px, 1.5vw, 12px) clamp(20px, 3vw, 24px);
      font-size: clamp(13px, 1.3vw, 16px);
      min-height: clamp(40px, 5vw, 48px);
      border-radius: var(--radius);
      transition: all 0.2s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper .cta-tertiary {
      background: var(--cta-tertiary);
      color: var(--cta-tertiary-text);
      font-weight: 400;
      padding: clamp(8px, 1vw, 10px) clamp(16px, 2vw, 20px);
      font-size: clamp(12px, 1.2vw, 14px);
      min-height: clamp(36px, 4vw, 40px);
      border-radius: var(--radius);
      transition: all 0.2s ease;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    /* Typography with Responsive Sizing (Data's precision + Troi's UX) */
    .dashboard-theme-wrapper h1 {
      color: var(--heading-primary);
      font-size: clamp(24px, 4vw, 32px);
      line-height: 1.2;
      font-weight: 700;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper h2 {
      color: var(--heading-primary);
      font-size: clamp(20px, 3.5vw, 28px);
      line-height: 1.3;
      font-weight: 600;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper h3 {
      color: var(--heading-secondary);
      font-size: clamp(18px, 3vw, 24px);
      line-height: 1.4;
      font-weight: 600;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper h4 {
      color: var(--heading-secondary);
      font-size: clamp(16px, 2.5vw, 20px);
      line-height: 1.4;
      font-weight: 600;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper h5, .dashboard-theme-wrapper h6 {
      color: var(--heading-tertiary);
      font-size: clamp(14px, 2vw, 18px);
      line-height: 1.5;
      font-weight: 500;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper p, .dashboard-theme-wrapper span, .dashboard-theme-wrapper div {
      color: var(--body-text);
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    /* Card Components with Responsive Sizing */
    .dashboard-theme-wrapper .card {
      background: var(--card-bg);
      border: var(--card-border);
      border-radius: var(--radius);
      padding: clamp(16px, 3vw, 32px);
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 100%;
    }
    
    .dashboard-theme-wrapper .card-elevated {
      background: var(--card-elevated);
      box-shadow: var(--shadow);
    }
    
    /* Links with Theme-Aware Colors */
    .dashboard-theme-wrapper a {
      color: var(--link-color);
      transition: color 0.2s ease;
    }
    
    .dashboard-theme-wrapper a:hover {
      color: var(--link-hover);
    }
    
    .dashboard-theme-wrapper a:focus {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }
    
    /* Contrast-aware button styles (legacy support) */
    .dashboard-theme-wrapper button[style*="var(--accent)"],
    .dashboard-theme-wrapper button[style*="background: var(--accent)"],
    .dashboard-theme-wrapper button[style*="background-color: var(--accent)"] {
      color: var(--button-text) !important;
    }
  `;
  
  // Key the style tag by globalTheme to force re-render when theme changes
  return <style key={globalTheme} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: cssVars }} />;
}


