/**
 * 🖖 MCP-N8N Controller Service
 * 
 * Orchestrates communication between MCP servers and n8n workflows.
 * Implements the architecture: Client <-> Controller (MCP <-> n8n) <-> Data Layer (Supabase)
 * 
 * Architecture:
 * - MCP servers manage main controller logic
 * - n8n workflows provide extensibility and crew member integration
 * - Bidirectional communication: MCP can trigger n8n, n8n can call MCP
 * 
 * Created by: Commander Data (Architecture) & Lt. Cmdr. La Forge (Infrastructure)
 */

import { MCPAdapter, createMCPAdapter } from '../domains/workflow-orchestration/infrastructure/adapters/mcp/mcp-adapter';
import https from 'https';
import { URL } from 'url';

export interface ControllerConfig {
  mcpUrl?: string;
  mcpApiKey?: string;
  n8nUrl?: string;
  n8nApiKey?: string;
  timeout?: number;
  enableFallback?: boolean;
}

export interface ExecutionResult {
  success: boolean;
  method: 'mcp' | 'n8n' | 'fallback';
  data?: any;
  error?: string;
  metadata?: {
    executionTime: number;
    retries?: number;
  };
}

export interface CrewWorkflowRequest {
  crewMember?: string;
  workflow?: string;
  tool?: string;
  parameters?: Record<string, any>;
  context?: Record<string, any>;
}

/**
 * MCP-N8N Controller
 * 
 * Manages bidirectional communication between MCP servers and n8n workflows.
 * Provides intelligent routing and fallback mechanisms.
 */
export class MCPN8NController {
  private mcpAdapter: MCPAdapter | null = null;
  private config: Required<ControllerConfig>;
  private mcpHealthy: boolean = false;
  private n8nHealthy: boolean = false;

  constructor(config: ControllerConfig = {}) {
    this.config = {
      mcpUrl: config.mcpUrl || process.env.MCP_URL || 'https://mcp.pbradygeorgen.com',
      mcpApiKey: config.mcpApiKey || process.env.MCP_API_KEY,
      n8nUrl: config.n8nUrl || process.env.N8N_URL || 'https://n8n.pbradygeorgen.com',
      n8nApiKey: config.n8nApiKey || process.env.N8N_API_KEY,
      timeout: config.timeout || 30000,
      enableFallback: config.enableFallback !== false, // Default true
    };

    // Initialize MCP adapter
    try {
      this.mcpAdapter = createMCPAdapter({
        serverUrl: this.config.mcpUrl,
        apiKey: this.config.mcpApiKey,
        timeout: this.config.timeout,
      });
    } catch (error) {
      console.warn('⚠️  MCP adapter initialization failed:', error);
    }
  }

  /**
   * Health check for both systems
   */
  async checkHealth(): Promise<{ mcp: boolean; n8n: boolean }> {
    const startTime = Date.now();

    // Check MCP
    if (this.mcpAdapter) {
      try {
        this.mcpHealthy = await Promise.race([
          this.mcpAdapter.healthCheck(),
          new Promise<boolean>((resolve) => 
            setTimeout(() => resolve(false), 5000)
          ),
        ]);
      } catch (error) {
        this.mcpHealthy = false;
      }
    }

    // Check n8n
    try {
      this.n8nHealthy = await this.checkN8NHealth();
    } catch (error) {
      this.n8nHealthy = false;
    }

    return {
      mcp: this.mcpHealthy,
      n8n: this.n8nHealthy,
    };
  }

  /**
   * Execute via MCP (primary method)
   */
  private async executeViaMCP(
    tool: string,
    parameters: Record<string, any>
  ): Promise<any> {
    if (!this.mcpAdapter) {
      throw new Error('MCP adapter not initialized');
    }

    if (!this.mcpHealthy) {
      throw new Error('MCP server is not healthy');
    }

    return await this.mcpAdapter.executeTool(tool, parameters);
  }

