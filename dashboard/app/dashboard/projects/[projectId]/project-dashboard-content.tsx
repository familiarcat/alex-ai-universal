/**
 * 🖖 Project Dashboard Content
 * 
 * Template baseline + variations editor
 * Dynamic component orientation
 * Live preview
 * 
 * Crew: Counselor Troi (UX) + Commander Data (Logic) + La Forge (Implementation)
 */

'use client';

import { useAppState } from '@/lib/state-manager';
import { useProjectVariations } from '@/lib/variation-manager';
import Link from 'next/link';
import { useState } from 'react';
import ThemeSelector from '@/components/ThemeSelector';

interface ProjectDashboardContentProps {
  projectId: string;
}

export default function ProjectDashboardContent({ projectId }: ProjectDashboardContentProps) {
  const { projects, updateProject, updateTheme } = useAppState();
  const project = projects[projectId];
  const {
    state,
    updateVariation,
    resetField,
    resetAll,
    hasVariations,
    getFieldValue,
    isFieldCustomized,
  } = useProjectVariations(projectId);

  if (!project) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#0a0a0f',
        color: '#ffffff',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px', color: '#ff4444' }}>
          ⚠️ Project Not Found
        </h1>
        <p style={{ fontSize: '16px', marginBottom: '20px' }}>
          Project "{projectId}" does not exist.
        </p>
        <Link
          href="/dashboard"
          style={{
            padding: '12px 24px',
            background: 'var(--accent)',
            color: '#0a0015',
            borderRadius: 'var(--radius)',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          ← Back to Master Dashboard
        </Link>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: '#0a0a0f',
        color: '#ffffff',
        gap: '24px'
      }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>Loading template...</div>
      </div>
    );
  }

  const mergedData = state.mergedData || {
    headline: project.headline,
    subheadline: project.subheadline,
    description: project.description,
    theme: project.theme,
    components: project.components || [],
  };

  return (
    <div style={{
      padding: '40px 20px', // FIXED: Consistent top spacing with main dashboard
      minHeight: '100vh',
      background: 'var(--background)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          flexWrap: 'wrap' as const,
          gap: '20px'
        }}>
          <div style={{ flex: 1 }}>
            <Link
              href="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '14px',
                marginBottom: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              ← Back to Master Dashboard
            </Link>
            <h1 style={{
              fontSize: '36px',
              color: 'var(--accent)',
              margin: 0,
              marginBottom: '8px'
            }}>
              {mergedData.headline || 'Untitled Project'}
            </h1>
            {state.template && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                <span>📋 Template: {state.template.name} v{state.template.version}</span>
                {hasVariations && (
                  <span style={{ color: 'var(--accent)' }}>
                    ✏️ {Object.keys(state.variations).length} customization{Object.keys(state.variations).length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link
              href={`/projects/${projectId}`}
              target="_blank"
              style={{
                padding: '12px 24px',
                background: 'var(--accent)',
                color: '#0a0015',
                borderRadius: 'var(--radius)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '15px'
              }}
            >
              👁️ Preview
            </Link>
          </div>
        </div>

        {/* Template Baseline + Variations Editor */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Left: Template Baseline (Read-Only) */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              color: 'var(--accent)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Template Baseline
              <span style={{
                fontSize: '12px',
                fontWeight: 400,
                color: 'var(--text-secondary)',
                background: 'var(--card-alt)',
                padding: '4px 8px',
                borderRadius: '6px'
              }}>
                Read-Only
              </span>
            </h2>
            {state.template ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Headline
                  </label>
                  <div style={{
                    padding: '12px',
                    background: 'var(--card-alt)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-secondary)',
                    fontSize: '16px',
                    border: '1px solid var(--border)',
                    opacity: 0.7
                  }}>
                    {state.template.base_config.headline}
                  </div>
                </div>
                {state.template.base_config.subheadline && (
                  <div>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      display: 'block'
                    }}>
                      Subheadline
                    </label>
                    <div style={{
                      padding: '12px',
                      background: 'var(--card-alt)',
                      borderRadius: 'var(--radius)',
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      border: '1px solid var(--border)',
                      opacity: 0.7
                    }}>
                      {state.template.base_config.subheadline}
                    </div>
                  </div>
                )}
                <div>
                  <label style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '8px',
                    display: 'block'
                  }}>
                    Theme
                  </label>
                  <div style={{
                    padding: '12px',
                    background: 'var(--card-alt)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--text-secondary)',
                    fontSize: '14px',
                    border: '1px solid var(--border)',
                    opacity: 0.7
                  }}>
                    {state.template.default_theme}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                background: 'var(--card-alt)',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--border)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📋</div>
                <div style={{ fontSize: '14px' }}>No template assigned</div>
                <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
                  This project is not using a template
                </div>
              </div>
            )}
          </div>

          {/* Right: Variations Editor (Editable) */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '24px'
          }}>
            <h2 style={{
              fontSize: '20px',
              color: 'var(--accent)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ✏️ Your Customizations
              {hasVariations && (
                <button
                  onClick={resetAll}
                  style={{
                    marginLeft: 'auto',
                    padding: '6px 12px',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--error)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'var(--error)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  Reset All
                </button>
              )}
            </h2>
            {hasVariations ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {Object.keys(state.variations).map((field) => (
                  <div key={field}>
                    <label style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {field && typeof field === 'string' ? field.charAt(0).toUpperCase() + field.slice(1) : String(field || '')}
                      <span style={{
                        fontSize: '10px',
                        background: 'var(--accent)',
                        color: '#0a0015',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}>
                        Customized
                      </span>
                      <button
                        onClick={() => resetField(field)}
                        style={{
                          marginLeft: 'auto',
                          padding: '4px 8px',
                          background: 'transparent',
                          color: 'var(--text-secondary)',
                          border: 'none',
                          fontSize: '11px',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          opacity: 0.7
                        }}
                      >
                        Reset
                      </button>
                    </label>
                    {field === 'theme' ? (
                      <ThemeSelector
                        value={state.variations[field]}
                        onChange={(theme) => {
                          updateVariation('theme', theme);
                          updateTheme(projectId, theme);
                        }}
                        mode="dropdown"
                      />
                    ) : (
                      <input
                        type="text"
                        value={state.variations[field] || ''}
                        onChange={(e) => {
                          updateVariation(field, e.target.value);
                          updateProject(projectId, field, e.target.value);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'var(--card-alt)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          color: 'var(--text)',
                          fontSize: '16px'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                background: 'var(--card-alt)',
                borderRadius: 'var(--radius)',
                border: '1px dashed var(--border)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>✏️</div>
                <div style={{ fontSize: '14px' }}>No customizations yet</div>
                <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
                  Edit fields below to create variations from the template
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Edit Fields */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '20px',
            color: 'var(--accent)',
            marginBottom: '20px'
          }}>
            Quick Edit
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px'
          }}>
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                display: 'block'
              }}>
                Headline {isFieldCustomized('headline') && '✏️'}
              </label>
              <input
                type="text"
                value={mergedData.headline || ''}
                onChange={(e) => {
                  updateVariation('headline', e.target.value);
                  updateProject(projectId, 'headline', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--card-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                display: 'block'
              }}>
                Subheadline {isFieldCustomized('subheadline') && '✏️'}
              </label>
              <input
                type="text"
                value={mergedData.subheadline || ''}
                onChange={(e) => {
                  updateVariation('subheadline', e.target.value);
                  updateProject(projectId, 'subheadline', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--card-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                display: 'block'
              }}>
                Description {isFieldCustomized('description') && '✏️'}
              </label>
              <textarea
                value={mergedData.description || ''}
                onChange={(e) => {
                  updateVariation('description', e.target.value);
                  updateProject(projectId, 'description', e.target.value);
                }}
                rows={4}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'var(--card-alt)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  color: 'var(--text)',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
            <div>
              <label style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '8px',
                display: 'block'
              }}>
                Theme {isFieldCustomized('theme') && '✏️'}
              </label>
              <ThemeSelector
                value={mergedData.theme || 'midnight'}
                onChange={(theme) => {
                  updateVariation('theme', theme);
                  updateTheme(projectId, theme);
                }}
                mode="dropdown"
              />
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            color: 'var(--accent)',
            marginBottom: '20px'
          }}>
            👁️ Live Preview
          </h2>
          <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            minHeight: '600px',
            background: '#fff'
          }}>
            <iframe
              src={`/projects/${projectId}/?headline=${encodeURIComponent(mergedData.headline || '')}&subheadline=${encodeURIComponent(mergedData.subheadline || '')}&description=${encodeURIComponent(mergedData.description || '')}&theme=${encodeURIComponent(mergedData.theme || 'midnight')}`}
              style={{
                width: '100%',
                height: '600px',
                border: 'none'
              }}
              title="Project Preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

