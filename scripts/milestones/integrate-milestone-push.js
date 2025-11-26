#!/usr/bin/env node

/**
 * 🖖 Milestone Push Integration
 * 
 * Integrates with automated milestone push to:
 * 1. Analyze new milestone content
 * 2. Categorize using RAG crew memory system
 * 3. Create milestone file in proper category
 * 4. Update category README summaries
 * 
 * This runs automatically after each milestone push.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the analysis system
const { analyzeAndSummarizeCategories } = require('./analyze-and-summarize-milestones');
const { organizeMilestonesByCategory } = require('../../organize-milestones-by-category');

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

function categorizeMilestoneContent(content) {
  const contentLower = content.toLowerCase();
  const categoryScores = new Map();
  
  MILESTONE_CATEGORIES.forEach(category => {
    let score = 0;
    category.keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = contentLower.match(regex);
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
}

function extractTimestamp(content, fileName) {
  // Try to extract date from content
  const dateMatch = content.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
  if (dateMatch) {
    return dateMatch[0].replace(/\//g, '-').substring(0, 7); // YYYY-MM
  }
  
  // Try from filename
  const fileNameMatch = fileName.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
  if (fileNameMatch) {
    return fileNameMatch[0].replace(/_/g, '-').substring(0, 7);
  }
  
  // Default to current month
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function processNewMilestone(milestonePath, milestonesOrganizedDir) {
  console.log('🖖 Processing new milestone for organized structure...\n');
  
  if (!fs.existsSync(milestonePath)) {
    console.error(`❌ Milestone file not found: ${milestonePath}`);
    return false;
  }
  
  // Read milestone content
  const content = fs.readFileSync(milestonePath, 'utf-8');
  const fileName = path.basename(milestonePath);
  
  // Categorize
  const category = categorizeMilestoneContent(content);
  const categoryInfo = MILESTONE_CATEGORIES.find(c => c.name === category);
  
  if (!categoryInfo) {
    console.warn(`⚠️  Could not categorize milestone, using 'uncategorized'`);
    return false;
  }
  
  console.log(`📂 Category: ${categoryInfo.displayName}`);
  
  // Extract timestamp
  const timestamp = extractTimestamp(content, fileName);
  console.log(`📅 Timestamp: ${timestamp}`);
  
  // Create target directory structure
  const categoryDir = path.join(milestonesOrganizedDir, category);
  const timestampDir = path.join(categoryDir, timestamp);
  
  if (!fs.existsSync(categoryDir)) {
    fs.mkdirSync(categoryDir, { recursive: true });
  }
  if (!fs.existsSync(timestampDir)) {
    fs.mkdirSync(timestampDir, { recursive: true });
  }
  
  // Create symlink or copy milestone
  const targetPath = path.join(timestampDir, fileName);
  
  try {
    // Try symlink first (preserves original location)
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    fs.symlinkSync(path.resolve(milestonePath), targetPath, 'file');
    console.log(`✅ Created symlink: ${targetPath}`);
  } catch (error) {
    // Fallback to copy
    fs.copyFileSync(milestonePath, targetPath);
    console.log(`✅ Copied milestone: ${targetPath}`);
  }
  
  // Regenerate category summaries
  console.log('\n📄 Updating category summaries...');
  analyzeAndSummarizeCategories(milestonesOrganizedDir);
  
  return true;
}

function findLatestMilestone(milestonesDir) {
  try {
    // Find the most recently modified .md file in milestones directory
    const files = fs.readdirSync(milestonesDir, { withFileTypes: true })
      .filter(dirent => dirent.isFile() && dirent.name.endsWith('.md'))
      .map(dirent => {
        const filePath = path.join(milestonesDir, dirent.name);
        const stats = fs.statSync(filePath);
        return {
          name: dirent.name,
          path: filePath,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime - a.mtime);
    
    return files.length > 0 ? files[0].path : null;
  } catch (error) {
    return null;
  }
}

async function integrateMilestonePush(milestonePath = null) {
  const rootDir = process.cwd();
  const milestonesDir = path.join(rootDir, 'milestones');
  const milestonesOrganizedDir = path.join(rootDir, 'milestones-organized');
  
  // If no milestone path provided, find the latest one
  if (!milestonePath) {
    milestonePath = findLatestMilestone(milestonesDir);
    if (!milestonePath) {
      console.log('ℹ️  No new milestone found to process');
      return;
    }
  }
  
  console.log(`📋 Processing milestone: ${path.basename(milestonePath)}\n`);
  
  // Process the milestone
  const success = processNewMilestone(milestonePath, milestonesOrganizedDir);
  
  if (success) {
    console.log('\n✅ Milestone integration complete!');
    console.log('   The milestone has been categorized and added to milestones-organized/');
    console.log('   Category README summaries have been updated.\n');
  }
}

// Main execution
if (require.main === module) {
  const milestonePath = process.argv[2] || null;
  integrateMilestonePush(milestonePath).catch(console.error);
}

module.exports = { integrateMilestonePush, processNewMilestone };

