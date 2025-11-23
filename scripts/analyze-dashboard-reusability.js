#!/usr/bin/env node
/**
 * 🖖 Dashboard Reusability Analysis
 * 
 * Analyzes the dashboard system to identify problems and solutions
 * for making it a reusable basis for future projects.
 * 
 * Crew Coordination:
 * - Data: Technical architecture analysis
 * - La Forge: Infrastructure and reusability patterns
 * - Riker: Tactical implementation strategy
 * - Quark: Cost-benefit of reusability
 * 
 * Usage:
 *   node scripts/analyze-dashboard-reusability.js
 */

const fs = require('fs');
const path = require('path');
const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');
const { SmartRAGIngestion } = require('./rag-smart-ingestion');

class DashboardReusabilityAnalyzer {
  constructor() {
    this.optimizer = null;
    this.ingestion = null;
    this.dashboardPath = path.join(__dirname, '..', 'dashboard');
    this.analysis = {
      structure: {},
      problems: [],
      solutions: [],
      patterns: [],
      recommendations: []
    };
  }

  async initialize() {
    this.optimizer = getMCPOpenRouterOptimizer();
    this.optimizer.initialize();
    
    this.ingestion = new SmartRAGIngestion();
    await this.ingestion.initialize();
  }

  /**
   * Analyze dashboard structure
   */
  analyzeStructure() {
    console.log('📊 Analyzing dashboard structure...\n');
    
    const structure = {
      components: [],
      lib: [],
      app: [],
      packages: []
    };
    
    // Analyze dashboard directory
    if (fs.existsSync(this.dashboardPath)) {
      const componentsPath = path.join(this.dashboardPath, 'components');
      const libPath = path.join(this.dashboardPath, 'lib');
      const appPath = path.join(this.dashboardPath, 'app');
      
      if (fs.existsSync(componentsPath)) {
        structure.components = fs.readdirSync(componentsPath)
          .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
          .map(f => f.replace(/\.(tsx|ts)$/, ''));
      }
      
      if (fs.existsSync(libPath)) {
        structure.lib = fs.readdirSync(libPath)
          .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))
          .map(f => f.replace(/\.(tsx|ts)$/, ''));
      }
      
