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

  // Track failed endpoints to prevent infinite retry loops
  private failedEndpoints: Set<string> = new Set();
  private lastFailureTime: Map<string, number> = new Map();
  private readonly FAILURE_COOLDOWN = 60000; // 1 minute cooldown after failure

  constructor(config: DataServiceConfig = {}) {
    this.config = {
      timeout: config.timeout || 15000, // Reduced to 15s to fail faster and prevent hanging
      retries: config.retries || 1, // Reduced to 1 retry to prevent infinite loops
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
    // FIXED: Added failure tracking to prevent infinite retry loops
    // Crew: Data (Analysis) & La Forge (Implementation)
    const endpointKey = `mcp:${endpoint}`;
    
    // Check if endpoint is in cooldown (recently failed)
    const lastFailure = this.lastFailureTime.get(endpointKey);
    if (lastFailure && Date.now() - lastFailure < this.FAILURE_COOLDOWN) {
      // Endpoint recently failed, skip retry and go straight to fallback
      console.warn(`⚠️  MCP endpoint ${endpoint} in cooldown, using n8n fallback immediately`);
      return this.callN8NFallback(endpoint, payload, payload.operationId);
    }
    
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
          // Clear failure tracking on success
          this.failedEndpoints.delete(endpointKey);
          this.lastFailureTime.delete(endpointKey);
          return data;
        } catch (error: any) {
          const isLastAttempt = attempt === this.config.retries;
          const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || 
                           error.message?.includes('timeout') || error.message?.includes('signal timed out');
          
          // Silently handle timeout errors (they're expected and handled with fallbacks)
          // Only log non-timeout errors to avoid console noise
          
          if (isLastAttempt) {
            this.activeOperations.delete(activeKey);
            // Mark endpoint as failed and set cooldown
            this.failedEndpoints.add(endpointKey);
            this.lastFailureTime.set(endpointKey, Date.now());
            this.reportProgress(operationId, this.config.retries, this.config.retries, `⚠️  MCP failed, trying fallback: ${endpoint}`, 'loading');
            if (!isTimeout) {
              // Only log non-timeout errors
              console.warn(`⚠️  MCP endpoint ${endpoint} failed after ${this.config.retries} attempts (requestId: ${requestId}), trying n8n fallback:`, error.message);
            }
            // Fallback to n8n if MCP unavailable after all retries
            return this.callN8NFallback(endpoint, payload, operationId);
          }
          
          // Exponential backoff: 1s, 2s, 4s
          const backoffMs = Math.pow(2, attempt - 1) * 1000;
          this.reportProgress(operationId, attempt, this.config.retries, `⏳ Retrying in ${backoffMs}ms: ${endpoint}`, 'loading');
          if (!isTimeout) {
            // Only log non-timeout errors
            console.warn(`⚠️  MCP endpoint ${endpoint} attempt ${attempt}/${this.config.retries} failed (requestId: ${requestId}), retrying in ${backoffMs}ms:`, error.message);
          }
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }
      }
      
      // Should never reach here, but TypeScript needs it
      this.activeOperations.delete(activeKey);
      // Mark endpoint as failed and set cooldown
      this.failedEndpoints.add(endpointKey);
      this.lastFailureTime.set(endpointKey, Date.now());
      return this.callN8NFallback(endpoint, payload, operationId);
    } catch (error: any) {
      // Clean up on unexpected error
      this.activeOperations.delete(activeKey);
      // Mark endpoint as failed and set cooldown
      this.failedEndpoints.add(endpointKey);
      this.lastFailureTime.set(endpointKey, Date.now());
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
    const endpointKey = `n8n:${endpoint}`;
    
    // Check if n8n endpoint is in cooldown (recently failed)
    const lastFailure = this.lastFailureTime.get(endpointKey);
    if (lastFailure && Date.now() - lastFailure < this.FAILURE_COOLDOWN) {
      // n8n also failed recently, throw error instead of infinite retry
      throw new Error(`Both MCP and n8n endpoints failed for ${endpoint}. Please check controller layer connectivity.`);
    }
    
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
      // Clear failure tracking on success
      this.failedEndpoints.delete(endpointKey);
      this.lastFailureTime.delete(endpointKey);
      return { ...data, fallback: true }; // Mark as fallback response
    } catch (error: any) {
      // Mark n8n endpoint as failed
      this.failedEndpoints.add(endpointKey);
      this.lastFailureTime.set(endpointKey, Date.now());
      
      const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || 
                       error.message?.includes('timeout') || error.message?.includes('signal timed out');
      
      this.reportProgress(fallbackOpId, 1, 1, `❌ Both MCP and n8n failed: ${endpoint}`, 'failed');
      
      // Only log non-timeout errors (timeouts are expected and handled gracefully)
      if (!isTimeout) {
        console.error(`❌ Both MCP and n8n failed for ${endpoint}:`, error);
      }
      
      // Return fallback data structure to prevent UI crashes
      return {
        error: isTimeout ? 'Request timeout' : error.message,
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

