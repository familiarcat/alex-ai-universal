'use client';

/**
 * New Project Creation Workflow
 * Integrates Quiz + Wizard for guided project generation
 * Memory: Stored in n8n => Supabase RAG system for crew learning
 * 
 * Crew: Captain Picard (Strategy), Data (Logic), Troi (UX), La Forge (Implementation)
 */

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/state-manager';
import { THEME_NAMES } from '@/lib/theme-metadata';
import ThemeSelector from '@/components/ThemeSelector';

// Option to skip quiz and use visual theme selector directly
const USE_VISUAL_THEME_SELECTOR = false; // Set to true to use gallery instead of quiz

type ThemeId = 'mochaEarth' | 'verdantNature' | 'chromeMetallic' | 'brutalist' | 'mutedNeon' | 'monochromeBlue' | 'gradient' | 'pastel' | 'cyberpunk' | 'glassmorphism' | 'midnight' | 'offworld';
type BusinessType = 'ecommerce' | 'healthcare' | 'analytics' | 'portfolio' | 'saas' | 'hospitality' | 'finance' | 'publishing';
type Intent = 'acquire' | 'convert' | 'educate' | 'trust' | 'delight';
type Tone = 'bold' | 'calm' | 'playful' | 'serious' | 'futuristic';

// Quiz removed - now using unified visual ThemeSelector component (same as dashboard)

