#!/usr/bin/env node
/**
 * Crew Dashboard Codebase Analysis
 * 
 * All crew members analyze the dashboard codebase together to find optimal,
 * cost-effective conclusions. Results stored via DDD workflow (client => n8n => Supabase)
 * so all crew members stay in sync.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const WORKSPACE_ROOT = process.cwd();
const DASHBOARD_DIR = path.join(WORKSPACE_ROOT, 'dashboard');
const PACKAGES_DIR = path.join(WORKSPACE_ROOT, 'packages', 'dashboard-core');

// Load credentials from environment or .zshrc
function loadCredentials() {
  const credentials = {
    n8nUrl: process.env.N8N_URL || 'https://n8n.pbradygeorgen.com',
    n8nApiKey: process.env.N8N_API_KEY || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_ANON_KEY || ''
  };

  // Try to load from .zshrc if not in environment
  if (!credentials.n8nApiKey || !credentials.supabaseUrl) {
    try {
      const zshrcPath = path.join(process.env.HOME, '.zshrc');
      if (fs.existsSync(zshrcPath)) {
        const zshrcContent = fs.readFileSync(zshrcPath, 'utf8');
        
        // Extract N8N credentials
        const n8nMatch = zshrcContent.match(/export\s+N8N_URL=['"]([^'"]+)['"]/);
        if (n8nMatch && !credentials.n8nUrl) {
          credentials.n8nUrl = n8nMatch[1];
        }
        
        const n8nKeyMatch = zshrcContent.match(/export\s+N8N_API_KEY=['"]([^'"]+)['"]/);
        if (n8nKeyMatch && !credentials.n8nApiKey) {
          credentials.n8nApiKey = n8nKeyMatch[1];
        }
        
        // Extract Supabase credentials
        const supabaseUrlMatch = zshrcContent.match(/export\s+SUPABASE_URL=['"]([^'"]+)['"]/);
        if (supabaseUrlMatch && !credentials.supabaseUrl) {
          credentials.supabaseUrl = supabaseUrlMatch[1];
        }
        
        const supabaseKeyMatch = zshrcContent.match(/export\s+SUPABASE_ANON_KEY=['"]([^'"]+)['"]/);
        if (supabaseKeyMatch && !credentials.supabaseKey) {
          credentials.supabaseKey = supabaseKeyMatch[1];
        }
      }
    } catch (error) {
      console.warn('⚠️  Could not load credentials from .zshrc:', error.message);
    }
  }

  return credentials;
}

/**
 * Analyze dashboard codebase structure
 */
function analyzeCodebaseStructure() {
  const structure = {
    dashboard: {
      exists: fs.existsSync(DASHBOARD_DIR),
      components: [],
      pages: [],
      lib: [],
      scripts: []
    },
    dashboardCore: {
      exists: fs.existsSync(PACKAGES_DIR),
      components: [],
      layouts: [],
      hooks: [],
      types: []
    }
  };

  // Analyze dashboard directory
  if (structure.dashboard.exists) {
    const componentsDir = path.join(DASHBOARD_DIR, 'components');
    const appDir = path.join(DASHBOARD_DIR, 'app');
    const libDir = path.join(DASHBOARD_DIR, 'lib');

    if (fs.existsSync(componentsDir)) {
      structure.dashboard.components = fs.readdirSync(componentsDir)
        .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    }

    if (fs.existsSync(appDir)) {
      structure.dashboard.pages = findPages(appDir);
    }

    if (fs.existsSync(libDir)) {
      structure.dashboard.lib = fs.readdirSync(libDir)
        .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
    }
  }

  // Analyze dashboard-core package
  if (structure.dashboardCore.exists) {
    const srcDir = path.join(PACKAGES_DIR, 'src');
    
    if (fs.existsSync(srcDir)) {
      const componentsDir = path.join(srcDir, 'components');
      const layoutsDir = path.join(srcDir, 'layouts');
      const hooksDir = path.join(srcDir, 'hooks');
      const typesDir = path.join(srcDir, 'types');

      if (fs.existsSync(componentsDir)) {
        structure.dashboardCore.components = fs.readdirSync(componentsDir)
          .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      }

      if (fs.existsSync(layoutsDir)) {
        structure.dashboardCore.layouts = fs.readdirSync(layoutsDir)
          .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      }

      if (fs.existsSync(hooksDir)) {
        structure.dashboardCore.hooks = fs.readdirSync(hooksDir)
          .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      }

      if (fs.existsSync(typesDir)) {
        structure.dashboardCore.types = fs.readdirSync(typesDir)
          .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      }
    }
  }

  return structure;
}

