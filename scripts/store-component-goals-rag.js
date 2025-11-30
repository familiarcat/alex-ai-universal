#!/usr/bin/env node

/**
 * Store Component Goals in RAG System
 * 
 * Takes analyzed component goals and stores them in Supabase RAG system
 * for crew learning and coordination.
 * 
 * Leadership: Lieutenant Uhura (Storage) + Commander Data (Knowledge Management)
 */

const fs = require('fs');
const path = require('path');

const COMPONENT_GOALS_DIR = path.join(__dirname, '../docs/component-goals');
const RAG_WEBHOOK = process.env.N8N_WEBHOOK_URL || 'https://n8n.pbradygeorgen.com/webhook/knowledge-ingest';

async function storeComponentGoalsInRAG() {
  const ragReadyPath = path.join(COMPONENT_GOALS_DIR, 'rag-ready.json');
  
  if (!fs.existsSync(ragReadyPath)) {
    console.error('❌ rag-ready.json not found. Run analyze-component-goals.js first.');
    process.exit(1);
  }
  
  const componentGoals = JSON.parse(fs.readFileSync(ragReadyPath, 'utf-8'));
  
  console.log(`📦 Storing ${componentGoals.length} component goals in RAG system...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const goal of componentGoals) {
    try {
      // Format for RAG storage
      const ragMemory = {
        crew_member: 'system',
        crew_member_name: 'Component Goals System',
        knowledge_type: 'technical_knowledge',
        priority: 'high',
        title: `Component Goal: ${goal.component_name}`,
        summary: goal.purpose || `Goals and responsibilities for ${goal.component_name}`,
        detailed_analysis: `
Component: ${goal.component_name}
Purpose: ${goal.purpose}
Domain: ${goal.domain || 'Uncategorized'}
Business Value: ${goal.business_value}

Responsibilities:
${goal.responsibilities.map(r => `- ${r}`).join('\n')}

Integrations:
${goal.integrations.map(i => `- ${i}`).join('\n')}

Data Sources:
${goal.data_sources.join('\n')}

Crew Owners:
${goal.crew_owners.map(c => `- ${c}`).join('\n')}
        `.trim(),
        key_findings: goal.responsibilities,
        conclusions: [`Component ${goal.component_name} is part of ${goal.domain} domain`],
        recommendations: [
          `Ensure ${goal.component_name} maintains its purpose: ${goal.purpose}`,
          `Coordinate with crew owners: ${goal.crew_owners.join(', ')}`
        ],
        referenced_documents: [],
        related_topics: goal.integrations,
        applicable_scenarios: [`Working with ${goal.component_name}`, `Optimizing ${goal.domain} domain`],
        general_principles: [
          'Component goals should be clearly defined',
          'Components should have clear crew ownership',
          'Components should integrate well with other components'
        ],
        tags: ['component', 'dashboard', goal.domain?.toLowerCase() || 'uncategorized', ...goal.crew_owners],
        keywords: [
          goal.component_name.toLowerCase(),
          goal.domain?.toLowerCase() || 'uncategorized',
          ...goal.responsibilities.map(r => r.toLowerCase()),
          ...goal.integrations.map(i => i.toLowerCase())
        ],
        complexity_level: goal.technical_stack?.dependencies?.length > 5 ? 7 : 5,
        confidence_level: 90,
        prime_directive_compliance: 'compliant',
        ambiguity_level: 3, // Low ambiguity - component goals are specific
        project_specificity: false, // General knowledge
        semantic_text: goal.semantic_text
      };
      
      // Store via n8n webhook
      const response = await fetch(RAG_WEBHOOK, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ragMemory)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success || result.id) {
        successCount++;
        console.log(`  ✅ Stored: ${goal.component_name}`);
      } else {
        throw new Error('Storage failed: ' + JSON.stringify(result));
      }
      
      // Rate limiting - wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      errorCount++;
      console.error(`  ❌ Error storing ${goal.component_name}:`, error.message);
    }
  }
  
  console.log(`\n✅ Storage complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   📊 Total: ${componentGoals.length}`);
  
  if (errorCount > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  storeComponentGoalsInRAG().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { storeComponentGoalsInRAG };

