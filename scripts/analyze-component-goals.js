#!/usr/bin/env node

/**
 * Component Goals Analyzer
 * 
 * Analyzes all dashboard components and documents their goals, responsibilities,
 * and integration points for RAG storage and crew coordination.
 * 
 * Leadership: Commander Riker (Organization) + Quark (Business Analytics)
 * Crew: All teams analyzing components in parallel
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../dashboard/components');
const OUTPUT_DIR = path.join(__dirname, '../docs/component-goals');

// Component goal patterns to extract
const GOAL_PATTERNS = {
  purpose: /purpose|goal|objective|what.*does|why.*exists/i,
  responsibility: /responsibility|handles|manages|controls|owns/i,
  integration: /imports|uses|depends|integrates|connects/i,
  data: /data|state|props|fetch|api|endpoint/i,
  userIntent: /user|display|show|render|visualize/i,
  domain: /domain|section|category|area/i
};

// Domain mapping from DomainDrivenBentoLayout
const DOMAIN_MAPPING = {
  'health': 'System Health & Monitoring',
  'intelligence': 'Intelligence & Learning',
  'design': 'Design & Theming',
  'projects': 'Project Management',
  'workflows': 'Workflow & Automation',
  'security': 'Security & Compliance',
  'data': 'Data & Analytics',
  'knowledge': 'Knowledge & Documentation'
};

function extractComponentGoals(filePath, fileName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  
  const goals = {
    componentName: fileName.replace('.tsx', '').replace('.ts', '').replace('.jsx', '').replace('.js', ''),
    filePath: filePath.replace(path.join(__dirname, '..'), ''),
    purpose: '',
    responsibilities: [],
    integrations: [],
    dataSources: [],
    userIntent: '',
    domain: '',
    crewOwners: [],
    businessValue: '',
    technicalDetails: {
      framework: '',
      hooks: [],
      dependencies: []
    }
  };

  // Extract from comments and code
  let inComment = false;
  let commentBuffer = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Track comments
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
      commentBuffer.push(line);
      inComment = true;
      continue;
    }
    
    if (inComment && (line.includes('*/') || !line.startsWith('*'))) {
      const commentText = commentBuffer.join(' ');
      
      // Extract purpose
      if (GOAL_PATTERNS.purpose.test(commentText) && !goals.purpose) {
        goals.purpose = commentText.replace(/[\/\*]/g, '').trim();
      }
      
      // Extract responsibilities
      if (GOAL_PATTERNS.responsibility.test(commentText)) {
        goals.responsibilities.push(commentText.replace(/[\/\*]/g, '').trim());
      }
      
      commentBuffer = [];
      inComment = false;
    }
    
    // Extract imports (integrations)
    if (line.startsWith('import ')) {
      const importMatch = line.match(/import\s+.*?\s+from\s+['"](.+?)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];
        if (!importPath.startsWith('react') && !importPath.startsWith('next')) {
          goals.integrations.push(importPath);
        }
      }
      
      // Extract hooks
      if (line.includes('use')) {
        const hookMatch = line.match(/use(\w+)/);
        if (hookMatch) {
          goals.technicalDetails.hooks.push(hookMatch[1]);
        }
      }
    }
    
    // Extract data sources
    if (line.includes('useAppState') || line.includes('useState') || line.includes('fetch')) {
      goals.dataSources.push(line.trim());
    }
    
    // Extract domain from DomainDrivenBentoLayout usage
    if (line.includes('DomainSection') || line.includes('DomainSubSection')) {
      for (const [domainId, domainName] of Object.entries(DOMAIN_MAPPING)) {
        if (content.includes(domainId)) {
          goals.domain = domainName;
          break;
        }
      }
    }
  }
  
  // Infer crew owners based on component purpose
  if (goals.purpose.toLowerCase().includes('analytics') || goals.purpose.toLowerCase().includes('data')) {
    goals.crewOwners.push('commander_data');
  }
  if (goals.purpose.toLowerCase().includes('security') || goals.purpose.toLowerCase().includes('compliance')) {
    goals.crewOwners.push('lieutenant_worf');
  }
  if (goals.purpose.toLowerCase().includes('ux') || goals.purpose.toLowerCase().includes('user') || goals.purpose.toLowerCase().includes('experience')) {
    goals.crewOwners.push('counselor_troi');
  }
  if (goals.purpose.toLowerCase().includes('health') || goals.purpose.toLowerCase().includes('monitor') || goals.purpose.toLowerCase().includes('diagnostic')) {
    goals.crewOwners.push('dr_crusher');
  }
  if (goals.purpose.toLowerCase().includes('workflow') || goals.purpose.toLowerCase().includes('automation')) {
    goals.crewOwners.push('commander_riker');
  }
  if (goals.purpose.toLowerCase().includes('business') || goals.purpose.toLowerCase().includes('cost') || goals.purpose.toLowerCase().includes('roi')) {
    goals.crewOwners.push('quark');
  }
  if (goals.purpose.toLowerCase().includes('infrastructure') || goals.purpose.toLowerCase().includes('integration') || goals.purpose.toLowerCase().includes('api')) {
    goals.crewOwners.push('geordi_la_forge');
  }
  if (goals.purpose.toLowerCase().includes('communication') || goals.purpose.toLowerCase().includes('documentation')) {
    goals.crewOwners.push('lieutenant_uhura');
  }
  
  // Default to Captain Picard for strategic components
  if (goals.crewOwners.length === 0) {
    goals.crewOwners.push('captain_picard');
  }
  
  // Infer business value
  if (goals.purpose.toLowerCase().includes('analytics')) {
    goals.businessValue = 'Provides data-driven insights for decision making';
  } else if (goals.purpose.toLowerCase().includes('security')) {
    goals.businessValue = 'Ensures system security and compliance';
  } else if (goals.purpose.toLowerCase().includes('monitor')) {
    goals.businessValue = 'Enables proactive system health management';
  } else {
    goals.businessValue = 'Enhances user experience and system functionality';
  }
  
  return goals;
}

