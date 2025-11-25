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

  useEffect(() => {
    async function loadDesignTrends() {
      try {
        const trends = await getDesignTrends();
        setDesignTrends(trends);
        const config = getRecommendedDesignConfig(trends);
        setDesignConfig(config);
      } catch (error) {
        console.error('Failed to load design trends:', error);
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

  // Auto-generate structure from data if not provided
  const componentStructure = structure || generateStructureFromData(data);

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

