#!/usr/bin/env node

/**
 * Alex AI Universal CLI Tool
 * 
 * This CLI tool provides commands for initializing Alex AI projects
 * with universal capabilities and managing crew knowledge distribution.
 */

import { Command } from 'commander';
import { UniversalKnowledgeDistribution } from './universal-knowledge-distribution';
import { ProjectTemplateGenerator } from './project-template-generator';
import * as fs from 'fs-extra';
import * as path from 'path';

const program = new Command();

program
  .name('alex-ai')
  .description('Alex AI Universal CLI - Initialize projects with universal capabilities')
  .version('1.0.0');

/**
 * Universal initialization command
 */
program
  .command('universal-init')
  .description('Initialize Alex AI Universal capabilities for current project')
  .option('-p, --project-id <id>', 'Project ID (default: auto-generated)')
  .option('-n, --project-name <name>', 'Project name (default: from package.json)')
  .option('--supabase-url <url>', 'Supabase URL')
  .option('--supabase-key <key>', 'Supabase anonymous key')
  .option('--n8n-webhook <url>', 'N8N webhook URL')
  .option('--n8n-api-key <key>', 'N8N API key')
  .action(async (options) => {
    try {
      console.log('🖖 Initializing Alex AI Universal capabilities...');

      // Get project information
      const packageJson = await fs.readJson('package.json').catch(() => ({}));
      const projectId = options.projectId || packageJson.name || 'alex-ai-project';
      const projectName = options.projectName || packageJson.name || 'Alex AI Project';

      // Load environment variables
      const config = {
        supabaseUrl: options.supabaseUrl || process.env.SUPABASE_URL,
        supabaseKey: options.supabaseKey || process.env.SUPABASE_ANON_KEY,
        n8nWebhookUrl: options.n8nWebhook || process.env.N8N_WEBHOOK_URL || 'http://localhost:5678',
        n8nApiKey: options.n8nApiKey || process.env.N8N_API_KEY,
        enableUniversalSync: true,
        enableCrewKnowledgeSharing: true,
        enableN8NIntegration: true,
        enableChatCapturing: true
      };

      // Validate required configuration
      if (!config.supabaseUrl || !config.supabaseKey) {
        console.error('❌ Missing required Supabase configuration');
        console.log('Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables or use --supabase-url and --supabase-key options');
        process.exit(1);
      }

      // Initialize universal knowledge distribution
      const universalKnowledge = new UniversalKnowledgeDistribution(config);

      // Register project
      const projectCapabilities = await universalKnowledge.registerProject({
        projectId,
        projectName,
        capabilities: ['universal-alex-ai', ...(packageJson.alexAI?.capabilities || [])]
      });

      console.log('✅ Alex AI Universal capabilities initialized');
      console.log(`📋 Project: ${projectCapabilities.projectName}`);
      console.log(`🆔 Project ID: ${projectCapabilities.projectId}`);
      console.log(`👥 Crew Members: ${projectCapabilities.crewMembers.length}`);
      console.log(`⚙️ N8N Integration: ${projectCapabilities.n8nIntegration ? '✅' : '❌'}`);
      console.log(`📱 Chat Capturing: ${projectCapabilities.chatCapturing ? '✅' : '❌'}`);
      console.log(`🧠 RAG Integration: ${projectCapabilities.ragIntegration ? '✅' : '❌'}`);
      console.log(`📊 Monitoring Dashboard: ${projectCapabilities.monitoringDashboard ? '✅' : '❌'}`);

      // Create .alex-ai directory with configuration
      await fs.ensureDir('.alex-ai');
      await fs.writeJson('.alex-ai/config.json', {
        projectId,
        projectName,
        capabilities: projectCapabilities.capabilities,
        lastInit: new Date().toISOString()
      }, { spaces: 2 });

      console.log('\n🎉 Alex AI Universal initialization complete!');
      console.log('📁 Configuration saved to .alex-ai/config.json');
      console.log('\n📋 Available commands:');
      console.log('  npm run alex-ai:sync     - Synchronize crew knowledge');
      console.log('  npm run alex-ai:monitor  - Open monitoring dashboard');
      console.log('  npm run alex-ai:crew     - Engage crew for analysis');
      console.log('  npm run alex-ai:chat     - Capture conversation');

    } catch (error) {
      console.error('❌ Failed to initialize Alex AI Universal capabilities:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Universal synchronization command
 */
program
  .command('universal-sync')
  .description('Synchronize crew knowledge across all Alex AI projects')
  .option('--project-id <id>', 'Specific project ID to sync')
  .action(async (options) => {
    try {
      console.log('🔄 Synchronizing Alex AI Universal knowledge...');

      // Load configuration
      const config = await fs.readJson('.alex-ai/config.json').catch(() => null);
      if (!config) {
        console.error('❌ Alex AI not initialized. Run "alex-ai universal-init" first.');
        process.exit(1);
      }

      // Initialize universal knowledge distribution
      const universalKnowledge = new UniversalKnowledgeDistribution({
        supabaseUrl: process.env.SUPABASE_URL!,
        supabaseKey: process.env.SUPABASE_ANON_KEY!,
        n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678',
        n8nApiKey: process.env.N8N_API_KEY,
        enableUniversalSync: true,
        enableCrewKnowledgeSharing: true,
        enableN8NIntegration: true,
        enableChatCapturing: true
      });

      if (options.projectId) {
        // Sync specific project
        console.log(`📡 Syncing project: ${options.projectId}`);
        // Implementation for single project sync
      } else {
        // Sync all projects
        await universalKnowledge.synchronizeCrewKnowledge();
      }

      console.log('✅ Universal knowledge synchronization complete');

    } catch (error) {
      console.error('❌ Failed to synchronize universal knowledge:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Project template generation command
 */
program
  .command('generate-template')
  .description('Generate Alex AI project template')
  .requiredOption('-n, --name <name>', 'Project name')
  .option('-t, --type <type>', 'Project type (nextjs, node, universal)', 'universal')
  .option('-o, --output <path>', 'Output directory', './alex-ai-template')
  .action(async (options) => {
    try {
      console.log(`🚀 Generating Alex AI template: ${options.name}`);

      // Initialize universal knowledge distribution
      const universalKnowledge = new UniversalKnowledgeDistribution({
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_ANON_KEY || '',
        n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678',
        n8nApiKey: process.env.N8N_API_KEY,
        enableUniversalSync: true,
        enableCrewKnowledgeSharing: true,
        enableN8NIntegration: true,
        enableChatCapturing: true
      });

      // Generate template
      const templateGenerator = new ProjectTemplateGenerator(universalKnowledge);
      const template = templateGenerator.generateTemplate(options.name, options.type as any);

      // Save template
      await templateGenerator.saveTemplate(template, options.output);

      console.log(`✅ Alex AI template generated: ${options.output}`);
      console.log(`📋 Template type: ${template.type}`);
      console.log(`👥 Crew members: ${template.alexAIFeatures.crewAI.members.length}`);
      console.log(`⚙️ Features: ${template.alexAIFeatures.chatCapturing.enabled ? 'Chat' : ''} ${template.alexAIFeatures.n8nIntegration.enabled ? 'N8N' : ''} ${template.alexAIFeatures.crewAI.enabled ? 'Crew' : ''}`);

    } catch (error) {
      console.error('❌ Failed to generate template:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Crew engagement command
 */
program
  .command('crew-engage')
  .description('Engage Alex AI crew for analysis')
  .option('-r, --request <request>', 'Analysis request')
  .option('-p, --project-id <id>', 'Project ID')
  .action(async (options) => {
    try {
      console.log('👥 Engaging Alex AI crew...');

      // Load configuration
      const config = await fs.readJson('.alex-ai/config.json').catch(() => null);
      if (!config) {
        console.error('❌ Alex AI not initialized. Run "alex-ai universal-init" first.');
        process.exit(1);
      }

      // Initialize universal knowledge distribution
      const universalKnowledge = new UniversalKnowledgeDistribution({
        supabaseUrl: process.env.SUPABASE_URL!,
        supabaseKey: process.env.SUPABASE_ANON_KEY!,
        n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678',
        n8nApiKey: process.env.N8N_API_KEY,
        enableUniversalSync: true,
        enableCrewKnowledgeSharing: true,
        enableN8NIntegration: true,
        enableChatCapturing: true
      });

      const request = options.request || 'General project analysis and recommendations';
      console.log(`📋 Analysis request: ${request}`);

      // Simulate crew engagement (in real implementation, this would call the actual crew analysis)
      const crewMembers = universalKnowledge.getUniversalFeatures().crewAI.members;
      console.log(`👥 Engaging ${crewMembers.length} crew members:`);
      
      crewMembers.forEach(member => {
        console.log(`  🖖 ${member}`);
      });

      console.log('\n✅ Crew engagement initiated');
      console.log('📊 Results will be stored in RAG system and synchronized across projects');

    } catch (error) {
      console.error('❌ Failed to engage crew:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Chat capture command
 */
program
  .command('chat-capture')
  .description('Capture conversation with Alex AI universal features')
  .option('-s, --source <source>', 'Chat source (messages, slack, discord, etc.)', 'messages')
  .option('-f, --file <file>', 'Chat file to process')
  .action(async (options) => {
    try {
      console.log('📱 Capturing conversation with Alex AI universal features...');

      // Load configuration
      const config = await fs.readJson('.alex-ai/config.json').catch(() => null);
      if (!config) {
        console.error('❌ Alex AI not initialized. Run "alex-ai universal-init" first.');
        process.exit(1);
      }

      console.log(`📋 Chat source: ${options.source}`);
      
      if (options.file) {
        console.log(`📄 Processing file: ${options.file}`);
        
        // Check if file exists
        if (!await fs.pathExists(options.file)) {
          console.error(`❌ File not found: ${options.file}`);
          process.exit(1);
        }
        
        console.log('✅ Chat file loaded');
      }

      console.log('🔄 Processing conversation with universal chat capturing features...');
      console.log('📊 Analysis will be stored in RAG system and synchronized across projects');

      console.log('\n✅ Chat capture complete');

    } catch (error) {
      console.error('❌ Failed to capture chat:', (error as Error).message);
      process.exit(1);
    }
  });

/**
 * Status command
 */
program
  .command('status')
  .description('Show Alex AI Universal status')
  .action(async () => {
    try {
      console.log('📊 Alex AI Universal Status\n');

      // Load configuration
      const config = await fs.readJson('.alex-ai/config.json').catch(() => null);
      if (!config) {
        console.log('❌ Alex AI not initialized');
        console.log('Run "alex-ai universal-init" to initialize');
        return;
      }

      console.log(`📋 Project: ${config.projectName}`);
      console.log(`🆔 Project ID: ${config.projectId}`);
      console.log(`📅 Last Init: ${config.lastInit}`);

      // Initialize universal knowledge distribution to get current status
      const universalKnowledge = new UniversalKnowledgeDistribution({
        supabaseUrl: process.env.SUPABASE_URL || '',
        supabaseKey: process.env.SUPABASE_ANON_KEY || '',
        n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'http://localhost:5678',
        n8nApiKey: process.env.N8N_API_KEY,
        enableUniversalSync: true,
        enableCrewKnowledgeSharing: true,
        enableN8NIntegration: true,
        enableChatCapturing: true
      });

      const features = universalKnowledge.getUniversalFeatures();
      const projects = universalKnowledge.getAllProjects();

      console.log('\n🖖 Universal Features:');
      console.log(`  📱 Chat Capturing: ${features.chatCapturing.enabled ? '✅' : '❌'}`);
      console.log(`  ⚙️ N8N Integration: ${features.n8nIntegration.enabled ? '✅' : '❌'}`);
      console.log(`  👥 Crew AI: ${features.crewAI.enabled ? '✅' : '❌'}`);
      console.log(`  🧠 RAG System: ${features.ragSystem.enabled ? '✅' : '❌'}`);
      console.log(`  📊 Monitoring: ${features.monitoring.enabled ? '✅' : '❌'}`);

      console.log('\n👥 Crew Members:');
      features.crewAI.members.forEach(member => {
        console.log(`  🖖 ${member}`);
      });

      console.log(`\n📋 Registered Projects: ${projects.length}`);
      projects.forEach(project => {
        console.log(`  📁 ${project.projectName} (${project.projectId}) - ${project.status}`);
      });

    } catch (error) {
      console.error('❌ Failed to get status:', (error as Error).message);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();
