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
import { createClient } from '@supabase/supabase-js';

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
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    setSupabase(client);
  }, []);

  /**
   * Load scraped UI designs from Supabase
   */
  useEffect(() => {
    if (!supabase) return;

    const loadDesigns = async () => {
      try {
        setLoading(true);

        // Load scraped UI designs
        const { data: designs, error } = await supabase
          .from('vector_embeddings')
          .select('*')
          .eq('pattern_type', 'ui_design')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        const formattedDesigns: UIDesign[] = (designs || []).map((d: any) => ({
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

        // Load dashboard designs for comparison
        const { data: dashboards, error: dashError } = await supabase
          .from('vector_embeddings')
          .select('*')
          .eq('pattern_type', 'dashboard')
          .limit(10);

        if (!dashError && dashboards) {
          setDashboardDesigns(dashboards.map((d: any) => ({
            id: d.id,
            metadata: d.metadata,
            similarity: 0
          })));
        }
      } catch (error: any) {
        console.error('Error loading designs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDesigns();
  }, [supabase]);

  /**
   * Find similar dashboard designs
   */
  const findSimilarDashboards = async (design: UIDesign) => {
    if (!supabase) return;

    try {
      setSelectedDesign(design);

      // Get the design's embedding
      const { data: designData, error } = await supabase
        .from('vector_embeddings')
        .select('embedding')
        .eq('id', design.id)
        .single();

      if (error || !designData?.embedding) {
        console.error('Error getting design embedding:', error);
        return;
      }

      // Find similar dashboard designs using vector similarity
      const { data: similar, error: similarError } = await supabase.rpc(
        'match_vectors',
        {
          query_embedding: designData.embedding,
          match_threshold: 0.7,
          match_count: 5,
          pattern_type_filter: 'dashboard'
        }
      );

      if (similarError) {
        // Fallback: manual comparison
        const comparisons = dashboardDesigns.map(dash => ({
          ...dash,
          similarity: calculateSimpleSimilarity(design, dash)
        })).sort((a, b) => b.similarity - a.similarity);

        setSimilarDashboards(comparisons.slice(0, 5));
      } else {
        setSimilarDashboards((similar || []).map((s: any) => ({
          id: s.id,
          metadata: s.metadata,
          similarity: s.similarity || 0
        })));
      }
    } catch (error: any) {
      console.error('Error finding similar dashboards:', error);
    }
  };

  /**
   * Calculate simple similarity based on aesthetic factors
   */
  const calculateSimpleSimilarity = (design: UIDesign, dashboard: DashboardDesign): number => {
    let similarity = 0;
    let factors = 0;

    // Compare color palettes
    const designColors = design.aesthetic_analysis?.color_palette || [];
    const dashColors = dashboard.metadata?.aesthetic_analysis?.color_palette || [];
    if (designColors.length > 0 && dashColors.length > 0) {
      const colorMatch = designColors.filter(c => dashColors.includes(c)).length;
      similarity += (colorMatch / Math.max(designColors.length, dashColors.length)) * 0.3;
      factors += 0.3;
    }

    // Compare mood
    if (design.aesthetic_analysis?.mood === dashboard.metadata?.aesthetic_analysis?.mood) {
      similarity += 0.2;
    }
    factors += 0.2;

    // Compare component style
    if (design.aesthetic_analysis?.component_style === dashboard.metadata?.aesthetic_analysis?.component_style) {
      similarity += 0.2;
    }
    factors += 0.2;

    // Compare layout structure
    if (design.aesthetic_analysis?.layout_structure === dashboard.metadata?.aesthetic_analysis?.layout_structure) {
      similarity += 0.3;
    }
    factors += 0.3;

    return factors > 0 ? similarity / factors : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading UI designs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">UI Design Comparison</h2>
          <p className="text-gray-600 mt-1">
            Compare scraped UI designs with dashboard designs using aesthetic similarity
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {scrapedDesigns.length} scraped designs
        </div>
      </div>

      {/* Scraped Designs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scrapedDesigns.map((design) => (
          <div
            key={design.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => findSimilarDashboards(design)}
          >
            {design.imageUrl && (
              <div className="aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={design.imageUrl}
                  alt={design.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <div className="p-4">
              <h3 className="font-semibold">{design.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{design.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-500">Source: {design.source}</span>
                {design.aesthetic_analysis?.mood && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    design.aesthetic_analysis.mood === 'bright' ? 'bg-yellow-100 text-yellow-800' :
                    design.aesthetic_analysis.mood === 'dark' ? 'bg-gray-800 text-white' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {design.aesthetic_analysis.mood}
                  </span>
                )}
              </div>
              {design.aesthetic_analysis?.color_palette && design.aesthetic_analysis.color_palette.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {design.aesthetic_analysis.color_palette.slice(0, 5).map((color, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Similar Dashboards Modal */}
      {selectedDesign && similarDashboards.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Similar Dashboard Designs</h3>
              <button
                onClick={() => {
                  setSelectedDesign(null);
                  setSimilarDashboards([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Comparing with: <strong>{selectedDesign.title}</strong></p>
            </div>
            <div className="space-y-4">
              {similarDashboards.map((dashboard) => (
                <div key={dashboard.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {dashboard.metadata?.title || 'Dashboard Design'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Similarity: {(dashboard.similarity * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${dashboard.similarity * 100}%` }}
                      />
                    </div>
                  </div>
                  {dashboard.metadata?.aesthetic_analysis && (
                    <div className="mt-2 text-sm">
                      <p>Mood: {dashboard.metadata.aesthetic_analysis.mood}</p>
                      {dashboard.metadata.aesthetic_analysis.color_palette && (
                        <div className="flex gap-1 mt-1">
                          {dashboard.metadata.aesthetic_analysis.color_palette.slice(0, 5).map((color: string, i: number) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {scrapedDesigns.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No scraped UI designs found.</p>
          <p className="text-sm mt-2">Run the UI design experiment to scrape and analyze designs.</p>
        </div>
      )}
    </div>
  );
}

