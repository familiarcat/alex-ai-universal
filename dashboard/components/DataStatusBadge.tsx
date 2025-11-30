'use client';

/**
 * Data Status Badge Component
 * 
 * Visual indicator for data source status (live vs mock)
 * Uses theme system for consistent styling
 * 
 * Leadership: Counselor Troi (UX) + Commander Data (Data Analysis)
 */

import React from 'react';

export type DataStatus = 'live' | 'mock' | 'loading' | 'error';

interface DataStatusBadgeProps {
  status: DataStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'inline';
  className?: string;
}

export default function DataStatusBadge({
  status,
  showIcon = true,
  size = 'sm',
  position = 'inline',
  className = ''
}: DataStatusBadgeProps) {
  const statusConfig = {
    live: {
      label: 'Live Data',
      icon: '🟢',
      color: 'var(--data-status-live-color, #00ffaa)',
      bg: 'var(--data-status-live-bg, rgba(0, 255, 170, 0.15))',
      border: 'var(--data-status-live-border, rgba(0, 255, 170, 0.3))'
    },
    mock: {
      label: 'Mock Data',
      icon: '🟡',
      color: 'var(--data-status-mock-color, #ffaa00)',
      bg: 'var(--data-status-mock-bg, rgba(255, 170, 0, 0.15))',
      border: 'var(--data-status-mock-border, rgba(255, 170, 0, 0.3))'
    },
    loading: {
      label: 'Loading...',
      icon: '⏳',
      color: 'var(--data-status-loading-color, #888)',
      bg: 'var(--data-status-loading-bg, rgba(136, 136, 136, 0.15))',
      border: 'var(--data-status-loading-border, rgba(136, 136, 136, 0.3))'
    },
    error: {
      label: 'Error',
      icon: '🔴',
      color: 'var(--data-status-error-color, #ff4444)',
      bg: 'var(--data-status-error-bg, rgba(255, 68, 68, 0.15))',
      border: 'var(--data-status-error-border, rgba(255, 68, 68, 0.3))'
    }
  };

  const sizeConfig = {
    sm: {
      fontSize: '11px',
      padding: '4px 8px',
      iconSize: '12px',
      gap: '4px'
    },
    md: {
      fontSize: '13px',
      padding: '6px 12px',
      iconSize: '14px',
      gap: '6px'
    },
    lg: {
      fontSize: '15px',
      padding: '8px 16px',
      iconSize: '16px',
      gap: '8px'
    }
  };

  const config = statusConfig[status];
  const sizeStyle = sizeConfig[size];

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizeStyle.gap,
    fontSize: sizeStyle.fontSize,
    padding: sizeStyle.padding,
    color: config.color,
    background: config.bg,
    border: `1px solid ${config.border}`,
    borderRadius: 'var(--radius-sm, 6px)',
    fontWeight: 600,
    lineHeight: 1,
    transition: 'all var(--transition-base, 0.2s)',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  };

  const positionStyle: React.CSSProperties = {
    position: position !== 'inline' ? 'absolute' : 'relative',
    ...(position === 'top-right' && { top: '8px', right: '8px' }),
    ...(position === 'top-left' && { top: '8px', left: '8px' }),
    ...(position === 'bottom-right' && { bottom: '8px', right: '8px' }),
    ...(position === 'bottom-left' && { bottom: '8px', left: '8px' }),
    zIndex: 10
  };

  return (
    <span
      style={{ ...badgeStyle, ...positionStyle }}
      className={`data-status-badge data-status-${status} ${className}`}
      title={`Data source: ${config.label}`}
    >
      {showIcon && (
        <span style={{ fontSize: sizeStyle.iconSize, lineHeight: 1 }}>
          {config.icon}
        </span>
      )}
      <span>{config.label}</span>
    </span>
  );
}

/**
 * Hook to determine data status from API response
 */
export function useDataStatus(response: any): DataStatus {
  if (!response) return 'loading';
  if (response.error) return 'error';
  if (response.fallback || response.data?.fallback) return 'mock';
  return 'live';
}

