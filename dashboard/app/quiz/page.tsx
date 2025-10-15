'use client';

import Link from 'next/link';
import { useState } from 'react';

const QUESTIONS = [
  { q: 'Which theme emphasizes neon accents?', a: 'cyberpunk', choices: ['pastel', 'cyberpunk', 'midnight'] },
  { q: 'Which project is healthcare?', a: 'beta', choices: ['alpha', 'beta', 'gamma'] },
  { q: 'Which theme is best for late-night dashboards?', a: 'midnight', choices: ['midnight', 'pastel', 'glassmorphism'] }
];

function recommendation(score: number) {
  if (score >= 3) return { id: 'gamma', name: 'Federation Analytics' };
  if (score === 2) return { id: 'beta', name: 'Starfleet Medical Portal' };
  return { id: 'alpha', name: 'Enterprise E-commerce' };
}

export default function QuizPage() {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function answer(choice: string) {
    if (done) return;
    if (choice === QUESTIONS[idx].a) setScore((s) => s + 1);
    if (idx + 1 >= QUESTIONS.length) setDone(true);
    else setIdx((i) => i + 1);
  }

  const rec = recommendation(score);

  return (
    <main style={{ padding: '90px 24px 40px' }}>
      <h1 style={{ color: '#00ffaa', fontSize: 28, marginBottom: 10 }}>🎯 Quick Quiz</h1>
      {!done ? (
        <div style={{ border: '1px solid rgba(0,255,170,0.2)', padding: 16, borderRadius: 12 }}>
          <div style={{ marginBottom: 12 }}>{QUESTIONS[idx].q}</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
            {QUESTIONS[idx].choices.map((c) => (
              <button key={c} onClick={() => answer(c)} style={{
                padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(0,255,170,0.12)', border: '1px solid rgba(0,255,170,0.3)', color: '#0ff'
              }}>{c}</button>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>Question {idx + 1} / {QUESTIONS.length}</div>
        </div>
      ) : (
        <div style={{ border: '1px solid rgba(0,255,170,0.2)', padding: 16, borderRadius: 12 }}>
          <div style={{ fontSize: 16, marginBottom: 10 }}>Score: {score} / {QUESTIONS.length}</div>
          <div style={{ marginBottom: 12 }}>Recommended destination:</div>
          <Link href={`/projects/${rec.id}`} style={{
            display: 'inline-block', padding: '10px 14px', borderRadius: 8, fontWeight: 600,
            background: '#00ffaa', color: '#0a0015', textDecoration: 'none'
          }}>Explore {rec.name} →</Link>
        </div>
      )}
    </main>
  );
}


