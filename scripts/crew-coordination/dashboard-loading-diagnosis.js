#!/usr/bin/env node

/**
 * 🖖 Dashboard Loading Diagnosis - Full Crew Investigation
 * 
 * Crew teams investigate why dashboard is not loading after refactor:
 * - Server/Route Team: Verify server is running and routes accessible
 * - Component/Rendering Team: Check component structure and rendering
 * - State/Context Team: Verify state management and context providers
 * - Error/Diagnostics Team: Check for errors, console issues, build problems
 * 
 * Crew Coordination:
 * - Picard: Strategic oversight and final resolution
 * - Riker: Team organization and execution coordination
 * - Data: Technical analysis and diagnostics
 * - La Forge: Infrastructure and build system
 * - Worf: Security and middleware checks
 * - Troi: User experience and rendering flow
 * - O'Brien: Pragmatic troubleshooting and quick fixes
 * - Quark: Cost optimization (avoid unnecessary checks)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CREW_TEAMS = [
  {
    team: 'Server & Routes',
    members: ['la_forge', 'data'],
    task: 'Verify Next.js server is running, routes are accessible, middleware is working'
  },
  {
    team: 'Component Structure',
    members: ['troi', 'obrien'],
    task: 'Check component imports, exports, and rendering structure'
  },
  {
    team: 'State & Context',
    members: ['data', 'troi'],
    task: 'Verify StateProvider, ProgressProvider, and context usage'
  },
  {
    team: 'Error Diagnostics',
    members: ['worf', 'data'],
    task: 'Check for build errors, console errors, and runtime issues'
  },
  {
    team: 'Build & Dependencies',
    members: ['la_forge', 'obrien'],
    task: 'Verify Next.js build, dependencies, and configuration'
  }
];

function checkServerStatus() {
  console.log('🔍 Server & Routes Team (La Forge & Data)...\n');
  
  const issues = [];
  const findings = [];
  
  // Check if Next.js dev server is running
  try {
    const result = execSync('lsof -ti:3000 2>/dev/null || echo ""', { encoding: 'utf-8' }).trim();
    if (result) {
      findings.push('✅ Next.js dev server is running on port 3000');
    } else {
      issues.push({
        severity: 'critical',
        issue: 'Next.js dev server is not running on port 3000',
        fix: 'Start the dev server with: cd dashboard && npm run dev'
      });
    }
  } catch (error) {
    issues.push({
      severity: 'critical',
      issue: 'Cannot check server status',
      fix: 'Verify server is running manually'
    });
  }
  
  // Check Next.js config
  const nextConfigPath = path.join(process.cwd(), 'dashboard/next.config.js');
  if (fs.existsSync(nextConfigPath)) {
    findings.push('✅ next.config.js exists');
    const config = fs.readFileSync(nextConfigPath, 'utf-8');
    if (config.includes('trailingSlash')) {
      findings.push('✅ trailingSlash configured');
    }
  } else {
    issues.push({
      severity: 'high',
      issue: 'next.config.js not found',
      fix: 'Create next.config.js in dashboard directory'
    });
  }
  
  // Check middleware
  const middlewarePath = path.join(process.cwd(), 'dashboard/middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    findings.push('✅ middleware.ts exists');
    const middleware = fs.readFileSync(middlewarePath, 'utf-8');
    if (middleware.includes('pathname !== \'/\'')) {
      findings.push('✅ Middleware allows root redirect');
    } else {
      issues.push({
        severity: 'medium',
        issue: 'Middleware may block root redirect',
        fix: 'Ensure middleware allows root path to redirect'
      });
    }
  }
  
  return { issues, findings };
}

function checkComponentStructure() {
  console.log('🔍 Component Structure Team (Troi & O\'Brien)...\n');
  
  const issues = [];
  const findings = [];
  
  const rootPage = path.join(process.cwd(), 'dashboard/app/page.tsx');
  if (fs.existsSync(rootPage)) {
    findings.push('✅ Root page exists');
    const content = fs.readFileSync(rootPage, 'utf-8');
    if (content.includes('router.replace')) {
      findings.push('✅ Root page uses router.replace (correct)');
    } else if (content.includes('router.push')) {
      issues.push({
        severity: 'medium',
        issue: 'Root page uses router.push instead of router.replace',
        fix: 'Change router.push to router.replace to avoid redirect loops'
      });
    }
    if (content.includes('useRouter')) {
      findings.push('✅ Root page imports useRouter');
    } else {
      issues.push({
        severity: 'high',
        issue: 'Root page missing useRouter import',
        fix: 'Import useRouter from next/navigation'
      });
    }
  } else {
    issues.push({
      severity: 'critical',
      issue: 'Root page (app/page.tsx) not found',
      fix: 'Create app/page.tsx in dashboard directory'
    });
  }
  
  // Check dashboard page
  const dashboardPage = path.join(process.cwd(), 'dashboard/app/dashboard/page.tsx');
  if (fs.existsSync(dashboardPage)) {
    findings.push('✅ Dashboard page exists');
    const content = fs.readFileSync(dashboardPage, 'utf-8');
    if (content.includes('dynamic')) {
      findings.push('✅ Dashboard page uses dynamic import');
    }
    if (content.includes('ssr: false')) {
      findings.push('✅ Dashboard page has ssr: false (client-only)');
    } else {
      issues.push({
        severity: 'high',
        issue: 'Dashboard page missing ssr: false',
        fix: 'Add ssr: false to dynamic import options'
      });
    }
  } else {
    issues.push({
      severity: 'critical',
      issue: 'Dashboard page (app/dashboard/page.tsx) not found',
      fix: 'Create app/dashboard/page.tsx'
    });
  }
  
  // Check dashboard content
  const dashboardContent = path.join(process.cwd(), 'dashboard/app/dashboard/dashboard-content.tsx');
  if (fs.existsSync(dashboardContent)) {
    findings.push('✅ Dashboard content component exists');
    const content = fs.readFileSync(dashboardContent, 'utf-8');
    if (content.includes('export default')) {
      findings.push('✅ Dashboard content has default export');
    } else {
      issues.push({
        severity: 'critical',
        issue: 'Dashboard content missing default export',
        fix: 'Add export default function DashboardContent()'
      });
    }
    if (content.includes('ErrorBoundary')) {
      findings.push('✅ Dashboard content wrapped in ErrorBoundary');
    }
    if (content.includes('ProgressProvider')) {
      findings.push('✅ Dashboard content wrapped in ProgressProvider');
    }
  } else {
    issues.push({
      severity: 'critical',
      issue: 'Dashboard content (dashboard-content.tsx) not found',
      fix: 'Create dashboard-content.tsx in app/dashboard directory'
    });
  }
  
  return { issues, findings };
}

function checkStateAndContext() {
  console.log('🔍 State & Context Team (Data & Troi)...\n');
  
  const issues = [];
  const findings = [];
  
  // Check StateProvider
  const stateManager = path.join(process.cwd(), 'dashboard/lib/state-manager.tsx');
  if (fs.existsSync(stateManager)) {
    findings.push('✅ State manager exists');
    const content = fs.readFileSync(stateManager, 'utf-8');
    if (content.includes('StateProvider')) {
      findings.push('✅ StateProvider component exists');
    } else {
      issues.push({
        severity: 'high',
        issue: 'StateProvider not found in state-manager.tsx',
        fix: 'Create StateProvider component'
      });
    }
    if (content.includes('createContext')) {
      findings.push('✅ State context created');
    }
  } else {
    issues.push({
      severity: 'critical',
      issue: 'State manager (lib/state-manager.tsx) not found',
      fix: 'Create state-manager.tsx in lib directory'
    });
  }
  
  // Check root layout
  const rootLayout = path.join(process.cwd(), 'dashboard/app/layout.tsx');
  if (fs.existsSync(rootLayout)) {
    findings.push('✅ Root layout exists');
    const content = fs.readFileSync(rootLayout, 'utf-8');
    if (content.includes('StateProvider')) {
      findings.push('✅ Root layout wraps with StateProvider');
    } else {
      issues.push({
        severity: 'critical',
        issue: 'Root layout missing StateProvider wrapper',
        fix: 'Wrap children with <StateProvider> in layout.tsx'
      });
    }
  } else {
    issues.push({
      severity: 'critical',
      issue: 'Root layout (app/layout.tsx) not found',
      fix: 'Create layout.tsx in app directory'
    });
  }
  
  // Check ProgressProvider
  const progressContext = path.join(process.cwd(), 'dashboard/lib/ProgressContext.tsx');
  if (fs.existsSync(progressContext)) {
    findings.push('✅ ProgressContext exists');
  } else {
    issues.push({
      severity: 'medium',
      issue: 'ProgressContext not found',
      fix: 'Create ProgressContext.tsx or remove ProgressProvider usage'
    });
  }
  
  return { issues, findings };
}

function checkErrorsAndDiagnostics() {
  console.log('🔍 Error Diagnostics Team (Worf & Data)...\n');
  
  const issues = [];
  const findings = [];
  
  // Check for build errors
  const buildDir = path.join(process.cwd(), 'dashboard/.next');
  if (fs.existsSync(buildDir)) {
    findings.push('✅ .next build directory exists');
    
    // Check for error files
    const errorFile = path.join(buildDir, 'error.log');
    if (fs.existsSync(errorFile)) {
      const errorContent = fs.readFileSync(errorFile, 'utf-8');
      if (errorContent.trim()) {
        issues.push({
          severity: 'high',
          issue: 'Build error log found',
          fix: 'Check .next/error.log for build errors',
          details: errorContent.substring(0, 500)
        });
      }
    }
  } else {
    issues.push({
      severity: 'medium',
      issue: '.next build directory not found',
      fix: 'Run: cd dashboard && npm run build'
    });
  }
  
  // Check package.json
  const packageJson = path.join(process.cwd(), 'dashboard/package.json');
  if (fs.existsSync(packageJson)) {
    findings.push('✅ package.json exists');
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf-8'));
    if (pkg.scripts && pkg.scripts.dev) {
      findings.push('✅ dev script exists');
    } else {
      issues.push({
        severity: 'high',
        issue: 'dev script missing in package.json',
        fix: 'Add "dev": "next dev" to scripts'
      });
    }
  } else {
    issues.push({
      severity: 'critical',
      issue: 'package.json not found',
      fix: 'Create package.json in dashboard directory'
    });
  }
  
  // Check for TypeScript errors
  const tsConfig = path.join(process.cwd(), 'dashboard/tsconfig.json');
  if (fs.existsSync(tsConfig)) {
    findings.push('✅ tsconfig.json exists');
  }
  
  return { issues, findings };
}

function checkBuildAndDependencies() {
  console.log('🔍 Build & Dependencies Team (La Forge & O\'Brien)...\n');
  
  const issues = [];
  const findings = [];
  
  // Check node_modules
  const nodeModules = path.join(process.cwd(), 'dashboard/node_modules');
  if (fs.existsSync(nodeModules)) {
    findings.push('✅ node_modules exists');
    
    // Check for Next.js
    const nextPath = path.join(nodeModules, 'next');
    if (fs.existsSync(nextPath)) {
      findings.push('✅ Next.js installed');
    } else {
      issues.push({
        severity: 'critical',
        issue: 'Next.js not installed',
        fix: 'Run: cd dashboard && npm install'
      });
    }
    
    // Check for React
    const reactPath = path.join(nodeModules, 'react');
    if (fs.existsSync(reactPath)) {
      findings.push('✅ React installed');
    } else {
      issues.push({
        severity: 'critical',
        issue: 'React not installed',
        fix: 'Run: cd dashboard && npm install'
      });
    }
  } else {
    issues.push({
      severity: 'critical',
      issue: 'node_modules not found',
      fix: 'Run: cd dashboard && npm install'
    });
  }
  
  // Check for import errors in key files
  const keyFiles = [
    'dashboard/app/layout.tsx',
    'dashboard/app/page.tsx',
    'dashboard/app/dashboard/page.tsx',
    'dashboard/app/dashboard/dashboard-content.tsx'
  ];
  
  keyFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const imports = content.match(/import\s+.*?from\s+['"](.*?)['"]/g) || [];
      imports.forEach(imp => {
        const match = imp.match(/from\s+['"](.*?)['"]/);
        if (match) {
          const importPath = match[1];
          // Check for @/ aliases
          if (importPath.startsWith('@/')) {
            // Verify the alias resolves
            const aliasPath = importPath.replace('@/', 'dashboard/');
            const resolvedPath = path.join(process.cwd(), aliasPath);
            if (!fs.existsSync(resolvedPath) && !resolvedPath.includes('.')) {
              // Check if it's a directory
              const dirPath = resolvedPath + '.tsx';
              const dirPath2 = resolvedPath + '.ts';
              if (!fs.existsSync(dirPath) && !fs.existsSync(dirPath2)) {
                issues.push({
                  severity: 'medium',
                  issue: `Import may not resolve: ${importPath} in ${filePath}`,
                  fix: `Verify ${importPath} resolves correctly`
                });
              }
            }
          }
        }
      });
    }
  });
  
  return { issues, findings };
}

async function dashboardLoadingDiagnosis() {
  console.log('🖖 Dashboard Loading Diagnosis - Full Crew Investigation\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Team organization
  console.log('👥 Crew Team Organization:\n');
  CREW_TEAMS.forEach(team => {
    console.log(`   ${team.team}:`);
    console.log(`     Members: ${team.members.map(m => m.replace('_', ' ')).join(', ')}`);
    console.log(`     Task: ${team.task}\n`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const allIssues = [];
  const allFindings = [];
  
  // Team 1: Server & Routes
  const serverResults = checkServerStatus();
  allIssues.push(...serverResults.issues);
  allFindings.push(...serverResults.findings);
  
  // Team 2: Component Structure
  const componentResults = checkComponentStructure();
  allIssues.push(...componentResults.issues);
  allFindings.push(...componentResults.findings);
  
  // Team 3: State & Context
  const stateResults = checkStateAndContext();
  allIssues.push(...stateResults.issues);
  allFindings.push(...stateResults.findings);
  
  // Team 4: Error Diagnostics
  const errorResults = checkErrorsAndDiagnostics();
  allIssues.push(...errorResults.issues);
  allFindings.push(...errorResults.findings);
  
  // Team 5: Build & Dependencies
  const buildResults = checkBuildAndDependencies();
  allIssues.push(...buildResults.issues);
  allFindings.push(...buildResults.findings);
  
  // Summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Investigation Summary:\n');
  
  console.log(`✅ Findings: ${allFindings.length}`);
  allFindings.forEach((finding, i) => {
    console.log(`   ${i + 1}. ${finding}`);
  });
  
  console.log(`\n⚠️  Issues Found: ${allIssues.length}`);
  
  const criticalIssues = allIssues.filter(i => i.severity === 'critical');
  const highIssues = allIssues.filter(i => i.severity === 'high');
  const mediumIssues = allIssues.filter(i => i.severity === 'medium');
  
  if (criticalIssues.length > 0) {
    console.log(`\n🚨 CRITICAL Issues (${criticalIssues.length}):`);
    criticalIssues.forEach((issue, i) => {
      console.log(`\n   ${i + 1}. ${issue.issue}`);
      console.log(`      Fix: ${issue.fix}`);
      if (issue.details) {
        console.log(`      Details: ${issue.details.substring(0, 200)}...`);
      }
    });
  }
  
  if (highIssues.length > 0) {
    console.log(`\n⚠️  HIGH Priority Issues (${highIssues.length}):`);
    highIssues.forEach((issue, i) => {
      console.log(`\n   ${i + 1}. ${issue.issue}`);
      console.log(`      Fix: ${issue.fix}`);
    });
  }
  
  if (mediumIssues.length > 0) {
    console.log(`\nℹ️  MEDIUM Priority Issues (${mediumIssues.length}):`);
    mediumIssues.slice(0, 5).forEach((issue, i) => {
      console.log(`\n   ${i + 1}. ${issue.issue}`);
      console.log(`      Fix: ${issue.fix}`);
    });
    if (mediumIssues.length > 5) {
      console.log(`\n   ... and ${mediumIssues.length - 5} more medium priority issues`);
    }
  }
  
  // Save report
  const rootDir = process.cwd();
  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, 'dashboard-loading-diagnosis.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    findings: allFindings,
    issues: allIssues,
    criticalCount: criticalIssues.length,
    highCount: highIssues.length,
    mediumCount: mediumIssues.length
  }, null, 2));
  
  console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  
  // Recommendations
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 Captain Picard\'s Strategic Recommendations:\n');
  
  if (criticalIssues.length > 0) {
    console.log('   1. Address all CRITICAL issues immediately');
    console.log('   2. Verify server is running: cd dashboard && npm run dev');
    console.log('   3. Check browser console for runtime errors');
    console.log('   4. Verify all required files exist and are properly structured');
  } else if (highIssues.length > 0) {
    console.log('   1. Address HIGH priority issues');
    console.log('   2. Check browser console for warnings');
    console.log('   3. Verify component imports and exports');
  } else {
    console.log('   1. No critical issues found - check browser console for runtime errors');
    console.log('   2. Verify network tab for failed requests');
    console.log('   3. Check if authentication is blocking access');
  }
  
  console.log('\n🖖 Investigation complete!\n');
  
  return { issues: allIssues, findings: allFindings };
}

if (require.main === module) {
  dashboardLoadingDiagnosis().catch(console.error);
}

module.exports = { dashboardLoadingDiagnosis };



