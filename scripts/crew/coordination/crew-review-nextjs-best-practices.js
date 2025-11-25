#!/usr/bin/env node

/**
 * 🖖 Crew Review: Next.js Best Practices & File System Analysis
 * 
 * Crew members review the codebase against Next.js documentation
 * and best practices to diagnose server startup issues
 * 
 * Usage:
 *   node scripts/crew/coordination/crew-review-nextjs-best-practices.js
 */

const fs = require('fs');
const path = require('path');

const CREW_REVIEW = {
  data: {
    name: 'Commander Data',
    icon: '🤖',
    focus: 'Technical Analysis - Next.js Configuration & File Structure',
    checks: [
      'Verify next.config.js follows Next.js 13+ App Router patterns',
      'Check for proper file structure (app/ directory)',
      'Validate TypeScript configuration',
      'Review dynamic imports and SSR configuration'
    ]
  },
  la_forge: {
    name: 'Lieutenant Commander Geordi La Forge',
    icon: '🔧',
    focus: 'Infrastructure - Dependencies & Build Process',
    checks: [
      'Verify package.json dependencies match Next.js requirements',
      'Check for missing peer dependencies',
      'Validate build scripts and dev server configuration',
      'Review Node.js version compatibility'
    ]
  },
  worf: {
    name: 'Lieutenant Worf',
    icon: '⚔️',
    focus: 'Security & Validation - Configuration Security',
    checks: [
      'Verify no security headers blocking server startup',
      'Check for port conflicts or firewall issues',
      'Validate environment variable configuration'
    ]
  },
  obrien: {
    name: 'Chief Miles O\'Brien',
    icon: '🛠️',
    focus: 'Pragmatic Solutions - Common Issues & Quick Fixes',
    checks: [
      'Check for common Next.js startup errors',
      'Verify .next cache isn\'t corrupted',
      'Check for port binding issues',
      'Review error logs and startup messages'
    ]
  }
};

const dashboardPath = path.join(process.cwd(), 'dashboard');

function checkFileExists(filePath, description) {
  const fullPath = path.join(dashboardPath, filePath);
  const exists = fs.existsSync(fullPath);
  return {
    file: filePath,
    description,
    exists,
    path: fullPath
  };
}

function readJsonFile(filePath) {
  try {
    const fullPath = path.join(dashboardPath, filePath);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
    return null;
  } catch (err) {
    return { error: err.message };
  }
}

function analyzeNextConfig() {
  const configPath = path.join(dashboardPath, 'next.config.js');
  if (!fs.existsSync(configPath)) {
    return { error: 'next.config.js not found' };
  }
  
  const content = fs.readFileSync(configPath, 'utf8');
  const issues = [];
  const good = [];
  
  // Check for App Router compatibility
  if (content.includes('app/')) {
    good.push('App Router directory structure detected');
  }
  
  // Check for problematic configurations
  if (content.includes('output: \'export\'')) {
    issues.push('Static export mode enabled - this prevents dev server');
  }
  
  if (content.includes('experimental')) {
    good.push('Experimental features may be configured');
  }
  
  return { issues, good, content };
}

function analyzePackageJson() {
  const pkg = readJsonFile('package.json');
  if (!pkg || pkg.error) {
    return { error: 'package.json not found or invalid' };
  }
  
  const issues = [];
  const good = [];
  const recommendations = [];
  
  // Check Next.js version
  if (pkg.dependencies && pkg.dependencies.next) {
    const nextVersion = pkg.dependencies.next;
    good.push(`Next.js version: ${nextVersion}`);
    
    // Check if version is compatible
    const majorVersion = parseInt(nextVersion.replace(/[^0-9]/g, '').charAt(0));
    if (majorVersion < 13) {
      issues.push('Next.js version < 13 - App Router requires 13+');
    }
  } else {
    issues.push('Next.js not found in dependencies');
  }
  
  // Check React version
  if (pkg.dependencies && pkg.dependencies.react) {
    good.push(`React version: ${pkg.dependencies.react}`);
  }
  
  // Check dev script
  if (pkg.scripts && pkg.scripts.dev) {
    good.push(`Dev script: ${pkg.scripts.dev}`);
    if (!pkg.scripts.dev.includes('next dev')) {
      issues.push('Dev script may not be using Next.js dev server');
    }
  } else {
    issues.push('No dev script found');
  }
  
  // Check for required dependencies
  const required = ['next', 'react', 'react-dom'];
  const missing = required.filter(dep => !pkg.dependencies || !pkg.dependencies[dep]);
  if (missing.length > 0) {
    issues.push(`Missing required dependencies: ${missing.join(', ')}`);
  }
  
  return { issues, good, recommendations, pkg };
}

