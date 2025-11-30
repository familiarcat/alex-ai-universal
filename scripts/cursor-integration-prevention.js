#!/usr/bin/env node

/**
 * 🚫 Alex AI Universal - Cursor AI Integration Prevention
 * 
 * Prevents Cursor AI from creating Alex AI artifacts during chat sessions
 * Features: Real-time prevention, artifact detection, automatic cleanup
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  // Prevention patterns
  preventionPatterns: [
    // Alex AI directories
    'alex-ai-artifacts',
    'alex-ai-temp',
    'alex-ai-memory',
    'alex-ai-session',
    'alex-ai-cache',
    'alex-ai-logs',
    'alex-ai-backups',
    'alex-ai-workflows',
    'alex-ai-memories',
    'alex-ai-configs',
    'alex-ai-sessions',
    'alex-ai-data',
    'alex-ai-files',
    'alex-ai-output',
    'alex-ai-results',
    'alex-ai-reports',
    'alex-ai-docs',
    'alex-ai-scripts',
    'alex-ai-templates',
    'alex-ai-examples',
    'alex-ai-tests',
    'alex-ai-samples',
    'alex-ai-demos',
    'alex-ai-showcase',
    'alex-ai-presentation',
    'alex-ai-slides',
    'alex-ai-presentations',
    'alex-ai-documentation',
    'alex-ai-guides',
    'alex-ai-tutorials',
    'alex-ai-walkthroughs',
    'alex-ai-explanations',
    'alex-ai-notes',
    
    // Cursor AI directories
    'cursor-ai-artifacts',
    'cursor-ai-temp',
    'cursor-ai-memory',
    'cursor-ai-session',
    'cursor-ai-cache',
    'cursor-ai-logs',
    'cursor-ai-backups',
    'cursor-ai-workflows',
    'cursor-ai-memories',
    'cursor-ai-configs',
    'cursor-ai-sessions',
    'cursor-ai-data',
    'cursor-ai-files',
    'cursor-ai-output',
    'cursor-ai-results',
    'cursor-ai-reports',
    'cursor-ai-docs',
    'cursor-ai-scripts',
    'cursor-ai-templates',
    'cursor-ai-examples',
    'cursor-ai-tests',
    'cursor-ai-samples',
    'cursor-ai-demos',
    'cursor-ai-showcase',
    'cursor-ai-presentation',
    'cursor-ai-slides',
    'cursor-ai-presentations',
    'cursor-ai-documentation',
    'cursor-ai-guides',
    'cursor-ai-tutorials',
    'cursor-ai-walkthroughs',
    'cursor-ai-explanations',
    'cursor-ai-notes',
    
    // General AI directories
    'ai-artifacts',
    'ai-temp',
    'ai-memory',
    'ai-session',
    'ai-cache',
    'ai-logs',
    'ai-backups',
    'ai-workflows',
    'ai-memories',
    'ai-configs',
    'ai-sessions',
    'ai-data',
    'ai-files',
    'ai-output',
    'ai-results',
    'ai-reports',
    'ai-docs',
    'ai-scripts',
    'ai-templates',
    'ai-examples',
    'ai-tests',
    'ai-samples',
    'ai-demos',
    'ai-showcase',
    'ai-presentation',
    'ai-slides',
    'ai-presentations',
    'ai-documentation',
    'ai-guides',
    'ai-tutorials',
    'ai-walkthroughs',
    'ai-explanations',
    'ai-notes',
    
    // Chat directories
    'chat-artifacts',
    'chat-temp',
    'chat-memory',
    'chat-session',
    'chat-cache',
    'chat-logs',
    'chat-backups',
    'chat-workflows',
    'chat-memories',
    'chat-configs',
    'chat-sessions',
    'chat-data',
    'chat-files',
    'chat-output',
    'chat-results',
    'chat-reports',
    'chat-docs',
    'chat-scripts',
    'chat-templates',
    'chat-examples',
    'chat-tests',
    'chat-samples',
    'chat-demos',
    'chat-showcase',
    'chat-presentation',
    'chat-slides',
    'chat-presentations',
    'chat-documentation',
    'chat-guides',
    'chat-tutorials',
    'chat-walkthroughs',
    'chat-explanations',
    'chat-notes'
  ],
  
  // File patterns to prevent
  filePatterns: [
    'alex-ai-notes.md',
    'alex-ai-summary.md',
    'alex-ai-analysis.md',
    'alex-ai-review.md',
    'alex-ai-assessment.md',
    'alex-ai-evaluation.md',
    'alex-ai-report.md',
    'alex-ai-findings.md',
    'alex-ai-recommendations.md',
    'alex-ai-suggestions.md',
    'alex-ai-improvements.md',
    'alex-ai-optimizations.md',
    'alex-ai-enhancements.md',
    'alex-ai-fixes.md',
    'alex-ai-solutions.md',
    'alex-ai-implementations.md',
    'cursor-ai-notes.md',
    'cursor-ai-summary.md',
    'cursor-ai-analysis.md',
    'cursor-ai-review.md',
    'cursor-ai-assessment.md',
    'cursor-ai-evaluation.md',
    'cursor-ai-report.md',
    'cursor-ai-findings.md',
    'cursor-ai-recommendations.md',
    'cursor-ai-suggestions.md',
    'cursor-ai-improvements.md',
    'cursor-ai-optimizations.md',
    'cursor-ai-enhancements.md',
    'cursor-ai-fixes.md',
    'cursor-ai-solutions.md',
    'cursor-ai-implementations.md',
    'ai-notes.md',
    'ai-summary.md',
    'ai-analysis.md',
    'ai-review.md',
    'ai-assessment.md',
    'ai-evaluation.md',
    'ai-report.md',
    'ai-findings.md',
    'ai-recommendations.md',
    'ai-suggestions.md',
    'ai-improvements.md',
    'ai-optimizations.md',
    'ai-enhancements.md',
    'ai-fixes.md',
    'ai-solutions.md',
    'ai-implementations.md',
    'chat-notes.md',
    'chat-summary.md',
    'chat-analysis.md',
    'chat-review.md',
    'chat-assessment.md',
    'chat-evaluation.md',
    'chat-report.md',
    'chat-findings.md',
    'chat-recommendations.md',
    'chat-suggestions.md',
    'chat-improvements.md',
    'chat-optimizations.md',
    'chat-enhancements.md',
    'chat-fixes.md',
    'chat-solutions.md',
    'chat-implementations.md'
  ],
  
  // Backup directory
  backupDir: path.join(__dirname, '..', 'local-testing', 'artifact-backups'),
  
  // Log file
  logFile: path.join(__dirname, '..', 'local-testing', 'logs', 'cursor-prevention.log'),
  
  // Check interval
  checkInterval: 1000 // 1 second
};

/**
 * 🚫 Cursor AI Integration Prevention
 */
