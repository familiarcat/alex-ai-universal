'use client';

/**
 * 🖖 Terminal Window Component
 * 
 * Interactive terminal-style window for visualizing processes and their progress
 * Shows real-time updates with scrollable output and progress indicators
 * 
 * Leadership: Geordi La Forge (Infrastructure) + Commander Data (Analytics)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useProgressContext } from '@/lib/ProgressContext';
import UniversalProgressBar from './UniversalProgressBar';

interface TerminalLine {
  id: string;
  timestamp: string;
  type: 'output' | 'error' | 'success' | 'info' | 'progress';
  content: string;
  taskId?: string;
}

interface TerminalWindowProps {
  title?: string;
  autoScroll?: boolean;
  maxLines?: number;
  showProgressBars?: boolean;
  height?: string;
}

export default function TerminalWindow({
  title = '🖖 Process Monitor',
  autoScroll = true,
  maxLines = 100,
  showProgressBars = true,
  height = '400px'
}: TerminalWindowProps) {
  const { items: progressItems } = useProgressContext();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const lineIdCounter = useRef(0);

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (autoScroll && terminalRef.current && !isMinimized) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines, autoScroll, isMinimized]);

  // Add progress items as terminal lines
  useEffect(() => {
    if (showProgressBars && progressItems.length > 0) {
      const newLines: TerminalLine[] = progressItems.map(item => ({
        id: `progress-${item.id}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'progress',
        content: item.description || 'Progress',
        taskId: item.id
      }));

      setLines(prev => {
        // Remove old progress lines and add new ones
        const filtered = prev.filter(line => line.type !== 'progress');
        const combined = [...filtered, ...newLines];
        
        // Limit to maxLines
        if (combined.length > maxLines) {
          return combined.slice(-maxLines);
        }
        return combined;
      });
    }
  }, [progressItems, showProgressBars, maxLines]);

  // Expose method to add lines (can be called from parent)
  const addLine = (content: string, type: TerminalLine['type'] = 'output') => {
    const newLine: TerminalLine = {
      id: `line-${++lineIdCounter.current}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      content
    };

    setLines(prev => {
      const updated = [...prev, newLine];
      if (updated.length > maxLines) {
        return updated.slice(-maxLines);
      }
      return updated;
    });
  };

  // Note: addLine can be called via ref if needed in the future
  // For now, it's available internally for progress updates

  const getLineStyle = (type: TerminalLine['type']) => {
    const baseStyle: React.CSSProperties = {
      fontFamily: 'monospace',
      fontSize: '13px',
      lineHeight: '1.6',
      padding: '2px 0',
      wordBreak: 'break-word'
    };

    switch (type) {
      case 'error':
        return { ...baseStyle, color: '#ff5e5e' };
      case 'success':
        return { ...baseStyle, color: '#00ffaa' };
      case 'info':
        return { ...baseStyle, color: '#00d4ff' };
      case 'progress':
        return { ...baseStyle, color: '#d0d0d0' };
      default:
        return { ...baseStyle, color: '#d0d0d0' };
    }
  };

  const getLinePrefix = (type: TerminalLine['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'info':
        return 'ℹ️';
      case 'progress':
        return '📊';
      default:
        return '$';
    }
  };

  if (isMinimized) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 10000,
        background: 'rgba(10, 10, 15, 0.95)',
        border: '1px solid var(--accent, rgba(0, 255, 170, 0.2))',
        borderRadius: '8px',
        padding: '8px 12px',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)'
      }}
      onClick={() => setIsMinimized(false)}
      >
        <div style={{
          fontSize: '12px',
          color: 'var(--accent, #00ffaa)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🖖</span>
          <span>{title}</span>
          <span style={{ fontSize: '10px', color: '#888' }}>
            ({lines.length} lines)
          </span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '600px',
      height: height,
      zIndex: 10000,
      background: 'rgba(10, 10, 15, 0.98)',
      border: '1px solid var(--accent, rgba(0, 255, 170, 0.3))',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Terminal Header */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '8px 12px',
        borderBottom: '1px solid var(--accent, rgba(0, 255, 170, 0.2))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'move'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--accent, #00ffaa)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>🖖</span>
          <span>{title}</span>
          {progressItems.length > 0 && (
            <span style={{
              fontSize: '10px',
              color: '#888',
              background: 'rgba(0, 255, 170, 0.1)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {progressItems.length} active
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsMinimized(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '0 4px',
              lineHeight: '1'
            }}
            title="Minimize"
          >
            ─
          </button>
          <button
            onClick={() => setLines([])}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '0 4px'
            }}
            title="Clear"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Terminal Content */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px',
          background: 'rgba(0, 0, 0, 0.2)',
          fontFamily: 'monospace'
        }}
      >
        {lines.length === 0 ? (
          <div style={{
            color: '#666',
            fontSize: '12px',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px'
          }}>
            No output yet. Processes will appear here...
          </div>
        ) : (
          lines.map(line => (
            <div key={line.id} style={{ marginBottom: '4px' }}>
              {line.type === 'progress' && showProgressBars ? (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{
                    fontSize: '11px',
                    color: '#888',
                    marginBottom: '4px',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                    <span>{getLinePrefix(line.type)} {line.content}</span>
                    <span>{line.timestamp}</span>
                  </div>
                  {progressItems.find(item => item.id === line.taskId) && (
                    <UniversalProgressBar
                      current={progressItems.find(item => item.id === line.taskId)!.current}
                      total={progressItems.find(item => item.id === line.taskId)!.total}
                      description=""
                      status={progressItems.find(item => item.id === line.taskId)!.status}
                      showPercentage={true}
                    />
                  )}
                </div>
              ) : (
                <div style={getLineStyle(line.type)}>
                  <span style={{ color: '#666', marginRight: '8px' }}>
                    [{line.timestamp}]
                  </span>
                  <span style={{ marginRight: '8px' }}>
                    {getLinePrefix(line.type)}
                  </span>
                  <span>{line.content}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Terminal Footer */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '6px 12px',
        borderTop: '1px solid var(--accent, rgba(0, 255, 170, 0.2))',
        fontSize: '10px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>{lines.length} lines</span>
        <span>{progressItems.length} active processes</span>
      </div>
    </div>
  );
}

