'use client';

import Link from 'next/link';
import { useAppState } from '@/lib/state-manager';

export default function ProjectsIndexPage() {
  const { projects } = useAppState();
  return (
    <main style={{ padding: '90px 24px 40px' }}>
      <h1 style={{ color: '#00ffaa', fontSize: 28, marginBottom: 12 }}>🚀 Projects</h1>
      <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
        {Object.keys(projects).map((id) => (
          <li key={id}>
            <Link href={`/projects/${id}?embed=1`} style={{
              display: 'block', padding: 14, borderRadius: 10,
              border: '1px solid rgba(0,255,170,0.25)', background: 'rgba(0,255,170,0.05)', color: '#d0d0d0', textDecoration: 'none'
            }}>
              /projects/{id}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}



