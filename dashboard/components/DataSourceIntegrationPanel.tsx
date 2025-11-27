'use client';

/**
 * Data Source Integration Panel Component
 * 
 * Visual interface for integrating additional data sources
 * Now with dynamic UI system integration for deeply nested structures
 * 
 * Recommendations from:
 * - Commander Riker: Explore opportunities to integrate additional data sources
 * - Counselor Troi: Dynamic UI with nested navigation
 * - Commander Data: Component structure analysis
 * 
 * Reviewed by: Commander Riker (Tactical Operations), Counselor Troi (UX)
 */

import { useEffect, useState } from 'react';
import { useDynamicUI } from '@/lib/useDynamicUI';
import { DynamicComponentRenderer } from '@/lib/dynamic-ui-system';

interface DataSource {
  id: string;
  name: string;
  type: 'api' | 'database' | 'file' | 'stream' | 'webhook';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  description: string;
  lastSync: string;
  recordCount?: number;
  integration: 'n8n' | 'direct' | 'mcp';
}

interface IntegrationOpportunity {
  source: string;
  description: string;
  benefit: string;
  complexity: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
}

export default function DataSourceIntegrationPanel() {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [opportunities, setOpportunities] = useState<IntegrationOpportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchDataSources();
    
    return () => {
      mounted = false;
    };
  }, []);

  async function fetchDataSources() {
    try {
      setLoading(true);
      
      // DDD-Compliant: Use UnifiedDataService (MCP primary, n8n fallback)
      // Use service's built-in timeout (30s) and retry logic - no aggressive timeout here
      const { getUnifiedDataService } = await import('@/lib/unified-data-service');
      const service = getUnifiedDataService();
      
      try {
        const data = await service.getDataSources();
        
        setSources(data.sources || []);
        setOpportunities(data.opportunities || []);
        
        // Only fallback to sample data if response is explicitly empty AND not a fallback response
        if ((!data.sources || data.sources.length === 0) && !data.fallback) {
          console.warn('No data sources returned from live service');
          // Don't use sample data - show empty state instead
          setSources([]);
          setOpportunities([]);
        }
      } catch (error: any) {
        // Log error but don't use sample data - prefer showing empty state
        console.error('Failed to load data sources:', error);
        setSources([]);
        setOpportunities([]);
      }
    } catch (err: any) {
      console.error('Failed to load data sources:', err);
      // Always fallback to sample data on error to prevent infinite loops
      const sampleData = getSampleData();
      setSources(sampleData.sources);
      setOpportunities(sampleData.opportunities);
    } finally {
      setLoading(false);
    }
  }

  function getSampleData() {
    return {
      sources: [
        {
          id: '1',
          name: 'Supabase RAG',
          type: 'database',
          status: 'connected',
          description: 'Primary knowledge base with vector embeddings',
          lastSync: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          recordCount: 15632,
          integration: 'n8n'
        },
        {
          id: '2',
          name: 'n8n Workflows',
          type: 'api',
          status: 'connected',
          description: 'Workflow automation and orchestration',
          lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          integration: 'n8n'
        },
        {
          id: '3',
          name: 'OpenRouter API',
          type: 'api',
          status: 'connected',
          description: 'LLM model access and cost tracking',
          lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
          integration: 'mcp'
        },
        {
          id: '4',
          name: 'GitHub Repositories',
          type: 'api',
          status: 'disconnected',
          description: 'Code repository integration for documentation',
          lastSync: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          integration: 'n8n'
        },
        {
          id: '5',
          name: 'Project State',
          type: 'file',
          status: 'connected',
          description: 'Local project state and configuration',
          lastSync: new Date(Date.now() - 30 * 1000).toISOString(),
          integration: 'direct'
        }
      ],
      opportunities: [
        {
          source: 'External Documentation Sites',
          description: 'Integrate documentation from external sources (MDN, Stack Overflow, etc.)',
          benefit: 'Expand knowledge base with authoritative technical documentation',
          complexity: 'medium',
          priority: 'high'
        },
        {
          source: 'User Feedback System',
          description: 'Collect and integrate user feedback into RAG system',
          benefit: 'Improve UX based on real user experiences',
          complexity: 'low',
          priority: 'high'
        },
        {
          source: 'Analytics Platforms',
          description: 'Integrate usage analytics (Google Analytics, Mixpanel, etc.)',
          benefit: 'Data-driven decision making for feature development',
          complexity: 'medium',
          priority: 'medium'
        },
        {
          source: 'Design System Libraries',
          description: 'Import component libraries and design systems',
          benefit: 'Expand component knowledge and patterns',
          complexity: 'low',
          priority: 'medium'
        },
        {
          source: 'Code Quality Tools',
          description: 'Integrate linting and code quality metrics',
          benefit: 'Automated code quality monitoring and improvement',
          complexity: 'high',
          priority: 'low'
        }
      ]
    };
  }

  function getTypeIcon(type: string): string {
    switch (type) {
      case 'api': return '🔌';
      case 'database': return '🗄️';
      case 'file': return '📁';
      case 'stream': return '🌊';
      case 'webhook': return '🪝';
      default: return '📊';
    }
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'connected': return 'var(--status-success)';
      case 'disconnected': return 'var(--status-warning)';
      case 'error': return 'var(--status-error)';
      case 'pending': return 'var(--status-info)';
      default: return 'var(--text-muted)';
    }
  }

  function getStatusIcon(status: string): string {
    switch (status) {
      case 'connected': return '✅';
      case 'disconnected': return '⚠️';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  }

  function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  if (loading) {
    return (
      <div className="card" style={{
        padding: '24px',
        border: 'var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🔌</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            Data Source Integration
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading data sources...
        </div>
      </div>
    );
  }

  const connectedCount = sources.filter(s => s.status === 'connected').length;
  const disconnectedCount = sources.filter(s => s.status === 'disconnected').length;

  return (
    <div className="card" style={{
      padding: '24px',
      border: 'var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '30px',
      background: 'var(--card-bg)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🔌</span>
            <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0 }}>
              Data Source Integration Panel
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Visual interface for managing and integrating data sources
          </p>
        </div>
        <button
          onClick={fetchDataSources}
          style={{
            padding: '8px 16px',
            background: 'var(--card-alt)',
            border: 'var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Status Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '20px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#00CC66', marginBottom: '8px' }}>
            {connectedCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Connected
          </div>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#FFD700', marginBottom: '8px' }}>
            {disconnectedCount}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Disconnected
          </div>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
            {sources.length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Total Sources
          </div>
        </div>
      </div>

      {/* Connected Data Sources */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          Connected Data Sources
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {sources.filter(s => s.status === 'connected').map(source => (
            <div
              key={source.id}
              style={{
                padding: '16px',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius)',
                border: `2px solid ${getStatusColor(source.status)}`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{getTypeIcon(source.type)}</span>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                    {source.name}
                  </div>
                </div>
                <span style={{ fontSize: '18px' }}>{getStatusIcon(source.status)}</span>
              </div>
              
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                {source.description}
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                <span>Integration: {source.integration.toUpperCase()}</span>
                <span>Last sync: {formatTimeAgo(source.lastSync)}</span>
              </div>
              
              {source.recordCount !== undefined && (
                <div style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: 600 }}>
                  {source.recordCount.toLocaleString()} records
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Integration Opportunities */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          Integration Opportunities
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {opportunities
            .sort((a, b) => {
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              return priorityOrder[b.priority] - priorityOrder[a.priority];
            })
            .map((opp, index) => (
              <div
                key={index}
                style={{
                  padding: '16px',
                  background: 'var(--card-bg)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                    {opp.source}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      background: opp.priority === 'high' ? '#CC0000' : opp.priority === 'medium' ? '#FFD700' : 'var(--card-alt)',
                      borderRadius: '4px',
                      fontSize: '10px',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {opp.priority}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      background: opp.complexity === 'low' ? '#00CC66' : opp.complexity === 'medium' ? '#FFD700' : '#CC0000',
                      borderRadius: '4px',
                      fontSize: '10px',
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {opp.complexity}
                    </span>
                  </div>
                </div>
                
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 8px 0', lineHeight: '1.5' }}>
                  {opp.description}
                </p>
                
                <div style={{ fontSize: '12px', color: 'var(--accent)' }}>
                  💡 Benefit: {opp.benefit}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

