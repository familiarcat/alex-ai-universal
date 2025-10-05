import * as readline from 'readline';
import { MessagesExporter } from './messages-exporter';
import { ConversationAnalyzer } from './conversation-analyzer';
import { Conversation, ExportOptions, CrewAnalysisRequest } from './types';
import { format, parse, subDays, subWeeks, subMonths } from 'date-fns';

export class NaturalLanguageInterface {
  private exporter: MessagesExporter;
  private analyzer: ConversationAnalyzer;
  private rl: readline.Interface;

  constructor() {
    this.exporter = new MessagesExporter();
    this.analyzer = new ConversationAnalyzer();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  /**
   * Start the natural language interface
   */
  async start(): Promise<void> {
    console.log('🖖 Alex AI Messages Intelligence - Natural Language Interface');
    console.log('Type your request in natural language, or "help" for examples\n');

    while (true) {
      const input = await this.prompt('Alex AI > ');
      
      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        break;
      }
      
      if (input.toLowerCase() === 'help') {
        this.showHelp();
        continue;
      }

      try {
        await this.processNaturalLanguageRequest(input);
      } catch (error) {
        console.error('❌ Error:', error instanceof Error ? error.message : 'Unknown error');
      }
    }

    this.exporter.close();
    this.rl.close();
  }

  /**
   * Process natural language requests
   */
  private async processNaturalLanguageRequest(input: string): Promise<void> {
    const request = this.parseNaturalLanguageRequest(input);
    
    switch (request.type) {
      case 'list':
        await this.listConversations();
        break;
      case 'export':
        await this.exportConversation(request.conversationId!, request.dateRange!);
        break;
      case 'analyze':
        await this.analyzeConversation(request.conversationId!, request.crewMember!, request.analysisType!, request.dateRange);
        break;
      case 'crew_analysis':
        await this.performCrewAnalysis(request.crewMember!, request.specificQuestions || []);
        break;
      default:
        console.log('❓ I didn\'t understand that request. Type "help" for examples.');
    }
  }

  /**
   * Parse natural language input into structured requests
   */
  private parseNaturalLanguageRequest(input: string): {
    type: 'list' | 'export' | 'analyze' | 'crew_analysis';
    conversationId?: string;
    crewMember?: string;
    analysisType?: 'strategic' | 'technical' | 'security' | 'business' | 'general';
    dateRange?: { start: Date; end: Date };
    specificQuestions?: string[];
  } {
    const lowerInput = input.toLowerCase();

    // List conversations
    if (lowerInput.includes('list') || lowerInput.includes('show') || lowerInput.includes('conversations')) {
      return { type: 'list' };
    }

    // Crew analysis requests
    if (lowerInput.includes('captain') || lowerInput.includes('picard')) {
      return this.parseCrewRequest('Captain Picard', input);
    }
    if (lowerInput.includes('data') || lowerInput.includes('commander data')) {
      return this.parseCrewRequest('Commander Data', input);
    }
    if (lowerInput.includes('worf')) {
      return this.parseCrewRequest('Worf', input);
    }
    if (lowerInput.includes('quark')) {
      return this.parseCrewRequest('Quark', input);
    }
    if (lowerInput.includes('geordi') || lowerInput.includes('la forge')) {
      return this.parseCrewRequest('Geordi La Forge', input);
    }
    if (lowerInput.includes('beverly') || lowerInput.includes('crusher')) {
      return this.parseCrewRequest('Beverly Crusher', input);
    }
    if (lowerInput.includes('deanna') || lowerInput.includes('troi')) {
      return this.parseCrewRequest('Deanna Troi', input);
    }
    if (lowerInput.includes('riker') || lowerInput.includes('william')) {
      return this.parseCrewRequest('William Riker', input);
    }
    if (lowerInput.includes('tasha') || lowerInput.includes('yar')) {
      return this.parseCrewRequest('Tasha Yar', input);
    }

    // Export requests
    if (lowerInput.includes('export') || lowerInput.includes('download')) {
      return this.parseExportRequest(input);
    }

    // Analysis requests
    if (lowerInput.includes('analyze') || lowerInput.includes('analysis')) {
      return this.parseAnalysisRequest(input);
    }

    return { type: 'list' };
  }

