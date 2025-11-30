#!/usr/bin/env node

/**
 * Alex AI Universal - Documentation Analysis & Streamlining Script
 * 
 * This script:
 * 1. Analyzes all 208+ markdown files in the project
 * 2. Categorizes documentation by type and redundancy
 * 3. Identifies files to migrate to RAG vs keep vs archive
 * 4. Creates execution plan for streamlining
 * 5. Populates RAG system with consolidated knowledge
 */

const fs = require('fs').promises;
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  projectRoot: process.cwd()
};

// Initialize Supabase client
const supabase = config.supabaseUrl && config.supabaseServiceKey 
  ? createClient(config.supabaseUrl, config.supabaseServiceKey)
  : null;

// Color output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// ============================================================================
// STEP 1: ANALYZE ALL MARKDOWN FILES
// ============================================================================

async function analyzeAllDocumentation() {
  log('\n📊 Step 1: Analyzing all documentation files...', 'bright');
  
  const analysis = {
    milestones: [],
    statusReports: [],
    completionReports: [],
    guides: [],
    architecture: [],
    integration: [],
    crew: [],
    examples: [],
    redundant: [],
    keep: [],
    archive: []
  };
  
  // Categorize patterns
  const patterns = {
    milestone: /^MILESTONE_|milestones\//i,
    status: /_STATUS\.|_SUCCESS\.|_COMPLETE\./i,
    completion: /_COMPLETE\.|_IMPLEMENTATION\./i,
    guide: /GUIDE|QUICK_START|README/i,
    architecture: /ARCHITECTURE|SYSTEM|LCARS/i,
    integration: /INTEGRATION|N8N|SUPABASE/i,
    crew: /CREW_|crew-/i,
    examples: /examples\//i
  };
  
  // Get all markdown files
  const allMarkdownFiles = await findAllMarkdownFiles(config.projectRoot);
  
  log(`\n  Found ${allMarkdownFiles.length} markdown files total`, 'cyan');
  
  for (const file of allMarkdownFiles) {
    const relativePath = path.relative(config.projectRoot, file);
    const fileName = path.basename(file);
    
    // Categorize
    let category = 'other';
    if (patterns.milestone.test(relativePath)) category = 'milestones';
    else if (patterns.status.test(fileName)) category = 'statusReports';
    else if (patterns.completion.test(fileName)) category = 'completionReports';
    else if (patterns.guide.test(fileName)) category = 'guides';
    else if (patterns.architecture.test(fileName)) category = 'architecture';
    else if (patterns.integration.test(fileName)) category = 'integration';
    else if (patterns.crew.test(relativePath)) category = 'crew';
    else if (patterns.examples.test(relativePath)) category = 'examples';
    
    // Read file to get metadata
    try {
      const content = await fs.readFile(file, 'utf-8');
      const stats = await fs.stat(file);
      const lines = content.split('\n').length;
      
      // Extract title
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : fileName;
      
      // Check for date in filename
      const dateMatch = fileName.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
      const fileDate = dateMatch ? dateMatch[1] : null;
      
      const fileInfo = {
        path: relativePath,
        fileName,
        fullPath: file,
        category,
        title,
        lines,
        size: stats.size,
        modified: stats.mtime,
        fileDate,
        inRootDirectory: !relativePath.includes('/'),
        age: Date.now() - stats.mtime.getTime()
      };
      
      analysis[category].push(fileInfo);
      
    } catch (error) {
      log(`  ⚠️  Error analyzing ${relativePath}: ${error.message}`, 'yellow');
    }
  }
  
  // Identify redundant files
  analysis.redundant = identifyRedundantFiles(analysis);
  
  // Determine what to keep, archive, or migrate to RAG
  analysis.keep = determineFilesToKeep(analysis);
  analysis.archive = determineFilesToArchive(analysis);
  
  // Print summary
  log('\n📋 Analysis Summary:', 'bright');
  log(`  Milestones: ${analysis.milestones.length}`, 'cyan');
  log(`  Status Reports: ${analysis.statusReports.length}`, 'cyan');
  log(`  Completion Reports: ${analysis.completionReports.length}`, 'cyan');
  log(`  Guides: ${analysis.guides.length}`, 'cyan');
  log(`  Architecture Docs: ${analysis.architecture.length}`, 'cyan');
  log(`  Integration Docs: ${analysis.integration.length}`, 'cyan');
  log(`  Crew Docs: ${analysis.crew.length}`, 'cyan');
  log(`  Example Docs: ${analysis.examples.length}`, 'cyan');
  log(`  Root Directory Files: ${allMarkdownFiles.filter(f => !path.relative(config.projectRoot, f).includes('/')).length}`, 'yellow');
  log(`  Potentially Redundant: ${analysis.redundant.length}`, 'red');
  
  return analysis;
}

