/**
 * Query to get available crew members
 */
export class GetAvailableCrewQuery {
  constructor(
    public readonly expertiseArea?: string
  ) {}
}

export interface CrewMemberDTO {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  personality: string;
  status: 'active' | 'inactive';
  currentAssignments: string[];
  isAvailable: boolean;
}

