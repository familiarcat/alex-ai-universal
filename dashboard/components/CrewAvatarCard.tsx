'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function CrewAvatarCard({ member, status, avatarUrl }: { member: string; status?: { history?: string; suggestions?: string[] }, avatarUrl?: string }) {
  const avatarEmoji = (() => {
    const m = member.toLowerCase();
    if (m.includes('picard')) return '🖖';
    if (m.includes('data')) return '🤖';
    if (m.includes('la forge') || m.includes('geordi')) return '🛠️';
    if (m.includes('troi')) return '🧠';
    if (m.includes('worf')) return '🛡️';
    if (m.includes('crusher')) return '⚕️';
    if (m.includes('riker')) return '🎯';
    if (m.includes('uhura')) return '📡';
    if (m.includes('quark')) return '💼';
    return '⭐';
  })();

  const specialties = (() => {
    const m = member.toLowerCase();
    if (m.includes('picard')) return 'Strategy, leadership, mission framing';
    if (m.includes('data')) return 'Analysis, logic, pattern detection';
    if (m.includes('la forge') || m.includes('geordi')) return 'Engineering, systems, optimization';
    if (m.includes('troi')) return 'UX, empathy, communication';
    if (m.includes('worf')) return 'Security, risk management, compliance';
    if (m.includes('crusher')) return 'Health, reliability, SRE mindset';
    if (m.includes('riker')) return 'Tactics, execution, coordination';
    if (m.includes('uhura')) return 'I/O, integrations, protocols';
    if (m.includes('quark')) return 'Business value, ROI, growth';
    return 'Generalist crew member';
  })();

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function ask() {
    if (!question.trim()) return;
    setBusy(true); setAnswer(null);
    try {
      const res = await fetch('/api/lounge/crew-advice', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: `${member}: ${question}` }) });
      const j = await res.json().catch(() => ({ answers: [] }));
      const a = (j.answers || []).find((x: any) => String(x.crew || '').toLowerCase().includes(member.toLowerCase()));
      setAnswer(a?.advice || '');
    } finally { setBusy(false); }
  }

  return (
    <div style={{ border: 'var(--border)', borderRadius: 12, padding: 16, background: 'var(--surface, rgba(0,0,0,0.1))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={member}
            width={36}
            height={36}
            style={{ borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
            unoptimized
          />
        ) : (
          <div style={{ fontSize: 28 }}>{avatarEmoji}</div>
        )}
        <div>
          <div style={{ fontWeight: 700 }}>{member}</div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>{specialties}</div>
        </div>
      </div>
      {status?.history && <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>{status.history}</div>}
      {Array.isArray(status?.suggestions) && status!.suggestions!.length > 0 && (
        <ul style={{ marginTop: 8, paddingLeft: 18 }}>
          {status!.suggestions!.slice(0, 3).map((s, i) => (<li key={i}>{s}</li>))}
        </ul>
      )}
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder={`Ask ${member}...`} style={{ flex: 1, padding: 8, borderRadius: 8, border: 'var(--border)' }} />
        <button onClick={ask} disabled={busy || !question.trim()} style={{ padding: '8px 12px', borderRadius: 8, border: 'var(--border)' }}>{busy ? 'Asking…' : 'Ask'}</button>
      </div>
      {answer && (
        <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{answer}</div>
      )}
    </div>
  );
}


