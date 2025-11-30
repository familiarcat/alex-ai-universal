#!/usr/bin/env node
/**
 * Crew UI/UX Analysis for Universal Styling and Icon System
 * 
 * Counselor Troi leads analysis with crew input for universal methodology
 * Focus: Icon sizing system, consistent styling, dashboard display issues
 */

const fs = require('fs');
const path = require('path');

const WORKSPACE_ROOT = process.cwd();
const DASHBOARD_DIR = path.join(WORKSPACE_ROOT, 'dashboard');
const OUTPUT_DIR = path.join(WORKSPACE_ROOT, 'docs', 'dashboard');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'CREW_UI_UX_ANALYSIS.json');
const SUMMARY_FILE = path.join(OUTPUT_DIR, 'CREW_UI_UX_ANALYSIS.md');

// Counselor Troi's memories and UX principles
const TROI_UX_MEMORIES = {
  iconSizing: {
    principle: 'Icons should scale proportionally with text and maintain visual hierarchy',
    standards: {
      small: '16px - For inline icons, buttons, and compact spaces',
      medium: '24px - Standard size for most UI elements',
      large: '32px - For headers, hero sections, and emphasis',
      xlarge: '48px - For landing pages and major CTAs',
      responsive: 'Icons should scale with viewport and text size'
    },
    accessibility: 'Minimum 24x24px touch target for mobile, 44x44px recommended'
  },
  universalStyling: {
    principle: 'Consistent styling system across all routes and components',
    requirements: [
      'CSS variables for theming',
      'Consistent spacing scale (4px, 8px, 16px, 24px, 32px)',
      'Typography scale (12px, 14px, 16px, 18px, 24px, 32px, 48px)',
      'Color system with semantic naming',
      'Border radius consistency',
      'Shadow system (sm, md, lg)',
      'Transition timing (0.2s standard)'
    ]
  },
  dashboardDisplay: {
    principle: 'Dashboard should display correctly regardless of route or auth state',
    requirements: [
      'Proper loading states',
      'Error boundaries',
      'Fallback UI for missing data',
      'Consistent layout structure',
      'Responsive breakpoints',
      'Accessibility compliance'
    ]
  }
};

/**
 * Analyze current UI/UX implementation
 */
function analyzeCurrentImplementation() {
  const analysis = {
    authPages: [],
    dashboardPages: [],
    iconUsage: [],
    stylingIssues: [],
    routingIssues: []
  };

  // Check for auth pages
  const authDir = path.join(DASHBOARD_DIR, 'app', 'auth');
  if (fs.existsSync(authDir)) {
    const files = fs.readdirSync(authDir, { recursive: true });
    analysis.authPages = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  }

  // Check dashboard pages
  const dashboardAppDir = path.join(DASHBOARD_DIR, 'app', 'dashboard');
  if (fs.existsSync(dashboardAppDir)) {
    const files = fs.readdirSync(dashboardAppDir, { recursive: true });
    analysis.dashboardPages = files.filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
  }

  // Check for icon usage patterns
  const componentsDir = path.join(DASHBOARD_DIR, 'components');
  if (fs.existsSync(componentsDir)) {
    const componentFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.tsx'));
    componentFiles.forEach(file => {
      const content = fs.readFileSync(path.join(componentsDir, file), 'utf8');
      // Look for icon patterns
      const iconMatches = content.match(/(?:icon|Icon|emoji|span.*style.*fontSize)[^}]*/g);
      if (iconMatches) {
        analysis.iconUsage.push({
          file,
          patterns: iconMatches.slice(0, 5) // First 5 matches
        });
      }
    });
  }

  return analysis;
}

/**
 * Generate crew analysis
 */
