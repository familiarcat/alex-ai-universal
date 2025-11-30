'use client';

/**
 * Vector-Based Dashboard Component
 * 
 * Main dashboard component integrating vector-based priority system
 * with dynamic component interchangeability
 * 
 * DDD Architecture: Dashboard => Vector System => Dynamic Components
 */

import { useState, useEffect } from 'react';
import VectorPrioritySystem, { VectorPriority } from './VectorPrioritySystem';
import PriorityMatrix from './PriorityMatrix';
import { DynamicComponentRegistry, ComponentGrid, PriorityComponentSelector } from './DynamicComponentRegistry';
// REMOVED: Direct Supabase import - now using API routes (DDD-compliant)

interface VectorBasedDashboardProps {
  projectId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function VectorBasedDashboard({
  projectId,
  autoRefresh = true,
  refreshInterval = 5000
}: VectorBasedDashboardProps) {
  const [vectors, setVectors] = useState<VectorPriority[]>([]);
  const [selectedLayout, setSelectedLayout] = useState<'grid' | 'heatmap' | 'timeline'>('grid');
  const [loading, setLoading] = useState(true);

  // Load vectors via API route (DDD-compliant)
  useEffect(() => {
    const loadVectors = async () => {
      try {
        setLoading(true);
        
        // DDD-Compliant: Use API route (controller layer)
        const url = new URL('/api/data/vectors', window.location.origin);
        url.searchParams.set('limit', '50');
        if (projectId) {
          url.searchParams.set('projectId', projectId);
        }

        // FIXED: Graceful error handling for optional feature
        // Crew: Riker (Tactical) + Quark (Optimization) + O'Brien (Pragmatic)
        const response = await fetch(url.toString(), {
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'no-store',
          signal: AbortSignal.timeout(5000)
        });

        if (response.ok) {
          const result = await response.json();
          // Check for error responses
          if (result.error) {
            console.debug('Vector dashboard query returned error');
            setVectors([]);
            setLoading(false);
            return;
          }
          if (result.success && result.data) {
            const transformed: VectorPriority[] = (result.data || []).map((item: any) => ({
              id: item.id,
              coordinates: item.embedding || [],
              magnitude: Math.sqrt((item.embedding || []).reduce((sum: number, val: number) => sum + val ** 2, 0)),
              timestamp: new Date(item.created_at).getTime(),
              domain: item.pattern_type || 'general',
              projectId: item.metadata?.projectId,
              crewMember: item.crew_member,
              metadata: item.metadata
            }));

            setVectors(transformed);
          }
        }
      } catch (error: any) {
        console.error('Failed to load vectors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVectors();

    if (autoRefresh) {
      const interval = setInterval(loadVectors, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [projectId, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading vector-based dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vector-Based Priority Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Dynamic control over multiple projects using vector-based priority logic
          </p>
        </div>
        
        {/* Layout Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedLayout('grid')}
            className={`px-4 py-2 rounded-lg border ${
              selectedLayout === 'grid' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setSelectedLayout('heatmap')}
            className={`px-4 py-2 rounded-lg border ${
              selectedLayout === 'heatmap' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Heatmap
          </button>
          <button
            onClick={() => setSelectedLayout('timeline')}
            className={`px-4 py-2 rounded-lg border ${
              selectedLayout === 'timeline' 
                ? 'bg-blue-500 text-white border-blue-500' 
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {/* Priority Matrix */}
      <div className="bg-white rounded-lg shadow p-6">
        <PriorityMatrix
          vectors={vectors}
          layout={selectedLayout}
          showCrewMember={true}
          showProject={true}
        />
      </div>

      {/* Dynamic Components Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dynamic Components</h2>
        <PriorityComponentSelector
          vectors={vectors.map(v => ({
            id: v.id,
            priority: v.magnitude,
            domain: v.domain
          }))}
          maxComponents={12}
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Vectors</div>
          <div className="text-2xl font-bold">{vectors.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Domains</div>
          <div className="text-2xl font-bold">
            {new Set(vectors.map(v => v.domain)).size}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Avg Priority</div>
          <div className="text-2xl font-bold">
            {vectors.length > 0
              ? (vectors.reduce((sum, v) => sum + v.magnitude, 0) / vectors.length).toFixed(2)
              : '0.00'}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Crew Members</div>
          <div className="text-2xl font-bold">
            {new Set(vectors.map(v => v.crewMember).filter(Boolean)).size}
          </div>
        </div>
      </div>
    </div>
  );
}

