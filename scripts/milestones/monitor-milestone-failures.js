#!/usr/bin/env node
/**
 * Monitor Milestone Script Failures
 * 
 * Light monitoring mode for Commander Data to watch for milestone push failures
 * Can be called in watch mode to monitor script execution
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', '.milestone-monitor.log');
const MAX_LOG_SIZE = 100 * 1024; // 100KB

function log(message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  
  // Rotate log if too large
  if (fs.existsSync(LOG_FILE)) {
    const stats = fs.statSync(LOG_FILE);
    if (stats.size > MAX_LOG_SIZE) {
      const content = fs.readFileSync(LOG_FILE, 'utf8');
      const lines = content.split('\n');
      const keepLines = lines.slice(-500); // Keep last 500 lines
      fs.writeFileSync(LOG_FILE, keepLines.join('\n'));
    }
  }
  
  fs.appendFileSync(LOG_FILE, logEntry);
  console.log(logEntry.trim());
}

function monitorMilestoneExecution(milestoneName) {
  return new Promise((resolve, reject) => {
    log(`🤖 Commander Data: Monitoring milestone execution: ${milestoneName}`);
    
    const scriptPath = path.join(__dirname, 'alex-ai-enhanced-milestone-push-corrected.sh');
    const child = spawn('bash', [scriptPath, milestoneName], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env }
    });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ Milestone execution successful: ${milestoneName}`);
        resolve({ success: true, code, stdout, stderr });
      } else {
        log(`❌ Milestone execution failed: ${milestoneName} (exit code: ${code})`);
        log(`   Error output: ${stderr.substring(0, 500)}`);
        reject({ success: false, code, stdout, stderr });
      }
    });
    
    child.on('error', (error) => {
      log(`❌ Failed to execute milestone script: ${error.message}`);
      reject({ success: false, error: error.message });
    });
  });
}

// Watch mode - monitor for failures
async function watchMode() {
  log('🤖 Commander Data: Starting milestone failure monitoring (watch mode)');
  log('   Monitoring script: alex-ai-enhanced-milestone-push-corrected.sh');
  log('   Log file: ' + LOG_FILE);
  log('   Press Ctrl+C to stop monitoring');
  log('');
  
  // Monitor log file for new error entries
  if (fs.existsSync(LOG_FILE)) {
    let lastSize = fs.statSync(LOG_FILE).size;
    
    setInterval(() => {
      try {
        const currentSize = fs.statSync(LOG_FILE).size;
        if (currentSize > lastSize) {
          const content = fs.readFileSync(LOG_FILE, 'utf8');
          const newLines = content.split('\n').slice(-10);
          const errors = newLines.filter(line => line.includes('❌') || line.includes('ERROR'));
          
          if (errors.length > 0) {
            console.log('\n⚠️  New errors detected:');
            errors.forEach(err => console.log('   ' + err));
          }
          
          lastSize = currentSize;
        }
      } catch (error) {
        // Ignore file read errors
      }
    }, 5000); // Check every 5 seconds
  }
}

// Main execution
const args = process.argv.slice(2);

if (args[0] === '--watch' || args[0] === '-w') {
  watchMode().catch(error => {
    console.error('❌ Watch mode failed:', error);
    process.exit(1);
  });
} else if (args[0]) {
  // Execute and monitor a specific milestone
  monitorMilestoneExecution(args[0])
    .then(result => {
      console.log('✅ Milestone completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Milestone failed:', error);
      process.exit(1);
    });
} else {
  console.log('Usage:');
  console.log('  node scripts/monitor-milestone-failures.js "Milestone Name"  # Monitor specific milestone');
  console.log('  node scripts/monitor-milestone-failures.js --watch          # Watch mode for failures');
  process.exit(1);
}

