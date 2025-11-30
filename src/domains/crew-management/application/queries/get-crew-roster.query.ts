/**
 * Query to get the complete crew roster
 */
export class GetCrewRosterQuery {
  constructor(
    public readonly activeOnly?: boolean
  ) {}
}

export interface CrewRosterDTO {
  totalCrew: number;
  activeCrew: number;
  availableCrew: number;
  members: Array<{
    id: string;
    name: string;
    role: string;
    status: 'active' | 'inactive';
    assignmentCount: number;
  }>;
}