function analyzeFileStructure() {
  const checks = [
    checkFileExists('app', 'App Router directory'),
    checkFileExists('app/layout.tsx', 'Root layout'),
    checkFileExists('app/page.tsx', 'Root page'),
    checkFileExists('app/dashboard', 'Dashboard route'),
    checkFileExists('app/dashboard/page.tsx', 'Dashboard page'),
    checkFileExists('next.config.js', 'Next.js configuration'),
    checkFileExists('package.json', 'Package configuration'),
    checkFileExists('tsconfig.json', 'TypeScript configuration'),
    checkFileExists('.next', 'Build cache (should exist after first build)')
  ];
  
  return checks;
}

function checkPortBinding() {
  const issues = [];
  
  // Check if port 3000 is available
  try {
    const { execSync } = require('child_process');
    const result = execSync('lsof -ti:3000 2>/dev/null || echo "free"', { encoding: 'utf8' }).trim();
    if (result !== 'free') {
      issues.push(`Port 3000 is in use by process: ${result}`);
    }
  } catch (err) {
    // Command failed, assume port check unavailable
  }
  
  return issues;
}

async function crewReview() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                               ║');
  console.log('║      🖖 CREW REVIEW: Next.js Best Practices & File System Analysis 🖖        ║');
  console.log('║                                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  console.log('📋 Issue: Server connection refused - page hangs and times out');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Commander Data - Technical Analysis
  console.log('🤖 COMMANDER DATA - Technical Analysis');
  console.log('──────────────────────────────────────────────────────────────────────\n');
  
  console.log('   Analyzing Next.js configuration and file structure...\n');
  
  const nextConfig = analyzeNextConfig();
  if (nextConfig.error) {
    console.log(`   ❌ ${nextConfig.error}`);
  } else {
    console.log('   ✅ next.config.js found');
    if (nextConfig.good.length > 0) {
      nextConfig.good.forEach(item => console.log(`   ✅ ${item}`));
    }
    if (nextConfig.issues.length > 0) {
      nextConfig.issues.forEach(item => console.log(`   ⚠️  ${item}`));
    }
  }
  
  const fileStructure = analyzeFileStructure();
  console.log('\n   File Structure Analysis:');
  fileStructure.forEach(check => {
    if (check.exists) {
      console.log(`   ✅ ${check.description}: ${check.file}`);
    } else {
      console.log(`   ❌ ${check.description}: ${check.file} - MISSING`);
    }
  });
  
  // La Forge - Infrastructure
  console.log('\n\n🔧 LIEUTENANT COMMANDER GEORDI LA FORGE - Infrastructure');
  console.log('──────────────────────────────────────────────────────────────────────\n');
  
  console.log('   Analyzing dependencies and build configuration...\n');
  
  const pkgAnalysis = analyzePackageJson();
  if (pkgAnalysis.error) {
    console.log(`   ❌ ${pkgAnalysis.error}`);
  } else {
    console.log('   ✅ package.json found');
    if (pkgAnalysis.good.length > 0) {
      pkgAnalysis.good.forEach(item => console.log(`   ✅ ${item}`));
    }
    if (pkgAnalysis.issues.length > 0) {
      pkgAnalysis.issues.forEach(item => console.log(`   ⚠️  ${item}`));
    }
  }
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`\n   Node.js version: ${nodeVersion}`);
  const nodeMajor = parseInt(nodeVersion.replace('v', '').split('.')[0]);
  if (nodeMajor >= 18) {
    console.log('   ✅ Node.js version is compatible with Next.js 13+');
  } else {
    console.log('   ⚠️  Node.js 18+ recommended for Next.js 13+');
  }
  
  // Check if node_modules exists
  const nodeModulesExists = fs.existsSync(path.join(dashboardPath, 'node_modules'));
  if (nodeModulesExists) {
    console.log('   ✅ node_modules directory exists');
  } else {
    console.log('   ❌ node_modules directory missing - run: npm install');
  }
  
  // O'Brien - Pragmatic Solutions
  console.log('\n\n🛠️  CHIEF MILES O\'BRIEN - Pragmatic Solutions');
  console.log('──────────────────────────────────────────────────────────────────────\n');
  
  console.log('   Checking for common issues...\n');
  
  const portIssues = checkPortBinding();
  if (portIssues.length > 0) {
    portIssues.forEach(issue => console.log(`   ⚠️  ${issue}`));
  } else {
    console.log('   ✅ Port 3000 appears to be available');
  }
  
  // Check .next cache
  const nextCache = path.join(dashboardPath, '.next');
  if (fs.existsSync(nextCache)) {
    console.log('   ✅ .next cache directory exists');
    console.log('   💡 If issues persist, try: rm -rf .next && npm run dev');
  } else {
    console.log('   ℹ️  .next cache not found (will be created on first build)');
  }
  
  // Check for error logs
  const logPath = path.join(process.cwd(), 'tmp', 'next-dev.log');
  if (fs.existsSync(logPath)) {
    console.log('   ✅ Dev server log found');
    const logContent = fs.readFileSync(logPath, 'utf8');
    const errors = logContent.split('\n').filter(line => 
      line.toLowerCase().includes('error') || 
      line.toLowerCase().includes('failed') ||
      line.toLowerCase().includes('cannot')
    );
    if (errors.length > 0) {
      console.log('   ⚠️  Errors found in log:');
      errors.slice(0, 5).forEach(err => console.log(`      ${err.substring(0, 80)}...`));
    }
  }
  
  // Worf - Security
  console.log('\n\n⚔️  LIEUTENANT WORF - Security & Validation');
  console.log('──────────────────────────────────────────────────────────────────────\n');
  
  console.log('   Checking security configuration...\n');
  
  if (nextConfig.content && nextConfig.content.includes('headers')) {
    console.log('   ✅ Security headers configured');
  }
  
  // Summary & Recommendations
  console.log('\n\n📊 CREW FINDINGS SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const allIssues = [
    ...(nextConfig.issues || []),
    ...(pkgAnalysis.issues || []),
    ...portIssues
  ];
  
  if (allIssues.length === 0) {
    console.log('✅ No critical issues found in configuration');
    console.log('\n💡 Recommended Actions:');
    console.log('   1. Ensure dev server is running: cd dashboard && npm run dev');
    console.log('   2. Wait 10-30 seconds for Next.js compilation');
    console.log('   3. Check terminal output for compilation errors');
    console.log('   4. Verify server is listening: lsof -ti:3000');
    console.log('   5. Try clearing cache: rm -rf .next && npm run dev');
  } else {
    console.log(`⚠️  Found ${allIssues.length} potential issue(s):\n`);
    allIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    
    console.log('\n💡 Recommended Fixes:');
    if (!nodeModulesExists) {
      console.log('   1. Install dependencies: cd dashboard && npm install');
    }
    if (portIssues.length > 0) {
      console.log('   2. Free port 3000 or use different port: PORT=3001 npm run dev');
    }
    if (nextConfig.issues.includes('Static export mode enabled')) {
      console.log('   3. Remove "output: \'export\'" from next.config.js for dev server');
    }
    console.log('   4. Clear Next.js cache: cd dashboard && rm -rf .next');
    console.log('   5. Restart dev server: cd dashboard && npm run dev');
  }
  
  console.log('\n\n🎖️  Captain Picard: "The crew has completed their analysis.');
  console.log('   All findings have been documented according to Next.js best practices.');
  console.log('   Implement the recommended fixes and report back."\n');
  
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    🖖 CREW REVIEW COMPLETE 🖖                                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
}

crewReview().catch(err => {
  console.error('\n❌ Error in crew review:', err.message);
  process.exit(1);
});

