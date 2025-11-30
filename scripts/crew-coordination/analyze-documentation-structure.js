#!/usr/bin/env node

/**
 * 🖖 Documentation Structure Analysis
 * 
 * Crew analyzes the difference between:
 * - docs/ folder (generated/reference documentation)
 * - Other folders with .md files (README, inline docs, etc.)
 * 
 * Crew Coordination:
 * - Data: Analysis and categorization
 * - Picard: Strategic documentation architecture
 * - Riker: Organization and workflow
 * - La Forge: Implementation and tooling
 * - Troi: User experience and accessibility
 */

const fs = require('fs');
const path = require('path');

const CREW_ANALYSIS = {
  data: {
    name: 'Commander Data',
    focus: 'Pattern analysis, categorization, structure optimization'
  },
  picard: {
    name: 'Captain Picard',
    focus: 'Strategic documentation architecture, mission clarity'
  },
  riker: {
    name: 'Commander Riker',
    focus: 'Organization, workflow, execution strategy'
  },
  la_forge: {
    name: 'Lt. Cmdr. La Forge',
    focus: 'Implementation, tooling, automation'
  },
  troi: {
    name: 'Counselor Troi',
    focus: 'User experience, accessibility, clarity'
  }
};

function findAllMarkdownFiles(rootDir, ignoreDirs = ['.git', 'node_modules', '.next', 'dist', 'build']) {
  const markdownFiles = [];
  
  function scanDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relativeFilePath = path.join(relativePath, entry.name);
      
      // Skip ignored directories
      if (entry.isDirectory()) {
        if (!ignoreDirs.includes(entry.name)) {
          // Include .cursor and .vscode for config docs, but skip other hidden dirs
          if (!entry.name.startsWith('.') || entry.name === '.cursor' || entry.name === '.vscode') {
            scanDirectory(fullPath, relativeFilePath);
          }
        }
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          const stats = fs.statSync(fullPath);
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          markdownFiles.push({
            path: fullPath,
            relativePath: relativeFilePath,
            name: entry.name,
            size: stats.size,
            modified: stats.mtime,
            lines: content.split('\n').length,
            content: content.substring(0, 500), // First 500 chars for analysis
            isSymlink: stats.isSymbolicLink ? fs.readlinkSync(fullPath) : null
          });
        } catch (error) {
          // Skip unreadable files
        }
      }
    });
  }
  
  scanDirectory(rootDir);
  return markdownFiles;
}

function categorizeDocumentation(files) {
  const categories = {
    docsFolder: {
      name: 'docs/ Folder',
      description: 'Generated or reference documentation',
      files: [],
      patterns: [],
      shouldBeGenerated: true
    },
    readmeFiles: {
      name: 'README Files',
      description: 'Project/package README files',
      files: [],
      patterns: ['README.md', 'readme.md', 'Readme.md'],
      shouldBeGenerated: false
    },
    inlineDocs: {
      name: 'Inline Documentation',
      description: 'Documentation within code directories',
      files: [],
      patterns: [],
      shouldBeGenerated: false
    },
    milestoneDocs: {
      name: 'Milestone Documentation',
      description: 'Milestone summaries and history',
      files: [],
      patterns: ['milestone', 'milestones-organized'],
      shouldBeGenerated: true
    },
    configDocs: {
      name: 'Configuration Documentation',
      description: 'Config and setup documentation',
      files: [],
      patterns: ['.cursor', '.vscode', 'config'],
      shouldBeGenerated: false
    },
    apiDocs: {
      name: 'API Documentation',
      description: 'API reference and guides',
      files: [],
      patterns: ['api', 'reference'],
      shouldBeGenerated: true
    },
    guides: {
      name: 'Guides',
      description: 'How-to guides and tutorials',
      files: [],
      patterns: ['guide', 'tutorial', 'how-to'],
      shouldBeGenerated: false
    },
    architecture: {
      name: 'Architecture Documentation',
      description: 'System architecture and design docs',
      files: [],
      patterns: ['architecture', 'design', 'ddd'],
      shouldBeGenerated: false
    }
  };
  
  files.forEach(file => {
    const relativePath = file.relativePath.toLowerCase();
    const fileName = file.name.toLowerCase();
    const dirPath = path.dirname(file.relativePath).toLowerCase();
    
    // Check if in docs folder
    if (relativePath.startsWith('docs/')) {
      categories.docsFolder.files.push(file);
      
      // Further categorize docs folder content
      if (relativePath.includes('api') || relativePath.includes('reference')) {
        categories.apiDocs.files.push(file);
      } else if (relativePath.includes('guide') || relativePath.includes('tutorial')) {
        categories.guides.files.push(file);
      } else if (relativePath.includes('architecture') || relativePath.includes('design') || relativePath.includes('ddd')) {
        categories.architecture.files.push(file);
      }
    }
    // README files
    else if (fileName === 'readme.md' || fileName === 'readme.md') {
      categories.readmeFiles.files.push(file);
    }
    // Milestone documentation
    else if (relativePath.includes('milestone') || dirPath.includes('milestones')) {
      categories.milestoneDocs.files.push(file);
    }
    // Configuration documentation
    else if (relativePath.includes('.cursor') || relativePath.includes('.vscode') || relativePath.includes('config')) {
      categories.configDocs.files.push(file);
    }
    // Inline documentation (everything else)
    else {
      categories.inlineDocs.files.push(file);
    }
  });
  
  return categories;
}

