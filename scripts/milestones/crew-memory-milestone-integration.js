#!/usr/bin/env node

/**
 * 🖖 Crew Memory & Milestone Integration System
 * 
 * Analyzes crew member memories and compares them to milestone content,
 * then optimizes RAG vector storage for efficient crew access.
 * 
 * E2E Integration:
 * - Next.js (view layer) → Controller (n8n/MCP) → Supabase (vector storage)
 * - Optimizes content from milestone pushes
 * - Associates vector records with RAG structure
 * - Makes crew member access efficient
 * 
 * Crew: Data (analysis), Riker (coordination), Picard (strategic)
 */

const fs = require('fs');
const path = require('path');

const CREW_MEMBERS = [
  { id: 'picard', name: 'Captain Picard', expertise: ['strategic', 'leadership', 'mission', 'architecture'] },
  { id: 'riker', name: 'Commander Riker', expertise: ['tactical', 'coordination', 'workflow', 'organization'] },
  { id: 'data', name: 'Commander Data', expertise: ['technical', 'analysis', 'optimization', 'patterns'] },
  { id: 'la_forge', name: 'Lt. Cmdr. La Forge', expertise: ['infrastructure', 'engineering', 'monitoring', 'systems'] },
  { id: 'worf', name: 'Lieutenant Worf', expertise: ['security', 'compliance', 'threat', 'defense'] },
  { id: 'troi', name: 'Counselor Troi', expertise: ['ux', 'user', 'psychology', 'experience'] },
  { id: 'crusher', name: 'Dr. Crusher', expertise: ['health', 'diagnosis', 'medical', 'system'] },
  { id: 'uhura', name: 'Lieutenant Uhura', expertise: ['communication', 'network', 'transmission', 'integration'] },
  { id: 'quark', name: 'Quark', expertise: ['business', 'cost', 'optimization', 'efficiency'] },
  { id: 'obrien', name: 'Chief O\'Brien', expertise: ['pragmatic', 'troubleshooting', 'operations', 'practical'] }
];

function loadCrewMemories(crewMemoriesDir) {
  const memories = new Map();
  
  if (!fs.existsSync(crewMemoriesDir)) {
    return memories;
  }
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        try {
          const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
          const crewMember = content.crew_member || content.crewMember || extractCrewMemberFromPath(fullPath);
          
          if (!memories.has(crewMember)) {
            memories.set(crewMember, []);
          }
          
          memories.get(crewMember).push({
            ...content,
            filePath: fullPath,
            timestamp: content.timestamp || content.created_at || new Date().toISOString()
          });
        } catch (error) {
          // Skip invalid JSON
        }
      }
    });
  }
  
  scanDirectory(crewMemoriesDir);
  
  // Sort memories by timestamp (newest first)
  memories.forEach((memList, crewMember) => {
    memList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  });
  
  return memories;
}

function extractCrewMemberFromPath(filePath) {
  const pathParts = filePath.split(path.sep);
  for (const part of pathParts) {
    const crewMember = CREW_MEMBERS.find(c => part.includes(c.id));
    if (crewMember) return crewMember.id;
  }
  return 'unknown';
}

function loadMilestones(milestonesOrganizedDir) {
  const milestones = [];
  
  if (!fs.existsSync(milestonesOrganizedDir)) {
    return milestones;
  }
  
  function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory() && entry.name !== '.git') {
        scanDirectory(fullPath);
      } else if ((entry.isFile() || entry.isSymbolicLink) && 
                 entry.name.endsWith('.md') && entry.name !== 'README.md') {
        try {
          const realPath = fs.realpathSync(fullPath);
          const content = fs.readFileSync(realPath, 'utf-8');
          
          // Extract category from path
          const pathParts = fullPath.split(path.sep);
          const categoryIndex = pathParts.indexOf('milestones-organized');
          const category = categoryIndex >= 0 && pathParts[categoryIndex + 1] 
            ? pathParts[categoryIndex + 1] 
            : 'unknown';
          
          // Extract timestamp
          const timestampMatch = content.match(/(\d{4}[-/]\d{2}[-/]\d{2})/);
          const timestamp = timestampMatch ? timestampMatch[0].replace(/\//g, '-') : null;
          
          milestones.push({
            fileName: entry.name,
            filePath: fullPath,
            category,
            timestamp,
            content: content.substring(0, 5000), // First 5000 chars for analysis
            title: content.split('\n')[0].replace(/^#+\s*/, '').trim()
          });
        } catch (error) {
          // Skip unreadable files
        }
      }
    });
  }
  
  scanDirectory(milestonesOrganizedDir);
  
  return milestones;
}

