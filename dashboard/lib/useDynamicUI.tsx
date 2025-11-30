'use client';

/**
 * 🖖 useDynamicUI Hook
 * 
 * React hook for easy integration of dynamic UI system
 * Handles data structure analysis and component generation
 */

import { useState, useEffect, useMemo } from 'react';
import { DynamicUIConfig, NavigationPath } from './dynamic-ui-system';
import { getDesignTrends, getRecommendedDesignConfig } from './crew-design-trends';

export interface UseDynamicUIOptions {
  data: any;
  structure?: any;
  initialPath?: NavigationPath[];
  autoGenerateStructure?: boolean;
}

export function useDynamicUI(options: UseDynamicUIOptions) {
  const { data, structure, initialPath = [], autoGenerateStructure = true } = options;

  const [designTrends, setDesignTrends] = useState<any[]>([]);
  const [designConfig, setDesignConfig] = useState<any>(null);
  const [navigationStack, setNavigationStack] = useState<NavigationPath[]>(initialPath);
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

  // Generate structure from data if needed
  const componentStructure = useMemo(() => {
    if (structure) return structure;
    if (autoGenerateStructure) {
      return generateStructureFromData(data);
    }
    return { type: 'container', children: [] };
  }, [data, structure, autoGenerateStructure]);

  // Build config
  const config: DynamicUIConfig = useMemo(() => ({
    data,
    componentStructure,
    navigationPath: navigationStack,
    designSystem: {
      ...designConfig,
      accessibility: true,
      trends: designConfig?.trends || []
    }
  }), [data, componentStructure, navigationStack, designConfig]);

  const navigate = (path: NavigationPath) => {
    setNavigationStack(prev => [...prev, path]);
  };

  const goBack = () => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  const reset = () => {
    setNavigationStack(initialPath);
  };

  return {
    config,
    loading,
    designTrends,
    designConfig,
    navigationStack,
    navigate,
    goBack,
    reset,
    currentPath: navigationStack[navigationStack.length - 1]
  };
}

/**
 * Generate component structure from data
 */
function generateStructureFromData(data: any): any {
  if (data === null || data === undefined) {
    return {
      type: 'container',
      children: [
        {
          type: 'text',
          props: { variant: 'muted' },
          text: 'No data available'
        }
      ]
    };
  }

  if (Array.isArray(data)) {
    if (data.length === 0) {
      return {
        type: 'container',
        children: [
          {
            type: 'text',
            props: { variant: 'muted' },
            text: 'No items found'
          }
        ]
      };
    }

    // Analyze first item to determine structure
    const firstItem = data[0];
    if (typeof firstItem === 'object' && firstItem !== null) {
      return {
        type: 'grid',
        props: { columns: 'repeat(auto-fill, minmax(300px, 1fr))' },
        children: [
          {
            type: 'list',
            dataPath: '.',
            children: [
              {
                type: 'card',
                children: generateCardChildrenFromObject(firstItem)
              }
            ]
          }
        ]
      };
    }

    return {
      type: 'list',
      dataPath: '.',
      children: [
        {
          type: 'text',
          dataPath: '.'
        }
      ]
    };
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) {
      return {
        type: 'container',
        children: [
          {
            type: 'text',
            props: { variant: 'muted' },
            text: 'Empty object'
          }
        ]
      };
    }

    return {
      type: 'grid',
      props: { columns: 'repeat(auto-fit, minmax(300px, 1fr))' },
      children: keys.map(key => ({
        type: 'card',
        children: [
          {
            type: 'heading',
            props: { level: 4, size: 'md' },
            text: formatKey(key)
          },
          {
            type: 'container',
            children: generateStructureForValue(data[key])
          }
        ]
      }))
    };
  }

  // Primitive value
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

function generateCardChildrenFromObject(obj: any): any[] {
  const children: any[] = [];
  const keys = Object.keys(obj);

  // Add title/name if available
  if (obj.name || obj.title) {
    children.push({
      type: 'heading',
      props: { level: 3, size: 'lg' },
      dataPath: obj.name ? 'name' : 'title'
    });
  }

  // Add description if available
  if (obj.description) {
    children.push({
      type: 'text',
      props: { variant: 'muted' },
      dataPath: 'description'
    });
  }

  // Add other fields
  keys.forEach(key => {
    if (key !== 'name' && key !== 'title' && key !== 'description') {
      const value = obj[key];
      if (value !== null && value !== undefined) {
        children.push({
          type: 'container',
          children: [
            {
              type: 'text',
              props: { size: 'xs', variant: 'muted' },
              text: `${formatKey(key)}: `
            },
            {
              type: 'text',
              dataPath: key
            }
          ]
        });
      }
    }
  });

  return children.length > 0 ? children : [
    {
      type: 'text',
      props: { variant: 'muted' },
      text: 'No content'
    }
  ];
}

function generateStructureForValue(value: any): any[] {
  if (Array.isArray(value)) {
    return [
      {
        type: 'list',
        dataPath: '.',
        children: [
          {
            type: 'text',
            dataPath: '.'
          }
        ]
      }
    ];
  }

  if (typeof value === 'object' && value !== null) {
    return [
      {
        type: 'container',
        children: Object.keys(value).map(key => ({
          type: 'text',
          props: { size: 'sm' },
          text: `${formatKey(key)}: ${String(value[key])}`
        }))
      }
    ];
  }

  return [
    {
      type: 'text',
      dataPath: '.'
    }
  ];
}

function formatKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/^\w/, c => c.toUpperCase());
}