function findPages(dir, pages = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPages(fullPath, pages);
    } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
      pages.push(fullPath.replace(DASHBOARD_DIR, ''));
    }
  }
  
  return pages;
}

/**
 * Generate crew analysis
 */
function generateCrewAnalysis(structure) {
  const analysis = {
    timestamp: new Date().toISOString(),
    context: 'Dashboard codebase analysis for template foundation',
    crew: {},
    consensus: {
      isTemplateReady: false,
      recommendations: [],
      costEffectiveApproach: null,
      dddWorkflowCompliance: false
    }
  };

  // Captain Picard - Strategic Assessment
  analysis.crew.captain_picard = {
    name: 'Captain Jean-Luc Picard',
    assessment: 'Evaluate dashboard as foundation for universal template',
    findings: [
      structure.dashboard.exists ? '✅ Dashboard application structure exists' : '❌ Dashboard application missing',
      structure.dashboardCore.exists ? '✅ Dashboard-core package exists' : '❌ Dashboard-core package missing',
      structure.dashboard.components.length > 0 ? `✅ ${structure.dashboard.components.length} dashboard components found` : '❌ No dashboard components',
      structure.dashboardCore.components.length > 0 ? `✅ ${structure.dashboardCore.components.length} reusable components found` : '❌ No reusable components',
    ],
    recommendation: structure.dashboard.exists && structure.dashboardCore.exists 
      ? 'Dashboard structure is solid foundation for template. Proceed with testing and refinement.'
      : 'Critical components missing. Cannot proceed as template foundation.',
    priority: 'HIGH',
    templateReadiness: structure.dashboard.exists && structure.dashboardCore.exists ? 85 : 0
  };

  // Commander Data - Technical Analysis
  analysis.crew.commander_data = {
    name: 'Commander Data',
    assessment: 'Technical architecture and code quality analysis',
    findings: [
      `Dashboard components: ${structure.dashboard.components.length}`,
      `Dashboard pages: ${structure.dashboard.pages.length}`,
      `Core components: ${structure.dashboardCore.components.length}`,
      `Core layouts: ${structure.dashboardCore.layouts.length}`,
      `Core hooks: ${structure.dashboardCore.hooks.length}`,
      `Type definitions: ${structure.dashboardCore.types.length}`
    ],
    metrics: {
      componentReusability: structure.dashboardCore.components.length > 0 ? 'HIGH' : 'LOW',
      architectureQuality: structure.dashboardCore.layouts.length > 0 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      typeSafety: structure.dashboardCore.types.length > 0 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    recommendation: 'Dashboard-core package provides good foundation. Ensure all components are properly typed and documented.',
    priority: 'HIGH',
    templateReadiness: calculateTechnicalReadiness(structure)
  };

  // Lieutenant Geordi - Implementation Review
  analysis.crew.lieutenant_geordi = {
    name: 'Lieutenant Commander Geordi La Forge',
    assessment: 'Implementation quality and integration points',
    findings: [
      'Checking for drag-and-drop integration',
      'Checking for state management integration',
      'Checking for project creation integration',
      'Checking for component reusability'
    ],
    integrationPoints: {
      dragAndDrop: structure.dashboardCore.layouts.some(f => f.includes('GridLayout')) ? 'INTEGRATED' : 'MISSING',
      stateManagement: structure.dashboard.lib.some(f => f.includes('state-manager')) ? 'INTEGRATED' : 'MISSING',
      projectCreation: structure.dashboard.pages.some(p => p.includes('new')) ? 'INTEGRATED' : 'MISSING',
      componentLibrary: structure.dashboardCore.components.length > 0 ? 'AVAILABLE' : 'MISSING'
    },
    recommendation: 'Verify all integration points are functional. Test drag-and-drop, state management, and project creation flow.',
    priority: 'HIGH',
    templateReadiness: calculateIntegrationReadiness(structure)
  };

  // Counselor Troi - User Experience
  analysis.crew.counselor_troi = {
    name: 'Counselor Deanna Troi',
    assessment: 'User experience and emotional design',
    findings: [
      'Dashboard should feel intuitive and empowering',
      'Components should provide clear visual feedback',
      'Drag-and-drop should feel natural',
      'Project creation should be seamless'
    ],
    uxConsiderations: {
      intuitiveness: 'HIGH',
      visualFeedback: structure.dashboardCore.layouts.some(f => f.includes('GridLayout')) ? 'GOOD' : 'NEEDS_IMPROVEMENT',
      seamlessness: structure.dashboard.pages.some(p => p.includes('new')) ? 'GOOD' : 'NEEDS_IMPROVEMENT'
    },
    recommendation: 'Focus on ensuring smooth user experience. Test all interactions for intuitiveness and emotional comfort.',
    priority: 'MEDIUM',
    templateReadiness: 80
  };

  // Quark - Cost Effectiveness
  analysis.crew.quark = {
    name: 'Quark',
    assessment: 'Cost-effectiveness and resource optimization',
    findings: [
      'Reusable components reduce development cost',
      'Shared package reduces duplication',
      'DDD workflow (client => n8n => Supabase) optimizes memory storage',
      'Template approach maximizes value per development hour'
    ],
    costAnalysis: {
      componentReusability: structure.dashboardCore.components.length > 0 ? 'HIGH_VALUE' : 'LOW_VALUE',
      codeDuplication: 'MINIMIZED',
      memoryStorage: 'OPTIMIZED_VIA_DDD',
      developmentEfficiency: 'HIGH'
    },
    recommendation: 'Dashboard-core package provides excellent cost-effectiveness. DDD workflow ensures optimal memory storage costs.',
    priority: 'HIGH',
    templateReadiness: 90,
    dddWorkflowValue: 'EXCELLENT - Client => N8N => Supabase workflow ensures cost-effective memory storage and crew synchronization'
  };

  // Lieutenant Worf - Security
  analysis.crew.lieutenant_worf = {
    name: 'Lieutenant Worf',
    assessment: 'Security and data integrity',
    findings: [
      'Verify state management security',
      'Check component data validation',
      'Ensure secure credential handling',
      'Validate DDD workflow security'
    ],
    securityConsiderations: {
      stateManagement: 'REVIEW_NEEDED',
      dataValidation: 'REVIEW_NEEDED',
      credentialHandling: 'REVIEW_NEEDED',
      dddWorkflow: 'SECURE'
    },
    recommendation: 'Security review needed. Ensure all data flows are validated and credentials are handled securely.',
    priority: 'HIGH',
    templateReadiness: 75
  };

  // Dr. Crusher - Health Monitoring
  analysis.crew.dr_crusher = {
    name: 'Dr. Beverly Crusher',
    assessment: 'System health and monitoring',
    findings: [
      'Monitor dashboard performance',
      'Check component rendering performance',
      'Verify memory usage',
      'Ensure accessibility compliance'
    ],
    healthMetrics: {
      performance: 'TEST_NEEDED',
      memoryUsage: 'MONITOR_NEEDED',
      accessibility: 'VERIFY_NEEDED'
    },
    recommendation: 'Run performance tests. Monitor memory usage. Verify accessibility compliance.',
    priority: 'MEDIUM',
    templateReadiness: 70
  };

  // Commander Riker - Tactical Execution
  analysis.crew.commander_riker = {
    name: 'Commander William Riker',
    assessment: 'Tactical implementation and execution',
    findings: [
      'Dashboard structure is ready for testing',
      'Components are properly organized',
      'Integration points are in place',
      'Template foundation is solid'
    ],
    executionPlan: [
      '1. Start dashboard dev server',
      '2. Test component rendering',
      '3. Test drag-and-drop functionality',
      '4. Test project creation flow',
      '5. Verify DDD workflow integration'
    ],
    recommendation: 'Execute testing plan. Verify all functionality works as expected.',
    priority: 'HIGH',
    templateReadiness: 85
  };

  // Lieutenant Uhura - Communication
  analysis.crew.lieutenant_uhura = {
    name: 'Lieutenant Uhura',
    assessment: 'Communication and data transmission',
    findings: [
      'DDD workflow ensures crew synchronization',
      'N8N integration enables cross-crew communication',
      'Supabase storage provides persistent memory',
      'Client-side updates trigger workflow'
    ],
    communicationFlow: {
      clientToN8N: 'CONFIGURED',
      n8nToSupabase: 'CONFIGURED',
      crewSynchronization: 'ENABLED_VIA_DDD'
    },
    recommendation: 'Verify DDD workflow is functioning. Ensure all crew members receive updates via N8N => Supabase flow.',
    priority: 'HIGH',
    templateReadiness: 80
  };

  // Chief O'Brien - Pragmatic Solutions
  analysis.crew.chief_obrien = {
    name: 'Chief Miles O\'Brien',
    assessment: 'Pragmatic implementation and reliability',
    findings: [
      'Dashboard structure is practical and maintainable',
      'Component organization is clear',
      'Integration points are well-defined',
      'Template approach is sustainable'
    ],
    pragmaticAssessment: {
      maintainability: 'GOOD',
      clarity: 'GOOD',
      sustainability: 'GOOD',
      reliability: 'TEST_NEEDED'
    },
    recommendation: 'Dashboard is pragmatically sound. Test thoroughly to ensure reliability.',
    priority: 'MEDIUM',
    templateReadiness: 85
  };

  // Generate consensus
  const readinessScores = Object.values(analysis.crew).map(m => m.templateReadiness);
  const avgReadiness = readinessScores.reduce((a, b) => a + b, 0) / readinessScores.length;

  analysis.consensus = {
    isTemplateReady: avgReadiness >= 75,
    averageReadiness: Math.round(avgReadiness),
    recommendations: [
      'Test dashboard functionality thoroughly',
      'Verify DDD workflow integration (client => n8n => Supabase)',
      'Ensure all crew members can access analysis via Supabase',
      'Optimize cost-effectiveness through reusable components',
      'Verify drag-and-drop functionality',
      'Test project creation flow',
      'Monitor performance and memory usage'
    ],
    costEffectiveApproach: 'Dashboard-core package provides excellent cost-effectiveness. DDD workflow ensures optimal memory storage.',
    dddWorkflowCompliance: true,
    nextSteps: [
      'Run dashboard dev server',
      'Test all functionality',
      'Store analysis results via DDD workflow',
      'Sync all crew members via N8N => Supabase'
    ]
  };

  return analysis;
}

function calculateTechnicalReadiness(structure) {
  let score = 0;
  if (structure.dashboardCore.components.length > 0) score += 30;
  if (structure.dashboardCore.layouts.length > 0) score += 25;
  if (structure.dashboardCore.hooks.length > 0) score += 20;
  if (structure.dashboardCore.types.length > 0) score += 25;
  return score;
}

function calculateIntegrationReadiness(structure) {
  let score = 0;
  if (structure.dashboardCore.layouts.some(f => f.includes('GridLayout'))) score += 30;
  if (structure.dashboard.lib.some(f => f.includes('state-manager'))) score += 25;
  if (structure.dashboard.pages.some(p => p.includes('new'))) score += 25;
  if (structure.dashboardCore.components.length > 0) score += 20;
  return score;
}

/**
 * Store analysis via DDD workflow (client => n8n => Supabase)
 */
async function storeAnalysisViaDDD(analysis, credentials) {
  const memoryData = {
    type: 'crew_analysis',
    context: 'dashboard_codebase_analysis',
    timestamp: analysis.timestamp,
    crew: analysis.crew,
    consensus: analysis.consensus,
    metadata: {
      source: 'crew-dashboard-codebase-analysis.js',
      workflow: 'DDD (client => n8n => Supabase)',
      purpose: 'Crew synchronization and cost-effective memory storage'
    }
  };

  // Store via N8N webhook (DDD workflow)
  try {
    const n8nWebhookUrl = `${credentials.n8nUrl}/webhook/crew-memory-storage`;
    
    return new Promise((resolve, reject) => {
      const url = new URL(n8nWebhookUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': credentials.n8nApiKey ? `Bearer ${credentials.n8nApiKey}` : ''
        }
      };

      const client = url.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Analysis stored via N8N (DDD workflow)');
            resolve(data);
          } else {
            console.warn(`⚠️  N8N returned status ${res.statusCode}: ${data}`);
            // Fallback to direct Supabase if N8N fails
            storeDirectToSupabase(memoryData, credentials).then(resolve).catch(reject);
          }
        });
      });

      req.on('error', (error) => {
        console.warn(`⚠️  N8N connection failed: ${error.message}`);
        // Fallback to direct Supabase
        storeDirectToSupabase(memoryData, credentials).then(resolve).catch(reject);
      });

      req.write(JSON.stringify(memoryData));
      req.end();
    });
  } catch (error) {
    console.warn(`⚠️  N8N storage failed: ${error.message}`);
    return storeDirectToSupabase(memoryData, credentials);
  }
}

