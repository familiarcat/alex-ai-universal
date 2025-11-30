/**
 * MCP Workflow Save API
 * 
 * Save a workflow definition
 */

import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const WORKFLOWS_DIR = path.join(process.cwd(), 'workflows');

export async function POST(request: NextRequest) {
  try {
    const workflow = await request.json();
    
    // Ensure workflows directory exists
    await fs.mkdir(WORKFLOWS_DIR, { recursive: true });
    
    // Generate workflow ID if not provided
    const workflowId = workflow.id || `workflow-${Date.now()}`;
    const workflowFile = path.join(WORKFLOWS_DIR, `${workflowId}.json`);
    
    // Save workflow
    const workflowData = {
      ...workflow,
      id: workflowId,
      updatedAt: new Date().toISOString(),
      createdAt: workflow.createdAt || new Date().toISOString(),
    };
    
    await fs.writeFile(workflowFile, JSON.stringify(workflowData, null, 2));
    
    return NextResponse.json({
      success: true,
      workflowId,
      message: 'Workflow saved successfully',
    });
  } catch (error: any) {
    console.error('Workflow save error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Workflow save failed',
      },
      { status: 500 }
    );
  }
}

