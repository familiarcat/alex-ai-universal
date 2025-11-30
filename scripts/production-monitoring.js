#!/usr/bin/env node

/**
 * 🚀 Alex AI Universal - Production Monitoring System
 * 
 * Comprehensive monitoring and alerting system for production deployment
 * Features: Health checks, performance monitoring, alerting, and reporting
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// Configuration
const CONFIG = {
  // Monitoring intervals (milliseconds)
  healthCheckInterval: 30000,    // 30 seconds
  performanceInterval: 60000,    // 1 minute
  alertCheckInterval: 15000,     // 15 seconds
  
  // Thresholds
  thresholds: {
    responseTime: 2000,          // 2 seconds
    memoryUsage: 90,             // 90%
    cpuUsage: 80,                // 80%
    errorRate: 5,                 // 5%
    diskUsage: 85                // 85%
  },
  
  // Alerting
  alerting: {
    email: process.env.ALERT_EMAIL || 'admin@alex-ai.dev',
    slack: process.env.SLACK_WEBHOOK || null,
    webhook: process.env.WEBHOOK_URL || null
  },
  
  // Endpoints to monitor
  endpoints: [
    'https://api.alex-ai.dev/health',
    'https://api.alex-ai.dev/health/crew',
    'https://api.alex-ai.dev/health/memory',
    'https://api.alex-ai.dev/health/n8n',
    'https://api.alex-ai.dev/health/security'
  ],
  
  // Logging
  logFile: path.join(__dirname, 'logs', 'monitoring.log'),
  metricsFile: path.join(__dirname, 'logs', 'metrics.json'),
  alertsFile: path.join(__dirname, 'logs', 'alerts.json')
};

// Monitoring state
const monitoringState = {
  isRunning: false,
  startTime: null,
  healthStatus: 'unknown',
  performanceMetrics: {},
  alerts: [],
  incidents: [],
  uptime: 0
};

/**
 * 🏥 Health Check System
 */
class HealthCheckSystem {
  constructor() {
    this.checks = new Map();
    this.results = new Map();
  }
  
  /**
   * Add a health check
   */
  addCheck(name, checkFunction, interval = 30000) {
    this.checks.set(name, {
      function: checkFunction,
      interval: interval,
      lastRun: null,
      status: 'unknown',
      error: null
    });
  }
  
  /**
   * Run all health checks
   */
  async runAllChecks() {
    const results = {};
    
    for (const [name, check] of this.checks) {
      try {
        const result = await check.function();
        this.results.set(name, {
          status: result.status,
          details: result.details,
          timestamp: new Date().toISOString(),
          error: null
        });
        results[name] = this.results.get(name);
      } catch (error) {
        this.results.set(name, {
          status: 'unhealthy',
          details: null,
          timestamp: new Date().toISOString(),
          error: error.message
        });
        results[name] = this.results.get(name);
      }
    }
    
    return results;
  }
  
  /**
   * Get overall health status
   */
  getOverallStatus() {
    const results = Array.from(this.results.values());
    const unhealthy = results.filter(r => r.status === 'unhealthy');
    const degraded = results.filter(r => r.status === 'degraded');
    
    if (unhealthy.length > 0) return 'unhealthy';
    if (degraded.length > 0) return 'degraded';
    return 'healthy';
  }
}

/**
 * 📊 Performance Monitoring System
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.history = [];
    this.maxHistorySize = 1000;
  }
  
  /**
   * Record a metric
   */
  recordMetric(name, value, timestamp = Date.now()) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push({
      value: value,
      timestamp: timestamp
    });
    
    // Keep only recent metrics
    const metrics = this.metrics.get(name);
    if (metrics.length > this.maxHistorySize) {
      metrics.splice(0, metrics.length - this.maxHistorySize);
    }
  }
  
  /**
   * Get metric statistics
   */
  getMetricStats(name, timeWindow = 300000) { // 5 minutes
    const metrics = this.metrics.get(name) || [];
    const now = Date.now();
    const recent = metrics.filter(m => now - m.timestamp < timeWindow);
    
    if (recent.length === 0) return null;
    
    const values = recent.map(m => m.value);
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[values.length - 1]
    };
  }
  
  /**
   * Get all metrics
   */
  getAllMetrics() {
    const allMetrics = {};
    for (const [name, metrics] of this.metrics) {
      allMetrics[name] = this.getMetricStats(name);
    }
    return allMetrics;
  }
}

/**
 * 🚨 Alerting System
 */
class AlertingSystem {
  constructor() {
    this.alerts = [];
    this.sentAlerts = new Set();
  }
  
