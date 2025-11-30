/**
 * Cost Awareness Wrapper for Infrastructure Scripts
 * 
 * Automatically adds cost analysis to infrastructure scripts
 */

const { calculateEC2Costs, calculateEBSCosts } = require('../../packages/shared-utilities/src/cost-analysis');

function withCostAwareness(scriptFunction) {
  return async function(...args) {
    console.log('💰 Cost awareness enabled');
    const result = await scriptFunction(...args);
    
    // Analyze costs if infrastructure changes detected
    if (result && result.infrastructure) {
      const costs = analyzeInfrastructureCosts(result.infrastructure);
      result.costAnalysis = costs;
    }
    
    return result;
  };
}

function analyzeInfrastructureCosts(config) {
  const costs = {};
  if (config.instanceType) {
    costs.ec2 = calculateEC2Costs(config.instanceType);
  }
  if (config.volumeSize) {
    costs.ebs = calculateEBSCosts(config.volumeSize);
  }
  return costs;
}

module.exports = { withCostAwareness, analyzeInfrastructureCosts };
