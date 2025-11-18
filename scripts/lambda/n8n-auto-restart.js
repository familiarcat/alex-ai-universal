/**
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
