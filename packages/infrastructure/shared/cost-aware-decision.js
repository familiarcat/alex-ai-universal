/**
 * Cost-Aware Infrastructure Decision Module
 * 
 * Provides cost analysis for all infrastructure decisions
 */

const { calculateEC2Costs, calculateEBSCosts, calculateCloudWatchCosts } = require('../shared-utilities/src/cost-analysis');

class CostAwareInfrastructureDecision {
  constructor() {
    this.costThresholds = {
      ec2: 50, // $50/month
      ebs: 10, // $10/month
      cloudwatch: 5 // $5/month
    };
  }
  
  analyzeInfrastructureDecision(config) {
    const costs = {
      ec2: config.instanceType ? calculateEC2Costs(config.instanceType, config.detailedMonitoring) : null,
      ebs: config.volumeSize ? calculateEBSCosts(config.volumeSize, config.volumeType) : null,
      cloudwatch: config.logRetention ? calculateCloudWatchCosts(config.logRetention, config.estimatedLogGB) : null
    };
    
    const totalCost = Object.values(costs).reduce((sum, cost) => sum + (cost?.total || cost?.monthly || 0), 0);
    const recommendations = [];
    
    if (totalCost > 100) {
      recommendations.push('⚠️ High cost detected. Consider optimization.');
    }
    
    if (costs.ec2 && costs.ec2.total > this.costThresholds.ec2) {
      recommendations.push('Consider downgrading EC2 instance type');
    }
    
    return {
      costs,
      totalCost,
      recommendations,
      decision: totalCost > 100 ? 'review_required' : 'approved'
    };
  }
}

module.exports = { CostAwareInfrastructureDecision };
