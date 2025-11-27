'use client';

/**
 * 🖖 Dynamic Data Renderer
 * 
 * Renders UI components dynamically based on data structure
 * Integrates with crew design trends and best practices
 * 
 * Usage:
 *   <DynamicDataRenderer
 *     data={yourData}
 *     structure={componentStructure}
 *     onNavigate={handleNavigate}
 *   />
 */

import React, { useState, useEffect } from 'react';
import { DynamicComponentRenderer, DynamicUIConfig, NavigationPath } from '@/lib/dynamic-ui-system';
import { getDesignTrends, getRecommendedDesignConfig } from '@/lib/crew-design-trends';

interface DynamicDataRendererProps {
  data: any;
  structure?: any; // Component structure definition
  initialPath?: NavigationPath[];
  onDataChange?: (data: any) => void;
}

export default function DynamicDataRenderer({
  data,
  structure,
  initialPath = [],
  onDataChange
}: DynamicDataRendererProps) {
  const [designTrends, setDesignTrends] = useState<any[]>([]);
  const [designConfig, setDesignConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDesignTrends() {
      try {
        // FIXED: Graceful error handling for missing dependencies
        // Crew: O'Brien (Pragmatic) + Troi (UX)
        const trends = await getDesignTrends();
        setDesignTrends(trends);
        const config = getRecommendedDesignConfig(trends);
        setDesignConfig(config);
      } catch (error: any) {
        // FIXED: Silent failure - design trends are optional
        // Don't spam console with errors for missing endpoints
        // Crew: O'Brien (Pragmatic) + Worf (Error Handling)
        console.debug('Design trends unavailable, using defaults');
        setDesignConfig({
          template: 'modern',
          spacing: 'comfortable',
          trends: []
        });
      } finally {
        setLoading(false);
      }
    }

    loadDesignTrends();
  }, []);

  // FIXED: Handle empty data gracefully
  // Crew: Troi (UX) + Data (Analysis)
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
    return (
      <div style={{
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 'var(--font-sm)'
      }}>
        <p style={{ margin: 0 }}>No data available</p>
        <p style={{ margin: '8px 0 0 0', fontSize: 'var(--font-xs)', opacity: 0.7 }}>
          Provide data prop to render content
        </p>
      </div>
    );
  }

  // Auto-generate structure from data if not provided
  let componentStructure;
  try {
    componentStructure = structure || generateStructureFromData(data);
  } catch (err: any) {
    setError(err.message);
    return (
      <div style={{
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
        color: 'var(--status-error)',
        fontSize: 'var(--font-sm)'
      }}>
        <p style={{ margin: 0 }}>Error generating structure</p>
        <p style={{ margin: '8px 0 0 0', fontSize: 'var(--font-xs)', opacity: 0.7 }}>
          {error || 'Unable to process data structure'}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
        color: 'var(--text-muted)'
      }}>
        Loading design system...
      </div>
    );
  }

  try {
    const config: DynamicUIConfig = {
      data,
      componentStructure,
      navigationPath: initialPath,
      designSystem: {
        ...designConfig,
        accessibility: true,
        trends: designConfig?.trends || []
      }
    };

    return <DynamicComponentRenderer config={config} />;
  } catch (err: any) {
    // FIXED: Graceful fallback if DynamicComponentRenderer fails
    // Crew: O'Brien (Pragmatic) + Worf (Error Handling)
    console.error('DynamicComponentRenderer error:', err);
    return (
      <div style={{
        padding: 'var(--spacing-lg)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 'var(--font-sm)'
      }}>
        <p style={{ margin: 0 }}>Component renderer unavailable</p>
        <pre style={{
          margin: '12px 0 0 0',
          padding: '12px',
          background: 'var(--card-bg)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 'var(--font-xs)',
          overflow: 'auto',
          textAlign: 'left'
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    );
  }
}

/**
 * Generate component structure from data automatically
 */
function generateStructureFromData(data: any): any {
  if (Array.isArray(data)) {
    return {
      type: 'list',
      children: [
        {
          type: 'card',
          children: [
            {
              type: 'heading',
              props: { level: 3, size: 'lg' },
              dataPath: 'name'
            },
            {
              type: 'text',
              props: { variant: 'muted' },
              dataPath: 'description'
            }
          ]
        }
      ]
    };
  }

  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    return {
      type: 'grid',
      props: { columns: 'repeat(auto-fit, minmax(300px, 1fr))' },
      children: keys.map(key => ({
        type: 'card',
        children: [
          {
            type: 'heading',
            props: { level: 4, size: 'md' },
            text: key
          },
          {
            type: 'text',
            dataPath: key
          }
        ]
      }))
    };
  }

  return {
    type: 'container',
    children: [
      {
        type: 'text',
        dataPath: '.'
      }
    ]
  };
}

