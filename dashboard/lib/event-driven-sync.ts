/**
 * 🖖 Event-Driven Cross-Server Sync
 * 
 * Replaces polling with WebSocket-based event-driven architecture
 * Updates only on actual changes (not every 2 seconds)
 * 
 * DDD-Compliant: Client => WebSocket => Live Server => n8n => Supabase
 * 
 * Reviewed by: Commander Riker (Tactical) & Quark (Business Optimization)
 */

import { io, Socket } from 'socket.io-client';
import { getEnvironmentConfig, getTargetServerUrl, getCurrentServerUrl } from './environment-config';

// Fix React import issue
let React: any = null;
if (typeof window !== 'undefined') {
  try {
    React = require('react');
  } catch {
    // React not available
  }
}

const DASHBOARD_PORT = 3000;
const LIVE_SERVER_PORT = 3001;

export interface SyncUpdate {
  projectId: string;
  field: string;
  value: any;
  timestamp: number;
  source: 'dashboard' | 'live';
  version?: number;
}

export interface SyncStatus {
  connected: boolean;
  lastSync: number | null;
  syncCount: number;
  errors: number;
  connectionType: 'websocket' | 'polling' | 'disconnected';
  targetUrl?: string;
}

class EventDrivenSync {
  private dashboardUrl: string;
  private liveServerUrl: string;
  private socket: Socket | null = null;
  private syncStatus: SyncStatus = {
    connected: false,
    lastSync: null,
    syncCount: 0,
    errors: 0,
    connectionType: 'disconnected',
  };
  private listeners: Map<string, Set<(update: SyncUpdate) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private pollingFallback: NodeJS.Timeout | null = null;

  constructor() {
    // Use environment-aware configuration
    const config = getEnvironmentConfig();
    
    this.dashboardUrl = config.dashboardUrl;
    this.liveServerUrl = config.liveServerUrl;
    
    console.log(`🔧 Event-Driven Sync initialized:`);
    console.log(`   Environment: ${config.isProduction ? 'production (EC2)' : 'development (local macOS)'}`);
    console.log(`   Dashboard: ${this.dashboardUrl}`);
    console.log(`   Live Server: ${this.liveServerUrl}`);
    console.log(`   Socket Path: ${config.socketPath}`);
  }

  /**
   * Start event-driven sync (WebSocket with polling fallback)
   */
  async startSync(): Promise<void> {
    try {
      // Try WebSocket first
      await this.connectWebSocket();
      
      // If WebSocket fails, fall back to polling
      if (!this.socket?.connected) {
        console.warn('⚠️  WebSocket unavailable, using polling fallback');
        this.startPollingFallback();
      }
    } catch (error) {
      console.error('❌ Failed to start sync:', error);
      this.startPollingFallback();
    }
  }

  /**
   * Connect via WebSocket (event-driven)
   */
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Get target server URL (environment-aware)
      const config = getEnvironmentConfig();
      const targetUrl = getTargetServerUrl();

      console.log(`🔌 Connecting to: ${targetUrl}${config.socketPath}`);

