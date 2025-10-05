// lib/n8n-client.js
import axios from 'axios';

// N8N Configuration from environment variables
const N8N_CONFIG = {
  baseURL: process.env.N8N_URL || 'https://n8n.pbradygeorgen.com',
  apiKey: process.env.N8N_API_KEY,
  webhookURL: process.env.N8N_WEBHOOK_URL || 'https://n8n.pbradygeorgen.com/webhook',
  timeout: 10000
};

// Create axios instance for N8N API calls
const n8nClient = axios.create({
  baseURL: N8N_CONFIG.baseURL,
  timeout: N8N_CONFIG.timeout,
  headers: {
    'Authorization': `Bearer ${N8N_CONFIG.apiKey}`,
    'Content-Type': 'application/json'
  }
});

// N8N Health Check
export const checkN8nHealth = async () => {
  try {
    const response = await n8nClient.get('/healthz');
    return {
      status: 'healthy',
      responseTime: response.headers['x-response-time'] || 'unknown',
      timestamp: new Date().toISOString(),
      version: response.data?.version || 'unknown'
    };
  } catch (error) {
    console.error('N8N Health Check Failed:', error.message);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Get N8N Workflow Statistics
export const getWorkflowStats = async () => {
  try {
    const response = await n8nClient.get('/api/v1/workflows');
    const workflows = response.data.data || [];
    
    const stats = {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter(w => w.active).length,
      inactiveWorkflows: workflows.filter(w => !w.active).length,
      crewWorkflows: workflows.filter(w => w.name.includes('crew')).length,
      systemWorkflows: workflows.filter(w => w.name.includes('system')).length,
      lastExecuted: workflows
        .filter(w => w.updatedAt)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]?.updatedAt
    };
    
    return stats;
  } catch (error) {
    console.error('Failed to fetch workflow stats:', error.message);
    return {
      totalWorkflows: 0,
      activeWorkflows: 0,
      inactiveWorkflows: 0,
      crewWorkflows: 0,
      systemWorkflows: 0,
      error: error.message
    };
  }
};

// Get N8N Execution Statistics
export const getExecutionStats = async () => {
  try {
    const response = await n8nClient.get('/api/v1/executions', {
      params: {
        limit: 100,
        order: 'desc'
      }
    });
    
    const executions = response.data.data || [];
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.finished && !e.stoppedAt).length,
      failedExecutions: executions.filter(e => e.finished && e.stoppedAt).length,
      runningExecutions: executions.filter(e => !e.finished).length,
      last24h: executions.filter(e => new Date(e.startedAt) > last24h).length,
      last7d: executions.filter(e => new Date(e.startedAt) > last7d).length,
      averageExecutionTime: executions
        .filter(e => e.finished && e.startedAt && e.stoppedAt)
        .reduce((sum, e) => sum + (new Date(e.stoppedAt) - new Date(e.startedAt)), 0) / 
        executions.filter(e => e.finished && e.startedAt && e.stoppedAt).length || 0
    };
    
    return stats;
  } catch (error) {
    console.error('Failed to fetch execution stats:', error.message);
    return {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      runningExecutions: 0,
      last24h: 0,
      last7d: 0,
      averageExecutionTime: 0,
      error: error.message
    };
  }
};

// Get Crew Member N8N Activity
export const getCrewN8nActivity = async () => {
  try {
    const crewMembers = [
      'Picard', 'Data', 'Geordi', 'Worf', 'Troi', 
      'Riker', 'Crusher', 'La Forge', 'Spock'
    ];
    
    const crewActivity = {};
    
    for (const crewMember of crewMembers) {
      try {
        // Check for crew-specific webhook endpoints
        const webhookPath = `/webhook/${crewMember.toLowerCase()}-agent`;
        const webhookUrl = `${N8N_CONFIG.webhookURL}/${crewMember.toLowerCase()}-agent`;
        
        // Test webhook connectivity
        const response = await axios.post(webhookUrl, {
          test: true,
          crewMember,
          timestamp: new Date().toISOString()
        }, {
          timeout: 5000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        crewActivity[crewMember] = {
          status: 'active',
          webhookUrl,
          lastResponse: response.status === 200 ? 'success' : 'failed',
          responseTime: response.headers['x-response-time'] || 'unknown'
        };
      } catch (error) {
        crewActivity[crewMember] = {
          status: 'inactive',
          error: error.message,
          webhookUrl: `${N8N_CONFIG.webhookURL}/${crewMember.toLowerCase()}-agent`
        };
      }
    }
    
    return crewActivity;
  } catch (error) {
    console.error('Failed to fetch crew N8N activity:', error.message);
    return {};
  }
};

// Get System Resource Usage
export const getSystemResources = async () => {
  try {
    const response = await n8nClient.get('/api/v1/settings');
    
    return {
      version: response.data?.version || 'unknown',
      timezone: response.data?.timezone || 'UTC',
      instanceId: response.data?.instanceId || 'unknown',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to fetch system resources:', error.message);
    return {
      version: 'unknown',
      timezone: 'UTC',
      instanceId: 'unknown',
      error: error.message
    };
  }
};

// Get Real-time N8N Dashboard Data
export const getN8nDashboardData = async () => {
  try {
    const [health, workflowStats, executionStats, crewActivity, systemResources] = await Promise.all([
      checkN8nHealth(),
      getWorkflowStats(),
      getExecutionStats(),
      getCrewN8nActivity(),
      getSystemResources()
    ]);
    
    return {
      health,
      workflowStats,
      executionStats,
      crewActivity,
      systemResources,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to fetch N8N dashboard data:', error.message);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Test N8N Connection with Credentials
export const testN8nConnection = async () => {
  try {
    console.log('🔍 Testing N8N connection...');
    console.log(`📍 N8N URL: ${N8N_CONFIG.baseURL}`);
    console.log(`🔑 API Key: ${N8N_CONFIG.apiKey ? '✅ Configured' : '❌ Missing'}`);
    
    const health = await checkN8nHealth();
    const workflowStats = await getWorkflowStats();
    
    console.log(`🏥 Health Status: ${health.status}`);
    console.log(`📊 Total Workflows: ${workflowStats.totalWorkflows}`);
    console.log(`⚡ Active Workflows: ${workflowStats.activeWorkflows}`);
    
    return {
      connected: health.status === 'healthy',
      health,
      workflowStats,
      credentials: {
        url: N8N_CONFIG.baseURL,
        apiKey: N8N_CONFIG.apiKey ? 'configured' : 'missing'
      }
    };
  } catch (error) {
    console.error('❌ N8N Connection Test Failed:', error.message);
    return {
      connected: false,
      error: error.message,
      credentials: {
        url: N8N_CONFIG.baseURL,
        apiKey: N8N_CONFIG.apiKey ? 'configured' : 'missing'
      }
    };
  }
};

export default {
  checkN8nHealth,
  getWorkflowStats,
  getExecutionStats,
  getCrewN8nActivity,
  getSystemResources,
  getN8nDashboardData,
  testN8nConnection
};







