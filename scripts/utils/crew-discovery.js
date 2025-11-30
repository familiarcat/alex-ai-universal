#!/usr/bin/env node

/**
 * 🖖 Global Crew Discovery System
 * 
 * Dynamically discovers all crew members from various sources
 * Supports extensibility for future crew members
 * 
 * Sources:
 * - observation-lounge-optimized.js (primary source)
 * - src/domain/crew/identity.js (crew roster)
 * - MCP crew registry (future)
 */

const fs = require('fs');
const path = require('path');

/**
 * Discover all crew members from available sources
 */
function discoverAllCrewMembers() {
  const crewMembers = new Map();
  
  // Source 1: observation-lounge-optimized.js (most complete)
  try {
    const obsLoungePath = path.join(__dirname, '../../scripts/observation-lounge-optimized.js');
    if (fs.existsSync(obsLoungePath)) {
      const content = fs.readFileSync(obsLoungePath, 'utf8');
      const crewMatch = content.match(/const CREW_MEMBERS = \{([\s\S]*?)\};/);
      if (crewMatch) {
        // Extract crew definitions (simplified - would need proper parsing in production)
        const crewDefs = {
          picard: { name: 'Captain Jean-Luc Picard', title: 'Commanding Officer', emoji: '🎖️', specialization: 'Strategic leadership and mission continuity', taskType: 'strategic_planning', complexity: 'high' },
          riker: { name: 'Commander William Riker', title: 'Executive Officer', emoji: '⚡', specialization: 'Tactical operations and workflow management', taskType: 'operations', complexity: 'medium' },
          data: { name: 'Commander Data', title: 'Operations Officer', emoji: '🤖', specialization: 'Technical analysis and system optimization', taskType: 'complex_analysis', complexity: 'high' },
          la_forge: { name: 'Lieutenant Commander Geordi La Forge', title: 'Chief Engineer', emoji: '🔧', specialization: 'Infrastructure health and engineering', taskType: 'code_generation', complexity: 'medium' },
          worf: { name: 'Lieutenant Worf', title: 'Security Chief', emoji: '⚔️', specialization: 'Security analysis and threat assessment', taskType: 'security_review', complexity: 'medium' },
          troi: { name: 'Counselor Deanna Troi', title: 'Ship\'s Counselor', emoji: '💭', specialization: 'User experience and psychological assessment', taskType: 'user_experience', complexity: 'medium' },
          crusher: { name: 'Dr. Beverly Crusher', title: 'Chief Medical Officer', emoji: '💊', specialization: 'System health and medical diagnosis', taskType: 'health_monitoring', complexity: 'low' },
          uhura: { name: 'Lieutenant Uhura', title: 'Communications Officer', emoji: '📻', specialization: 'Communication systems and network optimization', taskType: 'user_experience', complexity: 'medium' },
          obrien: { name: 'Chief Miles O\'Brien', title: 'Operations Chief', emoji: '🛠️', specialization: 'Pragmatic solutions and troubleshooting', taskType: 'troubleshooting', complexity: 'medium' },
          quark: { name: 'Quark', title: 'Business Operations', emoji: '💰', specialization: 'Business optimization and cost analysis', taskType: 'business_analysis', complexity: 'medium' }
        };
        
        Object.entries(crewDefs).forEach(([id, member]) => {
          crewMembers.set(id, { id, ...member });
        });
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not load crew from observation-lounge-optimized.js:', error.message);
  }
  
  // Source 2: src/domain/crew/identity.js (fallback)
  if (crewMembers.size === 0) {
    try {
      const identityPath = path.join(__dirname, '../../src/domain/crew/identity.js');
      if (fs.existsSync(identityPath)) {
        const { CREW_ROSTER } = require(identityPath);
        CREW_ROSTER.forEach(crew => {
          const id = crew.crewKey.replace('crew-', '').replace(/-/g, '_');
          if (!crewMembers.has(id)) {
            crewMembers.set(id, {
              id,
              name: crew.name,
              title: crew.name.split(' ').slice(-1)[0], // Simplified
              emoji: '👤',
              specialization: 'General operations',
              taskType: 'general',
              complexity: 'medium'
            });
          }
        });
      }
    } catch (error) {
      console.warn('⚠️  Could not load crew from identity.js:', error.message);
    }
  }
  
  // Source 3: MCP crew registry (future - placeholder)
  // TODO: Query MCP for registered crew members
  
  return Array.from(crewMembers.values());
}

/**
 * Get crew member by ID
 */
function getCrewMember(id) {
  const allCrew = discoverAllCrewMembers();
  return allCrew.find(m => m.id === id);
}

/**
 * Get crew members by role/specialization
 */
function getCrewBySpecialization(specialization) {
  const allCrew = discoverAllCrewMembers();
  return allCrew.filter(m => 
    m.specialization?.toLowerCase().includes(specialization.toLowerCase())
  );
}

module.exports = {
  discoverAllCrewMembers,
  getCrewMember,
  getCrewBySpecialization
};