  /**
   * Create an alert
   */
  createAlert(severity, component, message, details = {}) {
    const alert = {
      id: Date.now() + Math.random(),
      severity: severity, // critical, warning, info
      component: component,
      message: message,
      details: details,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false
    };
    
    this.alerts.push(alert);
    this.sendAlert(alert);
    
    return alert;
  }
  
  /**
   * Send alert notification
   */
  async sendAlert(alert) {
    const alertKey = `${alert.component}-${alert.severity}-${alert.message}`;
    
    if (this.sentAlerts.has(alertKey)) {
      return; // Don't send duplicate alerts
    }
    
    this.sentAlerts.add(alertKey);
    
    // Send to different channels based on severity
    if (alert.severity === 'critical') {
      await this.sendCriticalAlert(alert);
    } else if (alert.severity === 'warning') {
      await this.sendWarningAlert(alert);
    } else {
      await this.sendInfoAlert(alert);
    }
  }
  
  /**
   * Send critical alert
   */
  async sendCriticalAlert(alert) {
    console.log(`🚨 CRITICAL ALERT: ${alert.component} - ${alert.message}`);
    
    // Send to all channels
    await this.sendSlackAlert(alert);
    await this.sendWebhookAlert(alert);
    await this.sendEmailAlert(alert);
  }
  
  /**
   * Send warning alert
   */
  async sendWarningAlert(alert) {
    console.log(`⚠️  WARNING: ${alert.component} - ${alert.message}`);
    
    // Send to Slack and webhook
    await this.sendSlackAlert(alert);
    await this.sendWebhookAlert(alert);
  }
  
  /**
   * Send info alert
   */
  async sendInfoAlert(alert) {
    console.log(`ℹ️  INFO: ${alert.component} - ${alert.message}`);
    
    // Send to webhook only
    await this.sendWebhookAlert(alert);
  }
  
  /**
   * Send Slack alert
   */
  async sendSlackAlert(alert) {
    if (!CONFIG.alerting.slack) return;
    
    const payload = {
      text: `🚨 *${alert.severity.toUpperCase()}* - ${alert.component}`,
      attachments: [{
        color: alert.severity === 'critical' ? 'danger' : 
               alert.severity === 'warning' ? 'warning' : 'good',
        fields: [
          { title: 'Message', value: alert.message, short: false },
          { title: 'Component', value: alert.component, short: true },
          { title: 'Time', value: alert.timestamp, short: true }
        ]
      }]
    };
    
    try {
      await this.sendHttpRequest(CONFIG.alerting.slack, 'POST', payload);
    } catch (error) {
      console.error('Failed to send Slack alert:', error.message);
    }
  }
  
  /**
   * Send webhook alert
   */
  async sendWebhookAlert(alert) {
    if (!CONFIG.alerting.webhook) return;
    
    try {
      await this.sendHttpRequest(CONFIG.alerting.webhook, 'POST', alert);
    } catch (error) {
      console.error('Failed to send webhook alert:', error.message);
    }
  }
  
  /**
   * Send email alert
   */
  async sendEmailAlert(alert) {
    if (!CONFIG.alerting.email) return;
    
    // In a real implementation, you would use an email service
    console.log(`📧 Email alert to ${CONFIG.alerting.email}: ${alert.message}`);
  }
  
  /**
   * Send HTTP request
   */
  async sendHttpRequest(url, method, data) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(data))
        }
      };
      
      const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      });
      
      req.on('error', reject);
      req.write(JSON.stringify(data));
      req.end();
    });
  }
}

/**
 * 📈 Metrics Collection System
 */
class MetricsCollector {
  constructor() {
    this.performanceMonitor = new PerformanceMonitor();
    this.healthCheckSystem = new HealthCheckSystem();
    this.alertingSystem = new AlertingSystem();
    
    this.setupHealthChecks();
  }
  
  /**
   * Setup health checks
   */
  setupHealthChecks() {
    // API endpoint health check
    this.healthCheckSystem.addCheck('api', async () => {
      const results = {};
      
      for (const endpoint of CONFIG.endpoints) {
        try {
          const startTime = Date.now();
          const response = await this.checkEndpoint(endpoint);
          const responseTime = Date.now() - startTime;
          
          results[endpoint] = {
            status: response.status < 400 ? 'healthy' : 'unhealthy',
            responseTime: responseTime,
            statusCode: response.status
          };
          
          // Record performance metrics
          this.performanceMonitor.recordMetric('responseTime', responseTime);
          this.performanceMonitor.recordMetric('statusCode', response.status);
          
        } catch (error) {
          results[endpoint] = {
            status: 'unhealthy',
            responseTime: null,
            statusCode: null,
            error: error.message
          };
        }
      }
      
      const overallStatus = Object.values(results).every(r => r.status === 'healthy') ? 'healthy' : 'degraded';
      
      return {
        status: overallStatus,
        details: results
      };
    });
    
    // System resource health check
    this.healthCheckSystem.addCheck('system', async () => {
      const memoryUsage = process.memoryUsage();
      const cpuUsage = process.cpuUsage();
      
      // Record system metrics
      this.performanceMonitor.recordMetric('memoryUsage', memoryUsage.heapUsed / 1024 / 1024); // MB
      this.performanceMonitor.recordMetric('heapTotal', memoryUsage.heapTotal / 1024 / 1024); // MB
      this.performanceMonitor.recordMetric('external', memoryUsage.external / 1024 / 1024); // MB
      
      const status = memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9 ? 'healthy' : 'degraded';
      
      return {
        status: status,
        details: {
          memoryUsage: memoryUsage,
          cpuUsage: cpuUsage
        }
      };
    });
  }
  
