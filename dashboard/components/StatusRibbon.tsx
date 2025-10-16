'use client';

import { useEffect, useState } from 'react';

type Health = { status: 'green'|'amber'|'red'; message: string };

export default function StatusRibbon() {
  const [health, setHealth] = useState<Health>({ status: 'green', message: 'All systems nominal' });

  useEffect(() => {
    let mounted = true;
    async function poll() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const h = await res.json();
          if (mounted) setHealth(h);
        }
      } catch {}
      setTimeout(poll, 10000);
    }
    poll();
    return () => { mounted = false; };
  }, []);

  const color = health.status === 'green' ? '#00ffaa' : health.status === 'amber' ? '#ffd166' : '#ff5e5e';

  return (
    <div style={{
      position: 'fixed', left: 0, right: 0, top: 56, zIndex: 9998,
      borderBottom: `1px solid ${color}33`, background: 'rgba(0,0,0,0.35)',
      backdropFilter: 'blur(6px)', color: '#d0d0d0', fontSize: 12
    }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '6px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: color, display: 'inline-block' }} />
        <span>{health.message}</span>
      </div>
    </div>
  );
}