      this.socket = io(targetUrl, {
        path: config.socketPath,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 5000,
        // Support both local and production
        forceNew: false,
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('✅ WebSocket connected');
        this.syncStatus.connected = true;
        this.syncStatus.connectionType = 'websocket';
        this.reconnectAttempts = 0;
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('⚠️  WebSocket disconnected');
        this.syncStatus.connected = false;
        this.syncStatus.connectionType = 'disconnected';
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ WebSocket connection error:', error);
        this.syncStatus.errors++;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(error);
        }
      });

      // Listen for project updates (event-driven)
      this.socket.on('project:updated', (update: SyncUpdate) => {
        this.handleUpdate(update);
      });

      // Connection status
      this.socket.on('sync:status', (status: any) => {
        console.log('📊 Sync status:', status);
      });

      // Error handling
      this.socket.on('error', (error: any) => {
        console.error('❌ WebSocket error:', error);
        this.syncStatus.errors++;
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('WebSocket connection timeout'));
        }
      }, 5000);
    });
  }

  /**
   * Polling fallback (only if WebSocket fails)
   */
  private startPollingFallback(): void {
    if (this.pollingFallback) {
      return; // Already running
    }

    console.log('🔄 Starting polling fallback');
    this.syncStatus.connectionType = 'polling';
    this.syncStatus.connected = true;

    this.pollingFallback = setInterval(async () => {
      await this.pollForUpdates();
    }, 2000); // Poll every 2 seconds (fallback only)
  }

  /**
   * Poll for updates (fallback method)
   */
  private async pollForUpdates(): Promise<void> {
    try {
      const response = await fetch(`${this.dashboardUrl}/api/sync/pending`);
      if (response.ok) {
        const updates: SyncUpdate[] = await response.json();
        updates.forEach(update => this.handleUpdate(update));
      }
    } catch (error) {
      console.error('❌ Polling error:', error);
      this.syncStatus.errors++;
    }
  }

  /**
   * Send update via WebSocket (event-driven)
   */
  async sendUpdate(update: SyncUpdate): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        // Use WebSocket (event-driven)
        this.socket.emit('project:update', update);
        this.syncStatus.syncCount++;
        this.syncStatus.lastSync = Date.now();
        this.notifyListeners(update);
        return true;
      } else {
        // Fallback to API call
        return await this.sendUpdateViaAPI(update);
      }
    } catch (error) {
      console.error('❌ Send update error:', error);
      this.syncStatus.errors++;
      return false;
    }
  }

  /**
   * Send update via API (fallback)
   */
  private async sendUpdateViaAPI(update: SyncUpdate): Promise<boolean> {
    try {
      const response = await fetch(`${this.liveServerUrl}/api/sync/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });

      if (response.ok) {
        this.syncStatus.syncCount++;
        this.syncStatus.lastSync = Date.now();
        this.notifyListeners(update);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ API update error:', error);
      return false;
    }
  }

  /**
   * Handle incoming update
   */
  private handleUpdate(update: SyncUpdate): void {
    this.syncStatus.syncCount++;
    this.syncStatus.lastSync = Date.now();
    this.notifyListeners(update);
  }

  /**
   * Stop syncing
   */
  stopSync(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    if (this.pollingFallback) {
      clearInterval(this.pollingFallback);
      this.pollingFallback = null;
    }

    this.syncStatus.connected = false;
    this.syncStatus.connectionType = 'disconnected';
    console.log('🛑 Sync stopped');
  }

  /**
   * Get current status
   */
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Subscribe to updates
   */
  onUpdate(projectId: string, callback: (update: SyncUpdate) => void): () => void {
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Set());
    }
    this.listeners.get(projectId)!.add(callback);

    return () => {
      const callbacks = this.listeners.get(projectId);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(update: SyncUpdate): void {
    const callbacks = this.listeners.get(update.projectId);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('❌ Listener error:', error);
        }
      });
    }
  }
}

// Singleton instance
let syncInstance: EventDrivenSync | null = null;

export function getEventDrivenSync(): EventDrivenSync {
  if (!syncInstance) {
    syncInstance = new EventDrivenSync();
  }
  return syncInstance;
}

/**
 * React hook for event-driven sync
 */
export function useEventDrivenSync(projectId: string) {
  if (!React) {
    throw new Error('React is required for useEventDrivenSync. Import React in your component file.');
  }

  const [status, setStatus] = React.useState<SyncStatus>({
    connected: false,
    lastSync: null,
    syncCount: 0,
    errors: 0,
    connectionType: 'disconnected',
  });

  React.useEffect(() => {
    const sync = getEventDrivenSync();
    
    // Update status periodically
    const statusInterval = setInterval(() => {
      setStatus(sync.getStatus());
    }, 1000);

    // Subscribe to updates
    const unsubscribe = sync.onUpdate(projectId, (update) => {
      console.log('📡 Event-driven update received:', update);
      setStatus(sync.getStatus());
    });

    return () => {
      clearInterval(statusInterval);
      unsubscribe();
    };
  }, [projectId]);

  return {
    status,
    startSync: () => sync.startSync(),
    stopSync: () => sync.stopSync(),
    sendUpdate: (update: Omit<SyncUpdate, 'timestamp' | 'source'>) => 
      sync.sendUpdate({
        ...update,
        timestamp: Date.now(),
        source: 'dashboard',
      }),
  };
}

// For non-React usage
export const eventDrivenSync = getEventDrivenSync();

