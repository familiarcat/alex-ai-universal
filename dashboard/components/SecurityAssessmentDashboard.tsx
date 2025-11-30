'use client';

/**
 * Security Assessment Dashboard Component
 * 
 * Continuous security monitoring and peer audit interface
 * 
 * Recommendations from:
 * - Lieutenant Worf: Intensified focus on continual security assessments and peer audits
 * - Lieutenant Uhura: Continuous monitoring and routine audits for automated systems
 * 
 * Reviewed by: Lieutenant Worf (Security) & Lieutenant Uhura (Communications)
 */

import { useEffect, useState, useRef } from 'react';
import DataStatusBadge, { useDataStatus } from './DataStatusBadge';
import { getUnifiedDataService } from '@/lib/unified-data-service';

interface SecurityMetric {
  category: string;
  status: 'secure' | 'warning' | 'critical';
  score: number;
  lastAudit: string;
  issues: number;
  description: string;
}

interface AuditLog {
  timestamp: string;
  auditor: string;
  category: string;
  action: string;
  result: 'passed' | 'failed' | 'warning';
  details: string;
}

export default function SecurityAssessmentDashboard() {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallScore, setOverallScore] = useState(0);
  const [dataResponse, setDataResponse] = useState<any>(null);

  // FIXED: Use static import instead of dynamic import to prevent HMR warnings
  // Crew: La Forge (Infrastructure) + Data (Analysis)
  const serviceRef = useRef<ReturnType<typeof getUnifiedDataService> | null>(null);
  
  // FIXED: Add error check to prevent infinite retry loops
  // Crew: Data (Analysis) & La Forge (Implementation)
  useEffect(() => {
    // Initialize service once (stable reference for HMR)
    if (!serviceRef.current) {
      serviceRef.current = getUnifiedDataService();
    }
    
    // Only fetch if not already in error state (prevents infinite retries)
    if (!error) {
      fetchSecurityData();
    }
    // Cost optimization: Only poll when tab is visible, increased interval to 5 minutes
    let intervalId: NodeJS.Timeout | null = null;
    
    const setupPolling = () => {
      if (intervalId) clearInterval(intervalId);
      if (!document.hidden) {
        intervalId = setInterval(fetchSecurityData, 5 * 60 * 1000); // 5 minutes when visible
      }
    };
    
    setupPolling();
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } else {
        setupPolling();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  async function fetchSecurityData() {
    try {
      setLoading(true);
      
      // DDD-Compliant: Use UnifiedDataService (API primary, mock fallback)
      // FIXED: Use static import via ref to prevent HMR warnings
      const service = serviceRef.current!;
      const response = await service.getSecurityData();
      
      // Store response for status badge
      setDataResponse(response);
      
      // Handle response structure (data may be nested)
      const data = response?.data || response;
      
      if (data) {
        setOverallScore(data.overallScore || 0);
        
        // Convert vulnerabilities to metrics format if needed
        if (data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
          const metricsFromVulns = data.vulnerabilities.map((vuln: any, idx: number) => ({
            category: vuln.title || `Vulnerability ${idx + 1}`,
            status: vuln.severity === 'critical' ? 'critical' : vuln.severity === 'high' ? 'warning' : 'secure',
            score: vuln.severity === 'critical' ? 30 : vuln.severity === 'high' ? 60 : 90,
            lastAudit: data.lastScan || new Date().toISOString(),
            issues: 1,
            description: vuln.title || ''
          }));
          setMetrics(metricsFromVulns);
        } else {
          setMetrics(data.metrics || []);
        }
        
        setAuditLogs(data.auditLogs || []);
      } else {
        // No data - show empty state
        setMetrics([]);
        setAuditLogs([]);
        setOverallScore(0);
      }
      
      // Show fallback indicator if using mock data
      if (response?.fallback) {
        console.debug('Using mock security data - Supabase table may not exist yet');
      }
    } catch (err: any) {
      // FIXED: Prevent infinite retry loops
      // Crew: Worf (Security) & O'Brien (Pragmatic Fix)
      console.error('Failed to load security data:', err);
      setError(err.message || 'Failed to load security data');
      setMetrics([]);
      setAuditLogs([]);
      setOverallScore(0);
      // Don't retry automatically - user can manually retry if needed
    } finally {
      setLoading(false);
    }
  }

  function getSampleMetrics(): SecurityMetric[] {
    return [
      {
        category: 'Credential Management',
        status: 'secure',
        score: 95,
        lastAudit: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        issues: 0,
        description: 'Automated OpenRouter API key management system operational'
      },
      {
        category: 'API Security',
        status: 'warning',
        score: 78,
        lastAudit: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        issues: 2,
        description: 'Potential vulnerabilities in key management system detected'
      },
      {
        category: 'Data Access',
        status: 'secure',
        score: 92,
        lastAudit: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        issues: 0,
        description: 'Zero-artifact guarantee maintained, no direct database access'
      },
      {
        category: 'Network Security',
        status: 'secure',
        score: 88,
        lastAudit: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        issues: 1,
        description: 'n8n webhook endpoints properly secured'
      },
      {
        category: 'Semantic Search',
        status: 'warning',
        score: 75,
        lastAudit: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        issues: 3,
        description: 'Adversarial exploitation risks in search functionality'
      }
    ];
  }

  function getSampleAuditLogs(): AuditLog[] {
    return [
      {
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        auditor: 'Lieutenant Worf',
        category: 'Credential Management',
        action: 'Security Audit',
        result: 'passed',
        details: 'Verified secure credential loading system'
      },
      {
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        auditor: 'Lieutenant Uhura',
        category: 'API Security',
        action: 'Routine Audit',
        result: 'warning',
        details: 'Detected potential vulnerabilities in key management'
      },
      {
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        auditor: 'Lieutenant Worf',
        category: 'Data Access',
        action: 'Peer Review',
        result: 'passed',
        details: 'Confirmed zero-artifact guarantee compliance'
      }
    ];
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'secure': return 'var(--status-success)';
      case 'warning': return 'var(--status-warning)';
      case 'critical': return 'var(--status-error)';
      default: return 'var(--text-muted)';
    }
  }

  function getStatusIcon(status: string): string {
    switch (status) {
      case 'secure': return '✅';
      case 'warning': return '⚠️';
      case 'critical': return '🚨';
      default: return '❓';
    }
  }

  function formatTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  }

  if (loading) {
    return (
      <div className="card" style={{
        position: 'relative', // For badge positioning
        padding: '24px',
        border: 'var(--border)',
        borderRadius: 'var(--radius)',
        marginBottom: '30px'
      }}>
        <DataStatusBadge status="loading" position="top-right" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>🔒</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            Security Assessment
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading security metrics...
        </div>
      </div>
    );
  }

  const criticalCount = metrics.filter(m => m.status === 'critical').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const secureCount = metrics.filter(m => m.status === 'secure').length;

  const dataStatus = useDataStatus(dataResponse);

  return (
    <div className="card" style={{
      position: 'relative', // For badge positioning
      padding: '24px',
      border: 'var(--border)',
      borderRadius: 'var(--radius)',
      marginBottom: '30px',
      background: 'var(--card-bg)'
    }}>
      <DataStatusBadge status={dataStatus} position="top-right" />
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <span style={{ fontSize: '28px' }}>🔒</span>
            <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0 }}>
              Security Assessment Dashboard
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Continuous monitoring and peer audit system
          </p>
        </div>
        <button
          onClick={fetchSecurityData}
          style={{
            padding: '8px 16px',
            background: 'var(--card-alt)',
            border: 'var(--border)',
            borderRadius: 'var(--radius)',
            color: 'var(--text)',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Overall Security Score */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
          {overallScore}%
        </div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Overall Security Score
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: 'var(--status-success)' }}>✅</span>
            <span style={{ fontSize: '13px', color: 'var(--text)' }}>{secureCount} Secure</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ color: '#FFD700' }}>⚠️</span>
            <span style={{ fontSize: '13px', color: 'var(--text)' }}>{warningCount} Warnings</span>
          </div>
          {criticalCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#CC0000' }}>🚨</span>
              <span style={{ fontSize: '13px', color: 'var(--text)' }}>{criticalCount} Critical</span>
            </div>
          )}
        </div>
      </div>

      {/* Security Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {metrics.map((metric, index) => (
          <div
            key={index}
            style={{
              padding: '20px',
              background: 'var(--card-alt)',
              border: `2px solid ${getStatusColor(metric.status)}`,
              borderRadius: 'var(--radius)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{getStatusIcon(metric.status)}</span>
                <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
                  {metric.category}
                </div>
              </div>
              <div style={{
                padding: '4px 10px',
                background: getStatusColor(metric.status),
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'white'
              }}>
                {metric.score}%
              </div>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: '1.5' }}>
              {metric.description}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>
                Last audit: {formatTimeAgo(metric.lastAudit)}
              </span>
              {metric.issues > 0 && (
                <span style={{ color: getStatusColor(metric.status) }}>
                  {metric.issues} issue{metric.issues !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            {/* Score Progress Bar */}
            <div style={{
              width: '100%',
              height: '6px',
              background: 'var(--card-bg)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${metric.score}%`,
                height: '100%',
                background: getStatusColor(metric.status),
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Audit Log */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          Recent Audit Log
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {auditLogs.slice(0, 5).map((log, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                background: 'var(--card-bg)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'start',
                gap: '12px'
              }}
            >
              <div style={{
                padding: '4px 8px',
                background: log.result === 'passed' ? '#00CC66' : log.result === 'warning' ? '#FFD700' : '#CC0000',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                color: 'white',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {log.result.toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                    {log.auditor}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    • {log.category}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    • {formatTimeAgo(log.timestamp)}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {log.action}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text)' }}>
                  {log.details}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

