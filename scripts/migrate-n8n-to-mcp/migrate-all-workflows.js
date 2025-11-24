#!/usr/bin/env node
/**
 * N8N to MCP Migration Coordinator
 * 
 * Analyzes all n8n workflows and coordinates migration to MCP.
 * Uses crew coordination for analysis and migration planning.
 * 
 * Usage:
 *   node scripts/migrate-n8n-to-mcp/migrate-all-workflows.js
 */

const fs = require('fs');
const path = require('path');
const { N8NWorkflowAnalyzer } = require('./analyze-n8n-workflow');
const { getMCPOpenRouterOptimizer } = require('../utils/mcp-openrouter-optimizer');
const { OFFICIAL_CREW_MEMBERS, INVALID_CREW_MEMBERS } = require('./validate-crew-members');

class N8NToMCPMigrator {
  constructor() {
    this.workflowsDir = path.join(__dirname, '../../n8n-workflows');
    this.workflows = [];
    this.analysis = [];
    this.migrationPlan = [];
  }

  /**
   * Find all n8n workflow files
   */
  findWorkflows() {
    const workflows = [];
    
    const findInDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          findInDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const parsed = JSON.parse(content);
            
            // Check if it's an n8n workflow (has nodes array)
            if (parsed.nodes && Array.isArray(parsed.nodes)) {
              workflows.push({
                path: fullPath,
                name: parsed.name || entry.name,
                relativePath: path.relative(this.workflowsDir, fullPath)
              });
            }
          } catch (error) {
            // Skip invalid JSON files
          }
        }
      }
    };

    if (fs.existsSync(this.workflowsDir)) {
      findInDir(this.workflowsDir);
    }

    this.workflows = workflows;
    return workflows;
  }

  /**
   * Analyze all workflows
   */
  async analyzeAllWorkflows() {
    console.log(`\n🔍 Analyzing ${this.workflows.length} n8n workflows...\n`);

    for (const workflow of this.workflows) {
      try {
        const analyzer = new N8NWorkflowAnalyzer(workflow.path);
        analyzer.load();
        analyzer.analyze();
        const report = analyzer.generateReport();
        
        this.analysis.push(report);
        
        console.log(`✅ Analyzed: ${workflow.name}`);
      } catch (error) {
        console.error(`❌ Failed to analyze ${workflow.name}: ${error.message}`);
        this.analysis.push({
          workflow: { name: workflow.name, path: workflow.path },
          error: error.message
        });
      }
    }

    return this.analysis;
  }

  /**
   * Generate migration plan with crew coordination
   */
  async generateMigrationPlan() {
    console.log('\n🎯 Generating migration plan with crew coordination...\n');

    const optimizer = getMCPOpenRouterOptimizer();
    optimizer.initialize();

    // Captain Picard: Strategic overview
    console.log('🎖️  Captain Picard: Strategic Migration Assessment\n');
    const officialCrewList = OFFICIAL_CREW_MEMBERS.join(', ');
    const picardPrompt = `You are Captain Picard. Review this n8n workflow analysis and provide strategic migration guidance.

IMPORTANT: Only reference official crew members: ${officialCrewList}
DO NOT mention Wesley Crusher or any non-official crew members.

${JSON.stringify(this.analysis.slice(0, 5), null, 2)}

Provide:
1. Strategic priorities for migration
2. Risk assessment
3. Recommended migration order
4. Key dependencies to consider

Be strategic and comprehensive.`;

    const picardAnalysis = await optimizer.optimizeAndCall(picardPrompt, {
      crewMember: 'picard',
      complexity: 'high',
      taskType: 'strategic_planning',
      temperature: 0.7
    });

    // Commander Data: Technical analysis
    console.log('🤖 Commander Data: Technical Migration Analysis\n');
    const dataPrompt = `You are Commander Data. Analyze the technical migration requirements:

Workflows analyzed: ${this.analysis.length}
Complexity distribution: ${this.getComplexityDistribution()}

Provide:
1. Technical migration approach for each workflow type
2. MCP tool mapping recommendations
3. Implementation complexity assessment
4. Testing requirements

Be precise and logical.`;

    const dataAnalysis = await optimizer.optimizeAndCall(dataPrompt, {
      crewMember: 'data',
      complexity: 'high',
      taskType: 'complex_analysis',
      temperature: 0.7
    });

    // Quark: Cost and resource analysis
    console.log('💰 Quark: Cost & Resource Analysis\n');
    const quarkPrompt = `You are Quark. Analyze the cost and resource implications:

Total workflows: ${this.analysis.length}
Estimated effort: ${this.getTotalEffort()}

Provide:
1. Cost analysis of migration
2. Resource requirements
3. ROI for migration
4. Priority based on cost-benefit

Be profit-focused and practical.`;

    const quarkAnalysis = await optimizer.optimizeAndCall(quarkPrompt, {
      crewMember: 'quark',
      complexity: 'medium',
      taskType: 'business_analysis',
      temperature: 0.7
    });

    // Commander Riker: Tactical implementation plan
    console.log('⚡ Commander Riker: Tactical Implementation Plan\n');
    const rikerPrompt = `You are Commander Riker. Create a tactical implementation plan:

Workflows to migrate: ${this.analysis.length}
Migration status: ${this.getMigrationStatus()}

Provide:
1. Phased implementation plan
2. Task sequencing
3. Risk mitigation
4. Timeline estimates

Be tactical and organized.`;

    const rikerPlan = await optimizer.optimizeAndCall(rikerPrompt, {
      crewMember: 'riker',
      complexity: 'high',
      taskType: 'operations',
      temperature: 0.7
    });

    // Create migration plan
    this.migrationPlan = {
      summary: {
        totalWorkflows: this.workflows.length,
        analyzed: this.analysis.length,
        complexity: this.getComplexityDistribution(),
        estimatedEffort: this.getTotalEffort()
      },
      crewAnalysis: {
        picard: picardAnalysis.choices?.[0]?.message?.content || picardAnalysis.body,
        data: dataAnalysis.choices?.[0]?.message?.content || dataAnalysis.body,
        quark: quarkAnalysis.choices?.[0]?.message?.content || quarkAnalysis.body,
        riker: rikerPlan.choices?.[0]?.message?.content || rikerPlan.body
      },
      workflows: this.analysis.map(a => ({
        name: a.workflow?.name,
        path: a.workflow?.path,
        complexity: a.analysis?.complexity,
        mcpMapping: a.migration?.mcpMapping,
        estimatedEffort: a.migration?.estimatedEffort,
        priority: a.migration?.estimatedEffort?.priority
      })),
      costs: {
        picard: picardAnalysis.cost || 0,
        data: dataAnalysis.cost || 0,
        quark: quarkAnalysis.cost || 0,
        riker: rikerPlan.cost || 0,
        total: (picardAnalysis.cost || 0) + (dataAnalysis.cost || 0) + 
               (quarkAnalysis.cost || 0) + (rikerPlan.cost || 0)
      }
    };

    return this.migrationPlan;
  }

  /**
   * Get complexity distribution
   */
  getComplexityDistribution() {
    const dist = { low: 0, medium: 0, high: 0 };
    for (const analysis of this.analysis) {
      if (analysis.analysis?.complexity) {
        dist[analysis.analysis.complexity]++;
      }
    }
    return `Low: ${dist.low}, Medium: ${dist.medium}, High: ${dist.high}`;
  }

  /**
   * Get total estimated effort
   */
  getTotalEffort() {
    let totalHours = 0;
    for (const analysis of this.analysis) {
      if (analysis.migration?.estimatedEffort?.estimatedHours) {
        totalHours += analysis.migration.estimatedEffort.estimatedHours;
      }
    }
    return `${totalHours.toFixed(1)} hours`;
  }

  /**
   * Get migration status
   */
  getMigrationStatus() {
    const mappable = this.analysis.filter(a => 
      a.migration?.status === 'mappable'
    ).length;
    const needsAnalysis = this.analysis.length - mappable;
    return `${mappable} mappable, ${needsAnalysis} need analysis`;
  }

  /**
   * Save migration plan
   */
  saveMigrationPlan() {
    const reportPath = path.join(__dirname, '../../reports/n8n-to-mcp-migration-plan.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(this.migrationPlan, null, 2));
    console.log(`\n📄 Migration plan saved to: ${reportPath}\n`);
    return reportPath;
  }
}

// CLI usage
if (require.main === module) {
  const migrator = new N8NToMCPMigrator();
  
  (async () => {
    try {
      // Find workflows
      const workflows = migrator.findWorkflows();
      console.log(`Found ${workflows.length} n8n workflows\n`);

      // Analyze workflows
      await migrator.analyzeAllWorkflows();

      // Generate migration plan
      await migrator.generateMigrationPlan();

      // Save plan
      migrator.saveMigrationPlan();

      console.log('✅ Migration analysis complete!');
    } catch (error) {
      console.error('❌ Migration analysis failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  })();
}

module.exports = { N8NToMCPMigrator };

