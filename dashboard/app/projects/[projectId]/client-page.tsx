'use client';

/**
 * Client Project Page Component
 * Receives pre-resolved theme from server (universal consistency)
 * NO conditional rendering based on client-only state!
 */

import { useAppState } from '@/lib/state-manager';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface UniversalTheme {
  themeId: string;
  colors: {
    background: string;
    text: string;
    heading: string;
    accent: string;
  };
  isDark: boolean;
}

interface ClientProjectPageProps {
  projectId: string;
  initialTheme: UniversalTheme;
  initialContent: any | null;
  searchParams: Record<string, string>;
}

export default function ClientProjectPage({ projectId, initialTheme, initialContent, searchParams }: ClientProjectPageProps) {
  const { projects } = useAppState();
  const [mounted, setMounted] = useState(false);
  
  // Priority: state-manager (live edits) > initialContent (SSR) > defaults
  const project = projects[projectId] || initialContent;
  
  // Prevent hydration mismatch for components (they may differ server vs client)
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Get content from query params (for live preview) or from state
  const queryHeadline = searchParams.headline;
  const querySubheadline = searchParams.subheadline;
  const queryDescription = searchParams.description;
  
  const headline = queryHeadline || project?.headline || 'Welcome';
  const subheadline = querySubheadline || project?.subheadline || 'Your new project';
  const description = queryDescription || project?.description || 'Get started building something amazing';
  
  // Use server-resolved theme (guaranteed to match SSR)
  const { colors: themeColors, isDark } = initialTheme;
  const bgColor = themeColors.background;
  const textColor = themeColors.text;
  const headingColor = themeColors.heading;
  const accentColor = themeColors.accent;
  
  // 404 only if truly not found
  if (!project && !queryHeadline && !searchParams.theme) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0015',
        color: '#fff',
        flexDirection: 'column',
        gap: 20
      }}>
        <h1 style={{ fontSize: 48, fontWeight: 700 }}>404</h1>
        <p style={{ opacity: 0.8 }}>Project "{projectId}" not found</p>
        <Link href="/dashboard" style={{ color: '#00ffaa', textDecoration: 'underline' }}>
          ← Back to Dashboard
        </Link>
      </div>
    );
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bgColor,
      color: textColor,
      padding: '100px 20px 40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section - NO suppressHydrationWarning needed! */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 80,
          padding: 60,
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
          borderRadius: 24,
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            fontSize: 56, 
            fontWeight: 700, 
            marginBottom: 24,
            color: headingColor,
            lineHeight: 1.2
          }}>
            {headline}
          </h1>
          
          <p style={{ 
            fontSize: 22, 
            marginBottom: 40,
            opacity: 0.9,
            maxWidth: 700,
            margin: '0 auto 40px'
          }}>
            {subheadline}
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' as const }}>
            <button style={{
              padding: '16px 32px',
              background: isDark ? '#00ffaa' : '#667eea',
              color: isDark ? '#0a0015' : '#ffffff',
              border: 'none',
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              Get Started
            </button>
            <button style={{
              padding: '16px 32px',
              background: 'transparent',
              color: textColor,
              border: `2px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: 12,
              fontSize: 18,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Learn More
            </button>
          </div>
        </div>
        
        {/* Features/Components Section */}
        {mounted && project?.components && project.components.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 24,
            marginBottom: 80
          }}>
            {project.components.map(comp => (
              <div key={comp.id} style={{
                padding: 30,
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderRadius: 16,
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                gridColumn: comp.role === 'hero' ? 'span 2' : 'auto'
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12, color: headingColor }}>
                  {comp.title}
                </h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>
                  {comp.body}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center',
            padding: 60,
            background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            borderRadius: 16,
            marginBottom: 80
          }}>
            <p style={{ fontSize: 16, opacity: 0.7 }}>
              {description}
            </p>
            <p style={{ fontSize: 14, opacity: 0.5, marginTop: 20 }}>
              Add components in the dashboard's Component Manager to build out this page.
            </p>
          </div>
        )}
        
        {/* Footer Navigation */}
        <footer style={{
          marginTop: 80,
          paddingTop: 40,
          borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 30,
            marginBottom: 30
          }}>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: headingColor }}>Company</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, opacity: 0.8 }}>
                <Link href={`/projects/${projectId}/about`} style={{ color: textColor, textDecoration: 'none' }}>About</Link>
                <Link href={`/projects/${projectId}/careers`} style={{ color: textColor, textDecoration: 'none' }}>Careers</Link>
                <Link href={`/projects/${projectId}/blog`} style={{ color: textColor, textDecoration: 'none' }}>Blog</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: headingColor }}>Products</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, opacity: 0.8 }}>
                <Link href={`/projects/${projectId}/features`} style={{ color: textColor, textDecoration: 'none' }}>Features</Link>
                <Link href={`/projects/${projectId}/pricing`} style={{ color: textColor, textDecoration: 'none' }}>Pricing</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: headingColor }}>Support</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, opacity: 0.8 }}>
                <Link href={`/projects/${projectId}/docs`} style={{ color: textColor, textDecoration: 'none' }}>Documentation</Link>
                <Link href={`/projects/${projectId}/support`} style={{ color: textColor, textDecoration: 'none' }}>Support</Link>
                <Link href={`/projects/${projectId}/contact`} style={{ color: textColor, textDecoration: 'none' }}>Contact</Link>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: headingColor }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, opacity: 0.8 }}>
                <Link href={`/projects/${projectId}/privacy`} style={{ color: textColor, textDecoration: 'none' }}>Privacy</Link>
                <Link href={`/projects/${projectId}/terms`} style={{ color: textColor, textDecoration: 'none' }}>Terms</Link>
              </div>
            </div>
          </div>
          
          <div style={{ 
            paddingTop: 20,
            borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
            fontSize: 13,
            opacity: 0.6,
            textAlign: 'center'
          }}>
            © {new Date().getFullYear()} {headline}. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}

