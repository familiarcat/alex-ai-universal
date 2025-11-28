#!/usr/bin/env node

/**
 * Component Data Source Analyzer
 * 
 * Analyzes all dashboard components to identify:
 * - Components with live data sources
 * - Components without data sources (need mock data)
 * - Data flow paths (e2e)
 * - Problems/gaps for moving from mock to live data
 * 
 * Leadership: Commander Data (Analysis) + Geordi La Forge (Infrastructure)
 * Crew: All teams analyzing components in parallel
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../dashboard/components');
const OUTPUT_DIR = path.join(__dirname, '../docs/component-data-analysis');

const DATA_SOURCE_PATTERNS = {
  live: {
    useAppState: /useAppState|from ['"]@\/lib\/state-manager['"]/,
    fetch: /fetch\(|await fetch/,
    api: /\/api\/|api\/|fetch\(['"]\/api/,
    unifiedDataService: /unified-data-service|getUnifiedDataService|UnifiedDataService/,
    supabase: /supabase|@supabase/,
    n8n: /n8n|webhook/
  },
  mock: {
    useState: /useState\(\[|useState\(\{/,
    hardcoded: /const.*=.*\[|const.*=.*\{/,
    empty: /\[\]|{}|null|undefined/
  }
};

function analyzeComponentDataSources(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const analysis = {
    componentName: fileName.replace(/\.(tsx|ts|jsx|js)$/, ''),
    filePath: filePath.replace(path.join(__dirname, '..'), ''),
    hasLiveData: false,
    hasMockData: false,
    dataSources: [],
    dataFlow: [],
    problems: [],
    recommendations: []
  };

  // Check for live data sources
  if (DATA_SOURCE_PATTERNS.live.useAppState.test(content)) {
    analysis.hasLiveData = true;
    analysis.dataSources.push('useAppState (localStorage state)');
    analysis.dataFlow.push('Component → useAppState → localStorage');
  }

  if (DATA_SOURCE_PATTERNS.live.fetch.test(content)) {
    analysis.hasLiveData = true;
    const fetchMatches = content.match(/fetch\(['"]([^'"]+)['"]/g);
    if (fetchMatches) {
      fetchMatches.forEach(match => {
        const url = match.match(/['"]([^'"]+)['"]/)?.[1];
        if (url) {
          analysis.dataSources.push(`fetch(${url})`);
          if (url.startsWith('/api/')) {
            analysis.dataFlow.push(`Component → fetch(${url}) → Next.js API → Supabase/n8n`);
          } else {
            analysis.dataFlow.push(`Component → fetch(${url}) → External API`);
          }
        }
      });
    }
  }

  if (DATA_SOURCE_PATTERNS.live.unifiedDataService.test(content)) {
    analysis.hasLiveData = true;
    analysis.dataSources.push('UnifiedDataService (DDD-compliant)');
    analysis.dataFlow.push('Component → UnifiedDataService → Next.js API → Supabase (primary) / n8n (fallback)');
  }

  if (DATA_SOURCE_PATTERNS.live.api.test(content)) {
    analysis.hasLiveData = true;
    const apiMatches = content.match(/['"]\/api\/[^'"]+['"]/g);
    if (apiMatches) {
      apiMatches.forEach(match => {
        const endpoint = match.replace(/['"]/g, '');
        analysis.dataSources.push(`API: ${endpoint}`);
        analysis.dataFlow.push(`Component → ${endpoint} → Supabase/n8n`);
      });
    }
  }

  // Check for mock/empty data
  if (DATA_SOURCE_PATTERNS.mock.useState.test(content)) {
    const useStateMatches = content.match(/useState\((\[[^\]]*\]|\{[^\}]*\})/g);
    if (useStateMatches) {
      useStateMatches.forEach(match => {
        if (match.includes('[]') || match.includes('{}')) {
          analysis.hasMockData = true;
          analysis.dataSources.push('useState with empty initial value (needs data)');
          analysis.problems.push('Component initializes with empty data - needs live data source');
        }
      });
    }
  }

  // Check for hardcoded data
  const hardcodedMatches = content.match(/const\s+\w+\s*=\s*(\[[^\]]+\]|\{[^\}]+\})/g);
  if (hardcodedMatches && !analysis.hasLiveData) {
    analysis.hasMockData = true;
    analysis.dataSources.push('Hardcoded mock data');
    analysis.problems.push('Component uses hardcoded data - should connect to live source');
  }

  // Check for components that render but have no data
  if (!analysis.hasLiveData && !analysis.hasMockData) {
    // Check if component actually needs data (has data-dependent rendering)
    if (content.includes('map(') || content.includes('.length') || content.includes('data') || content.includes('items')) {
      analysis.problems.push('Component appears to need data but has no data source');
      analysis.recommendations.push('Add UnifiedDataService or useAppState for data');
    }
  }

  // Identify gaps for moving from mock to live
  if (analysis.hasMockData && !analysis.hasLiveData) {
    analysis.recommendations.push('Replace mock data with UnifiedDataService call');
    analysis.recommendations.push('Create API endpoint if needed');
    analysis.recommendations.push('Update component to handle loading/error states');
  }

  return analysis;
}

function analyzeAllComponents() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const components = [];
  const files = fs.readdirSync(COMPONENTS_DIR);

  // Filter component files (exclude workflows subdirectory for now)
  const componentFiles = files.filter(f => 
    (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')) &&
    !f.startsWith('.')
  );

  console.log(`🔍 Analyzing ${componentFiles.length} components for data sources...\n`);

  for (const file of componentFiles) {
    const filePath = path.join(COMPONENTS_DIR, file);
    try {
      const analysis = analyzeComponentDataSources(filePath, file);
      components.push(analysis);
      
      const status = analysis.hasLiveData ? '✅' : analysis.hasMockData ? '⚠️' : '❓';
      console.log(`  ${status} ${analysis.componentName}`);
      if (analysis.problems.length > 0) {
        console.log(`     Problems: ${analysis.problems.length}`);
      }
    } catch (error) {
      console.error(`  ❌ Error analyzing ${file}:`, error.message);
    }
  }

  // Generate summary
  const summary = {
    analyzedAt: new Date().toISOString(),
    totalComponents: components.length,
    componentsWithLiveData: components.filter(c => c.hasLiveData).length,
    componentsWithMockData: components.filter(c => c.hasMockData && !c.hasLiveData).length,
    componentsWithoutData: components.filter(c => !c.hasLiveData && !c.hasMockData).length,
    dataFlowPaths: [...new Set(components.flatMap(c => c.dataFlow))],
    allProblems: components.flatMap(c => c.problems.map(p => ({ component: c.componentName, problem: p }))),
    allRecommendations: components.flatMap(c => c.recommendations.map(r => ({ component: c.componentName, recommendation: r })))
  };

  // Write individual component analyses
  components.forEach(comp => {
    const outputPath = path.join(OUTPUT_DIR, `${comp.componentName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(comp, null, 2));
  });

  // Write summary
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );

  // Generate crew-ready report
  const crewReport = {
    timestamp: new Date().toISOString(),
    crew: 'Data (Analysis) + La Forge (Infrastructure)',
    summary: {
      total: summary.totalComponents,
      withLiveData: summary.componentsWithLiveData,
      withMockData: summary.componentsWithMockData,
      withoutData: summary.componentsWithoutData
    },
    dataFlow: summary.dataFlowPaths,
    problems: summary.allProblems,
    recommendations: summary.allRecommendations,
    nextSteps: [
      'Create mock data system for components without live data',
      'Document e2e data flow for all components',
      'Identify API endpoints needed for live data',
      'Create migration plan from mock to live data'
    ]
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'crew-report.json'),
    JSON.stringify(crewReport, null, 2)
  );

  console.log(`\n✅ Analysis complete!`);
  console.log(`   📊 Total components: ${summary.totalComponents}`);
  console.log(`   ✅ With live data: ${summary.componentsWithLiveData}`);
  console.log(`   ⚠️  With mock data: ${summary.componentsWithMockData}`);
  console.log(`   ❓ Without data: ${summary.componentsWithoutData}`);
  console.log(`   📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`   📋 Summary: summary.json`);
  console.log(`   🖖 Crew report: crew-report.json`);

  return { components, summary, crewReport };
}

if (require.main === module) {
  analyzeAllComponents();
}

module.exports = { analyzeAllComponents, analyzeComponentDataSources };

