#!/usr/bin/env node
/**
 * Diagnose Cursor AI Startup Issues
 * 
 * Checks all components of the automatic startup system
 * and reports any issues found.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const CURSOR_DIR = path.join(PROJECT_ROOT, '.cursor');
const ALEX_AI_DIR = path.join(CURSOR_DIR, 'alex-ai');

console.log('🔍 Diagnosing Cursor AI Startup System...\n');
console.log('='.repeat(60));

const diagnostics = {
  timestamp: new Date().toISOString(),
  checks: [],
  issues: [],
  recommendations: []
};

// Check 1: Required directories exist
function checkDirectories() {
  console.log('\n📁 Checking directories...');
  const dirs = [
    { path: CURSOR_DIR, name: '.cursor' },
    { path: ALEX_AI_DIR, name: '.cursor/alex-ai' },
    { path: path.join(PROJECT_ROOT, '.vscode'), name: '.vscode' }
  ];

  dirs.forEach(dir => {
    const exists = fs.existsSync(dir.path);
    diagnostics.checks.push({
      check: `Directory exists: ${dir.name}`,
      status: exists ? '✅' : '❌',
      path: dir.path
    });
    if (!exists) {
      diagnostics.issues.push(`Missing directory: ${dir.name}`);
    }
  });
}

// Check 2: Configuration files exist
function checkConfigFiles() {
  console.log('\n⚙️  Checking configuration files...');
  const files = [
    { path: path.join(PROJECT_ROOT, '.cursorrules'), name: '.cursorrules', required: true },
    { path: path.join(PROJECT_ROOT, '.vscode', 'tasks.json'), name: '.vscode/tasks.json', required: true },
    { path: path.join(CURSOR_DIR, 'settings.json'), name: '.cursor/settings.json', required: true },
    { path: path.join(ALEX_AI_DIR, 'cursor-startup-prompt.md'), name: '.cursor/alex-ai/cursor-startup-prompt.md', required: false }
  ];

  files.forEach(file => {
    const exists = fs.existsSync(file.path);
    const status = exists ? '✅' : (file.required ? '❌' : '⚠️');
    diagnostics.checks.push({
      check: `File exists: ${file.name}`,
      status,
      path: file.path,
      required: file.required
    });
    if (!exists && file.required) {
      diagnostics.issues.push(`Missing required file: ${file.name}`);
    }
  });
}

// Check 3: Tasks configuration
function checkTasksConfig() {
  console.log('\n📋 Checking tasks configuration...');
  const tasksPath = path.join(PROJECT_ROOT, '.vscode', 'tasks.json');
  
  if (fs.existsSync(tasksPath)) {
    try {
      const tasks = JSON.parse(fs.readFileSync(tasksPath, 'utf8'));
      const tasksWithFolderOpen = tasks.tasks?.filter(t => 
        t.runOptions?.runOn === 'folderOpen'
      ) || [];
      
      diagnostics.checks.push({
        check: 'Tasks with runOn: folderOpen',
        status: tasksWithFolderOpen.length > 0 ? '✅' : '⚠️',
        count: tasksWithFolderOpen.length
      });
      
      if (tasksWithFolderOpen.length === 0) {
        diagnostics.issues.push('No tasks configured to run on folder open');
        diagnostics.recommendations.push('Add runOn: "folderOpen" to startup tasks in .vscode/tasks.json');
      }
    } catch (error) {
      diagnostics.issues.push(`Error reading tasks.json: ${error.message}`);
    }
  }
}

// Check 4: Scripts exist and are executable
function checkScripts() {
  console.log('\n📜 Checking startup scripts...');
  const scripts = [
    { path: path.join(PROJECT_ROOT, 'scripts', 'crew', 'coordination', 'load-crew-memories.js'), name: 'load-crew-memories.js' },
    { path: path.join(PROJECT_ROOT, 'scripts', 'generate-cursor-prompt.js'), name: 'generate-cursor-prompt.js' },
    { path: path.join(PROJECT_ROOT, 'scripts', 'cursor-startup.sh'), name: 'cursor-startup.sh' }
  ];

  scripts.forEach(script => {
    const exists = fs.existsSync(script.path);
    diagnostics.checks.push({
      check: `Script exists: ${script.name}`,
      status: exists ? '✅' : '❌',
      path: script.path
    });
    if (!exists) {
      diagnostics.issues.push(`Missing script: ${script.name}`);
    }
  });
}

// Check 5: Test script execution
function testScriptExecution() {
  console.log('\n🧪 Testing script execution...');
  
  try {
    console.log('  Testing: npm run cursor:memories');
    execSync('npm run cursor:memories', { 
      cwd: PROJECT_ROOT, 
      stdio: 'pipe',
      timeout: 10000 
    });
    diagnostics.checks.push({
      check: 'Script execution: cursor:memories',
      status: '✅'
    });
  } catch (error) {
    diagnostics.checks.push({
      check: 'Script execution: cursor:memories',
      status: '❌',
      error: error.message
    });
    diagnostics.issues.push(`Failed to execute cursor:memories: ${error.message}`);
  }
}

// Check 6: Startup prompt freshness
function checkPromptFreshness() {
  console.log('\n📄 Checking startup prompt...');
  const promptPath = path.join(ALEX_AI_DIR, 'cursor-startup-prompt.md');
  
  if (fs.existsSync(promptPath)) {
    const stats = fs.statSync(promptPath);
    const age = Date.now() - stats.mtimeMs;
    const ageHours = age / (1000 * 60 * 60);
    const ageDays = age / (1000 * 60 * 60 * 24);
    
    const isFresh = ageHours < 24;
    diagnostics.checks.push({
      check: 'Startup prompt freshness',
      status: isFresh ? '✅' : '⚠️',
      age: ageDays < 1 ? `${Math.round(ageHours)} hours` : `${Math.round(ageDays)} days`
    });
    
    if (!isFresh) {
      diagnostics.issues.push(`Startup prompt is ${Math.round(ageDays)} days old`);
      diagnostics.recommendations.push('Run: npm run cursor:prompt to refresh the startup prompt');
    }
  } else {
    diagnostics.issues.push('Startup prompt file not found');
    diagnostics.recommendations.push('Run: npm run cursor:prompt to generate the startup prompt');
  }
}

// Check 7: Environment variables
function checkEnvironment() {
  console.log('\n🔐 Checking environment...');
  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const optional = ['N8N_URL', 'OPENROUTER_API_KEY'];
  
  required.forEach(env => {
    const exists = !!process.env[env];
    diagnostics.checks.push({
      check: `Environment: ${env}`,
      status: exists ? '✅' : '❌'
    });
    if (!exists) {
      diagnostics.issues.push(`Missing environment variable: ${env}`);
    }
  });
  
  optional.forEach(env => {
    const exists = !!process.env[env];
    diagnostics.checks.push({
      check: `Environment: ${env} (optional)`,
      status: exists ? '✅' : '⚠️'
    });
  });
}

// Run all checks
checkDirectories();
checkConfigFiles();
checkTasksConfig();
checkScripts();
testScriptExecution();
checkPromptFreshness();
checkEnvironment();

// Generate report
console.log('\n' + '='.repeat(60));
console.log('\n📊 DIAGNOSTIC REPORT\n');

const totalChecks = diagnostics.checks.length;
const passedChecks = diagnostics.checks.filter(c => c.status === '✅').length;
const failedChecks = diagnostics.checks.filter(c => c.status === '❌').length;
const warnings = diagnostics.checks.filter(c => c.status === '⚠️').length;

console.log(`Total Checks: ${totalChecks}`);
console.log(`✅ Passed: ${passedChecks}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Failed: ${failedChecks}`);

if (diagnostics.issues.length > 0) {
  console.log('\n🚨 ISSUES FOUND:\n');
  diagnostics.issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}

if (diagnostics.recommendations.length > 0) {
  console.log('\n💡 RECOMMENDATIONS:\n');
  diagnostics.recommendations.forEach((rec, i) => {
    console.log(`  ${i + 1}. ${rec}`);
  });
}

// Save report
const reportPath = path.join(CURSOR_DIR, 'startup-diagnostic-report.json');
fs.writeFileSync(reportPath, JSON.stringify(diagnostics, null, 2));
console.log(`\n💾 Report saved to: ${reportPath}`);

// Final recommendation
console.log('\n' + '='.repeat(60));
if (diagnostics.issues.length === 0) {
  console.log('\n✅ All checks passed! Startup system appears healthy.');
  console.log('\n💡 If tasks still don\'t run automatically:');
  console.log('   1. Cursor AI may not support automatic task execution');
  console.log('   2. Run manually: npm run cursor:prompt');
  console.log('   3. Or use Command Palette: "🖖 Alex AI Full Startup"');
} else {
  console.log('\n⚠️  Issues detected. Please review and fix the issues above.');
}

console.log('\n');

