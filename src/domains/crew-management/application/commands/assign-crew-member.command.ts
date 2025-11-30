/**
 * Command to assign a crew member to a project
 */
export class AssignCrewMemberCommand {
  constructor(
    public readonly crewMemberId: string,
    public readonly projectId: string,
    public readonly taskDescription?: string
  ) {}
}

