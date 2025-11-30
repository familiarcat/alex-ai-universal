#!/usr/bin/env node

/**
 * 🖖 Milestone Organization System
 * 
 * Analyzes milestone .md files and organizes them into timestamp-based structures
 * by category based on their content analysis.
 * 
 * Crew: Commander Data (analysis), Chief O'Brien (pragmatic organization)
 */

const fs = require('fs');
const path = require('path');

const MILESTONE_CATEGORIES = [
  {
    name: 'architecture',
    keywords: ['architecture', 'ddd', 'refactoring', 'structure', 'design', 'bounded context', 'domain'],
    displayName: 'Architecture & DDD'
  },
  {
    name: 'dashboard',
    keywords: ['dashboard', 'ui', 'component', 'theme', 'styling', 'frontend'],
    displayName: 'Dashboard & UI'
  },
  {
    name: 'mcp',
    keywords: ['mcp', 'model context protocol', 'controller', 'server'],
    displayName: 'MCP Integration'
  },
  {
    name: 'n8n',
    keywords: ['n8n', 'workflow', 'webhook', 'automation'],
    displayName: 'N8N Workflows'
  },
  {
    name: 'rag',
    keywords: ['rag', 'knowledge', 'memory', 'vector', 'embedding', 'supabase'],
    displayName: 'RAG & Knowledge'
  },
  {
    name: 'crew',
    keywords: ['crew', 'picard', 'riker', 'data', 'coordination', 'observation lounge'],
    displayName: 'Crew Coordination'
  },
  {
    name: 'deployment',
    keywords: ['deployment', 'deploy', 'production', 'infrastructure', 'ci/cd'],
    displayName: 'Deployment & Infrastructure'
  },
  {
    name: 'testing',
    keywords: ['test', 'testing', 'e2e', 'framework', 'harness'],
    displayName: 'Testing & Quality'
  },
  {
    name: 'security',
    keywords: ['security', 'auth', 'authentication', 'worf', 'compliance'],
    displayName: 'Security & Compliance'
  },
  {
    name: 'optimization',
    keywords: ['optimization', 'performance', 'cost', 'quark', 'efficiency'],
    displayName: 'Optimization & Performance'
  },
  {
    name: 'features',
    keywords: ['feature', 'enhancement', 'new', 'addition', 'capability'],
    displayName: 'New Features'
  },
  {
    name: 'bugfixes',
    keywords: ['fix', 'bug', 'error', 'issue', 'resolve', 'patch'],
    displayName: 'Bug Fixes'
  }
];

function findMilestoneFiles(rootDir) {
  const milestones = [];
  
  function searchDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules and other large dirs
        if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(entry.name)) {
          searchDir(fullPath);
        }
      } else if (entry.isFile() && entry.name.match(/milestone.*\.md$/i)) {
        milestones.push(fullPath);
      }
    }
  }
  
  searchDir(rootDir);
  return milestones;
}

function analyzeMilestoneContent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();
    const fullText = content + ' ' + fileName;
    
    // Extract timestamp from filename or content
    const timestampMatch = filePath.match(/(\d{4}[-_]\d{2}[-_]\d{2})|(\d{4}[-_]\d{2})/);
    const timestamp = timestampMatch ? timestampMatch[0].replace(/_/g, '-') : null;
    
    // Categorize based on keywords
    const categories = [];
    const categoryScores = new Map();
    
    MILESTONE_CATEGORIES.forEach(category => {
      let score = 0;
      category.keywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = fullText.match(regex);
        if (matches) {
          score += matches.length;
        }
      });
      
      if (score > 0) {
        categoryScores.set(category.name, score);
        categories.push({ name: category.name, score });
      }
    });
    
    // Sort by score and get primary category
    categories.sort((a, b) => b.score - a.score);
    const primaryCategory = categories.length > 0 ? categories[0].name : 'uncategorized';
    
    // Extract date from content if not in filename
    let date = timestamp;
    if (!date) {
      const dateMatch = content.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
      if (dateMatch) {
        date = dateMatch[0].replace(/\//g, '-');
      }
    }
    
    // Extract title from first line or filename
    const firstLine = content.split('\n')[0].replace(/^#+\s*/, '').trim();
    const title = firstLine || path.basename(filePath, '.md');
    
    return {
      filePath,
      fileName: path.basename(filePath),
      title,
      timestamp: date || 'unknown',
      primaryCategory,
      allCategories: categories.map(c => c.name),
      categoryScores: Object.fromEntries(categoryScores),
      relativePath: path.relative(process.cwd(), filePath)
    };
  } catch (error) {
    console.error(`Error analyzing ${filePath}:`, error.message);
    return null;
  }
}

