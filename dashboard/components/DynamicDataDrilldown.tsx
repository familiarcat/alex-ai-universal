'use client';

/**
 * Dynamic Data Drilldown Component
 * 
 * Integrates with Dynamic UI System to provide:
 * - Smart component generation based on data structure
 * - Deep navigation into data points
 * - Relative back button navigation
 * - Design system integration
 * 
 * Crew Integration:
 * - Data: Analyzes data structure to generate optimal UI
 * - Troi: Ensures UX patterns match user expectations
 * - Riker: Organizes navigation structure tactically
 */

import React, { useState, useMemo } from 'react';
import { DynamicComponentRenderer, ComponentStructure, DesignSystemConfig } from '@/lib/dynamic-ui-system';
import { useAppState } from '@/lib/state-manager';

interface DynamicDataDrilldownProps {
  data: any;
  title?: string;
  initialPath?: { label: string; path: string }[];
  onDataChange?: (data: any) => void;
}

export default function DynamicDataDrilldown({
  data,
  title,
  initialPath = [{ label: 'Root', path: '/' }],
  onDataChange
}: DynamicDataDrilldownProps) {
  const { globalTheme } = useAppState();
  
  // Generate component structure from data
  const componentStructure = useMemo(() => {
    return generateComponentStructure(data);
  }, [data]);
  
  // Design system config based on global theme
  const designSystem: DesignSystemConfig = useMemo(() => {
    return {
      theme: globalTheme,
      spacing: 'comfortable',
      density: 'medium',
      accessibility: true,
      trends: ['rounded-corners', 'soft-shadows'] // From crew design trends
    };
  }, [globalTheme]);
  
  const config = {
    data,
    componentStructure,
    navigationPath: initialPath,
    designSystem
  };
  
  return (
    <div style={{
      background: 'var(--card)',
      border: 'var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      marginBottom: '24px'
    }}>
      {title && (
        <h3 style={{
          fontSize: '20px',
          color: 'var(--accent)',
          marginBottom: '16px',
          fontWeight: 600
        }}>
          {title}
        </h3>
      )}
      <DynamicComponentRenderer config={config} />
    </div>
  );
}

/**
 * Generate component structure from data
 * Analyzes data structure and creates appropriate UI components
 */
function generateComponentStructure(data: any): ComponentStructure {
  if (!data) {
    return {
      type: 'text',
      props: { text: 'No data available' }
    };
  }
  
  // If data is an array, render as a list
  if (Array.isArray(data)) {
    return {
      type: 'list',
      props: {},
      children: data.map((item, index) => ({
        type: 'card',
        props: {
          onClick: () => {
            // Navigate to item detail
            console.log('Navigate to item:', item);
          }
        },
        children: [
          {
            type: 'heading',
            props: { level: 3, text: item.name || item.title || `Item ${index + 1}` }
          },
          {
            type: 'text',
            props: { text: item.description || JSON.stringify(item, null, 2) }
          },
          {
            type: 'button',
            props: {
              label: 'View Details',
              variant: 'primary',
              navigate: {
                label: item.name || item.title || `Item ${index + 1}`,
                path: `/item/${index}`,
                data: item
              }
            }
          }
        ]
      }))
    };
  }
  
  // If data is an object, render as a grid of key-value pairs
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    
    return {
      type: 'grid',
      props: {
        columns: 'repeat(auto-fit, minmax(250px, 1fr))'
      },
      children: keys.map(key => {
        const value = data[key];
        const isNested = typeof value === 'object' && value !== null;
        
        return {
          type: 'card',
          props: {
            onClick: isNested ? () => {
              // Navigate to nested data
              console.log('Navigate to nested:', key, value);
            } : undefined
          },
          children: [
            {
              type: 'heading',
              props: { level: 4, text: key }
            },
            {
              type: 'text',
              props: {
                text: isNested
                  ? `${Array.isArray(value) ? 'Array' : 'Object'} (${isNested ? Object.keys(value).length : 0} items)`
                  : String(value)
              }
            },
            ...(isNested ? [{
              type: 'button',
              props: {
                label: 'Explore',
                variant: 'primary',
                navigate: {
                  label: key,
                  path: `/${key}`,
                  data: value
                }
              }
            }] : [])
          ]
        };
      })
    };
  }
  
  // Primitive value - just display as text
  return {
    type: 'text',
    props: { text: String(data) }
  };
}

