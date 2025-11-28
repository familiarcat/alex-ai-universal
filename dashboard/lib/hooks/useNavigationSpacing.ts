'use client';

/**
 * Navigation Spacing Hook
 * 
 * Detects if navigation is visible and provides spacing utilities
 * System-wide vertical spacing system for components below navigation bar
 * 
 * Reviewed by: Counselor Troi (UX) & Chief O'Brien (Pragmatic Implementation)
 */

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import React from 'react';

export interface NavigationSpacing {
  /** Whether navigation is currently visible */
  isVisible: boolean;
  /** Total height of navigation (spacer + content padding) */
  totalHeight: number;
  /** Height of navigation spacer only */
  spacerHeight: number;
  /** Content padding to apply below navigation */
  contentPadding: number;
  /** Combined spacing: spacer + content padding */
  combinedSpacing: number;
  /** CSS style object for padding-top when navigation is visible */
  style: React.CSSProperties;
}

/**
 * Hook to detect navigation visibility and provide spacing utilities
 * 
 * Navigation is visible on all routes EXCEPT:
 * - Auth pages (/auth/*)
 * - Project preview pages (/projects/*)
 * - Embedded views (?embed=1)
 * 
 * @returns NavigationSpacing object with visibility and spacing utilities
 */
export function useNavigationSpacing(): NavigationSpacing {
  const pathname = usePathname() || '';
  const [isClient, setIsClient] = React.useState(false);
  
  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isVisible = useMemo(() => {
    // On server, always return false to avoid hydration mismatch
    if (!isClient) return false;
    
    // Check for embed parameter
    const isEmbed = new URLSearchParams(window.location.search).get('embed') === '1';
    if (isEmbed) return false;
    
    // Check for auth pages
    if (pathname.startsWith('/auth')) return false;
    
    // Check for project preview pages
    if (pathname.startsWith('/projects')) return false;
    
    // Navigation is visible on all other pages
    return true;
  }, [pathname, isClient]);
  
  // Navigation dimensions (matching DashboardChrome calculations)
  const navHeight = 100; // Total navigation height (DevNavigation + StatusRibbon + safety margin)
  const contentPadding = 32; // Default content padding (--spacing-xl)
  
  const totalHeight = isVisible ? navHeight : 0;
  const spacerHeight = isVisible ? navHeight : 0;
  const combinedSpacing = isVisible ? navHeight + contentPadding : contentPadding;
  
  return {
    isVisible,
    totalHeight,
    spacerHeight,
    contentPadding,
    combinedSpacing,
    style: {
      paddingTop: isVisible ? `${combinedSpacing}px` : `${contentPadding}px`
    }
  };
}


