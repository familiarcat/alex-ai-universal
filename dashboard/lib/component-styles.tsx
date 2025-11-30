/**
 * Component Styles Utility
 * 
 * Provides theme-aware styling utilities for components:
 * - CTA hierarchy (primary, secondary, tertiary)
 * - Responsive text sizing relative to component size
 * - Proper word wrapping
 * - Theme-aware colors from crew analysis
 * 
 * Based on Observation Lounge crew recommendations
 */

import React from 'react';

export interface ComponentSize {
  small: React.CSSProperties;
  medium: React.CSSProperties;
  large: React.CSSProperties;
}

/**
 * CTA Button Styles
 * Quark's recommendation: Action-compelling hierarchy
 */
export const ctaStyles: ComponentSize = {
  primary: {
    background: 'var(--cta-primary)',
    color: 'var(--cta-primary-text)',
    fontWeight: 600,
    padding: 'clamp(12px, 2vw, 16px) clamp(24px, 4vw, 32px)',
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    minHeight: 'clamp(44px, 6vw, 56px)',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  secondary: {
    background: 'var(--cta-secondary)',
    color: 'var(--cta-secondary-text)',
    fontWeight: 500,
    padding: 'clamp(10px, 1.5vw, 12px) clamp(20px, 3vw, 24px)',
    fontSize: 'clamp(13px, 1.3vw, 16px)',
    minHeight: 'clamp(40px, 5vw, 48px)',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  tertiary: {
    background: 'var(--cta-tertiary)',
    color: 'var(--cta-tertiary-text)',
    fontWeight: 400,
    padding: 'clamp(8px, 1vw, 10px) clamp(16px, 2vw, 20px)',
    fontSize: 'clamp(12px, 1.2vw, 14px)',
    minHeight: 'clamp(36px, 4vw, 40px)',
    borderRadius: 'var(--radius)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px'
  }
};

/**
 * Card Styles
 * La Forge's implementation with responsive sizing
 */
export const cardStyles: ComponentSize = {
  small: {
    background: 'var(--card-bg)',
    border: 'var(--card-border)',
    borderRadius: 'var(--radius)',
    padding: 'clamp(12px, 2vw, 16px)',
    fontSize: 'clamp(12px, 1.2vw, 14px)',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%'
  },
  medium: {
    background: 'var(--card-bg)',
    border: 'var(--card-border)',
    borderRadius: 'var(--radius)',
    padding: 'clamp(16px, 2.5vw, 24px)',
    fontSize: 'clamp(14px, 1.4vw, 16px)',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%'
  },
  large: {
    background: 'var(--card-bg)',
    border: 'var(--card-border)',
    borderRadius: 'var(--radius)',
    padding: 'clamp(24px, 3vw, 32px)',
    fontSize: 'clamp(16px, 1.6vw, 18px)',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    maxWidth: '100%'
  }
};

/**
 * Typography Styles
 * Data's precision + Troi's UX recommendations
 */
export const typographyStyles = {
  heading: {
    h1: {
      color: 'var(--heading-primary)',
      fontSize: 'clamp(24px, 4vw, 32px)',
      lineHeight: 1.2,
      fontWeight: 700,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%',
      margin: 0
    },
    h2: {
      color: 'var(--heading-primary)',
      fontSize: 'clamp(20px, 3.5vw, 28px)',
      lineHeight: 1.3,
      fontWeight: 600,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%',
      margin: 0
    },
    h3: {
      color: 'var(--heading-secondary)',
      fontSize: 'clamp(18px, 3vw, 24px)',
      lineHeight: 1.4,
      fontWeight: 600,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%',
      margin: 0
    },
    h4: {
      color: 'var(--heading-secondary)',
      fontSize: 'clamp(16px, 2.5vw, 20px)',
      lineHeight: 1.4,
      fontWeight: 600,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%',
      margin: 0
    },
    h5: {
      color: 'var(--heading-tertiary)',
      fontSize: 'clamp(14px, 2vw, 18px)',
      lineHeight: 1.5,
      fontWeight: 500,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%',
      margin: 0
    },
    h6: {
      color: 'var(--heading-tertiary)',
      fontSize: 'clamp(12px, 1.8vw, 16px)',
      lineHeight: 1.5,
      fontWeight: 500,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%',
      margin: 0
    }
  },
  body: {
    large: {
      color: 'var(--body-text)',
      fontSize: 'clamp(16px, 1.8vw, 18px)',
      lineHeight: 1.6,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%'
    },
    medium: {
      color: 'var(--body-text)',
      fontSize: 'clamp(14px, 1.6vw, 16px)',
      lineHeight: 1.5,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%'
    },
    small: {
      color: 'var(--body-text)',
      fontSize: 'clamp(12px, 1.4vw, 14px)',
      lineHeight: 1.4,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%'
    },
    muted: {
      color: 'var(--text-muted)',
      fontSize: 'clamp(12px, 1.4vw, 14px)',
      lineHeight: 1.4,
      wordWrap: 'break-word',
      overflowWrap: 'break-word',
      maxWidth: '100%'
    }
  }
};

/**
 * Get CTA style by hierarchy level
 */
export function getCTAStyle(level: 'primary' | 'secondary' | 'tertiary'): React.CSSProperties {
  return ctaStyles[level];
}

/**
 * Get card style by size
 */
export function getCardStyle(size: 'small' | 'medium' | 'large'): React.CSSProperties {
  return cardStyles[size];
}

/**
 * Get heading style by level
 */
export function getHeadingStyle(level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'): React.CSSProperties {
  return typographyStyles.heading[level];
}

/**
 * Get body text style by size
 */
export function getBodyTextStyle(size: 'large' | 'medium' | 'small' | 'muted'): React.CSSProperties {
  return typographyStyles.body[size];
}

