'use client';

import { useEffect, useMemo, useState } from 'react';

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

// Canonical crew directory ensures one card per member even if no memory yet
type CrewMeta = {
  id: string;
  name: string;
  displayName: string;
  role: string;
  emoji: string;
  aliases?: string[];
  defaultGoals?: string[];
  purpose?: string;
  defaultModel?: string;
};
const crewDirectory: CrewMeta[] = [
  {
    id: 'picard', name: 'picard', displayName: 'Captain Jean-Luc Picard', role: 'Commanding Officer', emoji: '🖖',
    aliases: ['captain picard', 'jean-luc picard'],
    defaultGoals: ['Set mission intent and constraints', 'Resolve conflicts and make final decisions', 'Uphold ethics and safety throughout operations'],
    purpose: 'Leads strategy, sets intent, and arbitrates trade-offs across the crew.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'riker', name: 'riker', displayName: 'Commander William Riker', role: 'First Officer', emoji: '🖖',
    aliases: ['commander riker', 'will riker'],
    defaultGoals: ['Translate mission intent into actionable plans', 'Coordinate cross-crew execution', 'Escalate risks and unblock progress'],
    purpose: 'Turns strategy into execution plans and coordinates cross-functional delivery.',
    defaultModel: 'gpt-4o-mini'
  },
  {
    id: 'data', name: 'data', displayName: 'Lieutenant Commander Data', role: 'Operations & Analysis', emoji: '🤖',
    aliases: ['commander data'],
    defaultGoals: ['Perform rigorous analysis and validation', 'Synthesize learnings into reusable patterns', 'Measure outcomes and surface insights'],
    purpose: 'Analyzes telemetry, validates assumptions, and codifies patterns for reuse.',
    defaultModel: 'gpt-4.1'
  },
  {
    id: 'la-forge', name: 'la forge', displayName: 'Lieutenant Commander Geordi La Forge', role: 'Chief Engineer', emoji: '🛠️',
    aliases: ['geordi', 'geordi la forge', 'lieutenant commander geordi la forge'],
    defaultGoals: ['Ensure systems reliability and performance', 'Automate workflows and integrations', 'Eliminate bottlenecks in the toolchain'],
    purpose: 'Builds and maintains reliable, observable integrations and infrastructure.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'worf', name: 'worf', displayName: 'Lieutenant Worf', role: 'Security', emoji: '🛡️',
    aliases: ['lieutenant worf'],
    defaultGoals: ['Harden security boundaries', 'Protect data and credentials', 'Monitor and respond to threats'],
    purpose: 'Owns security posture, threat modeling, and incident response hygiene.',
    defaultModel: 'gpt-4o-mini'
  },
  {
    id: 'crusher', name: 'dr. beverly crusher', displayName: 'Doctor Beverly Crusher', role: 'Medical', emoji: '🩺',
    aliases: ['beverly crusher', 'dr crusher'],
    defaultGoals: ['Safeguard system health', 'Promote resilient practises', 'Triage and stabilize critical incidents'],
    purpose: 'Monitors system health and reliability, curates resilient operating practices.',
    defaultModel: 'gpt-4o-mini'
  },
  {
    id: 'troi', name: 'counselor deanna troi', displayName: 'Counselor Deanna Troi', role: 'Counselor', emoji: '🧠',
    aliases: ['deanna troi', 'counselor troi'],
    defaultGoals: ['Improve UX clarity and empathy', 'Reduce cognitive load in workflows', 'Guide decisions with human-centered perspective'],
    purpose: 'Advocates for human-centered UX, clarity, and cognitive load reduction.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'uhura', name: 'lieutenant uhura', displayName: 'Lieutenant Uhura', role: 'Communications', emoji: '📡',
    aliases: ['uhura'],
    defaultGoals: ['Establish reliable integrations', 'Ensure API hygiene and observability', 'Maintain secure credential handling'],
    purpose: 'Manages APIs, credentials, and observability for integrations (e.g., n8n/Supabase).',
    defaultModel: 'gpt-4o'
  },
  { id: 'quark', name: 'quark', displayName: 'Quark', role: 'Commerce', emoji: '💰', defaultGoals: ['Optimize business value', 'Prioritize ROI-driven features', 'Leverage partnerships and marketplaces'], purpose: 'Aligns delivery with ROI and market opportunities.', defaultModel: 'gpt-4o-mini' },
  // Project/system identities often writing memories
  { id: 'collective-milestone-memory', name: 'collective-milestone-memory', displayName: 'Collective Milestones', role: 'Project Memory', emoji: '🧩', defaultGoals: ['Record canonical achievements', 'Eliminate duplication', 'Surface knowledge for reuse'], purpose: 'Holds canonical project milestones and summaries.', defaultModel: 'gpt-4o' },
  { id: 'n8n-automation-solution-2025-10-13', name: 'n8n-automation-solution-2025-10-13', displayName: 'N8N Automation Solution', role: 'Automation', emoji: '⚙️', purpose: 'Automates ingestion and mediation between UI and Supabase via n8n.', defaultModel: 'gpt-4o-mini' },
  { id: 'ddd-migration-and-doc-workflow-2025-10-13', name: 'ddd-migration-and-doc-workflow-2025-10-13', displayName: 'DDD Migration & Documentation Workflow', role: 'Architecture', emoji: '🧱', purpose: 'Owns domain-driven design alignment and doc workflows.', defaultModel: 'gpt-4o-mini' },
];

