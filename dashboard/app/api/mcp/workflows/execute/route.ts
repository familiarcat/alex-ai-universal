/**
 * MCP Workflow Execution API
 * 
 * Execute a workflow via the MCP workflow service
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const workflow = await request.json();
    
    // Import MCP workflow service
    // Note: MCP services are in the root scripts directory
    const path = require('path');
    const rootDir = path.resolve(process.cwd(), '..');
    const { getMCPWorkflowService } = require(path.join(rootDir, 'scripts', 'utils', 'mcp-workflow-service'));
    const workflowService = getMCPWorkflowService();
    
    // Execute workflow
    const result = await workflowService.executeWorkflow(workflow);
    
    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Workflow execution error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Workflow execution failed',
      },
      { status: 500 }
    );
  }
}

