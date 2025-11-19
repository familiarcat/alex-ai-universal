import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Inline converter class for Next.js compatibility
class N8NToMermaidConverter {
  private nodeIdMap: Map<string, string> = new Map();
  private nodeCounter: number = 0;

  convert(workflow: any): string {
    if (!workflow || !workflow.nodes) {
      throw new Error('Invalid n8n workflow: missing nodes');
    }

    this.nodeIdMap.clear();
    this.nodeCounter = 0;

    let mermaid = 'graph TD\n';
    mermaid += this.processNodes(workflow.nodes);
    mermaid += this.processConnections(workflow.connections, workflow.nodes);
    mermaid += this.addStyling(workflow.nodes);

    return mermaid.trim();
  }

  private processNodes(nodes: any[]): string {
    let result = '';
    nodes.forEach(node => {
      const mermaidId = this.getMermaidId(node);
      const nodeLabel = this.getNodeLabel(node);
      const { openShape, closeShape } = this.getNodeShape(node);
      result += `    ${mermaidId}${openShape}${nodeLabel}${closeShape}\n`;
    });
    return result;
  }

  private getMermaidId(node: any): string {
    if (this.nodeIdMap.has(node.id)) {
      return this.nodeIdMap.get(node.id)!;
    }
    const cleanName = node.name
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^_+|_+$/g, '')
      .substring(0, 20) || `Node${this.nodeCounter++}`;
    const mermaidId = cleanName.charAt(0).toLowerCase() + cleanName.slice(1);
    this.nodeIdMap.set(node.id, mermaidId);
    return mermaidId;
  }

  private getNodeLabel(node: any): string {
    return node.name
      .replace(/"/g, '&quot;')
      .replace(/\n/g, ' ')
      .trim();
  }

  private getNodeShape(node: any): { openShape: string; closeShape: string } {
    const type = node.type || '';
    if (type.includes('trigger') || type.includes('webhook') || type.includes('cron')) {
      return { openShape: '((("', closeShape: '"))' };
    }
    if (type.includes('if') || type.includes('switch') || type.includes('condition')) {
      return { openShape: '{"', closeShape: '}"' };
    }
    if (type.includes('error') || type.includes('catch')) {
      return { openShape: '>"', closeShape: '"<' };
    }
    return { openShape: '["', closeShape: '"]' };
  }

  private processConnections(connections: any, nodes: any[]): string {
    if (!connections) return '\n';
    let result = '\n';
    const nodeNameToId = new Map<string, string>();
    nodes.forEach(node => {
      nodeNameToId.set(node.name, node.id);
    });

    Object.entries(connections).forEach(([nodeName, connectionData]: [string, any]) => {
      const sourceNodeId = nodeNameToId.get(nodeName);
      if (!sourceNodeId) return;
      const sourceMermaidId = this.nodeIdMap.get(sourceNodeId);
      if (!sourceMermaidId) return;

      if (connectionData.main) {
        connectionData.main.forEach((outputArray: any[], outputIndex: number) => {
          outputArray.forEach((connection: any) => {
            const targetNodeId = nodeNameToId.get(connection.node);
            if (!targetNodeId) return;
            const targetMermaidId = this.nodeIdMap.get(targetNodeId);
            if (!targetMermaidId) return;

            let edge = ' --> ';
            if (connection.type === 'main' && outputArray.length > 1) {
              const condition = this.getConditionLabel(nodeName, outputIndex);
              edge = ` -->|${condition}| `;
            }
            result += `    ${sourceMermaidId}${edge}${targetMermaidId}\n`;
          });
        });
      }

      if (connectionData.error) {
        connectionData.error.forEach((errorArray: any[]) => {
          errorArray.forEach((connection: any) => {
            const targetNodeId = nodeNameToId.get(connection.node);
            if (!targetNodeId) return;
            const targetMermaidId = this.nodeIdMap.get(targetNodeId);
            if (!targetMermaidId) return;
            result += `    ${sourceMermaidId} -.->|error| ${targetMermaidId}\n`;
          });
        });
      }
    });

    return result;
  }

  private getConditionLabel(nodeName: string, outputIndex: number): string {
    const labels = ['Yes', 'No', 'True', 'False', 'Success', 'Error'];
    return labels[outputIndex] || `Output ${outputIndex + 1}`;
  }

  private addStyling(nodes: any[]): string {
    let styling = '\n';
    const triggerNodes: string[] = [];
    const actionNodes: string[] = [];
    const conditionNodes: string[] = [];
    const errorNodes: string[] = [];

    nodes.forEach(node => {
      const mermaidId = this.nodeIdMap.get(node.id);
      if (!mermaidId) return;
      const type = node.type || '';
      if (type.includes('trigger') || type.includes('webhook')) {
        triggerNodes.push(mermaidId);
      } else if (type.includes('if') || type.includes('switch') || type.includes('condition')) {
        conditionNodes.push(mermaidId);
      } else if (type.includes('error') || type.includes('catch')) {
        errorNodes.push(mermaidId);
      } else {
        actionNodes.push(mermaidId);
      }
    });

    if (triggerNodes.length > 0) {
      styling += `    classDef trigger fill:#4caf50,stroke:#2e7d32,color:#fff\n`;
      styling += `    class ${triggerNodes.join(',')} trigger\n`;
    }
    if (actionNodes.length > 0) {
      styling += `    classDef action fill:#2196f3,stroke:#1565c0,color:#fff\n`;
      styling += `    class ${actionNodes.join(',')} action\n`;
    }
    if (conditionNodes.length > 0) {
      styling += `    classDef condition fill:#ff9800,stroke:#e65100,color:#fff\n`;
      styling += `    class ${conditionNodes.join(',')} condition\n`;
    }
    if (errorNodes.length > 0) {
      styling += `    classDef error fill:#f44336,stroke:#c62828,color:#fff\n`;
      styling += `    class ${errorNodes.join(',')} error\n`;
    }

    return styling;
  }
}

/**
 * API Route: Get Mermaid diagram for n8n workflow
 * 
 * Converts n8n workflow JSON to Mermaid diagram format
 * 
 * Reviewed by: Commander Data (API) & Lt. Uhura (Integration)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;

    // Try to load workflow from n8n-workflows directory
    const workflowsDir = path.resolve(process.cwd(), '..', 'n8n-workflows');
    const workflowFiles = findWorkflowFiles(workflowsDir);
    
    // Find workflow by ID or name
    let workflowJson = null;
    for (const filePath of workflowFiles) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (content.id === workflowId || 
            content.name?.toLowerCase().includes(workflowId.toLowerCase())) {
          workflowJson = content;
          break;
        }
      } catch (error) {
        // Skip invalid JSON files
        continue;
      }
    }

    if (!workflowJson) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Convert to Mermaid
    const converter = new N8NToMermaidConverter();
    const mermaid = converter.convert(workflowJson);

    return NextResponse.json({
      workflowId,
      workflowName: workflowJson.name,
      mermaid,
      nodes: workflowJson.nodes?.length || 0,
      connections: Object.keys(workflowJson.connections || {}).length
    });

  } catch (error: any) {
    console.error('Error converting workflow to Mermaid:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert workflow' },
      { status: 500 }
    );
  }
}

function findWorkflowFiles(dir: string): string[] {
  const files: string[] = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        files.push(...findWorkflowFiles(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files;
}