function analyzeGenerationPatterns(categories) {
  const analysis = {
    generated: {
      criteria: [],
      examples: [],
      patterns: []
    },
    manual: {
      criteria: [],
      examples: [],
      patterns: []
    },
    recommendations: []
  };
  
  // Analyze docs folder
  const docsFiles = categories.docsFolder.files;
  const generatedPatterns = [];
  const manualPatterns = [];
  
  docsFiles.forEach(file => {
    const content = file.content.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Check for generation indicators
    const hasGenerationMarkers = 
      content.includes('generated') ||
      content.includes('auto-generated') ||
      content.includes('do not edit') ||
      content.includes('this file is automatically') ||
      fileName.includes('generated') ||
      fileName.includes('auto');
    
    // Check for reference/system documentation
    const isReferenceDoc =
      content.includes('reference') ||
      content.includes('api') ||
      content.includes('system') ||
      fileName.includes('reference') ||
      fileName.includes('api') ||
      fileName.includes('system');
    
    if (hasGenerationMarkers || isReferenceDoc) {
      generatedPatterns.push({
        file: file.relativePath,
        reason: hasGenerationMarkers ? 'Generation markers' : 'Reference documentation',
        shouldBeGenerated: true
      });
    } else {
      manualPatterns.push({
        file: file.relativePath,
        reason: 'Manual documentation',
        shouldBeGenerated: false
      });
    }
  });
  
  analysis.generated.patterns = generatedPatterns;
  analysis.manual.patterns = manualPatterns;
  
  // Generate recommendations
  analysis.recommendations = [
    {
      type: 'docs_folder',
      recommendation: 'docs/ folder should contain:',
      items: [
        'Generated API documentation',
        'System reference documentation',
        'Auto-generated summaries and reports',
        'Architecture diagrams and system overviews',
        'Integration guides and reference materials'
      ]
    },
    {
      type: 'readme_files',
      recommendation: 'README.md files should:',
      items: [
        'Be manually maintained',
        'Provide project/package overview',
        'Include setup and usage instructions',
        'Link to detailed docs in docs/ folder',
        'Be concise and user-focused'
      ]
    },
    {
      type: 'inline_docs',
      recommendation: 'Inline documentation should:',
      items: [
        'Be manually maintained',
        'Live alongside code',
        'Explain local context and decisions',
        'Reference docs/ for comprehensive guides',
        'Be updated with code changes'
      ]
    },
    {
      type: 'generation',
      recommendation: 'Should be generated:',
      items: [
        'API reference documentation',
        'System summaries and reports',
        'Milestone category summaries',
        'RAG integration reports',
        'Crew coordination summaries',
        'Architecture diagrams (from code)'
      ]
    }
  ];
  
  return analysis;
}

