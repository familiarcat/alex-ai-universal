#!/usr/bin/env node
/**
 * Start Dashboard with Clean Ports
 * 
 * Kills processes on ports 3000-3009, then starts Next.js dashboard
 */

const { killAllPorts } = require('./utils/kill-port-processes');
const { spawn } = require('child_process');
const path = require('path');

async function startDashboard() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 Starting Dashboard with Clean Ports');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Kill existing processes
  await killAllPorts();

  // Start Next.js server
  console.log('📦 Starting Next.js dashboard...\n');

  const dashboardPath = path.join(__dirname, '../dashboard');
  const server = spawn('npm', ['run', 'dev'], {
    cwd: dashboardPath,
    stdio: 'inherit',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

  server.on('exit', (code) => {
    if (code !== 0) {
      console.error(`❌ Server exited with code ${code}`);
    }
  });

  // Wait a moment, then open browser
  setTimeout(() => {
    console.log('\n🌐 Opening dashboard in browser...\n');
    const { exec } = require('child_process');
    exec('open http://localhost:3000/dashboard/vector-priority', (error) => {
      if (error) {
        console.log('📊 Dashboard URL: http://localhost:3000/dashboard/vector-priority\n');
      }
    });
  }, 5000);

  console.log('✅ Dashboard starting...');
  console.log('📊 Will be available at: http://localhost:3000/dashboard/vector-priority\n');
  console.log('Press Ctrl+C to stop\n');
}

if (require.main === module) {
  startDashboard().catch(error => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
}

module.exports = { startDashboard };

