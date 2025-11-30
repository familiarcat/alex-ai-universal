'use client';

/**
 * Design System Error Display Component
 * 
 * Displays errors in a way that fits seamlessly into the dynamic design system
 * Uses theme-aware styling and provides actionable error information
 * 
 * Crew Integration:
 * - Troi: User-friendly error messages that don't cause panic
 * - Data: Technical details available but not overwhelming
 * - Worf: Security-conscious error reporting (no sensitive data leaks)
 */

import React from 'react';
import { useAppState } from '@/lib/state-manager';

interface DesignSystemErrorDisplayProps {
  error?: Error | string | null; // FIXED: Made optional and nullable
  errorInfo?: React.ErrorInfo | string | null;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'full' | 'compact' | 'inline';
}

export default function DesignSystemErrorDisplay({
  error,
  errorInfo,
  title,
  onRetry,
  onDismiss,
  variant = 'full'
}: DesignSystemErrorDisplayProps) {
  const { globalTheme } = useAppState();
  
  // FIXED: Handle undefined/null error gracefully
  // Crew: Worf (Error Handling) + O'Brien (Pragmatic)
  if (!error) {
    return (
      <div style={{
        padding: '12px',
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        color: 'var(--text-muted)',
        fontSize: 'var(--font-sm)',
        textAlign: 'center'
      }}>
        No error information available
      </div>
    );
  }
  
  const errorMessage = typeof error === 'string' ? error : (error?.message || 'Unknown error');
  const errorStack = typeof error === 'string' ? null : (error?.stack || null);
  const infoString = typeof errorInfo === 'string' ? errorInfo : (errorInfo?.componentStack || null);
  
  const isCompact = variant === 'compact';
  const isInline = variant === 'inline';
  
  if (isInline) {
    return (
      <div style={{
        padding: '8px 12px',
        background: 'var(--status-error)',
        opacity: 0.1,
        border: '1px solid var(--status-error)',
        borderRadius: 'var(--radius)',
        color: 'var(--status-error)',
        fontSize: 'var(--font-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>⚠️</span>
        <span>{errorMessage}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginLeft: 'auto',
              padding: '4px 8px',
              background: 'var(--accent)',
              color: 'var(--button-text)',
              border: 'none',
              borderRadius: '4px',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        )}
      </div>
    );
  }
  
  if (isCompact) {
    return (
      <div style={{
        padding: '12px 16px',
        background: 'var(--card)',
        border: '1px solid var(--status-error)',
        borderRadius: 'var(--radius)',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <h4 style={{
            fontSize: 'var(--font-md)',
            color: 'var(--status-error)',
            margin: 0,
            fontWeight: 600
          }}>
            {title || 'Error'}
          </h4>
        </div>
        <p style={{
          fontSize: 'var(--font-sm)',
          color: 'var(--text)',
          margin: '0 0 12px 0'
        }}>
          {errorMessage}
        </p>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '6px 12px',
                background: 'var(--accent)',
                color: 'var(--button-text)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-xs)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              🔄 Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              style={{
                padding: '6px 12px',
                background: 'var(--card-alt)',
                color: 'var(--text)',
                border: 'var(--border)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-xs)',
                cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Full variant
  return (
    <div style={{
      padding: '24px',
      background: 'var(--card)',
      border: '2px solid var(--status-error)',
      borderRadius: 'var(--radius-lg)',
      marginBottom: '24px',
      boxShadow: 'var(--shadow)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '32px' }}>⚠️</span>
          <div>
            <h3 style={{
              fontSize: 'var(--font-xl)',
              color: 'var(--status-error)',
              margin: 0,
              marginBottom: '4px',
              fontWeight: 700
            }}>
              {title || 'Something went wrong'}
            </h3>
            <p style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              An error occurred while rendering this component
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              padding: '8px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '20px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px'
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Error Message */}
      <div style={{
        padding: '16px',
        background: 'var(--status-error)',
        border: '1px solid var(--status-error)',
        opacity: 0.05,
        borderRadius: 'var(--radius)',
        marginBottom: '16px'
      }}>
        <p style={{
          fontSize: 'var(--font-md)',
          color: 'var(--text)',
          margin: 0,
          fontWeight: 500,
          fontFamily: 'monospace'
        }}>
          {errorMessage}
        </p>
      </div>
      
      {/* Technical Details (Collapsible) */}
      {(errorStack || infoString) && (
        <details style={{
          marginBottom: '16px'
        }}>
          <summary style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--card-alt)',
            userSelect: 'none'
          }}>
            🔍 Technical Details
          </summary>
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'var(--background)',
            border: 'var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--font-xs)',
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
            overflowX: 'auto',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {errorStack && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Stack Trace:</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{errorStack}</pre>
              </div>
            )}
            {infoString && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Component Stack:</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{infoString}</pre>
              </div>
            )}
          </div>
        </details>
      )}
      
      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              padding: '10px 20px',
              background: 'var(--accent)',
              color: 'var(--button-text)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🔄 Retry
          </button>
        )}
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }}
          style={{
            padding: '10px 20px',
            background: 'var(--card-alt)',
            color: 'var(--text)',
            border: 'var(--border)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--font-sm)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          🔃 Reload Page
        </button>
      </div>
    </div>
  );
}

