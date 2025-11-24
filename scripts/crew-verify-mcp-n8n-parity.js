#!/usr/bin/env node
/**
 * Crew Verification: MCP vs N8N Feature Parity
 * 
 * Have the crew analyze the feature parity between MCP and n8n workflows
 * and provide recommendations for implementation.
 * 
 * Usage:
 *   node scripts/crew-verify-mcp-n8n-parity.js
 */

const { getMCPOpenRouterOptimizer } = require('./utils/mcp-openrouter-optimizer');
const fs = require('fs');
const path = require('path');

// Load feature parity document
const parityDoc = fs.readFileSync(
  path.join(__dirname, '../docs/MCP_N8N_FEATURE_PARITY.md'),
  'utf8'
);

async function crewVerification() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 CREW VERIFICATION: MCP vs N8N FEATURE PARITY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const optimizer = getMCPOpenRouterOptimizer();
  optimizer.initialize();

  // Captain Picard: Strategic overview
  console.log('🎖️  Captain Picard: Strategic Assessment\n');
  const picardPrompt = `You are Captain Jean-Luc Picard. Review this feature parity analysis between our MCP server and previous n8n workflows:

${parityDoc}

Provide:
1. Strategic assessment of the migration from n8n to MCP
2. Priority ranking for implementing missing features
3. Risk assessment of gaps
4. Recommendations for ensuring complete feature parity

Be strategic, comprehensive, and focused on mission success.`;

  const picardAnalysis = await optimizer.optimizeAndCall(picardPrompt, {
    crewMember: 'picard',
    complexity: 'high',
    taskType: 'strategic_planning',
    temperature: 0.7
  });

  console.log(picardAnalysis.choices?.[0]?.message?.content || picardAnalysis.body);
  console.log(`\n💰 Cost: $${(picardAnalysis.cost || 0).toFixed(4)}\n`);

  // Commander Data: Technical analysis
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🤖 Commander Data: Technical Analysis\n');
  const dataPrompt = `You are Commander Data. Analyze the technical implementation gaps between MCP and n8n:

${parityDoc}

Provide:
1. Technical analysis of each missing feature
2. Implementation complexity assessment
3. Dependencies and prerequisites
4. Recommended implementation approach for each gap
5. Testing requirements

Be precise, logical, and comprehensive.`;

  const dataAnalysis = await optimizer.optimizeAndCall(dataPrompt, {
    crewMember: 'data',
    complexity: 'high',
    taskType: 'complex_analysis',
    temperature: 0.7
  });

  console.log(dataAnalysis.choices?.[0]?.message?.content || dataAnalysis.body);
  console.log(`\n💰 Cost: $${(dataAnalysis.cost || 0).toFixed(4)}\n`);

  // Quark: Cost analysis
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('💰 Quark: Cost & Resource Analysis\n');
  const quarkPrompt = `You are Quark, the Ferengi business operations specialist. Analyze the cost and resource implications:

${parityDoc}

Provide:
1. Cost analysis of implementing missing features
2. Resource requirements (time, effort, tokens)
3. ROI for each missing feature
4. Priority based on cost-benefit analysis
5. Recommendations for efficient implementation

Be profit-focused, practical, and specific about costs.`;

  const quarkAnalysis = await optimizer.optimizeAndCall(quarkPrompt, {
    crewMember: 'quark',
    complexity: 'medium',
    taskType: 'business_analysis',
    temperature: 0.7
  });

  console.log(quarkAnalysis.choices?.[0]?.message?.content || quarkAnalysis.body);
  console.log(`\n💰 Cost: $${(quarkAnalysis.cost || 0).toFixed(4)}\n`);

  // Commander Riker: Tactical implementation plan
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚡ Commander Riker: Tactical Implementation Plan\n');
  const rikerPrompt = `You are Commander William Riker. Create a tactical implementation plan:

${parityDoc}

Provide:
1. Phased implementation plan
2. Task sequencing and dependencies
3. Risk mitigation strategies
4. Timeline estimates
5. Resource allocation recommendations

Be tactical, organized, and operationally focused.`;

  const rikerPlan = await optimizer.optimizeAndCall(rikerPrompt, {
    crewMember: 'riker',
    complexity: 'high',
    taskType: 'operations',
    temperature: 0.7
  });

  console.log(rikerPlan.choices?.[0]?.message?.content || rikerPlan.body);
  console.log(`\n💰 Cost: $${(rikerPlan.cost || 0).toFixed(4)}\n`);

  // Lt. Cmdr. La Forge: Engineering assessment
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔧 Lieutenant Commander La Forge: Engineering Assessment\n');
  const geordiPrompt = `You are Lieutenant Commander Geordi La Forge. Assess the engineering requirements:

${parityDoc}

Provide:
1. Engineering complexity for each missing feature
2. Infrastructure requirements
3. Integration points with existing systems
4. Code structure recommendations
5. Testing and validation approach

Be technical, practical, and focused on implementation.`;

  const geordiAssessment = await optimizer.optimizeAndCall(geordiPrompt, {
    crewMember: 'la_forge',
    complexity: 'high',
    taskType: 'code_generation',
    temperature: 0.7
  });

  console.log(geordiAssessment.choices?.[0]?.message?.content || geordiAssessment.body);
  console.log(`\n💰 Cost: $${(geordiAssessment.cost || 0).toFixed(4)}\n`);

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 CREW VERIFICATION SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const totalCost = (picardAnalysis.cost || 0) + 
                   (dataAnalysis.cost || 0) + 
                   (quarkAnalysis.cost || 0) + 
                   (rikerPlan.cost || 0) + 
                   (geordiAssessment.cost || 0);

  console.log(`✅ Crew verification complete`);
  console.log(`💰 Total cost: $${totalCost.toFixed(4)}`);
  console.log(`\n📋 Next Steps:`);
  console.log(`   1. Review crew recommendations above`);
  console.log(`   2. Prioritize missing features based on crew analysis`);
  console.log(`   3. Implement features in phases`);
  console.log(`   4. Test with OpenRouter test harness`);
  console.log(`   5. Verify feature parity after each phase\n`);

  // Save crew analysis
  const analysisReport = {
    timestamp: new Date().toISOString(),
    crewAnalysis: {
      picard: picardAnalysis.choices?.[0]?.message?.content || picardAnalysis.body,
      data: dataAnalysis.choices?.[0]?.message?.content || dataAnalysis.body,
      quark: quarkAnalysis.choices?.[0]?.message?.content || quarkAnalysis.body,
      riker: rikerPlan.choices?.[0]?.message?.content || rikerPlan.body,
      geordi: geordiAssessment.choices?.[0]?.message?.content || geordiAssessment.body
    },
    costs: {
      picard: picardAnalysis.cost || 0,
      data: dataAnalysis.cost || 0,
      quark: quarkAnalysis.cost || 0,
      riker: rikerPlan.cost || 0,
      geordi: geordiAssessment.cost || 0,
      total: totalCost
    }
  };

  const reportPath = path.join(__dirname, '../reports/crew-mcp-n8n-parity-analysis.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(analysisReport, null, 2));

  console.log(`📄 Full analysis saved to: ${reportPath}\n`);
}

// Run if called directly
if (require.main === module) {
  crewVerification().catch(err => {
    console.error('\n❌ Crew verification failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
}

module.exports = { crewVerification };

