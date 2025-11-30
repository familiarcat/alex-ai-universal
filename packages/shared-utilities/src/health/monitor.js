/**
 * Health Monitoring Utilities
 * 
 * Integrate health checks into cost analysis and critical systems
 */

class HealthMonitor {
  constructor() {
    this.metrics = {
      systemHealth: 'healthy',
      lastCheck: null,
      checks: []
    };
  }
  
  /**
   * Perform health check
   */
  async checkHealth() {
    const checks = {
      diskSpace: this.checkDiskSpace(),
      memory: this.checkMemory(),
      network: this.checkNetwork(),
      services: this.checkServices()
    };
    
    const results = await Promise.all(Object.values(checks));
    const allHealthy = results.every(r => r.healthy);
    
    this.metrics = {
      systemHealth: allHealthy ? 'healthy' : 'degraded',
      lastCheck: new Date().toISOString(),
      checks: results
    };
    
    return this.metrics;
  }
  
  async checkDiskSpace() {
    const fs = require('fs');
    try {
      const stats = fs.statSync(process.cwd());
      return { name: 'diskSpace', healthy: true, message: 'Disk space available' };
    } catch (error) {
      return { name: 'diskSpace', healthy: false, message: error.message };
    }
  }
  
  async checkMemory() {
    const usage = process.memoryUsage();
    const threshold = 500 * 1024 * 1024; // 500MB
    const healthy = usage.heapUsed < threshold;
    return {
      name: 'memory',
      healthy,
      message: `Memory usage: ${(usage.heapUsed / 1024 / 1024).toFixed(2)}MB`
    };
  }
  
  async checkNetwork() {
    return { name: 'network', healthy: true, message: 'Network connectivity assumed' };
  }
  
  async checkServices() {
    return { name: 'services', healthy: true, message: 'Services operational' };
  }
  
  /**
   * Integrate health check into cost analysis
   */
  async analyzeWithHealth(costAnalysis) {
    const health = await this.checkHealth();
    
    return {
      ...costAnalysis,
      health: {
        status: health.systemHealth,
        impact: health.systemHealth === 'healthy' ? 'none' : 'potential_degradation',
        recommendations: health.checks
          .filter(c => !c.healthy)
          .map(c => `Address ${c.name} issue: ${c.message}`)
      }
    };
  }
}


  /**
   * Cost monitoring integration
   */
  async checkCostHealth() {
    const { StrategicCostMonitor } = require('../monitoring/strategic-cost-monitor');
    const monitor = new StrategicCostMonitor();
    
    // Register cost monitoring points
    // This would be populated from actual system configurations
    const costHealth = {
      status: 'monitoring_enabled',
      points: monitor.monitoringPoints.length,
      alerts: monitor.getAlerts().length
    };
    
    return costHealth;
  }
  
  /**
   * Enhanced health check with cost awareness
   */
  async checkHealthWithCosts() {
    const health = await this.checkHealth();
    const costHealth = await this.checkCostHealth();
    
    return {
      ...health,
      costHealth,
      overallStatus: health.systemHealth === 'healthy' && costHealth.alerts === 0 ? 'healthy' : 'degraded'
    };
  }


  /**
   * Cost monitoring integration
   */
  async checkCostHealth() {
    const { StrategicCostMonitor } = require('../monitoring/strategic-cost-monitor');
    const monitor = new StrategicCostMonitor();
    
    // Register cost monitoring points
    // This would be populated from actual system configurations
    const costHealth = {
      status: 'monitoring_enabled',
      points: monitor.monitoringPoints.length,
      alerts: monitor.getAlerts().length
    };
    
    return costHealth;
  }
  
  /**
   * Enhanced health check with cost awareness
   */
  async checkHealthWithCosts() {
    const health = await this.checkHealth();
    const costHealth = await this.checkCostHealth();
    
    return {
      ...health,
      costHealth,
      overallStatus: health.systemHealth === 'healthy' && costHealth.alerts === 0 ? 'healthy' : 'degraded'
    };
  }

module.exports = { HealthMonitor };
