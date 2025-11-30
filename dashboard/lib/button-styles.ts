/**
 * Global Button Styles Utility
 * 
 * Provides contrast-aware button styling that works across all themes
 * Ensures WCAG AA compliance for button text
 */

import { getButtonTextColor, extractColor } from './contrast-utils';
import { getThemeColors } from './theme-colors';

/**
 * Get button styles that ensure proper contrast
 */
export function getButtonStyles(variant: 'primary' | 'secondary' | 'accent' = 'primary', themeId?: string) {
  const baseStyles: React.CSSProperties = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s ease',
  };
  
  if (variant === 'primary' || variant === 'accent') {
    baseStyles.background = 'var(--accent)';
    baseStyles.color = 'var(--button-text)'; // Use CSS variable set by GlobalThemeStyles
  } else {
    baseStyles.background = 'var(--card-alt)';
    baseStyles.color = 'var(--text)';
    baseStyles.border = 'var(--border)';
  }
  
  return baseStyles;
}

/**
 * Calculate button text color for a specific theme
 * Used for server-side rendering or static generation
 */
export function calculateButtonTextColor(themeId: string): string {
  const colors = getThemeColors(themeId);
  return getButtonTextColor(colors.accent, 3.0);
}

