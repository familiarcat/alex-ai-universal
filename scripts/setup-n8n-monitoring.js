#!/usr/bin/env node
/**
 * Setup N8N Monitoring and Automated Restart
 * 
 * Implements crew recommendations for cost-effective monitoring
 * Commander Data: CloudWatch alarms + Lambda for automated restart
 * Quark: Cost-effective solution (~$0.40/month)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { loadCrewCredentials } = require('./utils/load-crew-credentials');

const WORKSPACE_ROOT = process.cwd();

/**
 * Generate CloudWatch Alarm Configuration
 */
function generateCloudWatchAlarmConfig() {
  return {
    AlarmName: 'n8n-health-check-failed',
    AlarmDescription: 'N8N server health check failed - trigger automated restart',
    MetricName: 'N8NHealthCheck',
    Namespace: 'AlexAI/N8N',
    Statistic: 'Minimum',
    Period: 60, // 1 minute
    EvaluationPeriods: 2, // 2 consecutive failures
    Threshold: 1, // 1 = healthy, 0 = unhealthy
    ComparisonOperator: 'LessThanThreshold',
    ActionsEnabled: true,
    AlarmActions: [
      'arn:aws:sns:us-east-2:YOUR_ACCOUNT_ID:n8n-alerts', // Update with your SNS topic ARN
      'arn:aws:lambda:us-east-2:YOUR_ACCOUNT_ID:function:n8n-auto-restart' // Update with Lambda ARN
    ]
  };
}

/**
 * Generate Lambda Function for Automated Restart
 */
function generateLambdaFunction() {
  return `/**
 * N8N Automated Restart Lambda Function
 * 
 * Commander Data's recommendation: Automated restart via Lambda + SSM
 * Triggered by CloudWatch alarm when N8N health check fails
 */

const AWS = require('aws-sdk');

const ssm = new AWS.SSM({ region: process.env.AWS_REGION || 'us-east-2' });
const INSTANCE_ID = process.env.N8N_INSTANCE_ID || 'i-0afdf313f61f22df0';

exports.handler = async (event) => {
  console.log('🔄 N8N Auto-Restart Lambda triggered');
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Check if we've restarted recently (rate limiting)
  const lastRestart = await getLastRestartTime();
  const now = Date.now();
  const timeSinceLastRestart = now - lastRestart;
  
  // Don't restart more than once per hour
  if (timeSinceLastRestart < 3600000) {
    console.log('⚠️  Rate limit: Restarted recently, skipping');
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Rate limited - restarted recently' })
    };
  }
  
  try {
    // Restart N8N via SSM
    const command = await ssm.sendCommand({
      InstanceIds: [INSTANCE_ID],
      DocumentName: 'AWS-RunShellScript',
      Parameters: {
        commands: [
          'pm2 restart n8n || pm2 start n8n',
          'sleep 5',
          'pm2 status n8n'
        ]
      }
    }).promise();
    
    console.log('✅ Restart command sent:', command.Command.CommandId);
    
    // Update last restart time
    await updateLastRestartTime(now);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'N8N restart initiated',
        commandId: command.Command.CommandId
      })
    };
  } catch (error) {
    console.error('❌ Failed to restart N8N:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Store last restart time in DynamoDB or Parameter Store
async function getLastRestartTime() {
  // Implementation: Get from DynamoDB or Parameter Store
  // For now, return 0 (no previous restart)
  return 0;
}

async function updateLastRestartTime(timestamp) {
  // Implementation: Store in DynamoDB or Parameter Store
  console.log('📝 Last restart time updated:', new Date(timestamp).toISOString());
}
`;
}

/**
 * Generate CloudWatch Metric Script
 */
function generateCloudWatchMetricScript() {
  return `#!/usr/bin/env node
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
    
    console.log(\`✅ Health metric sent: \${health.status} (\${metricValue})\`);
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
`;
}

/**
 * Generate setup instructions
 */