  /**
   * Parse crew-specific requests
   */
  private parseCrewRequest(crewMember: string, input: string): any {
    const lowerInput = input.toLowerCase();
    
    // Extract conversation identifier
    let conversationId: string | undefined;
    const conversations = lowerInput.match(/conversation with (\w+)/i) || 
                        lowerInput.match(/messages with (\w+)/i) ||
                        lowerInput.match(/chat with (\w+)/i);
    
    if (conversations) {
      conversationId = conversations[1];
    }

    // Extract date range
    const dateRange = this.extractDateRange(input);

    // Extract analysis type
    let analysisType: 'strategic' | 'technical' | 'security' | 'business' | 'general' = 'general';
    if (lowerInput.includes('strategic') || lowerInput.includes('strategy')) {
      analysisType = 'strategic';
    } else if (lowerInput.includes('technical') || lowerInput.includes('tech')) {
      analysisType = 'technical';
    } else if (lowerInput.includes('security') || lowerInput.includes('secure')) {
      analysisType = 'security';
    } else if (lowerInput.includes('business') || lowerInput.includes('cost') || lowerInput.includes('profit')) {
      analysisType = 'business';
    }

    // Extract specific questions
    const specificQuestions = this.extractSpecificQuestions(input);

    return {
      type: 'crew_analysis',
      crewMember,
      conversationId,
      analysisType,
      dateRange,
      specificQuestions
    };
  }

  /**
   * Parse export requests
   */
  private parseExportRequest(input: string): any {
    const lowerInput = input.toLowerCase();
    
    // Extract conversation identifier
    let conversationId: string | undefined;
    const conversations = lowerInput.match(/conversation with (\w+)/i) || 
                        lowerInput.match(/messages with (\w+)/i) ||
                        lowerInput.match(/chat with (\w+)/i);
    
    if (conversations) {
      conversationId = conversations[1];
    }

    // Extract date range
    const dateRange = this.extractDateRange(input);

    return {
      type: 'export',
      conversationId,
      dateRange
    };
  }

  /**
   * Parse analysis requests
   */
  private parseAnalysisRequest(input: string): any {
    const lowerInput = input.toLowerCase();
    
    // Extract conversation identifier
    let conversationId: string | undefined;
    const conversations = lowerInput.match(/conversation with (\w+)/i) || 
                        lowerInput.match(/messages with (\w+)/i) ||
                        lowerInput.match(/chat with (\w+)/i);
    
    if (conversations) {
      conversationId = conversations[1];
    }

    // Extract date range
    const dateRange = this.extractDateRange(input);

    // Extract analysis type
    let analysisType: 'strategic' | 'technical' | 'security' | 'business' | 'general' = 'general';
    if (lowerInput.includes('strategic') || lowerInput.includes('strategy')) {
      analysisType = 'strategic';
    } else if (lowerInput.includes('technical') || lowerInput.includes('tech')) {
      analysisType = 'technical';
    } else if (lowerInput.includes('security') || lowerInput.includes('secure')) {
      analysisType = 'security';
    } else if (lowerInput.includes('business') || lowerInput.includes('cost') || lowerInput.includes('profit')) {
      analysisType = 'business';
    }

    return {
      type: 'analyze',
      conversationId,
      analysisType,
      dateRange
    };
  }

  /**
   * Extract date range from natural language
   */
  private extractDateRange(input: string): { start: Date; end: Date } | undefined {
    const lowerInput = input.toLowerCase();
    const now = new Date();

    // Relative date ranges
    if (lowerInput.includes('last week')) {
      return {
        start: subWeeks(now, 1),
        end: now
      };
    }
    if (lowerInput.includes('last month')) {
      return {
        start: subMonths(now, 1),
        end: now
      };
    }
    if (lowerInput.includes('last 3 months')) {
      return {
        start: subMonths(now, 3),
        end: now
      };
    }
    if (lowerInput.includes('last 6 months')) {
      return {
        start: subMonths(now, 6),
        end: now
      };
    }
    if (lowerInput.includes('last year')) {
      return {
        start: subMonths(now, 12),
        end: now
      };
    }

    // Specific date patterns (simplified)
    const datePattern = /(\d{4}-\d{2}-\d{2})/g;
    const dates = input.match(datePattern);
    if (dates && dates.length >= 2) {
      return {
        start: new Date(dates[0]),
        end: new Date(dates[1])
      };
    }

    return undefined;
  }