export default function ObservationLounge() {
  const [crew, setCrew] = useState<CrewMemory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [compact, setCompact] = useState(true);

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

  const sortedAndFiltered = useMemo(() => {
    const normalized = (s: string) => (s || '').toLowerCase();
    const q = normalized(query);

    function isSubstantive(m: CrewMemory) {
      const hasLists = Boolean((m.key_findings && m.key_findings.length) || (m.conclusions && m.conclusions.length) || (m.recommendations && m.recommendations.length));
      const nonGenericTitle = (m.title || '').trim().toLowerCase() !== 'latest briefing';
      const hasSummary = Boolean((m.summary || '').trim());
      return hasLists || hasSummary || nonGenericTitle;
    }

    // Index memories by canonicalized key for matching against directory
    const canon = (s: string) => normalized(s).replace(/[^a-z0-9]+/g, '-');
    const bucket: Record<string, CrewMemory[]> = {};
    for (const m of crew || []) {
      const keys = new Set<string>();
      const cm = m.crew_member || '';
      keys.add(canon(cm));
      // Also push raw to be safe
      keys.add(normalized(cm));
      for (const k of keys) {
        if (!bucket[k]) bucket[k] = [];
        bucket[k].push(m);
      }
    }

    function chooseBest(list: CrewMemory[] | undefined): CrewMemory | null {
      if (!list || list.length === 0) return null;
      const sorted = list.slice().sort((a, b) => {
        const as = Number(isSubstantive(a));
        const bs = Number(isSubstantive(b));
        if (as !== bs) return bs - as; // substantive first
        const ta = Date.parse(a.timestamp || '');
        const tb = Date.parse(b.timestamp || '');
        if (!isNaN(ta) && !isNaN(tb)) return tb - ta;
        if (!isNaN(ta)) return -1;
        if (!isNaN(tb)) return 1;
        return (a.crew_member || '').localeCompare(b.crew_member || '');
      });
      return sorted[0] || null;
    }

    // Build complete roster: ensure one entry per crewDirectory member
    const roster = crewDirectory.map((meta) => {
      const keys = [canon(meta.id), canon(meta.name), ...(meta.aliases || []).map(canon)];
      let found: CrewMemory | null = null;
      for (const k of keys) {
        found = chooseBest(bucket[k]);
        if (found) break;
      }
      if (!found) {
        // Placeholder card to represent member without memory yet
        found = {
          crew_member: meta.displayName,
          title: 'No recent briefing',
          summary: (meta.defaultGoals && meta.defaultGoals.length)
            ? `Agent goals: ${meta.defaultGoals.join(' · ')}`
            : '',
          key_findings: [],
          conclusions: [],
          recommendations: [],
          timestamp: ''
        };
      }
      return { meta, memory: found } as { meta: typeof meta; memory: CrewMemory };
    });

    let result = roster
      // If searching, include members that match by meta or memory text
      .filter(({ meta, memory }) => {
        if (!q) return true;
        const fields = [meta.name, meta.role, memory.crew_member, memory.title, memory.summary].join(' ').toLowerCase();
        return fields.includes(q);
      })
      // Sort by recency where available
      .sort((a, b) => {
        const ta = Date.parse(a.memory.timestamp || '');
        const tb = Date.parse(b.memory.timestamp || '');
        if (!isNaN(ta) && !isNaN(tb)) return tb - ta;
        if (!isNaN(ta)) return -1;
        if (!isNaN(tb)) return 1;
        return a.meta.name.localeCompare(b.meta.name);
      });

    return result;
  }, [crew, query]);

  function formatWhen(ts: string) {
    if (!ts) return '';
    const t = Date.parse(ts);
    if (isNaN(t)) return ts;
    const diff = Date.now() - t;
    const min = 60 * 1000;
    const hr = 60 * min;
    const day = 24 * hr;
    if (diff < hr) return `${Math.max(1, Math.round(diff / min))}m ago`;
    if (diff < day) return `${Math.round(diff / hr)}h ago`;
    return new Date(t).toISOString().slice(0, 10);
  }

  function Section({ title, items, defaultOpen = false }: { title: string; items: string[]; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    if (!items || items.length === 0) return null;
    const visible = compact ? items.slice(0, 6) : items;
    return (
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'flex', justifyContent: 'space-between', width: '100%',
            background: 'transparent', color: '#e6fff7', border: '1px solid rgba(0,255,170,0.25)',
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer'
          }}
        >
          <span style={{ fontWeight: 600 }}>{title}</span>
          <span style={{ opacity: 0.75, fontSize: 12 }}>{items.length}{open ? ' ▲' : ' ▼'}</span>
        </button>
        {open && (
          <ul style={{ margin: '8px 0 0', paddingLeft: 18 }}>
            {visible.map((v, i) => (
              <li key={i} style={{ fontSize: 13 }}>{v}</li>
            ))}
            {compact && items.length > visible.length && (
              <li style={{ fontSize: 12, opacity: 0.8 }}>+ {items.length - visible.length} more</li>
            )}
          </ul>
        )}
      </div>
    );
  }

  return (
    <main style={{ padding: '90px 24px 40px' }}>
      <h1 style={{ color: '#00ffaa', fontSize: 28, marginBottom: 8 }}>🛸 Observation Lounge</h1>
      <p style={{ opacity: 0.85, marginBottom: 12 }}>Cinematic briefing – each crew member’s latest understanding and skill emphasis.</p>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search crew, titles, summaries"
          style={{
            flex: 1, minWidth: 240, background: 'rgba(255,255,255,0.06)', color: '#e6fff7',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 10px'
          }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.9 }}>
          <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} /> Compact
        </label>
      </div>

      {error && (
        <div style={{ border: '1px solid #ff6666', padding: 12, borderRadius: 8, background: 'rgba(255,0,0,0.06)', marginBottom: 16 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {sortedAndFiltered.length === 0 ? (
        <div style={{ opacity: 0.8, padding: 16, border: '1px dashed rgba(255,255,255,0.25)', borderRadius: 12 }}>
          No latest briefings available yet. Once the n8n lounge webhook is live or local crew memories are added, updates will appear here.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16 }}>
          {sortedAndFiltered.map(({ meta, memory }) => (
            <div key={meta.id} style={{ border: '1px solid rgba(0,255,170,0.25)', borderRadius: 12, background: 'rgba(0,255,170,0.04)', padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <h2 style={{ color: '#00ffaa', fontSize: 18, margin: 0 }}>{meta.emoji} {meta.displayName} <span style={{ opacity: 0.7, fontSize: 12 }}>· {meta.role}</span></h2>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{formatWhen(memory.timestamp)}</span>
              </div>
              {(meta.purpose || meta.defaultModel) && (
                <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 8 }}>
                  {meta.purpose && <span>{meta.purpose}</span>}
                  {meta.purpose && meta.defaultModel && <span> · </span>}
                  {meta.defaultModel && <span>Default model: {meta.defaultModel}</span>}
                </div>
              )}
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{(memory.title || '').trim() && (memory.title || '').toLowerCase() !== 'latest briefing' ? memory.title : 'Latest Briefing'}</div>
              <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 10 }}>
                {(() => {
                  const hasContent = Boolean((memory.summary || '').trim());
                  if (hasContent) return memory.summary;
                  if (meta.defaultGoals && meta.defaultGoals.length) {
                    return `Agent goals: ${meta.defaultGoals.join(' · ')}`;
                  }
                  return 'Briefing content pending.';
                })()}
              </div>

              <Section title="Key Findings" items={memory.key_findings || []} defaultOpen={!compact} />
              <Section title="Conclusions" items={memory.conclusions || []} />
              <Section title="Recommendations" items={memory.recommendations || []} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}



