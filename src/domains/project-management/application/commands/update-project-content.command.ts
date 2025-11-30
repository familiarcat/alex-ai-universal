/**
 * Command to update project content
 */
export class UpdateProjectContentCommand {
  constructor(
    public readonly projectId: string,
    public readonly content: Record<string, any>,
    public readonly editedBy: string
  ) {}
}

