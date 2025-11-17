/**
 * Health Impact Monitor for Cost Optimizations
 * 
 * Monitors system health impact of cost optimizations
 */

const { HealthMonitor } = require('../../health');

class CostOptimizationHealthMonitor {
  constructor() {
    this.healthMonitor = new HealthMonitor();
    this.baselineHealth = null;
  }
  
  async establishBaseline() {
    this.baselineHealth = await this.healthMonitor.checkHealth();
    return this.baselineHealth;
  }
  
  async monitorOptimizationImpact() {
    const currentHealth = await this.healthMonitor.checkHealth();
    const baseline = this.baselineHealth || await this.establishBaseline();
    
    const impact = {
      baseline: baseline.systemHealth,
      current: currentHealth.systemHealth,
      degraded: currentHealth.systemHealth !== 'healthy' && baseline.systemHealth === 'healthy',
      recommendations: currentHealth.systemHealth !== 'healthy' ? ['Review cost optimization impact'] : []
    };
    
    return impact;
  }
}

module.exports = { CostOptimizationHealthMonitor };
