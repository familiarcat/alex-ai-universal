/**
 * Command to mark a task as completed
 */
export class CompleteTaskCommand {
  constructor(
    public readonly crewMemberId: string,
    public readonly projectId: string,
    public readonly taskDescription: string
  ) {}
}

