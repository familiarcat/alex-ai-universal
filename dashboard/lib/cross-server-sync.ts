/**
 * 🖖 Cross-Server Real-Time Sync System
 * 
 * Enables secure, real-time updates between:
 * - Dashboard Server (Port 3000) - Editing interface
 * - Live Project Server (Port 3001) - Live preview/display
 * 
 * Architecture:
 * Dashboard (3000) => API Call => Live Server (3001) => Update Display
 * 
 * This POC demonstrates how the dashboard can create and monitor
 * separate "project" websites with real-time updates.
 */

const DASHBOARD_PORT = 3000;
const LIVE_SERVER_PORT = 3001;
const SYNC_INTERVAL = 2000; // 2 seconds

export interface SyncUpdate {
  projectId: string;
  field: string;
  value: any;
  timestamp: number;
  source: 'dashboard' | 'live';
}

export interface SyncStatus {
  connected: boolean;
  lastSync: number | null;
  syncCount: number;
  errors: number;
}

class CrossServerSync {
  private dashboardUrl: string;
  private liveServerUrl: string;
  private syncStatus: SyncStatus = {
    connected: false,
    lastSync: null,
    syncCount: 0,
    errors: 0
  };
  private listeners: Map<string, Set<(update: SyncUpdate) => void>> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Determine which server we're on
    const isDashboard = typeof window !== 'undefined' && 
      (window.location.port === String(DASHBOARD_PORT) || 
       window.location.hostname === 'localhost' && !window.location.port);
    
    this.dashboardUrl = `http://localhost:${DASHBOARD_PORT}`;
    this.liveServerUrl = `http://localhost:${LIVE_SERVER_PORT}`;
  }

  /**
   * Start syncing updates from dashboard to live server
   */
  async startSync(): Promise<void> {
    if (this.syncInterval) {
      return; // Already running
    }

    try {
      // Test connection to both servers
      const dashboardAlive = await this.checkServer(this.dashboardUrl);
      const liveServerAlive = await this.checkServer(this.liveServerUrl);

      if (!dashboardAlive || !liveServerAlive) {
        throw new Error('One or both servers are not responding');
      }

      this.syncStatus.connected = true;
      this.syncStatus.lastSync = Date.now();

      // Start polling for updates
      this.syncInterval = setInterval(() => {
        this.syncUpdates();
      }, SYNC_INTERVAL);

      console.log('✅ Cross-server sync started');
    } catch (error) {
      console.error('❌ Failed to start sync:', error);
      this.syncStatus.errors++;
      throw error;
    }
  }

  /**
   * Stop syncing
   */
  stopSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.syncStatus.connected = false;
    console.log('🛑 Cross-server sync stopped');
  }

  /**
   * Send update from dashboard to live server
   */
  async sendUpdate(update: SyncUpdate): Promise<boolean> {
    try {
      const response = await fetch(`${this.liveServerUrl}/api/sync/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.syncStatus.syncCount++;
        this.syncStatus.lastSync = Date.now();
        this.notifyListeners(update);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Sync update failed:', error);
      this.syncStatus.errors++;
      return false;
    }
  }

  /**
   * Get current sync status
   */
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Subscribe to sync updates
   */
  onUpdate(projectId: string, callback: (update: SyncUpdate) => void): () => void {
    if (!this.listeners.has(projectId)) {
      this.listeners.set(projectId, new Set());
    }
    this.listeners.get(projectId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(projectId);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Check if server is alive
   */
  private async checkServer(url: string): Promise<boolean> {
    try {
      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Sync updates between servers
   */
  private async syncUpdates(): Promise<void> {
    try {
      // Get latest updates from dashboard
      const response = await fetch(`${this.dashboardUrl}/api/sync/pending`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const updates: SyncUpdate[] = await response.json();
        
        // Send each update to live server
        for (const update of updates) {
          await this.sendUpdate(update);
        }

        this.syncStatus.lastSync = Date.now();
      }
    } catch (error) {
      console.error('❌ Sync check failed:', error);
      this.syncStatus.errors++;
    }
  }

  /**
   * Notify listeners of update
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
let syncInstance: CrossServerSync | null = null;

export function getCrossServerSync(): CrossServerSync {
  if (!syncInstance) {
    syncInstance = new CrossServerSync();
  }
  return syncInstance;
}

/**
 * React hook for cross-server sync
 * Note: Import React in the component file, not here
 */
export function createUseCrossServerSync(React: any) {
  return function useCrossServerSync(projectId: string) {
    const [status, setStatus] = React.useState<SyncStatus>({
      connected: false,
      lastSync: null,
      syncCount: 0,
      errors: 0,
    });

    React.useEffect(() => {
      const sync = getCrossServerSync();
      
      // Update status periodically
      const statusInterval = setInterval(() => {
        setStatus(sync.getStatus());
      }, 1000);

      // Subscribe to updates
      const unsubscribe = sync.onUpdate(projectId, (update) => {
        console.log('📡 Sync update received:', update);
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
  };
}

// For non-React usage
export const crossServerSync = getCrossServerSync();

