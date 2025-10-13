/**
 * Query to get detailed project information
 */
export class GetProjectDetailsQuery {
  constructor(
    public readonly projectId: string
  ) {}
}

export interface ProjectDetailsDTO {
  id: string;
  name: string;
  description: string;
  status: string;
  themeId: string | null;
  assignedCrewIds: string[];
  content: Record<string, any>;
  port: number | null;
  budget: number | null;
  timeline: string | null;
  features: string[];
  technologies: string[];
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, any>;
}

