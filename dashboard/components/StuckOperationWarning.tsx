/**
 * 🖖 Stuck Operation Warning Component
 * 
 * Displays user-friendly warning when an operation is stuck in retry loops
 * Allows user to cancel the operation
 * 
 * Crew: Troi (UX Lead) + Crusher (System Health)
 */

import React from 'react';

interface StuckOperationWarningProps {
  operationName: string;
  retryCount: number;
  maxRetries: number;
  onCancel: () => void;
  onRetry?: () => void;
  error?: Error | null;
}

export default function StuckOperationWarning({
  operationName,
  retryCount,
  maxRetries,
  onCancel,
  onRetry,
  error
}: StuckOperationWarningProps) {
  return (
    <div style={{
      padding: '16px',
      background: 'var(--status-warning)',
      opacity: 0.1,
      border: '2px solid var(--status-warning)',
      borderRadius: 'var(--radius)',
      marginBottom: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '24px' }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: 'var(--font-md)',
            fontWeight: 600,
            color: 'var(--status-warning)',
            margin: 0,
            marginBottom: '4px'
          }}>
            Operation Stuck: {operationName}
          </h4>
          <p style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--text)',
            margin: 0
          }}>
            This operation has failed {retryCount} times. It will stop after {maxRetries} attempts.
          </p>
        </div>
      </div>

      {/* Error Details */}
      {error && (
        <div style={{
          padding: '8px 12px',
          background: 'var(--background)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)',
          color: 'var(--text-muted)',
          fontFamily: 'monospace'
        }}>
          {error.message}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end'
      }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '8px 16px',
              background: 'var(--accent)',
              color: 'var(--button-text)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            🔄 Retry Now
          </button>
        )}
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            background: 'var(--card-alt)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--font-sm)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          ❌ Cancel Operation
        </button>
      </div>
    </div>
  );
}

