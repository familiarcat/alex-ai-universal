'use client';

/**
 * 🖖 Service Status Display Component
 * 
 * Compact, collapsible service status display for Bento design system
 * Shows all service containers with their roles and loading status
 * 
 * Crew: Troi (UX) & Data (Visualization) & O'Brien (Compact design)
 */

import { useState } from 'react';
import { useServiceContainers } from '@/lib/service-containers';
import { ServiceStatus } from '@/lib/service-containers';

export default function ServiceStatusDisplay() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getServicesInOrder, getServicesByStatus } = useServiceContainers();
  
  const services = getServicesInOrder();
  const pending = getServicesByStatus('pending');
  const initializing = getServicesByStatus('initializing');
  const loading = getServicesByStatus('loading');
  const ready = getServicesByStatus('ready');
  const error = getServicesByStatus('error');
  const offline = getServicesByStatus('offline');

  if (services.length === 0) {
    return null; // Don't show if no services registered
  }

  const getStatusColor = (status: ServiceStatus): string => {
    switch (status) {
      case 'pending':
        return 'var(--text-secondary, #666)';
      case 'initializing':
        return 'var(--status-info, #4a9eff)';
      case 'loading':
        return 'var(--status-warning, #ffd166)';
      case 'ready':
        return 'var(--status-success, #00ffaa)';
      case 'error':
        return 'var(--status-error, #ff4444)';
      case 'offline':
        return 'var(--text-secondary, #666)';
      default:
        return 'var(--text, #fff)';
    }
  };

  const getStatusIcon = (status: ServiceStatus): string => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'initializing':
        return '🔄';
      case 'loading':
        return '⏳';
      case 'ready':
        return '✅';
      case 'error':
        return '❌';
      case 'offline':
        return '🔌';
      default:
        return '❓';
    }
  };

  const getProgressBar = (service: typeof services[0]) => {
    const { current, total } = service.progress;
    const percentage = total > 0 ? (current / total) * 100 : 0;
    
    return (
      <div style={{
        width: '100%',
        height: '4px',
        background: 'var(--background-secondary, rgba(255,255,255,0.1))',
        borderRadius: '2px',
        overflow: 'hidden',
        marginTop: '4px'
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: getStatusColor(service.status),
          transition: 'width 0.3s ease',
          borderRadius: '2px'
        }} />
      </div>
    );
  };

  // Filter out "Waiting for dependencies..." messages - they're not actionable
  const filteredServices = services.filter(service => {
    // Don't show services stuck in "Waiting for dependencies..." if all dependencies are ready
    if (service.progress.message === 'Waiting for dependencies...') {
      // Check if dependencies are actually ready
      const hasReadyDeps = service.dependencies.every(depId => {
        const depService = services.find(s => s.id === depId);
        return depService?.status === 'ready' || depService?.status === 'error';
      });
      // If dependencies are ready but service is still pending, skip it (likely a false dependency)
      if (hasReadyDeps && service.status === 'pending') {
        return false;
      }
    }
    return true;
  });

  return (
    <div style={{
      padding: '12px',
      background: 'var(--card-bg, rgba(255,255,255,0.03))',
      borderRadius: 'var(--radius, 8px)',
      border: '1px solid var(--border, rgba(255,255,255,0.1))',
      marginBottom: '16px'
    }}>
      {/* Compact Header - Always Visible */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            ▶
          </span>
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text, #fff)',
            margin: 0
          }}>
            🖖 Service Status
          </h3>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--text-secondary, #666)'
        }}>
          <span>✅ {ready.length}</span>
          <span>⏳ {pending.length + initializing.length + loading.length}</span>
          {error.length > 0 && <span>❌ {error.length}</span>}
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          {filteredServices.map((service) => (
            <div
              key={service.id}
              style={{
                padding: '8px',
                background: service.status === 'ready' 
                  ? 'rgba(0,255,170,0.05)' 
                  : 'rgba(255,255,255,0.02)',
                borderRadius: '4px',
                border: `1px solid ${getStatusColor(service.status)}40`,
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>
                    {getStatusIcon(service.status)}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text, #fff)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {service.name}
                  </span>
                </div>
                <span style={{
                  fontSize: '10px',
                  color: 'var(--text-secondary, #666)',
                  whiteSpace: 'nowrap',
                  marginLeft: 'auto'
                }}>
                  {service.role}
                </span>
              </div>
              {/* Only show message if it's meaningful (not "Waiting for dependencies...") */}
              {service.progress.message && 
               service.progress.message !== 'Waiting for dependencies...' && (
                <div style={{
                  fontSize: '10px',
                  color: getStatusColor(service.status),
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  {service.progress.message}
                </div>
              )}
              {service.error && (
                <div style={{
                  fontSize: '10px',
                  color: 'var(--status-error, #ff4444)',
                  marginTop: '4px'
                }}>
                  ⚠️ {service.error}
                </div>
              )}
              {/* Compact progress bar */}
              {service.status !== 'ready' && service.status !== 'error' && getProgressBar(service)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}



