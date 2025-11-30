/**
 * Contrast Utilities
 * 
 * Calculates WCAG contrast ratios and provides contrast-aware color utilities
 * Used to ensure buttons and text are always readable
 */

/**
 * Calculate relative luminance of a color
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  hex = hex.replace('#', '');
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Extract hex color from CSS variable, gradient, or hex string
 * 
 * FIXED: Added null/undefined checks to prevent "charAt" errors
 * Crew: Data (Analysis) & O'Brien (Pragmatic Fix)
 */
export function extractColor(colorString: string | null | undefined): string | null {
  if (!colorString || typeof colorString !== 'string' || colorString.trim() === '') {
    return null;
  }
  
  // If it's a hex color
  if (colorString.startsWith('#')) {
    return colorString;
  }
  
  // If it's a gradient, extract the darkest/lightest color for contrast calculation
  if (colorString.includes('gradient')) {
    const matches = colorString.match(/#([0-9A-Fa-f]{6})/g);
    if (matches && matches.length > 0) {
      // For contrast calculation, use the color that's most representative
      // For dark themes, use the darkest color; for light themes, use the lightest
      // Default to first color
      return matches[0];
    }
  }
  
  // If it's rgba/rgb, convert to hex approximation
  // For rgba with opacity, we blend with white (for light) or black (for dark)
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    let r = parseInt(rgbMatch[1]);
    let g = parseInt(rgbMatch[2]);
    let b = parseInt(rgbMatch[3]);
    const alpha = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1.0;
    
    // If there's alpha, blend with white background (assuming cards are on white/light background)
    // For semi-transparent overlays, we approximate by blending with white
    if (alpha < 1.0) {
      // Blend: result = color * alpha + white * (1 - alpha)
      r = Math.round(r * alpha + 255 * (1 - alpha));
      g = Math.round(g * alpha + 255 * (1 - alpha));
      b = Math.round(b * alpha + 255 * (1 - alpha));
    }
    
    return `#${[r, g, b].map(x => {
      const hex = Math.round(x).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('')}`;
  }
  
  return null;
}

/**
 * Determine if text should be light or dark based on background
 * Returns optimal text color for maximum contrast
 */
export function getOptimalTextColor(backgroundColor: string): string {
  const bgColor = extractColor(backgroundColor);
  if (!bgColor) return '#000000'; // Default to black if we can't parse
  
  const bgLum = getLuminance(bgColor);
  
  // If background is light (luminance > 0.5), use dark text
  // If background is dark (luminance <= 0.5), use light text
  return bgLum > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Get button text color that ensures WCAG AA compliance
 * Returns either light or dark text based on button background
 */
export function getButtonTextColor(buttonBackground: string, minContrast: number = 3.0): string {
  const bgColor = extractColor(buttonBackground);
  if (!bgColor) return '#000000';
  
  // Try white text first
  const whiteContrast = getContrastRatio('#FFFFFF', bgColor);
  if (whiteContrast >= minContrast) {
    return '#FFFFFF';
  }
  
  // Try black text
  const blackContrast = getContrastRatio('#000000', bgColor);
  if (blackContrast >= minContrast) {
    return '#000000';
  }
  
  // If neither works, return the one with better contrast
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

/**
 * Check if a color combination meets WCAG contrast requirements
 */
export function meetsWCAGAA(textColor: string, backgroundColor: string, isLargeText: boolean = false): boolean {
  const text = extractColor(textColor);
  const bg = extractColor(backgroundColor);
  
  if (!text || !bg) return false;
  
  const contrast = getContrastRatio(text, bg);
  const required = isLargeText ? 3.0 : 4.5; // WCAG AA
  
  return contrast >= required;
}

/**
 * Calculate card background that ensures contrast with theme background
 * Preserves theme identity by blending with theme colors, not generic white/black
 */
export function calculateCardBackground(themeBackground: string, isDark: boolean, themeAccent?: string): string {
  const bgColor = extractColor(themeBackground);
  if (!bgColor) {
    return isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)';
  }
  
  const bgLum = getLuminance(bgColor);
  const bgRgb = hexToRgb(bgColor);
  
  if (isDark) {
    // Dark theme: blend theme background with subtle lightening
    // Preserve theme color identity while adding contrast
    const lightenFactor = bgLum < 0.1 ? 0.12 : bgLum < 0.2 ? 0.08 : 0.05;
    const r = Math.min(255, bgRgb.r + (lightenFactor * 255));
    const g = Math.min(255, bgRgb.g + (lightenFactor * 255));
    const b = Math.min(255, bgRgb.b + (lightenFactor * 255));
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.95)`;
  } else {
    // Light theme: use theme background with slight darkening or white overlay
    // For very light backgrounds, use white; for colored backgrounds, preserve color
    if (bgLum > 0.9) {
      // Very light background (like brutalist white) - use white card
      return 'rgba(255, 255, 255, 0.95)';
    } else {
      // Colored light background - preserve theme color with slight darkening
      const darkenFactor = 0.1;
      const r = Math.max(0, bgRgb.r - (darkenFactor * 255));
      const g = Math.max(0, bgRgb.g - (darkenFactor * 255));
      const b = Math.max(0, bgRgb.b - (darkenFactor * 255));
      return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, 0.95)`;
    }
  }
}

