#!/usr/bin/env node

/**
 * 🖖 MCP Monitoring Dashboard
 * 
 * Display execution history, performance metrics, and errors.
 */

const { getMCPMonitoring } = require('./utils/mcp-monitoring');

function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'stats';

  const monitoring = getMCPMonitoring();
  monitoring.initialize();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 MCP MONITORING DASHBOARD');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  switch (command) {
    case 'stats':
      showStats(monitoring);
      break;
    case 'history':
      showHistory(monitoring, args[1] || 10);
      break;
    case 'errors':
      showErrors(monitoring, args[1] || 10);
      break;
    case 'performance':
      showPerformance(monitoring, args[1] || 10);
      break;
    default:
      console.log('Usage: node mcp-monitor-dashboard.js [command] [limit]');
      console.log('');
      console.log('Commands:');
      console.log('  stats       - Show overall statistics');
      console.log('  history     - Show execution history');
      console.log('  errors      - Show errors');
      console.log('  performance - Show performance metrics');
      process.exit(1);
  }
}

function showStats(monitoring) {
  const stats = monitoring.getStats();

  console.log('📊 Overall Statistics:\n');
  console.log('Executions:');
  console.log(`   Total: ${stats.executions.total}`);
  console.log(`   Successful: ${stats.executions.successful}`);
  console.log(`   Failed: ${stats.executions.failed}`);
  console.log(`   Success Rate: ${stats.executions.successRate}`);
  console.log(`   Average Duration: ${stats.executions.averageDuration}`);
  console.log('');

  console.log('Errors:');
  console.log(`   Total: ${stats.errors.total}`);
  console.log(`   Critical: ${stats.errors.critical}`);
  console.log('');

  console.log('Performance:');
  console.log(`   Metrics Count: ${stats.performance.metricsCount}`);
  console.log('');
}

function showHistory(monitoring, limit) {
  const history = monitoring.getExecutionHistory({ limit: parseInt(limit) });

  console.log(`📋 Execution History (last ${limit}):\n`);

  if (history.length === 0) {
    console.log('   No execution history yet.\n');
    return;
  }

  history.forEach((entry, index) => {
    console.log(`${index + 1}. ${entry.workflow}`);
    console.log(`   Status: ${entry.status === 'success' ? '✅' : '❌'} ${entry.status}`);
    console.log(`   Duration: ${entry.duration || 0}ms`);
    console.log(`   Time: ${entry.timestamp}`);
    if (entry.error) {
      console.log(`   Error: ${entry.error}`);
    }
    console.log('');
  });
}

function showErrors(monitoring, limit) {
  const errors = monitoring.getErrors({ limit: parseInt(limit) });

  console.log(`❌ Errors (last ${limit}):\n`);

  if (errors.length === 0) {
    console.log('   No errors recorded.\n');
    return;
  }

  errors.forEach((error, index) => {
    console.log(`${index + 1}. ${error.workflow}`);
    console.log(`   Error: ${error.error}`);
    console.log(`   Time: ${error.timestamp}`);
    if (error.context) {
      console.log(`   Context: ${JSON.stringify(error.context).substring(0, 100)}...`);
    }
    console.log('');
  });
}

function showPerformance(monitoring, limit) {
  const metrics = monitoring.getPerformanceMetrics({ limit: parseInt(limit) });

  console.log(`⚡ Performance Metrics (last ${limit}):\n`);

  if (metrics.length === 0) {
    console.log('   No performance metrics yet.\n');
    return;
  }

  metrics.forEach((metric, index) => {
    console.log(`${index + 1}. ${metric.workflow} - ${metric.metric}`);
    console.log(`   Value: ${metric.value}${metric.unit}`);
    console.log(`   Time: ${metric.timestamp}`);
    console.log('');
  });
}

if (require.main === module) {
  main();
}

