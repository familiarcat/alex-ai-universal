// pages/api/alex-ai/n8n-health.js
import { getN8nDashboardData, testN8nConnection } from '../../../lib/n8n-client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Fetching N8N health data...');
    
    // Test connection first
    const connectionTest = await testN8nConnection();
    
    if (!connectionTest.connected) {
      console.warn('⚠️ N8N connection failed, returning error status');
      return res.status(503).json({
        error: 'N8N server unavailable',
        connectionTest,
        timestamp: new Date().toISOString()
      });
    }
    
    // Get comprehensive N8N dashboard data
    const n8nData = await getN8nDashboardData();
    
    console.log('✅ N8N health data fetched successfully');
    
    res.status(200).json({
      ...n8nData,
      connectionTest,
      success: true
    });
    
  } catch (error) {
    console.error('❌ Error fetching N8N health data:', error);
    
    // Return error with connection test info
    try {
      const connectionTest = await testN8nConnection();
      res.status(500).json({
        error: 'Failed to fetch N8N health data',
        message: error.message,
        connectionTest,
        timestamp: new Date().toISOString()
      });
    } catch (connectionError) {
      res.status(500).json({
        error: 'Failed to fetch N8N health data and connection test failed',
        message: error.message,
        connectionError: connectionError.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}







