/**
 * 🖖 Theme Opacity Utilities
 * 
 * Helper functions to create rgba colors with opacity from CSS variables
 * Since CSS variables don't support opacity modifiers like var(--color)20,
 * we need to convert hex colors to rgba with opacity
 * 
 * Crew: La Forge (Implementation) & Data (Analysis)
 */

/**
 * Convert hex color to rgba with opacity
 */
export function hexToRgba(hex: string, opacity: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Handle 3-digit hex
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  
  if (hex.length !== 6) {
    // Fallback to original if invalid
    return hex;
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Get status error color with opacity
 * Note: This requires the actual color value, not a CSS variable
 * For CSS variables, use the opacity property on the element instead
 */
export function getStatusErrorWithOpacity(opacity: number): string {
  // This would need the actual color value from the theme
  // For now, return a function that can be used with computed styles
  return `var(--status-error)`; // Use opacity property on element
}



