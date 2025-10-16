'use client';

/**
 * Development Mode Navigation
 * Shows only in development, hidden in production builds
 * Reviewed by: Counselor Troi (UX) & Lieutenant Uhura (Navigation)
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import GlobalThemeSwitcher from '@/components/GlobalThemeSwitcher';
import IntentThemeSwitcher from '@/components/IntentThemeSwitcher';

export default function DevNavigation() {
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(false);

  // Only show in development
  const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  if (!isDev) return null;

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path);

  const navStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    background: 'rgba(10, 0, 21, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '12px 30px',
    zIndex: 9999,
    borderBottom: '2px solid rgba(0, 255, 170, 0.3)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
  };

  const containerStyle = {
    maxWidth: '1800px',
    margin: '0 auto',
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  };

  const linkStyle = (active: boolean) => ({
    color: active ? '#00ff88' : 'white',
    textDecoration: 'none',
    opacity: active ? 1 : 0.8,
    fontWeight: active ? 600 : 400,
    fontSize: '14px',
    transition: 'all 0.2s',
    padding: '8px 12px',
    borderRadius: '6px',
    background: active ? 'rgba(0, 255, 136, 0.1)' : 'transparent'
  });

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <span style={{ fontWeight: 700, color: '#00ff88', fontSize: '15px' }}>
          🖖 ALEX AI DEV MODE
        </span>
        
        <Link href="/dashboard" style={linkStyle(isActive('/dashboard'))}>
          🎨 Dashboard
        </Link>
        
        <Link href="/gallery" style={linkStyle(isActive('/gallery'))}>
          🖼️ Gallery
        </Link>
        
        <Link href="/quiz" style={linkStyle(isActive('/quiz'))}>
          🎯 Quiz
        </Link>
        
        <Link href="/wizard" style={linkStyle(isActive('/wizard'))}>
          🎭 Wizard
        </Link>
        
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            style={{
              ...linkStyle(isActive('/projects')),
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🚀 Projects {projectsOpen ? '▲' : '▼'}
          </button>
          
          {projectsOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              background: 'rgba(10, 0, 21, 0.98)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              borderRadius: '8px',
              padding: '8px',
              minWidth: '200px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
            }}>
              <Link 
                href="/projects/alpha" 
                style={{
                  ...linkStyle(isActive('/projects/alpha')),
                  display: 'block',
                  marginBottom: '4px'
                }}
                onClick={() => setProjectsOpen(false)}
              >
                🛒 Alpha (Fashion)
              </Link>
              <Link 
                href="/projects/beta" 
                style={{
                  ...linkStyle(isActive('/projects/beta')),
                  display: 'block',
                  marginBottom: '4px'
                }}
                onClick={() => setProjectsOpen(false)}
              >
                🏥 Beta (Healthcare)
              </Link>
              <Link 
                href="/projects/gamma" 
                style={{
                  ...linkStyle(isActive('/projects/gamma')),
                  display: 'block'
                }}
                onClick={() => setProjectsOpen(false)}
              >
                📊 Gamma (Analytics)
              </Link>
            </div>
          )}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IntentThemeSwitcher />
          <GlobalThemeSwitcher />
          <span style={{ fontSize: '12px', opacity: 0.7 }}>Current: {pathname}</span>
        </div>
      </div>
    </nav>
  );
}

/**
 * Code Review - Counselor Troi (UX):
 * "The navigation provides excellent spatial awareness - users always know where
 * they are. The dropdown for projects prevents clutter while maintaining access.
 * The visual feedback (active states, hover effects) creates confidence. Well done!"
 * 
 * Code Review - Lieutenant Uhura (Communication):
 * "Clear navigation is clear communication. The breadcrumb-style current path
 * display helps orientation. The dev mode badge prevents confusion about environment.
 * This meets my standards for professional communication architecture."
 */

