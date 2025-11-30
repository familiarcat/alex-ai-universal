'use client';

/**
 * 🖖 Cross-Server Real-Time Sync Panel
 * 
 * Demonstrates secure, real-time updates between:
 * - Dashboard Server (Port 3000) - Editing interface
 * - Live Project Server (Port 3001) - Live preview/display
 * 
 * This POC shows how the dashboard can create and monitor
 * separate "project" websites with real-time updates.
 */

import React, { useState, useEffect, useRef } from 'react';
import { getCrossServerSync, SyncStatus, SyncUpdate } from '@/lib/cross-server-sync';
import DataStatusBadge, { useDataStatus } from './DataStatusBadge';
import { getUnifiedDataService } from '@/lib/unified-data-service';

export default function CrossServerSyncPanel() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    connected: false,
    lastSync: null,
    syncCount: 0,
    errors: 0,
  });
  const [isStarting, setIsStarting] = useState(false);
  const [updates, setUpdates] = useState<SyncUpdate[]>([]);
  const [currentPort, setCurrentPort] = useState<number | null>(null);
  const [apiSyncStatus, setApiSyncStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const sync = getCrossServerSync();

  // Fetch sync status from API
  // FIXED: Use static import instead of dynamic import to prevent HMR warnings
  // Crew: La Forge (Infrastructure) + Data (Analysis)
  const serviceRef = useRef<ReturnType<typeof getUnifiedDataService> | null>(null);
  
  useEffect(() => {
    // Initialize service once (stable reference for HMR)
    if (!serviceRef.current) {
      serviceRef.current = getUnifiedDataService();
    }
    
    async function fetchSyncStatus() {
      try {
        setLoading(true);
        const service = serviceRef.current!;
        const data = await service.getSyncStatus();
        setApiSyncStatus(data?.data || data);
      } catch (error) {
        console.error('Failed to fetch sync status:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSyncStatus();
    const interval = setInterval(fetchSyncStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Detect current port
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const port = parseInt(window.location.port) || 3000;
      setCurrentPort(port);
    }
  }, []);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncStatus(sync.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Subscribe to updates
  useEffect(() => {
    const unsubscribe = sync.onUpdate('alpha', (update) => {
      setUpdates(prev => [update, ...prev].slice(0, 20)); // Keep last 20
      setSyncStatus(sync.getStatus());
    });

    return unsubscribe;
  }, []);

  const handleStartSync = async () => {
    setIsStarting(true);
    try {
      await sync.startSync();
      setSyncStatus(sync.getStatus());
    } catch (error) {
      console.error('Failed to start sync:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopSync = () => {
    sync.stopSync();
    setSyncStatus(sync.getStatus());
  };

  const handleTestUpdate = async () => {
    const update: Omit<SyncUpdate, 'timestamp' | 'source'> = {
      projectId: 'alpha',
      field: 'headline',
      value: `Test update at ${new Date().toLocaleTimeString()}`,
    };

    const success = await sync.sendUpdate({
      ...update,
      timestamp: Date.now(),
      source: 'dashboard',
    });

    if (success) {
      console.log('✅ Test update sent successfully');
    } else {
      console.error('❌ Test update failed');
    }
  };

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getStatusColor = () => {
    if (syncStatus.connected) return 'text-green-500';
    if (syncStatus.errors > 0) return 'text-red-500';
    return 'text-gray-500';
  };

  const getStatusIcon = () => {
    if (syncStatus.connected) return '🟢';
    if (syncStatus.errors > 0) return '🔴';
    return '⚪';
  };

  const dataStatus = useDataStatus(apiSyncStatus);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700" style={{
      position: 'relative' // For badge positioning
    }}>
      <DataStatusBadge status={dataStatus} position="top-right" />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          🖖 Cross-Server Sync
        </h2>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusIcon()} {syncStatus.connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      <div className="space-y-4">
        {/* Server Info */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Current Server:</strong> Port {currentPort || 'Unknown'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Dashboard:</strong> http://localhost:3000
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Live Server:</strong> http://localhost:3001
          </p>
        </div>

        {/* Sync Controls */}
        <div className="flex gap-2">
          {!syncStatus.connected ? (
            <button
              onClick={handleStartSync}
              disabled={isStarting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? 'Starting...' : '🔄 Start Sync'}
            </button>
          ) : (
            <button
              onClick={handleStopSync}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              🛑 Stop Sync
            </button>
          )}
          <button
            onClick={handleTestUpdate}
            disabled={!syncStatus.connected}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📡 Test Update
          </button>
        </div>

        {/* Sync Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Sync Count</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {syncStatus.syncCount}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Errors</p>
            <p className="text-2xl font-bold text-red-600">
              {syncStatus.errors}
            </p>
          </div>
        </div>

        {/* Last Sync Time */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">Last Sync</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatTime(syncStatus.lastSync)}
          </p>
        </div>

        {/* API Sync Status */}
        {apiSyncStatus && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 border border-green-200 dark:border-green-800">
            <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-2">
              📡 API Sync Status
            </p>
            <div className="space-y-1">
              <p className="text-xs text-green-700 dark:text-green-400">
                Status: <span className="font-medium">{apiSyncStatus.status || 'active'}</span>
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                Enabled: <span className="font-medium">{apiSyncStatus.enabled ? 'Yes' : 'No'}</span>
              </p>
              {apiSyncStatus.servers && apiSyncStatus.servers.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-green-700 dark:text-green-400 mb-1">Servers:</p>
                  {apiSyncStatus.servers.map((server: any, idx: number) => (
                    <p key={idx} className="text-xs text-green-600 dark:text-green-500 ml-2">
                      • {server.name}: {server.status}
                    </p>
                  ))}
                </div>
              )}
              {apiSyncStatus.fallback && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  ⚠️ Using mock data - Supabase table may not exist yet
                </p>
              )}
            </div>
          </div>
        )}
        {loading && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Loading sync status...</p>
          </div>
        )}

        {/* Recent Updates */}
        {updates.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Recent Updates ({updates.length})
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 max-h-40 overflow-y-auto">
              {updates.map((update, index) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span className="font-medium">{update.field}:</span>{' '}
                  <span className="truncate">{String(update.value).substring(0, 50)}</span>
                  <span className="text-gray-400 ml-2">
                    {new Date(update.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Architecture Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">
            🏗️ Architecture
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Dashboard (3000) → API → Live Server (3001) → Update Display
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
            This POC demonstrates how the dashboard can create and monitor separate project websites.
          </p>
        </div>
      </div>
    </div>
  );
}

