'use client';

/**
 * MCP Status Page
 * 
 * Dedicated page for displaying MCP system status with full diagnostics
 * Replaces raw JSON output with user-friendly UI
 * 
 * Crew: Troi (UX) + Data (Visualization) + La Forge (Infrastructure)
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MCPStatusModal from '@/components/MCPStatusModal';

interface MCPStatusData {
  success: boolean;
  status: 'operational' | 'offline' | 'error';
  services: {
    remoteMCP: boolean;
    localMCP: boolean;
    n8n: boolean;
    openRouter: boolean;
  };
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
  timestamp: string;
  error?: string;
}

export default function MCPStatusPage() {
  const [statusData, setStatusData] = useState<MCPStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchStatus();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000); // Exponential backoff, max 5s
    
    try {
      // TEAM BETA: Improved fetch with explicit JSON request
      // Crew: Troi (UX) + La Forge (Infrastructure) + Crusher (Health)
      const response = await fetch('/api/mcp/status/', {
        cache: 'no-store',
        headers: {
          'Accept': 'application/json', // Explicitly request JSON (Team Alpha fix ensures this works)
          'Cache-Control': 'no-cache'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      // Check for HTTP errors (4xx, 5xx)
      if (!response.ok) {
        // For rate limiting (429), try to parse the response anyway
        if (response.status === 429) {
          try {
            const data = await response.json();
            setStatusData(data);
            return;
          } catch {
            // If parsing fails, fall through to error handling
          }
        }
        
        // Retry on server errors (5xx) with exponential backoff
        if (response.status >= 500 && retryCount < maxRetries) {
          console.warn(`Server error ${response.status}, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return fetchStatus(retryCount + 1);
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Parse JSON response
      const data = await response.json();
      
      // Validate response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }
      
      // Success - update status data
      setStatusData(data);
      
    } catch (error: any) {
      // TEAM BETA: Improved error handling with graceful degradation
      console.error('Failed to fetch MCP status:', error);
      
      // Retry on network errors with exponential backoff
      if (
        (error.name === 'TimeoutError' || 
         error.name === 'TypeError' || 
         error.message?.includes('fetch')) &&
        retryCount < maxRetries
      ) {
        console.warn(`Network error, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchStatus(retryCount + 1);
      }
      
      // Only set error state if we don't have any cached data
      // This prevents clearing valid data on temporary network issues
      if (!statusData) {
        setStatusData({
          success: false,
          status: 'error',
          services: {
            remoteMCP: false,
            localMCP: false,
            n8n: false,
            openRouter: false
          },
          timestamp: new Date().toISOString(),
          error: error.message || 'Failed to fetch status'
        });
      } else {
        // If we have cached data, just log the error but keep showing the last known status
        console.warn('Status fetch failed, keeping last known status:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStatus();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'var(--status-success, #00ffaa)';
      case 'offline': return 'var(--status-error, #ff4444)';
      case 'error': return 'var(--status-warning, #ffd166)';
      default: return 'var(--text-secondary, #666)';
    }
  };

  const getServiceStatus = (operational: boolean) => {
    return operational ? '✅ Online' : '❌ Offline';
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'var(--background, #0a0a0f)',
        color: 'var(--text, #fff)',
        gap: '24px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid var(--border, rgba(255,255,255,0.1))',
          borderTop: '4px solid var(--accent, #00ffaa)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <div style={{ fontSize: '18px', fontWeight: 600 }}>
          Loading MCP Status...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'var(--background, #0a0a0f)',
        color: 'var(--text, #fff)',
        padding: '40px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Failed to Load Status</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted, #666)', marginBottom: '24px' }}>
          Unable to fetch MCP system status
        </p>
        <button
          onClick={handleRefresh}
          style={{
            padding: '12px 24px',
            background: 'var(--accent, #00ffaa)',
            color: 'var(--button-text, #000)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background, #0a0a0f)',
      color: 'var(--text, #fff)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '32px' }}>🖖</span>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--accent, #00ffaa)',
                margin: 0
              }}>
                MCP System Status
              </h1>
            </div>
            <p style={{
              fontSize: '14px',
              color: 'var(--text-muted, #666)',
              margin: 0
            }}>
              Model Context Protocol - System Health Dashboard
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              style={{
                padding: '10px 20px',
                background: 'var(--card-alt, rgba(255,255,255,0.05))',
                color: 'var(--text, #fff)',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: refreshing ? 'not-allowed' : 'pointer',
                opacity: refreshing ? 0.6 : 1,
                transition: 'all 0.2s'
              }}
            >
              {refreshing ? '🔄 Refreshing...' : '🔄 Refresh'}
            </button>
            <button
              onClick={() => setModalOpen(true)}
              style={{
                padding: '10px 20px',
                background: 'var(--accent, #00ffaa)',
                color: 'var(--button-text, #000)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              📊 Detailed Diagnostics
            </button>
            <Link
              href="/mcp"
              style={{
                padding: '10px 20px',
                background: 'var(--card-alt, rgba(255,255,255,0.05))',
                color: 'var(--text, #fff)',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              ← Back to MCP
            </Link>
          </div>
        </div>

        {/* Overall Status Card */}
        <div style={{
          padding: '24px',
          borderRadius: '12px',
          background: 'var(--card-bg, rgba(255,255,255,0.03))',
          border: `2px solid ${getStatusColor(statusData.status)}`,
          marginBottom: '24px',
          boxShadow: `0 4px 20px ${getStatusColor(statusData.status)}33`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: 600,
                color: 'var(--text, #fff)',
                marginBottom: '8px'
              }}>
                Overall System Status: {statusData.status.toUpperCase()}
              </div>
              <div style={{
                fontSize: '12px',
                color: 'var(--text-muted, #666)'
              }}>
                Last updated: {new Date(statusData.timestamp).toLocaleString()}
              </div>
            </div>
            <div style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: getStatusColor(statusData.status),
              color: 'white',
              fontSize: '16px',
              fontWeight: 700
            }}>
              {statusData.status === 'operational' ? '✅ OPERATIONAL' : '❌ OFFLINE'}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Local MCP (Supabase) */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'var(--card-bg, rgba(255,255,255,0.03))',
            border: `1px solid ${statusData.services.localMCP ? 'var(--status-success, #00ffaa)' : 'var(--status-error, #ff4444)'}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text, #fff)' }}>
                Local MCP (Supabase)
              </div>
              <span style={{ fontSize: '20px' }}>
                {statusData.services.localMCP ? '✅' : '❌'}
              </span>
            </div>
            <div style={{
              fontSize: '14px',
              color: statusData.services.localMCP ? 'var(--status-success, #00ffaa)' : 'var(--status-error, #ff4444)',
              fontWeight: 600
            }}>
              {getServiceStatus(statusData.services.localMCP)}
            </div>
          </div>

          {/* Remote MCP */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'var(--card-bg, rgba(255,255,255,0.03))',
            border: `1px solid ${statusData.services.remoteMCP ? 'var(--status-success, #00ffaa)' : 'var(--status-error, #ff4444)'}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text, #fff)' }}>
                Remote MCP Server
              </div>
              <span style={{ fontSize: '20px' }}>
                {statusData.services.remoteMCP ? '✅' : '❌'}
              </span>
            </div>
            <div style={{
              fontSize: '14px',
              color: statusData.services.remoteMCP ? 'var(--status-success, #00ffaa)' : 'var(--status-error, #ff4444)',
              fontWeight: 600
            }}>
              {getServiceStatus(statusData.services.remoteMCP)}
            </div>
          </div>

          {/* n8n */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'var(--card-bg, rgba(255,255,255,0.03))',
            border: `1px solid ${statusData.services.n8n ? 'var(--status-success, #00ffaa)' : 'var(--status-error, #ff4444)'}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text, #fff)' }}>
                n8n Workflow Engine
              </div>
              <span style={{ fontSize: '20px' }}>
                {statusData.services.n8n ? '✅' : '❌'}
              </span>
            </div>
            <div style={{
              fontSize: '14px',
              color: statusData.services.n8n ? 'var(--status-success, #00ffaa)' : 'var(--status-error, #ff4444)',
              fontWeight: 600
            }}>
              {getServiceStatus(statusData.services.n8n)}
            </div>
          </div>

          {/* OpenRouter */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            background: 'var(--card-bg, rgba(255,255,255,0.03))',
            border: `1px solid ${statusData.services.openRouter ? 'var(--status-success, #00ffaa)' : 'var(--status-error, #ff4444)'}`
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text, #fff)' }}>
                OpenRouter API
              </div>
              <span style={{ fontSize: '20px' }}>
                {statusData.services.openRouter ? '✅' : '❌'}
              </span>
            </div>
            <div style={{
              fontSize: '14px',
              color: statusData.services.openRouter ? 'var(--status-success, #00ffaa)' : 'var(--status-error, #ff4444)',
              fontWeight: 600
            }}>
              {getServiceStatus(statusData.services.openRouter)}
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div style={{
          padding: '20px',
          borderRadius: '12px',
          background: 'var(--card-bg, rgba(255,255,255,0.03))',
          border: '1px solid var(--border, rgba(255,255,255,0.1))'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text, #fff)',
            marginBottom: '12px'
          }}>
            💡 About This Status Page
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--text-muted, #666)',
            lineHeight: '1.6'
          }}>
            <p style={{ margin: '0 0 8px 0' }}>
              This page displays the current status of all MCP system components. 
              Click "Detailed Diagnostics" to see full diagnostic information including 
              configuration status, connection details, and error messages.
            </p>
            <p style={{ margin: '0' }}>
              Status updates automatically every 30 seconds. Use the refresh button 
              to manually check the current status.
            </p>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      <MCPStatusModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentStatus={statusData.status === 'operational' ? 'online' : 'offline'}
      />
    </div>
  );
}

