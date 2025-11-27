'use client';

/**
 * Nested Component Group
 * 
 * Groups related components together within a sub-section.
 * Components in the same group share visual goals and data relationships.
 * 
 * Leadership: Counselor Troi (UX Lead) + Lieutenant Commander La Forge (Implementation)
 */

import React from 'react';

interface NestedComponentGroupProps {
  span?: number; // Grid column span (1-12, default: 12 for full width)
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: string;
}

export default function NestedComponentGroup({
  span = 12,
  children,
  title,
  description,
  icon
}: NestedComponentGroupProps) {
  return (
    <div
      style={{
        gridColumn: `span ${span}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {(title || icon) && (
        <div style={{
          marginBottom: '8px',
          paddingBottom: '12px',
          borderBottom: '1px solid var(--border)'
        }}>
          <h4 style={{
            fontSize: 'var(--font-md)',
            fontWeight: 600,
            color: 'var(--text)',
            margin: 0,
            marginBottom: description ? '4px' : 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {icon && <span>{icon}</span>}
            {title}
          </h4>
          {description && (
            <p style={{
              fontSize: 'var(--font-xs)',
              color: 'var(--text-muted)',
              margin: 0,
              marginTop: '4px'
            }}>
              {description}
            </p>
          )}
        </div>
      )}
      
      {/* Nested Components */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {children}
      </div>
    </div>
  );
}

