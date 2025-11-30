#!/usr/bin/env node

/**
 * Condensed Documentation Creator
 * Creates condensed summary documents and stores detailed content in RAG system
 */

const fs = require('fs');
const path = require('path');

class CondensedDocumentationCreator {
  constructor() {
    this.projectRoot = process.cwd();
    this.outputDir = path.join(this.projectRoot, 'docs-condensed');
    this.milestoneFiles = [];
    this.documentationFiles = [];
  }

  async initialize() {
    console.log('🖖 Initializing Condensed Documentation Creator...');
    
    // Create output directory
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Find all documentation files
    await this.findDocumentationFiles();
    
    console.log(`📚 Found ${this.milestoneFiles.length} milestone files and ${this.documentationFiles.length} documentation files`);
  }

  async findDocumentationFiles() {
    const files = fs.readdirSync(this.projectRoot);
    
    this.milestoneFiles = files
      .filter(file => file.startsWith('MILESTONE_') && file.endsWith('.md'))
      .map(file => path.join(this.projectRoot, file));

    this.documentationFiles = files
      .filter(file => file.endsWith('.md') && !file.startsWith('MILESTONE_') && !file.includes('README'))
      .map(file => path.join(this.projectRoot, file));
  }

  async createCondensedMilestoneSummary() {
    console.log('📋 Creating condensed milestone summary...');
    
    const milestones = [];
    
    for (const filePath of this.milestoneFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const milestone = this.extractMilestoneInfo(content, path.basename(filePath));
      milestones.push(milestone);
    }

    // Sort by date (if available) or filename
    milestones.sort((a, b) => {
      if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
      }
      return b.filename.localeCompare(a.filename);
    });

    const summary = this.generateMilestoneSummary(milestones);
    
    const outputPath = path.join(this.outputDir, 'MILESTONE_SUMMARY_CONDENSED.md');
    fs.writeFileSync(outputPath, summary);
    
