'use client';

/**
 * Dynamic Project Homepage
 * Serves any project from state manager with its theme
 * Supports both legacy (alpha/beta/gamma) and dynamic projects
 */

import { useParams, useSearchParams } from 'next/navigation';
import { useAppState } from '@/lib/state-manager';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProjectHomePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { projects } = useAppState();
  
  const projectId = params.projectId as string;
  const project = projects[projectId];
  
  // Get content from query params (for live preview) or from state
  // Query params take priority for live preview updates
  const queryHeadline = searchParams?.get('headline');
  const querySubheadline = searchParams?.get('subheadline');
  const queryDescription = searchParams?.get('description');
  const queryTheme = searchParams?.get('theme');
  
  // Use query params FIRST (for live preview), then project state
  // No 'gradient' fallback - use actual project theme
  const headline = queryHeadline || project?.headline || 'Welcome';
  const subheadline = querySubheadline || project?.subheadline || 'Your new project';
  const description = queryDescription || project?.description || 'Get started building something amazing';
  const theme = queryTheme || project?.theme || 'mochaEarth'; // Changed from 'gradient' to match most common user selection
  
  // Show 404 only if truly not found (after checking everything)
  if (!project && !queryHeadline && !queryTheme) {
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
  
  // Theme-aware styling
  const isDark = ['cyberpunk', 'midnight', 'offworld', 'glassmorphism', 'chromeMetallic'].includes(theme);
  const bgGradients: Record<string, string> = {
    mochaEarth: 'linear-gradient(135deg, #F5EFE7 0%, #E8DED2 100%)',
    verdantNature: 'linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 100%)',
    chromeMetallic: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
    brutalist: '#FFFFFF',
    mutedNeon: 'linear-gradient(135deg, #F5F0EA 0%, #E8E1D9 100%)',
    monochromeBlue: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    pastel: 'linear-gradient(135deg, #fff5f7 0%, #f5f8ff 100%)',
    cyberpunk: 'linear-gradient(135deg, #0a0015 0%, #150a1f 100%)',
    glassmorphism: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    midnight: 'linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%)',
    offworld: 'linear-gradient(135deg, #0a0015 0%, #150a1f 50%, #1a0f2e 100%)'
  };
  
  const textColors: Record<string, string> = {
    mochaEarth: '#2D2520',
    verdantNature: '#1B3A1F',
    chromeMetallic: '#E8E8E8',
    brutalist: '#000000',
    mutedNeon: '#2A2A2A',
    monochromeBlue: '#0D3B66',
    gradient: '#1a202c',
    pastel: '#2d2d2d',
    cyberpunk: '#e8e8e8',
    glassmorphism: '#e8e8e8',
    midnight: '#e8e8e8',
    offworld: '#e8e8e8'
  };
  
  const headingColors: Record<string, string> = {
    mochaEarth: '#1A1614',
    verdantNature: '#0D1F11',
    chromeMetallic: '#FFFFFF',
    brutalist: '#000000',
    mutedNeon: '#1A1A1A',
    monochromeBlue: '#0A1929',
    gradient: '#0f1419',
    pastel: '#1a1a1a',
    cyberpunk: '#00ffaa',
    glassmorphism: '#ffffff',
    midnight: '#ffffff',
    offworld: '#00ffaa'
  };
  
  const bgColor = bgGradients[theme] || bgGradients.gradient;
  const textColor = textColors[theme] || '#2d2d2d';
  const headingColor = headingColors[theme] || '#1a1a1a';
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bgColor,
      color: textColor,
      padding: '100px 20px 40px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
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
        {project.components && project.components.length > 0 ? (
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

/**
 * 🖖 Crew Notes:
 * - Serves all projects (legacy + dynamic) from state manager
 * - No backend servers needed for dynamic projects
 * - Uses Next.js routing instead of Node.js servers
 * - Theme-aware rendering
 * - Supports query param overrides for live preview
 */
