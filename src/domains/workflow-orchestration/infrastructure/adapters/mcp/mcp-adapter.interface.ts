/**
 * MCP Adapter Interface
 * 
 * Provides abstraction for MCP server communication
 * Part of workflow-orchestration domain infrastructure
 */

export interface MCPAdapter {
  /**
   * Execute MCP tool
   */
  executeTool(toolName: string, parameters: Record<string, any>): Promise<any>;

  /**
   * List available MCP tools
   */
  listTools(): Promise<string[]>;

  /**
   * Get tool schema
   */
  getToolSchema(toolName: string): Promise<any>;

  /**
   * Check MCP server health
   */
  healthCheck(): Promise<boolean>;
}

export interface MCPConfig {
  serverUrl: string;
  apiKey?: string;
  timeout?: number;
}
