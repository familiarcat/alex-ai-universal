#!/usr/bin/env node

/**
 * N8N Workflow Backup System
 * 
 * This script provides comprehensive backup functionality for N8N workflows,
 * including automated scheduling, versioning, and restoration capabilities.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class N8NBackupSystem {
  constructor() {
    this.secrets = {};
    this.backupConfig = {
      backupDir: path.join(__dirname, 'n8n-backups'),
      maxBackups: 30, // Keep last 30 backups
      compressionEnabled: true,
      includeMetadata: true,
      backupInterval: 24 * 60 * 60 * 1000, // 24 hours
      retentionDays: 30,
      autoCleanup: true
    };
    this.backupReport = {
      timestamp: new Date().toISOString(),
      totalBackups: 0,
      successfulBackups: 0,
      failedBackups: 0,
      totalSize: 0,
      lastBackup: null,
      nextBackup: null
    };
  }

  async initialize(options = {}) {
    console.log('💾 N8N Workflow Backup System');
    console.log('=============================\n');

    try {
      // Merge options with default config
      this.backupConfig = { ...this.backupConfig, ...options };
      
      // Step 1: Load secrets and validate
      await this.loadSecretsFromZshrc();
      
      // Step 2: Initialize backup directory
      await this.initializeBackupDirectory();
      
      // Step 3: Perform initial backup
      await this.performBackup();
      
      // Step 4: Set up scheduled backups
      await this.setupScheduledBackups();
      
      console.log('✅ Backup system initialized successfully');
      
    } catch (error) {
      console.error('❌ Backup system failed:', error.message);
      process.exit(1);
    }
  }

  async loadSecretsFromZshrc() {
    console.log('🔐 Loading N8N credentials...');
    
    const zshrcPath = path.join(os.homedir(), '.zshrc');
    
    if (!fs.existsSync(zshrcPath)) {
      throw new Error('~/.zshrc file not found');
    }

    const content = fs.readFileSync(zshrcPath, 'utf8');
    
    // Extract N8N environment variables
    const envVarRegex = /export\s+([A-Z0-9_]+)=["']?([^"'\n]+)["']?/g;
    let match;
    
    while ((match = envVarRegex.exec(content)) !== null) {
      const [, key, value] = match;
      const cleanValue = value.replace(/^["']|["']$/g, '').trim();
      this.secrets[key] = cleanValue;
    }

    // Validate required N8N credentials
    if (!this.secrets.N8N_API_URL || !this.secrets.N8N_API_KEY) {
      throw new Error('N8N API credentials not found in ~/.zshrc');
    }

    console.log('✅ N8N credentials loaded successfully');
  }

  async initializeBackupDirectory() {
    console.log('📁 Initializing backup directory...');
    
    const backupDir = this.backupConfig.backupDir;
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Create subdirectories
    const subdirs = ['workflows', 'metadata', 'exports', 'logs'];
    for (const subdir of subdirs) {
      const subdirPath = path.join(backupDir, subdir);
      if (!fs.existsSync(subdirPath)) {
        fs.mkdirSync(subdirPath, { recursive: true });
      }
    }

    console.log(`✅ Backup directory initialized: ${backupDir}`);
  }

  async performBackup() {
    console.log('\n💾 Performing backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `backup-${timestamp}`;
    const backupPath = path.join(this.backupConfig.backupDir, 'workflows', backupId);
    
    try {
      // Create backup directory
      fs.mkdirSync(backupPath, { recursive: true });
      
      // Step 1: Backup remote workflows
      await this.backupRemoteWorkflows(backupPath);
      
      // Step 2: Backup local workflows
      await this.backupLocalWorkflows(backupPath);
      
      // Step 3: Create backup metadata
      await this.createBackupMetadata(backupId, backupPath);
      
      // Step 4: Compress backup if enabled
      if (this.backupConfig.compressionEnabled) {
        await this.compressBackup(backupPath);
      }
      
      // Step 5: Update backup report
      this.updateBackupReport(backupId, backupPath);
      
      console.log(`✅ Backup completed: ${backupId}`);
      
      // Step 6: Cleanup old backups
      if (this.backupConfig.autoCleanup) {
        await this.cleanupOldBackups();
      }
      
    } catch (error) {
      console.error(`❌ Backup failed: ${error.message}`);
      this.backupReport.failedBackups++;
      throw error;
    }
  }

  async backupRemoteWorkflows(backupPath) {
    console.log('🌐 Backing up remote workflows...');
    
    try {
      const response = await fetch(`${this.secrets.N8N_API_URL}/workflows`, {
        headers: {
          'X-N8N-API-KEY': this.secrets.N8N_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`N8N API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const workflows = Array.isArray(data) ? data : (data.data || []);
      
      // Save remote workflows
      const remoteWorkflowsPath = path.join(backupPath, 'remote-workflows.json');
      fs.writeFileSync(remoteWorkflowsPath, JSON.stringify(workflows, null, 2));
      
      // Save individual workflow files
      const workflowsDir = path.join(backupPath, 'remote-individual');
      fs.mkdirSync(workflowsDir, { recursive: true });
      
      for (const workflow of workflows) {
        const fileName = `${this.sanitizeFileName(workflow.name)}-${workflow.id}.json`;
        const filePath = path.join(workflowsDir, fileName);
        fs.writeFileSync(filePath, JSON.stringify(workflow, null, 2));
      }
      
      console.log(`   ✅ Backed up ${workflows.length} remote workflows`);
      
    } catch (error) {
      console.error('   ❌ Failed to backup remote workflows:', error.message);
      throw error;
    }
  }

  async backupLocalWorkflows(backupPath) {
    console.log('📁 Backing up local workflows...');
    
    const localWorkflowsDir = path.join(__dirname, 'n8n-workflows');
    const localBackupPath = path.join(backupPath, 'local-workflows');
    
    if (!fs.existsSync(localWorkflowsDir)) {
      console.log('   ⚠️  No local workflows directory found');
      return;
    }

    try {
      // Copy entire local workflows directory
      await this.copyDirectory(localWorkflowsDir, localBackupPath);
      
      // Count workflows
      const workflowCount = this.countWorkflows(localBackupPath);
      console.log(`   ✅ Backed up ${workflowCount} local workflows`);
      
    } catch (error) {
      console.error('   ❌ Failed to backup local workflows:', error.message);
      throw error;
    }
  }

  async copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(src);
    
    for (const item of items) {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);
      
      if (stat.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  countWorkflows(dir) {
    let count = 0;
    
    const countRecursive = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          countRecursive(itemPath);
        } else if (item.endsWith('.json')) {
          count++;
        }
      }
    };
    
    countRecursive(dir);
    return count;
  }

  async createBackupMetadata(backupId, backupPath) {
    console.log('📋 Creating backup metadata...');
    
    const metadata = {
      backupId,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      config: this.backupConfig,
      stats: {
        remoteWorkflows: this.countWorkflows(path.join(backupPath, 'remote-individual')),
        localWorkflows: this.countWorkflows(path.join(backupPath, 'local-workflows')),
        totalSize: this.calculateDirectorySize(backupPath)
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    const metadataPath = path.join(this.backupConfig.backupDir, 'metadata', `${backupId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log('   ✅ Backup metadata created');
  }

  calculateDirectorySize(dir) {
    let totalSize = 0;
    
    const calculateRecursive = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const itemPath = path.join(currentDir, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          calculateRecursive(itemPath);
        } else {
          totalSize += stat.size;
        }
      }
    };
    
    calculateRecursive(dir);
    return totalSize;
  }

  async compressBackup(backupPath) {
    console.log('🗜️  Compressing backup...');
    
    try {
      const compressedPath = `${backupPath}.tar.gz`;
      
      // Use tar command to compress
      execSync(`tar -czf "${compressedPath}" -C "${path.dirname(backupPath)}" "${path.basename(backupPath)}"`, {
        stdio: 'pipe'
      });
      
      // Remove uncompressed directory
      fs.rmSync(backupPath, { recursive: true, force: true });
      
      console.log(`   ✅ Backup compressed: ${path.basename(compressedPath)}`);
      
    } catch (error) {
      console.log(`   ⚠️  Compression failed: ${error.message}`);
    }
  }

  updateBackupReport(backupId, backupPath) {
    this.backupReport.totalBackups++;
    this.backupReport.successfulBackups++;
    this.backupReport.lastBackup = backupId;
    this.backupReport.nextBackup = new Date(Date.now() + this.backupConfig.backupInterval).toISOString();
    
    // Calculate total size
    this.backupReport.totalSize = this.calculateDirectorySize(this.backupConfig.backupDir);
  }

  async cleanupOldBackups() {
    console.log('🧹 Cleaning up old backups...');
    
    try {
      const backupsDir = path.join(this.backupConfig.backupDir, 'workflows');
      const metadataDir = path.join(this.backupConfig.backupDir, 'metadata');
      
      if (!fs.existsSync(backupsDir)) {
        return;
      }

      // Get all backup directories
      const backups = fs.readdirSync(backupsDir)
        .filter(item => {
          const itemPath = path.join(backupsDir, item);
          return fs.statSync(itemPath).isDirectory() || item.endsWith('.tar.gz');
        })
        .map(item => {
          const itemPath = path.join(backupsDir, item);
          const stat = fs.statSync(itemPath);
          return {
            name: item,
            path: itemPath,
            mtime: stat.mtime
          };
        })
        .sort((a, b) => b.mtime - a.mtime);

      // Remove old backups
      const backupsToRemove = backups.slice(this.backupConfig.maxBackups);
      
      for (const backup of backupsToRemove) {
        try {
          if (fs.statSync(backup.path).isDirectory()) {
            fs.rmSync(backup.path, { recursive: true, force: true });
          } else {
            fs.unlinkSync(backup.path);
          }
          
          // Remove corresponding metadata
          const metadataPath = path.join(metadataDir, `${backup.name}.json`);
          if (fs.existsSync(metadataPath)) {
            fs.unlinkSync(metadataPath);
          }
          
          console.log(`   🗑️  Removed old backup: ${backup.name}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to remove ${backup.name}: ${error.message}`);
        }
      }
      
      console.log(`   ✅ Cleanup completed, removed ${backupsToRemove.length} old backups`);
      
    } catch (error) {
      console.log(`   ⚠️  Cleanup failed: ${error.message}`);
    }
  }

  async setupScheduledBackups() {
    console.log(`⏰ Setting up scheduled backups (every ${this.backupConfig.backupInterval / (60 * 60 * 1000)} hours)...`);
    
    const backupInterval = setInterval(async () => {
      try {
        console.log('\n💾 Scheduled backup starting...');
        await this.performBackup();
        console.log('✅ Scheduled backup completed');
      } catch (error) {
        console.error('❌ Scheduled backup failed:', error.message);
      }
    }, this.backupConfig.backupInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down backup system...');
      clearInterval(backupInterval);
      process.exit(0);
    });
  }

  async listBackups() {
    console.log('\n📋 Available Backups');
    console.log('===================');
    
    const backupsDir = path.join(this.backupConfig.backupDir, 'workflows');
    const metadataDir = path.join(this.backupConfig.backupDir, 'metadata');
    
    if (!fs.existsSync(backupsDir)) {
      console.log('No backups found');
      return;
    }

    const backups = fs.readdirSync(backupsDir)
      .filter(item => {
        const itemPath = path.join(backupsDir, item);
        return fs.statSync(itemPath).isDirectory() || item.endsWith('.tar.gz');
      })
      .map(item => {
        const itemPath = path.join(backupsDir, item);
        const stat = fs.statSync(itemPath);
        const metadataPath = path.join(metadataDir, `${item}.json`);
        
        let metadata = null;
        if (fs.existsSync(metadataPath)) {
          try {
            metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
          } catch (error) {
            // Ignore metadata parsing errors
          }
        }
        
        return {
          name: item,
          path: itemPath,
          mtime: stat.mtime,
          size: stat.size,
          metadata
        };
      })
      .sort((a, b) => b.mtime - a.mtime);

    for (const backup of backups) {
      const size = this.formatBytes(backup.size);
      const date = backup.mtime.toISOString().split('T')[0];
      const time = backup.mtime.toTimeString().split(' ')[0];
      
      console.log(`📦 ${backup.name}`);
      console.log(`   Date: ${date} ${time}`);
      console.log(`   Size: ${size}`);
      
      if (backup.metadata) {
        console.log(`   Remote Workflows: ${backup.metadata.stats.remoteWorkflows}`);
        console.log(`   Local Workflows: ${backup.metadata.stats.localWorkflows}`);
      }
      
      console.log('');
    }
  }

  async restoreBackup(backupName) {
    console.log(`\n🔄 Restoring backup: ${backupName}`);
    
    const backupPath = path.join(this.backupConfig.backupDir, 'workflows', backupName);
    
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupName}`);
    }

    try {
      // Extract if compressed
      if (backupName.endsWith('.tar.gz')) {
        const extractPath = backupPath.replace('.tar.gz', '');
        execSync(`tar -xzf "${backupPath}" -C "${path.dirname(backupPath)}"`, {
          stdio: 'pipe'
        });
        // Use extracted directory
        const extractedDir = path.join(path.dirname(backupPath), path.basename(extractPath));
        await this.restoreFromDirectory(extractedDir);
      } else {
        await this.restoreFromDirectory(backupPath);
      }
      
      console.log('✅ Backup restored successfully');
      
    } catch (error) {
      console.error('❌ Backup restoration failed:', error.message);
      throw error;
    }
  }

  async restoreFromDirectory(backupPath) {
    // Restore local workflows
    const localBackupPath = path.join(backupPath, 'local-workflows');
    const localWorkflowsDir = path.join(__dirname, 'n8n-workflows');
    
    if (fs.existsSync(localBackupPath)) {
      // Remove existing local workflows
      if (fs.existsSync(localWorkflowsDir)) {
        fs.rmSync(localWorkflowsDir, { recursive: true, force: true });
      }
      
      // Restore local workflows
      await this.copyDirectory(localBackupPath, localWorkflowsDir);
      console.log('   ✅ Local workflows restored');
    }

    // Restore remote workflows (upload to N8N)
    const remoteWorkflowsPath = path.join(backupPath, 'remote-workflows.json');
    if (fs.existsSync(remoteWorkflowsPath)) {
      const workflows = JSON.parse(fs.readFileSync(remoteWorkflowsPath, 'utf8'));
      
      for (const workflow of workflows) {
        try {
          await this.uploadWorkflow(workflow);
          console.log(`   ✅ Restored remote workflow: ${workflow.name}`);
        } catch (error) {
          console.log(`   ⚠️  Failed to restore ${workflow.name}: ${error.message}`);
        }
      }
    }
  }

  async uploadWorkflow(workflow) {
    const response = await fetch(`${this.secrets.N8N_API_URL}/workflows`, {
      method: 'POST',
      headers: {
        'X-N8N-API-KEY': this.secrets.N8N_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: workflow.settings || {}
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Upload failed: ${response.status} ${response.statusText} - ${errorData}`);
    }

    return await response.json();
  }

  sanitizeFileName(name) {
    return name
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .trim();
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateBackupReport() {
    console.log('\n📊 Backup System Report');
    console.log('======================');
    console.log(`Total Backups: ${this.backupReport.totalBackups}`);
    console.log(`Successful: ${this.backupReport.successfulBackups}`);
    console.log(`Failed: ${this.backupReport.failedBackups}`);
    console.log(`Total Size: ${this.formatBytes(this.backupReport.totalSize)}`);
    console.log(`Last Backup: ${this.backupReport.lastBackup || 'None'}`);
    console.log(`Next Backup: ${this.backupReport.nextBackup || 'Not scheduled'}`);
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = {};

  // Parse command line arguments
  for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
      case '--max-backups':
        options.maxBackups = parseInt(args[++i]);
        break;
      case '--interval':
        options.backupInterval = parseInt(args[++i]) * 60 * 60 * 1000; // Convert hours to ms
        break;
      case '--no-compression':
        options.compressionEnabled = false;
        break;
      case '--no-cleanup':
        options.autoCleanup = false;
        break;
    }
  }

  const backup = new N8NBackupSystem();

  switch (command) {
    case 'backup':
      await backup.initialize(options);
      break;
    case 'list':
      await backup.loadSecretsFromZshrc();
      await backup.initializeBackupDirectory();
      await backup.listBackups();
      break;
    case 'restore':
      if (!args[1]) {
        console.error('❌ Please specify backup name to restore');
        process.exit(1);
      }
      await backup.loadSecretsFromZshrc();
      await backup.initializeBackupDirectory();
      await backup.restoreBackup(args[1]);
      break;
    case 'help':
    default:
      console.log(`
N8N Workflow Backup System

Usage: node n8n-backup-system.js <command> [options]

Commands:
  backup              Perform backup (default: start scheduled backups)
  list                List available backups
  restore <name>      Restore a specific backup
  help                Show this help message

Options:
  --max-backups <n>   Maximum number of backups to keep (default: 30)
  --interval <hours>  Backup interval in hours (default: 24)
  --no-compression    Disable backup compression
  --no-cleanup        Disable automatic cleanup

Examples:
  node n8n-backup-system.js backup
  node n8n-backup-system.js backup --interval 12 --max-backups 50
  node n8n-backup-system.js list
  node n8n-backup-system.js restore backup-2025-09-21T21-30-00-000Z
        `);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = N8NBackupSystem;
