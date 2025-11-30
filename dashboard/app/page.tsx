"use client";

/**
 * Landing Page - Alex AI Universal
 * 
 * Public landing page that links to login page
 * Supports both custom auth and Google OAuth
 * 
 * Reviewed by: Counselor Troi (UX) & Lieutenant Worf (Security)
 */

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%)',
      color: '#ffffff'
    }}>
      {/* Header */}
      <header style={{
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-md)'
        }}>
          <span style={{ fontSize: '24px' }}>🖖</span>
          <h1 style={{
            fontSize: 'var(--font-xl)',
            fontWeight: 700,
            margin: 0
          }}>
            Alex AI Universal
          </h1>
        </div>
        <Link
          href="/auth/signin"
          style={{
            padding: 'var(--spacing-sm) var(--spacing-lg)',
            background: 'var(--accent)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Sign In
        </Link>
      </header>

      {/* Hero Section */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-xl)',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          width: '100%'
        }}>
          {/* Logo/Icon */}
          <div style={{
            fontSize: '80px',
            marginBottom: 'var(--spacing-lg)',
            animation: 'pulse 2s ease-in-out infinite'
          }}>
            🖖
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'var(--font-4xl)',
            fontWeight: 700,
            marginBottom: 'var(--spacing-md)',
            background: 'linear-gradient(135deg, #00ffaa 0%, #00d4ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Alex AI Universal
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'var(--font-xl)',
            color: 'rgba(255, 255, 255, 0.8)',
            marginBottom: 'var(--spacing-xl)',
            lineHeight: 1.6
          }}>
            Star Trek Crew-Based AI Assistant
            <br />
            Powered by Progressive RAG Memory System
          </p>

          {/* Features */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--spacing-lg)',
            marginBottom: 'var(--spacing-xl)'
          }}>
            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>🎖️</div>
              <h3 style={{
                fontSize: 'var(--font-lg)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-xs)'
              }}>
                Crew Coordination
              </h3>
              <p style={{
                fontSize: 'var(--font-sm)',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Star Trek crew members provide specialized expertise
              </p>
            </div>

            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>🧠</div>
              <h3 style={{
                fontSize: 'var(--font-lg)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-xs)'
              }}>
                RAG Memory
              </h3>
              <p style={{
                fontSize: 'var(--font-sm)',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Progressive learning system with crew memories
              </p>
            </div>

            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: 'var(--spacing-sm)' }}>⚡</div>
              <h3 style={{
                fontSize: 'var(--font-lg)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-xs)'
              }}>
                Real-Time Sync
              </h3>
              <p style={{
                fontSize: 'var(--font-sm)',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                Live updates with cloud integration
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/auth/signin"
            style={{
              display: 'inline-block',
              padding: 'var(--spacing-md) var(--spacing-xl)',
              background: 'linear-gradient(135deg, #00ffaa 0%, #00d4ff 100%)',
              color: '#0a0a0f',
              borderRadius: 'var(--radius-lg)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: 'var(--font-lg)',
              transition: 'all var(--transition-base)',
              boxShadow: '0 4px 20px rgba(0, 255, 170, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 255, 170, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 255, 170, 0.3)';
            }}
          >
            Access Dashboard →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: 'var(--spacing-lg) var(--spacing-xl)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
        fontSize: 'var(--font-sm)',
        color: 'rgba(255, 255, 255, 0.6)'
      }}>
        <p style={{ margin: 0 }}>
          Secured by Lieutenant Worf | Powered by Next.js & NextAuth.js
        </p>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
