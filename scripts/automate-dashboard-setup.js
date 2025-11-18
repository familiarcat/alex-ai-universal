#!/usr/bin/env node

/**
 * Dashboard Setup Automation Script
 * 
 * Automates the setup of RAG-powered dashboard components
 * 
 * Reviewed by: Commander Riker (Automation) & Lt. Cmdr. La Forge (Infrastructure)
 */

const fs = require('fs');
const path = require('path');

const DASHBOARD_DIR = path.join(__dirname, '..', 'dashboard');
const COMPONENTS_DIR = path.join(DASHBOARD_DIR, 'components');

const COMPONENTS = [
  {
    name: 'RAGProjectRecommendations',
    file: 'RAGProjectRecommendations.tsx',
    description: 'RAG-powered project recommendations'
  },
  {
    name: 'CrewMemoryVisualization',
    file: 'CrewMemoryVisualization.tsx',
    description: 'Crew memory visualization'
  },
  {
    name: 'LearningAnalyticsDashboard',
    file: 'LearningAnalyticsDashboard.tsx',
    description: 'Learning analytics dashboard'
  }
];

function checkComponents() {
  console.log('🔍 Checking dashboard components...\n');
  
  const missing = [];
  const present = [];
  
  COMPONENTS.forEach(comp => {
    const filePath = path.join(COMPONENTS_DIR, comp.file);
    if (fs.existsSync(filePath)) {
      present.push(comp);
      console.log(`✅ ${comp.name} - ${comp.description}`);
    } else {
      missing.push(comp);
      console.log(`❌ ${comp.name} - MISSING`);
    }
  });
  
  console.log(`\n📊 Status: ${present.length}/${COMPONENTS.length} components present`);
  
  if (missing.length > 0) {
    console.log(`\n⚠️  Missing components: ${missing.map(c => c.name).join(', ')}`);
    return false;
  }
  
  return true;
}

function checkDashboardIntegration() {
  console.log('\n🔍 Checking dashboard integration...\n');
  
  const dashboardContentPath = path.join(DASHBOARD_DIR, 'app', 'dashboard', 'dashboard-content.tsx');
  
  if (!fs.existsSync(dashboardContentPath)) {
    console.log('❌ dashboard-content.tsx not found');
    return false;
  }
  
  const content = fs.readFileSync(dashboardContentPath, 'utf8');
  
  const integrated = COMPONENTS.filter(comp => 
    content.includes(comp.name)
  );
  
  console.log(`✅ ${integrated.length}/${COMPONENTS.length} components integrated`);
  
  integrated.forEach(comp => {
    console.log(`   ✅ ${comp.name}`);
  });
  
  const notIntegrated = COMPONENTS.filter(comp => 
    !content.includes(comp.name)
  );
  
  if (notIntegrated.length > 0) {
    console.log(`\n⚠️  Not integrated: ${notIntegrated.map(c => c.name).join(', ')}`);
    return false;
  }
  
  return true;
}

function verifyAPIEndpoints() {
  console.log('\n🔍 Checking API endpoints...\n');
  
  const apiPath = path.join(DASHBOARD_DIR, 'app', 'api', 'knowledge', 'query', 'route.ts');
  
  if (fs.existsSync(apiPath)) {
    console.log('✅ /api/knowledge/query endpoint exists');
    return true;
  } else {
    console.log('❌ /api/knowledge/query endpoint missing');
    return false;
  }
}

async function main() {
  console.log('🖖 Dashboard Setup Automation\n');
  console.log('═'.repeat(60));
  
  const componentsOk = checkComponents();
  const integrationOk = checkDashboardIntegration();
  const apiOk = verifyAPIEndpoints();
  
  console.log('\n' + '═'.repeat(60));
  console.log('📋 Summary:');
  console.log(`   Components: ${componentsOk ? '✅' : '❌'}`);
  console.log(`   Integration: ${integrationOk ? '✅' : '❌'}`);
  console.log(`   API Endpoints: ${apiOk ? '✅' : '❌'}`);
  
  if (componentsOk && integrationOk && apiOk) {
    console.log('\n✅ Dashboard setup complete!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Dashboard setup incomplete. Please review missing components.');
    process.exit(1);
  }
}

main().catch(console.error);

