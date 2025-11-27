import React, { useState, useEffect } from 'react';

const SyncToggle = ({ environment, onSyncChange }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('disconnected');
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [syncCount, setSyncCount] = useState(0);
  const [syncHistory, setSyncHistory] = useState([]);

  // Troi's decision: Use WebSocket events instead of polling
  // Only poll if WebSocket is not available (true fallback)
  useEffect(() => {
    if (!isSyncing) return; // Don't poll if sync is disabled
    
    // Check if WebSocket is available (from event-driven sync)
    const checkWebSocket = () => {
      // Try to get WebSocket connection status from event-driven sync
      if (typeof window !== 'undefined' && window.eventDrivenSync) {
        const status = window.eventDrivenSync.getStatus();
        if (status.connected && status.connectionType === 'websocket') {
          // WebSocket is connected - don't poll
          return false;
        }
      }
      return true; // WebSocket not available, use polling as fallback
    };

    // Only poll if WebSocket is not available
    if (!checkWebSocket()) {
      return; // WebSocket is connected, no polling needed
    }

    // Fallback polling (only if WebSocket unavailable)
    const syncInterval = setInterval(async () => {
      if (!isSyncing) return;
      
      // Check WebSocket again before polling
      if (!checkWebSocket()) {
        clearInterval(syncInterval);
        return; // WebSocket now available, stop polling
      }
      
      try {
        const response = await fetch('/api/sync-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            environment,
            timestamp: new Date().toISOString(),
            action: 'sync_check'
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSyncStatus(data.status);
          setLastSyncTime(new Date().toISOString());
          setSyncCount(prev => prev + 1);
          
          // Add to sync history (limit to prevent memory issues)
          setSyncHistory(prev => [
            ...prev.slice(-9), // Keep last 10 entries
            {
              timestamp: new Date().toISOString(),
              status: data.status,
              environment,
              action: 'sync_check'
            }
          ]);

          // Notify parent component
          if (onSyncChange) {
            onSyncChange({
              environment,
              status: data.status,
              timestamp: new Date().toISOString(),
              count: syncCount + 1
            });
          }
        }
      } catch (error) {
        console.error('Sync check failed:', error);
        setSyncStatus('error');
      }
    }, 5000); // Poll every 5 seconds (slower when WebSocket unavailable)

    return () => clearInterval(syncInterval);
  }, [isSyncing, environment]); // Removed syncCount and onSyncChange from deps to prevent loops

  const toggleSync = async () => {
    const newSyncState = !isSyncing;
    setIsSyncing(newSyncState);
    
    if (newSyncState) {
      setSyncStatus('connecting');
      setSyncCount(0);
      setSyncHistory([]);
      
      // Notify the other environment about sync start
      try {
        await fetch('/api/sync-toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            environment,
            action: 'start_sync',
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Failed to notify sync start:', error);
      }
    } else {
      setSyncStatus('disconnected');
      
      // Notify the other environment about sync stop
      try {
        await fetch('/api/sync-toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            environment,
            action: 'stop_sync',
            timestamp: new Date().toISOString()
          })
        });
      } catch (error) {
        console.error('Failed to notify sync stop:', error);
      }
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  return (
    <div className="sync-toggle-container bg-gray-800 rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">
          🔄 Real-Time Sync Toggle
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">Environment:</span>
          <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
            {environment}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Sync Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Status:</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusIcon()} {syncStatus.toUpperCase()}
            </span>
          </div>
          <button
            onClick={toggleSync}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isSyncing
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {isSyncing ? '🛑 Stop Sync' : '🔄 Start Sync'}
          </button>
        </div>

        {/* Sync Statistics */}
        {isSyncing && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-700 rounded p-3">
              <div className="text-sm text-gray-300">Sync Count</div>
              <div className="text-xl font-bold text-white">{syncCount}</div>
            </div>
            <div className="bg-gray-700 rounded p-3">
              <div className="text-sm text-gray-300">Last Sync</div>
              <div className="text-sm text-white">
                {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        )}

        {/* Sync History */}
        {isSyncing && syncHistory.length > 0 && (
          <div className="bg-gray-700 rounded p-3">
            <div className="text-sm text-gray-300 mb-2">Recent Sync Activity</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {syncHistory.slice(-5).reverse().map((entry, index) => (
                <div key={index} className="text-xs text-gray-400 flex justify-between">
                  <span>{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  <span className={getStatusColor()}>{entry.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Environment Indicator */}
        <div className="text-center">
          <div className="text-xs text-gray-400">
            {environment === 'local' ? '🏠 Local Environment' : '☁️ Deployed Environment'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncToggle;