function generateDocumentationGuidelines(categories, analysis) {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: Object.values(categories).reduce((sum, cat) => sum + cat.files.length, 0),
      byCategory: Object.entries(categories).map(([key, cat]) => ({
        category: cat.name,
        count: cat.files.length,
        shouldBeGenerated: cat.shouldBeGenerated
      }))
    },
    guidelines: {
      docsFolder: {
        purpose: 'Centralized reference and generated documentation',
        shouldContain: [
          'Generated API documentation',
          'System reference guides',
          'Auto-generated summaries',
          'Architecture overviews',
          'Integration documentation'
        ],
        shouldNotContain: [
          'Project-specific README files',
          'Package-level documentation (use package README)',
          'Inline code documentation',
          'Temporary or draft documentation'
        ],
        generationRules: [
          'API docs: Generate from code annotations',
          'Summaries: Generate from milestone/crew analysis',
          'Reports: Generate from system analysis',
          'Reference: Generate from code structure'
        ]
      },
      readmeFiles: {
        purpose: 'Project/package entry points',
        shouldContain: [
          'Quick start guide',
          'Overview and purpose',
          'Basic usage examples',
          'Links to detailed docs',
          'Installation instructions'
        ],
        shouldNotContain: [
          'Detailed API reference (link to docs/)',
          'Comprehensive guides (link to docs/)',
          'Generated content',
          'System internals'
        ],
        maintenance: 'Manual - updated with project changes'
      },
      inlineDocs: {
        purpose: 'Context-specific documentation',
        shouldContain: [
          'Local decisions and rationale',
          'Implementation details',
          'Usage examples for specific components',
          'Troubleshooting for local issues'
        ],
        shouldNotContain: [
          'Duplicate of docs/ content',
          'Generated content',
          'System-wide reference'
        ],
        maintenance: 'Manual - updated with code'
      }
    },
    analysis,
    recommendations: analysis.recommendations
  };
}

