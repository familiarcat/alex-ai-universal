#!/usr/bin/env node
/**
 * Send N8N Health Check Metric to CloudWatch
 * 
 * Runs every minute via cron or EventBridge
 * Commander Data's recommendation: Health check every 30 seconds
 */

const AWS = require('aws-sdk');
const { execSync } = require('child_process');

const cloudwatch = new AWS.CloudWatch({ region: process.env.AWS_REGION || 'us-east-2' });

async function sendHealthMetric() {
  try {
    // Run health check
    const healthCheck = execSync('node scripts/check-n8n-health.js --json', { encoding: 'utf8' });
    const health = JSON.parse(healthCheck);
    
    // Send metric to CloudWatch
    const metricValue = health.status === 'healthy' ? 1 : 0;
    
    await cloudwatch.putMetricData({
      Namespace: 'AlexAI/N8N',
      MetricData: [{
        MetricName: 'N8NHealthCheck',
        Value: metricValue,
        Unit: 'Count',
        Timestamp: new Date(),
        Dimensions: [
          {
            Name: 'Instance',
            Value: 'n8n-production'
          }
        ]
      }]
    }).promise();
    
    console.log(`✅ Health metric sent: ${health.status} (${metricValue})`);
  } catch (error) {
    console.error('❌ Failed to send health metric:', error.message);
    // Send failure metric
    await cloudwatch.putMetricData({
      Namespace: 'AlexAI/N8N',
      MetricData: [{
        MetricName: 'N8NHealthCheck',
        Value: 0,
        Unit: 'Count',
        Timestamp: new Date()
      }]
    }).promise();
  }
}

sendHealthMetric();
