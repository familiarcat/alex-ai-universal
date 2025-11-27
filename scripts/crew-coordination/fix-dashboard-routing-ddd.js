#!/usr/bin/env node

/**
 * 🖖 Dashboard Routing & Navigation DDD Fix
 * 
 * Crew analyzes and fixes dashboard routing/navigation issues:
 * - Router links and navigation structure
 * - DDD compliance (Bounded Contexts, Routes)
 * - Next.js App Router alignment
 * 
 * Crew Coordination:
 * - Data: Route analysis and structure optimization
 * - La Forge: Next.js routing and navigation implementation
 * - Riker: Navigation workflow and execution
 * - Picard: Strategic DDD architecture
 * - Troi: User experience and navigation flow
 * - O'Brien: Pragmatic fixes and troubleshooting
 */

const fs = require('fs');
const path = require('path');

const CREW_TEAMS = [
  {
    team: 'Route Analysis',
    members: ['data', 'la_forge'],
    task: 'Analyze Next.js App Router structure and identify routing issues'
  },
  {
    team: 'DDD Compliance',
    members: ['picard', 'data'],
    task: 'Ensure routing aligns with DDD Bounded Contexts'
  },
  {
    team: 'Navigation Structure',
    members: ['troi', 'riker'],
    task: 'Fix navigation components and router links'
  },
  {
    team: 'Implementation',
    members: ['la_forge', 'obrien'],
    task: 'Implement fixes and verify routing works'
  }
];

