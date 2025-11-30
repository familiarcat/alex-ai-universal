#!/usr/bin/env node

import { Command } from 'commander';
import { AlexAIMessagesIntelligence } from './index';
import { MessagesIntelligenceCrewIntegration } from './crew-integration';
import { format } from 'date-fns';

const program = new Command();

program
  .name('alex-ai-messages')
  .description('Alex AI Messages Intelligence - Apple Messages conversation analysis')
  .version('1.0.0');

// List conversations command
program
  .command('list')
  .description('List all available conversations')
  .option('-l, --limit <number>', 'Limit number of conversations shown', '20')
  .action(async (options) => {
    try {
      const messagesIntelligence = new AlexAIMessagesIntelligence();
      const conversations = await messagesIntelligence.getExporter().getConversations();
      
      const limit = parseInt(options.limit);
      const limitedConversations = conversations.slice(0, limit);
      
      console.log(`\n📱 Available Conversations (${limitedConversations.length} of ${conversations.length}):\n`);
      
      limitedConversations.forEach((conv, index) => {
        console.log(`${index + 1}. ${conv.name}`);
        console.log(`   Messages: ${conv.messageCount} | Last: ${format(conv.lastMessage, 'MMM d, yyyy, h:mm a')}`);
        console.log(`   Participants: ${conv.participants.join(', ')}`);
        console.log('');
      });
      
      messagesIntelligence.cleanup();
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Export conversation command
program
  .command('export')
  .description('Export a conversation to files')
  .requiredOption('-c, --conversation <id>', 'Conversation ID or name')
  .option('-s, --start <date>', 'Start date (YYYY-MM-DD)')
  .option('-e, --end <date>', 'End date (YYYY-MM-DD)')
  .option('-o, --output <path>', 'Output directory path')
  .option('-f, --format <type>', 'Export format (markdown, pdf, both)', 'both')
  .option('--no-images', 'Exclude images from export')
  .action(async (options) => {
    try {
      const messagesIntelligence = new AlexAIMessagesIntelligence();
      const conversations = await messagesIntelligence.getExporter().getConversations();
      
      const conversation = conversations.find(c => 
        c.id === options.conversation || 
        c.name.toLowerCase().includes(options.conversation.toLowerCase())
      );
      
      if (!conversation) {
        console.error('❌ Conversation not found. Use "list" to see available conversations.');
        process.exit(1);
      }
      
      const startDate = options.start ? new Date(options.start) : conversation.firstMessage;
      const endDate = options.end ? new Date(options.end) : conversation.lastMessage;
      const outputDir = options.output || require('os').homedir() + '/Documents/Messages_Exports';
      
      console.log(`\n📤 Exporting conversation: ${conversation.name}`);
      console.log(`📅 Date range: ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`);
      console.log(`📂 Output: ${outputDir}\n`);
      
      const result = await messagesIntelligence.getExporter().exportConversation({
        conversationId: conversation.id,
        startDate,
        endDate,
        outputDirectory: outputDir,
        includeImages: options.images,
        format: options.format
      });
      
      if (result.success) {
        console.log('✨ Export complete!');
        console.log(`📂 Files saved to: ${result.outputPath}`);
        console.log(`📄 Messages exported: ${result.messageCount}`);
        if (result.markdownPath) console.log(`📝 Markdown: ${result.markdownPath}`);
        if (result.pdfPath) console.log(`📋 PDF: ${result.pdfPath}`);
        if (result.imagesPath) console.log(`🖼️ Images: ${result.imagesPath}`);
      } else {
        console.error(`❌ Export failed: ${result.error}`);
        process.exit(1);
      }
      
      messagesIntelligence.cleanup();
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Analyze conversation command
program
  .command('analyze')
  .description('Analyze a conversation with crew members')
  .requiredOption('-c, --conversation <id>', 'Conversation ID or name')
  .requiredOption('-m, --member <crew>', 'Crew member name (e.g., "Captain Picard", "Commander Data")')
  .option('-t, --type <type>', 'Analysis type (strategic, technical, security, business, general)', 'general')
  .option('-s, --start <date>', 'Start date (YYYY-MM-DD)')
  .option('-e, --end <date>', 'End date (YYYY-MM-DD)')
  .option('-q, --questions <questions>', 'Specific questions (comma-separated)')
  .action(async (options) => {
    try {
      const messagesIntelligence = new AlexAIMessagesIntelligence();
      const crewIntegration = new MessagesIntelligenceCrewIntegration();
      
      const conversations = await messagesIntelligence.getExporter().getConversations();
      const conversation = conversations.find(c => 
        c.id === options.conversation || 
        c.name.toLowerCase().includes(options.conversation.toLowerCase())
      );
      
      if (!conversation) {
        console.error('❌ Conversation not found. Use "list" to see available conversations.');
        process.exit(1);
      }
      
      const startDate = options.start ? new Date(options.start) : undefined;
      const endDate = options.end ? new Date(options.end) : undefined;
      const specificQuestions = options.questions ? options.questions.split(',').map((q: string) => q.trim()) : [];
      
      console.log(`\n🖖 ${options.member} analyzing conversation: ${conversation.name}`);
      console.log(`📊 Analysis type: ${options.type}\n`);
      
      const analysis = await crewIntegration.processCrewRequest({
        crewMember: options.member,
        analysisType: options.type,
        conversationId: conversation.id,
        dateRange: startDate && endDate ? { start: startDate, end: endDate } : undefined,
        specificQuestions
      });
      
      console.log(analysis);
      
      crewIntegration.cleanup();
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Interactive mode command
program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode')
  .action(async () => {
    try {
      const messagesIntelligence = new AlexAIMessagesIntelligence();
      console.log('🖖 Alex AI Messages Intelligence - Interactive Mode');
      console.log('Prime Directive: Zero-artifact guarantee active\n');
      
      await messagesIntelligence.startInteractiveMode();
      messagesIntelligence.cleanup();
    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Crew members command
program
  .command('crew')
  .description('List available crew members')
  .action(() => {
    const crewIntegration = new MessagesIntelligenceCrewIntegration();
    const crewMembers = crewIntegration.getAvailableCrewMembers();
    
    console.log('\n🖖 Available Alex AI Crew Members:\n');
    
    crewMembers.forEach(member => {
      const capabilities = crewIntegration.getCrewMemberCapabilities(member);
      if (capabilities) {
        console.log(`👨‍✈️ ${member}`);
        console.log(`   Expertise: ${capabilities.expertise.join(', ')}`);
        console.log(`   Analysis Types: ${capabilities.analysisTypes.join(', ')}`);
        console.log(`   Personality: ${capabilities.personality}`);
        console.log('');
      }
    });
    
    crewIntegration.cleanup();
  });

// Default action - show help
program.action(() => {
  program.help();
});

// Parse command line arguments
program.parse();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
