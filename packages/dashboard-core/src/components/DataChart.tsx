/**
 * Data Chart Component
 * 
 * Reusable chart component for data visualization
 * Supports multiple chart types and theming
 */

import React from 'react';
import { BaseCard, BaseCardProps } from './BaseCard';
import { DashboardComponent, DashboardTheme } from '../types';

export type ChartType = 'line' | 'bar' | 'pie' | 'area' | 'scatter';

export interface DataChartProps extends Omit<BaseCardProps, 'component' | 'children'> {
  component: DashboardComponent;
  data?: any[];
  chartType?: ChartType;
  xAxis?: string;
  yAxis?: string;
  series?: string[];
}

export function DataChart({
  component,
  theme,
  data = [],
  chartType = 'bar',
  xAxis,
  yAxis,
  series = [],
  editable = false,
  onEdit,
  onDelete,
  className = ''
}: DataChartProps) {
  // Simple SVG-based chart rendering
  // In production, use a charting library like recharts or chart.js
  
  const chartData = data || component.data || [];
  const maxValue = chartData.length > 0
    ? Math.max(...chartData.map(d => d[yAxis || 'value'] || 0))
    : 100;

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            {chartData.map((item, index) => {
              const value = item[yAxis || 'value'] || 0;
              const height = (value / maxValue) * 100;
              return (
                <div
                  key={index}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    backgroundColor: theme?.colors.primary || '#0070f3',
                    borderRadius: '4px 4px 0 0',
                    minHeight: '4px'
                  }}
                  title={`${item[xAxis || 'label']}: ${value}`}
                />
              );
            })}
          </div>
        );
      
      case 'line':
        return (
          <svg width="100%" height="200" style={{ border: `1px solid ${theme?.colors.border || '#e0e0e0'}` }}>
            <polyline
              points={chartData.map((item, index) => {
                const x = (index / (chartData.length - 1 || 1)) * 100;
                const y = 100 - ((item[yAxis || 'value'] || 0) / maxValue) * 100;
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke={theme?.colors.primary || '#0070f3'}
              strokeWidth="2"
            />
          </svg>
        );
      
      case 'pie':
        // Simplified pie chart representation
        return (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: `conic-gradient(${chartData.map((_, i) => {
                const colors = [theme?.colors.primary || '#0070f3', theme?.colors.secondary || '#00d4ff', theme?.colors.accent || '#00ffaa'];
                return `${colors[i % colors.length]} ${(i / chartData.length) * 100}% ${((i + 1) / chartData.length) * 100}%`;
              }).join(', ')})`
            }} />
          </div>
        );
      
      default:
        return (
          <div style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme?.colors.textMuted || '#666666'
          }}>
            Chart type "{chartType}" not yet implemented
          </div>
        );
    }
  };

  return (
    <BaseCard
      component={component}
      theme={theme}
      editable={editable}
      onEdit={onEdit}
      onDelete={onDelete}
      className={className}
    >
      {chartData.length > 0 ? (
        <>
          {renderChart()}
          {xAxis && (
            <div style={{
              marginTop: '12px',
              fontSize: theme?.typography?.fontSize?.sm || '12px',
              color: theme?.colors.textMuted || '#666666',
              textAlign: 'center'
            }}>
              {chartData.map((item, index) => (
                <span key={index} style={{ marginRight: '8px' }}>
                  {item[xAxis]}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        <div style={{
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme?.colors.textMuted || '#666666'
        }}>
          No data available
        </div>
      )}
    </BaseCard>
  );
}

