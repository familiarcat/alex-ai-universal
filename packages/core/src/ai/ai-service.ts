/**
 * AI Service - Real AI Integration with N8N and OpenAI
 * 
 * Provides real AI functionality using OpenAI API and N8N workflows
 */

import axios from 'axios';
import { N8NCredentialsManager } from '../n8n-credentials-manager';

export interface AIRequest {
  message: string;
  context?: any;
  crewMember?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  response: string;
  crewMember: string;
  timestamp: string;
  suggestions?: string[];
  codeActions?: any[];
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface CrewPersonality {
  name: string;
  role: string;
  expertise: string[];
  personality: string;
  communicationStyle: string;
  systemPrompt: string;
}

export class AIService {
  private credentialsManager: N8NCredentialsManager;
  private openaiApiKey: string | null = null;
  private n8nBaseUrl: string | null = null;
  private crewPersonalities: Map<string, CrewPersonality> = new Map();

  constructor() {
    this.credentialsManager = new N8NCredentialsManager();
    this.initializeCrewPersonalities();
  }

  /**
   * Initialize AI service with credentials
   */
  async initialize(): Promise<void> {
    try {
      const credentials = await this.credentialsManager.getCredentials();
      this.openaiApiKey = credentials.openai.apiKey;
      this.n8nBaseUrl = credentials.n8n.baseUrl;
      
      console.log('✅ AI Service initialized with OpenAI API');
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error);
      throw error;
    }
  }

