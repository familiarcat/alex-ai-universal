/**
 * Business Decision Cost Analysis
 * 
 * Provides cost analysis for all business decisions
 */

const { calculateEC2Costs, calculateEBSCosts } = require('../cost-analysis');

class BusinessCostAnalysis {
  calculateROI(initialCost, monthlyCost, benefit) {
    const annualCost = initialCost + (monthlyCost * 12);
    const roi = ((benefit - annualCost) / annualCost) * 100;
    return { annualCost, benefit, roi, recommendation: roi > 0 ? 'proceed' : 'review' };
  }
  
  analyzeInfrastructureDecision(config) {
    const costs = {
      ec2: config.instanceType ? calculateEC2Costs(config.instanceType) : null,
      ebs: config.volumeSize ? calculateEBSCosts(config.volumeSize) : null
    };
    
    const monthlyCost = (costs.ec2?.total || costs.ec2?.monthly || 0) + (costs.ebs?.monthly || 0);
    const annualCost = monthlyCost * 12;
    
    return {
      costs,
      monthlyCost,
      annualCost,
      recommendation: monthlyCost > 100 ? 'review_required' : 'approved'
    };
  }
}

module.exports = { BusinessCostAnalysis };