  /**
   * Check endpoint health
   */
  async checkEndpoint(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: 5000
      };
      
      const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
        resolve(res);
      });
      
      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      req.end();
    });
  }
  
  /**
   * Run monitoring cycle
   */
  async runMonitoringCycle() {
    try {
      // Run health checks
      const healthResults = await this.healthCheckSystem.runAllChecks();
      const overallHealth = this.healthCheckSystem.getOverallStatus();
      
      // Update monitoring state
      monitoringState.healthStatus = overallHealth;
      
      // Check for alerts
      this.checkAlerts(healthResults);
      
      // Record metrics
      const performanceMetrics = this.performanceMonitor.getAllMetrics();
      monitoringState.performanceMetrics = performanceMetrics;
      
      // Log results
      this.logMonitoringResults(healthResults, performanceMetrics);
      
      return {
        health: healthResults,
        performance: performanceMetrics,
        overall: overallHealth
      };
      
    } catch (error) {
      console.error('Monitoring cycle failed:', error.message);
      this.alertingSystem.createAlert('critical', 'monitoring', 'Monitoring system failure', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Check for alerts
   */
  checkAlerts(healthResults) {
    // Check response time
    const responseTimeStats = this.performanceMonitor.getMetricStats('responseTime');
    if (responseTimeStats && responseTimeStats.avg > CONFIG.thresholds.responseTime) {
      this.alertingSystem.createAlert('warning', 'performance', 
        `High response time: ${responseTimeStats.avg.toFixed(2)}ms`, responseTimeStats);
    }
    
    // Check memory usage
    const memoryStats = this.performanceMonitor.getMetricStats('memoryUsage');
    if (memoryStats && memoryStats.avg > CONFIG.thresholds.memoryUsage) {
      this.alertingSystem.createAlert('warning', 'system', 
        `High memory usage: ${memoryStats.avg.toFixed(2)}MB`, memoryStats);
    }
    
    // Check for unhealthy components
    for (const [component, result] of Object.entries(healthResults)) {
      if (result.status === 'unhealthy') {
        this.alertingSystem.createAlert('critical', component, 
          `Component is unhealthy`, result);
      } else if (result.status === 'degraded') {
        this.alertingSystem.createAlert('warning', component, 
          `Component is degraded`, result);
      }
    }
  }
  
  /**
   * Log monitoring results
   */
  logMonitoringResults(healthResults, performanceMetrics) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp: timestamp,
      health: healthResults,
      performance: performanceMetrics,
      uptime: Date.now() - monitoringState.startTime
    };
    
    // Write to log file
    fs.appendFileSync(CONFIG.logFile, JSON.stringify(logEntry) + '\n');
    
    // Write metrics to file
    fs.writeFileSync(CONFIG.metricsFile, JSON.stringify(performanceMetrics, null, 2));
    
    // Write alerts to file
    fs.writeFileSync(CONFIG.alertsFile, JSON.stringify(this.alertingSystem.alerts, null, 2));
  }
}

/**
 * 🚀 Production Monitoring System
 */
class ProductionMonitoringSystem {
  constructor() {
    this.metricsCollector = new MetricsCollector();
    this.isRunning = false;
    this.intervals = [];
  }
  
