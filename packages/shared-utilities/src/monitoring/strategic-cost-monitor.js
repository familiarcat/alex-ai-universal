/**
 * Strategic Cost Monitoring System
 * 
 * Monitors costs across all systems and provides strategic insights
 */

class StrategicCostMonitor {
  constructor() {
    this.monitoringPoints = [];
    this.alerts = [];
  }
  
  registerMonitoringPoint(name, costFunction, threshold) {
    this.monitoringPoints.push({ name, costFunction, threshold });
  }
  
  async checkAllSystems() {
    const results = [];
    for (const point of this.monitoringPoints) {
      try {
        const cost = await point.costFunction();
        const status = cost > point.threshold ? 'exceeded' : 'normal';
        results.push({ name: point.name, cost, threshold: point.threshold, status });
        
        if (status === 'exceeded') {
          this.alerts.push({
            system: point.name,
            cost,
            threshold: point.threshold,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        results.push({ name: point.name, error: error.message });
      }
    }
    return results;
  }
  
  getAlerts() {
    return this.alerts;
  }
}

module.exports = { StrategicCostMonitor };
