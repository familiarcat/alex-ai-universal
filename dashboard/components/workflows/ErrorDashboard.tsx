'use client';

/**
 * Error Dashboard Component
 * 
 * Comprehensive error tracking and resolution dashboard
 */

import React, { useState, useEffect } from 'react';

interface Error {
  id: string;
  workflowId: string;
  workflowName: string;
  nodeId?: string;
  nodeName?: string;
  message: string;
  stack?: string;
  timestamp: string;
  status: 'open' | 'resolved' | 'ignored';
  resolution?: string;
  resolvedAt?: string;
}

export default function ErrorDashboard() {
  const [errors, setErrors] = useState<Error[]>([]);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved' | 'ignored'>('all');
  const [selectedError, setSelectedError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadErrors();
  }, [filter]);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/mcp/errors?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setErrors(data.errors || []);
      }
    } catch (error) {
      console.error('Error loading errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveError = async (errorId: string, resolution: string) => {
    try {
      const response = await fetch(`/api/mcp/errors/${errorId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution })
      });

      if (response.ok) {
        loadErrors();
        setSelectedError(null);
      }
    } catch (error) {
      console.error('Error resolving error:', error);
      alert('Failed to resolve error');
    }
  };

  const ignoreError = async (errorId: string) => {
    try {
      const response = await fetch(`/api/mcp/errors/${errorId}/ignore`, {
        method: 'POST'
      });

      if (response.ok) {
        loadErrors();
        setSelectedError(null);
      }
    } catch (error) {
      console.error('Error ignoring error:', error);
      alert('Failed to ignore error');
    }
  };

  const getStatusColor = (status: Error['status']) => {
    switch (status) {
      case 'open': return 'var(--status-error)';
      case 'resolved': return 'var(--status-success)';
      case 'ignored': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  const filteredErrors = errors.filter(error => 
    filter === 'all' || error.status === filter
  );

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      background: 'var(--card)',
      borderRadius: 'var(--radius)',
      border: 'var(--border)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)'
      }}>
        <h2 style={{
          fontSize: 'var(--font-xl)',
          color: 'var(--accent)',
          margin: 0
        }}>
          🚨 Error Dashboard
        </h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
          {(['all', 'open', 'resolved', 'ignored'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                border: 'var(--border)',
                background: filter === status ? 'var(--accent)' : 'var(--background)',
                color: filter === status ? 'var(--text-on-accent)' : 'var(--text)',
                cursor: 'pointer',
                fontSize: 'var(--font-sm)',
                textTransform: 'capitalize'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          Loading errors...
        </div>
      ) : filteredErrors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
          No errors found
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedError ? '1fr 400px' : '1fr',
          gap: 'var(--spacing-md)'
        }}>
          {/* Error List */}
          <div>
            {filteredErrors.map(error => (
              <div
                key={error.id}
                onClick={() => setSelectedError(error)}
                style={{
                  padding: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm)',
                  border: selectedError?.id === error.id 
                    ? '2px solid var(--accent)' 
                    : 'var(--border)',
                  background: selectedError?.id === error.id
                    ? 'var(--accent-light)'
                    : 'var(--background)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  <div>
                    <div style={{
                      fontWeight: 'bold',
                      color: 'var(--text)',
                      marginBottom: 'var(--spacing-xs)'
                    }}>
                      {error.workflowName}
                      {error.nodeName && ` - ${error.nodeName}`}
                    </div>
                    <div style={{
                      fontSize: 'var(--font-sm)',
                      color: 'var(--text-muted)',
                      marginBottom: 'var(--spacing-xs)'
                    }}>
                      {error.message}
                    </div>
                  </div>
                  <div style={{
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    borderRadius: 'var(--radius-sm)',
                    background: getStatusColor(error.status),
                    color: 'white',
                    fontSize: 'var(--font-xs)',
                    textTransform: 'uppercase'
                  }}>
                    {error.status}
                  </div>
                </div>
                <div style={{
                  fontSize: 'var(--font-xs)',
                  color: 'var(--text-muted)'
                }}>
                  {new Date(error.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Error Details */}
          {selectedError && (
            <div style={{
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border)',
              background: 'var(--background)',
              position: 'sticky',
              top: 'var(--spacing-md)',
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-md)'
              }}>
                <h3 style={{
                  fontSize: 'var(--font-lg)',
                  color: 'var(--text)',
                  margin: 0
                }}>
                  Error Details
                </h3>
                <button
                  onClick={() => setSelectedError(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 'var(--font-xl)',
                    cursor: 'pointer',
                    color: 'var(--text)'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <strong>Workflow:</strong> {selectedError.workflowName}
              </div>
              {selectedError.nodeName && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <strong>Node:</strong> {selectedError.nodeName}
                </div>
              )}
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <strong>Message:</strong>
                <div style={{
                  marginTop: 'var(--spacing-xs)',
                  padding: 'var(--spacing-sm)',
                  background: '#fee2e2',
                  borderRadius: 'var(--radius-sm)',
                  color: '#dc2626',
                  fontSize: 'var(--font-sm)',
                  fontFamily: 'monospace'
                }}>
                  {selectedError.message}
                </div>
              </div>

              {selectedError.stack && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <strong>Stack Trace:</strong>
                  <div style={{
                    marginTop: 'var(--spacing-xs)',
                    padding: 'var(--spacing-sm)',
                    background: 'var(--card)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-xs)',
                    fontFamily: 'monospace',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {selectedError.stack}
                  </div>
                </div>
              )}

              {selectedError.status === 'open' && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--spacing-sm)',
                  marginTop: 'var(--spacing-md)'
                }}>
                  <button
                    onClick={() => {
                      const resolution = prompt('Enter resolution notes:');
                      if (resolution) {
                        resolveError(selectedError.id, resolution);
                      }
                    }}
                    style={{
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: 'var(--status-success)',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => ignoreError(selectedError.id)}
                    style={{
                      padding: 'var(--spacing-sm)',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border)',
                      background: 'var(--background)',
                      color: 'var(--text)',
                      cursor: 'pointer'
                    }}
                  >
                    Ignore
                  </button>
                </div>
              )}

              {selectedError.status === 'resolved' && selectedError.resolution && (
                <div style={{
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-sm)',
                  background: '#d1fae5',
                  borderRadius: 'var(--radius-sm)',
                  color: '#065f46'
                }}>
                  <strong>Resolution:</strong> {selectedError.resolution}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