  /**
   * Extract specific questions from input
   */
  private extractSpecificQuestions(input: string): string[] {
    const questions: string[] = [];
    
    // Look for question patterns
    const questionPatterns = [
      /what are the (.+?)\?/gi,
      /how did (.+?)\?/gi,
      /why did (.+?)\?/gi,
      /when did (.+?)\?/gi,
      /where did (.+?)\?/gi,
      /analyze (.+)/gi,
      /extract (.+)/gi,
      /find (.+)/gi
    ];

    questionPatterns.forEach(pattern => {
      const matches = input.match(pattern);
      if (matches) {
        questions.push(...matches);
      }
    });

    return questions;
  }

  /**
   * List available conversations
   */
  private async listConversations(): Promise<void> {
    console.log('\n📱 Fetching conversations...');
    
    try {
      const conversations = await this.exporter.getConversations();
      
      console.log(`\n📱 Available Conversations (${conversations.length}):\n`);
      
      conversations.forEach((conv, index) => {
        console.log(`${index + 1}. ${conv.name}`);
        console.log(`   Messages: ${conv.messageCount} | Last: ${format(conv.lastMessage, 'MMM d, yyyy, h:mm a')}`);
        console.log(`   Participants: ${conv.participants.join(', ')}`);
        console.log('');
      });
      
    } catch (error) {
      console.error('❌ Failed to fetch conversations:', error);
    }
  }

  /**
   * Export a conversation
   */
  private async exportConversation(conversationId: string, dateRange?: { start: Date; end: Date }): Promise<void> {
    console.log('\n📤 Exporting conversation...');
    
    try {
      const conversations = await this.exporter.getConversations();
      const conversation = conversations.find(c => 
        c.name.toLowerCase().includes(conversationId.toLowerCase()) ||
        c.id.includes(conversationId)
      );

      if (!conversation) {
        console.log('❌ Conversation not found. Use "list conversations" to see available options.');
        return;
      }

      // If no date range specified, ask user
      let startDate = dateRange?.start || conversation.firstMessage;
      let endDate = dateRange?.end || conversation.lastMessage;

      if (!dateRange) {
        console.log(`\n📅 Conversation Date Range:`);
        console.log(`First message: ${format(conversation.firstMessage, 'MMM d, yyyy, h:mm a')}`);
        console.log(`Last message: ${format(conversation.lastMessage, 'MMM d, yyyy, h:mm a')}`);
        
        const useAll = await this.prompt('\nExport all messages? (y/n): ');
        if (useAll.toLowerCase() !== 'y') {
          // Simplified date input - in a real implementation, you'd have a proper date picker
          console.log('Please specify date range in format: YYYY-MM-DD');
          const startInput = await this.prompt('Start date (YYYY-MM-DD): ');
          const endInput = await this.prompt('End date (YYYY-MM-DD): ');
          
          startDate = new Date(startInput);
          endDate = new Date(endInput);
        }
      }

      const outputDir = await this.prompt('\nOutput directory (press Enter for default): ') || 
                       require('os').homedir() + '/Documents/Messages_Exports';

      const options: ExportOptions = {
        conversationId: conversation.id,
        startDate,
        endDate,
        outputDirectory: outputDir,
        includeImages: true,
        format: 'both'
      };

      console.log('\n🔄 Processing export...');
      const result = await this.exporter.exportConversation(options);

      if (result.success) {
        console.log('\n✨ Export complete!');
        console.log(`📂 Files saved to: ${result.outputPath}`);
        console.log(`📄 Messages exported: ${result.messageCount}`);
        if (result.markdownPath) console.log(`📝 Markdown: ${result.markdownPath}`);
        if (result.pdfPath) console.log(`📋 PDF: ${result.pdfPath}`);
        if (result.imagesPath) console.log(`🖼️ Images: ${result.imagesPath}`);
      } else {
        console.log(`❌ Export failed: ${result.error}`);
      }

    } catch (error) {
      console.error('❌ Export error:', error);
    }
  }

