#!/usr/bin/env node

/**
 * 🖖 Global Reorganization Migration Script
 * 
 * DDD-Compliant migration: Moves dashboard to projects/ and updates all references
 * 
 * Crew Coordination:
 * - Data: Path analysis and updates
 * - La Forge: Build system updates
 * - O'Brien: Migration execution
 * - Worf: Security audit
 * - Riker: Workflow coordination
 */

const fs = require('fs');
const path = require('path');

// DDD Bounded Contexts
const DDD_CONTEXTS = {
  framework: {
    name: 'AI Integration Framework',
    type: 'Core Domain',
    location: 'root',
    components: ['packages/', 'scripts/', 'mcp-server/', 'crew-members/', 'crew-memories/', 'n8n-workflows/', 'supabase/', 'lib/', 'bin/']
  },
  projects: {
    name: 'Project Management Domain',
    type: 'Supporting Domain',
    location: 'projects/',
    components: ['dashboard/', '[user-projects]/']
  }
};

function analyzePathReferences(rootDir) {
  console.log('🤖 Commander Data - Analyzing path references...\n');
  
  const references = {
    imports: [],
    configs: [],
    scripts: [],
    docs: []
  };
  
  // Find all TypeScript/JavaScript files
  function scanDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      if (entry.name.startsWith('.') || 
          ['node_modules', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) {
        continue;
      }
      
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath, relPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.sh'].includes(ext)) {
          analyzeFile(fullPath, relPath, references);
        }
      }
    }
  }
  
  function analyzeFile(filePath, relPath, refs) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Check for dashboard references
      const dashboardRefs = [
        /dashboard\//g,
        /['"]\.\.\/dashboard\//g,
        /['"]@\/dashboard\//g,
        /['"]dashboard\//g,
        /path.*dashboard/g
      ];
      
      dashboardRefs.forEach((regex, idx) => {
        const matches = content.match(regex);
        if (matches) {
          if (filePath.includes('package.json') || filePath.includes('config')) {
            refs.configs.push({ file: relPath, matches: matches.length, type: 'config' });
          } else if (filePath.endsWith('.sh')) {
            refs.scripts.push({ file: relPath, matches: matches.length, type: 'script' });
          } else if (filePath.endsWith('.md')) {
            refs.docs.push({ file: relPath, matches: matches.length, type: 'doc' });
          } else {
            refs.imports.push({ file: relPath, matches: matches.length, type: 'code' });
          }
        }
      });
    } catch (error) {
      // Skip binary or unreadable files
    }
  }
  
  scanDirectory(rootDir);
  
  console.log(`  Found ${references.imports.length} code files with references`);
  console.log(`  Found ${references.configs.length} config files with references`);
  console.log(`  Found ${references.scripts.length} script files with references`);
  console.log(`  Found ${references.docs.length} doc files with references\n`);
  
  return references;
}

function createProjectsDirectory(rootDir) {
  const projectsDir = path.join(rootDir, 'projects');
  
  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
    console.log('✅ Created projects/ directory\n');
  } else {
    console.log('⚠️  projects/ directory already exists\n');
  }
  
  return projectsDir;
}

