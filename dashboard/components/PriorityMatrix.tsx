'use client';

/**
 * Priority Matrix Component
 * 
 * Visualizes vector priorities in a matrix/grid layout
 * Integrates with vector-based priority system
 * 
 * DDD Architecture: Component => Vector Priority System => Visualization
 */

import { useMemo } from 'react';
import VectorPrioritySystem, { VectorPriority, VectorPriorityCalculator } from './VectorPrioritySystem';

interface PriorityMatrixProps {
  vectors: VectorPriority[];
  layout?: 'grid' | 'heatmap' | 'timeline';
  showCrewMember?: boolean;
  showProject?: boolean;
}

export default function PriorityMatrix({
  vectors,
  layout = 'grid',
  showCrewMember = true,
  showProject = true
}: PriorityMatrixProps) {
  // Calculate priorities for all vectors
  const prioritizedVectors = useMemo(() => {
    return vectors.map(vector => ({
      ...vector,
      priority: VectorPriorityCalculator.computePriority(vector.coordinates)
    })).sort((a, b) => b.priority - a.priority);
  }, [vectors]);

  // Group by domain
  const vectorsByDomain = useMemo(() => {
    const grouped: Record<string, VectorPriority[]> = {};
    prioritizedVectors.forEach(vector => {
      if (!grouped[vector.domain]) {
        grouped[vector.domain] = [];
      }
      grouped[vector.domain].push(vector);
    });
    return grouped;
  }, [prioritizedVectors]);

  if (layout === 'heatmap') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Priority Heatmap</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(vectorsByDomain).map(([domain, domainVectors]) => {
            const avgPriority = domainVectors.reduce((sum, v) => sum + (v as any).priority, 0) / domainVectors.length;
            const intensity = Math.min(avgPriority * 100, 100);
            
            return (
              <div
                key={domain}
                className="p-4 border rounded-lg"
                style={{
                  backgroundColor: `rgba(59, 130, 246, ${intensity / 100})`,
                  color: intensity > 50 ? 'white' : 'black'
                }}
              >
                <div className="font-semibold">{domain}</div>
                <div className="text-sm">{domainVectors.length} vectors</div>
                <div className="text-xs mt-1">Avg Priority: {avgPriority.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (layout === 'timeline') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Priority Timeline</h3>
        <div className="space-y-2">
          {prioritizedVectors.map((vector) => {
            const priority = (vector as any).priority;
            const date = new Date(vector.timestamp);
            
            return (
              <div key={vector.id} className="flex items-center gap-4 p-3 border rounded-lg">
                <div className="flex-shrink-0 w-24 text-xs text-gray-500">
                  {date.toLocaleDateString()}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{vector.domain}</div>
                  {showCrewMember && vector.crewMember && (
                    <div className="text-sm text-gray-600">Crew: {vector.crewMember}</div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${Math.min(priority * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{priority.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default grid layout
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Priority Matrix</h3>
        <div className="text-sm text-gray-500">
          {prioritizedVectors.length} vectors across {Object.keys(vectorsByDomain).length} domains
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {prioritizedVectors.map((vector) => {
          const priority = (vector as any).priority;
          const priorityLevel = priority > 0.7 ? 'high' : priority > 0.4 ? 'medium' : 'low';
          const colorClass = priorityLevel === 'high' 
            ? 'border-red-500 bg-red-50' 
            : priorityLevel === 'medium'
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-green-500 bg-green-50';
          
          return (
            <div
              key={vector.id}
              className={`p-4 border-2 rounded-lg transition-all hover:shadow-lg ${colorClass}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">{vector.domain}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  priorityLevel === 'high' ? 'bg-red-100 text-red-800' :
                  priorityLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {priorityLevel.toUpperCase()}
                </span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div>Priority: <strong>{priority.toFixed(2)}</strong></div>
                <div>Magnitude: {vector.magnitude.toFixed(2)}</div>
                {showCrewMember && vector.crewMember && (
                  <div>Crew: <strong>{vector.crewMember}</strong></div>
                )}
                {showProject && vector.projectId && (
                  <div>Project: <strong>{vector.projectId}</strong></div>
                )}
              </div>

              {/* Vector coordinates visualization */}
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-600 mb-1">Vector Coordinates:</div>
                <div className="flex flex-wrap gap-1">
                  {vector.coordinates.slice(0, 4).map((coord, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 bg-gray-100 rounded text-xs"
                      title={`Dimension ${i + 1}: ${coord.toFixed(3)}`}
                    >
                      {coord.toFixed(2)}
                    </span>
                  ))}
                  {vector.coordinates.length > 4 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                      +{vector.coordinates.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