/**
 * Calculate text color for card background that meets WCAG AA
 * Ensures text is always legible on card backgrounds
 */
export function getCardTextColor(cardBackground: string, minContrast: number = 4.5): string {
  const cardBg = extractColor(cardBackground);
  if (!cardBg) return '#000000';
  
  // Try white text first
  const whiteContrast = getContrastRatio('#FFFFFF', cardBg);
  if (whiteContrast >= minContrast) {
    return '#FFFFFF';
  }
  
  // Try black text
  const blackContrast = getContrastRatio('#000000', cardBg);
  if (blackContrast >= minContrast) {
    return '#000000';
  }
  
  // If neither works, return the one with better contrast
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

/**
 * Calculate data point number color that ensures contrast on card background
 * Uses accent color if it has sufficient contrast, otherwise uses optimal text color
 */
export function getDataPointColor(
  cardBackground: string,
  accentColor: string,
  minContrast: number = 4.5
): string {
  const cardBg = extractColor(cardBackground);
  const accent = extractColor(accentColor);
  
  if (!cardBg) return accent || '#000000';
  if (!accent) return getCardTextColor(cardBackground, minContrast);
  
  // Check if accent color has sufficient contrast
  const accentContrast = getContrastRatio(accent, cardBg);
  if (accentContrast >= minContrast) {
    return accent;
  }
  
  // If accent doesn't have enough contrast, use a brighter/darker version
  const cardLum = getLuminance(cardBg);
  const accentLum = getContrastRatio('#FFFFFF', cardBg) < getContrastRatio('#000000', cardBg)
    ? 0.8 // Dark card, use bright accent
    : 0.2; // Light card, use dark accent
  
  // Adjust accent to meet contrast
  return getCardTextColor(cardBackground, minContrast);
}

/**
 * Calculate muted text color for cards that meets WCAG AA (3.0 for large text)
 */
export function getCardMutedTextColor(cardBackground: string): string {
  const cardBg = extractColor(cardBackground);
  if (!cardBg) return 'rgba(0, 0, 0, 0.6)';
  
  const cardLum = getLuminance(cardBg);
  const isDark = cardLum < 0.5;
  
  // For large text (muted), WCAG AA requires 3.0:1
  // Use 60% opacity for muted text
  return isDark 
    ? 'rgba(255, 255, 255, 0.65)' // Slightly brighter than bodyTextMuted for cards
    : 'rgba(0, 0, 0, 0.65)';
}

