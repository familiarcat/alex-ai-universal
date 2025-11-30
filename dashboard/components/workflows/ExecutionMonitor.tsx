'use client';

/**
 * Execution Monitor Component
 * 
 * Real-time execution monitoring dashboard for MCP workflows
 * Shows execution status, logs, and history
 */

import React, { useState, useEffect } from 'react';

interface Execution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: 'running' | 'success' | 'error' | 'pending';
  startTime: string;
  endTime?: string;
  duration?: number;
  logs: string[];
  errors?: string[];
}

interface ExecutionMonitorProps {
  workflowId?: string;
  autoRefresh?: boolean;
}

export default function ExecutionMonitor({ 
  workflowId, 
  autoRefresh = true 
}: ExecutionMonitorProps) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoRefresh) {
      loadExecutions();
      const interval = setInterval(loadExecutions, 2000); // Refresh every 2 seconds
      return () => clearInterval(interval);
    }
  }, [workflowId, autoRefresh]);

  const loadExecutions = async () => {
    try {
      const url = workflowId 
        ? `/api/mcp/workflows/executions?workflowId=${workflowId}`
        : '/api/mcp/workflows/executions';
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.executions || []);
      }
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  };

  const getStatusColor = (status: Execution['status']) => {
    switch (status) {
      case 'running': return 'var(--status-info)'; // blue
      case 'success': return 'var(--status-success)'; // green
      case 'error': return 'var(--status-error)'; // red
      case 'pending': return 'var(--status-warning)'; // yellow
      default: return 'var(--text-muted)'; // gray
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--card)',
      borderRadius: 'var(--radius)',
      border: 'var(--border)'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-md)',
        borderBottom: 'var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          color: 'var(--accent)',
          margin: 0
        }}>
          📊 Execution Monitor
        </h3>
        <button
          onClick={loadExecutions}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            background: 'var(--accent)',
            color: 'var(--text-on-accent)',
            cursor: 'pointer',
            fontSize: 'var(--font-sm)'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Execution List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--spacing-sm)'
      }}>
        {executions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-lg)',
            color: 'var(--text-muted)'
          }}>
            No executions yet
          </div>
        ) : (
          executions.map(execution => (
            <div
              key={execution.id}
              onClick={() => setSelectedExecution(execution)}
              style={{
                padding: 'var(--spacing-sm)',
                marginBottom: 'var(--spacing-xs)',
                borderRadius: 'var(--radius-sm)',
                border: selectedExecution?.id === execution.id 
                  ? '2px solid var(--accent)' 
                  : 'var(--border)',
                background: selectedExecution?.id === execution.id
                  ? 'var(--accent-light)'
                  : 'var(--background)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-xs)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs)'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: getStatusColor(execution.status)
                  }} />
                  <span style={{
                    fontWeight: 'bold',
                    color: 'var(--text)'
                  }}>
                    {execution.workflowName}
                  </span>
                </div>
                <span style={{
                  fontSize: 'var(--font-xs)',
                  color: 'var(--text-muted)'
                }}>
                  {formatDuration(execution.duration)}
                </span>
              </div>
              <div style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--text-muted)'
              }}>
                {new Date(execution.startTime).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Execution Details */}
      {selectedExecution && (
        <div style={{
          borderTop: 'var(--border)',
          padding: 'var(--spacing-md)',
          maxHeight: '300px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--spacing-sm)'
          }}>
            <h4 style={{
              fontSize: 'var(--font-md)',
              color: 'var(--text)',
              margin: 0
            }}>
              Execution Details
            </h4>
            <button
              onClick={() => setSelectedExecution(null)}
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

          <div style={{
            marginBottom: 'var(--spacing-sm)'
          }}>
            <strong>Status:</strong>{' '}
            <span style={{ color: getStatusColor(selectedExecution.status) }}>
              {selectedExecution.status.toUpperCase()}
            </span>
          </div>

          {selectedExecution.logs && selectedExecution.logs.length > 0 && (
            <div style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong>Logs:</strong>
              <div style={{
                marginTop: 'var(--spacing-xs)',
                padding: 'var(--spacing-xs)',
                background: 'var(--background)',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-xs)',
                fontFamily: 'monospace',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {selectedExecution.logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {selectedExecution.errors && selectedExecution.errors.length > 0 && (
            <div>
              <strong style={{ color: 'var(--status-error)' }}>Errors:</strong>
              <div style={{
                marginTop: 'var(--spacing-xs)',
                padding: 'var(--spacing-xs)',
                background: '#fee2e2',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-xs)',
                fontFamily: 'monospace',
                color: '#dc2626'
              }}>
                {selectedExecution.errors.map((error, index) => (
                  <div key={index}>{error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

