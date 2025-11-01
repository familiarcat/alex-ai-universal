'use client';

/**
 * Creative Project Integration Route
 * 
 * Mission: Diplomatic integration of foreign creative writing systems
 * Pattern: Embed external applications while maintaining dashboard consistency
 * 
 * Crew: Chief O'Brien (Implementation), Counselor Troi (UX), La Forge (Infrastructure)
 * Reviewed by: Captain Picard (Strategic Architecture)
 */

import { useAppState } from '@/lib/state-manager';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface PageProps {
  params: Promise<{ projectId: string }>;
}

const CREATIVE_PROJECT_PORTS: Record<string, number> = {
  temporal: 3006,
};

export default function CreativeProjectPage({ params }: PageProps) {
  const [projectId, setProjectId] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const { projects } = useAppState();

  useEffect(() => {
    params.then(p => setProjectId(p.projectId));
    setMounted(true);
  }, [params]);

  if (!mounted || !projectId) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0015',
        color: '#00ffaa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📝</div>
          <div style={{ fontSize: '20px' }}>Loading creative project...</div>
        </div>
      </div>
    );
  }

  const project = projects[projectId];
  
  if (!project) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0015',
        color: '#fff',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h1 style={{ fontSize: '32px', color: '#ff4444', marginBottom: '15px' }}>
            Creative Project Not Found
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '30px' }}>
            The creative project "{projectId}" does not exist or has not been configured.
          </p>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              background: '#00ffaa',
              color: '#0a0015',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (project.projectType !== 'creative') {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0015',
        color: '#fff',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
          <h1 style={{ fontSize: '32px', color: '#ffaa00', marginBottom: '15px' }}>
            Not a Creative Project
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '30px' }}>
            "{project.headline}" is a business project. Use the standard project editor instead.
          </p>
          <Link
            href={`/projects/${projectId}`}
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              background: '#00ffaa',
              color: '#0a0015',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            Open Business Project Editor
          </Link>
        </div>
      </div>
    );
  }

  const port = CREATIVE_PROJECT_PORTS[projectId];
  
  if (!port) {
    return (
      <div style={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0015',
        color: '#fff',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔌</div>
          <h1 style={{ fontSize: '32px', color: '#ff4444', marginBottom: '15px' }}>
            Creative App Not Configured
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.8, marginBottom: '30px' }}>
            No port mapping found for creative project "{projectId}". 
            The external application may not be running.
          </p>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
              <div>Expected configuration:</div>
              <div style={{ color: '#00ffaa', marginTop: '10px' }}>
                CREATIVE_PROJECT_PORTS['{projectId}'] = PORT_NUMBER
              </div>
            </div>
          </div>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '15px 30px',
              background: '#00ffaa',
              color: '#0a0015',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const embedUrl = `http://localhost:${port}`;

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: '#0a0015'
    }}>
      {/* Dashboard Header */}
      <div style={{
        background: 'rgba(0, 255, 170, 0.1)',
        borderBottom: '1px solid rgba(0, 255, 170, 0.2)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            href="/dashboard"
            style={{
              color: '#00ffaa',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Dashboard
          </Link>
          <div style={{ color: 'rgba(255, 255, 255, 0.3)' }}>|</div>
          <div>
            <div style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 255, 255, 0.5)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '2px'
            }}>
              Creative Project
            </div>
            <div style={{ 
              fontSize: '18px', 
              color: '#fff',
              fontWeight: 600
            }}>
              📝 {project.headline}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'rgba(0, 255, 170, 0.1)',
            padding: '6px 12px',
            borderRadius: '4px'
          }}>
            Port {port}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            background: 'rgba(0, 255, 170, 0.1)',
            padding: '6px 12px',
            borderRadius: '4px'
          }}>
            Theme: {project.theme}
          </div>
        </div>
      </div>

      {/* Embedded Creative App */}
      <iframe
        src={embedUrl}
        style={{
          flex: 1,
          width: '100%',
          height: 'calc(100vh - 80px)',
          border: 'none',
          background: '#fff'
        }}
        title={`${project.headline} - Creative Project`}
      />

      {/* Status Bar */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.5)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '8px 30px',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.6)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>
          🖖 Diplomatic Integration: Foreign system embedded successfully
        </div>
        <div>
          Crew: O'Brien (Implementation) • Troi (UX) • La Forge (Infrastructure)
        </div>
      </div>
    </div>
  );
}

