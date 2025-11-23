'use client';

/**
 * Crew Coordination Panel
 * 
 * UI component for coordinating multiple crew members in workflow analysis
 * Displays crew member selection, context, and analysis results
 */

import React, { useState, useEffect } from 'react';
import { useAppState } from '@/lib/state-manager';

interface CrewMember {
  name: string;
  role: string;
  specialization: string;
  preferredModels: string[];
  associatedKnowledge: number;
}

interface CrewCoordinationPanelProps {
  query?: string;
  onCrewSelect?: (crewMembers: string[]) => void;
}

export default function CrewCoordinationPanel({ 
  query = '', 
  onCrewSelect 
}: CrewCoordinationPanelProps) {
  const { globalTheme } = useAppState();
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Load crew members from MCP
  useEffect(() => {
    loadCrewMembers();
  }, []);

  const loadCrewMembers = async () => {
    setLoading(true);
    try {
      // Query crew roster from MCP
      const response = await fetch('/api/mcp/crew/roster', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCrewMembers(data.crewMembers || []);
      }
    } catch (error) {
      console.error('Error loading crew members:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCrewMember = (crewName: string) => {
    const newSelection = selectedCrew.includes(crewName)
      ? selectedCrew.filter(name => name !== crewName)
      : [...selectedCrew, crewName];
    
    setSelectedCrew(newSelection);
    onCrewSelect?.(newSelection);
  };

  const autoSelectCrew = () => {
    if (!query) return;
    
    const queryLower = query.toLowerCase();
    const relevantCrew: string[] = [];
    
    crewMembers.forEach(crew => {
      const specialization = crew.specialization.toLowerCase();
      if (queryLower.includes(specialization) || specialization.includes(queryLower)) {
        relevantCrew.push(crew.name);
      }
    });
    
    setSelectedCrew(relevantCrew);
    onCrewSelect?.(relevantCrew);
  };

  return (
    <div style={{
      padding: 'var(--spacing-lg)',
      borderRadius: 'var(--radius)',
      border: 'var(--border)',
      background: 'var(--card)',
      marginBottom: 'var(--spacing-lg)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)'
      }}>
        <h3 style={{
          fontSize: 'var(--font-lg)',
          color: 'var(--accent)',
          margin: 0
        }}>
          🖖 Crew Coordination
        </h3>
        {query && (
          <button
            onClick={autoSelectCrew}
            style={{
              padding: 'var(--spacing-xs) var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              border: 'var(--border)',
              background: 'var(--accent)',
              color: 'var(--text-on-accent)',
              cursor: 'pointer',
              fontSize: 'var(--font-sm)'
            }}
          >
            Auto-Select Relevant Crew
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          Loading crew members...
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 'var(--spacing-sm)'
        }}>
          {crewMembers.map(crew => (
            <div
              key={crew.name}
              onClick={() => toggleCrewMember(crew.name)}
              style={{
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-sm)',
                border: selectedCrew.includes(crew.name) 
                  ? '2px solid var(--accent)' 
                  : 'var(--border)',
                background: selectedCrew.includes(crew.name)
                  ? 'var(--accent-light)'
                  : 'var(--background)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{
                fontWeight: 'bold',
                color: 'var(--text)',
                marginBottom: 'var(--spacing-xs)'
              }}>
                {crew.name}
              </div>
              <div style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--spacing-xs)'
              }}>
                {crew.role}
              </div>
              <div style={{
                fontSize: 'var(--font-xs)',
                color: 'var(--text-muted)'
              }}>
                {crew.specialization}
              </div>
              {crew.associatedKnowledge > 0 && (
                <div style={{
                  fontSize: 'var(--font-xs)',
                  color: 'var(--accent)',
                  marginTop: 'var(--spacing-xs)'
                }}>
                  📚 {crew.associatedKnowledge} knowledge items
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedCrew.length > 0 && (
        <div style={{
          marginTop: 'var(--spacing-md)',
          padding: 'var(--spacing-sm)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent-light)',
          fontSize: 'var(--font-sm)'
        }}>
          <strong>Selected Crew ({selectedCrew.length}):</strong> {selectedCrew.join(', ')}
        </div>
      )}
    </div>
  );
}

