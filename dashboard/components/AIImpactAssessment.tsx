'use client';

/**
 * AI Impact Assessment Protocol Component
 * 
 * Formal protocol for assessing AI system impact on crew decision-making
 * 
 * Recommendations from:
 * - Captain Picard: Establish formal protocol for regularly assessing the impact of AI systems
 * 
 * Reviewed by: Captain Picard (Strategic Leadership)
 */

import { useEffect, useState } from 'react';

interface ImpactAssessment {
  category: string;
  impact: 'positive' | 'neutral' | 'negative';
  score: number;
  description: string;
  recommendations: string[];
  lastAssessment: string;
}

interface AssessmentProtocol {
  version: string;
  lastReview: string;
  nextReview: string;
  assessments: ImpactAssessment[];
  overallImpact: 'positive' | 'neutral' | 'negative';
}

export default function AIImpactAssessment() {
  const [protocol, setProtocol] = useState<AssessmentProtocol | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  async function fetchAssessmentData() {
    try {
      setLoading(true);
      
      // DDD-Compliant: Use UnifiedDataService (MCP primary, n8n fallback)
      const { getUnifiedDataService } = await import('@/lib/unified-data-service');
      const service = getUnifiedDataService();
      const data = await service.getAssessmentData();
      
      // Ensure protocol has all required fields with defaults
      if (data && data.assessments) {
        setProtocol({
          version: data.version || '1.0.0',
          lastReview: data.lastReview || new Date().toISOString(),
          nextReview: data.nextReview || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          overallImpact: data.overallImpact || 'neutral', // Ensure overallImpact is always defined
          assessments: data.assessments || []
        });
      } else {
        // Don't use sample data - show empty state if no data
        setProtocol({ 
          version: '1.0.0',
          lastReview: new Date().toISOString(),
          nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          overallImpact: 'neutral', // Default to neutral if no data
          assessments: []
        });
      }
    } catch (err: any) {
      console.error('Failed to load assessment data:', err);
      setProtocol({ 
        version: '1.0.0',
        lastReview: new Date().toISOString(),
        nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        overallImpact: 'neutral', // Default to neutral on error
        assessments: []
      });
    } finally {
      setLoading(false);
    }
  }

  function getSampleProtocol(): AssessmentProtocol {
    return {
      version: '1.0.0',
      lastReview: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      overallImpact: 'positive',
      assessments: [
        {
          category: 'Decision-Making Autonomy',
          impact: 'positive',
          score: 85,
          description: 'AI systems enhance crew decision-making without replacing human judgment',
          recommendations: [
            'Continue maintaining human oversight in critical decisions',
            'Document AI recommendations vs final decisions for learning'
          ],
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          category: 'Knowledge Accessibility',
          impact: 'positive',
          score: 92,
          description: 'RAG system significantly improves access to institutional knowledge',
          recommendations: [
            'Expand knowledge base coverage',
            'Improve search accuracy further'
          ],
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          category: 'Workflow Efficiency',
          impact: 'positive',
          score: 88,
          description: 'Automated workflows reduce manual overhead while maintaining quality',
          recommendations: [
            'Monitor for over-automation risks',
            'Ensure workflows remain transparent'
          ],
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          category: 'Cost Management',
          impact: 'positive',
          score: 82,
          description: 'Cost optimization strategies effective, but need continuous monitoring',
          recommendations: [
            'Continue model selection optimization',
            'Implement request caching where possible'
          ],
          lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          category: 'Ethical Considerations',
          impact: 'neutral',
          score: 75,
          description: 'Zero-artifact guarantee maintained, but need formal ethics review process',
          recommendations: [
            'Establish ethics review board',
            'Document ethical decision-making processes',
            'Regular bias audits'
          ],
          lastAssessment: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    };
  }

  function getImpactColor(impact: string): string {
    switch (impact) {
      case 'positive': return 'var(--status-success)';
      case 'neutral': return 'var(--status-warning)';
      case 'negative': return 'var(--status-error)';
      default: return 'var(--text-muted)';
    }
  }

  function getImpactIcon(impact: string): string {
    switch (impact) {
      case 'positive': return '✅';
      case 'neutral': return '➡️';
      case 'negative': return '⚠️';
      default: return '❓';
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
          <span style={{ fontSize: '24px' }}>🎖️</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            AI Impact Assessment Protocol
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading assessment data...
        </div>
      </div>
    );
  }

  if (!protocol) return null;

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
            <span style={{ fontSize: '28px' }}>🎖️</span>
            <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0 }}>
              AI Impact Assessment Protocol
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Formal protocol for assessing AI system impact on crew decision-making
          </p>
        </div>
        <button
          onClick={fetchAssessmentData}
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

      {/* Protocol Info */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginBottom: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Protocol Version</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>v{protocol.version}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Last Review</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{formatDate(protocol.lastReview)}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Next Review</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{formatDate(protocol.nextReview)}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Overall Impact</div>
          <div style={{ 
            fontSize: '16px', 
            fontWeight: 600, 
            color: getImpactColor(protocol.overallImpact || 'neutral'),
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {getImpactIcon(protocol.overallImpact || 'neutral')} {(protocol.overallImpact && typeof protocol.overallImpact === 'string') ? protocol.overallImpact.charAt(0).toUpperCase() + protocol.overallImpact.slice(1) : 'Neutral'}
          </div>
        </div>
      </div>

      {/* Assessments */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {protocol.assessments.map((assessment, index) => (
          <div
            key={index}
            style={{
              padding: '20px',
              background: 'var(--card-alt)',
              border: `2px solid ${getImpactColor(assessment.impact)}`,
              borderRadius: 'var(--radius)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getImpactIcon(assessment.impact)}</span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                  {assessment.category}
                </div>
              </div>
              <div style={{
                padding: '4px 10px',
                background: getImpactColor(assessment.impact),
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white'
              }}>
                {assessment.score}%
              </div>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
              {assessment.description}
            </p>
            
            {assessment.recommendations.length > 0 && (
              <div style={{
                padding: '12px',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                marginTop: '12px'
              }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                  Recommendations
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text)' }}>
                  {assessment.recommendations.map((rec, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px' }}>
              Last assessed: {formatDate(assessment.lastAssessment)}
            </div>
          </div>
        ))}
      </div>

      {/* Protocol Guidelines */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          Protocol Guidelines
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text)', lineHeight: '1.8' }}>
          <div style={{ marginBottom: '12px' }}>
            <strong>1. Regular Assessment Schedule:</strong> Conduct formal impact assessments every 2 weeks, with quarterly comprehensive reviews.
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>2. Multi-Perspective Evaluation:</strong> Include input from all crew members, especially those directly affected by AI systems.
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>3. Documented Decision Tracking:</strong> Maintain records of AI recommendations vs. final crew decisions to identify patterns.
          </div>
          <div style={{ marginBottom: '12px' }}>
            <strong>4. Ethical Review Process:</strong> All AI system changes must pass ethical review before deployment.
          </div>
          <div>
            <strong>5. Continuous Improvement:</strong> Use assessment findings to refine AI systems and crew workflows.
          </div>
        </div>
      </div>
    </div>
  );
}

