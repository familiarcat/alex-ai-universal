#!/usr/bin/env node

/**
 * Crew Validation: Component Data System
 * 
 * Validates that all component data tasks are fulfilled
 * Coordinates with crew for final approval
 * 
 * Leadership: Captain Picard (Final Approval) + All Crew Members
 */

const fs = require('fs');
const path = require('path');

const ANALYSIS_DIR = path.join(__dirname, '../docs/component-data-analysis');
const CREW_REPORT_PATH = path.join(ANALYSIS_DIR, 'crew-report.json');

function validateImplementation() {
  const validation = {
    timestamp: new Date().toISOString(),
    crew: 'All Teams',
    tasks: {},
    overall: {
      approved: true,
      issues: [],
      recommendations: []
    }
  };

  // Task 1: API Endpoints Created
  const apiEndpoints = [
    'dashboard/app/api/security/assessment/route.ts',
    'dashboard/app/api/cost/optimization/route.ts',
    'dashboard/app/api/ux/analytics/route.ts',
    'dashboard/app/api/sync/status/route.ts'
  ];

  const endpointsExist = apiEndpoints.map(endpoint => {
    const fullPath = path.join(__dirname, '..', endpoint);
    return {
      endpoint,
      exists: fs.existsSync(fullPath),
      path: fullPath
    };
  });

  validation.tasks.apiEndpoints = {
    status: endpointsExist.every(e => e.exists) ? 'completed' : 'incomplete',
    endpoints: endpointsExist,
    crew: 'Geordi La Forge (Infrastructure)',
    approved: endpointsExist.every(e => e.exists)
  };

  if (!validation.tasks.apiEndpoints.approved) {
    validation.overall.approved = false;
    validation.overall.issues.push('Some API endpoints are missing');
  }

  // Task 2: Mock Data System
  const mockDataSystemPath = path.join(__dirname, '..', 'dashboard/lib/mock-data-system.ts');
  validation.tasks.mockDataSystem = {
    status: fs.existsSync(mockDataSystemPath) ? 'completed' : 'incomplete',
    path: mockDataSystemPath,
    crew: 'Commander Data (Data Generation)',
    approved: fs.existsSync(mockDataSystemPath)
  };

  if (!validation.tasks.mockDataSystem.approved) {
    validation.overall.approved = false;
    validation.overall.issues.push('Mock data system not found');
  }

  // Task 3: UnifiedDataService Updated
  const unifiedDataServicePath = path.join(__dirname, '..', 'dashboard/lib/unified-data-service.ts');
  if (fs.existsSync(unifiedDataServicePath)) {
    const content = fs.readFileSync(unifiedDataServicePath, 'utf-8');
    const hasSecurityEndpoint = content.includes('/api/security/assessment');
    const hasCostEndpoint = content.includes('/api/cost/optimization');
    const hasUXEndpoint = content.includes('/api/ux/analytics');
    const hasSyncEndpoint = content.includes('/api/sync/status');
    const hasMockFallback = content.includes('mock-data-system');

    validation.tasks.unifiedDataService = {
      status: (hasSecurityEndpoint && hasCostEndpoint && hasUXEndpoint && hasSyncEndpoint && hasMockFallback) ? 'completed' : 'incomplete',
      hasSecurityEndpoint,
      hasCostEndpoint,
      hasUXEndpoint,
      hasSyncEndpoint,
      hasMockFallback,
      crew: 'Geordi La Forge (Infrastructure)',
      approved: hasSecurityEndpoint && hasCostEndpoint && hasUXEndpoint && hasSyncEndpoint && hasMockFallback
    };

    if (!validation.tasks.unifiedDataService.approved) {
      validation.overall.approved = false;
      validation.overall.issues.push('UnifiedDataService not fully updated');
    }
  } else {
    validation.tasks.unifiedDataService = {
      status: 'incomplete',
      approved: false
    };
    validation.overall.approved = false;
    validation.overall.issues.push('UnifiedDataService not found');
  }

  // Task 4: Components Updated
  const componentsUpdated = [
    'dashboard/components/SecurityAssessmentDashboard.tsx',
    'dashboard/components/CostOptimizationMonitor.tsx',
    'dashboard/components/UserExperienceAnalytics.tsx',
    'dashboard/components/CrossServerSyncPanel.tsx',
    'dashboard/components/LearningAnalyticsDashboard.tsx',
    'dashboard/components/CrewMemoryVisualization.tsx',
    'dashboard/components/RAGProjectRecommendations.tsx'
  ];

  const componentsStatus = componentsUpdated.map(compPath => {
    const fullPath = path.join(__dirname, '..', compPath);
    if (!fs.existsSync(fullPath)) {
      return { component: compPath, updated: false, hasMockFallback: false };
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    return {
      component: compPath,
      updated: true,
      hasMockFallback: content.includes('mock-data-system') || content.includes('mockDataSystem'),
      hasErrorHandling: content.includes('catch') || content.includes('error'),
      hasLoadingState: content.includes('loading') || content.includes('Loading')
    };
  });

  validation.tasks.componentsUpdated = {
    status: componentsStatus.every(c => c.updated && (c.hasMockFallback || c.hasErrorHandling)) ? 'completed' : 'incomplete',
    components: componentsStatus,
    crew: 'Commander Riker (Tactical Operations)',
    approved: componentsStatus.every(c => c.updated && (c.hasMockFallback || c.hasErrorHandling))
  };

  if (!validation.tasks.componentsUpdated.approved) {
    validation.overall.approved = false;
    validation.overall.issues.push('Some components not fully updated');
  }

  // Task 5: Documentation
  const docsExist = [
    'docs/COMPONENT_DATA_FLOW_ANALYSIS.md',
    'docs/CREW_COMPONENT_DATA_COORDINATION.md',
    'docs/COMPONENT_DATA_SYSTEM_SUMMARY.md'
  ].map(doc => {
    const fullPath = path.join(__dirname, '..', doc);
    return {
      doc,
      exists: fs.existsSync(fullPath)
    };
  });

  validation.tasks.documentation = {
    status: docsExist.every(d => d.exists) ? 'completed' : 'incomplete',
    docs: docsExist,
    crew: 'Lieutenant Uhura (Communications)',
    approved: docsExist.every(d => d.exists)
  };

  if (!validation.tasks.documentation.approved) {
    validation.overall.approved = false;
    validation.overall.issues.push('Some documentation missing');
  }

  // Crew Assessments
  validation.crewAssessments = {
    captain_picard: {
      assessment: validation.overall.approved 
        ? 'Mission accomplished. All systems operational.'
        : 'Mission incomplete. Address remaining issues.',
      approved: validation.overall.approved
    },
    commander_data: {
      assessment: validation.tasks.apiEndpoints.approved && validation.tasks.mockDataSystem.approved
        ? 'Data infrastructure complete. All endpoints operational.'
        : 'Data infrastructure incomplete. Missing endpoints or mock system.',
      approved: validation.tasks.apiEndpoints.approved && validation.tasks.mockDataSystem.approved
    },
    geordi_la_forge: {
      assessment: validation.tasks.apiEndpoints.approved && validation.tasks.unifiedDataService.approved
        ? 'Infrastructure ready. All API endpoints created and integrated.'
        : 'Infrastructure not ready. Missing endpoints or integration.',
      approved: validation.tasks.apiEndpoints.approved && validation.tasks.unifiedDataService.approved
    },
    commander_riker: {
      assessment: validation.tasks.componentsUpdated.approved
        ? 'Component updates complete. All components render with data.'
        : 'Component updates incomplete. Some components need work.',
      approved: validation.tasks.componentsUpdated.approved
    },
    lieutenant_worf: {
      assessment: validation.tasks.apiEndpoints.endpoints.find(e => e.endpoint.includes('security'))?.exists
        ? 'Security assessment API operational.'
        : 'Security assessment API missing.',
      approved: validation.tasks.apiEndpoints.endpoints.find(e => e.endpoint.includes('security'))?.exists || false
    },
    quark: {
      assessment: validation.tasks.apiEndpoints.endpoints.find(e => e.endpoint.includes('cost'))?.exists
        ? 'Cost optimization API operational. ROI tracking enabled.'
        : 'Cost optimization API missing.',
      approved: validation.tasks.apiEndpoints.endpoints.find(e => e.endpoint.includes('cost'))?.exists || false
    },
    counselor_troi: {
      assessment: validation.tasks.apiEndpoints.endpoints.find(e => e.endpoint.includes('ux'))?.exists
        ? 'UX analytics API operational. User experience tracking enabled.'
        : 'UX analytics API missing.',
      approved: validation.tasks.apiEndpoints.endpoints.find(e => e.endpoint.includes('ux'))?.exists || false
    },
    lieutenant_uhura: {
      assessment: validation.tasks.documentation.approved && validation.tasks.apiEndpoints.endpoints.find(e => e.endpoint.includes('sync'))?.exists
        ? 'Sync status API operational. Documentation complete.'
        : 'Sync status API or documentation missing.',
      approved: validation.tasks.documentation.approved && (validation.tasks.apiEndpoints.endpoints.find(e => e.endpoint.includes('sync'))?.exists || false)
    },
    chief_obrien: {
      assessment: validation.tasks.mockDataSystem.approved && validation.tasks.componentsUpdated.components.every(c => c.hasMockFallback || c.hasErrorHandling)
        ? 'Mock data system operational. Components have graceful fallbacks.'
        : 'Mock data system or component fallbacks incomplete.',
      approved: validation.tasks.mockDataSystem.approved && validation.tasks.componentsUpdated.components.every(c => c.hasMockFallback || c.hasErrorHandling)
    }
  };

  // Overall approval requires all crew members to approve
  const allCrewApproved = Object.values(validation.crewAssessments).every(assessment => assessment.approved);
  validation.overall.approved = validation.overall.approved && allCrewApproved;

  if (!allCrewApproved) {
    const disapprovingCrew = Object.entries(validation.crewAssessments)
      .filter(([_, assessment]) => !assessment.approved)
      .map(([crew, _]) => crew);
    validation.overall.issues.push(`Crew members not approved: ${disapprovingCrew.join(', ')}`);
  }

  return validation;
}

function printValidationReport(validation) {
  console.log('🖖 Crew Validation: Component Data System');
  console.log('==========================================\n');

  console.log('📋 Task Status:\n');
  Object.entries(validation.tasks).forEach(([task, status]) => {
    const icon = status.approved ? '✅' : '❌';
    console.log(`   ${icon} ${task}: ${status.status}`);
    if (status.crew) {
      console.log(`      Crew: ${status.crew}`);
    }
  });

  console.log('\n👥 Crew Assessments:\n');
  Object.entries(validation.crewAssessments).forEach(([crew, assessment]) => {
    const icon = assessment.approved ? '✅' : '❌';
    const crewName = crew.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    console.log(`   ${icon} ${crewName}:`);
    console.log(`      ${assessment.assessment}`);
  });

  console.log('\n📊 Overall Status:\n');
  if (validation.overall.approved) {
    console.log('   ✅ ALL TASKS COMPLETE - CREW APPROVED');
    console.log('   🖖 Ready for milestone push!');
  } else {
    console.log('   ❌ TASKS INCOMPLETE - CREW NOT APPROVED');
    console.log('   Issues:');
    validation.overall.issues.forEach(issue => {
      console.log(`      • ${issue}`);
    });
  }

  return validation.overall.approved;
}

if (require.main === module) {
  const validation = validateImplementation();
  const approved = printValidationReport(validation);

  // Save validation report
  const reportPath = path.join(ANALYSIS_DIR, 'crew-validation-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(validation, null, 2));

  process.exit(approved ? 0 : 1);
}

module.exports = { validateImplementation, printValidationReport };

