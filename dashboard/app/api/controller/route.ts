/**
 * MCP-N8N Controller API
 * 
 * Provides API access to the MCP-N8N controller for dashboard operations.
 * Maintains DDD architecture: Client => Controller (MCP <-> n8n) => Data Layer
 * 
 * Endpoints:
 * - GET /api/controller/health - Check controller health
 * - POST /api/controller/execute - Execute crew workflow
 * - POST /api/controller/mcp-tool - Execute MCP tool
 * - POST /api/controller/n8n-workflow - Trigger n8n workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  executeCrewWorkflow,
  executeMCPTool,
  triggerN8NWorkflow,
  checkControllerHealth,
  listMCPTools,
  getMCPToolSchema,
} from '@/lib/mcp-n8n-controller-service';
import { withSecurity } from '@/lib/security/api-security';

/**
 * Health check endpoint
 */
async function healthHandler(request: NextRequest) {
  try {
    const health = await checkControllerHealth();
    return NextResponse.json({
      success: true,
      health,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

/**
 * Execute crew workflow
 */
async function executeHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await executeCrewWorkflow(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * Execute MCP tool
 */
async function mcpToolHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { tool, parameters } = body;
    
    if (!tool) {
      return NextResponse.json({
        success: false,
        error: 'Tool name is required',
      }, { status: 400 });
    }

    const result = await executeMCPTool(tool, parameters || {});
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * Trigger n8n workflow
 */
async function n8nWorkflowHandler(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowPath, payload } = body;
    
    if (!workflowPath) {
      return NextResponse.json({
        success: false,
        error: 'Workflow path is required',
      }, { status: 400 });
    }

    const result = await triggerN8NWorkflow(workflowPath, payload || {});
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * List MCP tools
 */
async function listToolsHandler(request: NextRequest) {
  try {
    const tools = await listMCPTools();
    return NextResponse.json({
      success: true,
      tools,
      count: tools.length,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

/**
 * Get MCP tool schema
 */
async function toolSchemaHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tool = searchParams.get('tool');
    
    if (!tool) {
      return NextResponse.json({
        success: false,
        error: 'Tool name is required',
      }, { status: 400 });
    }

    const schema = await getMCPToolSchema(tool);
    return NextResponse.json({
      success: true,
      tool,
      schema,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}

// Export handlers with security middleware
export const GET = withSecurity(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'health':
      return healthHandler(request);
    case 'tools':
      return listToolsHandler(request);
    case 'schema':
      return toolSchemaHandler(request);
    default:
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use ?action=health|tools|schema',
      }, { status: 400 });
  }
}, {
  rateLimit: { maxRequests: 30, windowMs: 60000 },
  requireAuth: false,
  sanitizeErrors: true,
});

export const POST = withSecurity(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  switch (action) {
    case 'execute':
      return executeHandler(request);
    case 'mcp-tool':
      return mcpToolHandler(request);
    case 'n8n-workflow':
      return n8nWorkflowHandler(request);
    default:
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use ?action=execute|mcp-tool|n8n-workflow',
      }, { status: 400 });
  }
}, {
  rateLimit: { maxRequests: 20, windowMs: 60000 },
  requireAuth: false,
  sanitizeErrors: true,
});