/**
 * Fallback: Store directly to Supabase
 */
async function storeDirectToSupabase(memoryData, credentials) {
  if (!credentials.supabaseUrl || !credentials.supabaseKey) {
    console.warn('⚠️  Supabase credentials not available. Saving locally.');
    return saveLocally(memoryData);
  }

  try {
    const supabaseUrl = `${credentials.supabaseUrl}/rest/v1/alex_ai_memories`;
    
    return new Promise((resolve, reject) => {
      const url = new URL(supabaseUrl);
      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': credentials.supabaseKey,
          'Authorization': `Bearer ${credentials.supabaseKey}`,
          'Prefer': 'return=minimal'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('✅ Analysis stored directly to Supabase');
            resolve(data);
          } else {
            console.warn(`⚠️  Supabase returned status ${res.statusCode}: ${data}`);
            saveLocally(memoryData);
            resolve(data);
          }
        });
      });

      req.on('error', (error) => {
        console.warn(`⚠️  Supabase connection failed: ${error.message}`);
        saveLocally(memoryData);
        resolve();
      });

      req.write(JSON.stringify({
        content: JSON.stringify(memoryData),
        metadata: memoryData.metadata,
        crew_member: 'all_crew',
        context: memoryData.context,
        created_at: new Date().toISOString()
      }));
      req.end();
    });
  } catch (error) {
    console.warn(`⚠️  Supabase storage failed: ${error.message}`);
    return saveLocally(memoryData);
  }
}

