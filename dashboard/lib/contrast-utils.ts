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
 */
export function extractColor(colorString: string | null | undefined): string | null {
  if (!colorString) return null;
  
  // If it's a hex color
  if (colorString.startsWith('#')) {
    return colorString;
  }
  
  // If it's a gradient, extract first color
  if (colorString.includes('gradient')) {
    const match = colorString.match(/#([0-9A-Fa-f]{6})/);
    if (match) return `#${match[1]}`;
  }
  
  // If it's rgba/rgb, convert to hex approximation
  const rgbMatch = colorString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
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

