'use client';

/**
 * N8N Workflow Bento Component
 * 
 * Bento-styled grid layout for n8n workflow visualization
 * Integrates with global theme system and dashboard controls
 * 
 * Crew Collaboration:
 * - Counselor Troi: Visual hierarchy and UX design
 * - Commander Data: Technical implementation and optimization
 * - Lieutenant Uhura: Integration with n8n workflows
 * - Lieutenant Commander La Forge: Theme system integration
 * - Commander Riker: Layout and component structure
 * - Captain Picard: Strategic component design
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useAppState } from '@/lib/state-manager';
import Mermaid from '@/components/Mermaid';
import { getThemeColors } from '@/lib/theme-colors';

interface WorkflowCard {
  id: string;
  name: string;
  mermaid?: string;
  status?: 'active' | 'inactive' | 'error';
  lastExecuted?: string;
  executionCount?: number;
  errorRate?: number;
}

interface N8NWorkflowBentoProps {
  workflows?: WorkflowCard[];
  onWorkflowSelect?: (workflowId: string) => void;
  showControls?: boolean;
}

// Bento grid sizes - responsive and theme-aware
const BENTO_SIZES = {
  small: { gridColumn: 'span 1', gridRow: 'span 1', minHeight: '200px' },
  medium: { gridColumn: 'span 2', gridRow: 'span 1', minHeight: '200px' },
  large: { gridColumn: 'span 2', gridRow: 'span 2', minHeight: '400px' },
  wide: { gridColumn: 'span 3', gridRow: 'span 1', minHeight: '200px' },
  tall: { gridColumn: 'span 1', gridRow: 'span 2', minHeight: '400px' }
};

function WorkflowBentoCard({ 
  workflow, 
  onSelect,
  theme 
}: { 
  workflow: WorkflowCard; 
  onSelect?: (id: string) => void;
  theme: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [mermaidCode, setMermaidCode] = useState<string | null>(workflow.mermaid || null);
  const colors = getThemeColors(theme);
  
  // Determine card size based on workflow complexity
  const cardSize = useMemo(() => {
    if (workflow.executionCount && workflow.executionCount > 1000) return BENTO_SIZES.large;
    if (workflow.mermaid && workflow.mermaid.length > 500) return BENTO_SIZES.medium;
    return BENTO_SIZES.small;
  }, [workflow]);

  // Load Mermaid diagram if not provided
  useEffect(() => {
    if (!mermaidCode && workflow.id) {
      loadWorkflowDiagram(workflow.id);
    }
  }, [workflow.id, mermaidCode]);

  async function loadWorkflowDiagram(workflowId: string) {
    setIsLoading(true);
    try {
      // Fetch workflow from n8n API and convert to Mermaid
      const response = await fetch(`/api/workflows/${workflowId}/mermaid`);
      if (response.ok) {
        const data = await response.json();
        setMermaidCode(data.mermaid);
      }
    } catch (error) {
      console.error('Failed to load workflow diagram:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const statusColor = workflow.status === 'active' 
    ? 'var(--accent)' 
    : workflow.status === 'error' 
    ? '#f44336' 
    : 'var(--text-muted)';

  return (
    <div
      className="card"
      onClick={() => onSelect?.(workflow.id)}
      style={{
        ...cardSize,
        padding: 'var(--spacing-lg)',
        borderRadius: 'var(--radius)',
        border: 'var(--border)',
        background: 'var(--card)',
        backdropFilter: 'blur(var(--blur))',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all var(--transition-base)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Status Indicator */}
      <div style={{
        position: 'absolute',
        top: 'var(--spacing-sm)',
        right: 'var(--spacing-sm)',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: statusColor,
        boxShadow: `0 0 8px ${statusColor}`
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 'var(--spacing-sm)'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 'var(--font-lg)',
            fontWeight: 600,
            color: 'var(--heading)',
            marginBottom: 'var(--spacing-xs)',
            lineHeight: 1.2
          }}>
            {workflow.name}
          </h3>
          {workflow.lastExecuted && (
            <p style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
              margin: 0
            }}>
              Last: {new Date(workflow.lastExecuted).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Metrics Bar */}
      {(workflow.executionCount !== undefined || workflow.errorRate !== undefined) && (
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-md)',
          padding: 'var(--spacing-sm)',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)'
        }}>
          {workflow.executionCount !== undefined && (
            <div style={{ color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {workflow.executionCount.toLocaleString()}
              </span>{' '}
              executions
            </div>
          )}
          {workflow.errorRate !== undefined && (
            <div style={{ color: 'var(--text-muted)' }}>
              <span style={{ 
                color: workflow.errorRate > 10 ? '#f44336' : 'var(--accent)', 
                fontWeight: 600 
              }}>
                {workflow.errorRate.toFixed(1)}%
              </span>{' '}
              error rate
            </div>
          )}
        </div>
      )}

      {/* Mermaid Diagram */}
      <div style={{
        flex: 1,
        minHeight: '150px',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-sm)',
        padding: 'var(--spacing-md)',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {isLoading ? (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: 'var(--font-sm)'
          }}>
            Loading diagram...
          </div>
        ) : mermaidCode ? (
          <Mermaid chart={mermaidCode} theme="dark" />
        ) : (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: 'var(--font-sm)',
            textAlign: 'center'
          }}>
            No diagram available
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        justifyContent: 'flex-end',
        paddingTop: 'var(--spacing-sm)',
        borderTop: 'var(--border)'
      }}>
        <button
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            background: 'transparent',
            border: '1px solid var(--accent)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--accent)',
            fontSize: 'var(--font-xs)',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
            e.currentTarget.style.color = colors.background;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(workflow.id);
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default function N8NWorkflowBento({ 
  workflows = [],
  onWorkflowSelect,
  showControls = true
}: N8NWorkflowBentoProps) {
  const { globalTheme } = useAppState();
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'executions' | 'recent'>('recent');

  // Filter and sort workflows
  const filteredWorkflows = useMemo(() => {
    let filtered = workflows.filter(w => {
      if (filter === 'all') return true;
      return w.status === filter;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'executions':
          return (b.executionCount || 0) - (a.executionCount || 0);
        case 'recent':
          const aTime = a.lastExecuted ? new Date(a.lastExecuted).getTime() : 0;
          const bTime = b.lastExecuted ? new Date(b.lastExecuted).getTime() : 0;
          return bTime - aTime;
        default:
          return 0;
      }
    });

    return filtered;
  }, [workflows, filter, sortBy]);

  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    onWorkflowSelect?.(workflowId);
  };

  // Default workflows if none provided (for demo)
  const displayWorkflows = filteredWorkflows.length > 0 
    ? filteredWorkflows 
    : [
        {
          id: 'demo-1',
          name: 'Crew Memory Storage Workflow',
          status: 'active' as const,
          executionCount: 1523,
          errorRate: 2.1,
          lastExecuted: new Date().toISOString(),
          mermaid: `graph TD
    webhook((("Webhook Trigger"))
    processor["Memory Processor"]
    check["Duplicate Check"]
    condition{"If No Duplicate"}
    storage["Supabase Storage"]
    
    webhook --> processor
    processor --> check
    check --> condition
    condition -->|Yes| storage
    condition -->|No| update`
        }
      ];

  return (
    <div className="dashboard-theme-wrapper" style={{
      width: '100%'
    }}>
      {/* Controls */}
      {showControls && (
        <div className="card" style={{
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius)',
          border: 'var(--border)',
          background: 'var(--card)',
          marginBottom: 'var(--spacing-lg)',
          display: 'flex',
          gap: 'var(--spacing-md)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <label style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              Filter:
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                background: 'var(--card-alt)',
                border: 'var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: 'var(--font-sm)'
              }}
            >
              <option value="all">All Workflows</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
            <label style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)' }}>
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: 'var(--spacing-xs) var(--spacing-sm)',
                background: 'var(--card-alt)',
                border: 'var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text)',
                fontSize: 'var(--font-sm)'
              }}
            >
              <option value="recent">Most Recent</option>
              <option value="executions">Most Executions</option>
              <option value="name">Name</option>
            </select>
          </div>

          <div style={{ 
            marginLeft: 'auto', 
            fontSize: 'var(--font-sm)', 
            color: 'var(--text-muted)' 
          }}>
            {displayWorkflows.length} workflow{displayWorkflows.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Bento Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 'var(--spacing-lg)',
        width: '100%'
      }}>
        {displayWorkflows.map((workflow) => (
          <WorkflowBentoCard
            key={workflow.id}
            workflow={workflow}
            onSelect={handleWorkflowSelect}
            theme={globalTheme}
          />
        ))}
      </div>

      {/* Selected Workflow Modal (optional) */}
      {selectedWorkflow && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 'var(--spacing-xl)'
          }}
          onClick={() => setSelectedWorkflow(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              padding: 'var(--spacing-xl)',
              borderRadius: 'var(--radius-lg)',
              border: 'var(--border)',
              background: 'var(--card)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedWorkflow(null)}
              style={{
                position: 'absolute',
                top: 'var(--spacing-md)',
                right: 'var(--spacing-md)',
                padding: 'var(--spacing-xs)',
                background: 'transparent',
                border: 'none',
                color: 'var(--text)',
                fontSize: 'var(--font-xl)',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              ×
            </button>
            <h2 style={{ 
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--accent)'
            }}>
              {displayWorkflows.find(w => w.id === selectedWorkflow)?.name}
            </h2>
            {/* Workflow details would go here */}
          </div>
        </div>
      )}
    </div>
  );
}

