'use client';

/**
 * RAG-Powered Project Recommendations Component
 * 
 * Uses crew memories and semantic search to provide intelligent project suggestions
 * 
 * Responsive Design (Troi): Mobile-first, card-based layout, clear visual hierarchy
 * Technical Implementation (Data): Efficient API calls, error handling, loading states
 * 
 * Reviewed by: Counselor Troi (UX) & Commander Data (Technical)
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  confidence: number;
  source: string; // Which crew member or memory suggested this
  tags: string[];
}

export default function RAGProjectRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);
      setError(null);
      
      // Query RAG system for project recommendations
      const response = await fetch('/api/knowledge/query?category=project-insights&limit=5');
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const data = await response.json();
      
      // Transform RAG memories into recommendations
      const recs: Recommendation[] = (data.sessions || []).slice(0, 5).map((memory: any, index: number) => ({
        id: `rec-${index}`,
        title: memory.title || 'Project Enhancement',
        description: memory.description || memory.content || 'Based on crew analysis and project history',
        confidence: memory.confidence || 0.75,
        source: memory.crew_member || 'Crew Analysis',
        tags: memory.tags || ['optimization', 'enhancement']
      }));
      
      setRecommendations(recs);
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
      setError(err.message);
      // Fallback to default recommendations
      setRecommendations([
        {
          id: 'rec-1',
          title: 'Optimize Project Performance',
          description: 'Based on crew analysis, consider implementing caching strategies',
          confidence: 0.8,
          source: 'Commander Data',
          tags: ['performance', 'optimization']
        }
      ]);
    } finally {
      setLoading(false);
    }
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
          <span style={{ fontSize: '24px' }}>🧠</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            RAG-Powered Recommendations
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading intelligent recommendations...
        </div>
      </div>
    );
  }

  if (error && recommendations.length === 0) {
    return (
      <div className="card" style={{
        padding: '24px',
        border: 'var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: '30px',
        background: 'var(--card-alt)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🧠</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            RAG-Powered Recommendations
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Unable to load recommendations. {error}
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
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>🧠</span>
          <div>
            <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0, marginBottom: '4px' }}>
              RAG-Powered Recommendations
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
              Intelligent suggestions based on crew memories
            </p>
          </div>
        </div>
        <button
          onClick={fetchRecommendations}
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

      {/* Recommendations Grid - Responsive */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            style={{
              padding: '20px',
              background: 'var(--card-alt)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '16px', color: 'var(--text)', margin: 0, fontWeight: 600 }}>
                {rec.title}
              </h4>
              <span style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: `rgba(0, 255, 170, ${rec.confidence * 0.3})`,
                color: 'var(--accent)',
                borderRadius: '12px',
                fontWeight: 600
              }}>
                {Math.round(rec.confidence * 100)}%
              </span>
            </div>
            
            <p style={{ 
              fontSize: '14px', 
              color: 'var(--text-muted)', 
              margin: '0 0 12px 0',
              lineHeight: '1.5'
            }}>
              {rec.description}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {rec.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: '11px',
                      padding: '4px 8px',
                      background: 'var(--card-bg)',
                      color: 'var(--text-muted)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                via {rec.source}
              </span>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px 20px',
          color: 'var(--text-muted)',
          fontSize: '14px'
        }}>
          No recommendations available. Create some projects to get intelligent suggestions!
        </div>
      )}
    </div>
  );
}

