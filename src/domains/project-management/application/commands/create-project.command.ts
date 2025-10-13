/**
 * Command to create a new project
 */
export class CreateProjectCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly createdBy: string,
    public readonly themeId?: string,
    public readonly assignedCrewIds?: string[],
    public readonly budget?: number,
    public readonly timeline?: string,
    public readonly features?: string[],
    public readonly technologies?: string[]
  ) {}
}

