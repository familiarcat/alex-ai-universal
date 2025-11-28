'use client';

/**
 * Cost Optimization Monitor Component
 * 
 * Real-time LLM usage tracking and cost analysis
 * 
 * Recommendations from:
 * - Commander Riker: Prioritize further cost optimizations
 * - Quark: Monitor model usage closely, explore ways to streamline operations
 * 
 * Reviewed by: Commander Riker (Tactical) & Quark (Business Operations)
 */

import { useEffect, useState, useRef } from 'react';
import DataStatusBadge, { useDataStatus } from './DataStatusBadge';
import { getUnifiedDataService } from '@/lib/unified-data-service';

interface ModelUsage {
  model: string;
  requests: number;
  tokens: number;
  cost: number;
  avgCostPerRequest: number;
  trend: 'up' | 'down' | 'stable';
}

interface CostBreakdown {
  period: string;
  totalCost: number;
  modelBreakdown: ModelUsage[];
  savings: number;
  optimization: number;
}

export default function CostOptimizationMonitor() {
  const [costData, setCostData] = useState<CostBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');
  const [dataResponse, setDataResponse] = useState<any>(null);

  // FIXED: Use static import instead of dynamic import to prevent HMR warnings
  // Crew: La Forge (Infrastructure) + Data (Analysis)
  const serviceRef = useRef<ReturnType<typeof getUnifiedDataService> | null>(null);

  useEffect(() => {
    // Initialize service once (stable reference for HMR)
    if (!serviceRef.current) {
      serviceRef.current = getUnifiedDataService();
    }
    
    fetchCostData();
    // Cost optimization: Only poll when tab is visible, increased interval to 10 minutes
    let intervalId: NodeJS.Timeout | null = null;
    
    const setupPolling = () => {
      if (intervalId) clearInterval(intervalId);
      if (!document.hidden) {
        intervalId = setInterval(fetchCostData, 10 * 60 * 1000); // 10 minutes when visible
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
  }, [timeframe]);

  async function fetchCostData() {
    try {
      setLoading(true);
      
      // DDD-Compliant: Use UnifiedDataService (API primary, mock fallback)
      // FIXED: Use static import via ref to prevent HMR warnings
      const service = serviceRef.current!;
      const response = await service.getCostData();
      
      // Store response for status badge
      setDataResponse(response);
      
      // Handle response structure (data may be nested)
      const data = response?.data || response;
      
      if (data) {
        // Transform API data to component format
        setCostData({
          period: timeframe === '24h' ? 'Last 24 hours' : timeframe === '7d' ? 'Last 7 days' : 'Last 30 days',
          modelBreakdown: data.modelBreakdown || [],
          totalCost: data.monthlyCost || 0,
          savings: data.savings || 0,
          optimization: data.savings ? Math.round((data.savings / (data.monthlyCost || 1)) * 100) : 0,
          recommendations: data.recommendations || [],
          trends: data.trends || []
        });
      } else {
        // No data - show empty state
        setCostData({ 
          period: timeframe === '24h' ? 'Last 24 hours' : timeframe === '7d' ? 'Last 7 days' : 'Last 30 days',
          modelBreakdown: [], 
          totalCost: 0, 
          savings: 0,
          optimization: 0,
          recommendations: []
        });
      }
      
      // Show fallback indicator if using mock data
      if (response?.fallback) {
        console.debug('Using mock cost data - Supabase table may not exist yet');
      }
    } catch (err: any) {
      console.error('Failed to load cost data:', err);
      setCostData({ 
        period: timeframe === '24h' ? 'Last 24 hours' : timeframe === '7d' ? 'Last 7 days' : 'Last 30 days',
        modelBreakdown: [], 
        totalCost: 0, 
        savings: 0,
        optimization: 0,
        recommendations: [] 
      });
    } finally {
      setLoading(false);
    }
  }

  function getSampleCostData(): CostBreakdown {
    return {
      period: 'Last 7 days',
      totalCost: 12.45,
      savings: 3.21,
      optimization: 20.5,
      modelBreakdown: [
        {
          model: 'Claude 3.5 Sonnet',
          requests: 1245,
          tokens: 234567,
          cost: 4.23,
          avgCostPerRequest: 0.0034,
          trend: 'down'
        },
        {
          model: 'GPT-4o',
          requests: 892,
          tokens: 189234,
          cost: 3.78,
          avgCostPerRequest: 0.0042,
          trend: 'stable'
        },
        {
          model: 'Llama 3 70B',
          requests: 2156,
          tokens: 456789,
          cost: 1.89,
          avgCostPerRequest: 0.0009,
          trend: 'up'
        },
        {
          model: 'Claude 3 Haiku',
          requests: 3456,
          tokens: 678901,
          cost: 0.89,
          avgCostPerRequest: 0.0003,
          trend: 'up'
        },
        {
          model: 'GPT-4o Mini',
          requests: 1890,
          tokens: 345678,
          cost: 1.66,
          avgCostPerRequest: 0.0009,
          trend: 'stable'
        }
      ]
    };
  }

  function formatCurrency(amount: number | undefined | null): string {
    // Handle undefined/null/NaN values gracefully
    if (amount == null || isNaN(amount)) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  }

  function formatNumber(num: number | undefined | null): string {
    // Handle undefined/null/NaN values gracefully
    if (num == null || isNaN(num)) {
      return '0';
    }
    return num.toLocaleString();
  }

  const totalRequests = costData?.modelBreakdown?.reduce((sum, m) => sum + (m.requests || 0), 0) || 0;
  const totalTokens = costData?.modelBreakdown?.reduce((sum, m) => sum + (m.tokens || 0), 0) || 0;
  const avgCostPerRequest = costData && totalRequests > 0 ? costData.totalCost / totalRequests : 0;

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
          <span style={{ fontSize: '24px' }}>💰</span>
          <h3 style={{ fontSize: '18px', color: 'var(--accent)', margin: 0 }}>
            Cost Optimization Monitor
          </h3>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Loading cost metrics...
        </div>
      </div>
    );
  }

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
            <span style={{ fontSize: '28px' }}>💰</span>
            <h3 style={{ fontSize: '20px', color: 'var(--accent)', margin: 0 }}>
              Cost Optimization Monitor
            </h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Real-time LLM usage tracking and cost analysis
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['24h', '7d', '30d'] as const).map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '6px 12px',
                background: timeframe === tf ? 'var(--accent)' : 'var(--card-alt)',
                border: 'var(--border)',
                borderRadius: 'var(--radius)',
                color: timeframe === tf ? 'white' : 'var(--text)',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tf}
            </button>
          ))}
          <button
            onClick={fetchCostData}
            style={{
              padding: '6px 12px',
              background: 'var(--card-alt)',
              border: 'var(--border)',
              borderRadius: 'var(--radius)',
              color: 'var(--text)',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔄
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          padding: '20px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
            {costData ? formatCurrency(costData.totalCost) : '$0.00'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Total Cost ({timeframe})
          </div>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--status-success)', marginBottom: '8px' }}>
            {costData ? formatCurrency(costData.savings) : '$0.00'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Savings ({costData?.optimization != null ? costData.optimization.toFixed(1) : '0.0'}%)
          </div>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
            {formatNumber(totalRequests)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Total Requests
          </div>
        </div>
        <div style={{
          padding: '20px',
          background: 'var(--card-alt)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)', marginBottom: '8px' }}>
            {formatCurrency(avgCostPerRequest)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Avg per Request
          </div>
        </div>
      </div>

      {/* Model Breakdown */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          Model Usage Breakdown
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {costData?.modelBreakdown && costData.modelBreakdown.length > 0 ? (
            costData.modelBreakdown
              .sort((a, b) => (b.cost || 0) - (a.cost || 0))
              .map((model, index) => {
                const percentage = costData && costData.totalCost > 0 
                  ? ((model.cost || 0) / costData.totalCost) * 100 
                  : 0;
                return (
                <div
                  key={index}
                  style={{
                    padding: '16px',
                    background: 'var(--card-bg)',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '18px' }}>
                        {model.trend === 'up' ? '📈' : model.trend === 'down' ? '📉' : '➡️'}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                        {model.model}
                      </div>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent)' }}>
                      {formatCurrency(model.cost)}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>{formatNumber(model.requests)} requests</span>
                    <span>{formatNumber(model.tokens)} tokens</span>
                    <span>{formatCurrency(model.avgCostPerRequest)}/req</span>
                    <span>{percentage.toFixed(1)}% of total</span>
                  </div>
                  
                  {/* Cost Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--card-alt)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      background: 'var(--accent)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '14px'
            }}>
              No cost data available. Waiting for live connection to MCP/n8n servers.
            </div>
          )}
        </div>
      </div>

      {/* Optimization Recommendations */}
      <div style={{
        padding: '20px',
        background: 'var(--card-alt)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', marginBottom: '16px' }}>
          💡 Optimization Recommendations
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text)' }}>
          <div>• Consider using Claude 3 Haiku for simple tasks (saves ~70% vs Sonnet)</div>
          <div>• Llama 3 70B provides excellent cost/performance ratio</div>
          <div>• Monitor GPT-4o usage - consider GPT-4o Mini for non-critical operations</div>
          <div>• Implement request caching for repeated queries</div>
        </div>
      </div>
    </div>
  );
}

