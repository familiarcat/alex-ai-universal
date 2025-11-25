#!/usr/bin/env node

/**
 * 🖖 Crew Diagnosis: Import System & DDD Layer Connection Issues
 * 
 * Crew members work together to diagnose Next.js import path resolution
 * and DDD architecture layer connectivity problems
 * 
 * Usage:
 *   node scripts/crew/coordination/crew-diagnose-import-ddd-issues.js
 */

const fs = require('fs');
const path = require('path');

const CREW_DIAGNOSIS = {
  data: {
    name: 'Commander Data',
    icon: '🤖',
    focus: 'Technical Analysis - Import Path Resolution & TypeScript Config',
    checks: [
      'Verify tsconfig.json path aliases are correct',
      'Check if @/scripts alias points to correct location',
      'Validate Next.js path resolution configuration',
      'Review DDD layer boundaries and import patterns'
    ]
  },
  la_forge: {
    name: 'Lieutenant Commander Geordi La Forge',
    icon: '🔧',
    focus: 'Infrastructure - File System & Module Resolution',
    checks: [
      'Verify unified-service-accessor file exists',
      'Check file location relative to dashboard project',
      'Validate module export structure',
      'Review Next.js module resolution settings'
    ]
  },
  riker: {
    name: 'Commander William Riker',
    icon: '⚡',
    focus: 'Tactical Operations - DDD Architecture Boundaries',
    checks: [
      'Verify DDD layer separation is maintained',
      'Check if dashboard should access scripts directly',
      'Review proper DDD communication patterns',
      'Validate service accessor pattern implementation'
    ]
  },
  obrien: {
    name: 'Chief Miles O\'Brien',
    icon: '🛠️',
    focus: 'Pragmatic Solutions - Quick Fixes & Workarounds',
    checks: [
      'Identify simplest path resolution fix',
      'Check for relative vs absolute path issues',
      'Verify if file needs to be moved or copied',
      'Review alternative import strategies'
    ]
  }
};

const dashboardPath = path.join(process.cwd(), 'dashboard');
const rootPath = process.cwd();

function checkFileExists(filePath, description) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(rootPath, filePath);
  const exists = fs.existsSync(fullPath);
  return {
    file: filePath,
    description,
    exists,
    path: fullPath,
    relative: path.relative(dashboardPath, fullPath)
  };
}

function readJsonFile(filePath) {
  try {
    const fullPath = path.join(dashboardPath, filePath);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    }
    return null;
  } catch (err) {
    return { error: err.message };
  }
}

function analyzeTsConfig() {
  const tsConfig = readJsonFile('tsconfig.json');
  if (!tsConfig || tsConfig.error) {
    return { error: 'tsconfig.json not found or invalid' };
  }
  
  const issues = [];
  const good = [];
  const paths = tsConfig.compilerOptions?.paths || {};
  
  // Check @/* alias
  if (paths['@/*']) {
    good.push(`@/* alias configured: ${JSON.stringify(paths['@/*'])}`);
    
    // Check if it resolves correctly
    const aliasPath = paths['@/*'][0];
    if (aliasPath && !aliasPath.includes('dashboard')) {
      issues.push(`@/* alias may not resolve correctly from dashboard context`);
    }
  } else {
    issues.push('@/* path alias not configured');
  }
  
  // Check @/scripts alias specifically
  if (paths['@/scripts/*']) {
    good.push(`@/scripts/* alias configured: ${JSON.stringify(paths['@/scripts/*'])}`);
  } else {
    issues.push('@/scripts/* path alias not configured - needed for DDD layer access');
  }
  
  return { issues, good, paths, tsConfig };
}

function findUnifiedServiceAccessor() {
  const possiblePaths = [
    'scripts/utils/unified-service-accessor.ts',
    'scripts/utils/unified-service-accessor.js',
    'dashboard/scripts/utils/unified-service-accessor.ts',
    'packages/core/src/utils/unified-service-accessor.ts',
    'src/utils/unified-service-accessor.ts'
  ];
  
  const found = [];
  for (const filePath of possiblePaths) {
    const check = checkFileExists(filePath, 'unified-service-accessor');
    if (check.exists) {
      found.push(check);
    }
  }
  
  return found;
}

