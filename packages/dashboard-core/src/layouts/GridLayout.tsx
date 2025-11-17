/**
 * Grid Layout Component
 * 
 * Responsive grid layout for dashboard components
 * Supports drag-and-drop reordering and responsive breakpoints
 */

import React from 'react';
import { DashboardComponent, DashboardTheme, LayoutConfig } from '../types';

export interface GridLayoutProps {
  components: DashboardComponent[];
  config?: LayoutConfig;
  theme?: DashboardTheme;
  renderComponent: (component: DashboardComponent) => React.ReactNode;
  onComponentReorder?: (componentIds: string[]) => void;
  editable?: boolean;
  className?: string;
}

export function GridLayout({
  components,
  config,
  theme,
  renderComponent,
  onComponentReorder,
  editable = false,
  className = ''
}: GridLayoutProps) {
  const columns = config?.columns || 3;
  const gap = config?.gap || theme?.spacing?.gap || 16;

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    padding: `${config?.padding || theme?.spacing?.padding || 16}px`
  };

  // Responsive breakpoints
  const responsiveStyle = `
    @media (max-width: 1024px) {
      .dashboard-grid {
        grid-template-columns: repeat(${Math.max(1, columns - 1)}, 1fr) !important;
      }
    }
    @media (max-width: 768px) {
      .dashboard-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyle}</style>
      <div 
        className={`dashboard-grid ${className}`}
        style={gridStyle}
      >
        {components.map(component => (
          <div
            key={component.id}
            data-component-id={component.id}
            style={{
              minHeight: '100px'
            }}
          >
            {renderComponent(component)}
          </div>
        ))}
      </div>
    </>
  );
}

