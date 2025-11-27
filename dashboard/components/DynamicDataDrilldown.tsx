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
  
  // FIXED: Handle empty data gracefully
  // Crew: Troi (UX) + Data (Analysis)
  if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
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
        <div style={{
          padding: 'var(--spacing-lg)',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: 'var(--font-sm)'
        }}>
          <p style={{ margin: 0 }}>Empty object</p>
          <p style={{ margin: '8px 0 0 0', fontSize: 'var(--font-xs)', opacity: 0.7 }}>
            Provide data prop to analyze
          </p>
        </div>
      </div>
    );
  }
  
  // Generate component structure from data
  const componentStructure = useMemo(() => {
    try {
      return generateComponentStructure(data);
    } catch (err: any) {
      console.error('Error generating component structure:', err);
      return {
        id: 'error-structure',
        type: 'text',
        props: { text: 'Error generating structure' }
      };
    }
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
  
  try {
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
  } catch (err: any) {
    // FIXED: Graceful fallback if DynamicComponentRenderer fails
    // Crew: O'Brien (Pragmatic) + Worf (Error Handling)
    console.error('DynamicComponentRenderer error:', err);
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
            textAlign: 'left',
            maxHeight: '200px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  }
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
      id: 'array-list',
      type: 'list',
      props: {},
      children: data.map((item, index) => ({
        id: `array-item-${index}`,
        type: 'card',
        props: {
          onClick: () => {
            // Navigate to item detail
            console.log('Navigate to item:', item);
          }
        },
        children: [
          {
            id: `array-item-${index}-heading`,
            type: 'heading',
            props: { level: 3, text: item.name || item.title || `Item ${index + 1}` }
          },
          {
            id: `array-item-${index}-text`,
            type: 'text',
            props: { text: item.description || JSON.stringify(item, null, 2) }
          },
          {
            id: `array-item-${index}-button`,
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
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    
    // Handle empty objects
    if (keys.length === 0) {
      return {
        id: 'empty-object',
        type: 'text',
        props: { text: 'Empty object' }
      };
    }
    
    return {
      id: 'object-grid',
      type: 'grid',
      props: {
        columns: 'repeat(auto-fit, minmax(250px, 1fr))'
      },
      children: keys.map(key => {
        const value = data[key];
        const isNestedObject = typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
        const isArray = Array.isArray(value);
        const isPrimitive = !isNestedObject && !isArray;
        
        // Format value for display
        let displayValue: string;
        if (isArray) {
          displayValue = `Array (${value.length} items)`;
        } else if (isNestedObject) {
          const nestedKeys = Object.keys(value);
          displayValue = `Object (${nestedKeys.length} ${nestedKeys.length === 1 ? 'key' : 'keys'})`;
        } else if (value === null) {
          displayValue = 'null';
        } else if (value === undefined) {
          displayValue = 'undefined';
        } else if (typeof value === 'boolean') {
          displayValue = String(value);
        } else if (typeof value === 'number') {
          displayValue = String(value);
        } else {
          displayValue = String(value);
        }
        
        return {
          id: `object-key-${key}`,
          type: 'card',
          props: {
            onClick: (isNestedObject || isArray) ? () => {
              // Navigate to nested data
              console.log('Navigate to nested:', key, value);
            } : undefined
          },
          children: [
            {
              id: `object-key-${key}-heading`,
              type: 'heading',
              props: { level: 4, text: key }
            },
            {
              id: `object-key-${key}-text`,
              type: 'text',
              props: {
                text: displayValue
              }
            },
            ...((isNestedObject || isArray) ? [{
              id: `object-key-${key}-button`,
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
    id: 'primitive-text',
    type: 'text',
    props: { text: String(data) }
  };
}

