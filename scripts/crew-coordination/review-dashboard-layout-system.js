#!/usr/bin/env node

/**
 * 🖖 Dashboard Layout & Styling System Review
 * 
 * Crew reviews the dashboard layout and styling system:
 * - Picard: Strategic architecture review
 * - Data: Technical implementation analysis
 * - La Forge: Infrastructure and theme application
 * - Troi: UX and visual hierarchy
 * - O'Brien: Pragmatic fixes and testing
 * 
 * Focus: Theme system, layout structure, component styling, theme selection testing
 */

const fs = require('fs');
const path = require('path');

const CREW_TEAMS = [
  {
    team: 'Architecture Review',
    members: ['picard', 'data'],
    task: 'Review overall layout structure and theme system architecture'
  },
  {
    team: 'Theme Implementation',
    members: ['la_forge', 'troi'],
    task: 'Review theme application and component styling'
  },
  {
    team: 'Testing & Validation',
    members: ['obrien', 'worf'],
    task: 'Test theme selection and validate styling consistency'
  }
];

function analyzeLayoutStructure() {
  console.log('🔍 Analyzing dashboard layout structure...\n');
  
  const issues = [];
  const layoutPath = path.join(process.cwd(), 'dashboard/app/layout.tsx');
  const dashboardContentPath = path.join(process.cwd(), 'dashboard/app/dashboard/dashboard-content.tsx');
  
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf-8');
    
    // Check for ServiceContainerProvider
    if (!content.includes('ServiceContainerProvider')) {
      issues.push({
        file: 'app/layout.tsx',
        issue: 'ServiceContainerProvider not found in layout',
        fix: 'Add ServiceContainerProvider wrapper around StateProvider'
      });
    }
    
    // Check for GlobalThemeStyles
    if (!content.includes('GlobalThemeStyles')) {
      issues.push({
        file: 'app/layout.tsx',
        issue: 'GlobalThemeStyles not found in layout',
        fix: 'Add GlobalThemeStyles component to apply theme CSS variables'
      });
    }
  }
  
  if (fs.existsSync(dashboardContentPath)) {
    const content = fs.readFileSync(dashboardContentPath, 'utf-8');
    
    // Check for dashboard-theme-wrapper
    if (!content.includes('dashboard-theme-wrapper')) {
      issues.push({
        file: 'app/dashboard/dashboard-content.tsx',
        issue: 'dashboard-theme-wrapper class not found',
        fix: 'Wrap dashboard content in div with className="dashboard-theme-wrapper"'
      });
    }
    
    // Check for ThemeSelector
    if (!content.includes('ThemeSelector')) {
      issues.push({
        file: 'app/dashboard/dashboard-content.tsx',
        issue: 'ThemeSelector component not found',
        fix: 'Add ThemeSelector component for theme selection'
      });
    }
  }
  
  return issues;
}

function analyzeThemeSystem() {
  console.log('🔍 Analyzing theme system implementation...\n');
  
  const issues = [];
  const themeStylesPath = path.join(process.cwd(), 'dashboard/components/GlobalThemeStyles.tsx');
  const themeColorsPath = path.join(process.cwd(), 'dashboard/lib/theme-colors.ts');
  
  if (fs.existsSync(themeStylesPath)) {
    const content = fs.readFileSync(themeStylesPath, 'utf-8');
    
    // Check for CSS variables
    if (!content.includes(':root')) {
      issues.push({
        file: 'GlobalThemeStyles.tsx',
        issue: 'CSS variables not set on :root',
        fix: 'Add CSS variables to :root for global theme access'
      });
    }
    
    // Check for dashboard-theme-wrapper
    if (!content.includes('.dashboard-theme-wrapper')) {
      issues.push({
        file: 'GlobalThemeStyles.tsx',
        issue: 'dashboard-theme-wrapper styles not found',
        fix: 'Add CSS variables to .dashboard-theme-wrapper for scoped theme access'
      });
    }
    
    // Check for theme validation
    if (!content.includes('globalTheme') || !content.includes('typeof globalTheme')) {
      issues.push({
        file: 'GlobalThemeStyles.tsx',
        issue: 'Theme validation missing',
        fix: 'Add null/undefined checks for globalTheme before applying styles'
      });
    }
  }
  
  if (fs.existsSync(themeColorsPath)) {
    const content = fs.readFileSync(themeColorsPath, 'utf-8');
    
    // Check for getThemeColors function
    if (!content.includes('getThemeColors')) {
      issues.push({
        file: 'theme-colors.ts',
        issue: 'getThemeColors function not found',
        fix: 'Implement getThemeColors function to return theme color palette'
      });
    }
  }
  
  return issues;
}