function analyzeAllComponents() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const components = [];
  const files = fs.readdirSync(COMPONENTS_DIR);
  
  // Filter component files
  const componentFiles = files.filter(f => 
    f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.jsx') || f.endsWith('.js')
  );
  
  console.log(`🔍 Analyzing ${componentFiles.length} components...`);
  
  for (const file of componentFiles) {
    const filePath = path.join(COMPONENTS_DIR, file);
    try {
      const goals = extractComponentGoals(filePath, file);
      components.push(goals);
      console.log(`  ✅ ${goals.componentName}`);
    } catch (error) {
      console.error(`  ❌ Error analyzing ${file}:`, error.message);
    }
  }
  
  // Generate summary
  const summary = {
    analyzedAt: new Date().toISOString(),
    totalComponents: components.length,
    componentsByDomain: {},
    componentsByCrew: {},
    integrationMap: {}
  };
  
  components.forEach(comp => {
    // Group by domain
    const domain = comp.domain || 'Uncategorized';
    if (!summary.componentsByDomain[domain]) {
      summary.componentsByDomain[domain] = [];
    }
    summary.componentsByDomain[domain].push(comp.componentName);
    
    // Group by crew
    comp.crewOwners.forEach(crew => {
      if (!summary.componentsByCrew[crew]) {
        summary.componentsByCrew[crew] = [];
      }
      summary.componentsByCrew[crew].push(comp.componentName);
    });
    
    // Map integrations
    comp.integrations.forEach(integration => {
      if (!summary.integrationMap[integration]) {
        summary.integrationMap[integration] = [];
      }
      summary.integrationMap[integration].push(comp.componentName);
    });
  });
  
  // Write individual component goals
  components.forEach(comp => {
    const outputPath = path.join(OUTPUT_DIR, `${comp.componentName}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(comp, null, 2));
  });
  
  // Write summary
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  // Generate RAG-ready format
  const ragFormat = components.map(comp => ({
    component_name: comp.componentName,
    purpose: comp.purpose,
    responsibilities: comp.responsibilities,
    domain: comp.domain,
    crew_owners: comp.crewOwners,
    business_value: comp.businessValue,
    integrations: comp.integrations,
    data_sources: comp.dataSources,
    technical_stack: comp.technicalDetails,
    semantic_text: `${comp.componentName} ${comp.purpose} ${comp.responsibilities.join(' ')} ${comp.domain} ${comp.businessValue}`.toLowerCase()
  }));
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'rag-ready.json'),
    JSON.stringify(ragFormat, null, 2)
  );
  
  console.log(`\n✅ Analysis complete!`);
  console.log(`   📊 Total components: ${components.length}`);
  console.log(`   📁 Output directory: ${OUTPUT_DIR}`);
  console.log(`   📄 Individual goals: ${components.length} files`);
  console.log(`   📋 Summary: summary.json`);
  console.log(`   🧠 RAG format: rag-ready.json`);
  
  return { components, summary };
}

if (require.main === module) {
  analyzeAllComponents();
}

module.exports = { analyzeAllComponents, extractComponentGoals };

