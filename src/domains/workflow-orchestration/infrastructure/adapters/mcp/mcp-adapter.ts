/**
 * MCP Adapter Implementation
 * 
 * Provides concrete implementation for MCP server communication
 * Part of workflow-orchestration domain infrastructure
 * 
 * Server: mcp.pbradygeorgen.com
 */

import { MCPAdapter, MCPConfig } from './mcp-adapter.interface';

export class MCPAdapterImpl implements MCPAdapter {
  private config: MCPConfig;
  private baseUrl: string;

  constructor(config: MCPConfig) {
    this.config = config;
    this.baseUrl = config.serverUrl.replace(//$/, '');
  }

  /**
   * Execute MCP tool
   */
  async executeTool(toolName: string, parameters: Record<string, any>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tools/${toolName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(parameters),
        signal: AbortSignal.timeout(this.config.timeout || 30000)
      });

      if (!response.ok) {
        throw new Error(`MCP tool execution failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to execute MCP tool ${toolName}: ${error.message}`);
    }
  }

  /**
   * List available MCP tools
   */
  async listTools(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tools`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to list MCP tools: ${response.statusText}`);
      }

      const data = await response.json();
      return data.tools || [];
    } catch (error: any) {
      throw new Error(`Failed to list MCP tools: ${error.message}`);
    }
  }

  /**
   * Get tool schema
   */
  async getToolSchema(toolName: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tools/${toolName}/schema`, {
        method: 'GET',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        signal: AbortSignal.timeout(this.config.timeout || 10000)
      });

      if (!response.ok) {
        throw new Error(`Failed to get tool schema: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      throw new Error(`Failed to get tool schema for ${toolName}: ${error.message}`);
    }
  }

  /**
   * Check MCP server health
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(this.config.timeout || 5000)
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

/**
 * Factory function to create MCP adapter
 */
export function createMCPAdapter(config?: Partial<MCPConfig>): MCPAdapter {
  const defaultConfig: MCPConfig = {
    serverUrl: process.env.MCP_URL || 'https://mcp.pbradygeorgen.com',
    apiKey: process.env.MCP_API_KEY,
    timeout: 30000
  };

  return new MCPAdapterImpl({ ...defaultConfig, ...config } as MCPConfig);
}