      if (fs.existsSync(appPath)) {
        structure.app = this.getAppRoutes(appPath);
      }
    }
    
    // Analyze dashboard-core package
    const dashboardCorePath = path.join(__dirname, '..', 'packages', 'dashboard-core');
    if (fs.existsSync(dashboardCorePath)) {
      const srcPath = path.join(dashboardCorePath, 'src');
      if (fs.existsSync(srcPath)) {
        structure.packages = this.getPackageStructure(srcPath);
      }
    }
    
    this.analysis.structure = structure;
    
    console.log(`   ✅ Components: ${structure.components.length}`);
    console.log(`   ✅ Lib modules: ${structure.lib.length}`);
    console.log(`   ✅ App routes: ${structure.app.length}`);
    console.log(`   ✅ Package modules: ${structure.packages.length}\n`);
    
    return structure;
  }

  /**
   * Get app routes recursively
   */
  getAppRoutes(dir, base = '') {
    const routes = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const route = base ? `${base}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        routes.push(...this.getAppRoutes(fullPath, route));
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        routes.push(route.replace('/page', ''));
      }
    }
    
    return routes;
  }

  /**
   * Get package structure
   */
  getPackageStructure(srcPath) {
    const modules = [];
    
    const walk = (dir, prefix = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const name = prefix ? `${prefix}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          walk(fullPath, name);
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          modules.push(name.replace(/\.(tsx|ts)$/, ''));
        }
      }
    };
    
    walk(srcPath);
    return modules;
  }

  /**
   * Get crew analysis
   */
  async getCrewAnalysis(structure) {
    console.log('🤖 Getting crew analysis...\n');
    
    const structureSummary = JSON.stringify(structure, null, 2);
    
    // Data: Technical architecture analysis
    console.log('   🤖 Commander Data: Analyzing technical architecture...');
    const dataPrompt = `You are Commander Data. Analyze this dashboard structure for reusability:

${structureSummary}

Identify:
1. Current architecture patterns
2. Reusability opportunities
3. Technical problems preventing reuse
4. Solutions for making it a reusable base for all projects

Be specific and technical. Focus on making every new project have a dashboard that outputs a unique website.`;

    const dataAnalysis = await this.optimizer.optimizeAndCall(dataPrompt, {
      crewMember: 'data',
      complexity: 'high',
      taskType: 'complex_analysis',
      temperature: 0.7,
      maxTokens: 1500
    });

    // La Forge: Infrastructure and reusability
    console.log('   🔧 La Forge: Analyzing infrastructure patterns...');
    const laForgePrompt = `You are Lieutenant Commander Geordi La Forge. Analyze infrastructure for reusability:

${structureSummary}

Identify:
1. Infrastructure patterns that can be reused
2. Component library opportunities
3. Configuration patterns for project-specific dashboards
4. Build/deployment patterns for unique website outputs

Focus on making the dashboard a reusable foundation.`;

    const laForgeAnalysis = await this.optimizer.optimizeAndCall(laForgePrompt, {
      crewMember: 'la_forge',
      complexity: 'high',
      taskType: 'infrastructure',
      temperature: 0.7,
      maxTokens: 1500
    });

    // Riker: Tactical implementation
    console.log('   ⚡ Riker: Coordinating tactical strategy...');
    const rikerPrompt = `You are Commander William Riker. Create a tactical plan for dashboard reusability:

Current Structure:
${structureSummary}

Crew Analysis:
Data: ${this.extractContent(dataAnalysis).substring(0, 500)}...
La Forge: ${this.extractContent(laForgeAnalysis).substring(0, 500)}...

Create a tactical implementation plan:
1. Step-by-step approach
2. Priority order
3. Implementation strategy
4. Testing approach

Be tactical and actionable.`;

    const rikerPlan = await this.optimizer.optimizeAndCall(rikerPrompt, {
      crewMember: 'riker',
      complexity: 'high',
      taskType: 'operations',
      temperature: 0.7,
      maxTokens: 1500
    });

    // Quark: Cost-benefit analysis
    console.log('   💰 Quark: Analyzing cost-benefit...');
    const quarkPrompt = `You are Quark. Analyze the cost-benefit of dashboard reusability:

Current: Each project has custom dashboard setup
Proposed: Reusable dashboard base for all projects

Analyze:
1. Development cost savings
2. Maintenance cost reduction
3. Time-to-market improvement
4. ROI of making dashboard reusable

Be profit-focused and specific.`;

    const quarkAnalysis = await this.optimizer.optimizeAndCall(quarkPrompt, {
      crewMember: 'quark',
      complexity: 'medium',
      taskType: 'business_analysis',
      temperature: 0.7,
      maxTokens: 1000
    });

    return {
      data: this.extractContent(dataAnalysis),
      laForge: this.extractContent(laForgeAnalysis),
      riker: this.extractContent(rikerPlan),
      quark: this.extractContent(quarkAnalysis)
    };
  }

  /**
   * Extract content from LLM response
   */
  extractContent(response) {
    if (typeof response === 'string') return response;
    if (response.choices?.[0]?.message?.content) {
      return response.choices[0].message.content;
    }
    if (response.body) return response.body;
    return JSON.stringify(response);
  }

  /**
   * Store analysis in RAG using smart ingestion
   */
  async storeAnalysis(analysis, crewAnalysis) {
    console.log('\n💾 Storing analysis in RAG system...\n');
    
    const title = 'Dashboard Reusability Analysis: Making Dashboard a Reusable Base for All Projects';
    const content = `# Dashboard Reusability Analysis

## Current Structure
${JSON.stringify(analysis.structure, null, 2)}

## Crew Analysis

### Commander Data - Technical Architecture
${crewAnalysis.data}

### Lieutenant Commander La Forge - Infrastructure Patterns
${crewAnalysis.laForge}

### Commander Riker - Tactical Implementation Plan
${crewAnalysis.riker}

### Quark - Cost-Benefit Analysis
${crewAnalysis.quark}

## Key Insights

1. **Reusability Goal**: Make dashboard a reusable base where every new project has a dashboard that outputs a unique website
2. **Current State**: Dashboard exists but needs refactoring for reusability
3. **Solution**: Create reusable dashboard template with project-specific configuration
4. **ROI**: Significant cost savings in development and maintenance

## Implementation Priority

1. Extract reusable components to dashboard-core package
2. Create project-specific configuration system
3. Implement unique website output generation
4. Test with multiple projects
`;

    const result = await this.ingestion.ingest(title, content, {
      crewMember: 'data',
      category: 'architectural_decision',
      tags: ['dashboard', 'reusability', 'architecture', 'crew-analysis'],
      isHardProblem: true,
      crewWorkingTogether: true,
      source: 'dashboard-analysis'
    });
    
    return result;
  }

  /**
   * Test redundancy prevention
   */
  async testRedundancyPrevention() {
    console.log('\n🧪 Testing redundancy prevention...\n');
    
    const title = 'Dashboard Reusability Analysis: Making Dashboard a Reusable Base for All Projects';
    const content = 'This is a test to see if the system prevents storing duplicate analysis.';
    
    const result = await this.ingestion.ingest(title, content, {
      crewMember: 'data',
      category: 'architectural_decision',
      tags: ['dashboard', 'reusability'],
      isHardProblem: false,
      crewWorkingTogether: false
    });
    
    if (!result.stored) {
      console.log(`   ✅ Redundancy prevention working: ${result.reason}`);
      console.log(`   📋 Existing: ${result.existing?.title || 'N/A'}\n`);
    } else {
      console.log(`   ⚠️  Test content stored (different enough from analysis)\n`);
    }
    
    return result;
  }
}

async function main() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 DASHBOARD REUSABILITY ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const analyzer = new DashboardReusabilityAnalyzer();
  await analyzer.initialize();
  
  // Step 1: Analyze structure
  const structure = analyzer.analyzeStructure();
  
  // Step 2: Get crew analysis
  const crewAnalysis = await analyzer.getCrewAnalysis(structure);
  
  // Step 3: Display results
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 COMMANDER DATA - TECHNICAL ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(crewAnalysis.data.substring(0, 800) + '...\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 LIEUTENANT COMMANDER LA FORGE - INFRASTRUCTURE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(crewAnalysis.laForge.substring(0, 800) + '...\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ COMMANDER RIKER - TACTICAL PLAN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(crewAnalysis.riker.substring(0, 800) + '...\n');
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 QUARK - COST-BENEFIT ANALYSIS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(crewAnalysis.quark.substring(0, 600) + '...\n');
  
  // Step 4: Store in RAG
  const storageResult = await analyzer.storeAnalysis(analyzer.analysis, crewAnalysis);
  
  if (storageResult.stored) {
    console.log('✅ Analysis stored successfully in RAG system!');
    console.log(`   ID: ${storageResult.id}`);
    console.log(`   Cost: $${storageResult.cost.toFixed(6)}\n`);
  } else {
    console.log(`⚠️  Analysis not stored: ${storageResult.reason}\n`);
  }
  
  // Step 5: Test redundancy prevention
  await analyzer.testRedundancyPrevention();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ ANALYSIS COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { DashboardReusabilityAnalyzer };

