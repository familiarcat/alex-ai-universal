'use client';

/**
 * 🖖 Progress Overlay Component
 * 
 * Displays progress bars for all active async operations
 * Appears as a floating overlay in the top-right corner
 * Now includes Terminal Window for interactive process monitoring
 */

import React, { useState } from 'react';
import UniversalProgressBar from './UniversalProgressBar';
import TerminalWindow from './TerminalWindow';
import { useProgressContext } from '@/lib/ProgressContext';

export default function ProgressOverlay() {
  const { items } = useProgressContext();
  const [showTerminal, setShowTerminal] = useState(false);
  
  if (items.length === 0 && !showTerminal) {
    return null;
  }
  
  return (
    <>
      {/* Compact Progress Overlay */}
      {items.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 10000,
          maxWidth: '400px',
          maxHeight: '60vh',
          overflowY: 'auto',
          background: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--accent, rgba(0, 255, 170, 0.2))',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent, #00ffaa)',
            marginBottom: '8px',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--accent, rgba(0, 255, 170, 0.2))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>🖖 Active Operations ({items.length})</span>
            <button
              onClick={() => setShowTerminal(!showTerminal)}
              style={{
                background: 'rgba(0, 255, 170, 0.1)',
                border: '1px solid var(--accent, rgba(0, 255, 170, 0.3))',
                borderRadius: '4px',
                color: 'var(--accent, #00ffaa)',
                padding: '4px 8px',
                fontSize: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 170, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 255, 170, 0.1)';
              }}
            >
              {showTerminal ? '📊 Hide Terminal' : '🖥️ Show Terminal'}
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {items.map(item => (
              <UniversalProgressBar
                key={item.id}
                current={item.current}
                total={item.total}
                description={item.description}
                status={item.status}
              />
            ))}
          </div>
        </div>
      )}

      {/* Terminal Window for Interactive Monitoring */}
      {showTerminal && (
        <TerminalWindow
          title="🖖 Process Monitor"
          autoScroll={true}
          maxLines={100}
          showProgressBars={true}
          height="500px"
        />
      )}
    </>
  );
}

