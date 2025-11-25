/**
 * Theme Component Colors - Rich Color Theory System
 * 
 * Extends base theme colors with component-specific palettes that:
 * - Compel user action through strategic color hierarchy
 * - Maintain accessibility (WCAG AA/AAA)
 * - Embody theme concepts through RAG understanding
 * - Integrate crew persona insights
 * - Handle CTA prominence and text sizing
 * 
 * Generated from Observation Lounge crew analysis
 */

import { getContrastRatio, extractColor, getButtonTextColor } from './contrast-utils';

export interface ComponentColorPalette {
  // CTA Colors (Call-to-Action hierarchy)
  ctaPrimary: string;
  ctaPrimaryText: string;
  ctaSecondary: string;
  ctaSecondaryText: string;
  ctaTertiary: string;
  ctaTertiaryText: string;
  
  // Card Colors
  cardBackground: string;
  cardBorder: string;
  cardElevated: string;
  
  // Text Colors (hierarchy)
  headingPrimary: string;
  headingSecondary: string;
  headingTertiary: string;
  bodyText: string;
  bodyTextMuted: string;
  
  // Interactive Elements
  linkColor: string;
  linkHover: string;
  focusRing: string;
  
  // Status Colors (theme-aware)
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeComponentColors {
  [themeId: string]: ComponentColorPalette;
}

/**
 * Generate component color palette for a theme
 * Uses color theory, contrast analysis, and crew insights
 */
function generateComponentPalette(
  themeId: string,
  baseColors: {
    background: string;
    text: string;
    heading: string;
    accent: string;
  },
  themeDefinition: {
    colorPalette: any;
    emotionalTone: string;
    actionOrientation: string;
    crewPersona: string;
  }
): ComponentColorPalette {
  const accentColor = extractColor(baseColors.accent) || '#000000';
  const bgColor = extractColor(baseColors.background) || '#FFFFFF';
  const isDark = getContrastRatio('#FFFFFF', bgColor) < getContrastRatio('#000000', bgColor);
  
  // CTA Primary - Most prominent, action-compelling
  const ctaPrimary = themeDefinition.colorPalette.ctaPrimary || accentColor;
  const ctaPrimaryText = getButtonTextColor(ctaPrimary, 4.5);
  
  // CTA Secondary - Supporting actions
  const ctaSecondary = themeDefinition.colorPalette.ctaSecondary || adjustColorBrightness(ctaPrimary, isDark ? 0.2 : -0.2);
  const ctaSecondaryText = getButtonTextColor(ctaSecondary, 4.5);
  
  // CTA Tertiary - Subtle actions
  const ctaTertiary = themeDefinition.colorPalette.tertiary || adjustColorBrightness(ctaPrimary, isDark ? 0.4 : -0.4);
  const ctaTertiaryText = getButtonTextColor(ctaTertiary, 4.5);
  
  // Card colors - Subtle elevation and depth
  const cardBackground = isDark 
    ? 'rgba(255, 255, 255, 0.05)' 
    : 'rgba(255, 255, 255, 0.8)';
  const cardBorder = isDark 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.1)';
  const cardElevated = isDark 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(255, 255, 255, 0.95)';
  
  // Heading hierarchy - Visual weight and importance
  const headingPrimary = baseColors.heading;
  const headingSecondary = adjustColorBrightness(headingPrimary, isDark ? 0.15 : -0.15);
  const headingTertiary = adjustColorBrightness(headingPrimary, isDark ? 0.3 : -0.3);
  
  // Body text
  const bodyText = baseColors.text;
  const bodyTextMuted = isDark 
    ? 'rgba(255, 255, 255, 0.6)' 
    : 'rgba(0, 0, 0, 0.6)';
  
  // Interactive elements
  const linkColor = accentColor;
  const linkHover = adjustColorBrightness(linkColor, isDark ? 0.2 : -0.2);
  const focusRing = `${accentColor}80`; // 50% opacity
  
  // Status colors (theme-aware, maintaining emotional tone)
  const statusColors = generateStatusColors(themeDefinition, isDark);
  
  return {
    ctaPrimary,
    ctaPrimaryText,
    ctaSecondary,
    ctaSecondaryText,
    ctaTertiary,
    ctaTertiaryText,
    cardBackground,
    cardBorder,
    cardElevated,
    headingPrimary,
    headingSecondary,
    headingTertiary,
    bodyText,
    bodyTextMuted,
    linkColor,
    linkHover,
    focusRing,
    ...statusColors
  };
}

/**
 * Adjust color brightness
 */