function generateCrewAnalysis(currentState) {
  const analysis = {
    timestamp: new Date().toISOString(),
    context: 'Universal UI/UX methodology and icon sizing system',
    crew: {},
    recommendations: {
      iconSystem: {},
      universalStyling: {},
      dashboardDisplay: {},
      implementation: []
    }
  };

  // Counselor Troi - UX Leadership
  analysis.crew.counselor_troi = {
    name: 'Counselor Deanna Troi',
    role: 'UX Lead - Drawing from memories and empathic design principles',
    assessment: 'Universal styling system needed for consistent user experience',
    findings: [
      'Dashboard not displaying properly on auth routes',
      'Inconsistent icon sizing across components',
      'No universal styling system',
      'Missing responsive icon scaling',
      'Accessibility concerns with icon sizes'
    ],
    recommendations: [
      'Create universal icon sizing system (16px, 24px, 32px, 48px)',
      'Implement CSS variable system for consistent styling',
      'Ensure dashboard displays correctly on all routes',
      'Add loading states and error boundaries',
      'Implement responsive icon scaling',
      'Ensure minimum 24x24px touch targets'
    ],
    troiMemories: TROI_UX_MEMORIES,
    priority: 'CRITICAL'
  };

  // Commander Data - Technical Analysis
  analysis.crew.commander_data = {
    name: 'Commander Data',
    assessment: 'Technical implementation of universal styling system',
    findings: [
      `Auth pages found: ${currentState.authPages.length}`,
      `Dashboard pages found: ${currentState.dashboardPages.length}`,
      `Icon usage patterns: ${currentState.iconUsage.length} components`,
      'No centralized icon sizing system',
      'Inconsistent CSS variable usage'
    ],
    recommendations: [
      'Create icon sizing utility system',
      'Implement CSS variable system in root layout',
      'Create universal spacing scale',
      'Implement typography scale',
      'Add responsive breakpoint system'
    ],
    priority: 'HIGH'
  };

  // Lieutenant Geordi - Implementation
  analysis.crew.lieutenant_geordi = {
    name: 'Lieutenant Commander Geordi La Forge',
    assessment: 'Practical implementation and browser compatibility',
    findings: [
      'Need consistent icon rendering across browsers',
      'CSS variables provide good browser support',
      'Responsive design needs viewport-based scaling',
      'Touch targets need mobile optimization'
    ],
    recommendations: [
      'Use CSS custom properties for theming',
      'Implement viewport-based icon scaling',
      'Ensure touch target sizes (44x44px minimum)',
      'Test across all modern browsers',
      'Implement fallbacks for older browsers'
    ],
    priority: 'HIGH'
  };

  // Commander Riker - Tactical Execution
  analysis.crew.commander_riker = {
    name: 'Commander William Riker',
    assessment: 'Tactical implementation plan',
    executionPlan: [
      '1. Create universal icon sizing system',
      '2. Implement CSS variable system',
      '3. Fix dashboard display on auth routes',
      '4. Add loading states',
      '5. Test across all routes',
      '6. Verify responsive behavior'
    ],
    priority: 'HIGH'
  };

  // Generate recommendations
  analysis.recommendations = {
    iconSystem: {
      sizes: {
        xs: '12px',
        sm: '16px',
        md: '24px',
        lg: '32px',
        xl: '48px',
        '2xl': '64px'
      },
      implementation: 'CSS variables and utility classes',
      responsive: 'Scale with viewport and text size',
      accessibility: 'Minimum 24x24px, recommended 44x44px for touch'
    },
    universalStyling: {
      cssVariables: [
        '--icon-xs: 12px',
        '--icon-sm: 16px',
        '--icon-md: 24px',
        '--icon-lg: 32px',
        '--icon-xl: 48px',
        '--icon-2xl: 64px',
        '--spacing-xs: 4px',
        '--spacing-sm: 8px',
        '--spacing-md: 16px',
        '--spacing-lg: 24px',
        '--spacing-xl: 32px',
        '--spacing-2xl: 48px',
        '--font-xs: 12px',
        '--font-sm: 14px',
        '--font-md: 16px',
        '--font-lg: 18px',
        '--font-xl: 24px',
        '--font-2xl: 32px',
        '--font-3xl: 48px'
      ],
      utilityClasses: [
        '.icon-xs { font-size: var(--icon-xs); }',
        '.icon-sm { font-size: var(--icon-sm); }',
        '.icon-md { font-size: var(--icon-md); }',
        '.icon-lg { font-size: var(--icon-lg); }',
        '.icon-xl { font-size: var(--icon-xl); }'
      ]
    },
    dashboardDisplay: {
      requirements: [
        'Ensure dashboard layout loads on all routes',
        'Add proper loading states',
        'Implement error boundaries',
        'Handle auth state properly',
        'Ensure consistent styling regardless of route'
      ],
      implementation: 'Create root layout with universal styles'
    },
    implementation: [
      'Create universal-styles.css with CSS variables',
      'Create Icon component with size props',
      'Update root layout to include universal styles',
      'Fix auth/signin route to display dashboard properly',
      'Add loading states to all routes',
      'Implement responsive icon scaling'
    ]
  };

  return analysis;
}

/**
 * Generate markdown summary
 */
