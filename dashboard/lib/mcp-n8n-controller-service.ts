/**
 * 🖖 MCP-N8N Controller Service for Dashboard
 * 
 * Provides dashboard integration with the MCP-N8N controller.
 * Maintains DDD architecture: Client => Controller (MCP <-> n8n) => Data Layer
 * 
 * This service wraps the MCP-N8N controller for use in Next.js API routes.
 */

// Dynamic import to handle both package and direct path scenarios
let controllerModule: any = null;

async function getControllerModule() {
  if (controllerModule) {
    return controllerModule;
  }

  try {
    // Try package import first
    controllerModule = await import('@alex-ai/core/controller/mcp-n8n-controller');
    return controllerModule;
  } catch (error) {
    // Fallback to direct path
    const path = require('path');
    const controllerPath = path.join(process.cwd(), 'packages', 'core', 'src', 'controller', 'mcp-n8n-controller');
    controllerModule = require(controllerPath);
    return controllerModule;
  }
}

/**
 * Get or create controller instance
 */
export async function getMCPN8NController() {
  const module = await getControllerModule();
  const { createMCPN8NController } = module;

  const config = {
    mcpUrl: process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com',
    mcpApiKey: process.env.MCP_API_KEY || process.env.NEXT_PUBLIC_MCP_API_KEY,
    n8nUrl: process.env.N8N_URL || process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com',
    n8nApiKey: process.env.N8N_API_KEY || process.env.NEXT_PUBLIC_N8N_API_KEY,
    timeout: 30000,
    enableFallback: true,
  };

  return createMCPN8NController(config);
}

/**
 * Execute crew workflow via controller
 * DDD Flow: Client => Controller (MCP <-> n8n) => Supabase
 */
export async function executeCrewWorkflow(
  request: any
): Promise<any> {
  const controller = await getMCPN8NController();
  return await controller.executeCrewWorkflow(request);
}

/**
 * Execute MCP tool directly
 */
export async function executeMCPTool(
  tool: string,
  parameters: Record<string, any>
): Promise<any> {
  const controller = await getMCPN8NController();
  return await controller.executeMCPTool(tool, parameters);
}

/**
 * Trigger n8n workflow
 */
export async function triggerN8NWorkflow(
  workflowPath: string,
  payload: Record<string, any>
): Promise<any> {
  const controller = await getMCPN8NController();
  return await controller.triggerN8NWorkflow(workflowPath, payload);
}

/**
 * Check system health
 */
export async function checkControllerHealth() {
  const controller = await getMCPN8NController();
  return await controller.checkHealth();
}

/**
 * List available MCP tools
 */
export async function listMCPTools(): Promise<string[]> {
  const controller = await getMCPN8NController();
  return await controller.listMCPTools();
}

/**
 * Get MCP tool schema
 */
export async function getMCPToolSchema(tool: string): Promise<any> {
  const controller = await getMCPN8NController();
  return await controller.getMCPToolSchema(tool);
}

/**
 * Clear controller instance (for testing or reconfiguration)
 */
export function clearControllerInstance(): void {
  controllerModule = null;
}