function adjustColorBrightness(hex: string, factor: number): string {
  const rgb = hexToRgb(hex);
  const r = Math.max(0, Math.min(255, rgb.r + (factor * 255)));
  const g = Math.max(0, Math.min(255, rgb.g + (factor * 255)));
  const b = Math.max(0, Math.min(255, rgb.b + (factor * 255)));
  return `#${[r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('')}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return { r, g, b };
}

/**
 * Generate theme-aware status colors
 * Maintains emotional tone while being functional
 */
function generateStatusColors(themeDefinition: any, isDark: boolean): {
  success: string;
  warning: string;
  error: string;
  info: string;
} {
  const baseAccent = extractColor(themeDefinition.colorPalette.accent) || '#000000';
  
  // Success - Green-tinted, positive
  const success = isDark ? '#4ade80' : '#22c55e';
  
  // Warning - Yellow/orange, attention
  const warning = isDark ? '#fbbf24' : '#f59e0b';
  
  // Error - Red, urgent
  const error = isDark ? '#f87171' : '#ef4444';
  
  // Info - Theme accent color
  const info = baseAccent;
  
  return { success, warning, error, info };
}

// Theme definitions with component palettes
const THEME_COMPONENT_DEFINITIONS: Record<string, any> = {
  mochaEarth: {
    colorPalette: {
      ctaPrimary: '#556c52',
      ctaSecondary: '#8B6F47',
      tertiary: '#D4A574'
    },
    emotionalTone: 'calm, trustworthy, organic, grounded',
    actionOrientation: 'gentle persuasion, trust-building',
    crewPersona: 'Troi'
  },
  verdantNature: {
    colorPalette: {
      ctaPrimary: '#2E7D32',
      ctaSecondary: '#4CAF50',
      tertiary: '#81C784'
    },
    emotionalTone: 'fresh, energetic, growth-oriented',
    actionOrientation: 'growth, renewal, positive action',
    crewPersona: 'La Forge'
  },
  chromeMetallic: {
    colorPalette: {
      ctaPrimary: '#00D4FF',
      ctaSecondary: '#00A8CC',
      tertiary: '#007A99'
    },
    emotionalTone: 'futuristic, precise, innovative',
    actionOrientation: 'precise action, technological advancement',
    crewPersona: 'Data'
  },
  brutalist: {
    colorPalette: {
      ctaPrimary: '#000000',
      ctaSecondary: '#FFFFFF',
      tertiary: '#CCCCCC'
    },
    emotionalTone: 'bold, direct, unapologetic',
    actionOrientation: 'direct action, clear statements',
    crewPersona: 'Worf'
  },
  mutedNeon: {
    colorPalette: {
      ctaPrimary: '#00b2a8',
      ctaSecondary: '#00E5D4',
      tertiary: '#B2DFDB'
    },
    emotionalTone: 'modern, sophisticated, contemporary',
    actionOrientation: 'modern action, contemporary flow',
    crewPersona: 'Riker'
  },
  monochromeBlue: {
    colorPalette: {
      ctaPrimary: '#1565C0',
      ctaSecondary: '#42A5F5',
      tertiary: '#90CAF9'
    },
    emotionalTone: 'calm, professional, trustworthy',
    actionOrientation: 'trust-building, professional engagement',
    crewPersona: 'Picard'
  },
  gradient: {
    colorPalette: {
      ctaPrimary: '#f7c9fc',
      ctaSecondary: '#f093fb',
      tertiary: '#764ba2'
    },
    emotionalTone: 'dynamic, creative, flowing',
    actionOrientation: 'creative action, dynamic flow',
    crewPersona: 'Troi'
  },
  pastel: {
    colorPalette: {
      ctaPrimary: '#a27294',
      ctaSecondary: '#e8a4d4',
      tertiary: '#f5c2e8'
    },
    emotionalTone: 'soft, gentle, approachable',
    actionOrientation: 'gentle persuasion, welcoming action',
    crewPersona: 'Troi'
  },
  cyberpunk: {
    colorPalette: {
      ctaPrimary: '#ff0099',
      ctaSecondary: '#ff00cc',
      tertiary: '#cc0066'
    },
    emotionalTone: 'edgy, high-energy, rebellious',
    actionOrientation: 'bold action, intense engagement',
    crewPersona: 'Worf'
  },
  glassmorphism: {
    colorPalette: {
      ctaPrimary: '#a78bfa',
      ctaSecondary: '#c4b5fd',
      tertiary: '#ddd6fe'
    },
    emotionalTone: 'elegant, sophisticated, refined',
    actionOrientation: 'elegant action, sophisticated engagement',
    crewPersona: 'Picard'
  },
  midnight: {
    colorPalette: {
      ctaPrimary: '#00ffff',
      ctaSecondary: '#00cccc',
      tertiary: '#009999'
    },
    emotionalTone: 'deep, mysterious, calm',
    actionOrientation: 'thoughtful action, calm engagement',
    crewPersona: 'Picard'
  },
  offworld: {
    colorPalette: {
      ctaPrimary: '#00d9ff',
      ctaSecondary: '#00b8d4',
      tertiary: '#0097a7'
    },
    emotionalTone: 'exploratory, infinite, cosmic',
    actionOrientation: 'exploration, discovery, infinite possibilities',
    crewPersona: 'Data'
  }
};

/**
 * Get component color palette for a theme
 */
export function getComponentColors(themeId: string, baseColors: {
  background: string;
  text: string;
  heading: string;
  accent: string;
}): ComponentColorPalette {
  const themeDef = THEME_COMPONENT_DEFINITIONS[themeId] || THEME_COMPONENT_DEFINITIONS.mochaEarth;
  return generateComponentPalette(themeId, baseColors, themeDef);
}

