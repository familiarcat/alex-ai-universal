#!/usr/bin/env node

/**
 * Start Codebase Watcher Service
 * 
 * Monitors codebase changes and sends updates to dashboard
 * 
 * Reviewed by: Lt. Cmdr. La Forge (Infrastructure) & Commander Riker (Execution)
 */

const CodebaseWatcher = require('../lib/codebase-watcher');
const http = require('http');

const watcher = new CodebaseWatcher({
  rootDir: process.cwd(),
  debounceDelay: 1000
});

// Start watching
watcher.start();

// Send changes to dashboard API
const http = require('http');
const { URL } = require('url');

watcher.onChange(async (change) => {
  try {
    const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
    const apiUrl = new URL('/api/codebase-changes', dashboardUrl);
    
    const postData = JSON.stringify(change);
    
    const options = {
      hostname: apiUrl.hostname,
      port: apiUrl.port || (apiUrl.protocol === 'https:' ? 443 : 80),
      path: apiUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log(`✅ Change sent to dashboard: ${change.filePath}`);
      } else {
        console.error(`❌ Dashboard API returned ${res.statusCode}`);
      }
    });
    
    req.on('error', (error) => {
      console.error('❌ Failed to send change to dashboard:', error.message);
    });
    
    req.write(postData);
    req.end();
  } catch (error) {
    console.error('❌ Failed to send change to dashboard:', error.message);
  }
});

// Health check server
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    const stats = watcher.getStats();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      ...stats
    }));
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.WATCHER_PORT || 3002;
server.listen(PORT, () => {
  console.log(`\n🖖 Codebase Watcher Service`);
  console.log('═'.repeat(60));
  console.log(`✅ Watcher running on port ${PORT}`);
  console.log(`✅ Monitoring: ${process.cwd()}`);
  console.log(`✅ Dashboard: ${process.env.DASHBOARD_URL || 'http://localhost:3000'}`);
  console.log('\nPress Ctrl+C to stop\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down watcher...');
  watcher.stop();
  server.close();
  process.exit(0);
});

