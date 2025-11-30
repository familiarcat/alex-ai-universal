/**
 * Theme Colors - Single Source of Truth
 * Extracted from theme-definitions.js for use in Next.js pages
 * 
 * ⚠️ IMPORTANT: These must stay in sync with universal-theme-system/theme-definitions.js
 * Pattern: Import this instead of hardcoding colors in components
 */

export interface ThemeColors {
  background: string;
  text: string;
  heading: string;
  accent: string;
}

export const THEME_BACKGROUNDS: Record<string, string> = {
  // 2025 NEW TRENDS
  mochaEarth: 'linear-gradient(135deg, #F5EFE7 0%, #E8DED2 100%)',
  verdantNature: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
  chromeMetallic: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
  brutalist: '#FFFFFF',
  mutedNeon: 'linear-gradient(135deg, #F5F0EA 0%, #E8E1D9 100%)',
  monochromeBlue: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
  
  // CLASSIC THEMES
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  pastel: 'linear-gradient(135deg, #fff5f7 0%, #f5f8ff 100%)',
  cyberpunk: 'linear-gradient(135deg, #1a0520 0%, #2d1040 100%)', // Hot pink/purple
  glassmorphism: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  midnight: 'linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%)',
  offworld: 'linear-gradient(135deg, #020818 0%, #041c35 50%, #062a4d 100%)' // Deep blue space
};

export const THEME_TEXT_COLORS: Record<string, string> = {
  mochaEarth: '#2D2520',
  verdantNature: '#1B3A1F',
  chromeMetallic: '#E8E8E8',
  brutalist: '#000000',
  mutedNeon: '#2A2A2A',
  monochromeBlue: '#0D3B66',
  gradient: '#f5f5f5', // Light text for gradient background (was #1a202c - too dark)
  pastel: '#2d2d2d',
  cyberpunk: '#f0e8ff', // Pink-tinted white
  glassmorphism: '#e8e8e8',
  midnight: '#e8e8e8',
  offworld: '#e0f4ff' // Blue-tinted white
};

export const THEME_HEADING_COLORS: Record<string, string> = {
  mochaEarth: '#1A1614',
  verdantNature: '#0D1F11',
  chromeMetallic: '#FFFFFF',
  brutalist: '#000000',
  mutedNeon: '#1A1A1A',
  monochromeBlue: '#0A1929',
  gradient: '#ffffff', // White headings for gradient background (was #0f1419 - too dark)
  pastel: '#1a1a1a',
  cyberpunk: '#ff0099', // Hot pink
  glassmorphism: '#ffffff',
  midnight: '#ffffff',
  offworld: '#00d9ff' // Bright cyan
};

export const THEME_ACCENT_COLORS: Record<string, string> = {
  mochaEarth: '#7A9B76',    // Sage green
  verdantNature: '#2E7D32',  // Forest green
  chromeMetallic: '#00D4FF', // Electric cyan
  brutalist: '#000000',      // Pure black
  mutedNeon: '#00FFF0',      // Neon cyan
  monochromeBlue: '#1565C0', // Deep blue
  gradient: '#f093fb',       // Pink
  pastel: '#e8a4d4',         // Soft pink
  cyberpunk: '#ff0099',      // Hot pink/magenta
  glassmorphism: '#a78bfa',  // Purple
  midnight: '#00ffff',       // Cyan
  offworld: '#00d9ff'        // Bright cyan
};

export const THEME_IS_DARK: Record<string, boolean> = {
  mochaEarth: false,
  verdantNature: false,
  chromeMetallic: true,
  brutalist: false,
  mutedNeon: false,
  monochromeBlue: false,
  gradient: true, // Changed to true - gradient background is dark
  pastel: false,
  cyberpunk: true,
  glassmorphism: true,
  midnight: true,
  offworld: true
};

export function getThemeColors(themeId: string): ThemeColors {
  return {
    background: THEME_BACKGROUNDS[themeId] || THEME_BACKGROUNDS.mochaEarth,
    text: THEME_TEXT_COLORS[themeId] || THEME_TEXT_COLORS.mochaEarth,
    heading: THEME_HEADING_COLORS[themeId] || THEME_HEADING_COLORS.mochaEarth,
    accent: THEME_ACCENT_COLORS[themeId] || THEME_ACCENT_COLORS.mochaEarth
  };
}

export function isThemeDark(themeId: string): boolean {
  return THEME_IS_DARK[themeId] || false;
}

/**
 * 🖖 Crew Note:
 * These colors are extracted from theme-definitions.js.
 * Any changes to themes should update BOTH files.
 * Future: Consider generating this file from theme-definitions.js
 */

