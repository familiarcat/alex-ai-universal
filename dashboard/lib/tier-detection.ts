/**
 * 🖖 Three-Tier Dashboard Detection & Routing
 * 
 * Detects which tier a request belongs to and routes accordingly
 * 
 * Tiers:
 * - Tier 1: Main Dashboard (Universal) - /dashboard
 * - Tier 2: Project Dashboards (User-controlled) - /dashboard/projects/[projectId]
 * - Tier 3: Published Sites (Read-only) - /projects/[projectId]
 * 
 * Crew: Team Delta (Troi + Uhura) + Team Beta (Worf + Picard)
 */

export type DashboardTier = 'main' | 'project' | 'published';

export interface TierContext {
  tier: DashboardTier;
  projectId?: string;
  userId?: string;
  permissions?: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
}

/**
 * Detect tier from pathname
 */
export function detectTierFromPath(pathname: string): DashboardTier {
  // Tier 3: Published sites (public-facing, no dashboard access)
  if (pathname.startsWith('/projects/') && !pathname.includes('/dashboard')) {
    return 'published';
  }
  
  // Tier 2: Project dashboards (user-controlled)
  if (pathname.startsWith('/dashboard/projects/')) {
    return 'project';
  }
  
  // Tier 1: Main dashboard (universal)
  if (pathname.startsWith('/dashboard')) {
    return 'main';
  }
  
  // Default to main for unknown paths
  return 'main';
}

/**
 * Extract project ID from pathname
 */
export function extractProjectIdFromPath(pathname: string): string | null {
  // Tier 2: /dashboard/projects/[projectId]
  const projectDashboardMatch = pathname.match(/^\/dashboard\/projects\/([^\/]+)/);
  if (projectDashboardMatch) {
    return projectDashboardMatch[1];
  }
  
  // Tier 3: /projects/[projectId]
  const publishedMatch = pathname.match(/^\/projects\/([^\/]+)/);
  if (publishedMatch) {
    return publishedMatch[1];
  }
  
  return null;
}

/**
 * Get tier context from current route
 */
export function getTierContext(pathname: string, userId?: string): TierContext {
  const tier = detectTierFromPath(pathname);
  const projectId = extractProjectIdFromPath(pathname);
  
  return {
    tier,
    projectId: projectId || undefined,
    userId,
    permissions: {
      read: true, // Will be checked against RBAC
      write: tier !== 'published', // Published sites are read-only
      admin: tier === 'main' // Only main dashboard has admin access
    }
  };
}

/**
 * Check if path requires authentication
 */
export function requiresAuth(pathname: string): boolean {
  const tier = detectTierFromPath(pathname);
  
  // Tier 1 & 2 require authentication
  return tier === 'main' || tier === 'project';
}

/**
 * Check if path is a published site (Tier 3)
 */
export function isPublishedSite(pathname: string): boolean {
  return detectTierFromPath(pathname) === 'published';
}

/**
 * Check if path is a project dashboard (Tier 2)
 */
export function isProjectDashboard(pathname: string): boolean {
  return detectTierFromPath(pathname) === 'project';
}

/**
 * Check if path is main dashboard (Tier 1)
 */
export function isMainDashboard(pathname: string): boolean {
  return detectTierFromPath(pathname) === 'main';
}

/**
 * Get route for a specific tier and project
 */
export function getTierRoute(tier: DashboardTier, projectId?: string): string {
  switch (tier) {
    case 'main':
      return '/dashboard';
    case 'project':
      return projectId ? `/dashboard/projects/${projectId}` : '/dashboard';
    case 'published':
      return projectId ? `/projects/${projectId}` : '/';
    default:
      return '/dashboard';
  }
}

