/**
 * 🖖 STATE SYNCHRONIZATION SYSTEM
 * 
 * Coordinates sync between in-memory state and Supabase using timestamp comparison.
 * Implements conflict resolution, periodic sync, and event-driven sync.
 * 
 * Reviewed by: Commander Data (Synchronization Logic) & Lt. Cmdr. La Forge (Infrastructure)
 */

class StateSyncManager {
  constructor(supabase, projectState, log) {
    this.supabase = supabase;
    this.projectState = projectState;
    this.log = log;
    
    // Sync configuration
    this.syncInterval = 30000; // 30 seconds
    this.syncTimer = null;
    this.isSyncing = false;
    this.lastSyncTime = null;
    
    // Sync statistics
    this.stats = {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      conflictsResolved: 0,
      lastSyncDuration: 0
    };
  }

  /**
   * Compare timestamps to determine which state is newer
   * Returns: 'memory' | 'supabase' | 'equal' | 'conflict'
   */
  compareTimestamps(memoryState, supabaseState) {
    if (!memoryState || !supabaseState) {
      return memoryState ? 'memory' : 'supabase';
    }

    // Convert Supabase synced_at (TIMESTAMPTZ) to milliseconds for comparison
    const supabaseTime = new Date(supabaseState.synced_at).getTime();
    const memoryTime = memoryState.updatedAt || 0;
    
    // Also check version numbers as tiebreaker
    const memoryVersion = memoryState.version || 0;
    const supabaseVersion = supabaseState.version || 0;

    // If times are very close (< 1 second), use version as tiebreaker
    const timeDiff = Math.abs(memoryTime - supabaseTime);
    
    if (timeDiff < 1000) {
      // Times are essentially equal, use version
      if (memoryVersion > supabaseVersion) return 'memory';
      if (supabaseVersion > memoryVersion) return 'supabase';
      return 'equal';
    }

    // Use timestamp comparison
    if (memoryTime > supabaseTime) return 'memory';
    if (supabaseTime > memoryTime) return 'supabase';
    return 'equal';
  }

  /**
   * Merge two states intelligently (field-level conflict resolution)
   */
  mergeStates(memoryState, supabaseState) {
    const merged = { ...memoryState };
    
    // For each field, choose the newer value
    const fields = ['headline', 'subheadline', 'description', 'theme'];
    
    fields.forEach(field => {
      const memoryTime = memoryState.fieldTimestamps?.[field] || memoryState.updatedAt || 0;
      const supabaseTime = new Date(supabaseState.synced_at).getTime();
      
      // Use the newer value for each field
      if (supabaseTime > memoryTime && supabaseState[field] !== undefined) {
        merged[field] = supabaseState[field];
      }
    });
    
    // Use the latest timestamp and version
    merged.updatedAt = Math.max(
      memoryState.updatedAt || 0,
      new Date(supabaseState.synced_at).getTime()
    );
    merged.version = Math.max(
      memoryState.version || 0,
      supabaseState.version || 0
    ) + 1; // Increment for merge
    
    return merged;
  }