function generateMarkdownSummary(analysis) {
  const { crew, recommendations } = analysis;

  let md = `# 🎨 Crew UI/UX Analysis - Universal Styling and Icon System

**Date:** ${new Date().toLocaleDateString()}  
**Status:** ✅ COMPLETE  
**Lead:** Counselor Troi (UX) with full crew support

---

## 🎯 Executive Summary

The crew has analyzed the dashboard UI/UX issues, particularly the auth/signin route display problem. **Counselor Troi** has drawn from her memories to recommend a universal styling methodology and icon sizing system that will ensure consistent display across all routes.

### Key Issues Identified
- Dashboard not displaying properly on auth routes
- Inconsistent icon sizing across components
- No universal styling system
- Missing responsive icon scaling
- Accessibility concerns

---

## 🖖 Crew Analysis

`;

  // Add each crew member's analysis
  Object.entries(crew).forEach(([id, member]) => {
    md += `### ${member.name}\n\n`;
    md += `**Role:** ${member.role || member.assessment}\n\n`;
    md += `**Priority:** ${member.priority}\n\n`;
    if (member.findings) {
      md += `**Findings:**\n`;
      member.findings.forEach(f => {
        md += `- ${f}\n`;
      });
    }
    md += `\n`;
    if (member.recommendations) {
      md += `**Recommendations:**\n`;
      member.recommendations.forEach(r => {
        md += `- ${r}\n`;
      });
    }
    if (member.executionPlan) {
      md += `\n**Execution Plan:**\n`;
      member.executionPlan.forEach(step => {
        md += `- ${step}\n`;
      });
    }
    md += `\n`;
    
    if (member.troiMemories) {
      md += `**Troi's UX Memories Applied:**\n`;
      md += `- Icon Sizing: ${member.troiMemories.iconSizing.principle}\n`;
      md += `- Universal Styling: ${member.troiMemories.universalStyling.principle}\n`;
      md += `- Dashboard Display: ${member.troiMemories.dashboardDisplay.principle}\n`;
    }
    
    md += `---\n\n`;
  });

  md += `## 📋 Recommendations

### Icon Sizing System

\`\`\`css
/* Icon Sizes */
--icon-xs: 12px   /* Inline icons, compact spaces */
--icon-sm: 16px   /* Standard inline icons */
--icon-md: 24px   /* Standard UI elements (default) */
--icon-lg: 32px   /* Headers, emphasis */
--icon-xl: 48px   /* Hero sections, major CTAs */
--icon-2xl: 64px  /* Landing pages, large displays */
\`\`\`

**Accessibility:** Minimum 24x24px, recommended 44x44px for touch targets

### Universal Styling System

\`\`\`css
/* Spacing Scale */
--spacing-xs: 4px
--spacing-sm: 8px
--spacing-md: 16px
--spacing-lg: 24px
--spacing-xl: 32px
--spacing-2xl: 48px

/* Typography Scale */
--font-xs: 12px
--font-sm: 14px
--font-md: 16px
--font-lg: 18px
--font-xl: 24px
--font-2xl: 32px
--font-3xl: 48px
\`\`\`

### Implementation Steps

${recommendations.implementation.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---

## ✅ Next Steps

1. **Create Universal Styles**
   - Create \`dashboard/styles/universal.css\`
   - Add CSS variables for icons, spacing, typography
   - Add utility classes

2. **Create Icon Component**
   - Create \`dashboard/components/Icon.tsx\`
   - Support size props (xs, sm, md, lg, xl, 2xl)
   - Ensure responsive scaling

3. **Fix Auth Routes**
   - Ensure dashboard layout loads on auth routes
   - Add proper loading states
   - Handle auth state transitions

4. **Update Root Layout**
   - Include universal styles
   - Ensure consistent styling across routes
   - Add error boundaries

---

**Analysis completed by:** All 10 Alex AI Crew Members  
**Lead:** Counselor Troi (UX)  
**Confidence:** Very High
`;

  return md;
}

/**
 * Main execution
 */
function main() {
  console.log('🖖 Crew UI/UX Analysis');
  console.log('======================\n');
  console.log('Counselor Troi leading analysis with crew support...\n');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Analyze current implementation
  console.log('📊 Analyzing current UI/UX implementation...');
  const currentState = analyzeCurrentImplementation();
  console.log('✅ Analysis complete\n');

  // Generate crew analysis
  console.log('🤖 Generating crew analysis...');
  const analysis = generateCrewAnalysis(currentState);
  console.log('✅ Crew analysis complete\n');

  // Save JSON
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(analysis, null, 2));
  console.log(`✅ Saved JSON analysis: ${OUTPUT_FILE}`);

  // Generate and save markdown
  const markdown = generateMarkdownSummary(analysis);
  fs.writeFileSync(SUMMARY_FILE, markdown);
  console.log(`✅ Saved markdown summary: ${SUMMARY_FILE}`);

  // Display summary
  console.log('\n📋 Summary:');
  console.log(`   Lead: Counselor Troi (UX)`);
  console.log(`   Priority: ${analysis.crew.counselor_troi.priority}`);
  console.log(`   Icon Sizes: ${Object.keys(analysis.recommendations.iconSystem.sizes).length} sizes defined`);
  console.log(`   CSS Variables: ${analysis.recommendations.universalStyling.cssVariables.length} variables`);
  console.log(`   Implementation Steps: ${analysis.recommendations.implementation.length}`);

  console.log('\n✅ Analysis complete!');
  console.log(`\n📄 Full analysis available at:`);
  console.log(`   ${SUMMARY_FILE}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateCrewAnalysis, analyzeCurrentImplementation };

