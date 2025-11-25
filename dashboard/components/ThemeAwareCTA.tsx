'use client';

/**
 * Theme-Aware CTA Component
 * 
 * Demonstrates the new comprehensive color theory system:
 * - CTA hierarchy (primary, secondary, tertiary)
 * - Responsive sizing with clamp()
 * - Proper word wrapping
 * - Theme-aware colors from crew analysis
 * 
 * Usage:
 *   <ThemeAwareCTA level="primary">New Project</ThemeAwareCTA>
 *   <ThemeAwareCTA level="secondary">Analytics</ThemeAwareCTA>
 */

import React from 'react';
import { getCTAStyle } from '@/lib/component-styles';

interface ThemeAwareCTAProps {
  level: 'primary' | 'secondary' | 'tertiary';
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  className?: string;
}

export default function ThemeAwareCTA({
  level,
  children,
  onClick,
  href,
  disabled = false,
  className = ''
}: ThemeAwareCTAProps) {
  const baseStyle = getCTAStyle(level);
  const style = {
    ...baseStyle,
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    pointerEvents: disabled ? 'none' : 'auto'
  };

  if (href) {
    return (
      <a
        href={href}
        style={style}
        className={className}
        onClick={disabled ? undefined : onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      style={style}
      className={className}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