  /**
   * Execute via n8n webhook (fallback/extensibility)
   */
  private async executeViaN8N(
    webhookPath: string,
    payload: Record<string, any>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const url = new URL(webhookPath, this.config.n8nUrl);
      const postData = JSON.stringify(payload);

      const options = {
        hostname: url.hostname,
        port: url.port || 443,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          ...(this.config.n8nApiKey && {
            'X-N8N-API-KEY': this.config.n8nApiKey,
          }),
        },
        timeout: this.config.timeout,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(
                new Error(
                  `n8n returned ${res.statusCode}: ${parsed.message || data}`
                )
              );
            }
          } catch (error) {
            reject(new Error(`Failed to parse n8n response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('n8n request timeout'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Check n8n health
   */
  private async checkN8NHealth(): Promise<boolean> {
    try {
      const url = new URL('/healthz', this.config.n8nUrl);
      return new Promise((resolve) => {
        const options = {
          hostname: url.hostname,
          port: url.port || 443,
          path: url.pathname,
          method: 'GET',
          timeout: 5000,
        };

        const req = https.request(options, (res) => {
          resolve(res.statusCode === 200 || res.statusCode === 204);
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });

        req.end();
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Execute crew member workflow
   * 
   * Routes to MCP first, falls back to n8n if needed.
   * Supports crew member-specific workflows that integrate with MCP.
   */
  async executeCrewWorkflow(
    request: CrewWorkflowRequest
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Ensure health status is current
    await this.checkHealth();

    // Strategy 1: Try MCP first (primary controller)
    if (this.mcpHealthy && this.mcpAdapter && request.tool) {
      try {
        const result = await this.executeViaMCP(request.tool, {
          ...request.parameters,
          crewMember: request.crewMember,
          context: request.context,
        });

        return {
          success: true,
          method: 'mcp',
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️  MCP execution failed: ${error.message}`);
      }
    }

    // Strategy 2: Try n8n workflow (fallback/extensibility)
    if (this.n8nHealthy && request.workflow) {
      try {
        const webhookPath = `/webhook/${request.workflow}`;
        const result = await this.executeViaN8N(webhookPath, {
          crewMember: request.crewMember,
          tool: request.tool,
          parameters: request.parameters,
          context: request.context,
          source: 'mcp-controller',
        });

        return {
          success: true,
          method: 'n8n',
          data: result,
          metadata: {
            executionTime: Date.now() - startTime,
          },
        };
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️  n8n execution failed: ${error.message}`);
      }
    }

    // Strategy 3: Fallback to direct Supabase if both fail
    if (this.config.enableFallback) {
      try {
        // This would be implemented based on your Supabase direct access pattern
        // For now, we'll return an error
        throw new Error('Fallback to Supabase not yet implemented');
      } catch (error: any) {
        lastError = error;
      }
    }

    // All strategies failed
    return {
      success: false,
      method: 'fallback',
      error: lastError?.message || 'All execution methods failed',
      metadata: {
        executionTime: Date.now() - startTime,
      },
    };
  }

  /**
   * Execute MCP tool (direct, no n8n involvement)
   */
  async executeMCPTool(
    tool: string,
    parameters: Record<string, any>
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    if (!this.mcpAdapter) {
      return {
        success: false,
        method: 'mcp',
        error: 'MCP adapter not initialized',
        metadata: { executionTime: Date.now() - startTime },
      };
    }

    try {
      await this.checkHealth();

      if (!this.mcpHealthy) {
        throw new Error('MCP server is not healthy');
      }

      const result = await this.executeViaMCP(tool, parameters);

      return {
        success: true,
        method: 'mcp',
        data: result,
        metadata: { executionTime: Date.now() - startTime },
      };
    } catch (error: any) {
      return {
        success: false,
        method: 'mcp',
        error: error.message,
        metadata: { executionTime: Date.now() - startTime },
      };
    }
  }

  /**
   * Trigger n8n workflow from MCP (bidirectional)
   * 
   * Allows MCP tools to trigger n8n workflows for extensibility.
   */
  async triggerN8NWorkflow(
    workflowPath: string,
    payload: Record<string, any>
  ): Promise<ExecutionResult> {
    const startTime = Date.now();

    try {
      await this.checkHealth();

      if (!this.n8nHealthy) {
        throw new Error('n8n server is not healthy');
      }

      const result = await this.executeViaN8N(workflowPath, payload);

      return {
        success: true,
        method: 'n8n',
        data: result,
        metadata: { executionTime: Date.now() - startTime },
      };
    } catch (error: any) {
      return {
        success: false,
        method: 'n8n',
        error: error.message,
        metadata: { executionTime: Date.now() - startTime },
      };
    }
  }

  /**
   * List available MCP tools
   */
  async listMCPTools(): Promise<string[]> {
    if (!this.mcpAdapter) {
      return [];
    }

    try {
      await this.checkHealth();
      if (this.mcpHealthy) {
        return await this.mcpAdapter.listTools();
      }
    } catch (error) {
      console.warn('Failed to list MCP tools:', error);
    }

    return [];
  }

  /**
   * Get MCP tool schema
   */
  async getMCPToolSchema(tool: string): Promise<any> {
    if (!this.mcpAdapter) {
      throw new Error('MCP adapter not initialized');
    }

    return await this.mcpAdapter.getToolSchema(tool);
  }
}

/**
 * Factory function to create controller instance
 */
export function createMCPN8NController(
  config?: ControllerConfig
): MCPN8NController {
  return new MCPN8NController(config);
}
