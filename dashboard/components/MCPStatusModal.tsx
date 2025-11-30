'use client';

/**
 * MCP Status Modal Component
 * 
 * Displays detailed diagnostic information about MCP system status
 * Shows why MCP is offline with necessary criteria and situational report
 */

import React, { useState, useEffect } from 'react';

interface MCPStatusDetails {
  success: boolean;
  status: 'operational' | 'offline' | 'error';
  services: {
    remoteMCP: boolean;
    localMCP: boolean;
    n8n: boolean;
    openRouter: boolean;
  };
  endpoints: {
    mcp: string;
    n8n: string;
    openRouter: string;
  };
  timestamp: string;
  diagnostics?: {
    supabaseConfigured: boolean;
    supabaseConnected: boolean;
    supabaseError?: string;
    remoteMcpConfigured: boolean;
    remoteMcpReachable: boolean;
    remoteMcpError?: string;
    n8nConfigured: boolean;
    n8nReachable: boolean;
    n8nError?: string;
    openRouterConfigured: boolean;
    openRouterReachable: boolean;
    openRouterError?: string;
  };
  error?: string;
}

interface MCPStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: 'online' | 'offline' | 'error';
}

export default function MCPStatusModal({ isOpen, onClose, currentStatus }: MCPStatusModalProps) {
  const [statusDetails, setStatusDetails] = useState<MCPStatusDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDetailedStatus();
    }
  }, [isOpen]);

  const fetchDetailedStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mcp/status');
      const data = await response.json();
      
      setStatusDetails(data);
    } catch (error: any) {
      setStatusDetails({
        success: false,
        status: 'error',
        services: {
          remoteMCP: false,
          localMCP: false,
          n8n: false,
          openRouter: false
        },
        endpoints: {
          mcp: 'Not configured',
          n8n: 'Not configured',
          openRouter: 'https://openrouter.ai'
        },
        timestamp: new Date().toISOString(),
        error: error.message || 'Failed to fetch status',
        diagnostics: {
          supabaseConfigured: false,
          supabaseConnected: false,
          supabaseError: 'Failed to fetch diagnostics',
          remoteMcpConfigured: false,
          remoteMcpReachable: false,
          remoteMcpError: 'Failed to fetch diagnostics',
          n8nConfigured: false,
          n8nReachable: false,
          n8nError: 'Failed to fetch diagnostics',
          openRouterConfigured: false,
          openRouterReachable: false,
          openRouterError: 'Failed to fetch diagnostics'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDetailedStatus();
    setRefreshing(false);
  };

  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'online': return 'var(--status-success)';
      case 'offline': return 'var(--status-error)';
      case 'error': return 'var(--status-warning)';
      default: return 'var(--text-secondary, #6b7280)';
    }
  };

  const getStatusIcon = (operational: boolean) => {
    return operational ? '✅' : '❌';
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px',
        backdropFilter: 'blur(4px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card-bg)',
          border: `2px solid ${getStatusColor(currentStatus)}`,
          borderRadius: '16px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '32px',
          boxShadow: `0 20px 60px ${getStatusColor(currentStatus)}33`,
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px 12px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text)',
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            lineHeight: 1
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--card-alt)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '32px' }}>🖖</span>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--accent)',
              margin: 0
            }}>
              MCP System Status Report
            </h2>
          </div>
          <p style={{
            fontSize: '14px',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            Detailed diagnostic information and system health
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
            <div>Loading status diagnostics...</div>
          </div>
        ) : statusDetails ? (
          <>
            {/* Overall Status */}
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'var(--card-alt)',
              border: `2px solid ${getStatusColor(statusDetails.status)}`,
              marginBottom: '24px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '4px'
                  }}>
                    Overall Status: {statusDetails.status.toUpperCase()}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)'
                  }}>
                    Last checked: {new Date(statusDetails.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: getStatusColor(statusDetails.status),
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  {statusDetails.status === 'operational' ? '✅ OPERATIONAL' : '❌ OFFLINE'}
                </div>
              </div>
              
              {statusDetails.error && (
                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--status-error)',
                  color: 'var(--status-error)',
                  fontSize: '13px',
                  marginTop: '12px'
                }}>
                  <strong>Error:</strong> {statusDetails.error}
                </div>
              )}
            </div>

            {/* Service Status Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Local MCP (Supabase) */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--card-alt)',
                border: `1px solid ${statusDetails.services.localMCP ? 'var(--status-success)' : 'var(--status-error)'}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                    Local MCP (Supabase)
                  </div>
                  <span style={{ fontSize: '20px' }}>
                    {getStatusIcon(statusDetails.services.localMCP)}
                  </span>
                </div>
                {statusDetails.diagnostics && (
                  <>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      Configured: {statusDetails.diagnostics.supabaseConfigured ? '✅ Yes' : '❌ No'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      Connected: {statusDetails.diagnostics.supabaseConnected ? '✅ Yes' : '❌ No'}
                    </div>
                    {statusDetails.diagnostics.supabaseError && (
                      <div style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'var(--status-error)',
                        opacity: 0.1,
                        fontSize: '11px',
                        color: '#ef4444',
                        marginTop: '8px'
                      }}>
                        {statusDetails.diagnostics.supabaseError}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Remote MCP */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--card-alt)',
                border: `1px solid ${statusDetails.services.remoteMCP ? 'var(--status-success)' : 'var(--status-error)'}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                    Remote MCP Server
                  </div>
                  <span style={{ fontSize: '20px' }}>
                    {getStatusIcon(statusDetails.services.remoteMCP)}
                  </span>
                </div>
                {statusDetails.diagnostics && (
                  <>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      Configured: {statusDetails.diagnostics.remoteMcpConfigured ? '✅ Yes' : '❌ No'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      Reachable: {statusDetails.diagnostics.remoteMcpReachable ? '✅ Yes' : '❌ No'}
                    </div>
                    {statusDetails.diagnostics.remoteMcpError && (
                      <div style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'var(--status-error)',
                        opacity: 0.1,
                        fontSize: '11px',
                        color: '#ef4444',
                        marginTop: '8px'
                      }}>
                        {statusDetails.diagnostics.remoteMcpError}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* n8n */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--card-alt)',
                border: `1px solid ${statusDetails.services.n8n ? 'var(--status-success)' : 'var(--status-error)'}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                    n8n Workflow Engine
                  </div>
                  <span style={{ fontSize: '20px' }}>
                    {getStatusIcon(statusDetails.services.n8n)}
                  </span>
                </div>
                {statusDetails.diagnostics && (
                  <>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      Configured: {statusDetails.diagnostics.n8nConfigured ? '✅ Yes' : '❌ No'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      Reachable: {statusDetails.diagnostics.n8nReachable ? '✅ Yes' : '❌ No'}
                    </div>
                    {statusDetails.diagnostics.n8nError && (
                      <div style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'var(--status-error)',
                        opacity: 0.1,
                        fontSize: '11px',
                        color: '#ef4444',
                        marginTop: '8px'
                      }}>
                        {statusDetails.diagnostics.n8nError}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* OpenRouter */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--card-alt)',
                border: `1px solid ${statusDetails.services.openRouter ? 'var(--status-success)' : 'var(--status-error)'}`
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                    OpenRouter API
                  </div>
                  <span style={{ fontSize: '20px' }}>
                    {getStatusIcon(statusDetails.services.openRouter)}
                  </span>
                </div>
                {statusDetails.diagnostics && (
                  <>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      Configured: {statusDetails.diagnostics.openRouterConfigured ? '✅ Yes' : '❌ No'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginBottom: '8px'
                    }}>
                      Reachable: {statusDetails.diagnostics.openRouterReachable ? '✅ Yes' : '❌ No'}
                    </div>
                    {statusDetails.diagnostics.openRouterError && (
                      <div style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'var(--status-error)',
                        opacity: 0.1,
                        fontSize: '11px',
                        color: '#ef4444',
                        marginTop: '8px'
                      }}>
                        {statusDetails.diagnostics.openRouterError}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Endpoints */}
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--card-alt)',
              border: '1px solid var(--border)',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                Configured Endpoints
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: 'var(--text-muted)'
              }}>
                <div>MCP: {statusDetails.endpoints.mcp || 'Not configured'}</div>
                <div>n8n: {statusDetails.endpoints.n8n || 'Not configured'}</div>
                <div>OpenRouter: {statusDetails.endpoints.openRouter}</div>
              </div>
            </div>

            {/* Situational Report */}
            {statusDetails.status !== 'operational' && statusDetails.diagnostics && (
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                marginBottom: '24px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#ef4444',
                  marginBottom: '12px'
                }}>
                  ⚠️ Situational Report
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text)',
                  lineHeight: '1.6'
                }}>
                  <p style={{ margin: '0 0 8px 0' }}>
                    <strong>MCP Status: OFFLINE</strong>
                  </p>
                  <p style={{ margin: '0 0 8px 0' }}>
                    MCP requires at least one operational service (Local MCP/Supabase or Remote MCP Server) to be online.
                  </p>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {!statusDetails.diagnostics.supabaseConfigured && (
                      <li>Local MCP (Supabase) is not configured - missing environment variables</li>
                    )}
                    {statusDetails.diagnostics.supabaseConfigured && !statusDetails.diagnostics.supabaseConnected && (
                      <li>Local MCP (Supabase) is configured but connection failed</li>
                    )}
                    {!statusDetails.diagnostics.remoteMcpConfigured && (
                      <li>Remote MCP Server is not configured - missing environment variables</li>
                    )}
                    {statusDetails.diagnostics.remoteMcpConfigured && !statusDetails.diagnostics.remoteMcpReachable && (
                      <li>Remote MCP Server is configured but unreachable</li>
                    )}
                  </ul>
                  <p style={{ margin: '8px 0 0 0' }}>
                    <strong>Recommended Actions:</strong>
                  </p>
                  <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Check environment variables in <code>.env.local</code></li>
                    <li>Verify Supabase credentials and network connectivity</li>
                    <li>Check remote MCP server URL and API key if using remote MCP</li>
                    <li>Review server logs for connection errors</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  padding: '10px 20px',
                  background: 'var(--accent)',
                  color: 'var(--button-text)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  opacity: refreshing ? 0.6 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Status'}
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  background: 'var(--card-alt)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#ef4444'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>❌</div>
            <div>Failed to load status information</div>
          </div>
        )}
      </div>
    </div>
  );
}

