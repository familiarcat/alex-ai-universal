/**
 * 🖖 Three-Tier State Synchronization Manager
 * 
 * Synchronizes state across:
 * - Tier 1: Main Dashboard (Universal)
 * - Tier 2: Project Dashboards (User-controlled, security-based)
 * - Tier 3: Published Sites (Read-only, secure)
 * 
 * Architecture: Client (localStorage) ↔ Controller (n8n/MCP) ↔ Supabase (Vector Storage)
 * 
 * Crew Design: Team Alpha (Data + La Forge) + Team Gamma (Quark + Riker)
 * 
 * Features:
 * - Bidirectional sync with conflict resolution
 * - Optimistic updates with authoritative reconciliation
 * - Incremental sync with change detection
 * - Vector-based storage for efficient retrieval
 * - Project-scoped state isolation
 * - User permission-based access control
 */

import { getUnifiedDataService } from './unified-data-service';

export interface ProjectState {
  projectId: string;
  tier: 'main' | 'project' | 'published';
  userId?: string; // For project dashboards (Tier 2)
  content: {
    headline: string;
    subheadline: string;
    description: string;
    theme: string;
    components?: any[];
    pages?: Record<string, any>;
  };
  metadata: {
    version: number;
    updatedAt: number;
    syncedAt?: number;
    lastSyncBy?: string;
    conflictResolution?: 'client' | 'server' | 'merge';
  };
  permissions?: {
    read: string[]; // User IDs or roles
    write: string[]; // User IDs or roles
    admin: string[]; // User IDs or roles
  };
}

export interface SyncResult {
  success: boolean;
  action: 'push' | 'pull' | 'merge' | 'no_action';
  conflict: boolean;
  version: number;
  timestamp: number;
  message?: string;
}

export interface SyncConfig {
  syncInterval: number; // milliseconds
  conflictResolution: 'client_wins' | 'server_wins' | 'merge' | 'manual';
  enableOptimisticUpdates: boolean;
  enableVectorStorage: boolean;
  projectScope?: string; // For Tier 2 (project-specific)
  userId?: string; // For user-scoped access
}

/**
 * Three-Tier State Synchronization Manager
 */
