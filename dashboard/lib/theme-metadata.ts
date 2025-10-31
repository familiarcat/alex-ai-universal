/**
 * Theme Metadata - Single Source of Truth
 * Used by ThemeSelector component and all theme-related UIs
 */

export interface ThemeMeta {
  id: string;
  icon: string;
  name: string;
  category: '2025 Trend' | 'Classic';
  year?: number;
  description?: string;
}

export const THEME_METADATA: ThemeMeta[] = [
  // 2025 NEW TRENDS
  { id: 'mochaEarth', icon: '☕', name: 'Mocha Earth', category: '2025 Trend', year: 2025, description: 'Pantone 2025 - Warm earth tones' },
  { id: 'verdantNature', icon: '🌿', name: 'Verdant Nature', category: '2025 Trend', year: 2025, description: 'Eco-conscious greens' },
  { id: 'chromeMetallic', icon: '🤖', name: 'Chrome Future', category: '2025 Trend', year: 2025, description: 'High-tech metallics' },
  { id: 'brutalist', icon: '⬛', name: 'Brutalist Raw', category: '2025 Trend', year: 2025, description: 'Pure monochrome' },
  { id: 'mutedNeon', icon: '✨', name: 'Muted Neon', category: '2025 Trend', year: 2025, description: 'Calm with neon accents' },
  { id: 'monochromeBlue', icon: '🔵', name: 'Monochrome Blue', category: '2025 Trend', year: 2025, description: 'Single-hue professional' },
  
  // CLASSIC THEMES
  { id: 'gradient', icon: '🌈', name: 'Gradient Fusion', category: 'Classic', description: 'Vibrant multi-color' },
  { id: 'pastel', icon: '🌸', name: 'Pastel', category: 'Classic', description: 'Soft and gentle' },
  { id: 'cyberpunk', icon: '🔮', name: 'Cyberpunk', category: 'Classic', description: 'Futuristic neon' },
  { id: 'glassmorphism', icon: '🪟', name: 'Glass', category: 'Classic', description: 'Frosted blur effects' },
  { id: 'midnight', icon: '🌙', name: 'Midnight', category: 'Classic', description: 'Deep dark mode' },
  { id: 'offworld', icon: '🛸', name: 'Offworld', category: 'Classic', description: 'Space tech panels' }
];

export const THEME_NAMES: Record<string, string> = Object.fromEntries(
  THEME_METADATA.map(t => [t.id, `${t.icon} ${t.name}`])
);

export function getThemeById(id: string): ThemeMeta | undefined {
  return THEME_METADATA.find(t => t.id === id);
}

export function getThemesByCategory(category: '2025 Trend' | 'Classic'): ThemeMeta[] {
  return THEME_METADATA.filter(t => t.category === category);
}