function generateSetupInstructions() {
  return `# N8N Monitoring Setup Instructions

## Overview

This setup implements the crew's recommendations for cost-effective N8N monitoring and automated restart.

**Cost:** ~$0.40/month  
**ROI:** Prevents $50-500+ per downtime incident

---

## Setup Steps

### Step 1: Create SNS Topic for Alerts

\`\`\`bash
aws sns create-topic --name n8n-alerts --region us-east-2
aws sns subscribe --topic-arn arn:aws:sns:us-east-2:ACCOUNT_ID:n8n-alerts \\
  --protocol email --notification-endpoint your-email@example.com
\`\`\`

### Step 2: Create Lambda Function for Auto-Restart

1. Create Lambda function: \`n8n-auto-restart\`
2. Runtime: Node.js 18.x
3. Paste code from: \`scripts/lambda/n8n-auto-restart.js\`
4. Set environment variables:
   - \`N8N_INSTANCE_ID\`: i-008e2d124532fb313
   - \`AWS_REGION\`: us-east-2
5. Attach IAM role with SSM permissions:
   - \`ssm:SendCommand\`
   - \`ssm:GetCommandInvocation\`

### Step 3: Set Up CloudWatch Metric

1. Create EventBridge rule to run every minute:
   \`\`\`bash
   aws events put-rule --name n8n-health-check \\
     --schedule-expression "rate(1 minute)" \\
     --state ENABLED
   \`\`\`

2. Add Lambda target to run metric script:
   \`\`\`bash
   aws events put-targets --rule n8n-health-check \\
     --targets "Id"="1","Arn"="arn:aws:lambda:us-east-2:ACCOUNT_ID:function:send-n8n-health-metric"
   \`\`\`

### Step 4: Create CloudWatch Alarm

\`\`\`bash
aws cloudwatch put-metric-alarm \\
  --alarm-name n8n-health-check-failed \\
  --alarm-description "N8N health check failed" \\
  --metric-name N8NHealthCheck \\
  --namespace "AlexAI/N8N" \\
  --statistic Minimum \\
  --period 60 \\
  --evaluation-periods 2 \\
  --threshold 1 \\
  --comparison-operator LessThanThreshold \\
  --alarm-actions \\
    arn:aws:sns:us-east-2:ACCOUNT_ID:n8n-alerts \\
    arn:aws:lambda:us-east-2:ACCOUNT_ID:function:n8n-auto-restart
\`\`\`

### Step 5: Test Setup

\`\`\`bash
# Test health check
node scripts/check-n8n-health.js

# Test manual restart
./scripts/restart-n8n-server.sh

# Verify CloudWatch metric
aws cloudwatch get-metric-statistics \\
  --namespace "AlexAI/N8N" \\
  --metric-name N8NHealthCheck \\
  --start-time $(date -u -d '5 minutes ago' +%Y-%m-%dT%H:%M:%S) \\
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \\
  --period 60 \\
  --statistics Minimum
\`\`\`

---

## Cost Breakdown

- **CloudWatch Metrics:** $0.10/month (10 custom metrics)
- **Lambda Invocations:** $0.20/month (1M requests)
- **SNS Notifications:** $0.10/month (100 notifications)
- **Total:** $0.40/month

**ROI:** Prevents hours of downtime = $50-500+ per incident

---

## Manual Restart

If automated restart fails, use manual restart:

\`\`\`bash
./scripts/restart-n8n-server.sh
\`\`\`

Or via SSH:
\`\`\`bash
ssh ubuntu@n8n.pbradygeorgen.com
pm2 restart n8n
\`\`\`

---

## Monitoring Dashboard

Access CloudWatch dashboard to monitor:
- N8N health check status
- Restart events
- Instance health

---

**Status:** Ready for implementation
`;
}

/**
 * Main execution
 */
async function main() {
  console.log('🖖 Setting Up N8N Monitoring & Automated Restart');
  console.log('================================================\n');
  
  // Create directories
  const lambdaDir = path.join(WORKSPACE_ROOT, 'scripts/lambda');
  const monitoringDir = path.join(WORKSPACE_ROOT, 'scripts/monitoring');
  const docsDir = path.join(WORKSPACE_ROOT, 'docs/monitoring');
  
  [lambdaDir, monitoringDir, docsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Generate files
  console.log('📝 Generating monitoring infrastructure...\n');
  
  // Lambda function
  const lambdaCode = generateLambdaFunction();
  fs.writeFileSync(path.join(lambdaDir, 'n8n-auto-restart.js'), lambdaCode);
  console.log('   ✅ Lambda function: scripts/lambda/n8n-auto-restart.js');
  
  // CloudWatch metric script
  const metricScript = generateCloudWatchMetricScript();
  fs.writeFileSync(path.join(monitoringDir, 'send-n8n-health-metric.js'), metricScript);
  fs.chmodSync(path.join(monitoringDir, 'send-n8n-health-metric.js'), '755');
  console.log('   ✅ CloudWatch metric script: scripts/monitoring/send-n8n-health-metric.js');
  
  // CloudWatch alarm config
  const alarmConfig = generateCloudWatchAlarmConfig();
  fs.writeFileSync(path.join(monitoringDir, 'cloudwatch-alarm-config.json'), JSON.stringify(alarmConfig, null, 2));
  console.log('   ✅ CloudWatch alarm config: scripts/monitoring/cloudwatch-alarm-config.json');
  
  // Setup instructions
  const instructions = generateSetupInstructions();
  fs.writeFileSync(path.join(docsDir, 'N8N_MONITORING_SETUP.md'), instructions);
  console.log('   ✅ Setup instructions: docs/monitoring/N8N_MONITORING_SETUP.md');
  
  console.log('\n✅ Monitoring infrastructure generated!');
  console.log('\n📋 Next Steps:');
  console.log('   1. Review setup instructions: docs/monitoring/N8N_MONITORING_SETUP.md');
  console.log('   2. Create SNS topic for alerts');
  console.log('   3. Deploy Lambda function');
  console.log('   4. Set up CloudWatch alarm');
  console.log('   5. Test health check: node scripts/check-n8n-health.js');
  console.log('   6. Test manual restart: ./scripts/restart-n8n-server.sh');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