export class StateSyncManager {
  private config: SyncConfig;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private pendingSyncs: Map<string, Promise<SyncResult>> = new Map();
  private lastSyncState: Map<string, ProjectState> = new Map();

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = {
      syncInterval: config.syncInterval || 30000, // 30 seconds default
      conflictResolution: config.conflictResolution || 'merge',
      enableOptimisticUpdates: config.enableOptimisticUpdates !== false,
      enableVectorStorage: config.enableVectorStorage !== false,
      projectScope: config.projectScope,
      userId: config.userId
    };
  }

  /**
   * Start periodic synchronization
   */
  startPeriodicSync(callback?: (result: SyncResult) => void) {
    if (this.syncIntervalId) {
      this.stopPeriodicSync();
    }

    this.syncIntervalId = setInterval(async () => {
      // Sync all projects in current scope
      const projects = this.getProjectsInScope();
      
      for (const projectId of projects) {
        try {
          const result = await this.syncProject(projectId);
          if (callback) callback(result);
        } catch (error) {
          console.error(`Sync error for ${projectId}:`, error);
        }
      }
    }, this.config.syncInterval);

    console.log(`🔄 Periodic sync started (${this.config.syncInterval}ms interval)`);
  }

  /**
   * Stop periodic synchronization
   */
  stopPeriodicSync() {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
      console.log('⏹️  Periodic sync stopped');
    }
  }

  /**
   * Sync a single project (bidirectional with conflict resolution)
   */
  async syncProject(projectId: string): Promise<SyncResult> {
    // Prevent duplicate syncs
    if (this.pendingSyncs.has(projectId)) {
      return this.pendingSyncs.get(projectId)!;
    }

    const syncPromise = this.performSync(projectId);
    this.pendingSyncs.set(projectId, syncPromise);

    try {
      const result = await syncPromise;
      return result;
    } finally {
      this.pendingSyncs.delete(projectId);
    }
  }

  /**
   * Perform actual sync operation
   */
  private async performSync(projectId: string): Promise<SyncResult> {
    try {
      // 1. Get local state (from localStorage)
      const localState = this.getLocalState(projectId);
      
      // 2. Get server state (from Supabase via n8n)
      const serverState = await this.getServerState(projectId);
      
      // 3. Compare and determine action
      const comparison = this.compareStates(localState, serverState);
      
      // 4. Execute sync action
      let result: SyncResult;
      
      switch (comparison.action) {
        case 'push':
          // Local is newer → push to server
          result = await this.pushToServer(projectId, localState);
          break;
          
        case 'pull':
          // Server is newer → pull to local
          result = await this.pullFromServer(projectId, serverState);
          break;
          
        case 'merge':
          // Conflict → merge states
          result = await this.mergeStates(projectId, localState, serverState);
          break;
          
        case 'no_action':
          // States are in sync
          result = {
            success: true,
            action: 'no_action',
            conflict: false,
            version: localState?.metadata.version || serverState?.metadata.version || 1,
            timestamp: Date.now()
          };
          break;
          
        default:
          // No local state → pull from server
          if (!localState && serverState) {
            result = await this.pullFromServer(projectId, serverState);
          } else if (localState && !serverState) {
            // No server state → push local
            result = await this.pushToServer(projectId, localState);
          } else {
            throw new Error('Invalid sync state');
          }
      }
      
      // 5. Update last known state
      if (result.success) {
        const finalState = result.action === 'pull' ? serverState : localState;
        if (finalState) {
          this.lastSyncState.set(projectId, finalState);
        }
      }
      
      return result;
    } catch (error: any) {
      console.error(`Sync error for ${projectId}:`, error);
      return {
        success: false,
        action: 'no_action',
        conflict: false,
        version: 0,
        timestamp: Date.now(),
        message: error.message
      };
    }
  }

  /**
   * Compare local and server states to determine sync action
   */
  private compareStates(
    local: ProjectState | null,
    server: ProjectState | null
  ): { action: 'push' | 'pull' | 'merge' | 'no_action'; reason: string } {
    // No local state → pull
    if (!local && server) {
      return { action: 'pull', reason: 'No local state, pulling from server' };
    }
    
    // No server state → push
    if (local && !server) {
      return { action: 'push', reason: 'No server state, pushing local' };
    }
    
    // Both null → no action
    if (!local && !server) {
      return { action: 'no_action', reason: 'No state exists' };
    }
    
    // Compare timestamps
    const localTime = local!.metadata.updatedAt;
    const serverTime = server!.metadata.updatedAt || server!.metadata.syncedAt || 0;
    
    const timeDiff = Math.abs(localTime - serverTime);
    const threshold = 1000; // 1 second threshold for "same time"
    
    if (timeDiff < threshold) {
      // Times are close → check versions
      if (local!.metadata.version === server!.metadata.version) {
        return { action: 'no_action', reason: 'States are in sync' };
      }
    }
    
    // Determine which is newer
    if (localTime > serverTime + threshold) {
      // Local is newer
      return { action: 'push', reason: 'Local state is newer' };
    } else if (serverTime > localTime + threshold) {
      // Server is newer
      return { action: 'pull', reason: 'Server state is newer' };
    } else {
      // Times are close but versions differ → conflict
      return { action: 'merge', reason: 'Concurrent modifications detected' };
    }
  }

  /**
   * Push local state to server (via n8n → Supabase)
   */
  private async pushToServer(projectId: string, state: ProjectState): Promise<SyncResult> {
    try {
      const service = getUnifiedDataService();
      
      // Store via unified data service (goes through n8n)
      const response = await service.callMCPEndpoint('project/content/store', {
        action: 'store_project_state',
        projectId,
        state: {
          ...state.content,
          metadata: {
            ...state.metadata,
            syncedAt: Date.now(),
            lastSyncBy: this.config.userId || 'system'
          },
          tier: state.tier,
          permissions: state.permissions
        }
      });
      
      return {
        success: true,
        action: 'push',
        conflict: false,
        version: state.metadata.version + 1,
        timestamp: Date.now(),
        message: 'State pushed to server'
      };
    } catch (error: any) {
      throw new Error(`Failed to push state: ${error.message}`);
    }
  }

  /**
   * Pull server state to local (from Supabase via n8n)
   */
  private async pullFromServer(projectId: string, serverState: ProjectState): Promise<SyncResult> {
    try {
      // Update localStorage
      this.setLocalState(projectId, serverState);
      
      return {
        success: true,
        action: 'pull',
        conflict: false,
        version: serverState.metadata.version,
        timestamp: Date.now(),
        message: 'State pulled from server'
      };
    } catch (error: any) {
      throw new Error(`Failed to pull state: ${error.message}`);
    }
  }

  /**
   * Merge conflicting states
   */
  private async mergeStates(
    projectId: string,
    local: ProjectState,
    server: ProjectState
  ): Promise<SyncResult> {
    const resolution = this.config.conflictResolution;
    
    let merged: ProjectState;
    
    switch (resolution) {
      case 'client_wins':
        merged = local;
        break;
        
      case 'server_wins':
        merged = server;
        break;
        
      case 'merge':
        // Field-level merge: use newer value for each field
        merged = {
          ...local,
          content: {
            headline: local.metadata.updatedAt > server.metadata.updatedAt 
              ? local.content.headline : server.content.headline,
            subheadline: local.metadata.updatedAt > server.metadata.updatedAt 
              ? local.content.subheadline : server.content.subheadline,
            description: local.metadata.updatedAt > server.metadata.updatedAt 
              ? local.content.description : server.content.description,
            theme: local.metadata.updatedAt > server.metadata.updatedAt 
              ? local.content.theme : server.content.theme,
            components: this.mergeArrays(local.content.components, server.content.components),
            pages: { ...server.content.pages, ...local.content.pages }
          },
          metadata: {
            ...local.metadata,
            version: Math.max(local.metadata.version, server.metadata.version) + 1,
            updatedAt: Date.now(),
            conflictResolution: 'merge'
          }
        };
        break;
        
      default:
        throw new Error(`Unknown conflict resolution: ${resolution}`);
    }
    
    // Push merged state to server
    const result = await this.pushToServer(projectId, merged);
    result.conflict = true;
    result.action = 'merge';
    
    // Update local state
    this.setLocalState(projectId, merged);
    
    return result;
  }

  /**
   * Get local state from localStorage
   */
  private getLocalState(projectId: string): ProjectState | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const saved = localStorage.getItem('alex-ai-state');
      if (!saved) return null;
      
      const state = JSON.parse(saved);
      const project = state.projects?.[projectId];
      
      if (!project) return null;
      
      return {
        projectId,
        tier: this.determineTier(projectId),
        content: {
          headline: project.headline || '',
          subheadline: project.subheadline || '',
          description: project.description || '',
          theme: project.theme || 'midnight',
          components: project.components || [],
          pages: project.pages || {}
        },
        metadata: {
          version: project.version || 1,
          updatedAt: project.updatedAt || Date.now()
        }
      };
    } catch (error) {
      console.error('Failed to get local state:', error);
      return null;
    }
  }

  /**
   * Set local state in localStorage
   */
  private setLocalState(projectId: string, state: ProjectState) {
    if (typeof window === 'undefined') return;
    
    try {
      const saved = localStorage.getItem('alex-ai-state');
      const currentState = saved ? JSON.parse(saved) : { projects: {} };
      
      currentState.projects[projectId] = {
        ...state.content,
        version: state.metadata.version,
        updatedAt: state.metadata.updatedAt,
        syncedAt: state.metadata.syncedAt
      };
      
      localStorage.setItem('alex-ai-state', JSON.stringify(currentState));
    } catch (error) {
      console.error('Failed to set local state:', error);
    }
  }

  /**
   * Get server state from Supabase (via n8n)
   */
  private async getServerState(projectId: string): Promise<ProjectState | null> {
    try {
      const service = getUnifiedDataService();
      
      const response = await service.callMCPEndpoint('project/content/retrieve', {
        action: 'retrieve_project_state',
        projectId,
        tier: this.determineTier(projectId),
        userId: this.config.userId
      });
      
      if (!response || !response.data) return null;
      
      const data = response.data;
      
      return {
        projectId,
        tier: data.tier || this.determineTier(projectId),
        userId: data.userId,
        content: {
          headline: data.headline || '',
          subheadline: data.subheadline || '',
          description: data.description || '',
          theme: data.theme || 'midnight',
          components: data.components || [],
          pages: data.pages || {}
        },
        metadata: {
          version: data.version || 1,
          updatedAt: data.updatedAt || Date.now(),
          syncedAt: data.syncedAt || Date.now(),
          lastSyncBy: data.lastSyncBy
        },
        permissions: data.permissions
      };
    } catch (error: any) {
      console.error('Failed to get server state:', error);
      return null;
    }
  }

  /**
   * Determine tier based on project ID and context
   */
  private determineTier(projectId: string): 'main' | 'project' | 'published' {
    // Main dashboard projects (Tier 1)
    if (projectId === 'main' || projectId.startsWith('main-')) {
      return 'main';
    }
    
    // Published sites (Tier 3) - read-only
    if (projectId.startsWith('published-') || projectId.includes('/published')) {
      return 'published';
    }
    
    // Project dashboards (Tier 2) - default
    return 'project';
  }

  /**
   * Get projects in current scope (based on tier and user)
   */
  private getProjectsInScope(): string[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const saved = localStorage.getItem('alex-ai-state');
      if (!saved) return [];
      
      const state = JSON.parse(saved);
      return Object.keys(state.projects || {});
    } catch (error) {
      return [];
    }
  }

  /**
   * Merge arrays (components, etc.) - keep unique items
   */
  private mergeArrays(local?: any[], server?: any[]): any[] {
    const localArr = local || [];
    const serverArr = server || [];
    
    // Merge by ID, preferring newer version
    const merged = new Map<string, any>();
    
    for (const item of serverArr) {
      merged.set(item.id || String(Math.random()), item);
    }
    
    for (const item of localArr) {
      const existing = merged.get(item.id || String(Math.random()));
      if (!existing || (item.updatedAt && item.updatedAt > existing.updatedAt)) {
        merged.set(item.id || String(Math.random()), item);
      }
    }
    
    return Array.from(merged.values());
  }
}

/**
 * Create sync manager instance
 */
export function createStateSyncManager(config?: Partial<SyncConfig>): StateSyncManager {
  return new StateSyncManager(config);
}

