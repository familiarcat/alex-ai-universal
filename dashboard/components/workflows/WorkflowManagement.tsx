'use client';

/**
 * Workflow Management Component
 * 
 * Dashboard for managing workflows: list, search, filter, delete, duplicate
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  metadata?: {
    createdAt: string;
    updatedAt: string;
    version: number;
    tags: string[];
    category: string;
  };
}

export default function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mcp/workflows/storage');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch(`/api/mcp/workflows/storage?id=${workflowId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        loadWorkflows();
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      alert('Failed to delete workflow');
    }
  };

  const duplicateWorkflow = async (workflow: Workflow) => {
    try {
      const response = await fetch('/api/mcp/workflows/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...workflow,
          name: `${workflow.name} (Copy)`,
          id: undefined
        })
      });
      
      if (response.ok) {
        loadWorkflows();
      }
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      alert('Failed to duplicate workflow');
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         workflow.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || 
                           workflow.metadata?.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(workflows.map(w => w.metadata?.category).filter(Boolean))];

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      background: 'var(--card)',
      borderRadius: 'var(--radius)',
      border: 'var(--border)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)'
      }}>
        <h2 style={{
          fontSize: 'var(--font-xl)',
          color: 'var(--accent)',
          margin: 0
        }}>
          📋 Workflow Management
        </h2>
        <Link
          href="/workflows"
          style={{
            padding: 'var(--spacing-sm) var(--spacing-md)',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent)',
            color: 'var(--text-on-accent)',
            textDecoration: 'none',
            fontSize: 'var(--font-sm)'
          }}
        >
          + New Workflow
        </Link>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-md)'
      }}>
        <input
          type="text"
          placeholder="Search workflows..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            background: 'var(--background)',
            color: 'var(--text)'
          }}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: 'var(--spacing-xs) var(--spacing-sm)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border)',
            background: 'var(--background)',
            color: 'var(--text)'
          }}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Workflow List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          Loading workflows...
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)', color: 'var(--text-muted)' }}>
          {workflows.length === 0 ? 'No workflows yet. Create your first workflow!' : 'No workflows match your search.'}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 'var(--spacing-md)'
        }}>
          {filteredWorkflows.map(workflow => (
            <div
              key={workflow.id}
              style={{
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-sm)',
                border: 'var(--border)',
                background: 'var(--background)'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: 'var(--spacing-sm)'
              }}>
                <h3 style={{
                  fontSize: 'var(--font-md)',
                  color: 'var(--text)',
                  margin: 0
                }}>
                  {workflow.name}
                </h3>
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-xs)'
                }}>
                  <button
                    onClick={() => duplicateWorkflow(workflow)}
                    style={{
                      padding: 'var(--spacing-xs)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--font-sm)',
                      color: 'var(--accent)'
                    }}
                    title="Duplicate"
                  >
                    📋
                  </button>
                  <button
                    onClick={() => deleteWorkflow(workflow.id)}
                    style={{
                      padding: 'var(--spacing-xs)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 'var(--font-sm)',
                      color: 'var(--status-error)'
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {workflow.description && (
                <p style={{
                  fontSize: 'var(--font-sm)',
                  color: 'var(--text-muted)',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  {workflow.description}
                </p>
              )}

              {workflow.metadata && (
                <div style={{
                  fontSize: 'var(--font-xs)',
                  color: 'var(--text-muted)',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  <div>Updated: {new Date(workflow.metadata.updatedAt).toLocaleDateString()}</div>
                  {workflow.metadata.tags && workflow.metadata.tags.length > 0 && (
                    <div style={{ marginTop: 'var(--spacing-xs)' }}>
                      {workflow.metadata.tags.map(tag => (
                        <span
                          key={tag}
                          style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            marginRight: '4px',
                            borderRadius: '4px',
                            background: 'var(--accent-light)',
                            color: 'var(--accent)',
                            fontSize: '10px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Link
                href={`/workflows?id=${workflow.id}`}
                style={{
                  display: 'inline-block',
                  padding: 'var(--spacing-xs) var(--spacing-sm)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--accent)',
                  color: 'var(--text-on-accent)',
                  textDecoration: 'none',
                  fontSize: 'var(--font-sm)'
                }}
              >
                Open Workflow
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

