/**
 * Cursor AI Chat DDD Integration Hook
 * 
 * Automatically stores chat sessions to N8N => Supabase via DDD architecture
 * 
 * Usage: Import and call after each Cursor chat interaction
 */

const https = require('https');
const { loadCrewCredentials } = require('../utils/load-crew-credentials');

class CursorDDDIntegration {
  constructor() {
    const creds = loadCrewCredentials();
    this.n8nBaseUrl = creds.n8n?.baseUrl || 'https://n8n.pbradygeorgen.com';
  }
  
  /**
   * Store chat session automatically after Cursor interaction
   */
  async storeChatSession(chatContent, metadata = {}) {
    try {
      const memoryPayload = {
        title: metadata.title || 'Cursor AI Chat Session',
        summary: this.extractSummary(chatContent),
        detailedAnalysis: chatContent,
        crewMember: metadata.crewMember || 'data',
        knowledgeType: 'conversation',
        priority: metadata.priority || 'medium',
        tags: ['cursor-ai', 'chat-session', ...(metadata.tags || [])],
        sessionId: metadata.sessionId || `cursor-${Date.now()}`,
        platform: 'cursor-ai',
        timestamp: new Date().toISOString(),
        // Vector fragmentation metadata
        vectorOptimization: {
          enabled: true,
          fragmentationEnabled: true,
          deduplicationEnabled: true,
          smartDeduplication: true,
          crewAccessOptimized: true
        }
      };
      
      await this.sendToN8N('crew-memory-storage', memoryPayload);
      
      return { success: true, message: 'Chat session stored via DDD' };
    } catch (error) {
      console.error('❌ Failed to store chat session:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  extractSummary(content) {
    // Extract first 200 characters as summary
    return content.substring(0, 200).replace(/\n/g, ' ').trim() + '...';
  }
  
  async sendToN8N(webhookPath, payload) {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.n8nBaseUrl}/webhook/${webhookPath}`);
      const data = JSON.stringify(payload);
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data)
        }
      };
      
      const req = https.request(url, options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ status: res.statusCode, body });
          } else {
            reject(new Error(`N8N workflow returned ${res.statusCode}: ${body}`));
          }
        });
      });
      
      req.on('error', reject);
      req.write(data);
      req.end();
    });
  }
}

module.exports = { CursorDDDIntegration };
