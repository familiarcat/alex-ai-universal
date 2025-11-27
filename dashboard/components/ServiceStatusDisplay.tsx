'use client';

/**
 * 🖖 Service Status Display Component
 * 
 * Displays all service containers with their roles and loading status
 * Shows ordered loading sequence and current status
 * 
 * Crew: Troi (UX) & Data (Visualization)
 */

import { useServiceContainers } from '@/lib/service-containers';
import { ServiceStatus } from '@/lib/service-containers';

export default function ServiceStatusDisplay() {
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

  return (
    <div style={{
      padding: 'var(--spacing-md, 16px)',
      background: 'var(--background-secondary, rgba(255,255,255,0.05))',
      borderRadius: 'var(--radius-md, 8px)',
      border: '1px solid var(--border, rgba(255,255,255,0.1))',
      marginBottom: 'var(--spacing-md, 16px)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md, 16px)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-md, 16px)',
          fontWeight: 600,
          color: 'var(--text, #fff)',
          margin: 0
        }}>
          🖖 Service Status
        </h3>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm, 8px)',
          fontSize: 'var(--font-xs, 12px)',
          color: 'var(--text-secondary, #666)'
        }}>
          <span>✅ {ready.length}</span>
          <span>⏳ {pending.length + initializing.length + loading.length}</span>
          <span>❌ {error.length}</span>
          <span>🔌 {offline.length}</span>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm, 8px)'
      }}>
        {services.map((service) => (
          <div
            key={service.id}
            style={{
              padding: 'var(--spacing-sm, 8px)',
              background: service.status === 'ready' 
                ? 'var(--background, rgba(0,255,170,0.05))' 
                : 'var(--background, rgba(255,255,255,0.02))',
              borderRadius: 'var(--radius-sm, 4px)',
              border: `1px solid ${getStatusColor(service.status)}40`,
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 'var(--spacing-sm, 8px)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-xs, 4px)',
                  marginBottom: '2px'
                }}>
                  <span style={{ fontSize: '16px' }}>
                    {getStatusIcon(service.status)}
                  </span>
                  <span style={{
                    fontSize: 'var(--font-sm, 14px)',
                    fontWeight: 600,
                    color: 'var(--text, #fff)'
                  }}>
                    {service.name}
                  </span>
                  <span style={{
                    fontSize: 'var(--font-xs, 12px)',
                    color: 'var(--text-secondary, #666)',
                    marginLeft: 'auto'
                  }}>
                    {service.role}
                  </span>
                </div>
                <div style={{
                  fontSize: 'var(--font-xs, 12px)',
                  color: 'var(--text-secondary, #666)',
                  marginTop: '2px'
                }}>
                  {service.description}
                </div>
                <div style={{
                  fontSize: 'var(--font-xs, 12px)',
                  color: getStatusColor(service.status),
                  marginTop: '4px',
                  fontStyle: 'italic'
                }}>
                  {service.progress.message}
                </div>
                {service.error && (
                  <div style={{
                    fontSize: 'var(--font-xs, 12px)',
                    color: 'var(--status-error, #ff4444)',
                    marginTop: '4px'
                  }}>
                    ⚠️ {service.error}
                  </div>
                )}
                {getProgressBar(service)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



