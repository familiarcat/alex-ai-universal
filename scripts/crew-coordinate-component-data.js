#!/usr/bin/env node

/**
 * Crew Component Data Coordination
 * 
 * Coordinates crew teams to update components with data sources
 * Uses Observation Lounge for crew coordination
 * 
 * Leadership: Commander Riker (Organization) + Quark (Business Analytics)
 */

const fs = require('fs');
const path = require('path');

const ANALYSIS_DIR = path.join(__dirname, '../docs/component-data-analysis');
const CREW_REPORT_PATH = path.join(ANALYSIS_DIR, 'crew-report.json');

async function coordinateCrewForComponentData() {
  console.log('🖖 Crew Component Data Coordination');
  console.log('====================================\n');

  // Load crew report
  if (!fs.existsSync(CREW_REPORT_PATH)) {
    console.error('❌ Crew report not found. Run analyze-component-data-sources.js first.');
    process.exit(1);
  }

  const crewReport = JSON.parse(fs.readFileSync(CREW_REPORT_PATH, 'utf-8'));

  console.log('📊 Component Data Status:');
  console.log(`   Total Components: ${crewReport.summary.total}`);
  console.log(`   ✅ With Live Data: ${crewReport.summary.withLiveData}`);
  console.log(`   ⚠️  With Mock Data: ${crewReport.summary.withMockData}`);
  console.log(`   ❓ Without Data: ${crewReport.summary.withoutData}\n`);

  // Organize problems by priority
  const problemsByComponent = {};
  crewReport.problems.forEach(({ component, problem }) => {
    if (!problemsByComponent[component]) {
      problemsByComponent[component] = [];
    }
    problemsByComponent[component].push(problem);
  });

  // Group components by crew assignment
  const crewAssignments = {
    'geordi_la_forge': {
      crew: 'Geordi La Forge',
      role: 'Infrastructure',
      tasks: [
        'Create /api/security/assessment endpoint',
        'Create /api/cost/optimization endpoint',
        'Create /api/ux/analytics endpoint',
        'Create /api/sync/status endpoint',
        'Create /api/components/registry endpoint'
      ],
      components: ['SecurityAssessmentDashboard', 'CostOptimizationMonitor', 'UserExperienceAnalytics', 'CrossServerSyncPanel', 'DynamicComponentRegistry']
    },
    'commander_riker': {
      crew: 'Commander Riker',
      role: 'Tactical Operations',
      tasks: [
        'Coordinate component updates',
        'Migrate components from mock to live data',
        'Test components with live data'
      ],
      components: Object.keys(problemsByComponent)
    },
    'lieutenant_worf': {
      crew: 'Lieutenant Worf',
      role: 'Security',
      tasks: [
        'Implement Security Assessment API',
        'Connect SecurityAssessmentDashboard to live data'
      ],
      components: ['SecurityAssessmentDashboard']
    },
    'quark': {
      crew: 'Quark',
      role: 'Business Intelligence',
      tasks: [
        'Implement Cost Optimization API',
        'Connect CostOptimizationMonitor to live data'
      ],
      components: ['CostOptimizationMonitor']
    },
    'counselor_troi': {
      crew: 'Counselor Troi',
      role: 'User Experience',
      tasks: [
        'Implement UX Analytics API',
        'Connect UserExperienceAnalytics to live data',
        'Ensure components handle loading/error states'
      ],
      components: ['UserExperienceAnalytics']
    },
    'lieutenant_uhura': {
      crew: 'Lieutenant Uhura',
      role: 'Communications',
      tasks: [
        'Implement Sync Status API',
        'Connect CrossServerSyncPanel to live data',
        'Document data flow'
      ],
      components: ['CrossServerSyncPanel']
    },
    'chief_obrien': {
      crew: 'Chief O\'Brien',
      role: 'Pragmatic Solutions',
      tasks: [
        'Test mock data system',
        'Integrate mock data into components without live data',
        'Ensure graceful fallbacks'
      ],
      components: Object.keys(problemsByComponent).filter(c => 
        problemsByComponent[c].some(p => p.includes('mock') || p.includes('empty'))
      )
    }
  };

  // Generate coordination plan
  const coordinationPlan = {
    sessionId: `component-data-${Date.now()}`,
    topic: 'Component Data Source Updates - Mock to Live Data Migration',
    teams: Object.entries(crewAssignments).map(([crewId, assignment]) => ({
      teamId: `team-${crewId}`,
      teamName: `${assignment.crew} Team`,
      crewMember: crewId,
      tasks: assignment.tasks,
      components: assignment.components,
      priority: assignment.components.length > 5 ? 'high' : assignment.components.length > 2 ? 'medium' : 'low'
    })),
    coordinationStrategy: 'parallel',
    businessMetrics: {
      estimatedValue: 100,
      cost: 20,
      roi: 400
    },
    timeline: {
      start: new Date().toISOString(),
      estimatedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: [
        'Mock data system integrated',
        'API endpoints created',
        'Components migrated to live data',
        'All components render with data'
      ]
    }
  };

  // Save coordination plan
  const planPath = path.join(ANALYSIS_DIR, 'coordination-plan.json');
  fs.writeFileSync(planPath, JSON.stringify(coordinationPlan, null, 2));

  console.log('👥 Crew Assignments:\n');
  Object.entries(crewAssignments).forEach(([crewId, assignment]) => {
    console.log(`   ${assignment.crew} (${assignment.role}):`);
    console.log(`      Components: ${assignment.components.length}`);
    console.log(`      Tasks: ${assignment.tasks.length}`);
    assignment.tasks.slice(0, 3).forEach(task => {
      console.log(`        • ${task}`);
    });
    if (assignment.tasks.length > 3) {
      console.log(`        ... and ${assignment.tasks.length - 3} more`);
    }
    console.log('');
  });

  console.log('📋 Coordination Plan:');
  console.log(`   Teams: ${coordinationPlan.teams.length}`);
  console.log(`   Strategy: ${coordinationPlan.coordinationStrategy}`);
  console.log(`   Estimated ROI: ${coordinationPlan.businessMetrics.roi}%`);
  console.log(`   Timeline: ${coordinationPlan.timeline.estimatedCompletion}\n`);

  console.log('✅ Coordination plan saved to:');
  console.log(`   ${planPath}\n`);

  console.log('🖖 Ready for crew coordination via Observation Lounge!');
  console.log('   Run: npm run crew:coordinate:component-data');

  return coordinationPlan;
}

if (require.main === module) {
  coordinateCrewForComponentData().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { coordinateCrewForComponentData };

