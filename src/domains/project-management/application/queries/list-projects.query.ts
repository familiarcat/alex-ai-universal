/**
 * Query to list all projects
 */
export class ListProjectsQuery {
  constructor(
    public readonly status?: string,
    public readonly crewMemberId?: string
  ) {}
}

export interface ProjectListItemDTO {
  id: string;
  name: string;
  description: string;
  status: string;
  themeId: string | null;
  assignedCrewCount: number;
  hasContent: boolean;
  createdAt: string;
  updatedAt: string;
}

