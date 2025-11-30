'use client';

/**
 * Simple Chart Component
 * 
 * Lightweight chart component for analytics dashboard
 * Supports bar, line, and pie charts
 */

import React from 'react';

export type ChartType = 'line' | 'bar' | 'pie';

export interface SimpleChartProps {
  data: Array<{ label: string; value: number }>;
  chartType?: ChartType;
  title?: string;
  height?: number;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export function SimpleChart({
  data,
  chartType = 'bar',
  title,
  height = 200,
  colors = {
    primary: '#0070f3',
    secondary: '#00d4ff',
    accent: '#00ffaa'
  }
}: SimpleChartProps) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666666',
        fontSize: '14px'
      }}>
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));

  const renderBarChart = () => (
    <div style={{
      height: `${height}px`,
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      padding: '16px'
    }}>
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * 100;
        return (
          <div
            key={index}
            style={{
              flex: 1,
              height: `${barHeight}%`,
              backgroundColor: colors.primary,
              borderRadius: '4px 4px 0 0',
              minHeight: '4px',
              position: 'relative',
              transition: 'all 0.3s ease'
            }}
            title={`${item.label}: ${item.value}`}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '11px',
              color: '#666666',
              whiteSpace: 'nowrap'
            }}>
              {item.value}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1 || 1)) * 100;
      const y = 100 - ((item.value / maxValue) * 100);
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg
        width="100%"
        height={height}
        style={{ border: '1px solid #e0e0e0', borderRadius: '4px' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={colors.primary}
          strokeWidth="2"
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1 || 1)) * 100;
          const y = 100 - ((item.value / maxValue) * 100);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={colors.primary}
            />
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    const chartColors = [colors.primary, colors.secondary, colors.accent, '#FF9800', '#9C27B0', '#E91E63'];

    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        <svg width={height} height={height} viewBox="0 0 100 100">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle += angle;

            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (endAngle - 90) * (Math.PI / 180);
            const largeArcFlag = angle > 180 ? 1 : 0;

            const x1 = 50 + 50 * Math.cos(startAngleRad);
            const y1 = 50 + 50 * Math.sin(startAngleRad);
            const x2 = 50 + 50 * Math.cos(endAngleRad);
            const y2 = 50 + 50 * Math.sin(endAngleRad);

            return (
              <path
                key={index}
                d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                fill={chartColors[index % chartColors.length]}
                stroke="#ffffff"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333333'
        }}>
          {total}
        </div>
      </div>
    );
  };

  return (
    <div>
      {title && (
        <div style={{
          marginBottom: '12px',
          fontSize: '16px',
          fontWeight: 600,
          color: '#333333'
        }}>
          {title}
        </div>
      )}
      <div style={{
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        padding: '8px'
      }}>
        {chartType === 'bar' && renderBarChart()}
        {chartType === 'line' && renderLineChart()}
        {chartType === 'pie' && renderPieChart()}
      </div>
      <div style={{
        marginTop: '12px',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        fontSize: '12px',
        color: '#666666'
      }}>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '2px',
              background: chartType === 'pie' 
                ? [colors.primary, colors.secondary, colors.accent, '#FF9800', '#9C27B0', '#E91E63'][index % 6]
                : colors.primary
            }} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