  /**
   * Analyze a conversation
   */
  private async analyzeConversation(
    conversationId: string, 
    crewMember: string, 
    analysisType: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<void> {
    console.log(`\n🧠 ${crewMember} analyzing conversation...`);
    
    try {
      const conversations = await this.exporter.getConversations();
      const conversation = conversations.find(c => 
        c.name.toLowerCase().includes(conversationId.toLowerCase()) ||
        c.id.includes(conversationId)
      );

      if (!conversation) {
        console.log('❌ Conversation not found.');
        return;
      }

      const messages = await this.exporter.getMessages(
        conversation.id, 
        dateRange?.start, 
        dateRange?.end
      );

      const analysis = this.analyzer.analyzeConversation(conversation, messages);
      const crewAnalysis = this.analyzer.generateCrewAnalysis({
        crewMember,
        analysisType: analysisType as any,
        conversationId: conversation.id
      }, analysis);

      console.log('\n' + crewAnalysis);

    } catch (error) {
      console.error('❌ Analysis error:', error);
    }
  }

  /**
   * Perform crew analysis
   */
  private async performCrewAnalysis(crewMember: string, specificQuestions: string[]): Promise<void> {
    console.log(`\n🖖 ${crewMember} reporting for analysis...`);
    
    // This would integrate with the crew system to provide specialized analysis
    // For now, we'll provide a basic response
    console.log(`\n${crewMember} Analysis:\n`);
    
    switch (crewMember) {
      case 'Captain Picard':
        console.log('Strategic assessment: Analyzing conversation for leadership insights and strategic implications.');
        break;
      case 'Commander Data':
        console.log('Technical analysis: Processing conversation data for patterns and technical insights.');
        break;
      case 'Worf':
        console.log('Security evaluation: Assessing conversation for security implications and risk factors.');
        break;
      case 'Quark':
        console.log('Business analysis: Evaluating conversation for profit opportunities and cost efficiency.');
        break;
      default:
        console.log('General analysis: Processing conversation for comprehensive insights.');
    }

    if (specificQuestions.length > 0) {
      console.log('\nSpecific questions addressed:');
      specificQuestions.forEach((question, index) => {
        console.log(`${index + 1}. ${question}`);
      });
    }
  }

  /**
   * Show help information
   */
  private showHelp(): void {
    console.log(`
🖖 Alex AI Messages Intelligence - Natural Language Commands

📱 CONVERSATION MANAGEMENT:
  "list conversations" - Show all available conversations
  "show my messages" - List conversations

📤 EXPORT COMMANDS:
  "export conversation with John" - Export messages with John
  "download messages from last month" - Export recent messages
  "export chat with Sarah from 2024-01-01 to 2024-12-31" - Export specific date range

🧠 CREW ANALYSIS:
  "Captain Picard, analyze my conversation with the client" - Strategic analysis
  "Commander Data, extract technical details from my engineering chat" - Technical analysis
  "Worf, review my security conversations" - Security assessment
  "Quark, analyze my business negotiations for cost efficiency" - Business analysis

🔍 ANALYSIS TYPES:
  - Strategic: Leadership and strategic insights
  - Technical: Data patterns and technical details
  - Security: Security implications and risk assessment
  - Business: Cost-benefit and profit analysis
  - General: Comprehensive conversation analysis

📅 DATE RANGES:
  "last week", "last month", "last 3 months", "last 6 months", "last year"
  Or specify dates: "from 2024-01-01 to 2024-12-31"

❓ EXAMPLES:
  "Captain Picard, analyze my conversation with the client from last month"
  "Export my messages with John from last week"
  "Commander Data, what are the technical specifications mentioned?"
  "Quark, find all cost-related discussions in my business chat"

Type "exit" to quit.
`);
  }

  /**
   * Prompt for user input
   */
  private prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }
}
