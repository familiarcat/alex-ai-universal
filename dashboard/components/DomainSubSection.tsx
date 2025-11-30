'use client';

/**
 * Domain Sub-Section Component
 * 
 * Groups components by visual goal and data relationships within a DDD domain.
 * This enables nested component architecture where related components are visually
 * grouped together.
 * 
 * Leadership: Counselor Troi (UX Lead) + Commander Data (Architecture)
 * Crew: All teams working in parallel
 */

import React, { useState } from 'react';

interface DomainSubSectionProps {
  visualGoal: string; // e.g., "analytics", "memory", "recommendations"
  dataVector?: string; // Supabase table/vector name (e.g., "knowledge_base", "crew_memories")
  title: string;
  description?: string;
  icon?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  ctaConfig?: {
    label: string;
    href: string;
    level?: 'primary' | 'secondary' | 'tertiary';
  };
}

export default function DomainSubSection({
  visualGoal,
  dataVector,
  title,
  description,
  icon,
  children,
  defaultExpanded = true,
  ctaConfig
}: DomainSubSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      style={{
        marginBottom: '24px',
        padding: '20px',
        background: 'var(--card-bg)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Sub-Section Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isExpanded ? '20px' : '0',
          cursor: 'pointer',
          userSelect: 'none',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          background: isExpanded ? 'var(--background-light)' : 'transparent',
          transition: 'all 0.2s ease'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ 
            fontSize: '20px', 
            transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', 
            transition: 'transform 0.3s ease' 
          }}>
            {isExpanded ? '▼' : '▶'}
          </span>
          {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: 'var(--font-lg)',
              fontWeight: 600,
              color: 'var(--accent)',
              margin: 0,
              marginBottom: description ? '4px' : 0
            }}>
              {title}
            </h3>
            {description && (
              <p style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--text-muted)',
                margin: 0
              }}>
                {description}
              </p>
            )}
          </div>
        </div>
        
        {/* CTA Button (if configured) */}
        {ctaConfig && isExpanded && (
          <div style={{ marginLeft: '16px' }}>
            <a
              href={ctaConfig.href}
              style={{
                padding: '8px 16px',
                background: ctaConfig.level === 'primary' 
                  ? 'var(--accent)' 
                  : ctaConfig.level === 'secondary'
                    ? 'var(--card-alt)'
                    : 'transparent',
                color: ctaConfig.level === 'primary'
                  ? 'var(--button-text)'
                  : 'var(--text)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: 'var(--font-sm)',
                border: ctaConfig.level === 'tertiary' ? '1px solid var(--border)' : 'none',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
              onClick={(e) => {
                // Prevent section collapse when clicking CTA
                e.stopPropagation();
              }}
            >
              {ctaConfig.label}
              <span style={{ fontSize: '14px' }}>→</span>
            </a>
          </div>
        )}
      </div>

      {/* Sub-Section Content (Nested Components) */}
      {isExpanded && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '16px',
          animation: 'fadeIn 0.3s ease'
        }}>
          {children}
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