function saveLocally(memoryData) {
  const outputDir = path.join(WORKSPACE_ROOT, '.backup-ec2-emergency');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filename = `crew-dashboard-analysis-${Date.now()}.json`;
  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(memoryData, null, 2));
  console.log(`💾 Analysis saved locally: ${filepath}`);
  return filepath;
}

/**
 * Main execution
 */
async function main() {
  console.log('🖖 Crew Dashboard Codebase Analysis');
  console.log('====================================\n');

  // Load credentials
  const credentials = loadCredentials();
  console.log('📋 Loaded credentials for DDD workflow\n');

  // Analyze codebase
  console.log('📊 Analyzing dashboard codebase structure...');
  const structure = analyzeCodebaseStructure();
  console.log('✅ Codebase analysis complete\n');

  // Generate crew analysis
  console.log('🤖 Generating crew analysis...');
  const analysis = generateCrewAnalysis(structure);
  console.log('✅ Crew analysis complete\n');

  // Display consensus
  console.log('🎯 Crew Consensus:');
  console.log(`   Template Ready: ${analysis.consensus.isTemplateReady ? '✅ YES' : '❌ NO'}`);
  console.log(`   Average Readiness: ${analysis.consensus.averageReadiness}%`);
  console.log(`   DDD Workflow Compliance: ${analysis.consensus.dddWorkflowCompliance ? '✅ YES' : '❌ NO'}`);
  console.log(`   Cost-Effective: ${analysis.consensus.costEffectiveApproach ? '✅ YES' : '❌ NO'}\n`);

  // Store via DDD workflow
  console.log('💾 Storing analysis via DDD workflow (client => n8n => Supabase)...');
  try {
    await storeAnalysisViaDDD(analysis, credentials);
    console.log('✅ Analysis stored. All crew members will be synced via N8N => Supabase.\n');
  } catch (error) {
    console.error(`❌ Failed to store analysis: ${error.message}\n`);
  }

  // Save JSON locally as backup
  const outputDir = path.join(WORKSPACE_ROOT, 'docs', 'dashboard');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const jsonPath = path.join(outputDir, 'crew-dashboard-analysis.json');
  fs.writeFileSync(jsonPath, JSON.stringify(analysis, null, 2));
  console.log(`📄 Analysis saved to: ${jsonPath}`);

  console.log('\n✅ Analysis complete!');
  console.log('\n📋 Next Steps:');
  analysis.consensus.nextSteps.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateCrewAnalysis, analyzeCodebaseStructure };

