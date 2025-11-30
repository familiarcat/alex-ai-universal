'use client';

/**
 * Node Configuration Panel
 * 
 * Side panel for configuring MCP workflow nodes
 * Similar to n8n's node configuration interface
 */

import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { MCPNodeType, MCP_NODE_TYPES } from './MCPNodes';

interface NodeConfigurationPanelProps {
  node: Node | null;
  onUpdate: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export default function NodeConfigurationPanel({
  node,
  onUpdate,
  onClose
}: NodeConfigurationPanelProps) {
  const [config, setConfig] = useState<any>({});

  useEffect(() => {
    if (node) {
      setConfig(node.data.config || {});
    }
  }, [node]);

  if (!node) return null;

  const nodeType = node.data.type as MCPNodeType;
  const nodeInfo = MCP_NODE_TYPES[nodeType];

  const handleSave = () => {
    onUpdate(node.id, {
      ...node.data,
      config
    });
    onClose();
  };

  const renderConfigFields = () => {
    switch (nodeType) {
      case 'memoryStore':
        return (
          <>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                Title
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text)'
                }}
              />
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                Content
              </label>
              <textarea
                value={config.content || ''}
                onChange={(e) => setConfig({ ...config, content: e.target.value })}
                rows={5}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text)'
                }}
              />
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                Category
              </label>
              <input
                type="text"
                value={config.category || ''}
                onChange={(e) => setConfig({ ...config, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text)'
                }}
              />
            </div>
          </>
        );

      case 'memoryQuery':
        return (
          <>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                Query
              </label>
              <input
                type="text"
                value={config.query || ''}
                onChange={(e) => setConfig({ ...config, query: e.target.value })}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text)'
                }}
              />
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                Limit
              </label>
              <input
                type="number"
                value={config.limit || 10}
                onChange={(e) => setConfig({ ...config, limit: parseInt(e.target.value) })}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text)'
                }}
              />
            </div>
          </>
        );

      case 'llmCall':
        return (
          <>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                Prompt
              </label>
              <textarea
                value={config.prompt || ''}
                onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                rows={5}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text)'
                }}
              />
            </div>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--spacing-xs)' }}>
                Crew Member (for optimization)
              </label>
              <input
                type="text"
                value={config.crewMember || ''}
                onChange={(e) => setConfig({ ...config, crewMember: e.target.value })}
                placeholder="e.g., Commander Data"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-xs)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border)',
                  background: 'var(--background)',
                  color: 'var(--text)'
                }}
              />
            </div>
          </>
        );

      default:
        return (
          <div style={{ color: 'var(--text-muted)' }}>
            Configuration options for this node type coming soon.
          </div>
        );
    }
  };

  return (
    <div style={{
      position: 'fixed',
      right: 0,
      top: 0,
      width: '400px',
      height: '100vh',
      background: 'var(--card)',
      borderLeft: 'var(--border)',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-md)',
        borderBottom: 'var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          color: 'var(--accent)',
          margin: 0
        }}>
          {nodeInfo.label}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 'var(--font-xl)',
            cursor: 'pointer',
            color: 'var(--text)'
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--spacing-md)'
      }}>
        {renderConfigFields()}
      </div>

      {/* Footer */}
      <div style={{
        padding: 'var(--spacing-md)',
        borderTop: 'var(--border)',
        display: 'flex',
        gap: 'var(--spacing-sm)',
        justifyContent: 'flex-end'
      }}>
        <button
          onClick={onClose}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            background: 'var(--background)',
            color: 'var(--text)',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--accent)',
            color: 'var(--text-on-accent)',
            cursor: 'pointer'
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

