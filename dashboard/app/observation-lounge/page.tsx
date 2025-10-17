'use client';

import { useEffect, useState } from 'react';

type Finding = {
  topic: string;
  content: string;
  model: string;
  cost_cents_estimate: number;
  shared_by: string[];
};

type FindingsFile = {
  plan_id: string;
  timestamp: string;
  model: string;
  budgets: Record<string, { used_cents: number; cap_cents: number }>;
  findings: Finding[];
};

type CrewMemory = {
  crew_member: string;
  title: string;
  summary: string;
  key_findings: string[];
  conclusions: string[];
  recommendations: string[];
  timestamp: string;
};

export default function ObservationLounge() {
  const [crew, setCrew] = useState<CrewMemory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/lounge/latest', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setCrew(Array.isArray(data.crew) ? data.crew : []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load');
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <main style={{ padding: '90px 24px 40px' }}>
      <h1 style={{ color: '#00ffaa', fontSize: 28, marginBottom: 12 }}>🛸 Observation Lounge</h1>
      <p style={{ opacity: 0.85, marginBottom: 16 }}>Cinematic briefing – each crew member’s latest understanding and skill emphasis.</p>

      {error && (
        <div style={{ border: '1px solid #ff6666', padding: 12, borderRadius: 8, background: 'rgba(255,0,0,0.06)', marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {crew.map((m) => (
          <div key={m.crew_member} style={{ border: '1px solid rgba(0,255,170,0.25)', borderRadius: 12, background: 'rgba(0,255,170,0.04)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
              <h2 style={{ color: '#00ffaa', fontSize: 18, margin: 0 }}>🖖 {m.crew_member}</h2>
              <span style={{ fontSize: 12, opacity: 0.7 }}>{m.timestamp}</span>
            </div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{m.title}</div>
            <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 10 }}>{m.summary}</div>

            {m.key_findings?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Key Findings</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {m.key_findings.map((f, i) => (
                    <li key={i} style={{ fontSize: 13 }}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            {m.conclusions?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Conclusions</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {m.conclusions.map((c, i) => (
                    <li key={i} style={{ fontSize: 13 }}>{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {m.recommendations?.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Recommendations</div>
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {m.recommendations.map((r, i) => (
                    <li key={i} style={{ fontSize: 13 }}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}



