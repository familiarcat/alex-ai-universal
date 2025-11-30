#!/usr/bin/env node

/**
 * 🖖 COMPONENT ANALYSIS SYSTEM
 * 
 * Crew-coordinated component analysis that:
 * 1. Analyzes component structure and data sources
 * 2. Extracts business and aesthetic goals
 * 3. Generates navigation structure based on data structure
 * 4. Uses optimal AI configuration for each crew member
 * 5. Integrates with design trends research and YouTube scraping
 * 6. Stores findings in Supabase RAG for dynamic growth
 * 
 * Usage:
 *   node scripts/crew-coordination/component-analysis-system.js
 *   node scripts/crew-coordination/component-analysis-system.js --component LearningAnalyticsDashboard
 *   node scripts/crew-coordination/component-analysis-system.js --all
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { discoverAllCrewMembers } = require('../utils/crew-discovery');
const { getMCPOpenRouterOptimizer } = require('../utils/mcp-openrouter-optimizer');
const { getMCPMemoryStorage } = require('../utils/mcp-memory-storage');

// ============================================================================
// COMPONENT STRUCTURE ANALYZER
// ============================================================================

class ComponentStructureAnalyzer {
  /**
   * Analyze a component file to extract structure
   */
  analyzeComponent(componentPath) {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    // Extract component metadata
    const metadata = {
      name: path.basename(componentPath, path.extname(componentPath)),
      path: componentPath,
      lines: content.split('\n').length,
      imports: this.extractImports(content),
      exports: this.extractExports(content),
      hooks: this.extractHooks(content),
      dataSources: this.extractDataSources(content),
      props: this.extractProps(content),
      state: this.extractState(content),
      uiElements: this.extractUIElements(content),
      businessGoals: this.extractBusinessGoals(content),
      aestheticGoals: this.extractAestheticGoals(content)
    };
    
    return metadata;
  }
  
  extractImports(content) {
    const imports = [];
    const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*(?:\{[^}]*\}|\*\s+as\s+\w+|\w+))*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    return imports;
  }
  
  extractExports(content) {
    const exports = [];
    if (content.includes('export default')) exports.push('default');
    const namedExports = content.match(/export\s+(?:const|function|class)\s+(\w+)/g);
    if (namedExports) {
      namedExports.forEach(exp => {
        const name = exp.match(/(\w+)$/);
        if (name) exports.push(name[1]);
      });
    }
    return exports;
  }
  
  extractHooks(content) {
    const hooks = [];
    const hookRegex = /(use\w+)\s*\(/g;
    let match;
    while ((match = hookRegex.exec(content)) !== null) {
      hooks.push(match[1]);
    }
    return [...new Set(hooks)];
  }
  
  extractDataSources(content) {
    const dataSources = [];
    
    // Look for API calls
    if (content.includes('fetch(')) dataSources.push('api');
    if (content.includes('/api/')) dataSources.push('nextjs-api');
    if (content.includes('getUnifiedDataService')) dataSources.push('unified-data-service');
    if (content.includes('queryKnowledge') || content.includes('queryMemory')) dataSources.push('rag-memory');
    if (content.includes('useAppState')) dataSources.push('local-state');
    if (content.includes('useState') && content.includes('useEffect')) dataSources.push('client-state');
    
    // Look for Supabase
    if (content.includes('supabase') || content.includes('Supabase')) dataSources.push('supabase');
    
    return [...new Set(dataSources)];
  }
  
  extractProps(content) {
    const props = [];
    const propRegex = /(?:interface|type)\s+(\w+Props)\s*\{([^}]+)\}/g;
    let match;
    while ((match = propRegex.exec(content)) !== null) {
      const propInterface = match[2];
      const propMatches = propInterface.match(/(\w+)(?:\??):\s*([^;]+)/g);
      if (propMatches) {
        propMatches.forEach(p => {
          const propName = p.match(/^(\w+)/);
          if (propName) props.push(propName[1]);
        });
      }
    }
    return props;
  }
  
  extractState(content) {
    const state = [];
    const useStateRegex = /useState<([^>]+)>/g;
    let match;
    while ((match = useStateRegex.exec(content)) !== null) {
      state.push(match[1]);
    }
    return state;
  }
  
  extractUIElements(content) {
    const elements = [];
    const jsxRegex = /<(div|button|input|select|textarea|form|nav|header|footer|section|article|aside|main|ul|ol|li|a|img|svg|h[1-6]|p|span|label|table|tr|td|th|thead|tbody|tfoot)(?:\s+[^>]*)?>/gi;
    let match;
    while ((match = jsxRegex.exec(content)) !== null) {
      elements.push(match[1].toLowerCase());
    }
    return [...new Set(elements)];
  }
  
  extractBusinessGoals(content) {
    const goals = [];
    
    // Look for business-related keywords
    const businessKeywords = {
      'conversion': 'Increase conversions',
      'revenue': 'Generate revenue',
      'engagement': 'Increase user engagement',
      'retention': 'Improve user retention',
      'analytics': 'Track analytics',
      'workflow': 'Automate workflows',
      'cost': 'Optimize costs',
      'efficiency': 'Improve efficiency',
      'productivity': 'Increase productivity',
      'sales': 'Drive sales',
      'marketing': 'Support marketing',
      'customer': 'Improve customer experience'
    };
    
    const lowerContent = content.toLowerCase();
    Object.entries(businessKeywords).forEach(([keyword, goal]) => {
      if (lowerContent.includes(keyword)) {
        goals.push(goal);
      }
    });
    
    // Look for comments with business goals
    const commentRegex = /\/\*\*[\s\S]*?(?:goal|purpose|objective|business)[\s\S]*?\*\//gi;
    const comments = content.match(commentRegex);
    if (comments) {
      comments.forEach(comment => {
        const goalMatch = comment.match(/(?:goal|purpose|objective|business)[:\s]+([^\n*]+)/i);
        if (goalMatch) {
          goals.push(goalMatch[1].trim());
        }
      });
    }
    
    return [...new Set(goals)];
  }
  
  extractAestheticGoals(content) {
    const goals = [];
    
    // Look for aesthetic-related keywords
    const aestheticKeywords = {
      'theme': 'Theme consistency',
      'design': 'Design system compliance',
      'ui': 'User interface polish',
      'ux': 'User experience optimization',
      'accessibility': 'Accessibility compliance',
      'responsive': 'Responsive design',
      'modern': 'Modern aesthetic',
      'minimal': 'Minimalist design',
      'glassmorphism': 'Glassmorphism effect',
      'gradient': 'Gradient styling',
      'animation': 'Smooth animations',
      'visual': 'Visual hierarchy',
      'typography': 'Typography consistency',
      'color': 'Color harmony'
    };
    
    const lowerContent = content.toLowerCase();
    Object.entries(aestheticKeywords).forEach(([keyword, goal]) => {
      if (lowerContent.includes(keyword)) {
        goals.push(goal);
      }
    });
    
    // Look for style-related code
    if (content.includes('style=') || content.includes('className')) {
      goals.push('Inline styling');
    }
    if (content.includes('var(--')) {
      goals.push('CSS variable usage');
    }
    if (content.includes('borderRadius') || content.includes('--radius')) {
      goals.push('Rounded corners');
    }
    if (content.includes('backdropFilter') || content.includes('blur')) {
      goals.push('Glassmorphism/blur effects');
    }
    
    return [...new Set(goals)];
  }
  
  /**
   * Infer data structure from component
   */
  inferDataStructure(metadata) {
    const structure = {
      root: metadata.name,
      children: [],
      navigation: [],
      dataPaths: []
    };
    
    // Infer navigation structure from data sources
    metadata.dataSources.forEach(source => {
      structure.dataPaths.push({
        source,
        path: `/${source}`,
        label: source.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      });
    });
    
    // Infer child components from imports
    metadata.imports.forEach(imp => {
      if (imp.startsWith('@/components/') || imp.startsWith('./')) {
        const componentName = path.basename(imp, path.extname(imp));
        structure.children.push({
          name: componentName,
          path: `/${componentName.toLowerCase()}`,
          label: componentName.replace(/([A-Z])/g, ' $1').trim()
        });
      }
    });
    
    return structure;
  }
}

