'use client';

/**
 * Live Preview Page for New Project Creation
 * Shows real-time preview of project as users configure it
 * Uses query params to render without requiring project to exist in state
 */

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PreviewPage() {
  const searchParams = useSearchParams();
  
  // Removed mounted check - render immediately with query params to prevent flash
  const headline = searchParams?.get('headline') || 'Your Project';
  const subheadline = searchParams?.get('subheadline') || 'Building something amazing';
  const description = searchParams?.get('description') || 'Professional platform';
  const theme = searchParams?.get('theme') || 'mochaEarth'; // No 'gradient' flash - use current trend
  
  // Theme styling
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
    cyberpunk: 'linear-gradient(135deg, #1a0520 0%, #2d1040 100%)', // Hot pink/purple  
    glassmorphism: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    midnight: 'linear-gradient(135deg, #0a0a0f 0%, #121218 50%, #1a1a24 100%)',
    offworld: 'linear-gradient(135deg, #020818 0%, #041c35 50%, #062a4d 100%)' // Deep blue space
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
    cyberpunk: '#ff0099', // Hot pink
    glassmorphism: '#ffffff',
    midnight: '#ffffff',
    offworld: '#00d9ff' // Bright cyan
  };
  
  const accentColors: Record<string, string> = {
    mochaEarth: '#A67B5B',
    verdantNature: '#2E7D32',
    chromeMetallic: '#00D4FF',
    brutalist: '#000000',
    mutedNeon: '#00FFF0',
    monochromeBlue: '#1565C0',
    gradient: '#667eea',
    pastel: '#f093fb',
    cyberpunk: '#00ffaa',
    glassmorphism: '#6366f1',
    midnight: '#00ffff',
    offworld: '#00ffaa'
  };
  
  const bgColor = bgGradients[theme] || bgGradients.mochaEarth;
  const textColor = textColors[theme] || '#2d2d2d';
  const headingColor = headingColors[theme] || '#1a1a1a';
  const accentColor = accentColors[theme] || '#667eea';
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: bgColor,
      color: textColor,
      padding: '80px 20px 40px'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Hero */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 60,
          padding: 50,
          background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
          borderRadius: 20,
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
        }}>
          <h1 style={{ 
            fontSize: 42, 
            fontWeight: 700, 
            marginBottom: 16,
            color: headingColor,
            lineHeight: 1.2
          }}>
            {headline}
          </h1>
          
          <p style={{ 
            fontSize: 18, 
            marginBottom: 30,
            opacity: 0.9,
            lineHeight: 1.6
          }}>
            {subheadline}
          </p>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button style={{
              padding: '14px 28px',
              background: accentColor,
              color: isDark ? '#0a0015' : '#ffffff',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Get Started
            </button>
            <button style={{
              padding: '14px 28px',
              background: 'transparent',
              color: textColor,
              border: `2px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'}`,
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Learn More
            </button>
          </div>
        </div>
        
        {/* Feature Cards Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 20,
          marginBottom: 60
        }}>
          {[
            { icon: '✨', title: 'Feature One', text: description },
            { icon: '🚀', title: 'Feature Two', text: 'Fast and reliable' },
            { icon: '🎯', title: 'Feature Three', text: 'Built for success' }
          ].map((feature, idx) => (
            <div key={idx} style={{
              padding: 30,
              background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
              borderRadius: 16,
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)'
            }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{feature.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: headingColor }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, opacity: 0.8 }}>
                {feature.text}
              </p>
            </div>
          ))}
        </div>
        
        {/* Theme Badge */}
        <div style={{
          textAlign: 'center',
          padding: 20,
          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          borderRadius: 12,
          fontSize: 13,
          opacity: 0.7
        }}>
          Theme: <strong>{theme}</strong> | Updates in real-time as you configure
        </div>
      </div>
    </div>
  );
}

