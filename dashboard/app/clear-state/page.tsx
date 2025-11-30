'use client';

/**
 * State Reset Utility
 * Access at: http://localhost:3000/clear-state
 * 
 * Fixes localStorage issues when dashboard shows only 3 projects
 * instead of all 4 (alpha, beta, gamma, temporal)
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearStatePage() {
  const router = useRouter();
  const [currentState, setCurrentState] = useState<any>(null);
  const [result, setResult] = useState<string>('Waiting for action...');
  const [projectCount, setProjectCount] = useState<number>(0);

  useEffect(() => {
    displayCurrentState();
  }, []);

  function displayCurrentState() {
    const state = localStorage.getItem('alex-ai-state');
    if (state) {
      const parsed = JSON.parse(state);
      setCurrentState(parsed);
      const count = Object.keys(parsed.projects || {}).length;
      setProjectCount(count);
      setResult(`Current projects: ${count}\n${Object.keys(parsed.projects || {}).join(', ')}`);
    } else {
      setCurrentState(null);
      setResult('No state - will use defaults on next page load');
    }
  }

  function addTemporalProject() {
    const state = localStorage.getItem('alex-ai-state');
    if (state) {
      const parsed = JSON.parse(state);
      
      if (!parsed.projects.temporal) {
        parsed.projects.temporal = {
          headline: '⏰ Master Your Time, Shape Your Future',
          subheadline: 'Temporal workflow orchestration for modern distributed systems',
          description: 'Build resilient applications with durable execution, automatic retries, and visual workflow monitoring.',
          theme: 'offworld',
          updatedAt: Date.now()
        };
        
        localStorage.setItem('alex-ai-state', JSON.stringify(parsed));
        
        setResult(`✅ SUCCESS!\n\nTemporal project added!\n\nTotal projects: ${Object.keys(parsed.projects).length}\nProjects: ${Object.keys(parsed.projects).join(', ')}\n\nRedirecting to dashboard...`);
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setResult('⚠️ Temporal project already exists!\n\nYou already have the temporal project. Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } else {
      setResult('⚠️ No state found\n\nCreating fresh state with all 4 projects...');
      createDefaultState();
    }
  }

  function createDefaultState() {
    const defaultState = {
      projects: {
        alpha: {
          headline: '✨ Discover Your Next Obsession',
          subheadline: 'Curated collections of premium streetwear and creative essentials',
          description: 'Limited edition drops and exclusive designs you won\'t find anywhere else. New releases every Friday.',
          theme: 'gradient',
          updatedAt: Date.now()
        },
        beta: {
          headline: 'Compassionate Care, When You Need It Most',
          subheadline: 'Board-certified providers dedicated to your health and wellness',
          description: 'Professional healthcare services with telemedicine, patient portal, and HIPAA-compliant security.',
          theme: 'pastel',
          updatedAt: Date.now()
        },
        gamma: {
          headline: '⚡ Unlock the Power of Your Data',
          subheadline: 'Real-time analytics and ML-powered insights for modern teams',
          description: 'Advanced dashboards, custom reports, powerful API access, and predictive analytics.',
          theme: 'cyberpunk',
          updatedAt: Date.now()
        },
        temporal: {
          headline: '⏰ Master Your Time, Shape Your Future',
          subheadline: 'Temporal workflow orchestration for modern distributed systems',
          description: 'Build resilient applications with durable execution, automatic retries, and visual workflow monitoring.',
          theme: 'offworld',
          updatedAt: Date.now()
        }
      },
      globalTheme: 'midnight'
    };
    
    localStorage.setItem('alex-ai-state', JSON.stringify(defaultState));
    setResult('✅ Default state created with 4 projects!\n\nRedirecting to dashboard...');
    
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  }

  function clearAndReload() {
    if (confirm('⚠️ This will ERASE all your project edits and reset to defaults. Continue?')) {
      localStorage.removeItem('alex-ai-state');
      setResult('✅ State cleared!\n\nCreating fresh state with all 4 projects...');
      setTimeout(() => {
        createDefaultState();
      }, 1000);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: '#0a0015',
      color: '#fff',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <h1 style={{ fontSize: '32px', color: '#00ffaa', marginBottom: '15px' }}>
            🖖 Alex AI State Manager
          </h1>
          <p style={{ lineHeight: 1.6, opacity: 0.9 }}>
            Your dashboard is showing only 3 projects because your browser's localStorage has the old state. 
            Click below to clear it and reload with all 4 projects (including Temporal).
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', color: '#00ffaa', marginBottom: '15px' }}>Current State:</h2>
          <pre style={{
            background: '#000',
            padding: '15px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            {currentState ? JSON.stringify(currentState, null, 2) : 'Loading...'}
          </pre>
          <div style={{ marginTop: '15px', color: projectCount < 4 ? '#ffaa00' : '#00ffaa' }}>
            <strong>Projects found: {projectCount}</strong>
            {projectCount < 4 && ' ⚠️ Should be 4!'}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '30px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '20px', color: '#00ffaa', marginBottom: '15px' }}>Actions:</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={addTemporalProject}
              style={{
                background: '#00ffaa',
                color: '#0a0015',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ✅ Add Temporal Project (Keep Existing Data)
            </button>
            <button
              onClick={clearAndReload}
              style={{
                background: '#ff4444',
                color: '#fff',
                border: 'none',
                padding: '15px 30px',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              🗑️ Clear All & Use Defaults (Resets Everything)
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '30px'
        }}>
          <h2 style={{ fontSize: '20px', color: '#00ffaa', marginBottom: '15px' }}>Result:</h2>
          <pre style={{
            background: '#000',
            padding: '15px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            {result}
          </pre>
        </div>
      </div>
    </div>
  );
}