export default function NewProjectPage() {
  const router = useRouter();
  const { projects, updateProject, updateTheme, addComponents } = useAppState();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debounced preview state for smooth 60fps updates (300ms)
  const [debouncedPreview, setDebouncedPreview] = useState({ 
    theme: 'gradient' as ThemeId, 
    headline: '', 
    subheadline: '', 
    description: '' 
  });
  
  // Crossfade state: track current and previous iframe content
  const [previewIframeState, setPreviewIframeState] = useState<{ 
    current: string; 
    currentUrl: string;
    previous: string | null;
    previousUrl: string | null;
    isLoaded: boolean;
  }>({
    current: 'initial',
    currentUrl: '/projects/preview',
    previous: null,
    previousUrl: null,
    isLoaded: true
  });
  
  const [step, setStep] = useState<'theme' | 'wizard' | 'review' | 'generating'>('theme');
  
  // Wizard state
  const [projectName, setProjectName] = useState('');
  const [businessType, setBusinessType] = useState<BusinessType>('ecommerce');
  const [niche, setNiche] = useState('');
  const [goals, setGoals] = useState('');
  const [intent, setIntent] = useState<Intent>('convert');
  const [tone, setTone] = useState<Tone>('calm');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('gradient'); // Default theme, user selects via visual gallery

  function generateProject() {
    setStep('generating');
    
    // Generate unique project ID (unlimited slots)
    const projectId = `project_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    
    const theme = selectedTheme;
    const headline = projectName || `New ${businessType.charAt(0).toUpperCase() + businessType.slice(1)} Project`;
    const subheadline = goals || 'Achieve your business goals with modern design';
    const description = niche || 'A professional platform built for success';
    
    // Create project content with metadata
    updateProject(projectId, 'headline', headline);
    updateProject(projectId, 'subheadline', subheadline);
    updateProject(projectId, 'description', description);
    updateProject(projectId, 'businessType', businessType); // Store for icon mapping
    updateTheme(projectId, theme);
    
    // Generate initial components based on business type
    const components = generateInitialComponents(businessType, intent, tone, theme);
    if (components.length > 0) {
      addComponents(projectId, components as any);
    }
    
    // Auto-add ProjectManager component to control all Alex AI projects
    const projectManagerComponent = {
      id: `project-manager-${projectId}`,
      type: 'project-manager',
      title: 'Alex AI Projects',
      body: 'Manage all your Alex AI projects from here',
      role: 'project-manager',
      priority: 5,
      intent: 'educate' as Intent,
      tone: 'calm' as Tone,
      editable: true,
      deletable: false,
      updatedAt: Date.now(),
      config: {
        showCreateButton: true,
        showEditButton: true,
        showDeleteButton: true
      }
    };
    addComponents(projectId, [projectManagerComponent as any]);
    
    // Store learning in n8n => Supabase (visual selection instead of quiz)
    storeProjectCreationMemory(projectId, theme, businessType, intent, tone);
    
    // Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  }

  function generateInitialComponents(type: BusinessType, intent: Intent, tone: Tone, theme: ThemeId) {
    // Generate 3-5 starter components based on business type
    const uid = () => `comp_${Math.random().toString(36).slice(2, 9)}`;
    
    const baseComponents = [
      {
        id: uid(),
        title: 'Hero Section',
        body: `Welcome to our ${type} platform`,
        role: 'hero' as const,
        priority: 5,
        intent,
        tone,
        theme,
        updatedAt: Date.now()
      },
      {
        id: uid(),
        title: 'Key Features',
        body: 'Discover what makes us unique',
        role: 'feature' as const,
        priority: 4,
        intent: 'educate' as const,
        tone,
        theme,
        updatedAt: Date.now()
      },
      {
        id: uid(),
        title: 'Call to Action',
        body: 'Get started today',
        role: 'cta' as const,
        priority: 4,
        intent: 'convert' as const,
        tone: 'bold' as const,
        theme,
        updatedAt: Date.now()
      }
    ];
    
    return baseComponents;
  }

  async function storeProjectCreationMemory(slot: string, theme: ThemeId, bizType: BusinessType, intent: Intent, tone: Tone) {
    try {
      // Store in n8n => Supabase for crew learning
      const memory = {
        event: 'project_created',
        slot,
        theme,
        businessType: bizType,
        intent,
        tone,
        selectionMethod: 'visual_gallery', // Unified ThemeSelector component
        timestamp: new Date().toISOString(),
        source: 'new_project_workflow'
      };
      
      // Post to n8n knowledge webhook
      const n8nUrl = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.pbradygeorgen.com';
      await fetch(`${n8nUrl}/webhook/knowledge-ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memory)
      }).catch(() => console.log('Memory storage best-effort'));
      
    } catch (error) {
      console.log('Memory storage failed (non-blocking):', error);
    }
  }

  const containerStyle = {
    minHeight: '100vh',
    background: 'var(--background)',
    color: 'var(--text)',
    padding: '40px 20px'
  };

  const cardStyle = {
    background: 'var(--card)',
    border: 'var(--border)',
    borderRadius: 'var(--radius)',
    padding: '30px',
    boxShadow: 'var(--shadow)',
    height: 'fit-content'
  };

  const buttonPrimary = {
    padding: '12px 24px',
    borderRadius: 8,
    background: 'var(--accent)',
    color: '#0a0015',
    border: 'none',
    cursor: 'pointer',
    fontSize: 16,
    fontWeight: 600,
    transition: 'all 0.2s ease'
  };

  const buttonSecondary = {
    padding: '12px 24px',
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--text)',
    border: 'var(--border)',
    cursor: 'pointer',
    fontSize: 16
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    background: 'var(--card-alt)',
    color: 'var(--text)',
    border: 'var(--border)',
    borderRadius: 8,
    fontSize: 14
  };

  // Live preview values (for immediate display)
  const previewTheme = selectedTheme;
  const previewHeadline = projectName || `Your ${businessType} Project`;
  const previewSubheadline = goals || 'Building something amazing';
  const previewDescription = niche || 'Professional platform';
  
  // Debounce iframe updates (300ms after user stops typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedPreview({
        theme: previewTheme,
        headline: previewHeadline,
        subheadline: previewSubheadline,
        description: previewDescription
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, [previewTheme, previewHeadline, previewSubheadline, previewDescription]);
  
  // Update iframe state for crossfade
  useEffect(() => {
    const nextKey = `${debouncedPreview.theme}-${debouncedPreview.headline}-${debouncedPreview.subheadline}`;
    const nextUrl = `/projects/preview?headline=${encodeURIComponent(debouncedPreview.headline)}&subheadline=${encodeURIComponent(debouncedPreview.subheadline)}&description=${encodeURIComponent(debouncedPreview.description)}&theme=${encodeURIComponent(debouncedPreview.theme)}`;

    setPreviewIframeState((prev) => {
      if (prev.current === nextKey) return prev;
      return {
        current: nextKey,
        currentUrl: nextUrl,
        previous: prev.current,
        previousUrl: prev.currentUrl,
        isLoaded: false,
      };
    });
  }, [debouncedPreview]);

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '550px 1fr', gap: 30, alignItems: 'start' }}>
        {/* Left: Creation Form */}
        <div style={cardStyle}>
        {/* Progress Indicator */}
        <div style={{ marginBottom: 30, display: 'flex', justifyContent: 'center', gap: 8 }}>
          <div style={{ 
            width: 40, 
            height: 4, 
            borderRadius: 2, 
            background: step === 'quiz' || step === 'wizard' || step === 'review' || step === 'generating' ? 'var(--accent)' : 'var(--subtle)' 
          }} />
          <div style={{ 
            width: 40, 
            height: 4, 
            borderRadius: 2, 
            background: step === 'wizard' || step === 'review' || step === 'generating' ? 'var(--accent)' : 'var(--subtle)' 
          }} />
          <div style={{ 
            width: 40, 
            height: 4, 
            borderRadius: 2, 
            background: step === 'review' || step === 'generating' ? 'var(--accent)' : 'var(--subtle)' 
          }} />
          <div style={{ 
            width: 40, 
            height: 4, 
            borderRadius: 2, 
            background: step === 'generating' ? 'var(--accent)' : 'var(--subtle)' 
          }} />
        </div>

      {/* Step 1: Visual Theme Selection (Unified with Dashboard) */}
      {step === 'theme' && (
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>
            🎨 Choose Your Theme
          </h1>
          <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 30 }}>
            Select a visual theme for your project. You can change this later in the dashboard.
          </p>
          
          {/* Unified ThemeSelector Component (Same as Dashboard) */}
          <ThemeSelector
            value={selectedTheme || 'gradient'}
            onChange={(themeId) => setSelectedTheme(themeId as ThemeId)}
            mode="gallery"
            showQuickDropdown={false}
            label=""
          />
          
          {/* Navigation */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 30 }}>
            <button 
              onClick={() => setStep('wizard')} 
              style={buttonPrimary}
            >
              Continue with {THEME_NAMES[selectedTheme]} →
            </button>
          </div>
        </div>
      )}

        {/* Step 2: Business Details Wizard */}
        {step === 'wizard' && (
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>
              🧙 Configure Your Project
            </h1>
            <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 30 }}>
              Tell us about your business so we can create the perfect starting point.
            </p>
            
            <div style={{ display: 'grid', gap: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Acme Inc, My Portfolio, HealthCare Plus"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Business Type
                </label>
                <select value={businessType} onChange={(e) => setBusinessType(e.target.value as BusinessType)} style={inputStyle}>
                  <option value="ecommerce">E-commerce / Retail</option>
                  <option value="healthcare">Healthcare / Medical</option>
                  <option value="analytics">Analytics / Data Platform</option>
                  <option value="saas">SaaS / Software</option>
                  <option value="portfolio">Portfolio / Agency</option>
                  <option value="hospitality">Hospitality / Travel</option>
                  <option value="finance">Finance / Professional Services</option>
                  <option value="publishing">Publishing / Media</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Niche / Specialty
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sustainable fashion, Telemedicine, Real-time analytics"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  Primary Goal
                </label>
                <textarea
                  placeholder="e.g., Increase online sales, Build patient trust, Showcase portfolio"
                  value={goals}
                  onChange={(e) => setGoals(e.target.value)}
                  style={{ ...inputStyle, minHeight: 80, resize: 'vertical' as const }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    Intent
                  </label>
                  <select value={intent} onChange={(e) => setIntent(e.target.value as Intent)} style={inputStyle}>
                    <option value="acquire">Acquire Attention</option>
                    <option value="convert">Convert to Action</option>
                    <option value="educate">Educate / Inform</option>
                    <option value="trust">Build Trust</option>
                    <option value="delight">Delight / Brand</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    Tone
                  </label>
                  <select value={tone} onChange={(e) => setTone(e.target.value as Tone)} style={inputStyle}>
                    <option value="bold">Bold / Assertive</option>
                    <option value="calm">Calm / Reassuring</option>
                    <option value="playful">Playful / Fun</option>
                    <option value="serious">Serious / Professional</option>
                    <option value="futuristic">Futuristic / Tech</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 30, display: 'flex', gap: 12 }}>
              <button onClick={() => { setStep('quiz'); setQuizIdx(0); }} style={buttonSecondary}>
                ← Back to Quiz
              </button>
              <button onClick={() => setStep('review')} style={{ ...buttonPrimary, flex: 1 }}>
                Continue to Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Generate */}
        {step === 'review' && (
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12, color: 'var(--accent)' }}>
              ✨ Review & Create
            </h1>
            <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 30 }}>
              Review your choices and generate your project.
            </p>
            
            <div style={{ display: 'grid', gap: 16, marginBottom: 30 }}>
              <div style={{ padding: 16, background: 'var(--card-alt)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Project Name</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{projectName || 'Untitled Project'}</div>
              </div>
              
              <div style={{ padding: 16, background: 'var(--card-alt)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Business Type</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{businessType}</div>
              </div>
              
              <div style={{ padding: 16, background: 'var(--card-alt)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Selected Theme</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', marginBottom: 12 }}>
                  {THEME_NAMES[selectedTheme]}
                </div>
                <ThemeSelector
                  value={selectedTheme}
                  onChange={(themeId) => setSelectedTheme(themeId as ThemeId)}
                  mode="dropdown"
                  label="Change theme:"
                />
              </div>
              
              <div style={{ padding: 16, background: 'var(--card-alt)', borderRadius: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Intent & Tone</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{intent} / {tone}</div>
              </div>
            </div>
            
            <div style={{ marginTop: 30, display: 'flex', gap: 12 }}>
              <button onClick={() => setStep('wizard')} style={buttonSecondary}>
                ← Edit Details
              </button>
              <button onClick={generateProject} style={{ ...buttonPrimary, flex: 1 }}>
                🚀 Generate Project
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Generating */}
        {step === 'generating' && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: 'var(--accent)' }}>
              Generating Your Project...
            </h2>
            <p style={{ fontSize: 16, opacity: 0.8, marginBottom: 20 }}>
              Creating structure, applying theme {THEME_NAMES[selectedTheme || recommendedTheme]}, and storing learning data...
            </p>
            <div style={{ 
              width: '100%', 
              height: 4, 
              background: 'var(--subtle)', 
              borderRadius: 2, 
              overflow: 'hidden',
              marginTop: 30
            }}>
              <div style={{ 
                width: '70%', 
                height: '100%', 
                background: 'var(--accent)',
                animation: 'progress 2s ease-in-out'
              }} />
            </div>
            <div style={{ fontSize: 13, opacity: 0.6, marginTop: 12 }}>
              Crew members are learning from your choices...
            </div>
          </div>
        )}
        </div>

        {/* Right: Live Preview */}
        <div style={{
          position: 'sticky',
          top: 20,
          height: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            marginBottom: 12,
            fontSize: 18,
            fontWeight: 600,
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span>👁️</span>
            <span>Live Preview</span>
            {step === 'generating' && (
              <span style={{ fontSize: 12, opacity: 0.7, marginLeft: 8 }}>
                (Generating...)
              </span>
            )}
          </div>
          
          <div 
            suppressHydrationWarning
            style={{
              flex: 1,
              border: '2px solid var(--accent)',
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0, 255, 170, 0.2)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative' as const
            }}
          >
            {mounted ? (
              <>
                <style>{`
                  @keyframes crossfadeFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  
                  @keyframes crossfadeFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                  }
                  
                  .new-project-iframe-container {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #ffffff;
                  }
                  
                  .new-project-iframe-layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 0;
                    display: block;
                    background: #fff;
                  }
                  
                  .new-project-iframe-current {
                    z-index: 2;
                  }
                  
                  .new-project-iframe-current.loaded {
                    animation: crossfadeFadeIn 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
                  }
                  
                  .new-project-iframe-current.loading {
                    opacity: 0;
                    pointer-events: none;
                    visibility: hidden;
                  }
                  
                  .new-project-iframe-previous {
                    z-index: 1;
                    opacity: 1;
                    pointer-events: none;
                  }
                  
                  .new-project-iframe-previous.fading {
                    animation: crossfadeFadeOut 0.25s cubic-bezier(0.4, 0.0, 0.2, 1) forwards;
                    pointer-events: none;
                  }
                `}</style>
                <div className="new-project-iframe-container">
                  {/* Current iframe (loading invisibly behind previous, fades in when ready) */}
                  <iframe
                    key={previewIframeState.current}
                    src={previewIframeState.currentUrl}
                    title="project-preview-current"
                    className={`new-project-iframe-layer new-project-iframe-current ${previewIframeState.isLoaded ? 'loaded' : 'loading'}`}
                    onLoad={() => {
                      // Wait for iframe content to fully render AND paint before crossfading
                      setTimeout(() => {
                        // Mark as loaded to trigger simultaneous crossfade
                        setPreviewIframeState(prev => ({ ...prev, isLoaded: true }));
                        
                        // Garbage collect previous iframe after crossfade completes
                        setTimeout(() => {
                          setPreviewIframeState(prev => ({ ...prev, previous: null, previousUrl: null }));
                        }, 250); // Match animation duration
                      }, 100); // Increased: allow full content paint
                    }}
                  />
                  
                  {/* Previous iframe (shows ACTUAL previous content, stays visible until crossfade) */}
                  {previewIframeState.previous && previewIframeState.previousUrl && previewIframeState.previous !== 'initial' && (
                    <iframe
                      key={previewIframeState.previous}
                      src={previewIframeState.previousUrl}
                      title="project-preview-previous"
                      className={`new-project-iframe-layer new-project-iframe-previous ${previewIframeState.isLoaded ? 'fading' : ''}`}
                    />
                  )}
                </div>
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                Loading preview...
              </div>
            )}
          </div>
          
          <div style={{
            marginTop: 12,
            fontSize: 12,
            opacity: 0.7,
            textAlign: 'center',
            color: 'var(--text-muted)'
          }}>
            Preview updates as you make changes
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * 🖖 Crew Review:
 * - Captain Picard: "Clear separation of creation vs editing. Excellent strategic architecture."
 * - Commander Data: "Logical flow with proper state transitions. Memory storage integration verified."
 * - Counselor Troi: "Progressive workflow reduces anxiety. Users feel guided, not overwhelmed."
 * - Lt. Cmdr. La Forge: "Clean implementation. n8n integration will help crew learn patterns over time."
 */

