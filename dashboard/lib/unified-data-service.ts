/**
 * 🖖 Unified Data Service (Client-Side)
 * 
 * DDD-Compliant Data Access Layer for Dashboard Components
 * 
 * Flow: UI Component → UnifiedDataService → MCP Server → Supabase
 * Fallback: UI Component → UnifiedDataService → n8n Webhook → Supabase (if MCP unavailable)
 * 
 * Architecture: MCP is PRIMARY controller (mcp.pbradygeorgen.com)
 *               n8n is FALLBACK only (n8n.pbradygeorgen.com)
 * 
 * Reviewed by: Commander Data (Implementation) & Lieutenant Commander La Forge (Infrastructure)
 * Updated: 2025-01-24 - Corrected to use MCP as primary controller per migration milestones
 * Updated: 2025-01-24 - Added progress tracking for async operations
 */

const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const N8N_BASE_URL = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com'; // Fallback only

export interface DataServiceConfig {
  timeout?: number;
  retries?: number;
  onProgress?: (current: number, total: number, description: string, status?: 'loading' | 'complete' | 'failed') => void;
}

export type ProgressCallback = (current: number, total: number, description: string, status?: 'loading' | 'complete' | 'failed') => void;

export class UnifiedDataService {
  private config: Required<Omit<DataServiceConfig, 'onProgress'>> & { onProgress?: ProgressCallback };
  private activeOperations: Map<string, { current: number; total: number }> = new Map();

  constructor(config: DataServiceConfig = {}) {
    this.config = {
      timeout: config.timeout || 30000, // Increased from 10s to 30s per crew optimization
      retries: config.retries || 3, // Increased from 1 to 3 with exponential backoff
      onProgress: config.onProgress,
    };
  }
  
  /**
   * Report progress for an operation
   */
  private reportProgress(operationId: string, current: number, total: number, description: string, status?: 'loading' | 'complete' | 'failed') {
    if (this.config.onProgress) {
      this.config.onProgress(current, total, description, status);
    }
    this.activeOperations.set(operationId, { current, total });
  }

  /**
   * Query knowledge base via MCP (primary) or n8n (fallback)
   * 
   * @param params - Query parameters
   * @returns Knowledge base results
   */
  async queryKnowledge(params: {
    limit?: number;
    category?: string;
    crew_member?: string;
    query?: string;
  }): Promise<any> {
    return this.callMCPEndpoint('knowledge/query', {
      action: 'query',
      ...params,
    });
  }

  /**
   * Get crew memory statistics via MCP (primary) or n8n (fallback)
   * 
   * @param params - Query parameters
   * @returns Crew stats
   */
  async getCrewStats(params: {
    limit?: number;
    crew_member?: string;
  } = {}): Promise<any> {
    return this.callMCPEndpoint('crew/stats', {
      action: 'get_stats',
      ...params,
    });
  }

  /**
   * Get learning metrics via MCP (primary) or n8n (fallback)
   * 
   * @param params - Query parameters
   * @returns Learning metrics
   */
  async getLearningMetrics(params: {
    limit?: number;
    dateRange?: string;
  } = {}): Promise<any> {
    return this.callMCPEndpoint('learning/metrics', {
      action: 'get_metrics',
      ...params,
    });
  }

  /**
   * Get project recommendations via MCP (primary) or n8n (fallback)
   * 
   * @param params - Query parameters
   * @returns Project recommendations
   */
  async getProjectRecommendations(params: {
    limit?: number;
    category?: string;
  } = {}): Promise<any> {
    return this.callMCPEndpoint('project/recommendations', {
      action: 'get_recommendations',
      ...params,
    });
  }

  /**
   * Get security assessment data via MCP (primary) or n8n (fallback)
   * 
   * @returns Security assessment data
   */
  async getSecurityData(): Promise<any> {
    return this.callMCPEndpoint('security/assessment', {
      action: 'get_assessment',
    });
  }

  /**
   * Get cost optimization data via MCP (primary) or n8n (fallback)
   * 
   * @returns Cost optimization data
   */
  async getCostData(): Promise<any> {
    return this.callMCPEndpoint('cost/optimization', {
      action: 'get_cost_data',
    });
  }

  /**
   * Get UX analytics data via MCP (primary) or n8n (fallback)
   * 
   * @returns UX analytics data
   */
  async getUXData(): Promise<any> {
    return this.callMCPEndpoint('ux/analytics', {
      action: 'get_ux_data',
    });
  }

  /**
   * Get AI impact assessment data via MCP (primary) or n8n (fallback)
   * 
   * @returns AI impact assessment data
   */
  async getAssessmentData(): Promise<any> {
    return this.callMCPEndpoint('ai/impact', {
      action: 'get_assessment',
    });
  }

  /**
   * Get process documentation via MCP (primary) or n8n (fallback)
   * 
   * @returns Process documentation
   */
  async getProcesses(): Promise<any> {
    return this.callMCPEndpoint('process/documentation', {
      action: 'get_processes',
    });
  }

  /**
   * Get data sources via MCP (primary) or n8n (fallback)
   * 
   * @returns Data sources
   */
  async getDataSources(): Promise<any> {
    return this.callMCPEndpoint('data/sources', {
      action: 'get_data_sources',
    });
  }

  /**
   * Get documentation via MCP (primary) or n8n (fallback)
   * 
   * @returns Documentation
   */
  async getDocumentation(params: {
    category?: string;
    limit?: number;
  } = {}): Promise<any> {
    return this.callMCPEndpoint('documentation', {
      action: 'get_documentation',
      ...params,
    });
  }

