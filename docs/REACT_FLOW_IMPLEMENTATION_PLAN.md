# React Flow MCP Dashboard Implementation Plan

**Date:** January 20, 2025  
**Status:** 📋 Planning  
**Goal:** Build custom workflow editor UI using React Flow for MCP controller layer

## 🎯 Overview

Build a visual workflow editor integrated into our Next.js dashboard using React Flow, replacing the n8n UI functionality.

## 📦 Dependencies

```bash
npm install @xyflow/react
npm install @xyflow/core
```

## 🏗️ Architecture

### Component Structure

```
dashboard/
├── app/
│   └── workflows/
│       └── page.tsx              # Workflow editor page
├── components/
│   └── workflows/
│       ├── WorkflowEditor.tsx   # Main editor component
│       ├── MCPNodes.tsx          # MCP node definitions
│       ├── NodeTypes.tsx         # Custom node types
│       └── WorkflowToolbar.tsx   # Editor toolbar
└── lib/
    └── mcp-workflow-ui.ts        # MCP workflow UI utilities
```

## 🔧 Implementation Steps

### Step 1: Basic React Flow Setup

**File:** `dashboard/components/workflows/WorkflowEditor.tsx`

```typescript
'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 5 },
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
```

### Step 2: MCP Node Types

**File:** `dashboard/components/workflows/MCPNodes.tsx`

```typescript
import { Node, NodeTypes } from '@xyflow/react';

export const MCP_NODE_TYPES = {
  // Memory Operations
  memoryStore: {
    label: 'Store Memory',
    color: '#3b82f6',
    category: 'memory',
  },
  memoryQuery: {
    label: 'Query Memory',
    color: '#10b981',
    category: 'memory',
  },
  
  // Workflow Operations
  workflowExecute: {
    label: 'Execute Workflow',
    color: '#8b5cf6',
    category: 'workflow',
  },
  workflowSchedule: {
    label: 'Schedule Workflow',
    color: '#f59e0b',
    category: 'workflow',
  },
  
  // LLM Operations
  llmCall: {
    label: 'LLM Call',
    color: '#ef4444',
    category: 'llm',
  },
  
  // Supabase Operations
  supabaseQuery: {
    label: 'Supabase Query',
    color: '#06b6d4',
    category: 'database',
  },
  supabaseInsert: {
    label: 'Supabase Insert',
    color: '#06b6d4',
    category: 'database',
  },
};

export type MCPNodeType = keyof typeof MCP_NODE_TYPES;
```

### Step 3: Custom Node Components

**File:** `dashboard/components/workflows/NodeTypes.tsx`

```typescript
'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { MCP_NODE_TYPES, MCPNodeType } from './MCPNodes';

interface CustomNodeData {
  label: string;
  type: MCPNodeType;
  config?: Record<string, any>;
}

export function MCPNode({ data, selected }: NodeProps<CustomNodeData>) {
  const nodeType = MCP_NODE_TYPES[data.type];
  
  return (
    <div
      style={{
        background: nodeType.color,
        color: 'white',
        padding: '10px',
        borderRadius: '8px',
        minWidth: '150px',
        border: selected ? '2px solid #fff' : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div style={{ fontWeight: 'bold' }}>{nodeType.label}</div>
      <div style={{ fontSize: '12px', opacity: 0.8 }}>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

### Step 4: Workflow Execution Integration

**File:** `dashboard/lib/mcp-workflow-ui.ts`

```typescript
import { Node, Edge } from '@xyflow/react';
import { MCPNodeType } from '@/components/workflows/MCPNodes';

export interface WorkflowDefinition {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: string;
  updatedAt: string;
}

export async function executeWorkflow(workflow: WorkflowDefinition) {
  // Convert React Flow nodes/edges to MCP workflow format
  const mcpWorkflow = convertToMCPFormat(workflow);
  
  // Execute via MCP service
  const response = await fetch('/api/mcp/workflows/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(mcpWorkflow),
  });
  
  return response.json();
}

function convertToMCPFormat(workflow: WorkflowDefinition) {
  // Convert React Flow format to MCP workflow format
  return {
    name: workflow.name,
    steps: workflow.nodes.map(node => ({
      id: node.id,
      type: node.data.type,
      config: node.data.config,
      next: workflow.edges
        .filter(e => e.source === node.id)
        .map(e => e.target),
    })),
  };
}
```

### Step 5: Dashboard Integration

**File:** `dashboard/app/workflows/page.tsx`

```typescript
'use client';

import dynamic from 'next/dynamic';
import WorkflowEditor from '@/components/workflows/WorkflowEditor';

export default function WorkflowsPage() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <WorkflowEditor />
    </div>
  );
}
```

## 🎨 UI Features

### Workflow Editor Features
- ✅ Visual node-based editor
- ✅ Drag-and-drop nodes
- ✅ Connect nodes with edges
- ✅ Node configuration panels
- ✅ Workflow validation
- ✅ Save/load workflows
- ✅ Execute workflows
- ✅ Execution history

### Node Library
- Memory operations (store, query)
- Workflow operations (execute, schedule)
- LLM operations (call, optimize)
- Database operations (query, insert)
- Conditional logic (if/else, loops)
- Data transformation

## 🔌 MCP Integration

### API Routes

**File:** `dashboard/app/api/mcp/workflows/execute/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getMCPWorkflowService } from '@/scripts/utils/mcp-workflow-service';

export async function POST(request: NextRequest) {
  const workflow = await request.json();
  
  const workflowService = getMCPWorkflowService();
  const result = await workflowService.executeWorkflow(workflow);
  
  return NextResponse.json(result);
}
```

## 📋 Implementation Checklist

### Phase 1: Basic Setup
- [ ] Install React Flow dependencies
- [ ] Create WorkflowEditor component
- [ ] Add to dashboard routes
- [ ] Basic node rendering

### Phase 2: MCP Integration
- [ ] Create MCP node types
- [ ] Build custom node components
- [ ] Connect to MCP services
- [ ] Add workflow execution

### Phase 3: Advanced Features
- [ ] Workflow validation
- [ ] Error handling
- [ ] Execution history
- [ ] Workflow templates
- [ ] Node configuration panels

### Phase 4: Polish
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Documentation
- [ ] Testing

## 🚀 Timeline

- **Week 1:** Basic setup + MCP integration
- **Week 2:** Advanced features + polish

**Total:** 1-2 weeks for complete solution

---

**Status:** 📋 Planning  
**Next Action:** Begin Phase 1 implementation

