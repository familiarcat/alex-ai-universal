#!/usr/bin/env node

/**
 * 🖖 Crew Verification: Hardcoded Color Audit
 * 
 * Crew coordination to identify and fix hardcoded colors
 * that bypass the theme system (specifically light green #00ffaa)
 */

const fs = require('fs');
const path = require('path');
const { getMCPOpenRouterOptimizer } = require('../utils/mcp-openrouter-optimizer');

const CREW = {
  data: {
    name: 'Commander Data',
    role: 'Technical Analysis',
    task: 'Identify all hardcoded color instances'
  },
  laForge: {
    name: 'Lieutenant Commander Geordi La Forge',
    role: 'Infrastructure',
    task: 'Verify theme system integration points'
  },
  troi: {
    name: 'Counselor Deanna Troi',
    role: 'User Experience',
    task: 'Assess visual impact and consistency'
  },
  picard: {
    name: 'Captain Jean-Luc Picard',
    role: 'Strategic Leadership',
    task: 'Final approval and strategic coherence'
  }
};

async function runCrewVerification() {
  console.log('🖖 Crew Verification: Hardcoded Color Audit');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const optimizer = getMCPOpenRouterOptimizer();

  // Data's Analysis: Find all hardcoded colors
  console.log('🤖 Commander Data: Scanning for hardcoded colors...');
  
  const hardcodedColors = [
    { pattern: '#00ffaa', description: 'Light green accent' },
    { pattern: '#00FFAA', description: 'Light green accent (uppercase)' },
    { pattern: 'rgba(0, 255, 170', description: 'Light green with opacity' },
    { pattern: '#00ff88', description: 'Light green focus outline' },
    { pattern: 'rgb(0, 255, 170', description: 'Light green RGB' }
  ];

  const filesToCheck = [
    'dashboard/app/globals.css',
    'dashboard/components/StatusRibbon.tsx',
    'dashboard/components/ProgressOverlay.tsx',
    'dashboard/components/UniversalProgressBar.tsx',
    'dashboard/components/SimpleChart.tsx',
    'dashboard/components/AnalyticsDashboard.tsx',
    'dashboard/components/RAGProjectRecommendations.tsx'
  ];

  const findings = [];

  filesToCheck.forEach(filePath => {
    const fullPath = path.join(__dirname, '../../', filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      hardcodedColors.forEach(({ pattern, description }) => {
        const regex = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = content.match(regex);
        if (matches) {
          const lines = content.split('\n');
          const lineNumbers = lines
            .map((line, idx) => ({ line: line.trim(), num: idx + 1 }))
            .filter(({ line }) => regex.test(line))
            .map(({ num }) => num);

          findings.push({
            file: filePath,
            pattern,
            description,
            count: matches.length,
            lineNumbers,
            context: lines.slice(Math.max(0, lineNumbers[0] - 2), lineNumbers[0] + 3).join('\n')
          });
        }
      });
    }
  });

  console.log(`📊 Found ${findings.length} files with hardcoded colors\n`);

  // La Forge's Analysis: Theme system integration
  console.log('🔧 Lieutenant Commander La Forge: Analyzing theme system integration...');
  const laForgePrompt = `You are Lieutenant Commander Geordi La Forge, Chief Engineer.

Review these hardcoded color findings and determine:

1. Which CSS variables should replace each hardcoded color?
2. Are there theme-aware alternatives available?
3. What's the proper integration path with GlobalThemeStyles.tsx?

Findings:
${JSON.stringify(findings, null, 2)}

Provide specific recommendations for each file, including:
- Current hardcoded value
- Recommended CSS variable
- Theme system integration approach
- Any fallback values needed

Return JSON with recommendations.`;

  const laForgeAnalysis = await optimizer.optimizeAndCall('laForge', laForgePrompt, {
    temperature: 0.3,
    max_tokens: 3000
  });

  // Troi's UX Assessment
  console.log('💭 Counselor Troi: Assessing visual impact...');
  const troiPrompt = `You are Counselor Deanna Troi, Ship's Counselor and UX Specialist.

Assess the visual impact of these hardcoded colors:

1. How does the light green (#00ffaa) affect theme consistency?
2. What emotional impact does bypassing themes have on users?
3. Are there accessibility concerns with hardcoded colors?
4. How should we maintain visual hierarchy while fixing this?

Provide UX-focused recommendations.`;

  const troiAnalysis = await optimizer.optimizeAndCall('troi', troiPrompt, {
    temperature: 0.4,
    max_tokens: 2000
  });

  // Picard's Final Decision
  console.log('🎖️ Captain Picard: Strategic review...');
  const picardPrompt = `You are Captain Jean-Luc Picard, Commanding Officer.

Review all crew findings and provide:

1. Priority ranking: Which fixes are most critical?
2. Implementation order: What should be done first?
3. Risk assessment: Any potential issues?
4. Final approval: Approved approach with rationale

Synthesize all crew input into a final, actionable plan.`;

  const picardDecision = await optimizer.optimizeAndCall('picard', picardPrompt, {
    temperature: 0.3,
    max_tokens: 2500
  });

  // Compile results
  const results = {
    timestamp: new Date().toISOString(),
    findings,
    laForgeAnalysis,
    troiAnalysis,
    picardDecision
  };

  // Save to reports
  const reportsDir = path.join(__dirname, '../../reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const reportPath = path.join(reportsDir, `hardcoded-colors-audit-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Verification complete!`);
  console.log(`📄 Report saved to: ${reportPath}\n`);

  // Print summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CREW VERIFICATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`🤖 Data: Found ${findings.length} files with hardcoded colors`);
  findings.forEach(f => {
    console.log(`   • ${f.file}: ${f.count} instances of ${f.description}`);
  });
  console.log('\n🔧 La Forge: Theme system integration recommendations complete');
  console.log('💭 Troi: UX impact assessment complete');
  console.log('🎖️ Picard: Strategic review and approval complete\n');

  console.log('Next steps:');
  console.log('1. Review the detailed report');
  console.log('2. Replace hardcoded colors with theme-aware CSS variables');
  console.log('3. Test across all themes to ensure consistency\n');

  return results;
}

// Run if called directly
if (require.main === module) {
  runCrewVerification().catch(console.error);
}

module.exports = { runCrewVerification };