  /**
   * Call MCP server (PRIMARY - DDD-compliant data access)
   * 
   * Uses Next.js API route as proxy to keep API key server-side
   * Includes retry logic with exponential backoff per crew optimization
   * Reports progress for async operations
   * 
   * @param endpoint - MCP endpoint name
   * @param payload - Request payload
   * @returns Response data
   */
  private async callMCPEndpoint(endpoint: string, payload: any): Promise<any> {
    // Use Next.js API route as proxy (keeps API key server-side)
    const url = `/api/mcp/${endpoint}`;
    const requestId = payload.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const operationId = payload.operationId || `${endpoint}-${requestId}`;
    
    // Prevent infinite loops: Check if this request is already in progress
    const activeKey = `${endpoint}-${requestId}`;
    if (this.activeOperations.has(activeKey)) {
      console.warn(`⚠️  Preventing infinite loop: ${endpoint} already in progress (requestId: ${requestId})`);
      throw new Error(`Request already in progress: ${endpoint}`);
    }
    
    // Mark as active
    this.activeOperations.set(activeKey, { current: 0, total: this.config.retries });
    
    try {
      // Report initial progress
      this.reportProgress(operationId, 0, this.config.retries, `📡 Connecting to MCP: ${endpoint}`, 'loading');
      
      // Retry logic with exponential backoff (per crew optimization)
      for (let attempt = 1; attempt <= this.config.retries; attempt++) {
        try {
          this.reportProgress(operationId, attempt - 1, this.config.retries, `📡 Attempt ${attempt}/${this.config.retries}: ${endpoint}`, 'loading');
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Request-ID': requestId,
            },
            body: JSON.stringify({
              ...payload,
              timestamp: new Date().toISOString(),
              source: 'dashboard',
              requestId,
            }),
            signal: AbortSignal.timeout(this.config.timeout),
          });

          if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`MCP endpoint error: ${response.status} ${response.statusText} - ${errorText}`);
          }

          const data = await response.json();
          this.reportProgress(operationId, this.config.retries, this.config.retries, `✅ Retrieved: ${endpoint}`, 'complete');
          this.activeOperations.delete(activeKey);
          return data;
        } catch (error: any) {
          const isLastAttempt = attempt === this.config.retries;
          const isTimeout = error.name === 'TimeoutError' || error.message.includes('timeout');
          
          if (isLastAttempt) {
            this.activeOperations.delete(activeKey);
            this.reportProgress(operationId, this.config.retries, this.config.retries, `⚠️  MCP failed, trying fallback: ${endpoint}`, 'loading');
            console.warn(`⚠️  MCP endpoint ${endpoint} failed after ${this.config.retries} attempts (requestId: ${requestId}), trying n8n fallback:`, error.message);
            // Fallback to n8n if MCP unavailable after all retries
            return this.callN8NFallback(endpoint, payload, operationId);
          }
          
          // Exponential backoff: 1s, 2s, 4s
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          this.reportProgress(operationId, attempt, this.config.retries, `⏳ Retrying in ${backoffMs}ms: ${endpoint}`, 'loading');
          console.warn(`⚠️  MCP endpoint ${endpoint} attempt ${attempt}/${this.config.retries} failed (requestId: ${requestId}), retrying in ${backoffMs}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
      
      // Should never reach here, but TypeScript needs it
      this.activeOperations.delete(activeKey);
      return this.callN8NFallback(endpoint, payload, operationId);
    } catch (error: any) {
      // Clean up on unexpected error
      this.activeOperations.delete(activeKey);
      throw error;
    }
  }

  /**
   * Call n8n webhook (FALLBACK ONLY - when MCP unavailable)
   * 
   * @param endpoint - Webhook endpoint name
   * @param payload - Request payload
   * @param operationId - Progress operation ID
   * @returns Response data
   */
  private async callN8NFallback(endpoint: string, payload: any, operationId?: string): Promise<any> {
    const url = `${N8N_BASE_URL}/webhook/${endpoint}`;
    const requestId = payload.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fallbackOpId = operationId || `n8n-${endpoint}-${requestId}`;
    
    this.reportProgress(fallbackOpId, 0, 1, `🔄 Fallback to n8n: ${endpoint}`, 'loading');
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
        body: JSON.stringify({
          ...payload,
          timestamp: new Date().toISOString(),
          source: 'dashboard',
          fallback: true, // Indicate this is a fallback call
          requestId,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`n8n fallback error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      this.reportProgress(fallbackOpId, 1, 1, `✅ Retrieved from n8n: ${endpoint}`, 'complete');
      return { ...data, fallback: true }; // Mark as fallback response
    } catch (error: any) {
      this.reportProgress(fallbackOpId, 1, 1, `❌ Both MCP and n8n failed: ${endpoint}`, 'failed');
      console.error(`❌ Both MCP and n8n failed for ${endpoint}:`, error);
      
      // Return fallback data structure to prevent UI crashes
      return {
        error: error.message,
        data: [],
        sessions: [],
        fallback: true,
        mcpFailed: true,
        n8nFailed: true,
      };
    }
  }
}

// Singleton instance for easy import
let serviceInstance: UnifiedDataService | null = null;

export function getUnifiedDataService(): UnifiedDataService {
  if (!serviceInstance) {
    serviceInstance = new UnifiedDataService();
  }
  return serviceInstance;
}

export default UnifiedDataService;