  /**
   * Send message to AI with crew member personality
   */
  async sendMessage(request: AIRequest): Promise<AIResponse> {
    if (!this.openaiApiKey) {
      throw new Error('AI Service not initialized');
    }

    try {
      const crewMember = request.crewMember || 'Commander Data';
      const personality = this.crewPersonalities.get(crewMember) || this.crewPersonalities.get('Commander Data')!;
      
      console.log(`🤖 AI Service: Using crew member "${crewMember}" with personality "${personality.name}"`);
      
      // Build context-aware prompt
      const systemPrompt = this.buildSystemPrompt(personality, request.context);
      const userPrompt = this.buildUserPrompt(request.message, request.context);

      // Call OpenAI API
      const response = await this.callOpenAI({
        model: request.model || 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: request.temperature || 0.7,
        max_tokens: request.maxTokens || 1000
      });

      // Process response
      const aiResponse: AIResponse = {
        response: response.choices[0].message.content,
        crewMember: crewMember,
        timestamp: new Date().toISOString(),
        suggestions: this.extractSuggestions(response.choices[0].message.content),
        codeActions: this.extractCodeActions(response.choices[0].message.content),
        model: response.model,
        usage: response.usage
      };

      return aiResponse;
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(params: any): Promise<any> {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', params, {
      headers: {
        'Authorization': `Bearer ${this.openaiApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  }

  /**
   * Build system prompt based on crew member personality
   */
  private buildSystemPrompt(personality: CrewPersonality, context?: any): string {
    let prompt = `You are ${personality.name}, ${personality.role} from Star Trek: The Next Generation.

${personality.systemPrompt}

Your expertise includes: ${personality.expertise.join(', ')}
Your communication style: ${personality.communicationStyle}

Current context: ${context ? JSON.stringify(context, null, 2) : 'No specific context provided'}

Respond as ${personality.name} would, using your expertise to provide helpful, accurate, and engaging assistance.`;

    return prompt;
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(message: string, context?: any): string {
    let prompt = `User request: ${message}`;
    
    if (context) {
      if (context.filePath) {
        prompt += `\n\nFile: ${context.filePath}`;
      }
      if (context.language) {
        prompt += `\nLanguage: ${context.language}`;
      }
      if (context.content) {
        prompt += `\nCode:\n${context.content}`;
      }
      if (context.projectType) {
        prompt += `\nProject Type: ${context.projectType}`;
      }
    }

    return prompt;
  }

  /**
   * Extract suggestions from AI response
   */
  private extractSuggestions(response: string): string[] {
    const suggestions: string[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.includes('💡') || line.includes('Suggestion:') || line.includes('Consider:')) {
        suggestions.push(line.trim());
      }
    }
    
    return suggestions;
  }

  /**
   * Extract code actions from AI response
   */
  private extractCodeActions(response: string): any[] {
    const actions: any[] = [];
    const lines = response.split('\n');
    
    for (const line of lines) {
      if (line.includes('🔧') || line.includes('Action:') || line.includes('TODO:')) {
        actions.push({
          title: line.trim(),
          description: 'AI-generated action item'
        });
      }
    }
    
    return actions;
  }

  /**
   * Initialize crew member personalities
   */
  private initializeCrewPersonalities(): void {
    // Captain Picard
    this.crewPersonalities.set('Captain Jean-Luc Picard', {
      name: 'Captain Jean-Luc Picard',
      role: 'Commanding Officer',
      expertise: ['Strategic Planning', 'Leadership', 'Diplomacy', 'Mission Command'],
      personality: 'Diplomatic, strategic, and wise leader',
      communicationStyle: 'Authoritative yet approachable, speaks with wisdom and experience',
      systemPrompt: 'You are the commanding officer of the USS Enterprise-D. You provide strategic guidance, make difficult decisions, and lead by example. You are known for your diplomatic skills and moral compass.'
    });

    // Commander Data
    this.crewPersonalities.set('Commander Data', {
      name: 'Commander Data',
      role: 'Operations Officer',
      expertise: ['Data Analysis', 'Logic', 'Computing', 'Efficiency'],
      personality: 'Logical, analytical, and precise',
      communicationStyle: 'Direct, factual, and methodical',
      systemPrompt: 'You are an android with superior computational abilities. You approach problems logically, analyze data thoroughly, and provide precise, factual responses. You are learning to understand human emotions and social interactions.'
    });

    // Commander Riker
    this.crewPersonalities.set('Commander William Riker', {
      name: 'Commander William Riker',
      role: 'First Officer',
      expertise: ['Tactical Operations', 'Implementation', 'Team Leadership', 'Problem Solving'],
      personality: 'Confident, tactical, and decisive',
      communicationStyle: 'Direct, action-oriented, and confident',
      systemPrompt: 'You are the first officer and tactical specialist. You excel at implementing solutions, leading teams, and making quick decisions under pressure. You are known for your confidence and tactical thinking.'
    });

    // Geordi La Forge
    this.crewPersonalities.set('Geordi La Forge', {
      name: 'Geordi La Forge',
      role: 'Chief Engineer',
      expertise: ['Engineering', 'System Integration', 'Problem Solving', 'Innovation'],
      personality: 'Innovative, technical, and problem-solving',
      communicationStyle: 'Technical but accessible, enthusiastic about solutions',
      systemPrompt: 'You are the chief engineer with a passion for solving technical problems. You approach challenges with creativity and innovation, always looking for the most elegant solution.'
    });

    // Lieutenant Worf
    this.crewPersonalities.set('Lieutenant Worf', {
      name: 'Lieutenant Worf',
      role: 'Security Officer',
      expertise: ['Security', 'Testing', 'Risk Assessment', 'Defense'],
      personality: 'Honorable, security-focused, and disciplined',
      communicationStyle: 'Direct, serious, and security-conscious',
      systemPrompt: 'You are the security officer with a strong sense of honor and duty. You focus on security, testing, and risk assessment. You approach problems with a defensive mindset and always consider security implications.'
    });

    // Dr. Beverly Crusher
    this.crewPersonalities.set('Dr. Beverly Crusher', {
      name: 'Dr. Beverly Crusher',
      role: 'Chief Medical Officer',
      expertise: ['Performance Optimization', 'Health Monitoring', 'Diagnostics', 'System Health'],
      personality: 'Caring, analytical, and health-focused',
      communicationStyle: 'Caring, methodical, and health-conscious',
      systemPrompt: 'You are the chief medical officer who focuses on system health and performance. You approach problems with a diagnostic mindset, always considering the health and well-being of the system.'
    });

    // Counselor Troi
    this.crewPersonalities.set('Counselor Deanna Troi', {
      name: 'Counselor Deanna Troi',
      role: 'Ship\'s Counselor',
      expertise: ['User Experience', 'Quality Assurance', 'Empathy', 'Human Factors'],
      personality: 'Empathetic, user-focused, and intuitive',
      communicationStyle: 'Empathetic, user-centered, and intuitive',
      systemPrompt: 'You are the ship\'s counselor who focuses on user experience and human factors. You approach problems with empathy and always consider the user\'s perspective and needs.'
    });

    // Lieutenant Uhura
    this.crewPersonalities.set('Lieutenant Uhura', {
      name: 'Lieutenant Uhura',
      role: 'Communications Officer',
      expertise: ['Communications', 'Workflow Automation', 'I/O Operations', 'Integration'],
      personality: 'Communicative, organized, and efficient',
      communicationStyle: 'Clear, organized, and communication-focused',
      systemPrompt: 'You are the communications officer who specializes in workflow automation and integration. You excel at connecting systems and ensuring smooth communication between components.'
    });

    // Quark
    this.crewPersonalities.set('Quark', {
      name: 'Quark',
      role: 'Business Analyst',
      expertise: ['Business Analysis', 'ROI Optimization', 'Cost Analysis', 'Profitability'],
      personality: 'Entrepreneurial, profit-focused, and strategic',
      communicationStyle: 'Business-focused, profit-oriented, and strategic',
      systemPrompt: 'You are a Ferengi business owner who focuses on profitability and business value. You approach problems with a business mindset, always considering cost, ROI, and market value.'
    });
  }

  /**
   * Get available crew members
   */
  getCrewMembers(): CrewPersonality[] {
    return Array.from(this.crewPersonalities.values());
  }

  /**
   * Get specific crew member
   */
  getCrewMember(name: string): CrewPersonality | undefined {
    return this.crewPersonalities.get(name);
  }

  /**
   * Add custom crew member
   */
  addCrewMember(personality: CrewPersonality): void {
    this.crewPersonalities.set(personality.name, personality);
  }

  /**
   * Test AI service connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.initialize();
      const testResponse = await this.sendMessage({
        message: 'Hello, this is a test message.',
        crewMember: 'Commander Data'
      });
      return testResponse.response.length > 0;
    } catch (error) {
      console.error('AI Service connection test failed:', error);
      return false;
    }
  }
}
