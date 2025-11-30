'use client';

/**
 * Live Preview Page for New Project Creation
 * Shows real-time preview of project as users configure it
 * Uses query params to render without requiring project to exist in state
 */

import { useSearchParams } from 'next/navigation';
import { getThemeColors, isThemeDark } from '@/lib/theme-colors';

export default function PreviewPage() {
  const searchParams = useSearchParams();
  
  // Removed mounted check - render immediately with query params to prevent flash
  const headline = searchParams?.get('headline') || 'Your Project';
  const subheadline = searchParams?.get('subheadline') || 'Building something amazing';
  const description = searchParams?.get('description') || 'Professional platform';
  const theme = searchParams?.get('theme') || 'mochaEarth'; // No 'gradient' flash - use current trend
  
  // Theme styling from single source of truth
  const themeColors = getThemeColors(theme);
  const isDark = isThemeDark(theme);
  
  const bgColor = themeColors.background;
  const textColor = themeColors.text;
  const headingColor = themeColors.heading;
  const accentColor = themeColors.accent;
  
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

