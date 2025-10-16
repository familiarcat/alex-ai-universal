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

export default function ObservationLounge() {
  const [data, setData] = useState<FindingsFile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // Fetch latest from public file server if available; fallback to API route could be added later.
        const res = await fetch('/integrated-dashboard.js');
        // Fallback to static render; in dev we cannot read filesystem directly.
        // Provide minimal placeholder which instructs users to open findings JSON in repo.
        setError(null);
      } catch (e: any) {
        setError(e.message);
      }
    }
    load();
  }, []);

  return (
    <main style={{ padding: '90px 24px 40px' }}>
      <h1 style={{ color: '#00ffaa', fontSize: 28, marginBottom: 12 }}>🛸 Observation Lounge</h1>
      <p style={{ opacity: 0.85, marginBottom: 16 }}>Cinematic briefing of Innovation Day findings.</p>

      <div style={{ border: '1px solid rgba(0,255,170,0.25)', padding: 16, borderRadius: 12, background: 'rgba(0,255,170,0.04)' }}>
        <p style={{ marginBottom: 10 }}>
          Open the latest findings JSON in <code>crew-memories/active/innovation-day-findings-*.json</code> for full content. In production, we can render directly from Supabase.
        </p>
        <ul style={{ fontSize: 13, opacity: 0.85 }}>
          <li>Plan and findings already generated in this session.</li>
          <li>Budgets enforced per crew, shared queries reduce cost.</li>
          <li>Hook up Supabase RLS and an API route to stream results here.</li>
        </ul>
      </div>
    </main>
  );
}