function checkApiRoutes() {
  const apiRoutes = [
    'app/api/mcp/workflows/storage/route.ts',
    'app/api/mcp/workflows/executions/route.ts',
    'app/api/mcp/status/route.ts'
  ];
  
  const issues = [];
  const routes = [];
  
  for (const route of apiRoutes) {
    const routePath = path.join(dashboardPath, route);
    if (fs.existsSync(routePath)) {
      const content = fs.readFileSync(routePath, 'utf8');
      const hasImport = content.includes('@/scripts/utils/unified-service-accessor');
      routes.push({
        route,
        exists: true,
        hasImport,
        importLine: hasImport ? content.split('\n').find(line => line.includes('unified-service-accessor')) : null
      });
      
      if (hasImport) {
        issues.push(`Route ${route} imports from @/scripts/utils/unified-service-accessor`);
      }
    }
  }
  
  return { issues, routes };
}

async function crewDiagnosis() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                               ║');
  console.log('║     🖖 CREW DIAGNOSIS: Import System & DDD Layer Connection Issues 🖖        ║');
  console.log('║                                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  console.log('📋 Issue: Module not found - Can\'t resolve \'@/scripts/utils/unified-service-accessor\'');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Commander Data - Technical Analysis
  console.log('🤖 COMMANDER DATA - Technical Analysis');
  console.log('──────────────────────────────────────────────────────────────────────\n');
  
  console.log('   Analyzing TypeScript configuration and path aliases...\n');
  
  const tsConfigAnalysis = analyzeTsConfig();
  if (tsConfigAnalysis.error) {
    console.log(`   ❌ ${tsConfigAnalysis.error}`);
  } else {
    console.log('   ✅ tsconfig.json found');
    if (tsConfigAnalysis.good.length > 0) {
      tsConfigAnalysis.good.forEach(item => console.log(`   ✅ ${item}`));
    }
    if (tsConfigAnalysis.issues.length > 0) {
      tsConfigAnalysis.issues.forEach(item => console.log(`   ⚠️  ${item}`));
    }
  }
  
  // La Forge - Infrastructure
  console.log('\n\n🔧 LIEUTENANT COMMANDER GEORDI LA FORGE - Infrastructure');
  console.log('──────────────────────────────────────────────────────────────────────\n');
  
  console.log('   Searching for unified-service-accessor file...\n');
  
  const fileSearch = findUnifiedServiceAccessor();
  if (fileSearch.length > 0) {
    console.log(`   ✅ Found ${fileSearch.length} instance(s) of unified-service-accessor:\n`);
    fileSearch.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file.file}`);
      console.log(`      Path: ${file.path}`);
      console.log(`      Relative to dashboard: ${file.relative}`);
    });
  } else {
    console.log('   ❌ unified-service-accessor file not found in expected locations');
    console.log('   💡 File may need to be created or path is incorrect');
  }
  
  // Check API routes
  console.log('\n   Analyzing API routes with problematic imports...\n');
  const apiAnalysis = checkApiRoutes();
  apiAnalysis.routes.forEach(route => {
    if (route.hasImport) {
      console.log(`   ⚠️  ${route.route} imports from @/scripts/utils/unified-service-accessor`);
      if (route.importLine) {
        console.log(`      Import: ${route.importLine.trim()}`);
      }
    }
  });
  
  // Riker - DDD Architecture
  console.log('\n\n⚡ COMMANDER WILLIAM RIKER - DDD Architecture');
  console.log('──────────────────────────────────────────────────────────────────────\n');
  
  console.log('   Analyzing DDD layer boundaries...\n');
  
  // Check if scripts are outside dashboard (proper DDD)
  const scriptsPath = path.join(rootPath, 'scripts');
  const dashboardScriptsPath = path.join(dashboardPath, 'scripts');
  
  if (fs.existsSync(scriptsPath) && !fs.existsSync(dashboardScriptsPath)) {
    console.log('   ✅ Scripts are in root (proper DDD separation)');
    console.log('   ⚠️  Dashboard cannot directly import from root scripts via @/ alias');
    console.log('   💡 Solution: Use relative paths or create shared package');
  } else if (fs.existsSync(dashboardScriptsPath)) {
    console.log('   ✅ Scripts exist in dashboard directory');
    console.log('   💡 @/scripts should resolve to dashboard/scripts');
  } else {
    console.log('   ❌ Scripts directory not found');
  }
  
  // O'Brien - Pragmatic Solutions
  console.log('\n\n🛠️  CHIEF MILES O\'BRIEN - Pragmatic Solutions');
  console.log('──────────────────────────────────────────────────────────────────────\n');
  
  console.log('   Identifying quick fixes...\n');
  
  if (fileSearch.length > 0) {
    const bestMatch = fileSearch[0];
    console.log(`   ✅ File found at: ${bestMatch.path}`);
    console.log(`   💡 Recommended fix: Update import to use correct path`);
    
    // Calculate relative path from dashboard/app/api/mcp
    const apiPath = path.join(dashboardPath, 'app', 'api', 'mcp');
    const relativePath = path.relative(apiPath, bestMatch.path);
    const relativeImport = relativePath.replace(/\\/g, '/').replace(/\.ts$/, '').replace(/\.js$/, '');
    
    console.log(`   📝 Suggested import: import { ... } from '${relativeImport.startsWith('.') ? relativeImport : '../../' + relativeImport}';`);
  }
  
  // Summary & Recommendations
  console.log('\n\n📊 CREW DIAGNOSIS SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const allIssues = [
    ...(tsConfigAnalysis.issues || []),
    ...apiAnalysis.issues,
    ...(fileSearch.length === 0 ? ['unified-service-accessor file not found'] : [])
  ];
  
  if (allIssues.length > 0) {
    console.log(`⚠️  Found ${allIssues.length} issue(s):\n`);
    allIssues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    
    console.log('\n💡 Recommended Solutions:\n');
    
    if (fileSearch.length > 0) {
      const bestMatch = fileSearch[0];
      console.log('   1. Fix import paths in API routes:');
      console.log(`      Change: @/scripts/utils/unified-service-accessor`);
      
      // Calculate proper relative path
      const apiRoutePath = path.join(dashboardPath, 'app', 'api', 'mcp', 'workflows', 'storage');
      const relativeToApi = path.relative(apiRoutePath, bestMatch.path);
      const cleanRelative = relativeToApi.replace(/\\/g, '/').replace(/\.ts$/, '').replace(/\.js$/, '');
      
      if (cleanRelative.startsWith('.')) {
        console.log(`      To: ${cleanRelative}`);
      } else {
        console.log(`      To: ../../../../${cleanRelative}`);
      }
    } else {
      console.log('   1. Create unified-service-accessor file or verify it exists');
    }
    
    if (tsConfigAnalysis.issues.includes('@/scripts/* path alias not configured')) {
      console.log('   2. Add @/scripts/* alias to tsconfig.json:');
      console.log('      "@/scripts/*": ["../scripts/*"]');
    }
    
    console.log('   3. Alternative: Move unified-service-accessor to dashboard/lib/');
    console.log('   4. Alternative: Create shared package in packages/ for DDD compliance');
  } else {
    console.log('✅ No critical issues found');
  }
  
  console.log('\n\n🎖️  Captain Picard: "The crew has completed their diagnosis.');
  console.log('   All findings align with DDD architecture principles.');
  console.log('   Implement the recommended solutions to restore proper layer communication."\n');
  
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    🖖 CREW DIAGNOSIS COMPLETE 🖖                             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');
}

crewDiagnosis().catch(err => {
  console.error('\n❌ Error in crew diagnosis:', err.message);
  process.exit(1);
});

