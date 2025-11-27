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
  status?: 'running' | 'success' | 'error' | 'pending';
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'running': return 'var(--status-info)'; // blue
      case 'success': return 'var(--status-success)'; // green
      case 'error': return 'var(--status-error)'; // red
      case 'pending': return 'var(--status-warning)'; // yellow
      default: return 'transparent';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running': return '⚙️';
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '';
    }
  };
  
  return (
    <div
      className="px-4 py-3 rounded-lg shadow-lg min-w-[180px] relative"
      style={{
        background: nodeType.color,
        color: 'white',
        border: selected ? '2px solid #fff' : data.status ? `2px solid ${getStatusColor(data.status)}` : 'none',
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      
      {/* Status Indicator */}
      {data.status && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: getStatusColor(data.status),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px'
          }}
          title={data.status.toUpperCase()}
        >
          {getStatusIcon(data.status)}
        </div>
      )}
      
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

