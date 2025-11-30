/**
 * Codebase Watcher Service
 * 
 * Monitors file changes across the entire codebase and triggers updates
 * 
 * Reviewed by: Lt. Cmdr. La Forge (Infrastructure) & Commander Data (Efficiency)
 */

const chokidar = require('chokidar');
const path = require('path');
const crypto = require('crypto');

class CodebaseWatcher {
  constructor(options = {}) {
    this.rootDir = options.rootDir || process.cwd();
    this.ignorePatterns = options.ignorePatterns || [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/*.log',
      '**/.DS_Store'
    ];
    this.watcher = null;
    this.changeCallbacks = [];
    this.fileHashes = new Map();
    this.debounceDelay = options.debounceDelay || 1000;
    this.debounceTimers = new Map();
  }

  /**
   * Start watching the codebase
   */
  start() {
    if (this.watcher) {
      console.log('⚠️  Watcher already running');
      return;
    }

    console.log(`👁️  Starting codebase watcher: ${this.rootDir}`);

    this.watcher = chokidar.watch(this.rootDir, {
      ignored: this.ignorePatterns,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', (filePath) => this.handleChange('add', filePath))
      .on('change', (filePath) => this.handleChange('change', filePath))
      .on('unlink', (filePath) => this.handleChange('delete', filePath))
      .on('error', (error) => console.error('❌ Watcher error:', error));

    console.log('✅ Codebase watcher started');
  }

  /**
   * Stop watching
   */
  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      console.log('🛑 Codebase watcher stopped');
    }
  }

  /**
   * Handle file change with debouncing
   */
  handleChange(event, filePath) {
    const relativePath = path.relative(this.rootDir, filePath);
    
    // Clear existing debounce timer
    if (this.debounceTimers.has(relativePath)) {
      clearTimeout(this.debounceTimers.get(relativePath));
    }

    // Calculate file hash
    let fileHash = null;
    try {
      if (event !== 'delete' && require('fs').existsSync(filePath)) {
        const content = require('fs').readFileSync(filePath);
        fileHash = crypto.createHash('md5').update(content).digest('hex');
      }
    } catch (error) {
      // File might be locked or deleted
    }

    // Check if file actually changed
    const previousHash = this.fileHashes.get(relativePath);
    if (fileHash === previousHash && event === 'change') {
      return; // No actual change
    }

    // Update hash
    if (event === 'delete') {
      this.fileHashes.delete(relativePath);
    } else {
      this.fileHashes.set(relativePath, fileHash);
    }

    // Debounce the change notification
    const timer = setTimeout(() => {
      this.notifyChange({
        event,
        filePath: relativePath,
        absolutePath: filePath,
        timestamp: new Date().toISOString(),
        hash: fileHash
      });
      this.debounceTimers.delete(relativePath);
    }, this.debounceDelay);

    this.debounceTimers.set(relativePath, timer);
  }

  /**
   * Notify all callbacks of a change
   */
  notifyChange(changeInfo) {
    console.log(`📝 ${changeInfo.event}: ${changeInfo.filePath}`);
    
    this.changeCallbacks.forEach(callback => {
      try {
        callback(changeInfo);
      } catch (error) {
        console.error('❌ Callback error:', error);
      }
    });
  }

  /**
   * Register a callback for file changes
   */
  onChange(callback) {
    this.changeCallbacks.push(callback);
    return () => {
      const index = this.changeCallbacks.indexOf(callback);
      if (index > -1) {
        this.changeCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Get current file statistics
   */
  getStats() {
    return {
      watchedFiles: this.fileHashes.size,
      activeCallbacks: this.changeCallbacks.length,
      isWatching: this.watcher !== null
    };
  }
}

module.exports = CodebaseWatcher;