  /**
   * Sync a single project between memory and Supabase
   */
  async syncProject(projectId) {
    if (!this.supabase) {
      this.log.warn(`Cannot sync ${projectId}: Supabase not available`);
      return { synced: false, reason: 'supabase_unavailable' };
    }

    const memoryProject = this.projectState.projects[projectId];
    if (!memoryProject) {
      this.log.warn(`Cannot sync ${projectId}: Project not found in memory`);
      return { synced: false, reason: 'project_not_found' };
    }

    try {
      // Fetch from Supabase
      const { data: supabaseData, error } = await this.supabase
        .from('project_content')
        .select('*')
        .eq('project_id', projectId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }

      const supabaseProject = supabaseData || null;

      // Prepare memory state with timestamps
      const memoryState = {
        project_id: projectId,
        headline: memoryProject.headline,
        subheadline: memoryProject.subheadline,
        description: memoryProject.description,
        theme: memoryProject.theme,
        updatedAt: memoryProject.updatedAt || Date.now(),
        syncedAt: memoryProject.syncedAt || null,
        version: memoryProject.version || 1
      };

      // Compare timestamps
      const comparison = this.compareTimestamps(memoryState, supabaseProject);

      let result = {
        projectId,
        comparison,
        synced: true,
        action: null,
        conflict: false
      };

      switch (comparison) {
        case 'memory':
          // Memory is newer, push to Supabase
          result.action = 'push_to_supabase';
          await this.pushToSupabase(projectId, memoryState);
          break;

        case 'supabase':
          // Supabase is newer, pull to memory
          result.action = 'pull_from_supabase';
          this.pullFromSupabase(projectId, supabaseProject);
          break;

        case 'equal':
          // States are in sync, no action needed
          result.action = 'no_action';
          break;

        case 'conflict':
          // Conflict detected, merge
          result.action = 'merge';
          result.conflict = true;
          this.stats.conflictsResolved++;
          const merged = this.mergeStates(memoryState, supabaseProject);
          await this.pushToSupabase(projectId, merged);
          this.pullFromSupabase(projectId, merged);
          break;

        default:
          // Supabase doesn't exist, push memory state
          if (!supabaseProject) {
            result.action = 'create_in_supabase';
            await this.pushToSupabase(projectId, memoryState);
          }
      }

      this.log.crew('Data', `Synced ${projectId}: ${result.action} (${comparison})`);
      return result;

    } catch (error) {
      this.log.error(`Sync error for ${projectId}:`, error.message);
      this.stats.failedSyncs++;
      return { synced: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Push memory state to Supabase
   */
  async pushToSupabase(projectId, state) {
    if (!this.supabase) return;

    try {
      const { error } = await this.supabase
        .from('project_content')
        .upsert({
          project_id: projectId,
          headline: state.headline,
          subheadline: state.subheadline,
          description: state.description,
          theme: state.theme,
          updated_at: state.updatedAt,
          synced_at: new Date().toISOString(),
          version: state.version
        }, {
          onConflict: 'project_id'
        });

      if (error) throw error;

      // Update memory state with sync timestamp
      if (this.projectState.projects[projectId]) {
        this.projectState.projects[projectId].syncedAt = new Date().toISOString();
        this.projectState.projects[projectId].version = state.version;
      }

      this.log.crew('Data', `Pushed ${projectId} to Supabase`);
    } catch (error) {
      this.log.error(`Failed to push ${projectId} to Supabase:`, error.message);
      throw error;
    }
  }

  /**
   * Pull Supabase state to memory
   */
  pullFromSupabase(projectId, supabaseState) {
    if (!this.projectState.projects[projectId]) return;

    // Update memory state
    Object.assign(this.projectState.projects[projectId], {
      headline: supabaseState.headline || this.projectState.projects[projectId].headline,
      subheadline: supabaseState.subheadline || this.projectState.projects[projectId].subheadline,
      description: supabaseState.description || this.projectState.projects[projectId].description,
      theme: supabaseState.theme || this.projectState.projects[projectId].theme,
      updatedAt: new Date(supabaseState.synced_at).getTime(),
      syncedAt: supabaseState.synced_at,
      version: supabaseState.version || 1
    });

    this.log.crew('Data', `Pulled ${projectId} from Supabase`);
  }

  /**
   * Sync all projects
   */
  async syncAll() {
    if (this.isSyncing) {
      this.log.warn('Sync already in progress, skipping');
      return;
    }

    this.isSyncing = true;
    const startTime = Date.now();
    this.stats.totalSyncs++;

    try {
      this.log.crew('Data', 'Starting full state sync...');
      
      const projectIds = Object.keys(this.projectState.projects);
      const results = await Promise.all(
        projectIds.map(id => this.syncProject(id))
      );

      const successful = results.filter(r => r.synced).length;
      const failed = results.filter(r => !r.synced).length;
      const conflicts = results.filter(r => r.conflict).length;

      this.stats.successfulSyncs += successful;
      this.stats.failedSyncs += failed;
      this.stats.lastSyncDuration = Date.now() - startTime;
      this.lastSyncTime = new Date().toISOString();

      this.log.success(
        `Sync complete: ${successful} successful, ${failed} failed, ${conflicts} conflicts resolved`
      );

      return {
        successful,
        failed,
        conflicts,
        duration: this.stats.lastSyncDuration,
        results
      };

    } catch (error) {
      this.log.error('Full sync error:', error.message);
      this.stats.failedSyncs++;
      throw error;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync(intervalMs = null) {
    if (this.syncTimer) {
      this.log.warn('Periodic sync already running');
      return;
    }

    const interval = intervalMs || this.syncInterval;
    this.log.crew('Data', `Starting periodic sync (every ${interval/1000}s)`);

    this.syncTimer = setInterval(() => {
      this.syncAll().catch(err => {
        this.log.error('Periodic sync error:', err.message);
      });
    }, interval);
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      this.log.crew('Data', 'Periodic sync stopped');
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      stats: { ...this.stats },
      periodicSyncActive: this.syncTimer !== null,
      syncInterval: this.syncInterval
    };
  }
}

module.exports = StateSyncManager;

