'use client';

/**
 * OBSERVATION LOUNGE - Crew Memory Browser
 * 
 * Displays crew learnings and reflections from RAG system (Supabase knowledge_base)
 * Shows what each officer has learned and their future learning priorities
 * 
 * Data Source: Client => Supabase direct (via fallback, since n8n webhooks currently down)
 * 
 * Crew: Counselor Troi (UX), Commander Data (knowledge management), Chief O'Brien (pragmatic implementation)
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CrewReflection {
  officer: string;
  rank: string;
  specialty: string;
  memories_learned: string[];
  future_learning_focus: string[];
  key_insight: string;
}

interface ObservationLoungeSession {
  session_id: string;
  title: string;
  executive_summary: string;
  session_date: string;
  created_at: string;
  content: {
    observation_lounge_transcript?: {
      picard_opening?: { statement: string };
      crew_reflections?: CrewReflection[];
      picard_closing?: { statement: string };
    };
    crew_members_involved?: string[];
    session_duration?: string;
  };
}

interface CrewMemberData {
  name: string;
  emoji: string;
  rank: string;
  specialty: string;
  learnings: string[];
  future_focus: string[];
  key_insight: string;
  last_session: string;
}

export default function ObservationLounge() {
  const [sessions, setSessions] = useState<ObservationLoungeSession[]>([]);
  const [crewData, setCrewData] = useState<Record<string, CrewMemberData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  useEffect(() => {
    async function loadCrewMemories() {
      try {
        setLoading(true);
        
        // Fetch from Supabase knowledge_base directly (fallback since n8n webhooks down)
        const response = await fetch('/api/knowledge/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            category: 'observation_lounge_debrief',
            limit: 10 
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to load crew memories: ${response.status}`);
        }

        const data = await response.json();
        setSessions(data.sessions || []);
        
        // Parse crew data from sessions
        const crewMap: Record<string, CrewMemberData> = {};
        
        for (const session of (data.sessions || [])) {
          const transcript = session.content?.observation_lounge_transcript;
          if (transcript?.crew_reflections) {
            for (const reflection of transcript.crew_reflections) {
              const key = reflection.officer.toLowerCase();
              if (!crewMap[key] || session.created_at > crewMap[key].last_session) {
                crewMap[key] = {
                  name: reflection.officer,
                  emoji: getOfficerEmoji(reflection.officer),
                  rank: reflection.rank,
                  specialty: reflection.specialty,
                  learnings: reflection.memories_learned || [],
                  future_focus: reflection.future_learning_focus || [],
                  key_insight: reflection.key_insight || '',
                  last_session: session.created_at
                };
              }
            }
          }
        }
        
        setCrewData(crewMap);
        setError(null);
      } catch (err: any) {
        console.error('Error loading crew memories:', err);
        setError(err.message || 'Failed to load crew memories');
      } finally {
        setLoading(false);
      }
    }

    loadCrewMemories();
  }, []);

  function getOfficerEmoji(officer: string): string {
    const emojiMap: Record<string, string> = {
      'Commander Data': '🤖',
      'Chief Miles O\'Brien': '👷',
      'Lt. Commander Geordi La Forge': '🛠️',
      'Commander Jean-Luc Picard': '👨‍✈️',
      'Counselor Deanna Troi': '💚',
      'Dr. Beverly Crusher': '👨‍⚕️',
      'Commander William Riker': '🎺',
      'Lt. Worf': '🛡️',
      'Lt. Uhura': '📡',
      'Quark': '💰'
    };
    return emojiMap[officer] || '🖖';
  }

  function formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  }

  const crewArray = Object.values(crewData).sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  if (loading) {
    return (
      <main style={{ 
        padding: '90px 24px 40px',
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--text)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          paddingTop: '80px'
        }}>
          <div style={{ fontSize: '64px', animation: 'pulse 2s ease-in-out infinite' }}>
            🛸
          </div>
          <div style={{ fontSize: '24px', fontWeight: 600 }}>
            Loading Observation Lounge...
          </div>
          <div style={{ fontSize: '14px', opacity: 0.6 }}>
            Accessing crew memories from RAG system
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main style={{ 
      padding: '90px 24px 40px',
      minHeight: '100vh',
      background: 'var(--background)',
      color: 'var(--text)',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <h1 style={{ 
            color: 'var(--heading)', 
            fontSize: '32px', 
            margin: 0,
            fontWeight: 700
          }}>
            🛸 Observation Lounge
          </h1>
          <Link 
            href="/dashboard"
            style={{
              fontSize: '14px',
              color: 'var(--accent)',
              textDecoration: 'none',
              padding: '6px 12px',
              border: '1px solid var(--accent)',
              borderRadius: '6px',
              marginLeft: 'auto'
            }}
          >
            ← Dashboard
          </Link>
        </div>
        <p style={{ 
          fontSize: '16px', 
          opacity: 0.8, 
          margin: 0,
          maxWidth: '800px'
        }}>
          Crew reflections, learnings, and future priorities from recent sessions. 
          Each officer shares what they've mastered and what they're focused on learning next.
        </p>
      </div>

      {error && (
        <div style={{ 
          border: '1px solid #ff6666', 
          padding: '16px', 
          borderRadius: '12px', 
          background: 'rgba(255,0,0,0.1)', 
          marginBottom: '24px' 
        }}>
          <strong>Error:</strong> {error}
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.8 }}>
            Make sure the knowledge_base table exists in Supabase and the API route is configured.
          </div>
        </div>
      )}

      {sessions.length === 0 && !error && (
        <div style={{ 
          opacity: 0.7, 
          padding: '48px 24px', 
          border: '2px dashed rgba(255,255,255,0.2)', 
          borderRadius: '12px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖖</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            No Observation Lounge sessions yet
          </div>
          <div style={{ fontSize: '14px' }}>
            Crew memories will appear here once they hold debrief sessions.
          </div>
        </div>
      )}

      {/* Session List */}
      {sessions.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 600, 
            marginBottom: '16px',
            color: 'var(--accent)'
          }}>
            📋 Recent Sessions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((session) => (
              <div 
                key={session.session_id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--surface)',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setExpandedSession(
                  expandedSession === session.session_id ? null : session.session_id
                )}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: 600, 
                      marginBottom: '4px',
                      color: 'var(--heading)'
                    }}>
                      {session.title}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      opacity: 0.7,
                      marginBottom: '8px'
                    }}>
                      {formatDate(session.created_at)}
                      {session.content.session_duration && ` • ${session.content.session_duration}`}
                      {session.content.crew_members_involved && 
                        ` • ${session.content.crew_members_involved.length} officers`}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      opacity: 0.85,
                      lineHeight: 1.5
                    }}>
                      {session.executive_summary}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: '20px',
                    marginLeft: '16px',
                    transform: expandedSession === session.session_id ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </div>
                </div>

                {/* Expanded Session Details */}
                {expandedSession === session.session_id && session.content.observation_lounge_transcript && (
                  <div style={{ 
                    marginTop: '24px', 
                    paddingTop: '24px',
                    borderTop: '1px solid var(--border)'
                  }}>
                    {session.content.observation_lounge_transcript.picard_opening && (
                      <div style={{ 
                        marginBottom: '24px',
                        padding: '16px',
                        background: 'rgba(0,255,170,0.05)',
                        borderLeft: '3px solid var(--accent)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--accent)' }}>
                          👨‍✈️ Commander Picard (Opening)
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic' }}>
                          "{session.content.observation_lounge_transcript.picard_opening.statement}"
                        </div>
                      </div>
                    )}

                    {session.content.observation_lounge_transcript.crew_reflections?.map((reflection, idx) => (
                      <div 
                        key={idx}
                        style={{
                          marginBottom: '16px',
                          padding: '16px',
                          background: 'var(--card)',
                          borderRadius: '8px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <div style={{ 
                          fontSize: '16px', 
                          fontWeight: 600,
                          marginBottom: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span>{getOfficerEmoji(reflection.officer)}</span>
                          <span>{reflection.officer}</span>
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          opacity: 0.7,
                          marginBottom: '12px'
                        }}>
                          {reflection.rank} • {reflection.specialty}
                        </div>
                        
                        {reflection.memories_learned && reflection.memories_learned.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ 
                              fontSize: '13px', 
                              fontWeight: 600,
                              marginBottom: '6px',
                              color: 'var(--accent)'
                            }}>
                              Memories Learned:
                            </div>
                            <ul style={{ 
                              margin: 0, 
                              paddingLeft: '20px',
                              fontSize: '13px',
                              opacity: 0.9
                            }}>
                              {reflection.memories_learned.slice(0, 3).map((learning, i) => (
                                <li key={i} style={{ marginBottom: '4px' }}>{learning}</li>
                              ))}
                              {reflection.memories_learned.length > 3 && (
                                <li style={{ opacity: 0.6, fontStyle: 'italic' }}>
                                  + {reflection.memories_learned.length - 3} more learnings
                                </li>
                              )}
                            </ul>
                          </div>
                        )}

                        {reflection.key_insight && (
                          <div style={{
                            fontSize: '13px',
                            fontStyle: 'italic',
                            padding: '8px 12px',
                            background: 'rgba(0,255,170,0.05)',
                            borderLeft: '2px solid var(--accent)',
                            borderRadius: '4px',
                            marginTop: '8px'
                          }}>
                            💡 "{reflection.key_insight}"
                          </div>
                        )}
                      </div>
                    ))}

                    {session.content.observation_lounge_transcript.picard_closing && (
                      <div style={{ 
                        marginTop: '24px',
                        padding: '16px',
                        background: 'rgba(0,255,170,0.05)',
                        borderLeft: '3px solid var(--accent)',
                        borderRadius: '8px'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--accent)' }}>
                          👨‍✈️ Commander Picard (Closing)
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: 1.6, fontStyle: 'italic' }}>
                          "{session.content.observation_lounge_transcript.picard_closing.statement}"
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crew Member Cards */}
      {crewArray.length > 0 && (
        <div>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 600, 
            marginBottom: '16px',
            color: 'var(--accent)'
          }}>
            👥 Crew Learning Summary
          </h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
            gap: '20px' 
          }}>
            {crewArray.map((crew) => (
              <div 
                key={crew.name}
                style={{
                  border: selectedOfficer === crew.name ? '2px solid var(--accent)' : '1px solid var(--border)',
                  borderRadius: '12px',
                  background: 'var(--surface)',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedOfficer(selectedOfficer === crew.name ? null : crew.name)}
                onMouseEnter={(e) => {
                  if (selectedOfficer !== crew.name) {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedOfficer !== crew.name) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '32px' }}>{crew.emoji}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '18px', 
                      fontWeight: 600,
                      color: 'var(--heading)'
                    }}>
                      {crew.name}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      opacity: 0.7 
                    }}>
                      {crew.rank} • {crew.specialty}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  fontSize: '13px',
                  opacity: 0.8,
                  marginBottom: '12px',
                  lineHeight: 1.5
                }}>
                  {crew.learnings.length} recent learnings • {crew.future_focus.length} future priorities
                </div>

                {selectedOfficer === crew.name && (
                  <div style={{ 
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--border)'
                  }}>
                    {crew.learnings.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 600,
                          marginBottom: '8px',
                          color: 'var(--accent)'
                        }}>
                          📚 Recent Learnings:
                        </div>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '20px',
                          fontSize: '13px',
                          opacity: 0.9
                        }}>
                          {crew.learnings.map((learning, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>{learning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {crew.future_focus.length > 0 && (
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: 600,
                          marginBottom: '8px',
                          color: 'var(--accent)'
                        }}>
                          🎯 Future Learning Focus:
                        </div>
                        <ul style={{ 
                          margin: 0, 
                          paddingLeft: '20px',
                          fontSize: '13px',
                          opacity: 0.9
                        }}>
                          {crew.future_focus.map((focus, i) => (
                            <li key={i} style={{ marginBottom: '6px' }}>{focus}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {crew.key_insight && (
                      <div style={{
                        fontSize: '13px',
                        fontStyle: 'italic',
                        padding: '12px',
                        background: 'rgba(0,255,170,0.08)',
                        borderLeft: '3px solid var(--accent)',
                        borderRadius: '6px',
                        lineHeight: 1.5
                      }}>
                        💡 <strong>Key Insight:</strong> "{crew.key_insight}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
