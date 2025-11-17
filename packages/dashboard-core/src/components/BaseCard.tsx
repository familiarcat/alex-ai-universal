/**
 * Base Card Component
 * 
 * Reusable card component for dashboard layouts
 * Supports theming, editing, and data binding
 */

import React from 'react';
import { DashboardComponent, DashboardTheme } from '../types';

export interface BaseCardProps {
  component: DashboardComponent;
  theme?: DashboardTheme;
  editable?: boolean;
  onEdit?: (componentId: string) => void;
  onDelete?: (componentId: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function BaseCard({
  component,
  theme,
  editable = false,
  onEdit,
  onDelete,
  children,
  className = ''
}: BaseCardProps) {
  const cardStyle: React.CSSProperties = {
    backgroundColor: theme?.colors.surface || '#ffffff',
    border: `1px solid ${theme?.colors.border || '#e0e0e0'}`,
    borderRadius: `${theme?.borderRadius || 8}px`,
    padding: `${theme?.spacing?.padding || 16}px`,
    boxShadow: theme?.shadows?.md || '0 2px 4px rgba(0,0,0,0.1)',
    position: 'relative'
  };

  return (
    <div 
      className={`dashboard-card dashboard-card-${component.type} ${className}`}
      style={cardStyle}
      data-component-id={component.id}
      data-component-type={component.type}
    >
      {editable && (
        <div 
          className="dashboard-card-actions"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            display: 'flex',
            gap: '4px',
            zIndex: 10
          }}
        >
          {onEdit && (
            <button
              onClick={() => onEdit(component.id)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: theme?.colors.primary || '#0070f3',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              ✏️ Edit
            </button>
          )}
          {onDelete && component.deletable !== false && (
            <button
              onClick={() => onDelete(component.id)}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '4px',
                backgroundColor: '#ff4444',
                color: '#ffffff',
                cursor: 'pointer'
              }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}
      
      {component.title && (
        <h3 style={{
          marginTop: 0,
          marginBottom: '12px',
          color: theme?.colors.text || '#000000',
          fontSize: theme?.typography?.fontSize?.lg || '18px'
        }}>
          {component.title}
        </h3>
      )}
      
      <div className="dashboard-card-content">
        {children}
      </div>
    </div>
  );
}

