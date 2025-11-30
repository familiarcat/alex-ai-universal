#!/usr/bin/env node
/**
 * 🖖 Dev Server Readiness Monitor
 * 
 * Monitors Next.js dev servers and reports when they're ready
 * Provides natural language updates and progress indication
 */

const https = require('https');
const http = require('http');

const SERVERS = [
  { port: 3000, name: 'Data Dashboard', url: 'http://localhost:3000' },
  { port: 3001, name: 'Templating Dashboard', url: 'http://localhost:3001' }
];

const CHECK_INTERVAL = 2000; // Check every 2 seconds
const MAX_WAIT_TIME = 120000; // Maximum 2 minutes
const TIMEOUT = 3000; // 3 second timeout per check
const fs = require('fs');

/**
 * Check if a server is responding
 */
function checkServer(server) {
  return new Promise((resolve) => {
    const url = new URL(server.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const req = client.get(server.url, { timeout: TIMEOUT }, (res) => {
      // Check if it's actually responding (not just connection)
      const isReady = res.statusCode >= 200 && res.statusCode < 500;
      resolve({
        server,
        ready: isReady,
        statusCode: res.statusCode,
        timestamp: new Date(),
        responseReceived: true
      });
    });

    req.on('error', (error) => {
      resolve({
        server,
        ready: false,
        statusCode: null,
        timestamp: new Date(),
        error: error.message,
        responseReceived: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        server,
        ready: false,
        statusCode: null,
        timeout: true,
        timestamp: new Date(),
        responseReceived: false
      });
    });
  });
}

/**
 * Format elapsed time
 */
function formatElapsed(ms) {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

/**
 * Check server logs for infinite compilation loop
 */
function checkForInfiniteLoop(port) {
  try {
    const logPath = `/tmp/dashboard-${port}.log`;
    if (!fs.existsSync(logPath)) {
      return { hasLoop: false, message: 'Log file not found' };
    }
    
    const logContent = fs.readFileSync(logPath, 'utf8');
    const lines = logContent.split('\n').filter(line => line.trim());
    const recentLines = lines.slice(-50); // Last 50 lines
    
    // Check for repeated compilation messages
    const compilePatterns = [
      /compiling/i,
      /Compiling/i,
      /building/i,
      /Building/i,
      /recompiling/i
    ];
    
    let compileCount = 0;
    let lastCompileTime = null;
    const compileTimes = [];
    
    recentLines.forEach((line, index) => {
      const hasCompile = compilePatterns.some(pattern => pattern.test(line));
      if (hasCompile) {
        compileCount++;
        compileTimes.push(index);
      }
    });
    
    // If we see more than 20 compilation messages in last 50 lines, likely a loop
    if (compileCount > 20) {
      return {
        hasLoop: true,
        message: `Detected ${compileCount} compilation messages in recent logs`,
        compileCount
      };
    }
    
    // Check for error patterns that might cause loops
    const errorPatterns = [
      /error.*compiling/i,
      /failed.*compile/i,
      /watch.*error/i,
      /file.*changed/i
    ];
    
    const errorCount = recentLines.filter(line => 
      errorPatterns.some(pattern => pattern.test(line))
    ).length;
    
    if (errorCount > 10) {
      return {
        hasLoop: true,
        message: `Detected ${errorCount} compilation errors - likely causing loop`,
        errorCount
      };
    }
    
    return { hasLoop: false, message: 'No loop detected' };
  } catch (error) {
    return { hasLoop: false, message: `Could not check logs: ${error.message}` };
  }
}

/**
 * Create progress bar
 */
function createProgressBar(current, total, width = 40) {
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${current}/${total}`;
}

/**
 * Animated progress bar with spinner
 */
function createAnimatedProgressBar(current, total, elapsed, frame = 0) {
  const width = 30;
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  // Spinner animation
  const spinners = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const spinner = spinners[frame % spinners.length];
  
  // Progress bar with animation
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  return `${spinner} [${bar}] ${current}/${total} (${formatElapsed(elapsed)})`;
}

/**
 * Get detailed check description
 */
function getCheckDescription(server, status, checkCount, lastResult) {
  if (status.ready) {
    return `✅ Ready - HTTP ${status.statusCode}`;
  }
  
  // Provide specific feedback based on what we're checking
  if (checkCount === 1) {
    return `🔍 Check 1: Testing HTTP connection to ${server.url}...`;
  }
  
  if (checkCount === 2) {
    return `🔍 Check 2: Verifying server process is listening on port ${server.port}...`;
  }
  
  if (checkCount === 3) {
    return `🔍 Check 3: Checking if Next.js dev server has started...`;
  }
  
  if (checkCount < 5) {
    return `🔨 Check ${checkCount}: Next.js initial compilation - Building pages and components...`;
  }
  
  if (checkCount < 10) {
    return `📦 Check ${checkCount}: Loading dependencies and processing imports...`;
  }
  
  if (checkCount < 15) {
    return `⚙️  Check ${checkCount}: Processing Next.js configuration and routes...`;
  }
  
  if (checkCount < 20) {
    return `🔄 Check ${checkCount}: Compiling TypeScript/JavaScript files...`;
  }
  
  if (checkCount < 30) {
    return `⏳ Check ${checkCount}: Still compiling - This is taking longer than expected...`;
  }
  
  // After 30 checks, warn about potential infinite loop
  if (checkCount >= 30 && status.consecutiveFailures > 25) {
    return `⚠️  Check ${checkCount}: WARNING - Possible infinite compilation loop detected!`;
  }
  
  return `🔄 Check ${checkCount}: Still waiting for server to respond...`;
}

/**
 * Main monitoring function
 */
async function monitorServers() {
  const startTime = Date.now();
  const serverStatus = new Map();
  let animationFrame = 0;
  
  // Initialize status
  SERVERS.forEach(server => {
    serverStatus.set(server.port, {
      server,
      ready: false,
      lastCheck: null,
      checks: 0,
      consecutiveFailures: 0,
      lastSuccessTime: null
    });
  });

  console.log('🖖 Dev Server Readiness Monitor');
  console.log('================================\n');
  console.log('📊 Monitoring servers:');
  SERVERS.forEach(server => {
    console.log(`   • ${server.name} (${server.url})`);
  });
  console.log('');
  console.log('🔍 Starting checks...\n');

  let allReady = false;
  let checkCount = 0;

  while (!allReady && (Date.now() - startTime) < MAX_WAIT_TIME) {
    checkCount++;
    const elapsed = Date.now() - startTime;
    animationFrame++;
    
    // Check all servers
    const checks = await Promise.all(
      SERVERS.map(server => checkServer(server))
    );

    // Update status
    checks.forEach(result => {
      const status = serverStatus.get(result.server.port);
      const wasReady = status.ready;
      status.ready = result.ready;
      status.lastCheck = result.timestamp;
      status.checks++;
      status.statusCode = result.statusCode;
      
      if (result.ready) {
        status.consecutiveFailures = 0;
        status.lastSuccessTime = result.timestamp;
      } else {
        status.consecutiveFailures++;
      }
    });

    // Count ready servers
    const readyCount = Array.from(serverStatus.values()).filter(s => s.ready).length;
    const totalServers = SERVERS.length;
    allReady = readyCount === totalServers;

    // Show detailed status for each server (with line breaks)
    console.log(`\n📋 Check #${checkCount} - ${formatElapsed(elapsed)} elapsed`);
    console.log('─'.repeat(60));
    
    SERVERS.forEach((server, index) => {
      const status = serverStatus.get(server.port);
      const checkResult = checks[index];
      const description = getCheckDescription(server, status, status.checks, checkResult);
      const progressBar = createAnimatedProgressBar(
        status.ready ? 1 : 0, 
        1, 
        elapsed, 
        animationFrame
      );
      
      console.log(`\n${index + 1}. ${server.name} (Port ${server.port}):`);
      console.log(`   ${description}`);
      console.log(`   ${progressBar}`);
      console.log(`   Total checks: ${status.checks}`);
      
      // Show specific error information
      if (checkResult && !checkResult.ready) {
        if (checkResult.timeout) {
          console.log(`   ⏱️  Connection timeout (${TIMEOUT}ms)`);
        } else if (checkResult.error) {
          console.log(`   ❌ Error: ${checkResult.error}`);
        } else if (!checkResult.responseReceived) {
          console.log(`   🔌 No response received - server may not be listening`);
        }
      }
      
      // Check for infinite loop in logs (every 10 checks)
      if (status.checks % 10 === 0 && status.checks > 10) {
        const loopCheck = checkForInfiniteLoop(server.port);
        if (loopCheck.hasLoop) {
          console.log(`   🚨 INFINITE LOOP DETECTED IN LOGS!`);
          console.log(`   🔴 ${loopCheck.message}`);
          console.log(`   📋 Check log file: /tmp/dashboard-${server.port}.log`);
        }
      }
      
      if (status.consecutiveFailures > 20) {
        console.log(`   ⚠️  Warning: ${status.consecutiveFailures} consecutive failures`);
        console.log(`   💡 Possible causes:`);
        console.log(`      • Next.js compilation error`);
        console.log(`      • Infinite recompilation loop (file watcher issue)`);
        console.log(`      • Port conflict or binding issue`);
        console.log(`      • Missing dependencies`);
        console.log(`      • TypeScript/ESLint configuration error`);
        console.log(`   🔧 Suggested actions:`);
        console.log(`      • Check logs: tail -f /tmp/dashboard-${server.port}.log`);
        console.log(`      • Look for compilation errors in the logs`);
        console.log(`      • Check if file watcher is causing infinite recompilation`);
        console.log(`      • Restart server: kill process and restart`);
        console.log(`      • Clear Next.js cache: rm -rf dashboard/.next`);
      }
      
      // Detect potential infinite loop
      if (status.consecutiveFailures > 30) {
        console.log(`   🚨 INFINITE LOOP DETECTED!`);
        console.log(`   🔴 Server has failed ${status.consecutiveFailures} times in a row`);
        console.log(`   🛑 Recommendation: Stop monitoring and investigate compilation errors`);
        console.log(`   📋 View logs: tail -50 /tmp/dashboard-${server.port}.log`);
      }
    });

    // Overall progress
    const overallProgress = createAnimatedProgressBar(readyCount, totalServers, elapsed, animationFrame);
    console.log(`\n📊 Overall Progress: ${overallProgress}\n`);

    if (!allReady) {
      await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
  }

  // Final status
  console.log('\n' + '='.repeat(50));
  
  if (allReady) {
    console.log('\n✅ ALL SERVERS READY!\n');
    console.log('🎉 Both dev servers are now running and ready:\n');
    
    SERVERS.forEach(server => {
      const status = serverStatus.get(server.port);
      console.log(`   ✅ ${server.name}`);
      console.log(`      URL: ${server.url}`);
      console.log(`      Status: HTTP ${status.statusCode}`);
      console.log(`      Ready in: ${formatElapsed(status.lastCheck - startTime)}\n`);
    });

    console.log('🚀 You can now:');
    console.log('   • Open http://localhost:3000 for Data Dashboard');
    console.log('   • Open http://localhost:3001 for Templating Dashboard');
    console.log('   • Test real-time updates between both instances\n');
    
    console.log('💡 Next steps:');
    console.log('   • Make changes in one dashboard');
    console.log('   • Watch them sync to the other in real-time');
    console.log('   • Test data and templating selection updates\n');
    
    return true;
  } else {
    console.log('\n⚠️  SERVERS NOT READY AFTER MAXIMUM WAIT TIME\n');
    console.log('📊 Final Status:\n');
    
    SERVERS.forEach(server => {
      const status = serverStatus.get(server.port);
      const icon = status.ready ? '✅' : '❌';
      console.log(`   ${icon} ${server.name}: ${status.ready ? 'Ready' : 'Not responding'}`);
      if (!status.ready) {
        console.log(`      Checks performed: ${status.checks}`);
        console.log(`      Last check: ${status.lastCheck ? new Date(status.lastCheck).toLocaleTimeString() : 'Never'}`);
      }
    });
    
    console.log('\n💡 Troubleshooting:');
    console.log('   • Check server logs for compilation errors');
    console.log('   • Verify ports 3000 and 3001 are not blocked');
    console.log('   • Ensure Next.js dependencies are installed');
    console.log('   • Try restarting the servers manually\n');
    
    return false;
  }
}

// Run monitor
monitorServers()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Monitor error:', error.message);
    process.exit(1);
  });

