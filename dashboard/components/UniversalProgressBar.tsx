'use client';

/**
 * 🖖 Universal Progress Bar Component
 * 
 * Terminal-style progress bar for async operations across the dashboard
 * Matches the terminal progress bar style with animated emoji indicators
 * 
 * Usage:
 *   <UniversalProgressBar
 *     current={5}
 *     total={10}
 *     description="Loading crew memories..."
 *     status="recording" // recording | retrieved | failed | complete
 *   />
 */

import React from 'react';

export type ProgressStatus = 'recording' | 'retrieved' | 'failed' | 'complete' | 'loading';

interface UniversalProgressBarProps {
  current: number;
  total: number;
  description: string;
  status?: ProgressStatus;
  showPercentage?: boolean;
  animated?: boolean;
}

const STATUS_EMOJIS: Record<ProgressStatus, string> = {
  recording: '📝',
  retrieved: '📋',
  failed: '❌',
  complete: '✅',
  loading: '⏳'
};

const STATUS_COLORS: Record<ProgressStatus, string> = {
  recording: '#00ffaa',
  retrieved: '#00d4ff',
  failed: '#ff5e5e',
  complete: '#00ffaa',
  loading: '#ffd166'
};

export default function UniversalProgressBar({
  current,
  total,
  description,
  status = 'loading',
  showPercentage = true,
  animated = true
}: UniversalProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const filled = total > 0 ? Math.round((current / total) * 20) : 0;
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  const emoji = STATUS_EMOJIS[status];
  const color = STATUS_COLORS[status];
  
  // Truncate description if too long
  const displayDescription = description.length > 60 
    ? description.substring(0, 57) + '...'
    : description;
  
  return (
    <div style={{
      fontFamily: 'monospace',
      fontSize: '13px',
      lineHeight: '1.5',
      color: '#d0d0d0',
      padding: '8px 12px',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '4px',
      border: `1px solid ${color}33`,
      marginBottom: '4px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px'
      }}>
        <span style={{
          fontSize: '14px',
          animation: animated && status === 'loading' ? 'pulse 1.5s ease-in-out infinite' : 'none'
        }}>
          {emoji}
        </span>
        <span style={{ flex: 1, color: color }}>
          {displayDescription}
        </span>
        {showPercentage && (
          <span style={{ color: '#888', fontSize: '11px' }}>
            {percentage}%
          </span>
        )}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#aaa'
      }}>
        <span style={{ minWidth: '40px' }}>
          [{bar}]
        </span>
        <span style={{ fontSize: '11px', color: '#666' }}>
          {current}/{total}
        </span>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

