'use client';

/**
 * Process Documentation System Component
 * 
 * Component-based process documentation viewer
 * 
 * Recommendations from:
 * - Chief O'Brien: More effort into documenting processes and procedures
 * - La Forge: Document processes and procedures clearly
 * 
 * Reviewed by: Chief O'Brien (Operations) & La Forge (Engineering)
 */

import { useEffect, useState } from 'react';

interface Process {
  id: string;
  name: string;
  category: string;
  description: string;
  steps: ProcessStep[];
  relatedProcesses: string[];
  lastUpdated: string;
  owner: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  component?: string;
  tools?: string[];
}

export default function ProcessDocumentationSystem() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchProcesses();
  }, []);

  async function fetchProcesses() {
    try {
      setLoading(true);
      
      // DDD-Compliant: Use UnifiedDataService (MCP primary, n8n fallback)
      const { getUnifiedDataService } = await import('@/lib/unified-data-service');
      const service = getUnifiedDataService();
      const data = await service.getProcesses();
      setProcesses(data.processes || []);
      
      // Don't use sample data - show empty state if no data
      if (!data.processes || data.processes.length === 0) {
        setProcesses([]);
      }
    } catch (err: any) {
      console.error('Failed to load processes:', err);
      setProcesses([]);
    } finally {
      setLoading(false);
    }
  }

  function getSampleProcesses(): Process[] {
    return [
      {
        id: '1',
        name: 'Project Creation Workflow',
        category: 'project-management',
        description: 'Complete workflow for creating new projects with theme selection and component setup',
        owner: 'Commander Riker',
        lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        steps: [
          {
            step: 1,
            title: 'Initialize Project',
            description: 'Create new project with unique ID and default configuration',
            component: 'ProjectEditor',
            tools: ['state-manager.tsx']
          },
          {
            step: 2,
            title: 'Theme Selection',
            description: 'User selects theme via visual gallery or quiz',
            component: 'ThemeSelector',
            tools: ['ThemeSelector.tsx', 'QuizInline.tsx']
          },
          {
            step: 3,
            title: 'Component Setup',
            description: 'Add initial components using wizard or manual selection',
            component: 'CombinedWizard',
            tools: ['CombinedWizard.tsx', 'BentoEditor.tsx']
          },
          {
            step: 4,
            title: 'Content Configuration',
            description: 'Configure headline, subheadline, and project metadata',
            component: 'ProjectEditorTabs',
            tools: ['ProjectEditorTabs.tsx']
          },
          {
            step: 5,
            title: 'Save to RAG',
            description: 'Store project creation event in RAG system via n8n',
            component: 'content-sync.ts',
            tools: ['content-sync.ts', 'n8n workflow']
          }
        ],
        relatedProcesses: ['Theme Selection Process', 'Component Management Process']
      },
      {
        id: '2',
        name: 'Memory Storage Process',
        category: 'knowledge-management',
        description: 'How crew memories are stored in the RAG system via n8n workflows',
        owner: 'Commander Data',
        lastUpdated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        steps: [
          {
            step: 1,
            title: 'Crew Member Action',
            description: 'Crew member performs action or makes decision',
            component: 'Crew Webhook',
            tools: ['n8n crew workflow']
          },
          {
            step: 2,
            title: 'Memory Generation',
            description: 'System generates memory entry with context and metadata',
            component: 'Memory Generator',
            tools: ['crew-assignment-system.ts']
          },
          {
            step: 3,
            title: 'n8n Processing',
            description: 'n8n workflow validates and transforms memory data',
            component: 'n8n Workflow',
            tools: ['knowledge-ingest workflow']
          },
          {
            step: 4,
            title: 'Supabase Storage',
            description: 'Memory stored in Supabase with vector embeddings',
            component: 'Supabase RAG',
            tools: ['Supabase knowledge_base table']
          },
          {
            step: 5,
            title: 'Retrieval',
            description: 'Memories retrieved via semantic search for crew context',
            component: 'RAG Query',
            tools: ['load-crew-memories.ts']
          }
        ],
        relatedProcesses: ['RAG Query Process', 'Crew Coordination Process']
      },
      {
        id: '3',
        name: 'Security Audit Process',
        category: 'security',
        description: 'Regular security assessment and peer audit procedures',
        owner: 'Lieutenant Worf',
        lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        steps: [
          {
            step: 1,
            title: 'Schedule Audit',
            description: 'Automated or manual trigger of security audit',
            component: 'SecurityAssessmentDashboard',
            tools: ['SecurityAssessmentDashboard.tsx']
          },
          {
            step: 2,
            title: 'System Scan',
            description: 'Automated scan of credentials, APIs, and access controls',
            component: 'Security Scanner',
            tools: ['security-scanner.ts']
          },
          {
            step: 3,
            title: 'Peer Review',
            description: 'Crew member reviews findings and validates security posture',
            component: 'Audit Interface',
            tools: ['SecurityAssessmentDashboard.tsx']
          },
          {
            step: 4,
            title: 'Issue Tracking',
            description: 'Track and prioritize security issues',
            component: 'Issue Tracker',
            tools: ['audit-log system']
          },
          {
            step: 5,
            title: 'Remediation',
            description: 'Address identified issues and verify fixes',
            component: 'Remediation Workflow',
            tools: ['security-fix workflow']
          }
        ],
        relatedProcesses: ['Credential Management Process', 'Access Control Process']
      },
      {
        id: '4',
        name: 'Cost Optimization Process',
        category: 'operations',
        description: 'Monitoring and optimizing LLM usage costs',
        owner: 'Quark',
        lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        steps: [
          {
            step: 1,
            title: 'Usage Tracking',
            description: 'Monitor model usage, tokens, and costs in real-time',
            component: 'CostOptimizationMonitor',
            tools: ['CostOptimizationMonitor.tsx', 'OpenRouter API']
          },
          {
            step: 2,
            title: 'Cost Analysis',
            description: 'Analyze cost patterns and identify optimization opportunities',
            component: 'Cost Analyzer',
            tools: ['cost-analysis.ts']
          },
          {
            step: 3,
            title: 'Model Selection',
            description: 'Automated model selection based on task complexity',
            component: 'Model Selector',
            tools: ['mcp-openrouter-optimizer.ts']
          },
          {
            step: 4,
            title: 'Optimization Recommendations',
            description: 'Generate recommendations for cost reduction',
            component: 'Recommendation Engine',
            tools: ['CostOptimizationMonitor.tsx']
          },
          {
            step: 5,
            title: 'Implementation',
            description: 'Apply optimizations and monitor results',
            component: 'Optimization Workflow',
            tools: ['cost-optimization workflow']
          }
        ],
        relatedProcesses: ['Model Selection Process', 'Usage Monitoring Process']
      }
    ];
  }

  const categories = Array.from(new Set(processes.map(p => p.category)));
  const filteredProcesses = processes.filter(p => {
    if (selectedCategory && p.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(query) ||
           p.description.toLowerCase().includes(query) ||
           p.steps.some(s => s.title.toLowerCase().includes(query));
  });

  if (loading) {
    return (
      <div className="card" style={{
        padding: '24px',
        border: 'var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🛠️</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            Process Documentation System
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading process documentation...
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{
      padding: '24px',
      border: 'var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '30px',
      background: 'var(--card-bg)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>🛠️</span>
            <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0 }}>
              Process Documentation System
            </h3>
          </div>
          <button
            onClick={fetchProcesses}
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
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, marginBottom: '16px' }}>
          Component-based process documentation and procedures
        </p>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search processes, steps, or components..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            background: 'var(--card-alt)',
            border: 'var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            fontSize: '14px',
            outline: 'none',
            marginBottom: '12px'
          }}
        />
        
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              padding: '6px 12px',
              background: selectedCategory === null ? 'var(--accent)' : 'var(--card-alt)',
              border: 'var(--border)',
              borderRadius: 'var(--radius)',
              color: selectedCategory === null ? 'white' : 'var(--text)',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                background: selectedCategory === cat ? 'var(--accent)' : 'var(--card-alt)',
                border: 'var(--border)',
                borderRadius: 'var(--radius)',
                color: selectedCategory === cat ? 'white' : 'var(--text)',
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Process List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
        gap: '16px'
      }}>
        {filteredProcesses.map(process => (
          <div
            key={process.id}
            onClick={() => setSelectedProcess(process)}
            style={{
              padding: '20px',
              background: 'var(--card-alt)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                {process.name}
              </div>
              <div style={{
                padding: '2px 8px',
                background: 'var(--card-bg)',
                borderRadius: '4px',
                fontSize: '10px',
                color: 'var(--text-muted)',
                textTransform: 'capitalize'
              }}>
                {process.category.replace('-', ' ')}
              </div>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
              {process.description}
            </p>
            
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <div>Owner: {process.owner}</div>
              <div>Steps: {process.steps.length}</div>
            </div>
            
            {process.steps.length > 0 && (
              <div style={{
                padding: '12px',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                  Process Steps
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {process.steps.slice(0, 3).map(step => (
                    <div key={step.step} style={{ fontSize: '12px', color: 'var(--text)' }}>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{step.step}.</span> {step.title}
                    </div>
                  ))}
                  {process.steps.length > 3 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      +{process.steps.length - 3} more steps
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Process Detail Modal */}
      {selectedProcess && (
        <div
          onClick={() => setSelectedProcess(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
            overflow: 'auto'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              border: 'var(--border)',
              borderRadius: 'var(--radius)',
              padding: '32px',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'auto',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', color: 'var(--accent)', margin: 0 }}>
                {selectedProcess.name}
              </h2>
              <button
                onClick={() => setSelectedProcess(null)}
                style={{
                  padding: '8px 12px',
                  background: 'var(--card-alt)',
                  border: 'var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</div>
              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', margin: 0 }}>
                {selectedProcess.description}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <div>Owner: <strong style={{ color: 'var(--text)' }}>{selectedProcess.owner}</strong></div>
              <div>Category: <strong style={{ color: 'var(--text)' }}>{selectedProcess.category}</strong></div>
              <div>Last Updated: <strong style={{ color: 'var(--text)' }}>{new Date(selectedProcess.lastUpdated).toLocaleDateString()}</strong></div>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
                Process Steps
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {selectedProcess.steps.map(step => (
                  <div
                    key={step.step}
                    style={{
                      padding: '16px',
                      background: 'var(--card-alt)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        {step.step}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                        {step.title}
                      </div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 0 12px 12px', lineHeight: '1.6' }}>
                      {step.description}
                    </p>
                    {step.component && (
                      <div style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Component: <span style={{ color: 'var(--accent)' }}>{step.component}</span>
                      </div>
                    )}
                    {step.tools && step.tools.length > 0 && (
                      <div style={{ marginLeft: '12px', marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Tools: {step.tools.map((tool, i) => (
                          <span key={i} style={{ color: 'var(--accent)', marginLeft: '4px' }}>{tool}{i < step.tools!.length - 1 ? ',' : ''}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {selectedProcess.relatedProcesses.length > 0 && (
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '12px' }}>
                  Related Processes
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedProcess.relatedProcesses.map((related, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '6px 12px',
                        background: 'var(--card-alt)',
                        borderRadius: 'var(--radius)',
                        fontSize: '13px',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        border: '1px solid var(--border)'
                      }}
                      onClick={() => {
                        const proc = processes.find(p => p.name === related);
                        if (proc) setSelectedProcess(proc);
                      }}
                    >
                      {related}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

