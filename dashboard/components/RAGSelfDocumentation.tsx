'use client';

/**
 * RAG Self-Documentation Component
 * 
 * Visual knowledge base browser with component-level documentation
 * 
 * Recommendations from:
 * - Commander Data: Enhance RAG system's self-documentation capabilities
 * - La Forge: Beef up RAG self-documentation
 * - Dr. Crusher: Thorough review of self-documentation processes
 * - Quark: Invest in comprehensive self-documentation
 * - Chief O'Brien: More effort into documenting processes
 * 
 * Reviewed by: Commander Data (Technical) & Counselor Troi (UX)
 */

import { useEffect, useState } from 'react';

interface ComponentDocumentation {
  componentName: string;
  category: string;
  description: string;
  purpose: string;
  usage: string[];
  relatedComponents: string[];
  patterns: string[];
  examples: string[];
  lastUpdated: string;
  knowledgeCount: number;
}

interface DocumentationCategory {
  name: string;
  icon: string;
  components: ComponentDocumentation[];
}

export default function RAGSelfDocumentation() {
  const [categories, setCategories] = useState<DocumentationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDocumentation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // FIXED: Add error check to prevent infinite retry loops
  // Crew: Data (Analysis) & La Forge (Implementation)
  useEffect(() => {
    // Only fetch if not already in error state (prevents infinite retries)
    if (!error) {
      fetchDocumentation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  async function fetchDocumentation() {
    try {
      setLoading(true);
      
      // DDD-Compliant: Use UnifiedDataService (MCP primary, n8n fallback)
      const { getUnifiedDataService } = await import('@/lib/unified-data-service');
      const service = getUnifiedDataService();
      const data = await service.getDocumentation({ 
        category: 'component_documentation', 
        limit: 500 
      });
      
      // Organize by category
      const categoryMap = new Map<string, ComponentDocumentation[]>();
      
      // Parse component documentation from RAG memories
      const components: ComponentDocumentation[] = data.sessions?.map((session: any) => {
        const content = session.content || {};
        return {
          componentName: content.component_name || session.title || 'Unknown',
          category: content.category || 'general',
          description: content.description || session.executive_summary || '',
          purpose: content.purpose || '',
          usage: content.usage || [],
          relatedComponents: content.related_components || [],
          patterns: content.patterns || [],
          examples: content.examples || [],
          lastUpdated: session.created_at || session.timestamp,
          knowledgeCount: session.memory_count || 0
        };
      }) || [];
      
      // Group by category
      components.forEach(comp => {
        if (!categoryMap.has(comp.category)) {
          categoryMap.set(comp.category, []);
        }
        categoryMap.get(comp.category)!.push(comp);
      });
      
      // Convert to category array
      const categoryData: DocumentationCategory[] = Array.from(categoryMap.entries()).map(([name, comps]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        icon: getCategoryIcon(name),
        components: comps
      }));
      
      setCategories(categoryData);
      setError(null); // Clear error on success
      
      // Don't use sample data - show empty state if no data
      if (categoryData.length === 0) {
        setCategories([]);
      }
    } catch (err: any) {
      // FIXED: Prevent infinite retry loops
      // Crew: Worf (Security) & O'Brien (Pragmatic Fix)
      console.error('Failed to load documentation:', err);
      setError(err.message || 'Failed to load documentation');
      setCategories([]);
      // Don't retry automatically - user can manually retry if needed
    } finally {
      setLoading(false);
    }
  }

  function getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'dashboard': '📊',
      'workflow': '⚙️',
      'component': '🧩',
      'api': '🔌',
      'security': '🔒',
      'analytics': '📈',
      'general': '📄'
    };
    return icons[category] || '📄';
  }

  function getSampleDocumentation(): DocumentationCategory[] {
    return [
      {
        name: 'Dashboard',
        icon: '📊',
        components: [
          {
            componentName: 'LearningAnalyticsDashboard',
            category: 'dashboard',
            description: 'Tracks RAG memory growth and learning metrics over time',
            purpose: 'Visualize system learning progress and memory accumulation',
            usage: ['Display learning trends', 'Monitor memory growth', 'Track confidence scores'],
            relatedComponents: ['CrewMemoryVisualization', 'RAGProjectRecommendations'],
            patterns: ['Client-only rendering', 'Real-time data fetching', 'Chart visualization'],
            examples: ['<LearningAnalyticsDashboard />'],
            lastUpdated: new Date().toISOString(),
            knowledgeCount: 45
          },
          {
            componentName: 'CrewMemoryVisualization',
            category: 'dashboard',
            description: 'Visualizes crew learning contributions and memory growth',
            purpose: 'Show crew member contributions to knowledge base',
            usage: ['Display crew stats', 'Track memory contributions', 'Monitor crew activity'],
            relatedComponents: ['LearningAnalyticsDashboard', 'RAGProjectRecommendations'],
            patterns: ['Grid layout', 'Progress bars', 'Responsive design'],
            examples: ['<CrewMemoryVisualization />'],
            lastUpdated: new Date().toISOString(),
            knowledgeCount: 38
          }
        ]
      },
      {
        name: 'Workflow',
        icon: '⚙️',
        components: [
          {
            componentName: 'N8NWorkflowBento',
            category: 'workflow',
            description: 'Visualize and manage n8n workflows with interactive Mermaid diagrams',
            purpose: 'Provide visual workflow management interface',
            usage: ['Workflow visualization', 'Workflow selection', 'Mermaid diagram rendering'],
            relatedComponents: ['Mermaid', 'WorkflowManagement'],
            patterns: ['Bento grid layout', 'Interactive diagrams', 'Workflow routing'],
            examples: ['<N8NWorkflowBento onWorkflowSelect={handleSelect} />'],
            lastUpdated: new Date().toISOString(),
            knowledgeCount: 52
          }
        ]
      },
      {
        name: 'Security',
        icon: '🔒',
        components: [
          {
            componentName: 'SecurityAssessment',
            category: 'security',
            description: 'Continuous security monitoring and threat assessment',
            purpose: 'Monitor system security posture and vulnerabilities',
            usage: ['Security audits', 'Threat detection', 'Vulnerability tracking'],
            relatedComponents: ['SecurityDashboard', 'AuditLog'],
            patterns: ['Real-time monitoring', 'Security scoring', 'Alert system'],
            examples: ['<SecurityAssessment />'],
            lastUpdated: new Date().toISOString(),
            knowledgeCount: 28
          }
        ]
      }
    ];
  }

  const filteredCategories = categories.filter(cat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return cat.name.toLowerCase().includes(query) ||
           cat.components.some(comp => 
             comp.componentName.toLowerCase().includes(query) ||
             comp.description.toLowerCase().includes(query)
           );
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
          <span style={{ fontSize: '24px' }}>📚</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            RAG Self-Documentation
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading component documentation...
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
            <span style={{ fontSize: '28px' }}>📚</span>
            <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0 }}>
              RAG Self-Documentation
            </h3>
          </div>
          <button
            onClick={fetchDocumentation}
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
          Component-based knowledge organized from RAG system
        </p>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search components, categories, or descriptions..."
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
            outline: 'none'
          }}
        />
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setSelectedCategory(null)}
          style={{
            padding: '8px 16px',
            background: selectedCategory === null ? 'var(--accent)' : 'var(--card-alt)',
            border: 'var(--border)',
            borderRadius: 'var(--radius)',
            color: selectedCategory === null ? 'white' : 'var(--text)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          All Categories
        </button>
        {filteredCategories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            style={{
              padding: '8px 16px',
              background: selectedCategory === cat.name ? 'var(--accent)' : 'var(--card-alt)',
              border: 'var(--border)',
              borderRadius: 'var(--radius)',
              color: selectedCategory === cat.name ? 'white' : 'var(--text)',
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Component Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {filteredCategories
          .filter(cat => !selectedCategory || cat.name === selectedCategory)
          .map(cat => cat.components.map(comp => (
            <div
              key={comp.componentName}
              onClick={() => setSelectedComponent(comp)}
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
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
                    {comp.componentName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {cat.icon} {cat.name}
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  background: 'var(--card-bg)',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: 'var(--accent)'
                }}>
                  {comp.knowledgeCount} docs
                </div>
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                {comp.description}
              </p>
              
              {comp.purpose && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Purpose:</div>
                  <div style={{ fontSize: '12px', color: 'var(--text)' }}>{comp.purpose}</div>
                </div>
              )}
              
              {comp.relatedComponents.length > 0 && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>Related:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {comp.relatedComponents.slice(0, 3).map(related => (
                      <span
                        key={related}
                        style={{
                          padding: '2px 6px',
                          background: 'var(--card-bg)',
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {related}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )))}
      </div>

      {/* Component Detail Modal */}
      {selectedComponent && (
        <div
          onClick={() => setSelectedComponent(null)}
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
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-bg)',
              border: 'var(--border)',
              borderRadius: 'var(--radius)',
              padding: '32px',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflow: 'auto',
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', color: 'var(--accent)', margin: 0 }}>
                {selectedComponent.componentName}
              </h2>
              <button
                onClick={() => setSelectedComponent(null)}
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
                {selectedComponent.description}
              </p>
            </div>
            
            {selectedComponent.purpose && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Purpose</div>
                <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6', margin: 0 }}>
                  {selectedComponent.purpose}
                </p>
              </div>
            )}
            
            {selectedComponent.usage.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Usage</div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text)' }}>
                  {selectedComponent.usage.map((use, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{use}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {selectedComponent.patterns.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Patterns</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedComponent.patterns.map((pattern, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--card-alt)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'var(--accent)'
                      }}
                    >
                      {pattern}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {selectedComponent.examples.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Examples</div>
                <div style={{
                  padding: '12px',
                  background: 'var(--card-alt)',
                  borderRadius: 'var(--radius)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                  color: 'var(--text)',
                  overflow: 'auto'
                }}>
                  {selectedComponent.examples.map((example, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>{example}</div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedComponent.relatedComponents.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Related Components</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedComponent.relatedComponents.map((related, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        background: 'var(--card-alt)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'var(--text)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const comp = categories
                          .flatMap(cat => cat.components)
                          .find(c => c.componentName === related);
                        if (comp) setSelectedComponent(comp);
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

