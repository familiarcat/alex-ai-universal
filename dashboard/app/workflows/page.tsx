/**
 * Workflows Page
 * 
 * MCP Workflow Editor using React Flow
 */

'use client';

import dynamic from 'next/dynamic';

const WorkflowEditor = dynamic(() => import('@/components/workflows/WorkflowEditor'), {
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
        🔄
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #00ffaa 0%, #00d4ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Loading Workflow Editor...
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

export default function WorkflowsPage() {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <WorkflowEditor />
    </div>
  );
}

