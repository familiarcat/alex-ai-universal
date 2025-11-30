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
  description?: string; // Made optional with default
  label?: string; // Support both 'description' and 'label' for backward compatibility
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

// Theme-aware status colors with fallbacks
const STATUS_COLORS: Record<ProgressStatus, string> = {
  recording: 'var(--status-success, var(--accent, #00ffaa))',
  retrieved: 'var(--status-info, #00d4ff)',
  failed: 'var(--status-error, #ff5e5e)',
  complete: 'var(--status-success, var(--accent, #00ffaa))',
  loading: 'var(--status-warning, #ffd166)'
};

export default function UniversalProgressBar({
  current,
  total,
  description,
  label, // Support both 'description' and 'label'
  status = 'loading',
  showPercentage = true,
  animated = true
}: UniversalProgressBarProps) {
  // FIXED: Handle undefined/null description and support 'label' prop
  const desc = description || label || 'Progress';
  
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const filled = total > 0 ? Math.round((current / total) * 20) : 0;
  const empty = 20 - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  const emoji = STATUS_EMOJIS[status];
  const color = STATUS_COLORS[status];
  
  // Truncate description if too long (with null check)
  const displayDescription = desc && desc.length > 60 
    ? desc.substring(0, 57) + '...'
    : desc;
  
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
      {/* Visual Progress Bar with Solid/Faded Backgrounds */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%'
      }}>
        <div style={{
          flex: 1,
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)', // Faded background for unfilled
          borderRadius: '4px',
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            height: '100%',
            width: `${percentage}%`,
            background: color, // Solid background for filled portion
            borderRadius: '4px',
            transition: 'width 0.3s ease, background 0.3s ease',
            boxShadow: `0 0 8px ${color}40`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shimmer effect for active progress */}
            {status === 'loading' && animated && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                animation: 'shimmer 2s infinite'
              }} />
            )}
          </div>
        </div>
        <span style={{ 
          fontSize: '11px', 
          color: '#888',
          minWidth: '50px',
          textAlign: 'right',
          fontFamily: 'monospace'
        }}>
          {current}/{total}
        </span>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

