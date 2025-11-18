#!/usr/bin/env node

/**
 * Test n8n to Mermaid Converter
 * 
 * Tests the converter with real n8n workflow files
 * 
 * Reviewed by: Commander Data (Testing)
 */

const fs = require('fs');
const path = require('path');
const N8NToMermaidConverter = require('../lib/n8n-to-mermaid-converter');

async function testConverter() {
  console.log('🖖 Testing n8n to Mermaid Converter');
  console.log('═'.repeat(60));
  console.log('');

  const converter = new N8NToMermaidConverter();

  // Find n8n workflow files
  const workflowsDir = path.join(__dirname, '..', 'n8n-workflows');
  const workflowFiles = [];

  function findWorkflowFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        findWorkflowFiles(filePath);
      } else if (file.endsWith('.json')) {
        workflowFiles.push(filePath);
      }
    });
  }

  findWorkflowFiles(workflowsDir);

  console.log(`📁 Found ${workflowFiles.length} workflow files\n`);

  // Test with first few workflows
  const testWorkflows = workflowFiles.slice(0, 3);

  for (const workflowFile of testWorkflows) {
    console.log('─'.repeat(60));
    console.log(`📄 Testing: ${path.basename(workflowFile)}`);
    console.log('─'.repeat(60));

    try {
      const workflowJson = JSON.parse(fs.readFileSync(workflowFile, 'utf8'));
      
      console.log(`   Workflow: ${workflowJson.name || 'Unnamed'}`);
      console.log(`   Nodes: ${workflowJson.nodes?.length || 0}`);
      console.log(`   Connections: ${Object.keys(workflowJson.connections || {}).length}`);

      // Convert to Mermaid
      const mermaid = converter.convert(workflowJson);

      // Save output
      const outputDir = path.join(__dirname, '..', 'docs', 'mermaid-workflows');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputFile = path.join(
        outputDir,
        `${path.basename(workflowFile, '.json')}.mmd`
      );

      fs.writeFileSync(outputFile, mermaid, 'utf8');

      console.log(`   ✅ Converted successfully!`);
      console.log(`   📝 Output: ${outputFile}`);
      console.log(`   📊 Mermaid length: ${mermaid.length} characters`);
      console.log(`   📋 Preview (first 200 chars):`);
      console.log(`      ${mermaid.substring(0, 200).replace(/\n/g, ' ')}...`);
      console.log('');

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('═'.repeat(60));
  console.log('📊 Test Summary');
  console.log('═'.repeat(60));
  console.log(`   Workflows tested: ${testWorkflows.length}`);
  console.log(`   Output directory: docs/mermaid-workflows/`);
  console.log('');
  console.log('✅ Conversion test complete!');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   1. Review generated .mmd files in docs/mermaid-workflows/');
  console.log('   2. Add Mermaid component to dashboard');
  console.log('   3. Create API endpoint to convert workflows on-the-fly');
  console.log('   4. Integrate with n8n workflow viewer');
  console.log('');
}

testConverter().catch(console.error);

