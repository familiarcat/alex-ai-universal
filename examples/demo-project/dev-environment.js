/**
 * Alex AI Demo Project - Development Environment
 * 
 * Runs both website and dashboard servers in development mode
 * with automatic restarts and enhanced logging
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class AlexAIDevEnvironment {
  constructor() {
    this.processes = new Map();
    this.isRunning = false;
    this.logs = [];
  }

  /**
   * Start the development environment
   */
  async start() {
    console.log('🖖 ALEX AI DEMO PROJECT - DEVELOPMENT ENVIRONMENT');
    console.log('='.repeat(60));
    console.log('Starting development servers...\n');

    try {
      // Start website server
      await this.startWebsiteServer();
      
      // Wait a moment for website server to start
      await this.sleep(2000);
      
      // Start dashboard server
      await this.startDashboardServer();
      
      // Wait a moment for dashboard server to start
      await this.sleep(2000);
      
      // Display status
      this.displayStatus();
      
      this.isRunning = true;
      
      console.log('\n✅ Development environment started successfully!');
      console.log('🌐 Website: http://localhost:3000');
      console.log('🎛️ Dashboard: http://localhost:3001');
      console.log('\n📋 Available Commands:');
      console.log('  - Press Ctrl+C to stop all servers');
      console.log('  - Check logs above for any issues');
      console.log('  - Both servers will auto-restart on file changes');
      
    } catch (error) {
      console.error('❌ Failed to start development environment:', error);
      await this.stop();
      process.exit(1);
    }
  }

  /**
   * Start website server
   */
  async startWebsiteServer() {
    console.log('🌐 Starting dynamic website server...');
    
    const websiteProcess = spawn('node', ['src/dynamic-web-server.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' }
    });

    websiteProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.log(`[WEBSITE] ${message}`);
        this.logs.push({ server: 'website', message, timestamp: new Date() });
      }
    });

    websiteProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.error(`[WEBSITE ERROR] ${message}`);
        this.logs.push({ server: 'website', message, timestamp: new Date(), error: true });
      }
    });

    websiteProcess.on('close', (code) => {
      console.log(`[WEBSITE] Process exited with code ${code}`);
      if (this.isRunning) {
        console.log('🔄 Restarting website server...');
        setTimeout(() => this.startWebsiteServer(), 2000);
      }
    });

    this.processes.set('website', websiteProcess);
    console.log('✅ Website server started');
  }

  /**
   * Start dashboard server
   */
  async startDashboardServer() {
    console.log('🎛️ Starting enhanced dashboard server...');
    
    const dashboardProcess = spawn('node', ['src/enhanced-dashboard-server.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' }
    });

    dashboardProcess.stdout.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.log(`[DASHBOARD] ${message}`);
        this.logs.push({ server: 'dashboard', message, timestamp: new Date() });
      }
    });

    dashboardProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.error(`[DASHBOARD ERROR] ${message}`);
        this.logs.push({ server: 'dashboard', message, timestamp: new Date(), error: true });
      }
    });

    dashboardProcess.on('close', (code) => {
      console.log(`[DASHBOARD] Process exited with code ${code}`);
      if (this.isRunning) {
        console.log('🔄 Restarting dashboard server...');
        setTimeout(() => this.startDashboardServer(), 2000);
      }
    });

    this.processes.set('dashboard', dashboardProcess);
    console.log('✅ Dashboard server started');
  }

  /**
   * Display current status
   */
  displayStatus() {
    console.log('\n📊 DEVELOPMENT ENVIRONMENT STATUS');
    console.log('='.repeat(40));
    console.log(`🟢 Website Server: Running (PID: ${this.processes.get('website')?.pid || 'N/A'})`);
    console.log(`🟢 Dashboard Server: Running (PID: ${this.processes.get('dashboard')?.pid || 'N/A'})`);
    console.log(`📝 Total Log Entries: ${this.logs.length}`);
    
    const errorCount = this.logs.filter(log => log.error).length;
    if (errorCount > 0) {
      console.log(`⚠️ Errors: ${errorCount}`);
    } else {
      console.log('✅ No errors detected');
    }
  }

  /**
   * Stop all processes
   */
  async stop() {
    console.log('\n🛑 Stopping development environment...');
    
    this.isRunning = false;
    
    for (const [name, process] of this.processes) {
      if (process && !process.killed) {
        console.log(`Stopping ${name} server...`);
        process.kill('SIGTERM');
        
        // Force kill after 5 seconds if not stopped
        setTimeout(() => {
          if (!process.killed) {
            process.kill('SIGKILL');
          }
        }, 5000);
      }
    }
    
    console.log('✅ Development environment stopped');
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Setup signal handlers
   */
  setupSignalHandlers() {
    process.on('SIGINT', async () => {
      console.log('\n🛑 Received SIGINT, shutting down gracefully...');
      await this.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
      await this.stop();
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      console.error('\n❌ Uncaught Exception:', error);
      await this.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('\n❌ Unhandled Rejection at:', promise, 'reason:', reason);
      await this.stop();
      process.exit(1);
    });
  }
}

// Create and start development environment
if (require.main === module) {
  const devEnv = new AlexAIDevEnvironment();
  
  // Setup signal handlers
  devEnv.setupSignalHandlers();
  
  // Start development environment
  devEnv.start().catch(error => {
    console.error('❌ Development environment failed:', error);
    process.exit(1);
  });
}

module.exports = AlexAIDevEnvironment;