    console.log(`✅ Condensed milestone summary created: ${outputPath}`);
    return outputPath;
  }

  extractMilestoneInfo(content, filename) {
    const milestone = {
      filename,
      title: 'Unknown Milestone',
      status: 'unknown',
      date: null,
      description: '',
      crewInvolved: [],
      keyAchievements: [],
      tags: []
    };

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      milestone.title = titleMatch[1];
    }

    // Extract status
    if (content.includes('✅ COMPLETE') || content.includes('Status: ✅ COMPLETE')) {
      milestone.status = 'complete';
    } else if (content.includes('🚧 IN PROGRESS') || content.includes('Status: IN PROGRESS')) {
      milestone.status = 'in_progress';
    } else if (content.includes('❌ FAILED') || content.includes('Status: ❌ FAILED')) {
      milestone.status = 'failed';
    }

    // Extract date
    const dateMatch = content.match(/\*\*Date\*\*:\s*(.+)/);
    if (dateMatch) {
      milestone.date = dateMatch[1];
    }

    // Extract description from first paragraph
    const lines = content.split('\n');
    let inDescription = false;
    for (const line of lines) {
      if (line.startsWith('**') && line.includes('MISSION OBJECTIVE')) {
        inDescription = true;
        continue;
      }
      if (inDescription && line.trim() && !line.startsWith('#')) {
        milestone.description = line.trim();
        break;
      }
      if (inDescription && line.startsWith('#')) {
        break;
      }
    }

    // Extract crew members mentioned
    const crewMembers = [
      'Captain Picard', 'Commander Data', 'Commander Riker', 'Lieutenant Geordi',
      'Lieutenant Worf', 'Counselor Troi', 'Dr. Crusher', 'Lieutenant Uhura', 'Quark'
    ];
    
    crewMembers.forEach(member => {
      if (content.includes(member)) {
        milestone.crewInvolved.push(member);
      }
    });

    // Extract key achievements (look for checkmarks)
    const achievementMatches = content.match(/^- ✅ (.+)$/gm);
    if (achievementMatches) {
      milestone.keyAchievements = achievementMatches.map(match => match.replace('- ✅ ', ''));
    }

    // Extract tags
    if (content.includes('global navigation')) milestone.tags.push('navigation');
    if (content.includes('RAG') || content.includes('vector')) milestone.tags.push('rag');
    if (content.includes('N8N')) milestone.tags.push('n8n');
    if (content.includes('Supabase')) milestone.tags.push('supabase');
    if (content.includes('crew')) milestone.tags.push('crew');
    if (content.includes('security')) milestone.tags.push('security');
    if (content.includes('API')) milestone.tags.push('api');

    return milestone;
  }

  generateMilestoneSummary(milestones) {
    const summary = `# 🖖 Alex AI Universal - Condensed Milestone Summary

**Generated**: ${new Date().toISOString()}  
**Total Milestones**: ${milestones.length}  
**Purpose**: Condensed overview - detailed content available in RAG system  

---

## 📊 **MILESTONE OVERVIEW**

### **✅ Completed Milestones (${milestones.filter(m => m.status === 'complete').length})**
${milestones.filter(m => m.status === 'complete').map(m => 
  `- **${m.title}** - ${m.date || 'No date'} - ${m.crewInvolved.join(', ')}`
).join('\n')}

### **🚧 In Progress Milestones (${milestones.filter(m => m.status === 'in_progress').length})**
${milestones.filter(m => m.status === 'in_progress').map(m => 
  `- **${m.title}** - ${m.date || 'No date'} - ${m.crewInvolved.join(', ')}`
).join('\n')}

---

## 🎯 **RECENT ACHIEVEMENTS**

${milestones.slice(0, 5).map(milestone => `
### ${milestone.title}
- **Status**: ${milestone.status === 'complete' ? '✅ Complete' : milestone.status === 'in_progress' ? '🚧 In Progress' : '❓ Unknown'}
- **Date**: ${milestone.date || 'No date'}
- **Crew Involved**: ${milestone.crewInvolved.join(', ') || 'None specified'}
- **Description**: ${milestone.description}
- **Tags**: ${milestone.tags.join(', ') || 'None'}
${milestone.keyAchievements.length > 0 ? `- **Key Achievements**:\n${milestone.keyAchievements.map(a => `  - ${a}`).join('\n')}` : ''}
`).join('\n')}

---

## 🖖 **CREW INVOLVEMENT SUMMARY**

${this.generateCrewSummary(milestones)}

---

## 🏷️ **TAG ANALYSIS**

${this.generateTagAnalysis(milestones)}

---

## 📋 **DETAILED INFORMATION**

**Note**: Detailed milestone information is stored in the Supabase vector RAG system. Use the crew query interface to access specific details:

\`\`\`typescript
import CrewRAGQuery from '@/lib/crew-rag-query';

const ragQuery = new CrewRAGQuery();
const milestone = await ragQuery.getMilestoneInformation('MILESTONE_ID');
\`\`\`

**Available Queries**:
- Query specific crew member expertise
- Search by keywords or tags
- Get milestone details
- Find related documentation

---

**🖖 This condensed summary provides quick access to milestone overview. For detailed information, query the RAG system using the crew interface.**

*Generated by Alex AI Documentation System*
`;

    return summary;
  }

  generateCrewSummary(milestones) {
    const crewStats = {};
    
    milestones.forEach(milestone => {
      milestone.crewInvolved.forEach(crew => {
        crewStats[crew] = (crewStats[crew] || 0) + 1;
      });
    });

    const crewSummary = Object.entries(crewStats)
      .sort(([,a], [,b]) => b - a)
      .map(([crew, count]) => `- **${crew}**: ${count} milestones`)
      .join('\n');

    return `### **Most Active Crew Members**
${crewSummary}

### **Crew Expertise Distribution**
- **Strategic Leadership** (Captain Picard): ${crewStats['Captain Picard'] || 0} milestones
- **Data Analysis** (Commander Data): ${crewStats['Commander Data'] || 0} milestones  
- **Operations** (Commander Riker): ${crewStats['Commander Riker'] || 0} milestones
- **Engineering** (Lieutenant Geordi): ${crewStats['Lieutenant Geordi'] || 0} milestones
- **Security** (Lieutenant Worf): ${crewStats['Lieutenant Worf'] || 0} milestones
- **User Experience** (Counselor Troi): ${crewStats['Counselor Troi'] || 0} milestones
- **System Health** (Dr. Crusher): ${crewStats['Dr. Crusher'] || 0} milestones
- **Communications** (Lieutenant Uhura): ${crewStats['Lieutenant Uhura'] || 0} milestones
- **Business Operations** (Quark): ${crewStats['Quark'] || 0} milestones`;
  }

  generateTagAnalysis(milestones) {
    const tagStats = {};
    
    milestones.forEach(milestone => {
      milestone.tags.forEach(tag => {
        tagStats[tag] = (tagStats[tag] || 0) + 1;
      });
    });

    const tagSummary = Object.entries(tagStats)
      .sort(([,a], [,b]) => b - a)
      .map(([tag, count]) => `- **${tag}**: ${count} milestones`)
      .join('\n');

    return `### **Most Common Topics**
${tagSummary}

### **Focus Areas**
- **Navigation Systems**: ${tagStats.navigation || 0} milestones
- **RAG Integration**: ${tagStats.rag || 0} milestones
- **N8N Workflows**: ${tagStats.n8n || 0} milestones
- **Supabase Integration**: ${tagStats.supabase || 0} milestones
- **Crew Integration**: ${tagStats.crew || 0} milestones
- **Security**: ${tagStats.security || 0} milestones
- **API Development**: ${tagStats.api || 0} milestones`;
  }

  async createCondensedDocumentationSummary() {
    console.log('📚 Creating condensed documentation summary...');
    
    const docs = [];
    
    for (const filePath of this.documentationFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      const doc = this.extractDocumentInfo(content, path.basename(filePath));
      docs.push(doc);
    }

    const summary = this.generateDocumentationSummary(docs);
    
    const outputPath = path.join(this.outputDir, 'DOCUMENTATION_SUMMARY_CONDENSED.md');
    fs.writeFileSync(outputPath, summary);
    
    console.log(`✅ Condensed documentation summary created: ${outputPath}`);
    return outputPath;
  }

  extractDocumentInfo(content, filename) {
    const doc = {
      filename,
      title: filename.replace('.md', ''),
      description: '',
      type: 'general',
      tags: []
    };

    // Extract title from first heading
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      doc.title = titleMatch[1];
    }

    // Extract description from first paragraph
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('**')) {
        doc.description = line.trim().substring(0, 200) + '...';
        break;
      }
    }

    // Determine type and tags
    if (filename.includes('GUIDE')) doc.type = 'guide';
    if (filename.includes('STATUS')) doc.type = 'status';
    if (filename.includes('SUCCESS')) doc.type = 'success';
    if (filename.includes('INTEGRATION')) doc.type = 'integration';

    return doc;
  }

  generateDocumentationSummary(docs) {
    return `# 🖖 Alex AI Universal - Condensed Documentation Summary

**Generated**: ${new Date().toISOString()}  
**Total Documents**: ${docs.length}  
**Purpose**: Condensed overview - detailed content available in RAG system  

---

## 📚 **DOCUMENTATION OVERVIEW**

### **📖 Guides (${docs.filter(d => d.type === 'guide').length})**
${docs.filter(d => d.type === 'guide').map(d => 
  `- **${d.title}** - ${d.description}`
).join('\n')}

### **📊 Status Reports (${docs.filter(d => d.type === 'status').length})**
${docs.filter(d => d.type === 'status').map(d => 
  `- **${d.title}** - ${d.description}`
).join('\n')}

### **✅ Success Reports (${docs.filter(d => d.type === 'success').length})**
${docs.filter(d => d.type === 'success').map(d => 
  `- **${d.title}** - ${d.description}`
).join('\n')}

### **🔗 Integration Guides (${docs.filter(d => d.type === 'integration').length})**
${docs.filter(d => d.type === 'integration').map(d => 
  `- **${d.title}** - ${d.description}`
).join('\n')}

---

## 🎯 **QUICK ACCESS**

**For detailed information, query the RAG system:**

\`\`\`typescript
import CrewRAGQuery from '@/lib/crew-rag-query';

const ragQuery = new CrewRAGQuery();

// Query for specific crew member
const results = await ragQuery.queryForCrewMember('captain_picard', 'strategic planning');

// Search by keywords
const keywordResults = await ragQuery.searchByKeywords(['navigation', 'system']);
\`\`\`

---

**🖖 This condensed summary provides quick access to documentation overview. For detailed information, query the RAG system using the crew interface.**

*Generated by Alex AI Documentation System*
`;
  }

  async createCrewQuickReference() {
    console.log('🖖 Creating crew quick reference...');
    
    const quickRef = `# 🖖 Alex AI Crew - Quick Reference

**Purpose**: Quick access to crew member capabilities and expertise  
**Detailed Information**: Available in RAG system via crew query interface  

---

## 👥 **CREW MEMBERS**

### **Captain Jean-Luc Picard** (captain_picard)
- **Role**: Strategic Commander
- **Expertise**: Strategic Leadership, System Integration, Decision Making
- **Keywords**: strategic, leadership, command, decision, mission, planning, coordination
- **Query Examples**: 
  - "Captain Picard, what's our strategic approach for this project?"
  - "How should we coordinate our development efforts?"

### **Commander Data** (commander_data)
- **Role**: Operations Officer  
- **Expertise**: Analytics, Logic, Data Processing, AI/ML
- **Keywords**: data, analysis, logic, processing, analytics, metrics, performance
- **Query Examples**:
  - "Commander Data, analyze this performance data"
  - "What are the logical next steps for optimization?"

### **Commander William Riker** (commander_riker)
- **Role**: First Officer
- **Expertise**: Tactical Operations, Workflow Management, Execution
- **Keywords**: operations, tactical, execution, workflow, management, coordination
- **Query Examples**:
  - "Commander Riker, how should we execute this plan?"
  - "What's our operational strategy for deployment?"

### **Lieutenant Commander Geordi La Forge** (lieutenant_geordi)
- **Role**: Chief Engineer
- **Expertise**: Infrastructure, System Integration, Technical Solutions
- **Keywords**: engineering, technical, infrastructure, system, architecture, implementation
- **Query Examples**:
  - "Geordi, how should we architect this system?"
  - "What are the technical challenges we need to solve?"

### **Lieutenant Worf** (lieutenant_worf)
- **Role**: Security Officer
- **Expertise**: Security Protocols, Threat Assessment, Compliance
- **Keywords**: security, threat, compliance, vulnerability, protection, audit
- **Query Examples**:
  - "Worf, is this implementation secure?"
  - "What security measures should we implement?"

### **Counselor Deanna Troi** (counselor_troi)
- **Role**: Ship's Counselor
- **Expertise**: User Experience, Communication, Team Dynamics
- **Keywords**: user experience, communication, team dynamics, interface, usability
- **Query Examples**:
  - "Counselor Troi, how can we improve the user experience?"
  - "What communication strategies should we use?"

### **Dr. Beverly Crusher** (dr_crusher)
- **Role**: Chief Medical Officer
- **Expertise**: System Health, Diagnostics, Wellness
- **Keywords**: performance, health, diagnostics, optimization, monitoring, wellness
- **Query Examples**:
  - "Dr. Crusher, how can we optimize system performance?"
  - "What health monitoring should we implement?"

### **Lieutenant Uhura** (lieutenant_uhura)
- **Role**: Communications Officer
- **Expertise**: Communication Protocols, Synchronization, Integration
- **Keywords**: communication, integration, synchronization, protocols, connectivity
- **Query Examples**:
  - "Uhura, how should we integrate these systems?"
  - "What communication protocols do we need?"

### **Quark** (quark)
- **Role**: Business Operations
- **Expertise**: Cost Optimization, Efficiency Analysis, Business Metrics
- **Keywords**: business, cost, efficiency, metrics, optimization, value, roi
- **Query Examples**:
  - "Quark, what's the business value of this approach?"
  - "How can we optimize costs and efficiency?"

---

## 🔍 **QUERYING THE RAG SYSTEM**

### **Basic Usage**
\`\`\`typescript
import CrewRAGQuery from '@/lib/crew-rag-query';

const ragQuery = new CrewRAGQuery();

// Query for specific crew member
const results = await ragQuery.queryForCrewMember('captain_picard', 'strategic planning');

// Get crew member info
const crewInfo = ragQuery.getCrewMemberInfo('captain_picard');

// Search by keywords
const keywordResults = await ragQuery.searchByKeywords(['navigation', 'system']);
\`\`\`

### **Advanced Queries**
\`\`\`typescript
// Get milestone information
const milestone = await ragQuery.getMilestoneInformation('MILESTONE_ID');

// Get crew-relevant documents
const crewDocs = await ragQuery.getCrewRelevantDocuments('captain_picard', 10);

// Analyze query relevance
const relevance = ragQuery.analyzeQueryRelevance('strategic planning navigation system');

// Get documentation statistics
const stats = await ragQuery.getDocumentationStats();
\`\`\`

---

**🖖 Use this quick reference to identify the right crew member for your query, then use the RAG system to get detailed information.**

*Generated by Alex AI Documentation System*
`;

    const outputPath = path.join(this.outputDir, 'CREW_QUICK_REFERENCE.md');
    fs.writeFileSync(outputPath, quickRef);
    
    console.log(`✅ Crew quick reference created: ${outputPath}`);
    return outputPath;
  }

  async createAllCondensedDocumentation() {
    await this.initialize();
    
    console.log('🚀 Creating all condensed documentation...');
    
    const milestoneSummary = await this.createCondensedMilestoneSummary();
    const docSummary = await this.createCondensedDocumentationSummary();
    const crewReference = await this.createCrewQuickReference();
    
    console.log('\n🎉 Condensed documentation creation complete!');
    console.log(`📋 Files created:`);
    console.log(`  - ${milestoneSummary}`);
    console.log(`  - ${docSummary}`);
    console.log(`  - ${crewReference}`);
    
    console.log('\n💡 Next steps:');
    console.log('  1. Run the documentation-to-rag-migrator.js to store detailed content in RAG');
    console.log('  2. Use the crew-rag-query.ts interface to query documentation');
    console.log('  3. Reference the condensed summaries for quick overview');
    
    return {
      milestoneSummary,
      docSummary,
      crewReference
    };
  }
}

// Run if called directly
if (require.main === module) {
  const creator = new CondensedDocumentationCreator();
  creator.createAllCondensedDocumentation().catch(console.error);
}

module.exports = CondensedDocumentationCreator;