function analyzeComponentStyling() {
  console.log('🔍 Analyzing component styling and theme usage...\n');
  
  const issues = [];
  const componentsDir = path.join(process.cwd(), 'dashboard/components');
  
  if (!fs.existsSync(componentsDir)) {
    return issues;
  }
  
  const componentFiles = fs.readdirSync(componentsDir).filter(f => 
    (f.endsWith('.tsx') || f.endsWith('.ts')) && 
    !f.includes('test') && 
    !f.includes('spec')
  );
  
  componentFiles.forEach(file => {
    const filePath = path.join(componentsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for hardcoded colors
    const hardcodedColorPatterns = [
      /#[0-9A-Fa-f]{6}/g,
      /rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g,
      /rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g
    ];
    
    hardcodedColorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // Check if it's in a comment or string literal that's acceptable
        const lines = content.split('\n');
        matches.forEach(match => {
          const lineIndex = content.substring(0, content.indexOf(match)).split('\n').length - 1;
          const line = lines[lineIndex];
          // Skip if it's in a comment or CSS variable reference
          if (!line.includes('//') && !line.includes('var(--') && !line.includes('/*')) {
            issues.push({
              file: file,
              issue: `Hardcoded color found: ${match}`,
              fix: `Replace ${match} with CSS variable (e.g., var(--accent), var(--background))`
            });
          }
        });
      }
    });
    
    // Check for theme variable usage
    if (!content.includes('var(--') && !content.includes('getThemeColors') && content.includes('style')) {
      issues.push({
        file: file,
        issue: 'Component may not be using theme variables',
        fix: 'Use CSS variables (var(--background), var(--text), etc.) for theme-aware styling'
      });
    }
  });
  
  return issues;
}

async function reviewDashboardLayoutSystem() {
  console.log('🖖 Dashboard Layout & Styling System Review\n');
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
  
  // Team 1: Architecture Review
  console.log('🎖️  Captain Picard & Commander Data - Architecture Review...\n');
  const layoutIssues = analyzeLayoutStructure();
  allIssues.push(...layoutIssues);
  
  // Team 2: Theme Implementation
  console.log('🔧 Lt. Cmdr. La Forge & Counselor Troi - Theme Implementation...\n');
  const themeIssues = analyzeThemeSystem();
  allIssues.push(...themeIssues);
  
  // Team 3: Component Styling
  console.log('💭 Counselor Troi & Chief O\'Brien - Component Styling...\n');
  const componentIssues = analyzeComponentStyling();
  allIssues.push(...componentIssues);
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Review Summary:\n');
  
  if (allIssues.length === 0) {
    console.log('✅ No issues found in layout and styling system\n');
  } else {
    console.log(`⚠️  Found ${allIssues.length} issues:\n`);
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
  
  const reportPath = path.join(reportsDir, 'dashboard-layout-review.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    issues: allIssues,
    totalIssues: allIssues.length
  }, null, 2));
  
  console.log(`📄 Review saved to: ${reportPath}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 Recommendations:');
  console.log('   1. Ensure all components use CSS variables for theming');
  console.log('   2. Test theme selection across all themes');
  console.log('   3. Verify layout structure with ServiceContainerProvider');
  console.log('   4. Validate theme persistence and application\n');
  
  return { issues: allIssues };
}

if (require.main === module) {
  reviewDashboardLayoutSystem().catch(console.error);
}

module.exports = { reviewDashboardLayoutSystem };



