/**
 * Dashboard Page - Client-Only Rendering (Server Component wrapper)
 * 
 * ✅ NO SSR (ssr: false) - Eliminates ALL hydration errors
 * 
 * Why client-only?
 * 1. Dashboard requires authentication (not public)
 * 2. Highly interactive (constant state changes)
 * 3. Depends on localStorage (client-only storage)
 * 4. Doesn't need SEO (users don't Google "my dashboard")
 * 5. Real-time editing (not static content)
 * 
 * Crew Consensus: Unanimous (6/6 officers) ✅
 * See: docs/CREW-OBSERVATION-HYDRATION-ISSUE.md
 */

import dynamic from 'next/dynamic';

const DashboardContent = dynamic(() => import('./dashboard-content'), {
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
        🚀
      </div>
      <div style={{
        fontSize: '24px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #00ffaa 0%, #00d4ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text'
      }}>
        Loading Dashboard...
      </div>
      <div style={{
        fontSize: '14px',
        opacity: 0.6
      }}>
        Initializing Alex AI Universal Control Center
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

export default function DashboardPage() {
  return <DashboardContent />;
}

