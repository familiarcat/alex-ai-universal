'use client';

/**
 * Navigation Spacer Component
 * 
 * System-wide vertical spacing component for content below navigation bar
 * Automatically adjusts based on navigation visibility
 * 
 * Usage:
 * ```tsx
 * <NavigationSpacer />
 * ```
 * 
 * Or with custom content padding:
 * ```tsx
 * <NavigationSpacer contentPadding={40} />
 * ```
 * 
 * Reviewed by: Counselor Troi (UX) & Chief O'Brien (Pragmatic Implementation)
 */

import { useNavigationSpacing } from '@/lib/hooks/useNavigationSpacing';

export interface NavigationSpacerProps {
  /** Custom content padding (overrides default) */
  contentPadding?: number;
  /** Additional className */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export default function NavigationSpacer({ 
  contentPadding,
  className = '',
  style = {}
}: NavigationSpacerProps) {
  const { isVisible, spacerHeight, contentPadding: defaultPadding } = useNavigationSpacing();
  
  const padding = contentPadding ?? defaultPadding;
  const height = isVisible ? spacerHeight : 0;
  
  if (!isVisible && !contentPadding) {
    // Don't render spacer if navigation is not visible and no custom padding
    return null;
  }
  
  return (
    <div 
      className={className}
      style={{
        height: `${height}px`,
        paddingTop: contentPadding ? `${padding}px` : undefined,
        ...style
      }}
      aria-hidden="true"
    />
  );
}

