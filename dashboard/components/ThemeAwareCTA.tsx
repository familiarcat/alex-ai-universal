'use client';

/**
 * Theme-Aware CTA Component
 * 
 * Enhanced for DDD Visual Design System:
 * - CTA hierarchy (primary, secondary, tertiary)
 * - Responsive sizing with clamp()
 * - Proper word wrapping
 * - Theme-aware colors from crew analysis
 * - Navigation support for dedicated screens
 * - Icon support for visual clarity
 * 
 * Usage:
 *   <ThemeAwareCTA level="primary" href="/dashboard/analytics" icon="📊">
 *     View Full Analytics
 *   </ThemeAwareCTA>
 *   <ThemeAwareCTA level="secondary" onClick={handleAction}>
 *     Export Report
 *   </ThemeAwareCTA>
 * 
 * Leadership: Counselor Troi (UX) + Commander Riker (Tactical)
 */

import React from 'react';
import Link from 'next/link';
import { getCTAStyle } from '@/lib/component-styles';

interface ThemeAwareCTAProps {
  level: 'primary' | 'secondary' | 'tertiary';
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string; // For external links
  disabled?: boolean;
  className?: string;
  icon?: string; // Icon emoji or text
  iconPosition?: 'left' | 'right'; // Icon position relative to text
  fullWidth?: boolean; // Make button full width of container
}

export default function ThemeAwareCTA({
  level,
  children,
  onClick,
  href,
  target,
  disabled = false,
  className = '',
  icon,
  iconPosition = 'left',
  fullWidth = false
}: ThemeAwareCTAProps) {
  const baseStyle = getCTAStyle(level);
  const style = {
    ...baseStyle,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto',
    width: fullWidth ? '100%' : 'auto',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: icon ? '8px' : '0'
  };

  const content = (
    <>
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </>
  );

  // Use Next.js Link for internal navigation (better performance)
  if (href && !target) {
    return (
      <Link
        href={href}
        style={style}
        className={className}
        onClick={disabled ? undefined : onClick}
      >
        {content}
      </Link>
    );
  }

  // Use regular anchor for external links
  if (href && target) {
    return (
      <a
        href={href}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        style={style}
        className={className}
        onClick={disabled ? undefined : onClick}
      >
        {content}
      </a>
    );
  }

  // Button for actions
  return (
    <button
      style={style}
      className={className}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}

