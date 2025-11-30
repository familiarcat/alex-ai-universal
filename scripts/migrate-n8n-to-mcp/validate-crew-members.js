#!/usr/bin/env node
/**
 * Crew Member Validation System
 * 
 * Ensures only official crew members are used in the system.
 * Prevents accidental introduction of non-official crew members.
 * 
 * Usage:
 *   node scripts/migrate-n8n-to-mcp/validate-crew-members.js
 */

const fs = require('fs');
const path = require('path');

// Official crew members from crew-roster.json
const OFFICIAL_CREW_MEMBERS = [
  'picard',
  'riker',
  'data',
  'troi',
  'quark',
  'crusher', // Dr. Beverly Crusher (NOT Wesley)
  'la_forge',
  'geordi', // Alternative name
  'uhura',
  'worf',
  'obrien',
  'chief_obrien' // Alternative name
];

// Known invalid crew members (should never be used)
const INVALID_CREW_MEMBERS = [
  'wesley',
  'wesley_crusher',
  'ensign_wesley',
  'wesley_crusher_ensign'
];

/**
 * Validate crew member references
 */
function validateCrewMember(crewMember) {
  const normalized = crewMember.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  
  // Check if it's explicitly invalid
  if (INVALID_CREW_MEMBERS.includes(normalized)) {
    return {
      valid: false,
      reason: 'Invalid crew member (not in official roster)',
      suggestion: 'Use an official crew member from crew-roster.json'
    };
  }
  
  // Check if it matches official crew
  const isOfficial = OFFICIAL_CREW_MEMBERS.some(official => 
    normalized === official || normalized.includes(official) || official.includes(normalized)
  );
  
  if (!isOfficial) {
    return {
      valid: false,
      reason: 'Unknown crew member',
      suggestion: 'Use an official crew member from crew-roster.json'
    };
  }
  
  return { valid: true };
}

/**
 * Scan files for crew member references
 */
function scanForCrewReferences(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check for invalid crew members
  for (const invalid of INVALID_CREW_MEMBERS) {
    const regex = new RegExp(`\\b${invalid}\\b`, 'gi');
    const matches = content.match(regex);
    if (matches) {
      issues.push({
        file: filePath,
        issue: `Found invalid crew member: ${invalid}`,
        matches: matches.length,
        severity: 'high'
      });
    }
  }
  
  return issues;
}

/**
 * Validate migration plan for crew member references
 */
function validateMigrationPlan(planPath) {
  if (!fs.existsSync(planPath)) {
    return { valid: true, issues: [] };
  }
  
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  const issues = [];
  
  // Check crew analysis sections
  if (plan.crewAnalysis) {
    for (const [crewMember, analysis] of Object.entries(plan.crewAnalysis)) {
      const validation = validateCrewMember(crewMember);
      if (!validation.valid) {
        issues.push({
          section: 'crewAnalysis',
          crewMember,
          issue: validation.reason,
          suggestion: validation.suggestion,
          severity: 'high'
        });
      }
    }
  }
  
  return { valid: issues.length === 0, issues };
}

// CLI usage
if (require.main === module) {
  const planPath = path.join(__dirname, '../../reports/n8n-to-mcp-migration-plan.json');
  
  console.log('\n🛡️  Crew Member Validation\n');
  console.log('Official Crew Members:');
  OFFICIAL_CREW_MEMBERS.forEach(member => {
    console.log(`  ✅ ${member}`);
  });
  
  console.log('\nInvalid Crew Members (will be flagged):');
  INVALID_CREW_MEMBERS.forEach(member => {
    console.log(`  ❌ ${member}`);
  });
  
  console.log('\nValidating migration plan...\n');
  
  const validation = validateMigrationPlan(planPath);
  
  if (validation.valid) {
    console.log('✅ Migration plan is valid - no invalid crew members found\n');
  } else {
    console.log('⚠️  Issues found in migration plan:\n');
    validation.issues.forEach(issue => {
      console.log(`  ❌ ${issue.issue}`);
      console.log(`     Section: ${issue.section || 'unknown'}`);
      console.log(`     Suggestion: ${issue.suggestion || 'Review crew member reference'}\n`);
    });
  }
}

module.exports = { validateCrewMember, scanForCrewReferences, validateMigrationPlan, OFFICIAL_CREW_MEMBERS, INVALID_CREW_MEMBERS };

