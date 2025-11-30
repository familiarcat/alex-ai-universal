#!/usr/bin/env node
/**
 * Crew Approval for UI Design Vector Experiment
 * 
 * Coordinates crew review and approval of experiment results
 * Then opens results in browser
 */

const { TaskBasedCoordinator } = require('../../packages/shared-utilities/src/openrouter/task-based-coordinator');
const { getCredential } = require('../utils/secure-credential-loader');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class CrewExperimentApproval {
  constructor() {
    this.coordinator = null;
    this.resultsPath = path.join(__dirname, '../../reports/ui-design-experiment-results.json');
  }

  async initialize() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🖖 Crew Approval: UI Design Vector Experiment');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const openRouterApiKey = getCredential('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OPENROUTER_API_KEY not found');
    }

    this.coordinator = new TaskBasedCoordinator(openRouterApiKey);
    
    await this.coordinator.initializeTask(
      'ui-experiment-approval',
      'Review and approve UI design vector experiment results',
      ['picard', 'data', 'troi', 'geordi'],
      {
        priority: 'high',
        focus: 'experiment results validation and approval'
      }
    );
  }

  async loadResults() {
    if (!fs.existsSync(this.resultsPath)) {
      console.log('⚠️  Experiment results not found. Running experiment first...\n');
      return null;
    }

    const results = JSON.parse(fs.readFileSync(this.resultsPath, 'utf8'));
    console.log('✅ Experiment results loaded\n');
    return results;
  }

  async picardStrategicReview(results) {
    console.log('🎖️  Captain Picard: Strategic Review\n');

    const prompt = `You are Captain Jean-Luc Picard. Review the UI design vector experiment results from a strategic perspective.

Experiment Results:
${JSON.stringify(results, null, 2)}

Evaluate:
1. Strategic value of the experiment
2. Alignment with mission objectives
3. Quality of results
4. Recommendations for next steps

Provide strategic approval or recommendations.`;

    const result = await this.coordinator.executeCrewRequest(
      'ui-experiment-approval',
      'picard',
      prompt
    );

    console.log(result.response);
    console.log(`\n💰 Cost: $${result.cost.toFixed(4)}\n`);
    return result.response;
  }

  async dataTechnicalReview(results) {
    console.log('🤖 Commander Data: Technical Review\n');

    const prompt = `You are Commander Data. Review the UI design vector experiment from a technical perspective.

Experiment Results:
${JSON.stringify(results, null, 2)}

Evaluate:
1. Technical accuracy of vector embeddings
2. Quality of aesthetic analysis
3. Similarity calculation correctness
4. Data integrity and storage

Provide technical approval or identify issues.`;

    const result = await this.coordinator.executeCrewRequest(
      'ui-experiment-approval',
      'data',
      prompt
    );

    console.log(result.response);
    console.log(`\n💰 Cost: $${result.cost.toFixed(4)}\n`);
    return result.response;
  }

  async troiUXReview(results) {
    console.log('💭 Counselor Troi: UX Review\n');

    const prompt = `You are Counselor Deanna Troi. Review the UI design vector experiment from a user experience perspective.

Experiment Results:
${JSON.stringify(results, null, 2)}

Evaluate:
1. User experience value of scraped designs
2. Aesthetic factor relevance
3. Design comparison usefulness
4. Emotional resonance of results

Provide UX approval or recommendations.`;

    const result = await this.coordinator.executeCrewRequest(
      'ui-experiment-approval',
      'troi',
      prompt
    );

    console.log(result.response);
    console.log(`\n💰 Cost: $${result.cost.toFixed(4)}\n`);
    return result.response;
  }

  async geordiImplementationReview(results) {
    console.log('🔧 Lieutenant Commander La Forge: Implementation Review\n');

    const prompt = `You are Lieutenant Commander Geordi La Forge. Review the UI design vector experiment from an implementation perspective.

Experiment Results:
${JSON.stringify(results, null, 2)}

Evaluate:
1. System performance and efficiency
2. Integration with existing systems
3. Scalability of the approach
4. Technical implementation quality

Provide implementation approval or technical recommendations.`;

    const result = await this.coordinator.executeCrewRequest(
      'ui-experiment-approval',
      'geordi',
      prompt
    );

    console.log(result.response);
    console.log(`\n💰 Cost: $${result.cost.toFixed(4)}\n`);
    return result.response;
  }

  async synthesizeApproval(crewReviews) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 SYNTHESIS: Crew Approval Decision');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const prompt = `Synthesize these crew reviews into a final approval decision:

CAPTAIN PICARD (Strategic):
${crewReviews.picard}

COMMANDER DATA (Technical):
${crewReviews.data}

COUNSELOR TROI (UX):
${crewReviews.troi}

LIEUTENANT COMMANDER LA FORGE (Implementation):
${crewReviews.geordi}

Provide:
1. Overall approval status (APPROVED / CONDITIONAL / NEEDS REVISION)
2. Key findings
3. Recommendations
4. Next steps`;

    const result = await this.coordinator.executeCrewRequest(
      'ui-experiment-approval',
      'picard',
      prompt
    );

    console.log(result.response);
    console.log(`\n💰 Cost: $${result.cost.toFixed(4)}\n`);

    return result.response;
  }

  async openResultsInBrowser() {
    console.log('🌐 Opening results in browser...\n');

    const dashboardUrl = 'http://localhost:3000/dashboard/vector-priority';
    
    // Try different methods to open browser
    const commands = [
      `open ${dashboardUrl}`, // macOS
      `xdg-open ${dashboardUrl}`, // Linux
      `start ${dashboardUrl}` // Windows
    ];

    for (const cmd of commands) {
      try {
        exec(cmd, (error) => {
          if (!error) {
            console.log(`✅ Browser opened: ${dashboardUrl}\n`);
          }
        });
        break;
      } catch (error) {
        // Try next command
      }
    }

    console.log(`📊 View results at: ${dashboardUrl}\n`);
  }

  async runApproval() {
    try {
      await this.initialize();

      // Load results
      const results = await this.loadResults();
      if (!results) {
        console.log('⚠️  No results to review. Please run the experiment first.\n');
        return;
      }

      // Crew reviews
      const crewReviews = {
        picard: await this.picardStrategicReview(results),
        data: await this.dataTechnicalReview(results),
        troi: await this.troiUXReview(results),
        geordi: await this.geordiImplementationReview(results)
      };

      // Synthesize approval
      const approval = await this.synthesizeApproval(crewReviews);

      // Check if approved
      const isApproved = approval.toLowerCase().includes('approved') || 
                        approval.toLowerCase().includes('approval');

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ CREW APPROVAL COMPLETE');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      if (isApproved) {
        console.log('✅ Experiment APPROVED by crew\n');
        await this.openResultsInBrowser();
      } else {
        console.log('⚠️  Experiment requires revision before approval\n');
      }

      // Complete task
      const finalReport = this.coordinator.completeTask('ui-experiment-approval');

      console.log('📊 Task Summary:');
      console.log(`   Model Used: ${finalReport.model?.name || 'Unknown'}`);
      console.log(`   Total Cost: $${(finalReport.tokenPool?.totalCost || 0).toFixed(4)}`);

    } catch (error) {
      console.error('\n❌ Approval process failed:', error.message);
      throw error;
    }
  }
}

if (require.main === module) {
  const approval = new CrewExperimentApproval();
  approval.runApproval().catch(error => {
    console.error('❌ Failed:', error);
    process.exit(1);
  });
}

module.exports = { CrewExperimentApproval };

