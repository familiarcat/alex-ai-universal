/**
 * Infrastructure Cost Monitoring System
 * 
 * Monitors infrastructure costs and provides alerts
 */

const { analyzeTerraformCosts } = require('./scripts/cost-analysis');
const fs = require('fs');
const path = require('path');

class InfrastructureCostMonitor {
  constructor(tfDir) {
    this.tfDir = tfDir;
    this.baseline = null;
  }
  
  async establishBaseline() {
    const analysis = analyzeTerraformCosts(this.tfDir);
    this.baseline = analysis.costs?.total || 0;
    return this.baseline;
  }
  
  async checkCurrentCosts() {
    return analyzeTerraformCosts(this.tfDir);
  }
  
  async compareWithBaseline() {
    const current = await this.checkCurrentCosts();
    const currentCost = current.costs?.total || 0;
    const baseline = this.baseline || await this.establishBaseline();
    
    const change = currentCost - baseline;
    const percentChange = baseline > 0 ? (change / baseline) * 100 : 0;
    
    return {
      baseline,
      current: currentCost,
      change,
      percentChange,
      alert: Math.abs(percentChange) > 20 ? 'significant_change' : 'normal'
    };
  }
}

module.exports = { InfrastructureCostMonitor };
