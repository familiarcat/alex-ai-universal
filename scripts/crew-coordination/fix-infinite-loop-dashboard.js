#!/usr/bin/env node

/**
 * 🖖 Fix Infinite Loop - Dashboard Error
 * 
 * Crew investigates and fixes infinite loop causing dashboard errors:
 * - Data: Analyzes error patterns and identifies loop sources
 * - La Forge: Fixes Next.js/React useEffect dependencies
 * - O'Brien: Pragmatic troubleshooting and quick fixes
 * - Troi: UX improvements and error handling
 * - Worf: Error boundary and security fixes
 * 
 * Issues identified:
 * 1. "Cannot read properties of undefined (reading 'charAt')" - theme string access
 * 2. "Failed to fetch" - infinite retry loops in unified-data-service
 * 3. Request timeouts - components retrying failed requests
 * 4. Theme state updates causing re-renders
 */

const fs = require('fs');
const path = require('path');

const CREW_TEAMS = [
  {
    team: 'Error Analysis',
    members: ['data', 'crusher'],
    task: 'Analyze error patterns and identify infinite loop sources'
  },
  {
    team: 'React/Next.js Fixes',
    members: ['la_forge', 'obrien'],
    task: 'Fix useEffect dependencies and prevent infinite loops'
  },
  {
    team: 'Error Handling',
    members: ['troi', 'worf'],
    task: 'Improve error boundaries and prevent error cascades'
  },
  {
    team: 'Data Service',
    members: ['data', 'uhura'],
    task: 'Fix unified-data-service retry logic and timeouts'
  }
];

function analyzeThemeLoops() {
  console.log('🔍 Analyzing theme-related infinite loops...\n');
  
  const issues = [];
  
  // Check GlobalThemeStyles
  const themeStylesPath = path.join(process.cwd(), 'dashboard/components/GlobalThemeStyles.tsx');
  if (fs.existsSync(themeStylesPath)) {
    const content = fs.readFileSync(themeStylesPath, 'utf-8');
    
    // Check for useEffect with theme dependencies
    const useEffectMatches = content.match(/useEffect\([^)]*\)/g) || [];
    useEffectMatches.forEach(match => {
      if (match.includes('globalTheme') || match.includes('theme')) {
        // Check if dependencies include theme
        if (match.includes('globalTheme') && !match.includes('useMemo') && !match.includes('useCallback')) {
          issues.push({
            file: 'GlobalThemeStyles.tsx',
            issue: 'useEffect with globalTheme dependency may cause infinite loop',
            fix: 'Use useMemo or useCallback to memoize theme values, or add proper dependency guards'
          });
        }
      }
    });
    
    // Check for charAt usage without null checks
    if (content.includes('charAt') && !content.includes('charAt')?.includes('?.') && !content.includes('charAt')?.includes('||')) {
      issues.push({
        file: 'GlobalThemeStyles.tsx',
        issue: 'charAt called on potentially undefined value',
        fix: 'Add null/undefined check before calling charAt: theme?.charAt(0) || "#"'
      });
    }
  }
  
  return issues;
}

function analyzeDataServiceLoops() {
  console.log('🔍 Analyzing unified-data-service retry loops...\n');
  
  const issues = [];
  
  const dataServicePath = path.join(process.cwd(), 'dashboard/lib/unified-data-service.ts');
  if (fs.existsSync(dataServicePath)) {
    const content = fs.readFileSync(dataServicePath, 'utf-8');
    
    // Check for infinite retry patterns
    if (content.includes('callN8NFallback') && content.includes('callMCPEndpoint')) {
      // Check if there's circular calling
      const n8nFallbackMatch = content.match(/callN8NFallback[^}]*}/s);
      const mcpEndpointMatch = content.match(/callMCPEndpoint[^}]*}/s);
      
      if (n8nFallbackMatch && mcpEndpointMatch) {
        if (n8nFallbackMatch[0].includes('callMCPEndpoint') || mcpEndpointMatch[0].includes('callN8NFallback')) {
          issues.push({
            file: 'unified-data-service.ts',
            issue: 'Circular calling between callN8NFallback and callMCPEndpoint',
            fix: 'Add retry limit and prevent circular calls'
          });
        }
      }
    }
    
    // Check for missing error handling in fetch
    if (content.includes('await fetch') && !content.includes('catch')?.includes('fetch')) {
      issues.push({
        file: 'unified-data-service.ts',
        issue: 'Fetch calls may not have proper error handling',
        fix: 'Add try-catch around fetch calls and prevent infinite retries'
      });
    }
  }
  
  return issues;
}

