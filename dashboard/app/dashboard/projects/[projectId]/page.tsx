/**
 * 🖖 Project-Specific Dashboard
 * 
 * Focused editing interface for individual projects
 * Shows template baseline + variations editor
 * 
 * Crew: Counselor Troi (UX) + Commander Data (Logic)
 */

'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const ProjectDashboardContent = dynamic(() => import('./project-dashboard-content'), {
  ssr: false,
  loading: () => (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%)',
      color: '#ffffff',
      gap: '24px'
    }}>
      <div style={{
        fontSize: '64px',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        🖖
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #00ffaa 0%, #00d4ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Loading Project Dashboard...
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
});

export default function ProjectDashboardPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  if (!projectId) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#0a0a0f',
        color: '#ffffff',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#ff4444' }}>
          ⚠️ Project Not Found
        </h1>
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          No project ID provided.
        </p>
      </div>
    );
  }

  return <ProjectDashboardContent projectId={projectId} />;
}

