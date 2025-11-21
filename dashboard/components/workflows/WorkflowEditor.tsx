'use client';

/**
 * Workflow Editor Component
 * 
 * Main React Flow editor for creating and editing MCP workflows
 */

import React, { useCallback, useState } from 'react';
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
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import MCPNode from './MCPNode';
import { MCP_NODE_TYPES, MCPNodeType } from './MCPNodes';

const nodeTypes = {
  mcpNode: MCPNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'mcpNode',
    data: { 
      label: 'Start',
      type: 'memoryStore' as MCPNodeType,
    },
    position: { x: 250, y: 50 },
  },
];

const initialEdges: Edge[] = [];

export default function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState('New Workflow');

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback((nodeType: MCPNodeType) => {
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'mcpNode',
      data: {
        label: MCP_NODE_TYPES[nodeType].label,
        type: nodeType,
      },
      position: {
        x: Math.random() * 400 + 100,
        y: Math.random() * 400 + 100,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  const saveWorkflow = useCallback(async () => {
    const workflow = {
      name: workflowName,
      nodes,
      edges,
    };
    
    try {
      const response = await fetch('/api/mcp/workflows/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workflow),
      });
      
      if (response.ok) {
        alert('Workflow saved successfully!');
      } else {
        alert('Failed to save workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      alert('Error saving workflow');
    }
  }, [workflowName, nodes, edges]);

  const executeWorkflow = useCallback(async () => {
    try {
      const response = await fetch('/api/mcp/workflows/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      
      const result = await response.json();
      console.log('Workflow execution result:', result);
      alert('Workflow executed! Check console for results.');
    } catch (error) {
      console.error('Error executing workflow:', error);
      alert('Error executing workflow');
    }
  }, [nodes, edges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background />
        <MiniMap />
        
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-lg">
          <div className="mb-4">
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Workflow Name"
            />
          </div>
          
          <div className="flex gap-2 mb-4">
            <button
              onClick={saveWorkflow}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={executeWorkflow}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Execute
            </button>
          </div>
          
          <div className="border-t pt-4">
            <div className="text-sm font-semibold mb-2">Add Node:</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(MCP_NODE_TYPES).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => addNode(key as MCPNodeType)}
                  className="px-3 py-2 text-xs rounded-md text-white hover:opacity-80"
                  style={{ background: config.color }}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

