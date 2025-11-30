/**
 * 🖖 State Manager → Event-Driven Sync Integration
 * 
 * Integrates state manager with event-driven sync system
 * Emits WebSocket events only when actual changes occur
 * 
 * DDD-Compliant: State Change => WebSocket Event => Live Server => n8n => Supabase
 */

import { getEventDrivenSync, SyncUpdate } from './event-driven-sync';

let syncInstance: ReturnType<typeof getEventDrivenSync> | null = null;

/**
 * Initialize sync integration
 */
export function initializeStateSync() {
  if (typeof window === 'undefined') {
    return; // Server-side, skip
  }

  syncInstance = getEventDrivenSync();
  console.log('✅ State sync integration initialized');
}

/**
 * Emit sync event when project content changes
 */
export function emitProjectUpdate(projectId: string, field: string, value: any) {
  if (!syncInstance) {
    initializeStateSync();
    syncInstance = getEventDrivenSync();
  }

  const update: SyncUpdate = {
    projectId,
    field,
    value,
    timestamp: Date.now(),
    source: 'dashboard',
  };

  // Emit via WebSocket (event-driven, not polling)
  syncInstance.sendUpdate(update).catch(error => {
    console.warn('⚠️  Sync update failed (non-blocking):', error);
  });
}

/**
 * Emit sync event when theme changes
 */
export function emitThemeUpdate(projectId: string, themeId: string) {
  emitProjectUpdate(projectId, 'theme', themeId);
}

/**
 * Emit sync event when component changes
 */
export function emitComponentUpdate(projectId: string, componentId: string, changes: any) {
  emitProjectUpdate(projectId, `component:${componentId}`, changes);
}

/**
 * Get sync status
 */
export function getSyncStatus() {
  if (!syncInstance) {
    return {
      connected: false,
      lastSync: null,
      syncCount: 0,
      errors: 0,
      connectionType: 'disconnected' as const,
    };
  }

  return syncInstance.getStatus();
}

/**
 * Start sync (called from UI)
 */
export async function startStateSync() {
  if (!syncInstance) {
    initializeStateSync();
    syncInstance = getEventDrivenSync();
  }

  try {
    await syncInstance.startSync();
    console.log('✅ State sync started');
  } catch (error) {
    console.error('❌ Failed to start state sync:', error);
    throw error;
  }
}

/**
 * Stop sync (called from UI)
 */
export function stopStateSync() {
  if (syncInstance) {
    syncInstance.stopSync();
    console.log('🛑 State sync stopped');
  }
}

