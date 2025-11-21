'use client';

/**
 * MCP Node Component
 * 
 * Custom node component for React Flow that displays MCP node types
 */

import { Handle, Position, NodeProps } from 'reactflow';
import { MCP_NODE_TYPES, MCPNodeType } from './MCPNodes';

interface MCPNodeData {
  label: string;
  type: MCPNodeType;
  config?: Record<string, any>;
}

export default function MCPNode({ data, selected }: NodeProps<MCPNodeData>) {
  const nodeType = MCP_NODE_TYPES[data.type];
  
  if (!nodeType) {
    return (
      <div className="px-4 py-3 bg-gray-200 rounded-lg border-2 border-gray-400">
        <div className="text-sm text-gray-600">Unknown Node Type</div>
      </div>
    );
  }
  
  return (
    <div
      className="px-4 py-3 rounded-lg shadow-lg min-w-[180px]"
      style={{
        background: nodeType.color,
        color: 'white',
        border: selected ? '2px solid #fff' : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      <div className="font-bold text-sm mb-1">{nodeType.label}</div>
      <div className="text-xs opacity-80 mb-2">{data.label || nodeType.description}</div>
      
      {nodeType.category && (
        <div className="text-xs opacity-60 uppercase tracking-wide">
          {nodeType.category}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  );
}