class CursorIntegrationPrevention {
  constructor() {
    this.isRunning = false;
    this.artifactsDetected = 0;
    this.artifactsRemoved = 0;
    this.startTime = null;
    this.checkInterval = null;
    
    this.setupDirectories();
  }
  
  /**
   * Setup directories
   */
  setupDirectories() {
    // Create backup directory
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }
    
    // Create logs directory
    const logsDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }
  
  /**
   * Start prevention system
   */
  async start() {
    console.log('🚫 Starting Cursor AI Integration Prevention...');
    console.log('');
    
    this.isRunning = true;
    this.startTime = Date.now();
    
    // Start monitoring
    this.startMonitoring();
    
    console.log('✅ Prevention system started');
    console.log(`📊 Monitoring ${CONFIG.preventionPatterns.length} directory patterns`);
    console.log(`📊 Monitoring ${CONFIG.filePatterns.length} file patterns`);
    console.log('');
    
    // Handle shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }
  
  /**
   * Start monitoring
   */
  startMonitoring() {
    this.checkInterval = setInterval(() => {
      this.checkForArtifacts();
    }, CONFIG.checkInterval);
  }
  
  /**
   * Check for artifacts
   */
  async checkForArtifacts() {
    try {
      // Check for directory artifacts
      for (const pattern of CONFIG.preventionPatterns) {
        const fullPath = path.join(process.cwd(), pattern);
        if (fs.existsSync(fullPath)) {
          await this.handleArtifact(fullPath, pattern, 'directory');
        }
      }
      
      // Check for file artifacts
      for (const pattern of CONFIG.filePatterns) {
        const fullPath = path.join(process.cwd(), pattern);
        if (fs.existsSync(fullPath)) {
          await this.handleArtifact(fullPath, pattern, 'file');
        }
      }
      
    } catch (error) {
      console.error('Error checking for artifacts:', error.message);
    }
  }
  
  /**
   * Handle detected artifact
   */
  async handleArtifact(fullPath, pattern, type) {
    try {
      console.log(`🚨 ARTIFACT DETECTED: ${type} ${pattern}`);
      
      this.artifactsDetected++;
      
      // Create backup
      await this.backupArtifact(fullPath, pattern, type);
      
      // Remove artifact
      await this.removeArtifact(fullPath, type);
      
      this.artifactsRemoved++;
      
      console.log(`  ✅ Artifact backed up and removed: ${pattern}`);
      
      // Log the incident
      this.logArtifact(pattern, type, 'removed');
      
    } catch (error) {
      console.error(`  ❌ Failed to handle artifact ${pattern}:`, error.message);
      this.logArtifact(pattern, type, 'error', error.message);
    }
  }
  
  /**
   * Backup artifact
   */
  async backupArtifact(fullPath, pattern, type) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(CONFIG.backupDir, `${timestamp}-${pattern}`);
    
    if (fs.existsSync(fullPath)) {
      if (type === 'directory') {
        // Copy directory
        await execAsync(`cp -r "${fullPath}" "${backupPath}"`);
      } else {
        // Copy file
        fs.copyFileSync(fullPath, backupPath);
      }
    }
  }
  
  /**
   * Remove artifact
   */
  async removeArtifact(fullPath, type) {
    if (fs.existsSync(fullPath)) {
      if (type === 'directory') {
        // Remove directory
        await execAsync(`rm -rf "${fullPath}"`);
      } else {
        // Remove file
        fs.unlinkSync(fullPath);
      }
    }
  }
  
  /**
   * Log artifact incident
   */
  logArtifact(pattern, type, action, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      pattern: pattern,
      type: type,
      action: action,
      error: error
    };
    
    fs.appendFileSync(CONFIG.logFile, JSON.stringify(logEntry) + '\n');
  }
  
  /**
   * Get system status
   */
  getStatus() {
    const uptime = this.startTime ? Date.now() - this.startTime : 0;
    
    return {
      isRunning: this.isRunning,
      uptime: uptime,
      artifactsDetected: this.artifactsDetected,
      artifactsRemoved: this.artifactsRemoved,
      patterns: CONFIG.preventionPatterns.length + CONFIG.filePatterns.length
    };
  }
  
  /**
   * Stop system
   */
  stop() {
    console.log('\n🛑 Stopping prevention system...');
    
    this.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    console.log('✅ Prevention system stopped');
    console.log(`📊 Total artifacts detected: ${this.artifactsDetected}`);
    console.log(`📊 Total artifacts removed: ${this.artifactsRemoved}`);
    
    process.exit(0);
  }
}

// Main execution
if (require.main === module) {
  const prevention = new CursorIntegrationPrevention();
  prevention.start().catch(console.error);
}

module.exports = { CursorIntegrationPrevention };
