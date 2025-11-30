/**
 * Contrast utility functions for WCAG 2.1 AA compliance
 * Ensures proper contrast ratios across all theme variations
 */

export interface ContrastColors {
  background: string
  foreground: string
  ratio: number
  level: 'AA' | 'AAA' | 'FAIL'
}

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Calculate relative luminance of a color
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  if (!rgb1 || !rgb2) return 1
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

/**
 * Check if contrast meets WCAG requirements
 */
export function getContrastLevel(ratio: number): 'AA' | 'AAA' | 'FAIL' {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'FAIL'
}

/**
 * Generate high contrast color combinations
 */
export function getHighContrastColors(
  background: string,
  options: {
    lightText?: string
    darkText?: string
    accent?: string
    role?: string
    component?: string
    enhancements?: string
  } = {}
): ContrastColors[] {
  const combinations: ContrastColors[] = []
  
  // Default color options
  const lightOptions = options.lightText || '#ffffff'
  const darkOptions = options.darkText || '#000000'
  
  // Test combinations
  const testColors = [
    lightOptions,
    darkOptions,
    options.accent,
    options.role,
    options.component,
    options.enhancements
  ].filter(Boolean) as string[]
  
  testColors.forEach(color => {
    const ratio = getContrastRatio(background, color)
    combinations.push({
      background,
      foreground: color,
      ratio,
      level: getContrastLevel(ratio)
    })
  })
  
  return combinations.sort((a, b) => b.ratio - a.ratio)
}

/**
 * Find the best contrast color for a given background
 */
export function getBestContrastColor(
  background: string,
  colorOptions: string[]
): string {
  let bestColor = colorOptions[0]
  let bestRatio = 0
  
  colorOptions.forEach(color => {
    const ratio = getContrastRatio(background, color)
    if (ratio > bestRatio) {
      bestRatio = ratio
      bestColor = color
    }
  })
  
  return bestColor
}

/**
 * Ensure minimum contrast ratio
 */
export function ensureMinContrast(
  background: string,
  foreground: string,
  minRatio: number = 4.5
): string {
  const ratio = getContrastRatio(background, foreground)
  
  if (ratio >= minRatio) {
    return foreground
  }
  
  // If contrast is too low, try to find a better color
  const rgb = hexToRgb(background)
  if (!rgb) return foreground
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b)
  
  // If background is dark, use light text; if light, use dark text
  const targetLuminance = luminance < 0.5 ? 1 : 0
  
  // Simple approach: return white for dark backgrounds, black for light
  return targetLuminance > 0.5 ? '#ffffff' : '#000000'
}

/**
 * Theme-specific contrast optimizations
 */
export const CONTRAST_OPTIMIZATIONS = {
  light: {
    // Light theme needs dark text on light backgrounds
    text: '#0f172a',
    secondaryText: '#374151',
    accent: '#1e40af',
    role: '#065f46',
    component: '#92400e',
    enhancements: '#111827'
  },
  dark: {
    // Dark theme needs light text on dark backgrounds
    text: '#f1f5f9',
    secondaryText: '#e5e7eb',
    accent: '#60a5fa',
    role: '#4ade80',
    component: '#fbbf24',
    enhancements: '#d1d5db'
  },
  'star-trek': {
    // Star Trek theme optimization
    text: '#dbeafe',
    secondaryText: '#bfdbfe',
    accent: '#3b82f6',
    role: '#00ff88',
    component: '#fbbf24',
    enhancements: '#ffffff'
  },
  neon: {
    // Neon theme optimization
    text: '#ffffff',
    secondaryText: '#e5e7eb',
    accent: '#00ff88',
    role: '#00ff88',
    component: '#ffff00',
    enhancements: '#ffffff'
  },
  ocean: {
    // Ocean theme optimization
    text: '#e0f2fe',
    secondaryText: '#bae6fd',
    accent: '#0369a1',
    role: '#00d4ff',
    component: '#fbbf24',
    enhancements: '#e0f2fe'
  }
} as const

/**
 * Get optimized colors for a specific theme
 */
export function getOptimizedThemeColors(themeId: string) {
  return CONTRAST_OPTIMIZATIONS[themeId as keyof typeof CONTRAST_OPTIMIZATIONS] || CONTRAST_OPTIMIZATIONS.dark
}

/**
 * Validate theme contrast compliance
 */
export function validateThemeContrast(theme: {
  id: string
  colors: {
    primary: string
    secondary: string
    accent: string
    role: string
    component: string
    enhancements: string
  }
}): { isValid: boolean; issues: string[] } {
  const issues: string[] = []
  const optimizedColors = getOptimizedThemeColors(theme.id)
  
  // Test primary background with accent text
  const primaryAccentRatio = getContrastRatio(theme.colors.primary, theme.colors.accent)
  if (primaryAccentRatio < 4.5) {
    issues.push(`Primary/Accent contrast ratio ${primaryAccentRatio.toFixed(2)} below WCAG AA (4.5)`)
  }
  
  // Test secondary background with accent text
  const secondaryAccentRatio = getContrastRatio(theme.colors.secondary, theme.colors.accent)
  if (secondaryAccentRatio < 4.5) {
    issues.push(`Secondary/Accent contrast ratio ${secondaryAccentRatio.toFixed(2)} below WCAG AA (4.5)`)
  }
  
  // Test role color contrast
  const roleRatio = getContrastRatio(theme.colors.primary, theme.colors.role)
  if (roleRatio < 4.5) {
    issues.push(`Primary/Role contrast ratio ${roleRatio.toFixed(2)} below WCAG AA (4.5)`)
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}




