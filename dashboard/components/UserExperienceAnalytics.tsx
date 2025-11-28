'use client';

/**
 * User Experience Analytics Component
 * 
 * UX insights and intuitive needs alignment
 * 
 * Recommendations from:
 * - Counselor Troi: Deeper exploration of user experiences, align technical prowess with intuitive needs
 * 
 * Reviewed by: Counselor Troi (UX & Empathy)
 */

import { useEffect, useState, useRef } from 'react';
import DataStatusBadge, { useDataStatus } from './DataStatusBadge';
import { getUnifiedDataService } from '@/lib/unified-data-service';

interface UXMetric {
  category: string;
  score: number;
  trend: 'improving' | 'declining' | 'stable';
  userFeedback: string[];
  painPoints: string[];
  opportunities: string[];
}

interface UserJourney {
  step: string;
  completionRate: number;
  avgTime: number;
  dropoffRate: number;
  satisfaction: number;
}

export default function UserExperienceAnalytics() {
  const [metrics, setMetrics] = useState<UXMetric[]>([]);
  const [journey, setJourney] = useState<UserJourney[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallSatisfaction, setOverallSatisfaction] = useState(0);
  const [dataResponse, setDataResponse] = useState<any>(null);

  // FIXED: Use static import instead of dynamic import to prevent HMR warnings
  // Crew: La Forge (Infrastructure) + Data (Analysis)
  const serviceRef = useRef<ReturnType<typeof getUnifiedDataService> | null>(null);

  useEffect(() => {
    // Initialize service once (stable reference for HMR)
    if (!serviceRef.current) {
      serviceRef.current = getUnifiedDataService();
    }
    
    fetchUXData();
  }, []);

  async function fetchUXData() {
    try {
      setLoading(true);
      
      // DDD-Compliant: Use UnifiedDataService (API primary, mock fallback)
      // FIXED: Use static import via ref to prevent HMR warnings
      const service = serviceRef.current!;
      const response = await service.getUXData();
      
      // Store response for status badge
      setDataResponse(response);
      
      // Handle response structure (data may be nested)
      const data = response?.data || response;
      
      if (data) {
        setOverallSatisfaction(data.userSatisfaction || 0);
        
        // Transform API data to component format
        if (data.metrics) {
          setMetrics(data.metrics);
        } else {
          // Create metrics from feedback if available
          const metricsFromFeedback = data.feedback ? [{
            category: 'User Satisfaction',
            score: data.userSatisfaction || 0,
            trend: 'stable' as const,
            userFeedback: data.feedback.map((f: any) => f.comment || ''),
            painPoints: [],
            opportunities: []
          }] : [];
          setMetrics(metricsFromFeedback);
        }
        
        setJourney(data.journey || []);
      } else {
        // No data - show empty state
        setMetrics([]);
        setJourney([]);
        setOverallSatisfaction(0);
      }
      
      // Show fallback indicator if using mock data
      if (response?.fallback) {
        console.debug('Using mock UX data - Supabase table may not exist yet');
      }
    } catch (err: any) {
      console.error('Failed to load UX data:', err);
      setMetrics([]);
      setJourney([]);
      setOverallSatisfaction(0);
    } finally {
      setLoading(false);
    }
  }

  function getSampleUXData() {
    return {
      metrics: [
        {
          category: 'Dashboard Usability',
          score: 85,
          trend: 'improving',
          userFeedback: [
            'Clean, intuitive interface',
            'Easy to navigate between projects',
            'Theme selector is helpful'
          ],
          painPoints: [
            'Initial load time could be faster',
            'Some components feel cluttered'
          ],
          opportunities: [
            'Add keyboard shortcuts',
            'Improve mobile responsiveness',
            'Add onboarding tutorial'
          ]
        },
        {
          category: 'Component Discovery',
          score: 78,
          trend: 'stable',
          userFeedback: [
            'Component manager is useful',
            'Visual preview helps understanding'
          ],
          painPoints: [
            'Hard to find specific components',
            'Documentation could be more accessible'
          ],
          opportunities: [
            'Add component search',
            'Improve component categorization',
            'Add component examples'
          ]
        },
        {
          category: 'Theme Customization',
          score: 92,
          trend: 'improving',
          userFeedback: [
            'Love the visual theme gallery',
            'Live preview is excellent',
            'Easy to switch themes'
          ],
          painPoints: [
            'Some themes need better contrast',
            'Custom theme creation not available'
          ],
          opportunities: [
            'Add theme editor',
            'Allow custom color schemes',
            'Theme presets for industries'
          ]
        },
        {
          category: 'Workflow Management',
          score: 72,
          trend: 'declining',
          userFeedback: [
            'n8n integration is powerful'
          ],
          painPoints: [
            'Workflow visualization is complex',
            'Hard to understand workflow relationships',
            'Error messages not clear enough'
          ],
          opportunities: [
            'Simplify workflow UI',
            'Add workflow templates',
            'Better error handling and guidance'
          ]
        }
      ],
      journey: [
        {
          step: 'Project Creation',
          completionRate: 95,
          avgTime: 120,
          dropoffRate: 5,
          satisfaction: 88
        },
        {
          step: 'Theme Selection',
          completionRate: 92,
          avgTime: 45,
          dropoffRate: 3,
          satisfaction: 91
        },
        {
          step: 'Component Addition',
          completionRate: 78,
          avgTime: 180,
          dropoffRate: 14,
          satisfaction: 75
        },
        {
          step: 'Content Editing',
          completionRate: 85,
          avgTime: 240,
          dropoffRate: 7,
          satisfaction: 82
        },
        {
          step: 'Project Publishing',
          completionRate: 90,
          avgTime: 60,
          dropoffRate: 5,
          satisfaction: 87
        }
      ]
    };
  }

  function getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 85) return 'var(--status-success)';
    if (score >= 70) return 'var(--status-warning)';
    return 'var(--status-error)';
  }

  const dataStatus = useDataStatus(dataResponse);

  if (loading) {
    return (
      <div className="card" style={{
        position: 'relative', // For badge positioning
        padding: '24px',
        border: 'var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: '30px'
      }}>
        <DataStatusBadge status="loading" position="top-right" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>💭</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            User Experience Analytics
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading UX insights...
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{
      position: 'relative', // For badge positioning
      padding: '24px',
      border: 'var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '30px',
      background: 'var(--card-bg)'
    }}>
      <DataStatusBadge status={dataStatus} position="top-right" />
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
            <span style={{ fontSize: '28px' }}>💭</span>
            <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0 }}>
              User Experience Analytics
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Aligning technical capabilities with intuitive user needs
          </p>
        </div>
        <button
          onClick={fetchUXData}
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

      {/* Overall Satisfaction */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', fontWeight: 700, color: getScoreColor(overallSatisfaction), marginBottom: '8px' }}>
          {overallSatisfaction}%
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Overall User Satisfaction
        </div>
        <div style={{
          width: '100%',
          height: '12px',
          background: 'var(--card-bg)',
          borderRadius: '6px',
          overflow: 'hidden',
          margin: '0 auto',
          maxWidth: '400px'
        }}>
          <div style={{
            width: `${overallSatisfaction}%`,
            height: '100%',
            background: getScoreColor(overallSatisfaction),
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* UX Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {metrics.map((metric, index) => (
          <div
            key={index}
            style={{
              padding: '20px',
              background: 'var(--card-alt)',
              border: `2px solid ${getScoreColor(metric.score)}`,
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
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                {metric.category}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>{getTrendIcon(metric.trend)}</span>
                <div style={{
                  padding: '4px 10px',
                  background: getScoreColor(metric.score),
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'white'
                }}>
                  {metric.score}%
                </div>
              </div>
            </div>
            
            {metric.userFeedback.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>✅ Positive Feedback</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text)' }}>
                  {metric.userFeedback.slice(0, 2).map((fb, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{fb}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {metric.painPoints.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>⚠️ Pain Points</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text)' }}>
                  {metric.painPoints.map((pp, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{pp}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {metric.opportunities.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>💡 Opportunities</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--accent)' }}>
                  {metric.opportunities.slice(0, 2).map((opp, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{opp}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* User Journey */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          User Journey Analysis
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {journey.map((step, index) => (
            <div
              key={index}
              style={{
                padding: '16px',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                  {index + 1}. {step.step}
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <span>{step.completionRate}% complete</span>
                  <span>{step.avgTime}s avg</span>
                  <span style={{ color: step.dropoffRate > 10 ? 'var(--status-error)' : 'var(--text-muted)' }}>
                    {step.dropoffRate}% dropoff
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Completion Rate</div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--card-alt)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${step.completionRate}%`,
                      height: '100%',
                      background: getScoreColor(step.satisfaction),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Satisfaction</div>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    background: 'var(--card-alt)',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${step.satisfaction}%`,
                      height: '100%',
                      background: getScoreColor(step.satisfaction),
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