function analyzeAppRouterStructure() {
  const rootDir = process.cwd();
  const appDir = path.join(rootDir, 'dashboard/app');
  
  if (!fs.existsSync(appDir)) {
    return { error: 'Dashboard app directory not found' };
  }
  
  const routes = {
    pages: [],
    layouts: [],
    middleware: null,
    redirects: []
  };
  
  function scanDirectory(dir, routePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relativePath = routePath ? `${routePath}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relativePath);
      } else if (entry.isFile()) {
        if (entry.name === 'page.tsx' || entry.name === 'page.js') {
          routes.pages.push({
            path: routePath || '/',
            file: fullPath,
            relativePath
          });
        } else if (entry.name === 'layout.tsx' || entry.name === 'layout.js') {
          routes.layouts.push({
            path: routePath || '/',
            file: fullPath,
            relativePath
          });
        }
      }
    });
  }
  
  scanDirectory(appDir);
  
  // Check for middleware
  const middlewarePath = path.join(rootDir, 'dashboard/middleware.ts');
  if (fs.existsSync(middlewarePath)) {
    routes.middleware = middlewarePath;
  }
  
  return routes;
}

function analyzeNavigationComponents() {
  const rootDir = process.cwd();
  const componentsDir = path.join(rootDir, 'dashboard/components');
  
  const navComponents = {
    DevNavigation: null,
    DashboardChrome: null,
    CommandPalette: null,
    links: []
  };
  
  // Check DevNavigation
  const devNavPath = path.join(componentsDir, 'DevNavigation.tsx');
  if (fs.existsSync(devNavPath)) {
    const content = fs.readFileSync(devNavPath, 'utf-8');
    navComponents.DevNavigation = {
      path: devNavPath,
      hasRouter: content.includes('useRouter') || content.includes('usePathname'),
      links: extractLinks(content)
    };
    navComponents.links.push(...navComponents.DevNavigation.links);
  }
  
  // Check CommandPalette
  const cmdPalettePath = path.join(componentsDir, 'CommandPalette.tsx');
  if (fs.existsSync(cmdPalettePath)) {
    const content = fs.readFileSync(cmdPalettePath, 'utf-8');
    navComponents.CommandPalette = {
      path: cmdPalettePath,
      hasRouter: content.includes('useRouter') || content.includes('usePathname'),
      links: extractLinks(content)
    };
    navComponents.links.push(...navComponents.CommandPalette.links);
  }
  
  return navComponents;
}

function extractLinks(content) {
  const links = [];
  
  // Find Link components with href
  const linkRegex = /href=["']([^"']+)["']/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  
  // Find router.push calls
  const routerPushRegex = /router\.push\(["']([^"']+)["']\)/g;
  while ((match = routerPushRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  
  return [...new Set(links)];
}

function checkDDDCompliance(routes, navComponents) {
  const issues = [];
  const recommendations = [];
  
  // DDD Bounded Contexts should map to routes
  const expectedContexts = [
    { context: 'Dashboard', routes: ['/dashboard'] },
    { context: 'Projects', routes: ['/projects'] },
    { context: 'Authentication', routes: ['/auth'] },
    { context: 'Reports', routes: ['/reports'] },
    { context: 'MCP', routes: ['/mcp', '/api/mcp'] }
  ];
  
  // Check if routes exist for each context
  expectedContexts.forEach(({ context, routes: contextRoutes }) => {
    const foundRoutes = contextRoutes.filter(route => 
      routes.pages.some(page => page.path === route || page.path.startsWith(route))
    );
    
    if (foundRoutes.length === 0) {
      issues.push({
        type: 'missing_context_route',
        context,
        message: `No routes found for ${context} bounded context`
      });
    }
  });
  
  // Check for broken links
  navComponents.links.forEach(link => {
    if (link.startsWith('/')) {
      const routeExists = routes.pages.some(page => {
        if (link === '/') return true;
        return page.path === link || page.path.startsWith(link);
      });
      
      if (!routeExists && !link.startsWith('http')) {
        issues.push({
          type: 'broken_link',
          link,
          message: `Navigation link "${link}" points to non-existent route`
        });
      }
    }
  });
  
  // Check for proper Next.js App Router patterns
  routes.pages.forEach(page => {
    if (page.path === '/dashboard' && !page.file.includes('dashboard-content')) {
      issues.push({
        type: 'dashboard_structure',
        message: 'Dashboard page should use dynamic import with ssr: false'
      });
    }
  });
  
  return { issues, recommendations };
}

function generateFixes(routes, navComponents, dddAnalysis) {
  const fixes = [];
  
  // Fix 1: Ensure root page redirects properly
  const rootPage = routes.pages.find(p => p.path === '/');
  if (rootPage) {
    fixes.push({
      file: rootPage.file,
      issue: 'Root page redirect',
      fix: 'Ensure root page properly redirects to /dashboard using Next.js navigation'
    });
  }
  
  // Fix 2: Verify dashboard page structure
  const dashboardPage = routes.pages.find(p => p.path === '/dashboard');
  if (dashboardPage) {
    fixes.push({
      file: dashboardPage.file,
      issue: 'Dashboard page loading',
      fix: 'Ensure dashboard-content.tsx is properly imported with dynamic() and ssr: false'
    });
  }
  
  // Fix 3: Fix broken navigation links
  dddAnalysis.issues
    .filter(i => i.type === 'broken_link')
    .forEach(issue => {
      fixes.push({
        file: 'Navigation components',
        issue: `Broken link: ${issue.link}`,
        fix: `Update navigation to use valid route or create missing route`
      });
    });
  
  // Fix 4: Ensure middleware doesn't block dashboard
  if (routes.middleware) {
    fixes.push({
      file: routes.middleware,
      issue: 'Middleware protection',
      fix: 'Ensure /dashboard route is properly handled in middleware (auth check)'
    });
  }
  
  return fixes;
}

async function fixDashboardRoutingDDD() {
  console.log('🖖 Dashboard Routing & Navigation DDD Fix\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Team organization
  console.log('👥 Crew Team Organization:\n');
  CREW_TEAMS.forEach(team => {
    console.log(`   ${team.team}:`);
    console.log(`     Members: ${team.members.map(m => m.replace('_', ' ')).join(', ')}`);
    console.log(`     Task: ${team.task}\n`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Step 1: Analyze App Router structure
  console.log('🤖 Commander Data - Analyzing App Router structure...\n');
  const routes = analyzeAppRouterStructure();
  
  if (routes.error) {
    console.error(`❌ ${routes.error}\n`);
    return;
  }
  
  console.log(`✅ Found ${routes.pages.length} pages:`);
  routes.pages.slice(0, 10).forEach(page => {
    console.log(`   ${page.path === '/' ? '/' : page.path}`);
  });
  if (routes.pages.length > 10) {
    console.log(`   ... and ${routes.pages.length - 10} more\n`);
  } else {
    console.log('');
  }
  
  console.log(`✅ Found ${routes.layouts.length} layouts`);
  if (routes.middleware) {
    console.log(`✅ Middleware found: ${routes.middleware}\n`);
  } else {
    console.log(`⚠️  No middleware found\n`);
  }
  
  // Step 2: Analyze navigation components
  console.log('🧭 Counselor Troi - Analyzing navigation components...\n');
  const navComponents = analyzeNavigationComponents();
  
  console.log(`✅ Navigation Components:`);
  console.log(`   DevNavigation: ${navComponents.DevNavigation ? 'Found' : 'Not found'}`);
  console.log(`   CommandPalette: ${navComponents.CommandPalette ? 'Found' : 'Not found'}`);
  console.log(`   Total Links: ${navComponents.links.length}\n`);
  
  // Step 3: Check DDD compliance
  console.log('📋 Captain Picard - Checking DDD compliance...\n');
  const dddAnalysis = checkDDDCompliance(routes, navComponents);
  
  if (dddAnalysis.issues.length > 0) {
    console.log(`⚠️  Found ${dddAnalysis.issues.length} issues:\n`);
    dddAnalysis.issues.slice(0, 10).forEach((issue, i) => {
      console.log(`   ${i + 1}. [${issue.type}] ${issue.message}`);
    });
    if (dddAnalysis.issues.length > 10) {
      console.log(`   ... and ${dddAnalysis.issues.length - 10} more\n`);
    } else {
      console.log('');
    }
  } else {
    console.log('✅ No DDD compliance issues found\n');
  }
  
  // Step 4: Generate fixes
  console.log('🔧 Lt. Cmdr. La Forge - Generating fixes...\n');
  const fixes = generateFixes(routes, navComponents, dddAnalysis);
  
  console.log(`✅ Generated ${fixes.length} fixes:\n`);
  fixes.forEach((fix, i) => {
    console.log(`   ${i + 1}. ${fix.issue}`);
    console.log(`      File: ${path.basename(fix.file)}`);
    console.log(`      Fix: ${fix.fix}\n`);
  });
  
  // Save analysis
  const rootDir = process.cwd();
  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, 'dashboard-routing-ddd-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    routes,
    navComponents,
    dddAnalysis,
    fixes
  }, null, 2));
  
  console.log(`📄 Analysis saved to: ${reportPath}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎯 Next Steps:');
  console.log('   1. Review identified issues');
  console.log('   2. Apply fixes to routing and navigation');
  console.log('   3. Verify DDD bounded context alignment');
  console.log('   4. Test all navigation links\n');
  
  return { routes, navComponents, dddAnalysis, fixes };
}

if (require.main === module) {
  fixDashboardRoutingDDD().catch(console.error);
}

module.exports = { fixDashboardRoutingDDD, analyzeAppRouterStructure };