  /**
   * Start monitoring
   */
  async start() {
    console.log('🚀 Starting Alex AI Production Monitoring System...');
    console.log('');
    
    // Create logs directory
    const logsDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Initialize monitoring state
    monitoringState.isRunning = true;
    monitoringState.startTime = Date.now();
    
    // Start monitoring intervals
    this.startHealthCheckInterval();
    this.startPerformanceInterval();
    this.startAlertCheckInterval();
    this.startDashboardInterval();
    
    this.isRunning = true;
    
    console.log('✅ Production monitoring system started');
    console.log(`📊 Health check interval: ${CONFIG.healthCheckInterval / 1000}s`);
    console.log(`📈 Performance interval: ${CONFIG.performanceInterval / 1000}s`);
    console.log(`🚨 Alert check interval: ${CONFIG.alertCheckInterval / 1000}s`);
    console.log('');
    
    // Handle shutdown
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());
  }
  
  /**
   * Start health check interval
   */
  startHealthCheckInterval() {
    const interval = setInterval(async () => {
      try {
        await this.metricsCollector.runMonitoringCycle();
      } catch (error) {
        console.error('Health check failed:', error.message);
      }
    }, CONFIG.healthCheckInterval);
    
    this.intervals.push(interval);
  }
  
  /**
   * Start performance interval
   */
  startPerformanceInterval() {
    const interval = setInterval(async () => {
      try {
        // Collect additional performance metrics
        const performanceMetrics = this.metricsCollector.performanceMonitor.getAllMetrics();
        monitoringState.performanceMetrics = performanceMetrics;
        
        // Log performance summary
        console.log('📊 Performance Metrics:');
        for (const [metric, stats] of Object.entries(performanceMetrics)) {
          if (stats) {
            console.log(`  ${metric}: avg=${stats.avg?.toFixed(2)}, min=${stats.min?.toFixed(2)}, max=${stats.max?.toFixed(2)}`);
          }
        }
        console.log('');
        
      } catch (error) {
        console.error('Performance monitoring failed:', error.message);
      }
    }, CONFIG.performanceInterval);
    
    this.intervals.push(interval);
  }
  
  /**
   * Start alert check interval
   */
  startAlertCheckInterval() {
    const interval = setInterval(async () => {
      try {
        // Check for new alerts
        const recentAlerts = this.metricsCollector.alertingSystem.alerts
          .filter(alert => Date.now() - new Date(alert.timestamp).getTime() < 60000); // Last minute
        
        if (recentAlerts.length > 0) {
          console.log(`🚨 ${recentAlerts.length} recent alerts`);
        }
        
      } catch (error) {
        console.error('Alert checking failed:', error.message);
      }
    }, CONFIG.alertCheckInterval);
    
    this.intervals.push(interval);
  }
  
  /**
   * Start dashboard interval
   */
  startDashboardInterval() {
    const interval = setInterval(() => {
      this.displayDashboard();
    }, 10000); // Every 10 seconds
    
    this.intervals.push(interval);
  }
  
  /**
   * Display monitoring dashboard
   */
  displayDashboard() {
    // Clear screen
    process.stdout.write('\x1B[2J\x1B[0f');
    
    console.log('🚀 Alex AI Production Monitoring Dashboard');
    console.log('==========================================');
    console.log('');
    
    // System status
    console.log('📊 System Status:');
    console.log(`  Overall Health: ${monitoringState.healthStatus.toUpperCase()}`);
    console.log(`  Uptime: ${this.formatUptime(monitoringState.uptime)}`);
    console.log(`  Start Time: ${new Date(monitoringState.startTime).toISOString()}`);
    console.log('');
    
    // Performance metrics
    console.log('📈 Performance Metrics:');
    const performanceMetrics = monitoringState.performanceMetrics;
    for (const [metric, stats] of Object.entries(performanceMetrics)) {
      if (stats) {
        console.log(`  ${metric}: avg=${stats.avg?.toFixed(2)}, min=${stats.min?.toFixed(2)}, max=${stats.max?.toFixed(2)}`);
      }
    }
    console.log('');
    
    // Recent alerts
    console.log('🚨 Recent Alerts:');
    const recentAlerts = this.metricsCollector.alertingSystem.alerts
      .slice(-5) // Last 5 alerts
      .reverse();
    
    if (recentAlerts.length === 0) {
      console.log('  No recent alerts');
    } else {
      for (const alert of recentAlerts) {
        const severity = alert.severity === 'critical' ? '🚨' : 
                       alert.severity === 'warning' ? '⚠️' : 'ℹ️';
        console.log(`  ${severity} ${alert.component}: ${alert.message}`);
      }
    }
    console.log('');
    
    console.log('==========================================');
  }
  
  /**
   * Format uptime
   */
  formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
  
  /**
   * Stop monitoring
   */
  stop() {
    console.log('\n🛑 Stopping production monitoring system...');
    
    this.isRunning = false;
    monitoringState.isRunning = false;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    console.log('✅ Production monitoring system stopped');
    process.exit(0);
  }
}

// Main execution
if (require.main === module) {
  const monitoringSystem = new ProductionMonitoringSystem();
  monitoringSystem.start().catch(console.error);
}

module.exports = { ProductionMonitoringSystem, HealthCheckSystem, PerformanceMonitor, AlertingSystem };