function analyzeCrewMemoryRelevance(memory, milestones) {
  const memoryText = JSON.stringify(memory).toLowerCase();
  const memoryContent = (memory.summary || memory.content || memory.detailed_analysis || '').toLowerCase();
  const fullText = memoryText + ' ' + memoryContent;
  
  const relevantMilestones = [];
  
  milestones.forEach(milestone => {
    const milestoneText = milestone.content.toLowerCase();
    const milestoneTitle = milestone.title.toLowerCase();
    
    // Calculate relevance score
    let score = 0;
    
    // Keyword matching
    const keywords = extractKeywords(fullText);
    keywords.forEach(keyword => {
      if (keyword.length > 4) {
        const regex = new RegExp(keyword, 'gi');
        const matches = (milestoneText + ' ' + milestoneTitle).match(regex);
        if (matches) {
          score += matches.length;
        }
      }
    });
    
    // Category matching
    if (memory.tags && Array.isArray(memory.tags)) {
      memory.tags.forEach(tag => {
        if (milestone.category === tag || milestoneText.includes(tag)) {
          score += 5;
        }
      });
    }
    
    // Date proximity (if both have timestamps)
    if (memory.timestamp && milestone.timestamp) {
      const memoryDate = new Date(memory.timestamp);
      const milestoneDate = new Date(milestone.timestamp);
      const daysDiff = Math.abs((memoryDate - milestoneDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) score += 10; // Same week
      else if (daysDiff < 30) score += 5; // Same month
    }
    
    if (score > 0) {
      relevantMilestones.push({
        milestone,
        score,
        relevance: score > 20 ? 'high' : score > 10 ? 'medium' : 'low'
      });
    }
  });
  
  // Sort by relevance
  relevantMilestones.sort((a, b) => b.score - a.score);
  
  return relevantMilestones.slice(0, 5); // Top 5 most relevant
}

function extractKeywords(text) {
  const words = text.toLowerCase().split(/\W+/);
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those']);
  const wordCount = new Map();
  
  words.forEach(word => {
    if (word.length > 3 && !stopWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    }
  });
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function generateCrewMemorySummary(crewMemories, milestones) {
  const summaries = new Map();
  
  CREW_MEMBERS.forEach(crewMember => {
    const memories = crewMemories.get(crewMember.id) || [];
    
    if (memories.length === 0) {
      summaries.set(crewMember.id, {
        crewMember,
        totalMemories: 0,
        relevantMilestones: [],
        summary: `No memories found for ${crewMember.name}`
      });
      return;
    }
    
    // Analyze each memory against milestones
    const allRelevantMilestones = new Map();
    
    memories.forEach(memory => {
      const relevant = analyzeCrewMemoryRelevance(memory, milestones);
      relevant.forEach(({ milestone, score, relevance }) => {
        if (!allRelevantMilestones.has(milestone.fileName)) {
          allRelevantMilestones.set(milestone.fileName, {
            milestone,
            maxScore: score,
            relevance,
            memoryCount: 1
          });
        } else {
          const existing = allRelevantMilestones.get(milestone.fileName);
          existing.maxScore = Math.max(existing.maxScore, score);
          existing.memoryCount++;
        }
      });
    });
    
    const sortedMilestones = Array.from(allRelevantMilestones.values())
      .sort((a, b) => b.maxScore - a.maxScore)
      .slice(0, 10);
    
    // Generate summary
    const recentMemories = memories.slice(0, 5);
    const expertise = crewMember.expertise.join(', ');
    
    summaries.set(crewMember.id, {
      crewMember,
      totalMemories: memories.length,
      recentMemories: recentMemories.map(m => ({
        title: m.title || 'Untitled Memory',
        timestamp: m.timestamp,
        summary: (m.summary || m.content || '').substring(0, 200)
      })),
      relevantMilestones: sortedMilestones,
      expertise,
      summary: `${crewMember.name} has ${memories.length} memories. ` +
               `Most relevant to ${sortedMilestones.length} milestones. ` +
               `Expertise areas: ${expertise}.`
    });
  });
  
  return summaries;
}

function generateRAGOptimizationReport(summaries, milestones) {
  const report = {
    timestamp: new Date().toISOString(),
    crewSummaries: Array.from(summaries.values()).map(s => ({
      crewMember: s.crewMember.name,
      crewMemberId: s.crewMember.id,
      totalMemories: s.totalMemories,
      relevantMilestones: s.relevantMilestones.map(rm => ({
        milestone: rm.milestone.title,
        category: rm.milestone.category,
        relevance: rm.relevance,
        score: rm.maxScore,
        memoryCount: rm.memoryCount
      })),
      expertise: s.expertise,
      summary: s.summary
    })),
    optimization: {
      totalMilestones: milestones.length,
      totalCrewMemories: Array.from(summaries.values()).reduce((sum, s) => sum + s.totalMemories, 0),
      averageRelevance: calculateAverageRelevance(summaries),
      recommendations: generateOptimizationRecommendations(summaries, milestones)
    }
  };
  
  return report;
}

function calculateAverageRelevance(summaries) {
  let totalScore = 0;
  let totalCount = 0;
  
  summaries.forEach(summary => {
    summary.relevantMilestones.forEach(rm => {
      totalScore += rm.maxScore;
      totalCount++;
    });
  });
  
  return totalCount > 0 ? Math.round(totalScore / totalCount) : 0;
}

function generateOptimizationRecommendations(summaries, milestones) {
  const recommendations = [];
  
  // Check for crew members with low milestone relevance
  summaries.forEach(summary => {
    if (summary.totalMemories > 0 && summary.relevantMilestones.length === 0) {
      recommendations.push({
        type: 'low_relevance',
        crewMember: summary.crewMember.name,
        message: `${summary.crewMember.name} has ${summary.totalMemories} memories but no relevant milestones. Consider reviewing milestone categorization.`
      });
    }
  });
  
  // Check for milestones with no crew memory associations
  const milestoneAssociations = new Map();
  summaries.forEach(summary => {
    summary.relevantMilestones.forEach(rm => {
      if (!milestoneAssociations.has(rm.milestone.fileName)) {
        milestoneAssociations.set(rm.milestone.fileName, []);
      }
      milestoneAssociations.get(rm.milestone.fileName).push(summary.crewMember.name);
    });
  });
  
  milestones.forEach(milestone => {
    if (!milestoneAssociations.has(milestone.fileName)) {
      recommendations.push({
        type: 'unassociated_milestone',
        milestone: milestone.title,
        category: milestone.category,
        message: `Milestone "${milestone.title}" has no associated crew memories. Consider creating crew analysis for this milestone.`
      });
    }
  });
  
  return recommendations;
}

async function integrateCrewMemoriesWithMilestones() {
  console.log('🖖 Crew Memory & Milestone Integration System\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const rootDir = process.cwd();
  const crewMemoriesDir = path.join(rootDir, 'crew-memories');
  const milestonesOrganizedDir = path.join(rootDir, 'milestones-organized');
  
  console.log('🤖 Commander Data - Loading crew memories...\n');
  const crewMemories = loadCrewMemories(crewMemoriesDir);
  console.log(`✅ Loaded memories for ${crewMemories.size} crew members\n`);
  
  console.log('📋 Loading milestones...\n');
  const milestones = loadMilestones(milestonesOrganizedDir);
  console.log(`✅ Loaded ${milestones.length} milestones\n`);
  
  console.log('🔍 Analyzing crew memory relevance to milestones...\n');
  const summaries = generateCrewMemorySummary(crewMemories, milestones);
  
  // Display summaries
  summaries.forEach(summary => {
    console.log(`👤 ${summary.crewMember.name}:`);
    console.log(`   Memories: ${summary.totalMemories}`);
    console.log(`   Relevant Milestones: ${summary.relevantMilestones.length}`);
    if (summary.relevantMilestones.length > 0) {
      console.log(`   Top Milestone: ${summary.relevantMilestones[0].milestone.title} (${summary.relevantMilestones[0].relevance} relevance)`);
    }
    console.log('');
  });
  
  console.log('📊 Generating RAG optimization report...\n');
  const report = generateRAGOptimizationReport(summaries, milestones);
  
  // Save report
  const reportDir = path.join(rootDir, 'reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportPath = path.join(reportDir, 'crew-memory-milestone-integration.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log(`✅ Report saved to: ${reportPath}\n`);
  
  // Display recommendations
  if (report.optimization.recommendations.length > 0) {
    console.log('💡 Optimization Recommendations:\n');
    report.optimization.recommendations.forEach((rec, i) => {
      console.log(`   ${i + 1}. [${rec.type}] ${rec.message}`);
    });
    console.log('');
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✅ Integration analysis complete!\n');
  
  return report;
}

if (require.main === module) {
  integrateCrewMemoriesWithMilestones().catch(console.error);
}

module.exports = { integrateCrewMemoriesWithMilestones, generateCrewMemorySummary };

