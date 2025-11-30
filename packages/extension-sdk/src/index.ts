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
}

export class AlexAIExtensionSDK {
  constructor(private config: ExtensionConfig) {}

  async sendToDashboard(endpoint: string, payload: unknown): Promise<unknown> {
    // Implementation
  }

  async getFromDashboard(endpoint: string): Promise<unknown> {
    // Implementation
  }

  async syncWithSupabase(data: unknown): Promise<void> {
    // Implementation
  }
}
