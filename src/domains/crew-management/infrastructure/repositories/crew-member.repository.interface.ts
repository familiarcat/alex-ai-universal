/**
 * Crew Member Repository Interface
 */

import { CrewMember } from '../../domain/aggregates/crew-member';

export interface CrewMemberRepository {
  /**
   * Find crew member by ID
   */
  findById(id: string): Promise<CrewMember | null>;

  /**
   * Find crew member by name
   */
  findByName(name: string): Promise<CrewMember | null>;

  /**
   * Find all crew members
   */
  findAll(): Promise<CrewMember[]>;

  /**
   * Find active crew members
   */
  findActive(): Promise<CrewMember[]>;

  /**
   * Find available crew members (active with no assignments)
   */
  findAvailable(): Promise<CrewMember[]>;

  /**
   * Find crew members with specific expertise
   */
  findByExpertise(expertiseArea: string): Promise<CrewMember[]>;

  /**
   * Find crew members assigned to a project
   */
  findByProject(projectId: string): Promise<CrewMember[]>;

  /**
   * Save crew member (create or update)
   */
  save(crewMember: CrewMember): Promise<void>;

  /**
   * Delete crew member
   */
  delete(id: string): Promise<void>;
}