function organizeByCategoryAndTimestamp(analyses) {
  const organized = {};
  
  analyses.forEach(analysis => {
    if (!analysis) return;
    
    const category = analysis.primaryCategory;
    if (!organized[category]) {
      organized[category] = {
        category: category,
        displayName: MILESTONE_CATEGORIES.find(c => c.name === category)?.displayName || category,
        milestones: []
      };
    }
    
    organized[category].milestones.push(analysis);
  });
  
  // Sort milestones within each category by timestamp
  Object.keys(organized).forEach(category => {
    organized[category].milestones.sort((a, b) => {
      if (a.timestamp === 'unknown' && b.timestamp === 'unknown') return 0;
      if (a.timestamp === 'unknown') return 1;
      if (b.timestamp === 'unknown') return -1;
      return b.timestamp.localeCompare(a.timestamp); // Newest first
    });
  });
  
  // Sort categories by milestone count (most active first)
  const sortedCategories = Object.values(organized).sort((a, b) => 
    b.milestones.length - a.milestones.length
  );
  
  return sortedCategories;
}

function generateOrganizationReport(organized) {
  const reportPath = path.join(process.cwd(), 'reports/milestone-organization.json');
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    totalMilestones: organized.reduce((sum, cat) => sum + cat.milestones.length, 0),
    categories: organized.map(cat => ({
      category: cat.category,
      displayName: cat.displayName,
      count: cat.milestones.length,
      milestones: cat.milestones.map(m => ({
        fileName: m.fileName,
        title: m.title,
        timestamp: m.timestamp,
        relativePath: m.relativePath,
        categories: m.allCategories
      }))
    })),
    summary: {
      mostActiveCategory: organized[0]?.category || 'none',
      totalCategories: organized.length,
      dateRange: {
        earliest: organized
          .flatMap(cat => cat.milestones)
          .filter(m => m.timestamp !== 'unknown')
          .sort((a, b) => a.timestamp.localeCompare(b.timestamp))[0]?.timestamp || 'unknown',
        latest: organized
          .flatMap(cat => cat.milestones)
          .filter(m => m.timestamp !== 'unknown')
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]?.timestamp || 'unknown'
      }
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  return report;
}

