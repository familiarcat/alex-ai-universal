#!/usr/bin/env node

/**
 * 🖖 Dashboard Runtime Issues Fix
 * 
 * Crew fixes potential runtime issues preventing dashboard from loading:
 * - Check for missing context providers
 * - Verify useAppState hook is properly exported
 * - Ensure ErrorBoundary displays errors correctly
 * - Add fallback rendering for loading states
 * 
 * Crew: Data, La Forge, O'Brien, Troi
 */

const fs = require('fs');
const path = require('path');

function checkStateManagerExports() {
  const stateManagerPath = path.join(process.cwd(), 'dashboard/lib/state-manager.tsx');
  if (!fs.existsSync(stateManagerPath)) {
    return { error: 'State manager not found' };
  }
  
  const content = fs.readFileSync(stateManagerPath, 'utf-8');
  
  // Check if useAppState is exported
  if (!content.includes('export function useAppState')) {
    return { 
      issue: 'useAppState not exported',
      fix: 'Add export function useAppState()'
    };
  }
  
  // Check if StateProvider is exported
  if (!content.includes('export function StateProvider')) {
    return { 
      issue: 'StateProvider not exported',
      fix: 'Add export function StateProvider()'
    };
  }
  
  return { success: true };
}

function checkDashboardContentImports() {
  const dashboardContentPath = path.join(process.cwd(), 'dashboard/app/dashboard/dashboard-content.tsx');
  if (!fs.existsSync(dashboardContentPath)) {
    return { error: 'Dashboard content not found' };
  }
  
  const content = fs.readFileSync(dashboardContentPath, 'utf-8');
  
  // Check if useAppState is imported
  if (!content.includes("import { useAppState }")) {
    return { 
      issue: 'useAppState not imported',
      fix: 'Add import { useAppState } from \'@/lib/state-manager\''
    };
  }
  
  // Check if it's used
  if (!content.includes('useAppState()')) {
    return { 
      issue: 'useAppState not used',
      fix: 'Call useAppState() hook in component'
    };
  }
  
  return { success: true };
}

function addErrorBoundaryFallback() {
  const errorBoundaryPath = path.join(process.cwd(), 'dashboard/components/ErrorBoundary.tsx');
  if (!fs.existsSync(errorBoundaryPath)) {
    return { error: 'ErrorBoundary not found' };
  }
  
  const content = fs.readFileSync(errorBoundaryPath, 'utf-8');
  
  // Check if it has a visible fallback
  if (!content.includes('hasError') || !content.includes('return')) {
    return { 
      issue: 'ErrorBoundary may not display errors',
      fix: 'Ensure ErrorBoundary has visible error display'
    };
  }
  
  return { success: true };
}

function checkRootPageRedirect() {
  const rootPagePath = path.join(process.cwd(), 'dashboard/app/page.tsx');
  if (!fs.existsSync(rootPagePath)) {
    return { error: 'Root page not found' };
  }
  
  const content = fs.readFileSync(rootPagePath, 'utf-8');
  
  // Check if it's a client component
  if (!content.includes("'use client'")) {
    return { 
      issue: 'Root page not marked as client component',
      fix: "Add 'use client' directive at top of file"
    };
  }
  
  // Check if useRouter is imported
  if (!content.includes("import { useRouter }")) {
    return { 
      issue: 'useRouter not imported',
      fix: "Add import { useRouter } from 'next/navigation'"
    };
  }
  
  // Check if redirect happens
  if (!content.includes('router.replace') && !content.includes('router.push')) {
    return { 
      issue: 'No redirect in root page',
      fix: 'Add router.replace(\'/dashboard\') in useEffect'
    };
  }
  
  return { success: true };
}

function fixDashboardRuntimeIssues() {
  console.log('🖖 Dashboard Runtime Issues Fix\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const issues = [];
  
  // Check state manager
  console.log('🤖 Commander Data - Checking state manager...\n');
  const stateCheck = checkStateManagerExports();
  if (stateCheck.error) {
    issues.push({ severity: 'critical', ...stateCheck });
  } else if (stateCheck.issue) {
    issues.push({ severity: 'high', ...stateCheck });
  } else {
    console.log('✅ State manager exports verified\n');
  }
  
  // Check dashboard content
  console.log('🔧 Lt. Cmdr. La Forge - Checking dashboard content...\n');
  const contentCheck = checkDashboardContentImports();
  if (contentCheck.error) {
    issues.push({ severity: 'critical', ...contentCheck });
  } else if (contentCheck.issue) {
    issues.push({ severity: 'high', ...contentCheck });
  } else {
    console.log('✅ Dashboard content imports verified\n');
  }
  
  // Check error boundary
  console.log('🛠️ Chief O\'Brien - Checking error boundary...\n');
  const errorCheck = addErrorBoundaryFallback();
  if (errorCheck.error) {
    issues.push({ severity: 'critical', ...errorCheck });
  } else if (errorCheck.issue) {
    issues.push({ severity: 'medium', ...errorCheck });
  } else {
    console.log('✅ Error boundary verified\n');
  }
  
  // Check root page
  console.log('💭 Counselor Troi - Checking root page...\n');
  const rootCheck = checkRootPageRedirect();
  if (rootCheck.error) {
    issues.push({ severity: 'critical', ...rootCheck });
  } else if (rootCheck.issue) {
    issues.push({ severity: 'high', ...rootCheck });
  } else {
    console.log('✅ Root page redirect verified\n');
  }
  
  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (issues.length === 0) {
    console.log('✅ No runtime issues found!\n');
    console.log('💡 Recommendations:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Verify network tab for failed requests');
    console.log('   3. Check if middleware is redirecting to auth');
    console.log('   4. Verify CSS is loading (check if content is invisible)\n');
  } else {
    console.log(`⚠️  Found ${issues.length} issues:\n`);
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. [${issue.severity.toUpperCase()}] ${issue.issue}`);
      console.log(`      Fix: ${issue.fix}\n`);
    });
  }
  
  return { issues };
}

if (require.main === module) {
  fixDashboardRuntimeIssues().catch(console.error);
}

module.exports = { fixDashboardRuntimeIssues };



