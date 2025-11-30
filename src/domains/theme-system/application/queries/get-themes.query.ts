/**
 * Query to get all available themes
 */
export class GetThemesQuery {
  constructor(
    public readonly category?: string,
    public readonly feature?: string
  ) {}
}

/**
 * Result of get themes query
 */
export interface ThemeDTO {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  features: Record<string, boolean>;
  css: Record<string, string>;
}