function generateDirectoryStructure(organized, outputDir) {
  const structureDir = path.join(process.cwd(), outputDir || 'milestones-organized');
  
  if (!fs.existsSync(structureDir)) {
    fs.mkdirSync(structureDir, { recursive: true });
  }
  
  organized.forEach(category => {
    const categoryDir = path.join(structureDir, category.category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    // Group by timestamp (year-month)
    const byTimestamp = {};
    category.milestones.forEach(milestone => {
      const timestamp = milestone.timestamp;
      const timeKey = timestamp !== 'unknown' && timestamp.match(/^\d{4}-\d{2}/) 
        ? timestamp.substring(0, 7) // YYYY-MM
        : 'unknown';
      
      if (!byTimestamp[timeKey]) {
        byTimestamp[timeKey] = [];
      }
      byTimestamp[timeKey].push(milestone);
    });
    
    // Create timestamp directories and copy/symlink files
    Object.keys(byTimestamp).forEach(timeKey => {
      const timeDir = path.join(categoryDir, timeKey);
      if (!fs.existsSync(timeDir)) {
        fs.mkdirSync(timeDir, { recursive: true });
      }
      
      byTimestamp[timeKey].forEach(milestone => {
        const targetPath = path.join(timeDir, milestone.fileName);
        const sourcePath = path.resolve(process.cwd(), milestone.relativePath);
        
        // Create symlink (or copy if symlinks not supported)
        try {
          if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
          }
          fs.symlinkSync(sourcePath, targetPath, 'file');
        } catch (error) {
          // Fallback to copy if symlink fails
          fs.copyFileSync(sourcePath, targetPath);
        }
      });
    });
    
    // Create category README
    const readmePath = path.join(categoryDir, 'README.md');
    const readmeContent = `# ${category.displayName} Milestones

**Category:** ${category.category}  
**Total Milestones:** ${category.milestones.length}  
**Last Updated:** ${new Date().toISOString()}

## Milestones by Timestamp

${Object.keys(byTimestamp).sort().reverse().map(timeKey => {
  const milestones = byTimestamp[timeKey];
  // Use proper relative paths for web browser compatibility
  const linkPath = timeKey === 'unknown' ? `./unknown/` : `./${timeKey}/`;
  return `### ${timeKey === 'unknown' ? 'Unknown Date' : timeKey}\n\n${milestones.map(m => {
    // Properly encode filename for web browser compatibility
    // encodeURIComponent handles all special characters (colons, spaces, etc.)
    const safeFileName = encodeURIComponent(m.fileName);
    return `- [${m.title}](${linkPath}${safeFileName})`;
  }).join('\n')}`;
}).join('\n\n')}
`;
    
    fs.writeFileSync(readmePath, readmeContent);
  });
  
  // Create main README
  const mainReadmePath = path.join(structureDir, 'README.md');
  const mainReadmeContent = `# Organized Milestones

**Total Milestones:** ${organized.reduce((sum, cat) => sum + cat.milestones.length, 0)}  
**Categories:** ${organized.length}  
**Organization Date:** ${new Date().toISOString()}

## Categories

${organized.map(cat => {
  // Use proper relative paths for web browser compatibility
  const encodedCategory = encodeURIComponent(cat.category);
  return `- [${cat.displayName}](./${encodedCategory}/) (${cat.milestones.length} milestones)`;
}).join('\n')}

## Structure

Each category is organized by timestamp (YYYY-MM):
\`\`\`
milestones-organized/
├── ${organized.map(cat => `${cat.category}/`).join('\n├── ')}
\`\`\`

Each category contains:
- \`README.md\` - Category overview and milestone links
- \`YYYY-MM/\` - Timestamp-based subdirectories
- \`unknown/\` - Milestones without clear timestamps
`;
  
  fs.writeFileSync(mainReadmePath, mainReadmeContent);
  
  return structureDir;
}

async function main() {
  console.log('🖖 Milestone Organization System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const rootDir = process.cwd();
  console.log('📂 Scanning for milestone files...');
  
  const milestoneFiles = findMilestoneFiles(rootDir);
  console.log(`✅ Found ${milestoneFiles.length} milestone files\n`);
  
  console.log('🤖 Commander Data - Analyzing milestone content...');
  const analyses = milestoneFiles.map(analyzeMilestoneContent).filter(Boolean);
  console.log(`✅ Analyzed ${analyses.length} milestones\n`);
  
  console.log('🛠️  Chief O\'Brien - Organizing by category and timestamp...');
  const organized = organizeByCategoryAndTimestamp(analyses);
  
  console.log('\n📊 Organization Summary:');
  organized.forEach(cat => {
    console.log(`  ${cat.displayName}: ${cat.milestones.length} milestones`);
  });
  
  console.log('\n📄 Generating organization report...');
  const report = generateOrganizationReport(organized);
  console.log(`✅ Report saved to: reports/milestone-organization.json\n`);
  
  console.log('📁 Creating organized directory structure...');
  const structureDir = generateDirectoryStructure(organized);
  console.log(`✅ Organized structure created at: ${structureDir}\n`);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Milestone organization complete!');
  console.log(`   Total: ${report.totalMilestones} milestones`);
  console.log(`   Categories: ${report.totalCategories}`);
  console.log(`   Date Range: ${report.summary.dateRange.earliest} to ${report.summary.dateRange.latest}\n`);
}

main().catch(console.error);

