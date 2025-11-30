/**
 * Command to apply a theme to a project
 */
export class ApplyThemeCommand {
  constructor(
    public readonly projectId: string,
    public readonly themeId: string
  ) {}
}

