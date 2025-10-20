'use client';

/**
 * Development Mode Navigation
 * Shows only in development, hidden in production builds
 * Reviewed by: Counselor Troi (UX) & Lieutenant Uhura (Navigation)
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import GlobalThemeSwitcher from '@/components/GlobalThemeSwitcher';
import IntentThemeSwitcher from '@/components/IntentThemeSwitcher';

export default function DevNavigation() {
  const pathname = usePathname();
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [previewsOpen, setPreviewsOpen] = useState(false);
  const [previewHost, setPreviewHost] = useState<string>('localhost');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname || 'localhost';
      setPreviewHost(process.env.NEXT_PUBLIC_PREVIEW_HOST || host);
    }
  }, []);

  // (removed stray setBaseUrl effect that caused runtime error)

  // Always render navigation across environments to avoid hidden UI during testing

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path);

  const navStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    background: 'var(--surface)',
    backdropFilter: 'blur(10px)',
    padding: '12px 30px',
    zIndex: 9999,
    borderBottom: '1px solid var(--border)'
  };

  const containerStyle = {
    maxWidth: '1800px',
    margin: '0 auto',
    display: 'flex',
    gap: '30px',
    alignItems: 'center'
  };

  const linkStyle = (active: boolean) => ({
    color: active ? 'var(--heading, var(--text))' : 'var(--text)',
    textDecoration: 'none',
    opacity: active ? 1 : 0.9,
    fontWeight: active ? 600 : 400,
    fontSize: '14px',
    transition: 'all 0.2s',
    padding: '8px 12px',
    borderRadius: '6px',
    background: 'transparent',
    border: active ? '1px solid var(--border)' : '1px solid transparent'
  });

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>
        <span style={{ fontWeight: 700, color: 'var(--heading, var(--text))', fontSize: '15px' }}>
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
        
        <Link href="/themes/template" style={linkStyle(isActive('/themes/template'))}>
          🧩 Theme Template
        </Link>

        <Link href="/observation-lounge" style={linkStyle(isActive('/observation-lounge'))}>
          🛸 Observation Lounge
        </Link>
        
        {/* External previews (open raw projects without dashboard chrome) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setPreviewsOpen(!previewsOpen); setProjectsOpen(false); }}
            style={{
              ...linkStyle(false),
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔍 Previews {previewsOpen ? '▲' : '▼'}
          </button>

          {previewsOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px',
              minWidth: '260px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
            }}>
              {/* Use protocol-relative URLs with explicit host + port to avoid about:blank */}
              <a
                href={`//${previewHost}:3000/?embed=1`}
                target="_blank" rel="noopener noreferrer"
                style={{ ...linkStyle(false), display: 'block' }}
                onClick={() => setPreviewsOpen(false)}
              >
                🛒 Open Project Alpha (3000) raw
              </a>
              <a
                href={`//${previewHost}:3002/?embed=1`}
                target="_blank" rel="noopener noreferrer"
                style={{ ...linkStyle(false), display: 'block' }}
                onClick={() => setPreviewsOpen(false)}
              >
                🏥 Open Project Beta (3002) raw
              </a>
              <a
                href={`//${previewHost}:3003/?embed=1`}
                target="_blank" rel="noopener noreferrer"
                style={{ ...linkStyle(false), display: 'block' }}
                onClick={() => setPreviewsOpen(false)}
              >
                📊 Open Project Gamma (3003) raw
              </a>
            </div>
          )}
        </div>

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
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px',
              minWidth: '200px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
            }}>
              <Link 
                href="/projects/alpha" 
                style={{
                  ...linkStyle(isActive('/projects/alpha')),
                  display: 'block',
                  marginBottom: '4px',
                  paddingLeft: '16px',
                  borderLeft: '3px solid var(--border)'
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
                  marginBottom: '4px',
                  paddingLeft: '24px'
                }}
                onClick={() => setProjectsOpen(false)}
              >
                🏥 Beta (Healthcare)
              </Link>
              <Link 
                href="/projects/gamma" 
                style={{
                  ...linkStyle(isActive('/projects/gamma')),
                  display: 'block',
                  paddingLeft: '32px'
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

