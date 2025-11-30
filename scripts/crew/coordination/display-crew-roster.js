#!/usr/bin/env node

/**
 * 🖖 Display Complete Crew Roster
 * 
 * Displays crew roster from local files and MCP system
 */

const fs = require('fs');
const path = require('path');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖖 Alex AI Crew Roster - MCP System');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const crewMembersDir = path.join(__dirname, '..', 'crew-members');

if (!fs.existsSync(crewMembersDir)) {
  console.error('❌ Crew members directory not found');
  process.exit(1);
}

const crewFiles = fs.readdirSync(crewMembersDir).filter(f => f.endsWith('.json')).sort();

console.log(`📋 Found ${crewFiles.length} Crew Members\n`);

const crewRoster = [];

crewFiles.forEach(file => {
  try {
    const filePath = path.join(crewMembersDir, file);
    const crewData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const name = crewData.personality?.name || crewData.name || file.replace('.json', '').replace(/-/g, ' ');
    const role = crewData.personality?.role || crewData.expertise?.primary || 'Unknown';
    const catchphrase = crewData.personality?.catchphrases?.[0] || crewData.personality?.catchphrase || '';
    const specialization = crewData.expertise?.primary || 'General';
    const years = crewData.expertise?.years || 'Unknown';
    const preferredModels = crewData.ai?.preferredModels || [];
    
    crewRoster.push({
      name,
      role,
      catchphrase,
      specialization,
      years,
      preferredModels,
      file: file.replace('.json', '')
    });
  } catch (error) {
    console.error(`⚠️  Error parsing ${file}: ${error.message}`);
  }
});

// Display by division
console.log('👥 COMPLETE CREW ROSTER');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Command Division
console.log('🎖️  COMMAND DIVISION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
crewRoster.filter(c => c.name.includes('Picard') || c.name.includes('Riker')).forEach(crew => {
  console.log(`\n${crew.name}`);
  console.log(`   Role: ${crew.role}`);
  console.log(`   Specialization: ${crew.specialization}`);
  console.log(`   Experience: ${crew.years} years`);
  if (crew.catchphrase) console.log(`   "${crew.catchphrase}"`);
  if (crew.preferredModels.length > 0) {
    console.log(`   Preferred LLMs: ${crew.preferredModels.join(', ')}`);
  }
});

// Operations & Engineering
console.log('\n\n🔧 OPERATIONS & ENGINEERING DIVISION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
crewRoster.filter(c => 
  c.name.includes('Data') || 
  c.name.includes('La Forge') || 
  c.name.includes('O\'Brien') ||
  c.name.includes('O\'Brien')
).forEach(crew => {
  console.log(`\n${crew.name}`);
  console.log(`   Role: ${crew.role}`);
  console.log(`   Specialization: ${crew.specialization}`);
  console.log(`   Experience: ${crew.years} years`);
  if (crew.catchphrase) console.log(`   "${crew.catchphrase}"`);
  if (crew.preferredModels.length > 0) {
    console.log(`   Preferred LLMs: ${crew.preferredModels.join(', ')}`);
  }
});

// Medical & Counseling
console.log('\n\n💊 MEDICAL & COUNSELING DIVISION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
crewRoster.filter(c => 
  c.name.includes('Crusher') || 
  c.name.includes('Troi')
).forEach(crew => {
  console.log(`\n${crew.name}`);
  console.log(`   Role: ${crew.role}`);
  console.log(`   Specialization: ${crew.specialization}`);
  console.log(`   Experience: ${crew.years} years`);
  if (crew.catchphrase) console.log(`   "${crew.catchphrase}"`);
  if (crew.preferredModels.length > 0) {
    console.log(`   Preferred LLMs: ${crew.preferredModels.join(', ')}`);
  }
});

// Security & Communications
console.log('\n\n⚔️  SECURITY & COMMUNICATIONS DIVISION');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
crewRoster.filter(c => 
  c.name.includes('Worf') || 
  c.name.includes('Uhura')
).forEach(crew => {
  console.log(`\n${crew.name}`);
  console.log(`   Role: ${crew.role}`);
  console.log(`   Specialization: ${crew.specialization}`);
  console.log(`   Experience: ${crew.years} years`);
  if (crew.catchphrase) console.log(`   "${crew.catchphrase}"`);
  if (crew.preferredModels.length > 0) {
    console.log(`   Preferred LLMs: ${crew.preferredModels.join(', ')}`);
  }
});

// Business Intelligence
console.log('\n\n💰 BUSINESS INTELLIGENCE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
crewRoster.filter(c => c.name.includes('Quark')).forEach(crew => {
  console.log(`\n${crew.name}`);
  console.log(`   Role: ${crew.role}`);
  console.log(`   Specialization: ${crew.specialization}`);
  console.log(`   Experience: ${crew.years} years`);
  if (crew.catchphrase) console.log(`   "${crew.catchphrase}"`);
  if (crew.preferredModels.length > 0) {
    console.log(`   Preferred LLMs: ${crew.preferredModels.join(', ')}`);
  }
});

// Summary
console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 CREW SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log(`Total Crew Members: ${crewRoster.length}`);
console.log(`Command Division: ${crewRoster.filter(c => c.name.includes('Picard') || c.name.includes('Riker')).length}`);
console.log(`Operations & Engineering: ${crewRoster.filter(c => c.name.includes('Data') || c.name.includes('La Forge') || c.name.includes('O\'Brien')).length}`);
console.log(`Medical & Counseling: ${crewRoster.filter(c => c.name.includes('Crusher') || c.name.includes('Troi')).length}`);
console.log(`Security & Communications: ${crewRoster.filter(c => c.name.includes('Worf') || c.name.includes('Uhura')).length}`);
console.log(`Business Intelligence: ${crewRoster.filter(c => c.name.includes('Quark')).length}`);

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

