/**
 * Role-Based Access Control (RBAC) System
 * 
 * Defines roles and permissions for multi-tier dashboard system:
 * - Super User (Global Dashboard)
 * - Project Admin (Project Dashboard)
 * - Project User (Limited access)
 * 
 * Reviewed by: Lieutenant Worf (Security)
 */

export enum UserRole {
  SUPER_USER = 'super_user',
  PROJECT_ADMIN = 'project_admin',
  PROJECT_USER = 'project_user'
}

export enum Permission {
  // Global Dashboard Permissions
  CREATE_PROJECT = 'create_project',
  DELETE_PROJECT = 'delete_project',
  MANAGE_ALL_PROJECTS = 'manage_all_projects',
  MANAGE_USERS = 'manage_users',
  VIEW_SYSTEM_HEALTH = 'view_system_health',
  MANAGE_AWS_RESOURCES = 'manage_aws_resources',
  
  // Project Dashboard Permissions
  MANAGE_PROJECT_CONTENT = 'manage_project_content',
  MANAGE_PROJECT_SETTINGS = 'manage_project_settings',
  VIEW_PROJECT_ANALYTICS = 'view_project_analytics',
  MANAGE_PROJECT_USERS = 'manage_project_users',
  DEPLOY_PROJECT = 'deploy_project',
  
  // Limited Permissions
  VIEW_PROJECT = 'view_project',
  EDIT_OWN_CONTENT = 'edit_own_content'
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_USER]: [
    Permission.CREATE_PROJECT,
    Permission.DELETE_PROJECT,
    Permission.MANAGE_ALL_PROJECTS,
    Permission.MANAGE_USERS,
    Permission.VIEW_SYSTEM_HEALTH,
    Permission.MANAGE_AWS_RESOURCES,
    Permission.MANAGE_PROJECT_CONTENT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.VIEW_PROJECT_ANALYTICS,
    Permission.MANAGE_PROJECT_USERS,
    Permission.DEPLOY_PROJECT,
    Permission.VIEW_PROJECT
  ],
  [UserRole.PROJECT_ADMIN]: [
    Permission.MANAGE_PROJECT_CONTENT,
    Permission.MANAGE_PROJECT_SETTINGS,
    Permission.VIEW_PROJECT_ANALYTICS,
    Permission.MANAGE_PROJECT_USERS,
    Permission.DEPLOY_PROJECT,
    Permission.VIEW_PROJECT
  ],
  [UserRole.PROJECT_USER]: [
    Permission.VIEW_PROJECT,
    Permission.EDIT_OWN_CONTENT
  ]
};

export interface User {
  id: string;
  email: string;
  role: UserRole;
  projectIds?: string[]; // Projects user has access to
  createdAt: Date;
  updatedAt: Date;
}

export class RoleBasedAccessControl {
  /**
   * Check if user has permission
   */
  static hasPermission(user: User, permission: Permission, projectId?: string): boolean {
    const userPermissions = ROLE_PERMISSIONS[user.role];
    
    if (!userPermissions.includes(permission)) {
      return false;
    }
    
    // For project-specific permissions, check project access
    if (projectId && user.role !== UserRole.SUPER_USER) {
      if (!user.projectIds || !user.projectIds.includes(projectId)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Check if user can access project
   */
  static canAccessProject(user: User, projectId: string): boolean {
    if (user.role === UserRole.SUPER_USER) {
      return true; // Super users can access all projects
    }
    
    return user.projectIds?.includes(projectId) || false;
  }
  
  /**
   * Get user's accessible projects
   */
  static getAccessibleProjects(user: User): string[] {
    if (user.role === UserRole.SUPER_USER) {
      return ['*']; // All projects
    }
    
    return user.projectIds || [];
  }
}