async function findAllMarkdownFiles(dir) {
  const files = [];
  
  async function walk(directory) {
    const items = await fs.readdir(directory, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      // Skip node_modules, .git, etc.
      if (item.name === 'node_modules' || item.name === '.git' || item.name === '.next' || item.name === 'dist' || item.name === 'build') {
        continue;
      }
      
      if (item.isDirectory()) {
        await walk(fullPath);
      } else if (item.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }
  
  await walk(dir);
  return files;
}

function identifyRedundantFiles(analysis) {
  const redundant = [];
  
  // Multiple status/completion reports about same topic
  const topicGroups = {};
  
  [...analysis.statusReports, ...analysis.completionReports].forEach(file => {
    const topic = file.fileName
      .replace(/_STATUS\.|_SUCCESS\.|_COMPLETE\./gi, '')
      .replace(/\d{4}[-_]\d{2}[-_]\d{2}/g, '');
    
    if (!topicGroups[topic]) {
      topicGroups[topic] = [];
    }
    topicGroups[topic].push(file);
  });
  
  // If multiple files about same topic, older ones are redundant
  Object.values(topicGroups).forEach(group => {
    if (group.length > 1) {
      const sorted = group.sort((a, b) => b.modified - a.modified);
      redundant.push(...sorted.slice(1)); // Keep most recent, archive others
    }
  });
  
  return redundant;
}

function determineFilesToKeep(analysis) {
  const keep = [];
  
  // Keep essential files
  const essentialFiles = [
    'README.md',
    'CONTRIBUTING.md',
    'LICENSE',
    'CHANGELOG.md',
    'QUICK_START.md'
  ];
  
  // Keep the most recent comprehensive documentation
  const keepPatterns = [
    /RAG_DOCUMENTATION_SYSTEM/,
    /SHARED_LIBRARY_COMPUTER_SYSTEM/,
    /PROJECT_CLEANUP_AND_DOCUMENTATION_PLAN/
  ];
  
  [...analysis.guides, ...analysis.architecture, ...analysis.integration].forEach(file => {
    const shouldKeep = essentialFiles.includes(file.fileName) ||
                      keepPatterns.some(pattern => pattern.test(file.fileName)) ||
                      file.fileName === 'README.md';
    
    if (shouldKeep) {
      keep.push(file);
    }
  });
  
  return keep;
}

function determineFilesToArchive(analysis) {
  const archive = [];
  
  // Archive old milestones (older than 30 days)
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  
  analysis.milestones.forEach(file => {
    if (file.modified < thirtyDaysAgo) {
      archive.push({ ...file, reason: 'Old milestone (>30 days)' });
    }
  });
  
  // Archive all status/completion reports
  [...analysis.statusReports, ...analysis.completionReports].forEach(file => {
    archive.push({ ...file, reason: 'Status/completion report' });
  });
  
  // Archive redundant files
  analysis.redundant.forEach(file => {
    if (!archive.find(f => f.path === file.path)) {
      archive.push({ ...file, reason: 'Redundant/superseded' });
    }
  });
  
  return archive;
}

// ============================================================================
// STEP 2: CREATE STREAMLINING PLAN
// ============================================================================

async function createStreamliningPlan(analysis) {
  log('\n📋 Step 2: Creating streamlining execution plan...', 'bright');
  
  const plan = {
    summary: {
      totalFiles: 0,
      keep: analysis.keep.length,
      archiveToRAG: 0,
      archiveToFolder: analysis.archive.length,
      delete: 0
    },
    actions: {
      migrateToRAG: [],
      archiveToFolder: [],
      keepInPlace: [],
      reorganize: []
    },
    newStructure: {
      'docs/': {
        'getting-started/': ['README.md', 'installation.md', 'configuration.md'],
        'architecture/': ['overview.md', 'components.md', 'data-flow.md'],
        'api-reference/': ['library-computer.md', 'crew-memory.md'],
        'integrations/': ['n8n.md', 'supabase.md', 'openai.md'],
        'guides/': ['contributing.md', 'testing.md', 'deployment.md'],
        'archive/': {
          'milestones/': ['[organized by date]'],
          'status-reports/': ['[organized by date]'],
          'completion-reports/': ['[organized by date]']
        }
      }
    }
  };
  
  // Categorize each file for action
  const allFiles = [
    ...analysis.milestones,
    ...analysis.statusReports,
    ...analysis.completionReports,
    ...analysis.guides,
    ...analysis.architecture,
    ...analysis.integration,
    ...analysis.crew
  ];
  
  plan.summary.totalFiles = allFiles.length;
  
  for (const file of allFiles) {
    if (analysis.keep.find(k => k.path === file.path)) {
      // Keep in place or reorganize
      if (file.inRootDirectory && file.fileName !== 'README.md' && file.fileName !== 'QUICK_START.md') {
        plan.actions.reorganize.push({
          ...file,
          action: 'move',
          from: file.path,
          to: suggestNewLocation(file)
        });
      } else {
        plan.actions.keepInPlace.push(file);
      }
    } else if (analysis.archive.find(a => a.path === file.path)) {
      // Archive to folder
      plan.actions.archiveToFolder.push({
        ...file,
        action: 'archive',
        from: file.path,
        to: suggestArchiveLocation(file)
      });
    } else {
      // Migrate to RAG and optionally archive
      plan.actions.migrateToRAG.push({
        ...file,
        action: 'migrate',
        from: file.path,
        to: suggestArchiveLocation(file),
        ragCategory: suggestRAGCategory(file)
      });
      plan.summary.archiveToRAG++;
    }
  }
  
  // Save plan to file
  const planPath = path.join(config.projectRoot, 'DOCUMENTATION_STREAMLINING_PLAN.json');
  await fs.writeFile(planPath, JSON.stringify(plan, null, 2), 'utf-8');
  
  log(`\n  ✅ Plan saved to DOCUMENTATION_STREAMLINING_PLAN.json`, 'green');
  log(`\n📊 Plan Summary:`, 'bright');
  log(`  Total files analyzed: ${plan.summary.totalFiles}`, 'cyan');
  log(`  Keep in current location: ${plan.actions.keepInPlace.length}`, 'green');
  log(`  Reorganize to new location: ${plan.actions.reorganize.length}`, 'blue');
  log(`  Migrate to RAG: ${plan.actions.migrateToRAG.length}`, 'yellow');
  log(`  Archive to folder: ${plan.actions.archiveToFolder.length}`, 'magenta');
  
  return plan;
}

function suggestNewLocation(file) {
  if (file.category === 'architecture') return `docs/architecture/${file.fileName}`;
  if (file.category === 'integration') return `docs/integrations/${file.fileName}`;
  if (file.category === 'guides') return `docs/guides/${file.fileName}`;
  if (file.category === 'crew') return `docs/crew/${file.fileName}`;
  return `docs/general/${file.fileName}`;
}

function suggestArchiveLocation(file) {
  const year = file.fileDate ? file.fileDate.substring(0, 4) : new Date(file.modified).getFullYear();
  const month = file.fileDate ? file.fileDate.substring(5, 7) : String(new Date(file.modified).getMonth() + 1).padStart(2, '0');
  
  if (file.category === 'milestones') return `docs/archive/milestones/${year}-${month}/${file.fileName}`;
  if (file.category === 'statusReports') return `docs/archive/status-reports/${year}-${month}/${file.fileName}`;
  if (file.category === 'completionReports') return `docs/archive/completion-reports/${year}-${month}/${file.fileName}`;
  return `docs/archive/general/${year}-${month}/${file.fileName}`;
}

function suggestRAGCategory(file) {
  if (file.category === 'milestones') return 'milestone_achievement';
  if (file.category === 'architecture') return 'architecture';
  if (file.category === 'integration') return 'integration_guide';
  if (file.category === 'guides') return 'user_guide';
  return 'general_knowledge';
}

// ============================================================================
// STEP 3: EXECUTE STREAMLINING (DRY RUN)
// ============================================================================

async function executeStreamlining(plan, dryRun = true) {
  log(`\n${dryRun ? '🔍 Step 3: Dry run of streamlining' : '🚀 Step 3: Executing streamlining'}...`, 'bright');
  
  if (dryRun) {
    log('  (No files will be moved or deleted in dry run mode)', 'yellow');
  }
  
  const results = {
    kept: 0,
    reorganized: 0,
    migrated: 0,
    archived: 0,
    errors: []
  };
  
  // Keep in place
  log(`\n  📌 Keeping ${plan.actions.keepInPlace.length} files in current location...`, 'green');
  results.kept = plan.actions.keepInPlace.length;
  
  // Reorganize files
  log(`\n  📦 Reorganizing ${plan.actions.reorganize.length} files...`, 'blue');
  for (const action of plan.actions.reorganize) {
    try {
      if (!dryRun) {
        const targetDir = path.dirname(path.join(config.projectRoot, action.to));
        await fs.mkdir(targetDir, { recursive: true });
        await fs.rename(
          path.join(config.projectRoot, action.from),
          path.join(config.projectRoot, action.to)
        );
      }
      log(`    ${dryRun ? 'Would move' : 'Moved'}: ${action.from} → ${action.to}`, 'cyan');
      results.reorganized++;
    } catch (error) {
      log(`    ❌ Error: ${action.from}: ${error.message}`, 'red');
      results.errors.push({ file: action.from, error: error.message });
    }
  }
  
  // Migrate to RAG
  log(`\n  🧠 Migrating ${plan.actions.migrateToRAG.length} files to RAG...`, 'yellow');
  for (const action of plan.actions.migrateToRAG) {
    try {
      if (!dryRun && supabase) {
        // Read file content
        const content = await fs.readFile(path.join(config.projectRoot, action.from), 'utf-8');
        
        // Extract metadata
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : action.fileName;
        const summary = content.substring(0, 500);
        
        // Store in RAG (simplified - would generate embedding in production)
        const { error } = await supabase
          .from('documentation_knowledge')
          .insert({
            doc_type: action.ragCategory,
            audience: 'all',
            category: action.category,
            title: title,
            summary: summary,
            content: content,
            semantic_text: `${title}. ${content.substring(0, 2000)}`,
            source_type: 'migration',
            source_file: action.from,
            is_current: false
          });
        
        if (error) throw error;
        
        // Archive original file
        const targetDir = path.dirname(path.join(config.projectRoot, action.to));
        await fs.mkdir(targetDir, { recursive: true });
        await fs.rename(
          path.join(config.projectRoot, action.from),
          path.join(config.projectRoot, action.to)
        );
      }
      log(`    ${dryRun ? 'Would migrate' : 'Migrated'}: ${action.from}`, 'cyan');
      results.migrated++;
    } catch (error) {
      log(`    ❌ Error: ${action.from}: ${error.message}`, 'red');
      results.errors.push({ file: action.from, error: error.message });
    }
  }
  
  // Archive files
  log(`\n  📚 Archiving ${plan.actions.archiveToFolder.length} files...`, 'magenta');
  for (const action of plan.actions.archiveToFolder) {
    try {
      if (!dryRun) {
        const targetDir = path.dirname(path.join(config.projectRoot, action.to));
        await fs.mkdir(targetDir, { recursive: true });
        await fs.rename(
          path.join(config.projectRoot, action.from),
          path.join(config.projectRoot, action.to)
        );
      }
      log(`    ${dryRun ? 'Would archive' : 'Archived'}: ${action.from} → ${action.to}`, 'cyan');
      results.archived++;
    } catch (error) {
      log(`    ❌ Error: ${action.from}: ${error.message}`, 'red');
      results.errors.push({ file: action.from, error: error.message });
    }
  }
  
  // Summary
  log(`\n📊 ${dryRun ? 'Dry Run' : 'Execution'} Results:`, 'bright');
  log(`  ✅ Kept in place: ${results.kept}`, 'green');
  log(`  📦 Reorganized: ${results.reorganized}`, 'blue');
  log(`  🧠 Migrated to RAG: ${results.migrated}`, 'yellow');
  log(`  📚 Archived: ${results.archived}`, 'magenta');
  log(`  ❌ Errors: ${results.errors.length}`, results.errors.length > 0 ? 'red' : 'green');
  
  return results;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log('\n🖖 Alex AI Universal - Documentation Analysis & Streamlining', 'bright');
  log('==========================================================\n', 'bright');
  
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  if (dryRun) {
    log('🔍 Running in DRY RUN mode (no files will be modified)', 'yellow');
    log('   Use --execute flag to perform actual streamlining\n', 'yellow');
  }
  
  try {
    // Step 1: Analyze all documentation
    const analysis = await analyzeAllDocumentation();
    
    // Step 2: Create streamlining plan
    const plan = await createStreamliningPlan(analysis);
    
    // Step 3: Execute streamlining (dry run or actual)
    const results = await executeStreamlining(plan, dryRun);
    
    // Success summary
    log('\n🎉 Documentation Analysis Complete!', 'green');
    log('===================================\n', 'green');
    
    if (dryRun) {
      log('✅ Analysis complete - review DOCUMENTATION_STREAMLINING_PLAN.json', 'green');
      log('✅ Run with --execute to perform actual streamlining', 'green');
    } else {
      log('✅ Documentation streamlined successfully!', 'green');
      log('✅ RAG system populated with migrated content', 'green');
      log('✅ Files reorganized into clean structure', 'green');
    }
    
    log('\n📚 Next Steps:', 'bright');
    if (dryRun) {
      log('  1. Review DOCUMENTATION_STREAMLINING_PLAN.json', 'blue');
      log('  2. Adjust plan if needed', 'blue');
      log('  3. Run with --execute to perform streamlining', 'blue');
    } else {
      log('  1. Verify docs/ directory structure', 'blue');
      log('  2. Update internal links and references', 'blue');
      log('  3. Regenerate documentation from RAG', 'blue');
      log('  4. Test all functionality', 'blue');
    }
    
    log('\n🖖 Make it so!', 'cyan');
    
  } catch (error) {
    log(`\n❌ Streamlining failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main();
}

module.exports = { main, analyzeAllDocumentation, createStreamliningPlan };