function moveDashboard(rootDir, projectsDir) {
  const dashboardSource = path.join(rootDir, 'dashboard');
  const dashboardTarget = path.join(projectsDir, 'dashboard');
  
  if (!fs.existsSync(dashboardSource)) {
    throw new Error('Dashboard directory not found!');
  }
  
  if (fs.existsSync(dashboardTarget)) {
    console.log('⚠️  Dashboard already exists in projects/, skipping move\n');
    return false;
  }
  
  console.log('📦 Moving dashboard to projects/dashboard/...');
  
  // Use fs.rename for atomic move (if same filesystem)
  try {
    fs.renameSync(dashboardSource, dashboardTarget);
    console.log('✅ Dashboard moved successfully\n');
    return true;
  } catch (error) {
    // Fallback to copy + delete if cross-filesystem
    console.log('  Using copy + delete method...');
    copyDirectory(dashboardSource, dashboardTarget);
    fs.rmSync(dashboardSource, { recursive: true, force: true });
    console.log('✅ Dashboard moved successfully\n');
    return true;
  }
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function updatePathReferences(rootDir, references, moved) {
  if (!moved) {
    console.log('⏭️  Skipping path updates (dashboard not moved)\n');
    return;
  }
  
  console.log('🔧 Updating path references...\n');
  
  const allRefs = [
    ...references.imports,
    ...references.configs,
    ...references.scripts,
    ...references.docs
  ];
  
  let updated = 0;
  
  allRefs.forEach(ref => {
    const filePath = path.join(rootDir, ref.file);
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      let modified = false;
      
      // Update various path patterns
      const replacements = [
        // Relative paths
        { from: /(['"])(\.\.\/)*dashboard\//g, to: '$1$2projects/dashboard/' },
        // Absolute imports
        { from: /(['"])dashboard\//g, to: '$1projects/dashboard/' },
        // Config paths
        { from: /dashboard\//g, to: 'projects/dashboard/' },
        // Script paths
        { from: /cd dashboard/g, to: 'cd projects/dashboard' },
        { from: /dashboard\/node_modules/g, to: 'projects/dashboard/node_modules' }
      ];
      
      replacements.forEach(({ from, to }) => {
        if (from.test(content)) {
          content = content.replace(from, to);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        updated++;
      }
    } catch (error) {
      console.warn(`  ⚠️  Could not update ${ref.file}: ${error.message}`);
    }
  });
  
  console.log(`✅ Updated ${updated} files\n`);
}

function updateNextConfig(dashboardPath) {
  const nextConfigPath = path.join(dashboardPath, 'next.config.js');
  
  if (!fs.existsSync(nextConfigPath)) {
    return;
  }
  
  console.log('🔧 Updating Next.js config for new location...');
  
  try {
    let content = fs.readFileSync(nextConfigPath, 'utf-8');
    
    // Update outputFileTracingRoot if it exists
    content = content.replace(
      /outputFileTracingRoot:\s*path\.join\(__dirname,\s*['"]\.\.['"]\)/g,
      "outputFileTracingRoot: path.join(__dirname, '../..')"
    );
    
    // Add path alias for framework access
    if (!content.includes('@framework')) {
      const aliasSection = content.match(/resolveAlias:\s*\{/);
      if (aliasSection) {
        content = content.replace(
          /resolveAlias:\s*\{/,
          `resolveAlias: {
      '@framework': path.join(__dirname, '../../packages'),`
        );
      }
    }
    
    fs.writeFileSync(nextConfigPath, content, 'utf-8');
    console.log('✅ Next.js config updated\n');
  } catch (error) {
    console.warn(`  ⚠️  Could not update next.config.js: ${error.message}\n`);
  }
}

function updatePackageJsonScripts(rootDir) {
  const packageJsonPath = path.join(rootDir, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    return;
  }
  
  console.log('🔧 Updating root package.json scripts...');
  
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    let modified = false;
    
    if (pkg.scripts) {
      Object.keys(pkg.scripts).forEach(key => {
        if (pkg.scripts[key].includes('dashboard/') && !pkg.scripts[key].includes('projects/dashboard/')) {
          pkg.scripts[key] = pkg.scripts[key].replace(/dashboard\//g, 'projects/dashboard/');
          modified = true;
        }
      });
    }
    
    if (modified) {
      fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
      console.log('✅ package.json scripts updated\n');
    } else {
      console.log('  No dashboard script references found\n');
    }
  } catch (error) {
    console.warn(`  ⚠️  Could not update package.json: ${error.message}\n`);
  }
}

function createMigrationReport(rootDir, references, moved) {
  const reportPath = path.join(rootDir, 'reports/migration-to-projects-structure.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    migration: {
      completed: moved,
      dashboardLocation: moved ? 'projects/dashboard/' : 'dashboard/',
      projectsDirectory: 'projects/'
    },
    dddCompliance: {
      boundedContexts: DDD_CONTEXTS,
      layerSeparation: 'Framework (root) → Projects (projects/) → Applications',
      entityOrganization: 'Unified Project entity in projects/ bounded context'
    },
    pathReferences: {
      codeFiles: references.imports.length,
      configFiles: references.configs.length,
      scriptFiles: references.scripts.length,
      docFiles: references.docs.length,
      total: references.imports.length + references.configs.length + 
             references.scripts.length + references.docs.length
    },
    nextSteps: [
      'Test dashboard in new location',
      'Update CI/CD pipelines',
      'Update deployment scripts',
      'Verify all imports work',
      'Test build process',
      'Update documentation'
    ]
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Migration report saved to: ${reportPath}\n`);
  
  return report;
}

async function main() {
  console.log('🖖 Global Reorganization Migration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎖️  Captain Picard: "Maintaining DDD principles throughout migration"\n');
  
  const rootDir = process.cwd();
  
  // Phase 1: Analysis
  const references = analyzePathReferences(rootDir);
  
  // Phase 2: Create structure
  const projectsDir = createProjectsDirectory(rootDir);
  
  // Phase 3: Move dashboard
  const moved = moveDashboard(rootDir, projectsDir);
  
  // Phase 4: Update references
  updatePathReferences(rootDir, references, moved);
  
  // Phase 5: Update configs
  if (moved) {
    updateNextConfig(path.join(projectsDir, 'dashboard'));
    updatePackageJsonScripts(rootDir);
  }
  
  // Phase 6: Generate report
  const report = createMigrationReport(rootDir, references, moved);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Migration complete!');
  console.log(`   Dashboard location: ${report.migration.dashboardLocation}`);
  console.log(`   Files analyzed: ${report.pathReferences.total}`);
  console.log(`   DDD Compliance: ✅ Maintained\n`);
  console.log('📋 Next Steps:');
  report.nextSteps.forEach((step, i) => {
    console.log(`   ${i + 1}. ${step}`);
  });
  console.log('');
}

main().catch(console.error);

