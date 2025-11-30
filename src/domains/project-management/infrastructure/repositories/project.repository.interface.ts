/**
 * Project Repository Interface
 */

import { Project } from '../../domain/aggregates/project';

export interface ProjectRepository {
  /**
   * Find project by ID
   */
  findById(id: string): Promise<Project | null>;

  /**
   * Find project by name
   */
  findByName(name: string): Promise<Project | null>;

  /**
   * Find all projects
   */
  findAll(): Promise<Project[]>;

  /**
   * Find projects by status
   */
  findByStatus(status: string): Promise<Project[]>;

  /**
   * Find projects with assigned crew member
   */
  findByCrewMember(crewMemberId: string): Promise<Project[]>;

  /**
   * Find projects using a specific theme
   */
  findByTheme(themeId: string): Promise<Project[]>;

  /**
   * Find active projects (not archived or cancelled)
   */
  findActive(): Promise<Project[]>;

  /**
   * Save project (create or update)
   */
  save(project: Project): Promise<void>;

  /**
   * Delete project
   */
  delete(id: string): Promise<void>;
}

