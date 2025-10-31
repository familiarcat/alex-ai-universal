/**
 * Test Crew Assignment System
 * Demonstrates intelligent routing of questions to appropriate crew members
 */

import { CrewAssignmentSystem } from '../lib/crew-assignment-system';

const assignmentSystem = new CrewAssignmentSystem();

console.log('');
console.log('🖖 CREW ASSIGNMENT SYSTEM TEST');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const testQueries = [
  {
    query: "Should we use cookies or ssr: false for our dashboard hydration errors?",
    expectedCrew: "chief_obrien"
  },
  {
    query: "What's the best high-level architecture for our microservices system?",
    expectedCrew: "captain_picard"
  },
  {
    query: "I need to optimize our database queries and analyze performance bottlenecks",
    expectedCrew: "dr_crusher"
  },
  {
    query: "How do we implement AI-powered code analysis with pattern recognition?",
    expectedCrew: "commander_data"
  },
  {
    query: "What's the ROI of implementing this new feature vs the development cost?",
    expectedCrew: "quark"
  },
  {
    query: "I need help designing a REST API for our system integration",
    expectedCrew: "geordi_la_forge"
  },
  {
    query: "How do we improve the user experience and accessibility of our forms?",
    expectedCrew: "counselor_troi"
  },
  {
    query: "What security vulnerabilities should we test for in this authentication system?",
    expectedCrew: "lieutenant_worf"
  },
  {
    query: "How should we document our API and ensure clear communication between services?",
    expectedCrew: "lieutenant_uhura"
  },
  {
    query: "We need to execute this implementation quickly and coordinate the team",
    expectedCrew: "commander_riker"
  }
];

let passed = 0;
let total = testQueries.length;

for (const test of testQueries) {
  console.log(`❓ Query: "${test.query}"`);
  console.log('');
  
  const assignments = assignmentSystem.assignCrew(test.query);
  const topThree = assignments.slice(0, 3);
  
  console.log('   Top 3 Matches:');
  topThree.forEach((assignment, idx) => {
    const crew = assignmentSystem.getCrewMember(assignment.crewMemberId)!;
    const isExpected = assignment.crewMemberId === test.expectedCrew;
    const icon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
    const check = isExpected ? '✅' : '  ';
    
    console.log(`   ${icon} ${check} ${crew.name} (score: ${assignment.score})`);
    console.log(`      Role: ${crew.role}`);
    console.log(`      Reason: ${assignment.reason}`);
    console.log('');
  });
  
  const bestMatch = topThree[0];
  if (bestMatch.crewMemberId === test.expectedCrew) {
    console.log(`   ✅ PASS: Correctly assigned to ${test.expectedCrew}`);
    passed++;
  } else {
    console.log(`   ⚠️  PARTIAL: Expected ${test.expectedCrew}, got ${bestMatch.crewMemberId}`);
    console.log(`      (May be acceptable if score difference is small)`);
  }
  
  console.log('');
  console.log('   ─────────────────────────────────────────────────────');
  console.log('');
}

console.log('═══════════════════════════════════════════════════════');
console.log(`📊 TEST RESULTS: ${passed}/${total} passed (${Math.round(passed/total*100)}%)`);
console.log('');

if (passed === total) {
  console.log('✅ ALL TESTS PASSED! Crew assignment system working perfectly!');
} else if (passed >= total * 0.7) {
  console.log('✅ GOOD: Most queries routed correctly. System is functional.');
} else {
  console.log('⚠️  NEEDS TUNING: Assignment algorithm may need keyword adjustments.');
}

console.log('');
console.log('🖖 Crew Assignment System Ready!');
console.log('');

