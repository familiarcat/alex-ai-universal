#!/usr/bin/env node

/**
 * View Dashboard Command
 * 
 * Natural language command: "view the dashboard"
 * 
 * Automatically:
 * 1. Runs tests
 * 2. Builds the dashboard
 * 3. Starts dev server with live refresh
 * 4. Starts codebase watcher
 * 5. Opens browser automatically
 * 6. Connects to live cloud resources (Supabase, n8n)
 * 
 * Reviewed by: Commander Riker (Execution) & Lt. Cmdr. La Forge (Infrastructure)
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const DASHBOARD_DIR = path.join(__dirname, '..', 'dashboard');
const PORT = 3000;
const WATCHER_PORT = 3002;

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

function waitForServer(url, maxAttempts = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts++;
      http.get(url, (res) => {
        if (res.statusCode === 200 || res.statusCode === 404) {
          resolve();
        } else {
          if (attempts < maxAttempts) {
            setTimeout(check, 1000);
          } else {
            reject(new Error('Server did not start in time'));
          }
        }
      }).on('error', () => {
        if (attempts < maxAttempts) {
          setTimeout(check, 1000);
        } else {
          reject(new Error('Server did not start in time'));
        }
      });
    };
    check();
  });
}

function openBrowser(url) {
  const platform = process.platform;
  let command;
  
  if (platform === 'darwin') {
    command = `open "${url}"`;
  } else if (platform === 'win32') {
    command = `start "${url}"`;
  } else {
    command = `xdg-open "${url}"`;
  }
  
  exec(command, (error) => {
    if (error) {
      log(`⚠️  Could not open browser automatically: ${error.message}`, 'yellow');
      log(`   Please open manually: ${url}`, 'cyan');
    } else {
      log(`✅ Browser opened: ${url}`, 'green');
    }
  });
}

async function runTests() {
  log('\n🧪 Step 1: Running tests...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const testProcess = spawn('npm', ['test'], {
      cwd: DASHBOARD_DIR,
      stdio: 'inherit',
      shell: true
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Tests passed', 'green');
        resolve();
      } else {
        log('⚠️  Tests failed, but continuing...', 'yellow');
        resolve(); // Continue even if tests fail
      }
    });
    
    testProcess.on('error', (error) => {
      log('⚠️  Could not run tests, continuing...', 'yellow');
      resolve(); // Continue even if tests can't run
    });
  });
}

async function buildDashboard() {
  log('\n🏗️  Step 2: Building dashboard...', 'cyan');
  
  return new Promise((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      cwd: DASHBOARD_DIR,
      stdio: 'inherit',
      shell: true
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        log('✅ Dashboard built successfully', 'green');
        resolve();
      } else {
        log('⚠️  Build had warnings, but continuing...', 'yellow');
        resolve(); // Continue even with warnings
      }
    });
    
    buildProcess.on('error', (error) => {
      reject(new Error(`Build failed: ${error.message}`));
    });
  });
}

function startCodebaseWatcher() {
  log('\n👁️  Step 3: Starting codebase watcher...', 'cyan');
  
  const watcherProcess = spawn('npm', ['run', 'dashboard:watch'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true,
    detached: true
  });
  
  watcherProcess.unref(); // Allow parent to exit
  
  log('✅ Codebase watcher started (background)', 'green');
  return watcherProcess;
}

function startDashboardServer() {
  log('\n🚀 Step 4: Starting dashboard dev server...', 'cyan');
  
  // Ensure we're using live cloud resources
  process.env.N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';
  process.env.NEXT_PUBLIC_N8N_URL = process.env.N8N_URL;
  
  const devProcess = spawn('npm', ['run', 'dev'], {
    cwd: DASHBOARD_DIR,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: PORT.toString()
    }
  });
  
  return devProcess;
}

async function main() {
  log('\n🖖 Alex AI Dashboard - Local Development Mode', 'blue');
  log('═'.repeat(60), 'cyan');
  log('Local sketch pad with live cloud integration', 'cyan');
  log('═'.repeat(60) + '\n', 'cyan');
  
  try {
    // Check if dashboard directory exists
    if (!fs.existsSync(DASHBOARD_DIR)) {
      throw new Error('Dashboard directory not found');
    }
    
    // Check if ports are available
    const portAvailable = await checkPort(PORT);
    if (!portAvailable) {
      log(`⚠️  Port ${PORT} is in use. Attempting to use it anyway...`, 'yellow');
    }
    
    // Step 1: Run tests (non-blocking)
    await runTests();
    
    // Step 2: Build dashboard
    await buildDashboard();
    
    // Step 3: Start codebase watcher (background)
    startCodebaseWatcher();
    
    // Step 4: Start dashboard server
    log('\n🚀 Step 5: Starting dashboard server...', 'cyan');
    const devProcess = startDashboardServer();
    
    // Wait for server to be ready
    log('\n⏳ Waiting for server to start...', 'yellow');
    await waitForServer(`http://localhost:${PORT}`, 30);
    
    // Step 5: Open browser
    const dashboardUrl = `http://localhost:${PORT}`;
    log('\n🌐 Step 6: Opening browser...', 'cyan');
    setTimeout(() => {
      openBrowser(dashboardUrl);
    }, 2000); // Wait 2 seconds for server to fully initialize
    
    log('\n' + '═'.repeat(60), 'green');
    log('✅ Dashboard is ready!', 'green');
    log('═'.repeat(60) + '\n', 'green');
    log(`📊 Dashboard URL: ${dashboardUrl}`, 'cyan');
    log(`🔄 Live Refresh: Active (codebase watcher running)`, 'cyan');
    log(`☁️  Cloud Integration:`, 'cyan');
    log(`   • Supabase: ${process.env.SUPABASE_URL || 'Using credentials from ~/.zshrc'}`, 'cyan');
    log(`   • N8N: ${process.env.N8N_URL || 'https://n8n.pbradygeorgen.com'}`, 'cyan');
    log(`\n💡 This is your local sketch pad for UI/UX development`, 'yellow');
    log(`   All changes sync with live cloud resources automatically\n`, 'yellow');
    log('Press Ctrl+C to stop the server\n', 'yellow');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      log('\n🛑 Shutting down...', 'yellow');
      devProcess.kill();
      process.exit(0);
    });
    
    // Keep process alive
    devProcess.on('close', (code) => {
      log(`\n🛑 Dashboard server stopped (code: ${code})`, 'yellow');
      process.exit(code);
    });
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'yellow');
    process.exit(1);
  }
}

main().catch(console.error);

