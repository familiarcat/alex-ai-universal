'use client';

/**
 * Vector-Based Priority System Component
 * 
 * Displays dynamic priority visualization based on vector calculations
 * Integrates with Supabase vector storage and crew memories
 * 
 * DDD Architecture: Component => Vector Store => Priority Calculator
 */

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

export interface VectorPriority {
  id: string;
  coordinates: number[];
  magnitude: number;
  timestamp: number;
  domain: string;
  projectId?: string;
  crewMember?: string;
  metadata?: Record<string, any>;
}

export interface PriorityWeights {
  mission: number;
  tactical: number;
  resource: number;
  timeline: number;
}

export class VectorPriorityCalculator {
  private static defaultWeights: PriorityWeights = {
    mission: 0.4,
    tactical: 0.3,
    resource: 0.2,
    timeline: 0.1
  };

  /**
   * Calculate priority magnitude from vector coordinates
   */
  static calculateMagnitude(vector: number[]): number {
    return Math.sqrt(vector.reduce((sum, val) => sum + val ** 2, 0));
  }

  /**
   * Compute priority score using weighted coordinates
   */
  static computePriority(
    coordinates: number[],
    weights: PriorityWeights = this.defaultWeights
  ): number {
    const weightArray = [
      weights.mission,
      weights.tactical,
      weights.resource,
      weights.timeline
    ];
    
    return coordinates.reduce((priority, coord, i) => 
      priority + (coord * (weightArray[i] || 0)), 0);
  }

  /**
   * Normalize vector to unit length
   */
  static normalize(vector: number[]): number[] {
    const magnitude = this.calculateMagnitude(vector);
    if (magnitude === 0) return vector;
    return vector.map(coord => coord / magnitude);
  }
}

interface VectorPrioritySystemProps {
  projectId?: string;
  crewMember?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function VectorPrioritySystem({
  projectId,
  crewMember,
  autoRefresh = true,
  refreshInterval = 5000
}: VectorPrioritySystemProps) {
  const [vectors, setVectors] = useState<VectorPriority[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    // Initialize Supabase client
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    setSupabase(client);
  }, []);

  /**
   * Load vectors from Supabase
   */
  const loadVectors = async () => {
    if (!supabase) return;

    try {
      setLoading(true);
      
      // Query vector embeddings table
      let query = supabase
        .from('vector_embeddings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (projectId) {
        query = query.eq('metadata->>projectId', projectId);
      }

      if (crewMember) {
        query = query.eq('crew_member', crewMember);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      // Transform to VectorPriority format
      const transformedVectors: VectorPriority[] = (data || []).map((item: any) => ({
        id: item.id,
        coordinates: item.embedding || [],
        magnitude: VectorPriorityCalculator.calculateMagnitude(item.embedding || []),
        timestamp: new Date(item.created_at).getTime(),
        domain: item.pattern_type || 'general',
        projectId: item.metadata?.projectId,
        crewMember: item.crew_member,
        metadata: item.metadata
      }));

      // Sort by priority (magnitude)
      transformedVectors.sort((a, b) => b.magnitude - a.magnitude);

      setVectors(transformedVectors);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load vectors');
      console.error('Vector loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabase) {
      loadVectors();
    }
  }, [supabase, projectId, crewMember]);

  useEffect(() => {
    if (!autoRefresh || !supabase) return;

    const interval = setInterval(() => {
      loadVectors();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading priority vectors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Vector-Based Priority System</h3>
        <span className="text-sm text-gray-500">{vectors.length} vectors</span>
      </div>

      {/* Priority Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vectors.map((vector) => {
          const priority = VectorPriorityCalculator.computePriority(vector.coordinates);
          const priorityColor = priority > 0.7 ? 'red' : priority > 0.4 ? 'yellow' : 'green';
          
          return (
            <div
              key={vector.id}
              className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{vector.domain}</span>
                <span className={`px-2 py-1 rounded text-xs bg-${priorityColor}-100 text-${priorityColor}-800`}>
                  {priority.toFixed(2)}
                </span>
              </div>
              
              <div className="space-y-1 text-sm">
                <div>Magnitude: {vector.magnitude.toFixed(2)}</div>
                {vector.crewMember && (
                  <div>Crew: {vector.crewMember}</div>
                )}
                {vector.projectId && (
                  <div>Project: {vector.projectId}</div>
                )}
              </div>

              {/* Vector visualization */}
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${priorityColor}-500 transition-all`}
                  style={{ width: `${Math.min(priority * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {vectors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No priority vectors found. Create some to see them here.
        </div>
      )}
    </div>
  );
}