async function analyzeDocumentationStructure() {
  console.log('🖖 Documentation Structure Analysis\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('👥 Crew Organization:\n');
  Object.values(CREW_ANALYSIS).forEach(member => {
    console.log(`   ${member.name}: ${member.focus}\n`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const rootDir = process.cwd();
  
  console.log('🤖 Commander Data - Scanning markdown files...\n');
  const allMarkdownFiles = findAllMarkdownFiles(rootDir);
  console.log(`✅ Found ${allMarkdownFiles.length} markdown files\n`);
  
  console.log('📊 Captain Picard - Categorizing documentation...\n');
  const categories = categorizeDocumentation(allMarkdownFiles);
  
  console.log('📋 Documentation Categories:\n');
  Object.entries(categories).forEach(([key, category]) => {
    console.log(`   ${category.name}:`);
    console.log(`     Files: ${category.files.length}`);
    console.log(`     Description: ${category.description}`);
    console.log(`     Should be generated: ${category.shouldBeGenerated ? 'Yes' : 'No'}\n`);
  });
  
  console.log('🔍 Commander Data - Analyzing generation patterns...\n');
  const analysis = analyzeGenerationPatterns(categories);
  
  console.log(`   Generated patterns: ${analysis.generated.patterns.length}`);
  console.log(`   Manual patterns: ${analysis.manual.patterns.length}\n`);
  
  console.log('📝 Generating documentation guidelines...\n');
  const guidelines = generateDocumentationGuidelines(categories, analysis);
  
  // Save analysis
  const reportsDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  
  const reportPath = path.join(reportsDir, 'documentation-structure-analysis.json');
  fs.writeFileSync(reportPath, JSON.stringify(guidelines, null, 2));
  console.log(`✅ Analysis saved to: ${reportPath}\n`);
  
  // Generate markdown report
  const markdownReport = generateMarkdownReport(guidelines, categories);
  const markdownPath = path.join(reportsDir, 'documentation-structure-analysis.md');
  fs.writeFileSync(markdownPath, markdownReport);
  console.log(`✅ Markdown report saved to: ${markdownPath}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('💡 Key Recommendations:\n');
  analysis.recommendations.forEach((rec, i) => {
    console.log(`   ${i + 1}. ${rec.recommendation}`);
    rec.items.forEach(item => console.log(`      - ${item}`));
    console.log('');
  });
  
  return guidelines;
}

function generateMarkdownReport(guidelines, categories) {
  return `# 🖖 Documentation Structure Analysis

**Date:** ${new Date().toISOString().split('T')[0]}  
**Analysis by:** Crew Coordination (Data, Picard, Riker, La Forge, Troi)

---

## 📊 Summary

- **Total Markdown Files:** ${guidelines.summary.totalFiles}
- **Categories Analyzed:** ${Object.keys(categories).length}

### By Category

${guidelines.summary.byCategory.map(cat => `- **${cat.category}**: ${cat.count} files (${cat.shouldBeGenerated ? 'Generated' : 'Manual'})`).join('\n')}

---

## 📋 Guidelines

### docs/ Folder

**Purpose:** Centralized reference and generated documentation

**Should Contain:**
${guidelines.guidelines.docsFolder.shouldContain.map(item => `- ${item}`).join('\n')}

**Should NOT Contain:**
${guidelines.guidelines.docsFolder.shouldNotContain.map(item => `- ${item}`).join('\n')}

**Generation Rules:**
${guidelines.guidelines.docsFolder.generationRules.map(rule => `- ${rule}`).join('\n')}

### README Files

**Purpose:** Project/package entry points

**Should Contain:**
${guidelines.guidelines.readmeFiles.shouldContain.map(item => `- ${item}`).join('\n')}

**Should NOT Contain:**
${guidelines.guidelines.readmeFiles.shouldNotContain.map(item => `- ${item}`).join('\n')}

**Maintenance:** ${guidelines.guidelines.readmeFiles.maintenance}

### Inline Documentation

**Purpose:** Context-specific documentation

**Should Contain:**
${guidelines.guidelines.inlineDocs.shouldContain.map(item => `- ${item}`).join('\n')}

**Should NOT Contain:**
${guidelines.guidelines.inlineDocs.shouldNotContain.map(item => `- ${item}`).join('\n')}

**Maintenance:** ${guidelines.guidelines.inlineDocs.maintenance}

---

## 💡 Recommendations

${guidelines.recommendations.map((rec, i) => `### ${i + 1}. ${rec.recommendation}

${rec.items.map(item => `- ${item}`).join('\n')}`).join('\n\n')}

---

## 🔍 Analysis Details

### Generated Documentation Patterns

Found ${guidelines.analysis.generated.patterns.length} files that should be generated:

${guidelines.analysis.generated.patterns.slice(0, 10).map(p => `- \`${p.file}\` - ${p.reason}`).join('\n')}
${guidelines.analysis.generated.patterns.length > 10 ? `\n... and ${guidelines.analysis.generated.patterns.length - 10} more` : ''}

### Manual Documentation Patterns

Found ${guidelines.analysis.manual.patterns.length} files that should be manually maintained:

${guidelines.analysis.manual.patterns.slice(0, 10).map(p => `- \`${p.file}\` - ${p.reason}`).join('\n')}
${guidelines.analysis.manual.patterns.length > 10 ? `\n... and ${guidelines.analysis.manual.patterns.length - 10} more` : ''}

---

**Status:** ✅ Analysis Complete  
**Next:** Review recommendations and implement documentation organization system
`;
}

if (require.main === module) {
  analyzeDocumentationStructure().catch(console.error);
}

module.exports = { analyzeDocumentationStructure, categorizeDocumentation };

