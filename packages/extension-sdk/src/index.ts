/**
 * Alex AI Unified Extension SDK
 * 
 * Provides unified interface for all IDE extensions to communicate
 * with dashboard system (UI -> Controller -> Supabase)
 */

export interface ExtensionConfig {
  mcpUrl?: string;
  n8nUrl?: string;
  supabaseUrl?: string;
  openRouterUrl?: string;
  apiKey?: string;
}

export interface DashboardResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  status: 'live' | 'mock' | 'loading' | 'error';
}

export class AlexAIExtensionSDK {
  private config: ExtensionConfig;
  
  constructor(config: ExtensionConfig) {
    this.config = config;
  }
  
  /**
   * Send data to dashboard via API Gateway
   */
  async sendToDashboard<T = unknown>(
    endpoint: string,
    payload: unknown
  ): Promise<DashboardResponse<T>> {
    try {
      const url = `${this.config.n8nUrl || ''}/webhook/${endpoint}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey || ''}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data as T,
        status: 'live'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }
  
  /**
   * Get data from dashboard
   */
  async getFromDashboard<T = unknown>(
    endpoint: string
  ): Promise<DashboardResponse<T>> {
    try {
      const url = `${this.config.n8nUrl || ''}/webhook/${endpoint}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey || ''}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data as T,
        status: 'live'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error'
      };
    }
  }
  
  /**
   * Sync with Supabase via controller layer
   */
  async syncWithSupabase(
    table: string,
    data: unknown
  ): Promise<DashboardResponse> {
    return this.sendToDashboard(`supabase/${table}`, data);
  }
  
  /**
   * Get crew coordination
   */
  async getCrewCoordination(query: string): Promise<DashboardResponse> {
    return this.sendToDashboard('crew/coordinate', { query });
  }
  
  /**
   * Store memory in RAG system
   */
  async storeMemory(content: string, metadata?: Record<string, unknown>): Promise<DashboardResponse> {
    return this.sendToDashboard('rag/store', { content, metadata });
  }
}

// Export singleton instance factory
export function createSDK(config: ExtensionConfig): AlexAIExtensionSDK {
  return new AlexAIExtensionSDK(config);
}
