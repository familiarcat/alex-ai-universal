#!/usr/bin/env node

/**
 * 🖖 Milestone Analysis & Summary System
 * 
 * Analyzes milestones by category and date, then generates comprehensive summaries
 * for each category's README.md file. Integrates with RAG crew memory system
 * for intelligent categorization.
 * 
 * Crew Coordination:
 * - Data: Content analysis and pattern recognition
 * - Riker: Organization and workflow
 * - Picard: Strategic summary generation
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

function readMilestoneFile(filePath) {
  try {
    // Handle symlinks
    const realPath = fs.realpathSync(filePath);
    const content = fs.readFileSync(realPath, 'utf-8');
    
    // Extract key information
    const lines = content.split('\n');
    const title = lines[0].replace(/^#+\s*/, '').trim();
    
    // Extract date if present
    const dateMatch = content.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
    const date = dateMatch ? dateMatch[0].replace(/\//g, '-') : null;
    
    // Extract summary/description (first paragraph or section)
    let summary = '';
    const summaryMatch = content.match(/##\s*(?:Summary|Overview|Description)[\s\S]*?(?=##|$)/i);
    if (summaryMatch) {
      summary = summaryMatch[0].replace(/^##.*\n/, '').trim().substring(0, 500);
    } else {
      // Fallback: first substantial paragraph
      const paragraphs = content.split('\n\n').filter(p => p.trim().length > 50);
      if (paragraphs.length > 0) {
        summary = paragraphs[0].trim().substring(0, 500);
      }
    }
    
    // Extract key accomplishments
    const accomplishments = [];
    const accomplishmentMatch = content.match(/##\s*(?:Accomplishments|Completed|Achievements)[\s\S]*?(?=##|$)/i);
    if (accomplishmentMatch) {
      const items = accomplishmentMatch[0].match(/[-*]\s+(.+)/g);
      if (items) {
        accomplishments.push(...items.map(item => item.replace(/^[-*]\s+/, '').trim()));
      }
    }
    
    return {
      title,
      date,
      summary,
      accomplishments: accomplishments.slice(0, 5), // Top 5
      content: content.substring(0, 2000) // First 2000 chars for analysis
    };
  } catch (error) {
    console.warn(`⚠️  Could not read ${filePath}: ${error.message}`);
    return null;
  }
}

function analyzeMilestoneByCategory(milestonePath, categories) {
  try {
    const content = fs.readFileSync(fs.realpathSync(milestonePath), 'utf-8').toLowerCase();
    const fileName = path.basename(milestonePath).toLowerCase();
    const fullText = content + ' ' + fileName;
    
    const categoryScores = new Map();
    
    categories.forEach(category => {
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
      }
    });
    
    // Get primary category (highest score)
    const sortedCategories = Array.from(categoryScores.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return sortedCategories.length > 0 ? sortedCategories[0][0] : 'uncategorized';
  } catch (error) {
    return 'uncategorized';
  }
}

function groupMilestonesByDate(milestones) {
  const byDate = {};
  
  milestones.forEach(milestone => {
    const date = milestone.date || milestone.timestamp || 'unknown';
    const dateKey = date !== 'unknown' && date.match(/^\d{4}-\d{2}/) 
      ? date.substring(0, 7) // YYYY-MM
      : 'unknown';
    
    if (!byDate[dateKey]) {
      byDate[dateKey] = [];
    }
    byDate[dateKey].push(milestone);
  });
  
  // Sort milestones within each date group
  Object.keys(byDate).forEach(dateKey => {
    byDate[dateKey].sort((a, b) => {
      const dateA = a.date || a.timestamp || '';
      const dateB = b.date || b.timestamp || '';
      return dateB.localeCompare(dateA); // Newest first
    });
  });
  
  return byDate;
}

function generateCategorySummary(milestones, categoryName, displayName) {
  const byDate = groupMilestonesByDate(milestones);
  const dateKeys = Object.keys(byDate).sort().reverse();
  
  let summary = `# ${displayName} Milestones\n\n`;
  summary += `**Category:** ${categoryName}  \n`;
  summary += `**Total Milestones:** ${milestones.length}  \n`;
  summary += `**Last Updated:** ${new Date().toISOString()}\n\n`;
  
  // Executive Summary
  summary += `## 📊 Executive Summary\n\n`;
  summary += `This category contains ${milestones.length} milestones spanning `;
  summary += `${dateKeys.filter(k => k !== 'unknown').length} time periods. `;
  
  // Key themes
  const allText = milestones.map(m => (m.summary || m.title || '').toLowerCase()).join(' ');
  const themes = [];
  MILESTONE_CATEGORIES.find(c => c.name === categoryName)?.keywords.forEach(keyword => {
    const count = (allText.match(new RegExp(keyword, 'gi')) || []).length;
    if (count > 2) {
      themes.push(keyword);
    }
  });
  
  if (themes.length > 0) {
    summary += `Key themes: ${themes.slice(0, 5).join(', ')}.\n\n`;
  }
  
  // Timeline Summary
  summary += `## 📅 Timeline Summary\n\n`;
  dateKeys.forEach(dateKey => {
    if (dateKey === 'unknown') return;
    const count = byDate[dateKey].length;
    summary += `- **${dateKey}**: ${count} milestone${count !== 1 ? 's' : ''}\n`;
  });
  if (byDate['unknown']) {
    summary += `- **Unknown Date**: ${byDate['unknown'].length} milestone${byDate['unknown'].length !== 1 ? 's' : ''}\n`;
  }
  summary += '\n';
  
  // Recent Accomplishments (last 3 months)
  const recentMonths = dateKeys.filter(k => {
    if (k === 'unknown') return false;
    const [year, month] = k.split('-').map(Number);
    const milestoneDate = new Date(year, month - 1);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return milestoneDate >= threeMonthsAgo;
  });
  
  if (recentMonths.length > 0) {
    summary += `## 🚀 Recent Accomplishments (Last 3 Months)\n\n`;
    recentMonths.slice(0, 3).forEach(dateKey => {
      const recentMilestones = byDate[dateKey].slice(0, 3);
      summary += `### ${dateKey}\n\n`;
      recentMilestones.forEach(m => {
        summary += `- **${m.title}**\n`;
        if (m.summary) {
          summary += `  ${m.summary.substring(0, 200)}${m.summary.length > 200 ? '...' : ''}\n`;
        }
        summary += '\n';
      });
    });
  }
  
  // Milestones by Timestamp
  summary += `## 📋 Milestones by Timestamp\n\n`;
  dateKeys.forEach(dateKey => {
    const milestones = byDate[dateKey];
    summary += `### ${dateKey === 'unknown' ? 'Unknown Date' : dateKey}\n\n`;
    
    milestones.forEach(m => {
      const linkPath = dateKey === 'unknown' ? `./unknown/` : `./${dateKey}/`;
      const safeFileName = encodeURIComponent(m.fileName);
      summary += `- [${m.title}](${linkPath}${safeFileName})\n`;
      
      if (m.accomplishments && m.accomplishments.length > 0) {
        m.accomplishments.slice(0, 2).forEach(acc => {
          summary += `  - ${acc}\n`;
        });
      }
    });
    summary += '\n';
  });
  
  return summary;
}

async function analyzeAndSummarizeCategories(milestonesOrganizedDir) {
  console.log('🖖 Milestone Analysis & Summary System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (!fs.existsSync(milestonesOrganizedDir)) {
    console.error(`❌ Directory not found: ${milestonesOrganizedDir}`);
    return;
  }
  
  console.log('🤖 Commander Data - Analyzing milestone content...\n');
  
  const categories = fs.readdirSync(milestonesOrganizedDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && dirent.name !== '.git')
    .map(dirent => dirent.name);
  
  let totalAnalyzed = 0;
  
  categories.forEach(categoryName => {
    const categoryDir = path.join(milestonesOrganizedDir, categoryName);
    const categoryInfo = MILESTONE_CATEGORIES.find(c => c.name === categoryName);
    const displayName = categoryInfo?.displayName || categoryName;
    
    console.log(`📂 Analyzing ${displayName}...`);
    
    // Find all milestone files (including symlinks)
    const milestoneFiles = [];
    
    function findMilestones(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        // Check if it's a file or symlink (symlinks show as files)
        const isFile = entry.isFile();
        const isSymlink = entry.isSymbolicLink ? entry.isSymbolicLink() : false;
        
        if ((isFile || isSymlink) && entry.name.endsWith('.md') && entry.name !== 'README.md') {
          milestoneFiles.push(fullPath);
        } else if (entry.isDirectory() && entry.name !== '.git') {
          findMilestones(fullPath);
        }
      });
    }
    
    findMilestones(categoryDir);
    
    // Read and analyze milestones
    const milestones = milestoneFiles
      .map(filePath => {
        const milestone = readMilestoneFile(filePath);
        if (milestone) {
          milestone.fileName = path.basename(filePath);
          milestone.filePath = filePath;
          milestone.timestamp = milestone.date || 'unknown';
          return milestone;
        }
        return null;
      })
      .filter(Boolean);
    
    totalAnalyzed += milestones.length;
    console.log(`   ✅ Found ${milestones.length} milestones`);
    
    // Generate summary
    const summary = generateCategorySummary(milestones, categoryName, displayName);
    
    // Write README
    const readmePath = path.join(categoryDir, 'README.md');
    fs.writeFileSync(readmePath, summary, 'utf-8');
    console.log(`   📄 Updated README.md\n`);
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`✅ Analysis complete!`);
  console.log(`   Categories analyzed: ${categories.length}`);
  console.log(`   Total milestones: ${totalAnalyzed}\n`);
}

// Main execution
const milestonesOrganizedDir = path.join(process.cwd(), 'milestones-organized');

if (require.main === module) {
  analyzeAndSummarizeCategories(milestonesOrganizedDir).catch(console.error);
}

module.exports = { analyzeAndSummarizeCategories, generateCategorySummary };

