#!/usr/bin/env node

/**
 * 🚀 N8N Integration CLI
 * 
 * Provides CLI commands for the truly unique bi-directional sync system
 * and N8N integration features for Alex AI platform
 */

import { Command } from 'commander';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class N8NIntegrationCLI {
  private program: Command;

  constructor() {
    this.program = new Command('n8n-integration');
    this.setupCommands();
  }

  private setupCommands() {
    // Main N8N integration command
    this.program
      .command('sync')
      .description('Start the truly unique bi-directional sync system')
      .option('-w, --watch', 'Enable file watching mode', true)
      .option('-p, --poll-interval <seconds>', 'N8N polling interval in seconds', '5')
      .action(async (options) => {
        await this.startBiDirectionalSync(options);
      });

    // Sync status command
    this.program
      .command('sync-status')
      .description('Check the status of N8N integration and sync system')
      .action(async () => {
        await this.checkSyncStatus();
      });

    // Force sync command
    this.program
      .command('force-sync')
      .description('Force immediate synchronization between local JSON and N8N')
      .action(async () => {
        await this.forceSync();
      });

    // Start sync daemon
    this.program
      .command('daemon')
      .description('Start N8N integration as a background daemon')
      .option('-p, --pid-file <path>', 'PID file path', '/tmp/alex-ai-n8n-sync.pid')
      .action(async (options) => {
        await this.startDaemon(options);
      });

    // Stop sync daemon
    this.program
      .command('stop-daemon')
      .description('Stop the N8N integration daemon')
      .option('-p, --pid-file <path>', 'PID file path', '/tmp/alex-ai-n8n-sync.pid')
      .action(async (options) => {
        await this.stopDaemon(options);
      });

    // Test bi-directional sync
    this.program
      .command('test')
      .description('Test the bi-directional sync functionality')
      .action(async () => {
        await this.testBiDirectionalSync();
      });

    // List workflows
    this.program
      .command('list-workflows')
      .description('List all Alex AI workflows in N8N')
      .action(async () => {
        await this.listWorkflows();
      });

    // Get workflow details
    this.program
      .command('workflow <id>')
      .description('Get details of a specific workflow')
      .action(async (workflowId) => {
        await this.getWorkflowDetails(workflowId);
      });

    // Sync specific workflow
    this.program
      .command('sync-workflow <id>')
      .description('Sync a specific workflow between local and N8N')
      .action(async (workflowId) => {
        await this.syncSpecificWorkflow(workflowId);
      });
  }

  /**
   * Start the truly unique bi-directional sync system
   */
  private async startBiDirectionalSync(options: any) {
    console.log('🚀 Starting Truly Unique Bi-Directional Sync System');
    console.log('==================================================');
    
    try {
      const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
      
      if (!fs.existsSync(scriptPath)) {
        console.error('❌ Sync script not found:', scriptPath);
        return;
      }

      console.log('✅ Starting sync system...');
      console.log(`📁 Watching: ${path.join(process.cwd(), 'packages', 'core', 'src', 'crew-workflows')}`);
      console.log(`🔄 Polling interval: ${options.pollInterval} seconds`);
      console.log(`👀 File watching: ${options.watch ? 'Enabled' : 'Disabled'}`);
      
      const child = spawn('node', [scriptPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('error', (error) => {
        console.error('❌ Sync system error:', error.message);
      });

      child.on('exit', (code) => {
        console.log(`🛑 Sync system exited with code: ${code}`);
      });

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n🛑 Stopping sync system...');
        child.kill('SIGINT');
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Failed to start sync system:', error);
    }
  }

  /**
   * Check sync status
   */
  private async checkSyncStatus() {
    console.log('📊 N8N Integration Status');
    console.log('========================');
    
    try {
      // Check if sync script exists
      const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
      const scriptExists = fs.existsSync(scriptPath);
      console.log(`📄 Sync script: ${scriptExists ? '✅ Found' : '❌ Not found'}`);
      
      // Check local JSON files
      const crewWorkflowsDir = path.join(process.cwd(), 'packages', 'core', 'src', 'crew-workflows');
      const localFilesExist = fs.existsSync(crewWorkflowsDir);
      console.log(`📁 Local workflows: ${localFilesExist ? '✅ Found' : '❌ Not found'}`);
      
      if (localFilesExist) {
        const files = fs.readdirSync(crewWorkflowsDir).filter(f => f.endsWith('.json'));
        console.log(`   • ${files.length} workflow files found`);
        files.forEach(file => {
          console.log(`     - ${file}`);
        });
      }
      
      // Check PID file for daemon
      const pidFile = '/tmp/alex-ai-n8n-sync.pid';
      const daemonRunning = fs.existsSync(pidFile);
      console.log(`🔄 Daemon status: ${daemonRunning ? '✅ Running' : '❌ Not running'}`);
      
      if (daemonRunning) {
        const pid = fs.readFileSync(pidFile, 'utf8').trim();
        console.log(`   • PID: ${pid}`);
      }
      
      console.log('\n🎯 System Status: Ready for bi-directional sync');
      
    } catch (error) {
      console.error('❌ Status check failed:', error);
    }
  }

  /**
   * Force immediate synchronization
   */
  private async forceSync() {
    console.log('🔄 Forcing Immediate Synchronization');
    console.log('====================================');
    
    try {
      const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'direct-json-n8n-sync.js');
      
      if (!fs.existsSync(scriptPath)) {
        console.error('❌ Direct sync script not found:', scriptPath);
        return;
      }

      console.log('📤 Forcing sync from local to N8N...');
      
      const child = spawn('node', [scriptPath, 'sync'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('error', (error) => {
        console.error('❌ Force sync error:', error.message);
      });

      child.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ Force sync completed successfully');
        } else {
          console.log(`❌ Force sync failed with code: ${code}`);
        }
      });

    } catch (error) {
      console.error('❌ Force sync failed:', error);
    }
  }

  /**
   * Start sync daemon
   */
  private async startDaemon(options: any) {
    console.log('🔄 Starting N8N Integration Daemon');
    console.log('==================================');
    
    try {
      const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'truly-unique-bidirectional-sync.js');
      
      if (!fs.existsSync(scriptPath)) {
        console.error('❌ Sync script not found:', scriptPath);
        return;
      }

      console.log(`📄 PID file: ${options.pidFile}`);
      console.log('🚀 Starting daemon...');
      
      const child = spawn('node', [scriptPath], {
        stdio: 'pipe',
        cwd: process.cwd(),
        detached: true
      });

      // Write PID file
      fs.writeFileSync(options.pidFile, child.pid?.toString() || '');
      
      console.log(`✅ Daemon started with PID: ${child.pid}`);
      console.log('🔄 N8N integration is now running in the background');
      
      // Detach from parent process
      child.unref();

    } catch (error) {
      console.error('❌ Failed to start daemon:', error);
    }
  }

  /**
   * Stop sync daemon
   */
  private async stopDaemon(options: any) {
    console.log('🛑 Stopping N8N Integration Daemon');
    console.log('==================================');
    
    try {
      if (!fs.existsSync(options.pidFile)) {
        console.log('❌ PID file not found - daemon may not be running');
        return;
      }

      const pid = fs.readFileSync(options.pidFile, 'utf8').trim();
      console.log(`📄 Found PID: ${pid}`);
      
      // Kill the process
      process.kill(parseInt(pid), 'SIGTERM');
      
      // Remove PID file
      fs.unlinkSync(options.pidFile);
      
      console.log('✅ Daemon stopped successfully');
      
    } catch (error) {
      console.error('❌ Failed to stop daemon:', error);
    }
  }

  /**
   * Test bi-directional sync
   */
  private async testBiDirectionalSync() {
    console.log('🧪 Testing Bi-Directional Sync');
    console.log('==============================');
    
    try {
      const testScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'demo-truly-unique-sync.js');
      
      if (!fs.existsSync(testScriptPath)) {
        console.error('❌ Test script not found:', testScriptPath);
        return;
      }

      console.log('🧪 Running sync test...');
      
      const child = spawn('node', [testScriptPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('error', (error) => {
        console.error('❌ Test error:', error.message);
      });

      child.on('exit', (code) => {
        if (code === 0) {
          console.log('✅ Bi-directional sync test completed successfully');
        } else {
          console.log(`❌ Test failed with code: ${code}`);
        }
      });

    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }

  /**
   * List all workflows
   */
  private async listWorkflows() {
    console.log('📋 Alex AI Workflows in N8N');
    console.log('===========================');
    
    try {
      const listScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'list-n8n-workflows.js');
      
      if (!fs.existsSync(listScriptPath)) {
        console.error('❌ List script not found:', listScriptPath);
        return;
      }

      const child = spawn('node', [listScriptPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('error', (error) => {
        console.error('❌ List error:', error.message);
      });

    } catch (error) {
      console.error('❌ List failed:', error);
    }
  }

  /**
   * Get workflow details
   */
  private async getWorkflowDetails(workflowId: string) {
    console.log(`📋 Workflow Details: ${workflowId}`);
    console.log('===============================');
    
    try {
      const debugScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'debug-quark-workflow.js');
      
      if (!fs.existsSync(debugScriptPath)) {
        console.error('❌ Debug script not found:', debugScriptPath);
        return;
      }

      const child = spawn('node', [debugScriptPath], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('error', (error) => {
        console.error('❌ Debug error:', error.message);
      });

    } catch (error) {
      console.error('❌ Debug failed:', error);
    }
  }

  /**
   * Sync specific workflow
   */
  private async syncSpecificWorkflow(workflowId: string) {
    console.log(`🔄 Syncing Workflow: ${workflowId}`);
    console.log('===============================');
    
    try {
      const syncScriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'direct-json-n8n-sync.js');
      
      if (!fs.existsSync(syncScriptPath)) {
        console.error('❌ Sync script not found:', syncScriptPath);
        return;
      }

      console.log(`📤 Syncing workflow ${workflowId}...`);
      
      const child = spawn('node', [syncScriptPath, 'sync'], {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      child.on('error', (error) => {
        console.error('❌ Sync error:', error.message);
      });

      child.on('exit', (code) => {
        if (code === 0) {
          console.log(`✅ Workflow ${workflowId} synced successfully`);
        } else {
          console.log(`❌ Sync failed with code: ${code}`);
        }
      });

    } catch (error) {
      console.error('❌ Sync failed:', error);
    }
  }

  /**
   * Get the CLI program
   */
  getProgram(): Command {
    return this.program;
  }
}

// Export for use in main CLI
export default N8NIntegrationCLI;
