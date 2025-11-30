'use client';

/**
 * Universal Icon Component
 * 
 * Counselor Troi's UX Memories Applied
 * Provides consistent icon sizing across all UI layouts
 * 
 * Features:
 * - Standardized sizes (xs, sm, md, lg, xl, 2xl)
 * - Responsive scaling
 * - Accessibility support (minimum touch targets)
 * - Consistent styling
 */

import React from 'react';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface IconProps {
  children: React.ReactNode;
  size?: IconSize;
  responsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
  role?: string;
}

export function Icon({
  children,
  size = 'md',
  responsive = false,
  className = '',
  style = {},
  ariaLabel,
  role = 'img'
}: IconProps) {
  const sizeClass = responsive ? 'icon-responsive' : `icon-${size}`;
  const classes = `icon ${sizeClass} ${className}`.trim();

  const iconStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    ...style
  };

  return (
    <span
      className={classes}
      style={iconStyle}
      role={role}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    >
      {children}
    </span>
  );
}

/**
 * Icon with Touch Target (Accessibility)
 * Ensures minimum 44x44px touch target (Dr. Crusher's recommendation)
 */
export function TouchIcon({
  children,
  size = 'md',
  responsive = false,
  className = '',
  style = {},
  ariaLabel,
  role = 'img'
}: IconProps) {
  return (
    <span className="touch-target" style={{ ...style }}>
      <Icon
        size={size}
        responsive={responsive}
        className={className}
        ariaLabel={ariaLabel}
        role={role}
      >
        {children}
      </Icon>
    </span>
  );
}

