#!/usr/bin/env node
/**
 * Kill processes on ports 3000-3009
 * 
 * Ensures clean startup for Next.js dashboard
 */

const { execSync } = require('child_process');

function killPort(port) {
  try {
    // Find process using the port
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
    
    if (result) {
      const pids = result.split('\n').filter(Boolean);
      pids.forEach(pid => {
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
          console.log(`   ✅ Killed process ${pid} on port ${port}`);
        } catch (error) {
          // Process may have already terminated
        }
      });
      return true;
    }
    return false;
  } catch (error) {
    // No process found on this port
    return false;
  }
}

function killAllPorts() {
  console.log('🔧 Killing processes on ports 3000-3009...\n');
  
  let killed = 0;
  for (let port = 3000; port <= 3009; port++) {
    if (killPort(port)) {
      killed++;
    }
  }
  
  if (killed > 0) {
    console.log(`\n✅ Killed ${killed} process(es)\n`);
  } else {
    console.log('\n✅ No processes found on ports 3000-3009\n');
  }
  
  // Wait a moment for ports to be released
  return new Promise(resolve => setTimeout(resolve, 2000));
}

if (require.main === module) {
  killAllPorts().then(() => {
    console.log('✅ Port cleanup complete');
    process.exit(0);
  });
}

module.exports = { killAllPorts, killPort };