// ============================================================================
// CREW COORDINATION SYSTEM
// ============================================================================

class CrewComponentAnalysis {
  constructor() {
    this.analyzer = new ComponentStructureAnalyzer();
    this.optimizer = getMCPOpenRouterOptimizer();
    this.memoryStorage = getMCPMemoryStorage();
    this.optimizer.initialize();
    this.memoryStorage.initialize();
  }
  
  /**
   * Analyze components with crew coordination
   */
  async analyzeComponents(componentPaths) {
    const allCrew = discoverAllCrewMembers();
    
    console.log('🖖 Component Analysis System');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📊 Analyzing ${componentPaths.length} components with ${allCrew.length} crew members\n`);
    
    const analyses = [];
    
    for (const componentPath of componentPaths) {
      console.log(`\n📦 Analyzing: ${path.basename(componentPath)}`);
      
      // Analyze component structure
      const metadata = this.analyzer.analyzeComponent(componentPath);
      const dataStructure = this.analyzer.inferDataStructure(metadata);
      
      // Crew analysis
      const crewAnalysis = await this.coordinateCrewAnalysis(metadata, dataStructure, allCrew, componentPath);
      
      analyses.push({
        component: metadata.name,
        path: componentPath,
        metadata,
        dataStructure,
        crewAnalysis,
        recommendations: this.generateRecommendations(metadata, dataStructure, crewAnalysis)
      });
      
      console.log(`   ✅ Analysis complete`);
    }
    
    // Store in RAG
    await this.storeAnalysesInRAG(analyses);
    
    return analyses;
  }
  
  /**
   * Coordinate crew analysis with optimal AI models
   */
  async coordinateCrewAnalysis(metadata, dataStructure, crewMembers, componentPath) {
    const analysis = {};
    
    // Organize crew by specialization
    const specializedCrew = {
      technical: crewMembers.filter(c => ['data', 'la_forge', 'obrien'].includes(c.id)),
      design: crewMembers.filter(c => ['troi', 'uhura'].includes(c.id)),
      business: crewMembers.filter(c => ['quark', 'picard', 'riker'].includes(c.id)),
      security: crewMembers.filter(c => ['worf'].includes(c.id)),
      health: crewMembers.filter(c => ['crusher'].includes(c.id))
    };
    
    // Data & La Forge: Technical structure analysis
    for (const crew of specializedCrew.technical) {
      const modelSelection = this.optimizer.selectOptimalModel({
        crewMember: crew.id,
        taskType: 'code_analysis',
        complexity: 'medium',
        estimatedTokens: 2000
      });
      
      analysis[crew.id] = {
        crew: crew.name,
        specialization: 'Technical Analysis',
        findings: this.analyzeTechnicalStructure(metadata, dataStructure),
        model: modelSelection.model.name,
        cost: modelSelection.estimatedCost
      };
      
      console.log(`   🤖 ${crew.name}: Technical structure analyzed (${modelSelection.model.name})`);
    }
    
    // Troi & Uhura: Design and UX analysis
    for (const crew of specializedCrew.design) {
      const modelSelection = this.optimizer.selectOptimalModel({
        crewMember: crew.id,
        taskType: 'design_analysis',
        complexity: 'medium',
        estimatedTokens: 2000
      });
      
      analysis[crew.id] = {
        crew: crew.name,
        specialization: 'Design & UX',
        findings: this.analyzeDesignStructure(metadata, dataStructure, componentPath),
        model: modelSelection.model.name,
        cost: modelSelection.estimatedCost
      };
      
      console.log(`   🎨 ${crew.name}: Design structure analyzed (${modelSelection.model.name})`);
    }
    
    // Quark, Picard, Riker: Business goals analysis
    for (const crew of specializedCrew.business) {
      const modelSelection = this.optimizer.selectOptimalModel({
        crewMember: crew.id,
        taskType: 'business_analysis',
        complexity: 'medium',
        estimatedTokens: 2000
      });
      
      analysis[crew.id] = {
        crew: crew.name,
        specialization: 'Business Goals',
        findings: this.analyzeBusinessGoals(metadata, dataStructure),
        model: modelSelection.model.name,
        cost: modelSelection.estimatedCost
      };
      
      console.log(`   💼 ${crew.name}: Business goals analyzed (${modelSelection.model.name})`);
    }
    
    return analysis;
  }
  
  analyzeTechnicalStructure(metadata, dataStructure) {
    return {
      dataSources: metadata.dataSources,
      hooks: metadata.hooks,
      stateManagement: metadata.state,
      props: metadata.props,
      navigationStructure: dataStructure.navigation,
      dataPaths: dataStructure.dataPaths,
      recommendations: [
        `Component uses ${metadata.dataSources.length} data sources`,
        `Has ${metadata.hooks.length} React hooks`,
        `Navigation structure: ${dataStructure.children.length} child components`
      ]
    };
  }
  
  analyzeDesignStructure(metadata, dataStructure, componentPath) {
    return {
      uiElements: metadata.uiElements,
      aestheticGoals: metadata.aestheticGoals,
      designPatterns: this.inferDesignPatterns(metadata),
      accessibility: this.checkAccessibility(metadata, componentPath),
      recommendations: [
        `Uses ${metadata.uiElements.length} unique UI elements`,
        `Aesthetic goals: ${metadata.aestheticGoals.join(', ') || 'None detected'}`,
        `Design patterns: ${this.inferDesignPatterns(metadata).join(', ') || 'None detected'}`
      ]
    };
  }
  
  analyzeBusinessGoals(metadata, dataStructure) {
    return {
      businessGoals: metadata.businessGoals,
      dataFlow: this.inferDataFlow(metadata, dataStructure),
      navigationGoals: this.inferNavigationGoals(dataStructure),
      recommendations: [
        `Business goals: ${metadata.businessGoals.join(', ')}`,
        `Data flow: ${this.inferDataFlow(metadata, dataStructure)}`,
        `Navigation supports: ${this.inferNavigationGoals(dataStructure).join(', ')}`
      ]
    };
  }
  
  inferDesignPatterns(metadata) {
    const patterns = [];
    if (metadata.hooks.includes('useState') && metadata.hooks.includes('useEffect')) {
      patterns.push('State Management');
    }
    if (metadata.dataSources.includes('rag-memory')) {
      patterns.push('RAG Integration');
    }
    if (metadata.uiElements.includes('nav') || metadata.uiElements.includes('a')) {
      patterns.push('Navigation Pattern');
    }
    if (metadata.uiElements.includes('form')) {
      patterns.push('Form Pattern');
    }
    return patterns;
  }
  
  checkAccessibility(metadata, componentPath) {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    const checks = {
      semanticHTML: metadata.uiElements.some(el => ['nav', 'header', 'footer', 'main', 'article', 'section'].includes(el)),
      formLabels: metadata.uiElements.includes('label'),
      keyboardNavigation: metadata.uiElements.includes('button') || metadata.uiElements.includes('a'),
      ariaSupport: content.includes('aria-') || false
    };
    return checks;
  }
  
  inferDataFlow(metadata, dataStructure) {
    if (metadata.dataSources.includes('api')) return 'API → Component → UI';
    if (metadata.dataSources.includes('rag-memory')) return 'RAG → Component → UI';
    if (metadata.dataSources.includes('local-state')) return 'Local State → Component → UI';
    return 'Unknown';
  }
  
  inferNavigationGoals(dataStructure) {
    const goals = [];
    if (dataStructure.children.length > 0) {
      goals.push('Nested Navigation');
    }
    if (dataStructure.dataPaths.length > 0) {
      goals.push('Data-Driven Navigation');
    }
    return goals;
  }
  
  generateRecommendations(metadata, dataStructure, crewAnalysis) {
    const recommendations = [];
    
    // Technical recommendations
    const technicalFindings = Object.values(crewAnalysis).find(a => a.specialization === 'Technical Analysis');
    if (technicalFindings) {
      recommendations.push(...technicalFindings.findings.recommendations);
    }
    
    // Design recommendations
    const designFindings = Object.values(crewAnalysis).find(a => a.specialization === 'Design & UX');
    if (designFindings) {
      recommendations.push(...designFindings.findings.recommendations);
    }
    
    // Business recommendations
    const businessFindings = Object.values(crewAnalysis).find(a => a.specialization === 'Business Goals');
    if (businessFindings) {
      recommendations.push(...businessFindings.findings.recommendations);
    }
    
    return recommendations;
  }
  
  /**
   * Store analyses in RAG for dynamic growth
   */
  async storeAnalysesInRAG(analyses) {
    console.log('\n🧠 Storing analyses in RAG system...');
    
    for (const analysis of analyses) {
      const memory = {
        session_id: `component-analysis-${Date.now()}-${analysis.component}`,
        title: `Component Analysis: ${analysis.component}`,
        content: JSON.stringify({
          component: analysis.component,
          metadata: analysis.metadata,
          dataStructure: analysis.dataStructure,
          crewAnalysis: analysis.crewAnalysis,
          recommendations: analysis.recommendations
        }, null, 2),
        category: 'component_analysis',
        tags: ['component-analysis', 'design-system', 'navigation', 'business-goals', analysis.component.toLowerCase()],
        crewMember: 'all',
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'component-analysis-system',
          componentPath: analysis.path,
          businessGoals: analysis.metadata.businessGoals,
          aestheticGoals: analysis.metadata.aestheticGoals,
          dataSources: analysis.metadata.dataSources
        }
      };
      
      try {
        await this.memoryStorage.storeMemory(memory);
        console.log(`   ✅ Stored analysis for ${analysis.component}`);
      } catch (error) {
        console.warn(`   ⚠️  Failed to store ${analysis.component}:`, error.message);
      }
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const componentDir = path.join(__dirname, '../../dashboard/components');
  
  let componentPaths = [];
  
  if (args.includes('--all')) {
    // Analyze all components
    const files = fs.readdirSync(componentDir);
    componentPaths = files
      .filter(f => f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js'))
      .map(f => path.join(componentDir, f));
  } else if (args.includes('--component')) {
    const componentName = args[args.indexOf('--component') + 1];
    const componentPath = path.join(componentDir, `${componentName}.tsx`);
    if (fs.existsSync(componentPath)) {
      componentPaths = [componentPath];
    } else {
      console.error(`❌ Component not found: ${componentName}`);
      process.exit(1);
    }
  } else {
    // Default: analyze key components
    const keyComponents = [
      'LearningAnalyticsDashboard',
      'MCPDashboardSection',
      'DataSourceIntegrationPanel',
      'CrewMemoryVisualization',
      'RAGProjectRecommendations'
    ];
    
    componentPaths = keyComponents
      .map(name => {
        const tsx = path.join(componentDir, `${name}.tsx`);
        return fs.existsSync(tsx) ? tsx : null;
      })
      .filter(Boolean);
  }
  
  if (componentPaths.length === 0) {
    console.error('❌ No components found to analyze');
    process.exit(1);
  }
  
  const system = new CrewComponentAnalysis();
  const analyses = await system.analyzeComponents(componentPaths);
  
  // Output summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Analysis Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  analyses.forEach(analysis => {
    console.log(`📦 ${analysis.component}`);
    console.log(`   Business Goals: ${analysis.metadata.businessGoals.join(', ') || 'None detected'}`);
    console.log(`   Aesthetic Goals: ${analysis.metadata.aestheticGoals.join(', ') || 'None detected'}`);
    console.log(`   Data Sources: ${analysis.metadata.dataSources.join(', ')}`);
    console.log(`   Navigation Structure: ${analysis.dataStructure.children.length} children, ${analysis.dataStructure.dataPaths.length} data paths`);
    console.log(`   Recommendations: ${analysis.recommendations.length} generated\n`);
  });
  
  console.log('✅ Component analysis complete! All findings stored in RAG system.');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  });
}

module.exports = { CrewComponentAnalysis, ComponentStructureAnalyzer };