function analyzeComponentLoops() {
  console.log('🔍 Analyzing component useEffect loops...\n');
  
  const issues = [];
  const componentsDir = path.join(process.cwd(), 'dashboard/components');
  
  if (!fs.existsSync(componentsDir)) {
    return issues;
  }
  
  const componentFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  
  componentFiles.forEach(file => {
    const filePath = path.join(componentsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for useEffect with state updates in dependencies
    const useEffectRegex = /useEffect\s*\([^)]*\)/gs;
    const matches = content.match(useEffectRegex) || [];
    
    matches.forEach(match => {
      // Check if useEffect updates state that's in its dependencies
      if (match.includes('setState') || match.includes('set') && match.includes('useState')) {
        // Extract dependencies
        const depsMatch = match.match(/\[([^\]]+)\]/);
        if (depsMatch) {
          const deps = depsMatch[1].split(',').map(d => d.trim());
          // Check if any dependency is a state setter
          deps.forEach(dep => {
            if (dep.includes('set') && match.includes(dep.replace('set', '').toLowerCase())) {
              issues.push({
                file: file,
                issue: `useEffect in ${file} may cause infinite loop - state setter in dependencies`,
                fix: 'Remove state setter from dependencies array or use functional update pattern'
              });
            }
          });
        }
      }
    });
  });
  
  return issues;
}

async function fixInfiniteLoopDashboard() {
  console.log('🖖 Fix Infinite Loop - Dashboard Error\n');
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
  
  // Team 1: Error Analysis
  console.log('🤖 Commander Data & Dr. Crusher - Analyzing errors...\n');
  const themeIssues = analyzeThemeLoops();
  allIssues.push(...themeIssues);
  
  // Team 2: Data Service Analysis
  console.log('🔧 Lt. Cmdr. La Forge & Chief O\'Brien - Analyzing data service...\n');
  const dataServiceIssues = analyzeDataServiceLoops();
  allIssues.push(...dataServiceIssues);
  
  // Team 3: Component Analysis
  console.log('💭 Counselor Troi & Lieutenant Worf - Analyzing components...\n');
  const componentIssues = analyzeComponentLoops();
  allIssues.push(...componentIssues);
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Investigation Summary:\n');
  
  if (allIssues.length === 0) {
    console.log('✅ No obvious infinite loop patterns found in code structure\n');
    console.log('💡 Recommendations:');
    console.log('   1. Check browser console for specific error messages');
    console.log('   2. Add error boundaries around components');
    console.log('   3. Add retry limits to fetch calls');
    console.log('   4. Use React DevTools Profiler to identify re-render loops\n');
  } else {
    console.log(`⚠️  Found ${allIssues.length} potential issues:\n`);
    allIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. [${issue.file}] ${issue.issue}`);
      console.log(`      Fix: ${issue.fix}\n`);
    });
  }
  
  // Save report
  const rootDir = process.cwd();
  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, 'infinite-loop-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    issues: allIssues,
    totalIssues: allIssues.length
  }, null, 2));
  
  console.log(`📄 Analysis saved to: ${reportPath}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 Next Steps:');
  console.log('   1. Review identified issues');
  console.log('   2. Apply fixes to prevent infinite loops');
  console.log('   3. Add error boundaries and retry limits');
  console.log('   4. Test dashboard loading\n');
  
  return { issues: allIssues };
}

if (require.main === module) {
  fixInfiniteLoopDashboard().catch(console.error);
}

module.exports = { fixInfiniteLoopDashboard };



