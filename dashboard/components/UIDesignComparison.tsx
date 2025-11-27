'use client';

/**
 * UI Design Comparison Component
 * 
 * Displays scraped UI designs and compares them with dashboard designs
 * based on aesthetic similarity using vector embeddings
 * 
 * DDD Architecture: Component => Vector System => Design Comparison
 */

import { useState, useEffect } from 'react';
// REMOVED: Direct Supabase import - now using API routes (DDD-compliant)

interface UIDesign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  source: string;
  aesthetic_analysis: {
    color_palette: string[];
    mood: string;
    layout_structure: string;
    component_style: string;
  };
  similarity?: number;
}

interface DashboardDesign {
  id: string;
  metadata: any;
  similarity: number;
}

export default function UIDesignComparison() {
  const [scrapedDesigns, setScrapedDesigns] = useState<UIDesign[]>([]);
  const [dashboardDesigns, setDashboardDesigns] = useState<DashboardDesign[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<UIDesign | null>(null);
  const [similarDashboards, setSimilarDashboards] = useState<DashboardDesign[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load scraped UI designs via API route (DDD-compliant)
   */
  useEffect(() => {
    const loadDesigns = async () => {
      setLoading(true);

      // DDD-Compliant: Use API route (controller layer)
      // Load scraped UI designs
      // FIXED: Graceful error handling for optional feature
      // Crew: Riker (Tactical) + Quark (Optimization) + O'Brien (Pragmatic)
      try {
        const designsResponse = await fetch('/api/data/vectors?patternType=ui_design&limit=20', {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000)
        });

        if (designsResponse.ok) {
          const designsResult = await designsResponse.json();
          // Check for error responses
          if (designsResult.error) {
            console.debug('UI designs query returned error');
          } else if (designsResult.success && designsResult.data) {
            const formattedDesigns: UIDesign[] = (designsResult.data || []).map((d: any) => ({
              id: d.id,
              title: d.metadata?.title || 'Untitled Design',
              description: d.metadata?.description || '',
              imageUrl: d.metadata?.imageUrl || '',
              source: d.metadata?.source || 'unknown',
              aesthetic_analysis: d.metadata?.aesthetic_analysis || {
                color_palette: [],
                mood: 'neutral',
                layout_structure: '',
                component_style: ''
              }
            }));

            setScrapedDesigns(formattedDesigns);
          }
        } else if (designsResponse.status === 404) {
          console.debug('UI designs API endpoint not available');
        }
      } catch (fetchError: any) {
        // FIXED: Network errors are expected - use debug
        // Crew: Riker (Tactical) + Quark (Optimization) + O'Brien (Pragmatic)
        const isNetworkError = fetchError.message?.includes('Failed to fetch') || 
                              fetchError.name === 'AbortError';
        if (isNetworkError) {
          console.debug('UI designs API unavailable (network error)');
        } else {
          console.debug('UI designs API error:', fetchError.message);
        }
      }

      // Load dashboard designs for comparison
      try {
        const dashboardsResponse = await fetch('/api/data/vectors?patternType=dashboard&limit=10', {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000)
        });

        if (dashboardsResponse.ok) {
          const dashboardsResult = await dashboardsResponse.json();
          // Check for error responses
          if (dashboardsResult.error) {
            console.debug('Dashboard designs query returned error');
          } else if (dashboardsResult.success && dashboardsResult.data) {
            setDashboardDesigns(dashboardsResult.data.map((d: any) => ({
              id: d.id,
              metadata: d.metadata,
              similarity: 0
            })));
          }
        } else if (dashboardsResponse.status === 404) {
          console.debug('Dashboard designs API endpoint not available');
        } else {
          // Other error statuses - use debug
          console.debug('Dashboard designs API returned status:', dashboardsResponse.status);
        }
      } catch (fetchError: any) {
        // FIXED: Network errors are expected - use debug
        // Crew: Riker (Tactical) + Quark (Optimization) + O'Brien (Pragmatic)
        const isNetworkError = fetchError.message?.includes('Failed to fetch') || 
                              fetchError.name === 'AbortError';
        if (isNetworkError) {
          console.debug('Dashboard designs API unavailable (network error)');
        } else {
          console.debug('Dashboard designs API error:', fetchError.message);
        }
      }
      
      setLoading(false);
    };

    loadDesigns();
  }, []);

  /**
   * Find similar dashboard designs via API route (DDD-compliant)
   */
  const findSimilarDashboards = async (design: UIDesign) => {
    try {
      setSelectedDesign(design);

      // DDD-Compliant: Use API route for vector similarity search
      // For now, use client-side fallback until API route is created
      const comparisons = dashboardDesigns.map(dash => ({
        ...dash,
        similarity: calculateSimilarity(design, dash)
      }));

      // Sort by similarity (highest first)
      comparisons.sort((a, b) => b.similarity - a.similarity);

      // Get top 3 most similar
      setSimilarDashboards(comparisons.slice(0, 3));
    } catch (error: any) {
      // FIXED: Network errors are expected - use debug
      // Crew: Riker (Tactical) + Quark (Optimization) + O'Brien (Pragmatic)
      const isNetworkError = error.message?.includes('Failed to fetch') || 
                            error.name === 'AbortError';
      if (isNetworkError) {
        console.debug('Similar dashboards API unavailable (network error)');
      } else {
        console.debug('Error finding similar dashboards:', error.message);
      }
      setSimilarDashboards([]); // Return empty array on error
    }
  };

  /**
   * Calculate similarity between UI design and dashboard design
   * Uses aesthetic analysis (color palette, mood, layout, component style)
   */
  function calculateSimilarity(design: UIDesign, dashboard: DashboardDesign): number {
    let similarity = 0;
    let factors = 0;

    // Color palette similarity (30% weight)
    const designColors = design.aesthetic_analysis?.color_palette || [];
    const dashColors = dashboard.metadata?.aesthetic_analysis?.color_palette || [];
    if (designColors.length > 0 && dashColors.length > 0) {
      const colorMatch = designColors.filter(c => dashColors.includes(c)).length;
      similarity += (colorMatch / Math.max(designColors.length, dashColors.length)) * 0.3;
      factors += 0.3;
    }

    // Mood similarity (20% weight)
    if (design.aesthetic_analysis?.mood === dashboard.metadata?.aesthetic_analysis?.mood) {
      similarity += 0.2;
      factors += 0.2;
    }

    // Component style similarity (20% weight)
    if (design.aesthetic_analysis?.component_style === dashboard.metadata?.aesthetic_analysis?.component_style) {
      similarity += 0.2;
      factors += 0.2;
    }

    // Layout structure similarity (30% weight)
    if (design.aesthetic_analysis?.layout_structure === dashboard.metadata?.aesthetic_analysis?.layout_structure) {
      similarity += 0.3;
      factors += 0.3;
    }

    // Normalize by factors actually compared
    return factors > 0 ? similarity / factors : 0;
  }

  if (loading) {
    return (
      <div style={{
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 'var(--font-sm)'
      }}>
        Loading design comparisons...
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--card)',
      border: 'var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <h3 style={{
        fontSize: '20px',
        color: 'var(--accent)',
        marginBottom: '16px',
        fontWeight: 600
      }}>
        UI Design Comparison
      </h3>

      {scrapedDesigns.length === 0 && dashboardDesigns.length === 0 ? (
        <div style={{
          padding: 'var(--spacing-lg)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-sm)'
        }}>
          <p style={{ margin: 0 }}>No designs available for comparison</p>
          <p style={{ margin: '8px 0 0 0', fontSize: 'var(--font-xs)', opacity: 0.7 }}>
            Design data will appear here when available
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px'
        }}>
          {/* Scraped UI Designs */}
          {scrapedDesigns.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '16px',
                color: 'var(--text)',
                marginBottom: '12px',
                fontWeight: 600
              }}>
                Scraped UI Designs ({scrapedDesigns.length})
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {scrapedDesigns.slice(0, 5).map(design => (
                  <div
                    key={design.id}
                    onClick={() => findSimilarDashboards(design)}
                    style={{
                      padding: '12px',
                      background: selectedDesign?.id === design.id 
                        ? 'var(--accent)' 
                        : 'var(--card-alt)',
                      border: `1px solid ${selectedDesign?.id === design.id 
                        ? 'var(--accent)' 
                        : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: selectedDesign?.id === design.id 
                        ? 'var(--button-text)' 
                        : 'var(--text)',
                      marginBottom: '4px'
                    }}>
                      {design.title}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: selectedDesign?.id === design.id 
                        ? 'var(--button-text)' 
                        : 'var(--text-muted)',
                      opacity: 0.8
                    }}>
                      {design.description || 'No description'}
                    </div>
                    {design.similarity !== undefined && (
                      <div style={{
                        fontSize: '11px',
                        color: selectedDesign?.id === design.id 
                          ? 'var(--button-text)' 
                          : 'var(--accent)',
                        marginTop: '4px'
                      }}>
                        Similarity: {(design.similarity * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Similar Dashboards */}
          {selectedDesign && similarDashboards.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '16px',
                color: 'var(--text)',
                marginBottom: '12px',
                fontWeight: 600
              }}>
                Similar Dashboards ({similarDashboards.length})
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {similarDashboards.map(dash => (
                  <div
                    key={dash.id}
                    style={{
                      padding: '12px',
                      background: 'var(--card-alt)',
                      border: 'var(--border)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '4px'
                    }}>
                      Dashboard {dash.id}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      Similarity: {(dash.similarity * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
