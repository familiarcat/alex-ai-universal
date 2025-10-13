/**
 * Command to update a theme's definition
 */
export class UpdateThemeCommand {
  constructor(
    public readonly themeId: string,
    public readonly colorPalette?: any,
    public readonly cssVariables?: Record<string, string>,
    public readonly features?: Record<string, boolean>
  ) {}
}

