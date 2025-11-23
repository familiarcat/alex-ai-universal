#!/usr/bin/env node
/**
 * 🖖 Generate Project Website
 * 
 * Generates a unique website from a dashboard project configuration.
 * This demonstrates the reusable dashboard system where each project
 * outputs a unique website.
 * 
 * Usage:
 *   node scripts/generate-project-website.js <projectId> [--format=nextjs|react|html]
 */

const { createDefaultProjectConfig } = require('../packages/dashboard-core/src/config/ProjectConfig.js');
const { WebsiteGenerator } = require('../packages/dashboard-core/src/generators/WebsiteGenerator.js');
const path = require('path');

async function main() {
  const args = process.argv.slice(2);
  const projectId = args[0];
  const formatArg = args.find(arg => arg.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1] : 'nextjs';
  
  if (!projectId) {
    console.error('Usage: node scripts/generate-project-website.js <projectId> [--format=nextjs|react|html]');
    process.exit(1);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🖖 GENERATE PROJECT WEBSITE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Create project configuration
  const config = createDefaultProjectConfig(
    projectId,
    `Project ${projectId}`,
    'platform',
    'gradient'
  );
  
  config.website.exportFormat = format;
  config.website.outputPath = path.join(process.cwd(), 'output', projectId);
  
  // Generate website
  const generator = new WebsiteGenerator();
  const result = await generator.generateWebsite(config);
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ WEBSITE GENERATION COMPLETE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log(`Project ID: ${result.projectId}`);
  console.log(`Output Path: ${result.outputPath}`);
  console.log(`Format: ${config.website.exportFormat}`);
  console.log(`Pages Generated: ${result.pages.length}`);
  result.pages.forEach(page => {
    console.log(`   - ${page.path} (${page.type})`);
  });
  console.log(`Assets Generated: ${result.assets.length}`);
  result.assets.forEach(asset => {
    console.log(`   - ${asset}`);
  });
  console.log('');
}

if (require.main === module) {
  main().catch(err => {
    console.error('\n❌ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
}

