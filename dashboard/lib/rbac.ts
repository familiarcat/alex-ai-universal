/**
 * 🖖 Role-Based Access Control (RBAC) System
 * 
 * Implements RBAC for three-tier dashboard architecture
 * 
 * Roles:
 * - admin: Full access to Tier 1 (Main Dashboard)
 * - project_owner: Full access to Tier 2 (Project Dashboard) for specific project
 * - project_editor: Write access to Tier 2 (Project Dashboard) for specific project
 * - project_viewer: Read-only access to Tier 2 (Project Dashboard) for specific project
 * - public: Read-only access to Tier 3 (Published Sites)
 * 
 * Crew: Team Beta (Worf + Picard) - Security & Strategic Access Control
 */

import { DashboardTier } from './tier-detection';

export type UserRole = 'admin' | 'project_owner' | 'project_editor' | 'project_viewer' | 'public';

export interface Permission {
  read: boolean;
  write: boolean;
  admin: boolean;
}

export interface UserRoleAssignment {
  userId: string;
  projectId?: string;
  role: UserRole;
  tier: DashboardTier;
  expiresAt?: Date;
}

/**
 * Role hierarchy (higher roles inherit lower permissions)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  project_owner: 4,
  project_editor: 3,
  project_viewer: 2,
  public: 1
};

/**
 * Get permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission {
  switch (role) {
    case 'admin':
      return { read: true, write: true, admin: true };
    case 'project_owner':
      return { read: true, write: true, admin: false };
    case 'project_editor':
      return { read: true, write: true, admin: false };
    case 'project_viewer':
      return { read: true, write: false, admin: false };
    case 'public':
      return { read: true, write: false, admin: false };
    default:
      return { read: false, write: false, admin: false };
  }
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: 'read' | 'write' | 'admin'): boolean {
  const permissions = getRolePermissions(role);
  return permissions[permission];
}

/**
 * Check if role1 is higher than or equal to role2
 */
export function isRoleHigherOrEqual(role1: UserRole, role2: UserRole): boolean {
  return ROLE_HIERARCHY[role1] >= ROLE_HIERARCHY[role2];
}

/**
 * Check user permission for a project and tier
 */
export async function checkUserPermission(
  userId: string,
  projectId: string | undefined,
  tier: DashboardTier,
  permission: 'read' | 'write' | 'admin'
): Promise<boolean> {
  try {
    // Call n8n webhook to check permission (DDD-compliant)
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
    const response = await fetch(`${n8nUrl}/webhook/rbac-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        projectId,
        tier,
        permission
      })
    });
    
    if (!response.ok) {
      console.warn('RBAC check failed:', response.status);
      return false;
    }
    
    const data = await response.json();
    return data.hasPermission === true;
  } catch (error) {
    console.error('RBAC check error:', error);
    // Fallback: Allow if tier is published and permission is read
    if (tier === 'published' && permission === 'read') {
      return true;
    }
    return false;
  }
}

/**
 * Get user roles for a project and tier
 */
export async function getUserRoles(
  userId: string,
  projectId?: string,
  tier?: DashboardTier
): Promise<UserRole[]> {
  try {
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
    const response = await fetch(`${n8nUrl}/webhook/rbac-get-roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        projectId,
        tier
      })
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    return data.roles || [];
  } catch (error) {
    console.error('Get user roles error:', error);
    return [];
  }
}

/**
 * Assign role to user
 */
export async function assignRole(assignment: UserRoleAssignment): Promise<boolean> {
  try {
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
    const response = await fetch(`${n8nUrl}/webhook/rbac-assign-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...assignment,
        expiresAt: assignment.expiresAt?.toISOString()
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Assign role error:', error);
    return false;
  }
}

/**
 * Revoke role from user
 */
export async function revokeRole(
  userId: string,
  projectId: string | undefined,
  role: UserRole,
  tier: DashboardTier
): Promise<boolean> {
  try {
    const n8nUrl = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
    const response = await fetch(`${n8nUrl}/webhook/rbac-revoke-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        projectId,
        role,
        tier
      })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Revoke role error:', error);
    return false;
  }
}

/**
 * Check if user can access tier
 */
export function canAccessTier(userRole: UserRole, tier: DashboardTier): boolean {
  // Admin can access all tiers
  if (userRole === 'admin') {
    return true;
  }
  
  // Project roles can access Tier 2 (project dashboards)
  if (tier === 'project' && ['project_owner', 'project_editor', 'project_viewer'].includes(userRole)) {
    return true;
  }
  
  // Public can access Tier 3 (published sites)
  if (tier === 'published' && userRole === 'public') {
    return true;
  }
  
  // Main dashboard (Tier 1) requires admin
  if (tier === 'main') {
    return userRole === 'admin';
  }
  
  return false;
}

