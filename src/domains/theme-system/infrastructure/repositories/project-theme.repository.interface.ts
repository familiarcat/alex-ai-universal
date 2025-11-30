/**
 * Project Theme Repository Interface
 * Manages theme assignments for projects
 */

export interface ProjectThemeAssignment {
  projectId: string;
  themeId: string;
}

export interface ProjectThemeRepository {
  /**
   * Get theme assignment for a project
   */
  getProjectTheme(projectId: string): Promise<string | null>;

  /**
   * Set theme for a project
   */
  setProjectTheme(projectId: string, themeId: string): Promise<void>;

  /**
   * Get all project theme assignments
   */
  getAllAssignments(): Promise<ProjectThemeAssignment[]>;

  /**
   * Find projects using a specific theme
   */
  findProjectsUsingTheme(themeId: string): Promise<string[]>;

  /**
   * Delete project theme assignment
   */
  deleteAssignment(projectId: string): Promise<void>;
}

