/**
 * Query to get theme for a specific project
 */
export class GetProjectThemeQuery {
  constructor(
    public readonly projectId: string
  ) {}
}

/**
 * Result of get project theme query
 */
export interface ProjectThemeDTO {
  projectId: string;
  themeId: string;
  themeName: string;
  themeIcon: string;
  css: Record<string, string>;
  inlineCSS: string;
}

