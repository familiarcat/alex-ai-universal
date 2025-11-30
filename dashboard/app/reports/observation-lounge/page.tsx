import fs from 'fs';
import path from 'path';

interface ObservationItem {
  id: string;
  title?: string;
  summary?: string;
  date?: string;
  tags?: string[];
}

function loadObservations(): ObservationItem[] {
  try {
    const memoriesDir = path.resolve(process.cwd(), '..', 'crew-memories', 'active');
    const files = fs.readdirSync(memoriesDir).filter(f => f.endsWith('.json'));
    const items: ObservationItem[] = [];
    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(memoriesDir, f), 'utf8');
        const json = JSON.parse(raw);
        items.push({
          id: f,
          title: json.title || json.name || f.replace(/\.json$/, ''),
          summary: json.summary || json.notes || json.findings || json.description,
          date: json.date || json.timestamp || undefined,
          tags: json.tags || json.topics || undefined
        });
      } catch {}
    }
    items.sort((a,b)=> b.id.localeCompare(a.id));
    return items;
  } catch {
    return [];
  }
}

export default async function ObservationLoungePage() {
  const items = loadObservations();

  return (
    <div style={{ padding: '80px 24px 24px' }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>🛸 Observation Lounge</h1>
      <p style={{ opacity: 0.8, marginBottom: 24 }}>Recent crew observations, milestones, and findings.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
        {items.map((it) => {
          const summary: string = typeof it.summary === 'string' 
            ? it.summary 
            : (it.summary ? (() => { try { return JSON.stringify(it.summary); } catch { return String(it.summary); } })() : '—');
          return (
          <article key={it.id} style={{
            border: '1px solid var(--border)',
            borderRadius: 12,
            background: 'var(--card, rgba(255,255,255,0.05))',
            padding: 16
          }}>
            <h3 style={{ marginBottom: 8 }}>{it.title}</h3>
            {it.date && <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>{it.date}</div>}
            <p style={{ fontSize: 14, lineHeight: 1.5 }}>{summary}</p>
            {it.tags && it.tags.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {it.tags.map((t) => (
                  <span key={t} style={{ fontSize: 12, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 999 }}>{t}</span>
                ))}
              </div>
            )}
          </article>
        );})}
      </div>
    </div>
  );
}

