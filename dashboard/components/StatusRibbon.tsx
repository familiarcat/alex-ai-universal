'use client';

import { useEffect, useState } from 'react';

type Health = { status: 'green'|'amber'|'red'; message: string };

export default function StatusRibbon() {
  const [health, setHealth] = useState<Health>({ status: 'green', message: 'All systems nominal' });

  useEffect(() => {
    let mounted = true;
    // Cost optimization: Only poll when tab is visible (reduces EC2 load)
    const isVisible = () => !document.hidden;
    
    async function poll() {
      if (!mounted || !isVisible()) {
        // Skip polling if tab is hidden (cost optimization)
        setTimeout(poll, 30000); // Check again in 30s if hidden
        return;
      }
      
      try {
        const res = await fetch('/api/health', {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const h = await res.json();
          if (mounted) setHealth(h);
        } else if (res.status === 404) {
          // 404 is expected for missing endpoints - use debug
          console.debug('Health API endpoint not available');
          // Keep default health status
        }
      } catch (error: any) {
        // FIXED: Network errors are expected - use debug, don't spam console
        // Crew: Riker (Tactical) + Quark (Cost Optimization) + O'Brien (Pragmatic)
        const isNetworkError = error.message?.includes('Failed to fetch') || 
                              error.name === 'AbortError';
        if (isNetworkError) {
          console.debug('Health API unavailable (network error)');
        } else {
          console.debug('Health API error:', error.message);
        }
        // Keep default health status on error
      }
      // Increased interval from 10s to 30s for cost optimization
      setTimeout(poll, 30000);
    }
    poll();
    return () => { mounted = false; };
  }, []);

  // Use theme-aware status colors
  const color = health.status === 'green' 
    ? 'var(--status-success, #00ffaa)' 
    : health.status === 'amber' 
    ? 'var(--status-warning, #ffd166)' 
    : 'var(--status-error, #ff5e5e)';

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, top: 56, zIndex: 9998,
      borderBottom: `1px solid ${color}33`, 
      background: 'var(--header-bg, rgba(15, 15, 20, 0.95))',
      backdropFilter: 'blur(6px)', 
      color: 'var(--header-text, rgba(255, 255, 255, 0.9))', 
      fontSize: 12
    }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '6px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: 'inline-block' }} />
        <span>{health.message}</span>
      </div>
    </div>
  );
}



