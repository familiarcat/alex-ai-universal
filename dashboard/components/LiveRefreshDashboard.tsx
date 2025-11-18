'use client';

/**
 * Live Refresh Dashboard Component
 * 
 * Dynamically updates dashboard based on codebase changes
 * Uses WebSocket for real-time updates from file watcher
 * 
 * Responsive Design (Troi): Clean status indicators, non-intrusive updates
 * Technical Implementation (Data): Efficient WebSocket, minimal re-renders
 * 
 * Reviewed by: Counselor Troi (UX) & Commander Data (Technical)
 */

import { useEffect, useState, useCallback } from 'react';

interface CodebaseChange {
  event: 'add' | 'change' | 'delete';
  filePath: string;
  absolutePath: string;
  timestamp: string;
  hash?: string;
}

interface RefreshStats {
  totalChanges: number;
  lastChange: string | null;
  filesChanged: Set<string>;
  isConnected: boolean;
}

export default function LiveRefreshDashboard() {
  const [stats, setStats] = useState<RefreshStats>({
    totalChanges: 0,
    lastChange: null,
    filesChanged: new Set(),
    isConnected: false
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds

  useEffect(() => {
    // WebSocket connection for live updates
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = process.env.NEXT_PUBLIC_WS_URL || window.location.host;
    const wsUrl = `${wsProtocol}//${wsHost}/api/ws/codebase-changes`;

    let ws: WebSocket | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    function connect() {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log('✅ WebSocket connected for live refresh');
          setStats(prev => ({ ...prev, isConnected: true }));
          reconnectAttempts = 0;
        };

        ws.onmessage = (event) => {
          try {
            const change: CodebaseChange = JSON.parse(event.data);
            handleCodebaseChange(change);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setStats(prev => ({ ...prev, isConnected: false }));
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setStats(prev => ({ ...prev, isConnected: false }));

          // Attempt reconnection
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connect, 1000 * reconnectAttempts);
          }
        };
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        // Fallback to polling if WebSocket unavailable
        startPolling();
      }
    }

    // Fallback: Polling for codebase changes
    function startPolling() {
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch('/api/codebase-changes');
          if (response.ok) {
            const data = await response.json();
            if (data.changes && data.changes.length > 0) {
              data.changes.forEach((change: CodebaseChange) => {
                handleCodebaseChange(change);
              });
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, refreshInterval);

      return () => clearInterval(pollInterval);
    }

    // Handle codebase change
    const handleCodebaseChange = useCallback((change: CodebaseChange) => {
      setStats(prev => {
        const newFilesChanged = new Set(prev.filesChanged);
        newFilesChanged.add(change.filePath);

        return {
          totalChanges: prev.totalChanges + 1,
          lastChange: change.timestamp,
          filesChanged: newFilesChanged,
          isConnected: prev.isConnected
        };
      });

      // Auto-refresh if enabled
      if (autoRefresh && (change.event === 'change' || change.event === 'add')) {
        // Only refresh if it's a relevant file
        const relevantExtensions = ['.tsx', '.ts', '.js', '.jsx', '.json', '.css'];
        const isRelevant = relevantExtensions.some(ext => change.filePath.endsWith(ext));
        
        if (isRelevant) {
          // Trigger a soft refresh (re-fetch data without full page reload)
          window.dispatchEvent(new CustomEvent('codebase-change', { detail: change }));
        }
      }
    }, [autoRefresh]);

    // Start connection
    connect();

    // Cleanup
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [autoRefresh, refreshInterval]);

  // Listen for codebase change events
  useEffect(() => {
    const handler = (event: CustomEvent<CodebaseChange>) => {
      console.log('📝 Codebase change detected:', event.detail.filePath);
      // Components can listen to this event and refresh their data
    };

    window.addEventListener('codebase-change', handler as EventListener);
    return () => window.removeEventListener('codebase-change', handler as EventListener);
  }, []);

  const handleManualRefresh = () => {
    window.location.reload();
  };

  const clearStats = () => {
    setStats({
      totalChanges: 0,
      lastChange: null,
      filesChanged: new Set(),
      isConnected: stats.isConnected
    });
  };

  return (
    <div className="card" style={{
      padding: '20px',
      border: 'var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '24px',
      background: 'var(--card-bg)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🔄</span>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0, marginBottom: '4px' }}>
              Live Refresh System
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              Real-time codebase monitoring
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '13px',
            color: 'var(--text)',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Auto-refresh
          </label>
          <button
            onClick={handleManualRefresh}
            style={{
              padding: '6px 12px',
              background: 'var(--card-alt)',
              border: 'var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh Now
          </button>
        </div>
      </div>

      {/* Status Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          padding: '12px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ 
            fontSize: '20px', 
            fontWeight: 600, 
            color: stats.isConnected ? 'var(--accent)' : 'var(--text-muted)',
            marginBottom: '4px'
          }}>
            {stats.isConnected ? '🟢' : '🔴'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {stats.isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        
        <div style={{
          padding: '12px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
            {stats.totalChanges}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Changes Detected
          </div>
        </div>
        
        <div style={{
          padding: '12px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent)', marginBottom: '4px' }}>
            {stats.filesChanged.size}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Files Changed
          </div>
        </div>
      </div>

      {/* Recent Changes */}
      {stats.filesChanged.size > 0 && (
        <div style={{
          padding: '12px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          maxHeight: '150px',
          overflowY: 'auto'
        }}>
          <div style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: 'var(--text)', 
            marginBottom: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Recent Changes</span>
            <button
              onClick={clearStats}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Array.from(stats.filesChanged).slice(-10).reverse().map((file, index) => (
              <div
                key={index}
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  fontFamily: 'monospace',
                  padding: '4px 8px',
                  background: 'var(--card-bg)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                title={file}
              >
                {file}
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.lastChange && (
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '12px',
          textAlign: 'center'
        }}>
          Last change: {new Date(stats.lastChange).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}

