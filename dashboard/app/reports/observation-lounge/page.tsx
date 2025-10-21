'use client';

import React, { useEffect, useState } from 'react';

export default function ObservationLoungeReport() {
  const [now, setNow] = useState<string | null>(null);
  useEffect(() => {
    setNow(new Date().toLocaleString());
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <style jsx global>{`
        @media print {
          @page { size: Letter; margin: 1in; }
          body { background: #ffffff !important; color: #000 !important; }
          .no-print { display: none !important; }
          .page { box-shadow: none !important; background: #ffffff !important; }
        }
      `}</style>

      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, margin: '0 auto 16px', maxWidth: 860 }}>
        <div style={{ fontFamily: 'Courier, monospace', fontSize: 14, opacity: 0.8 }}>Observation Lounge – Screenplay Export</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => window.print()}
            style={{
              border: 'var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              borderRadius: 'var(--radius)',
              padding: '8px 12px',
              cursor: 'pointer'
            }}
          >Export PDF</button>
          <a
            href="/dashboard"
            style={{
              border: 'var(--border)',
              background: 'var(--card)',
              color: 'var(--text)',
              borderRadius: 'var(--radius)',
              padding: '8px 12px',
              textDecoration: 'none'
            }}
          >Back to Dashboard</a>
        </div>
      </div>

      <div className="page" style={{
        margin: '0 auto',
        maxWidth: 860,
        background: 'var(--card)',
        border: 'var(--border)',
        borderRadius: 'var(--radius)',
        boxShadow: 'var(--shadow)',
        padding: '32px 40px'
      }}>
        <div style={{ fontFamily: 'Courier, monospace', color: 'var(--text)' }}>
          <header style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.85 }} suppressHydrationWarning>STARDATE: {now ?? ''}</div>
            <div style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginTop: 8 }}>OBSERVATION LOUNGE — PROJECT STATUS SCREENPLAY</div>
          </header>

          <section style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, letterSpacing: 2 }}>INT. OBSERVATION LOUNGE — NIGHT</div>
            <div style={{ marginTop: 8 }}>
              The room hums softly. Stars drift beyond the viewport as the crew assembles.
            </div>
          </section>

          <section style={{ margin: '20px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>PICARD</div>
            <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>Report. Status of the platform?</div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>DATA</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Systems nominal. Dev server active; health endpoint stable (200). Occasional fast-refresh full reloads observed; no user impact.
            </div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>LA FORGE</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Global tokenized theming is in. Dashboard uses global tokens; projects render with their own themes in isolated iframes. Chrome hidden on project routes. Live Preview uses iframes per project; global tokens no longer override. Themes reflect in real-time.
            </div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>TROI</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Theme selection follows intent over style. The intent switcher applies only on explicit action. Readability and contrast meet guidance.
            </div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>QUARK</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Business mapping online — acquire, convert, educate, trust, delight. No rationale panels shown to users. We measure outcomes after selection.
            </div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>CRUSHER</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Hallucination-avoidance policy logged. UI changes require explicit action. No implicit content surfaced.
            </div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>WORF</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Local ports secured and cycled. Yarn GITHUB_TOKEN auto-install blocked; standardized on npm. Monitoring for regressions.
            </div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>UHURA</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Project Gallery shows per-project thumbnails with View and Edit actions. Routing is clean.
            </div>
          </section>

          

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>DATA</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Milestones tagged and merged; tags preserved for traceability.
            </div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>PICARD</div>
            <div style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>Risks?</div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>DATA</div>
            <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
              Intermittent dev 500 previously tied to a long-running health poll; recovered after restart. Continue to observe.
            </div>
          </section>

          <section style={{ margin: '18px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>PICARD</div>
            <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
              Execute the following: refine Gallery/Quiz/Wizard with tokens; consider nav lanes (Build/Explore/Ops); run n8n integration tests; maintain milestone discipline. Make it so.
            </div>
          </section>

          {/* Preview Policy */}
          <section style={{ margin: '24px 0' }}>
            <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 6 }}>PREVIEW POLICY</div>
            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', opacity: 0.9 }}>
              Live Preview is production‑faithful and isolated. No development chrome or overlays are displayed.
              Previews use deterministic data snapshots and do not connect to development state unless explicitly
              requested. Embeds are rendered via <code>?embed=1</code> and must not alter application routing or global tokens.
            </div>
          </section>

          <div style={{ textAlign: 'right', marginTop: 28, fontWeight: 700 }}>FADE TO STARS.</div>

          <footer style={{ marginTop: 28, opacity: 0.75, fontSize: 12 }}>
            Quick routes: /dashboard · /gallery · /projects/alpha · /demos/theme-gallery
          </footer>
        </div>
      </div>
    </div>
  );
}



