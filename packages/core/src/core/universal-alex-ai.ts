/**
 * Universal Alex AI - Multi-IDE Support
 * 
 * Provides a universal interface for Alex AI across all major IDEs and editors.
 * This is the core package that IDE-specific adapters will use.
 */

import { AlexAIManager } from '@alex-ai/core';
import { 
  UniversalAlexAI, 
  IDEAdapter, 
  ChatRequest, 
  ChatResponse, 
  CodeContext, 
  CrewMember, 
  AlexAIConfig, 
  AlexAIStatus, 
  IDESettings 
} from '../types/ide-types';

export class UniversalAlexAIManager implements UniversalAlexAI {
  private alexAIManager: AlexAIManager;
  private adapters: Map<string, IDEAdapter> = new Map();
  private activeAdapter: IDEAdapter | null = null;
  private isInitialized = false;

  constructor() {
    this.alexAIManager = AlexAIManager.getInstance();
  }

  /**
   * Initialize Alex AI with configuration
   */
  async initialize(config: AlexAIConfig): Promise<void> {
    try {
      await this.alexAIManager.initialize(config);
      this.isInitialized = true;
      console.log('Universal Alex AI initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Universal Alex AI:', error);
      throw error;
    }
  }

  /**
   * Get current status
   */
  async getStatus(): Promise<AlexAIStatus> {
    const coreStatus = await this.alexAIManager.getStatus();
    return {
      isInitialized: this.isInitialized,
      isConnected: coreStatus.isInitialized,
      activeCrewMember: 'Commander Data', // Default
      lastActivity: new Date().toISOString(),
      messageCount: 0, // Would track in real implementation
      errorCount: 0    // Would track in real implementation
    };
  }

  /**
   * Send a chat message
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    if (!this.isInitialized) {
      throw new Error('Alex AI not initialized');
    }

    try {
      // Get current context from active adapter
      const context = await this.getCurrentContext();
      
      // Select appropriate crew member based on request type
      const crewMember = this.selectCrewMember(request.message, context);
      
      // Send to Alex AI core
      const response = await this.alexAIManager.sendMessage({
        message: request.message,
        context: context,
        crewMember: crewMember,
        timestamp: request.timestamp || new Date().toISOString()
      });

      return {
        response: response.response,
        crewMember: response.crewMember,
        timestamp: response.timestamp,
        suggestions: response.suggestions,
        codeActions: response.codeActions
      };
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  /**
   * Get available crew members
   */
  async getCrewMembers(): Promise<CrewMember[]> {
    try {
      const crewManager = this.alexAIManager.getCrewManager();
      const members = crewManager.getCrewMembers();
      
      return members.map(member => ({
        id: member.id,
        name: member.name,
        department: member.department,
        specialization: member.specialization,
        personality: member.personality,
        capabilities: member.capabilities,
        avatar: this.getCrewAvatar(member.id)
      }));
    } catch (error) {
      console.error('Failed to get crew members:', error);
      return this.getDefaultCrewMembers();
    }
  }

  /**
   * Explain code
   */
  async explainCode(code: string, context: CodeContext): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: `Please explain this code:\n\n${code}`,
      context: context,
      crewMember: 'Commander Data' // Data is best for code analysis
    };
    
    return await this.sendMessage(request);
  }

  /**
   * Generate code from prompt
   */
  async generateCode(prompt: string, context: CodeContext): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: `Generate code for: ${prompt}`,
      context: context,
      crewMember: 'Commander William Riker' // Riker is best for implementation
    };
    
    return await this.sendMessage(request);
  }

  /**
   * Refactor code
   */
  async refactorCode(code: string, context: CodeContext): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: `Please refactor this code:\n\n${code}`,
      context: context,
      crewMember: 'Geordi La Forge' // Geordi is best for engineering
    };
    
    return await this.sendMessage(request);
  }

  /**
   * Optimize code
   */
  async optimizeCode(code: string, context: CodeContext): Promise<ChatResponse> {
    const request: ChatRequest = {
      message: `Please optimize this code:\n\n${code}`,
      context: context,
      crewMember: 'Dr. Beverly Crusher' // Dr. Crusher is best for optimization
    };
    
    return await this.sendMessage(request);
  }

  /**
   * Get current context from active adapter
   */
  async getCurrentContext(): Promise<CodeContext> {
    if (!this.activeAdapter) {
      return {};
    }

    try {
      const fileContext = await this.activeAdapter.getCurrentFile();
      const projectContext = await this.activeAdapter.getProjectContext();
      
      return {
        filePath: fileContext?.filePath,
        language: fileContext?.language,
        content: fileContext?.content,
        selection: fileContext?.selection,
        projectType: projectContext?.projectType,
        dependencies: projectContext?.dependencies,
        workspacePath: projectContext?.workspacePath
      };
    } catch (error) {
      console.error('Failed to get current context:', error);
      return {};
    }
  }

  /**
   * Update context (not typically used, but available for future features)
   */
  async updateContext(context: CodeContext): Promise<void> {
    // This could be used for future features like context persistence
    console.log('Context updated:', context);
  }

  /**
   * Update settings
   */
  async updateSettings(settings: IDESettings): Promise<void> {
    if (this.activeAdapter) {
      await this.activeAdapter.updateSettings(settings);
    }
  }

  /**
   * Get current settings
   */
  async getSettings(): Promise<IDESettings> {
    if (this.activeAdapter) {
      return await this.activeAdapter.getSettings();
    }
    
    // Return default settings
    return {
      apiUrl: 'http://localhost:3000',
      apiKey: '',
      defaultCrewMember: 'Commander Data',
      enableContextAwareness: true,
      maxContextLength: 4000,
      theme: 'auto',
      language: 'en'
    };
  }

  /**
   * Register an IDE adapter
   */
  registerAdapter(ideType: string, adapter: IDEAdapter): void {
    this.adapters.set(ideType, adapter);
    console.log(`Registered adapter for ${ideType}`);
  }

  /**
   * Get the currently active adapter
   */
  getActiveAdapter(): IDEAdapter | null {
    return this.activeAdapter;
  }

  /**
   * Set the active adapter
   */
  setActiveAdapter(ideType: string): void {
    const adapter = this.adapters.get(ideType);
    if (adapter) {
      this.activeAdapter = adapter;
      console.log(`Active adapter set to ${ideType}`);
    } else {
      throw new Error(`No adapter found for ${ideType}`);
    }
  }

  /**
   * Select appropriate crew member based on message and context
   */
  private selectCrewMember(message: string, context: CodeContext): string {
    const messageLower = message.toLowerCase();
    
    // Code analysis and explanation
    if (messageLower.includes('explain') || messageLower.includes('analyze') || messageLower.includes('what does')) {
      return 'Commander Data';
    }
    
    // Code generation and implementation
    if (messageLower.includes('generate') || messageLower.includes('create') || messageLower.includes('implement')) {
      return 'Commander William Riker';
    }
    
    // Security and testing
    if (messageLower.includes('security') || messageLower.includes('test') || messageLower.includes('vulnerability')) {
      return 'Lieutenant Worf';
    }
    
    // Performance and optimization
    if (messageLower.includes('optimize') || messageLower.includes('performance') || messageLower.includes('speed')) {
      return 'Dr. Beverly Crusher';
    }
    
    // Business and strategy
    if (messageLower.includes('business') || messageLower.includes('cost') || messageLower.includes('roi') || messageLower.includes('strategy')) {
      return 'Quark';
    }
    
    // User experience and design
    if (messageLower.includes('ui') || messageLower.includes('ux') || messageLower.includes('design') || messageLower.includes('user')) {
      return 'Counselor Deanna Troi';
    }
    
    // Integration and engineering
    if (messageLower.includes('integrate') || messageLower.includes('connect') || messageLower.includes('api') || messageLower.includes('system')) {
      return 'Geordi La Forge';
    }
    
    // Communication and documentation
    if (messageLower.includes('document') || messageLower.includes('communicate') || messageLower.includes('message')) {
      return 'Lieutenant Uhura';
    }
    
    // Strategic planning and leadership
    if (messageLower.includes('plan') || messageLower.includes('strategy') || messageLower.includes('lead') || messageLower.includes('decide')) {
      return 'Captain Jean-Luc Picard';
    }
    
    // Default to Data for general code assistance
    return 'Commander Data';
  }

  /**
   * Get crew member avatar
   */
  private getCrewAvatar(crewId: string): string {
    const avatars: Record<string, string> = {
      'captain-picard': '👨‍✈️',
      'commander-riker': '👨‍💼',
      'commander-data': '🤖',
      'geordi-la-forge': '👨‍🔧',
      'lieutenant-worf': '👨‍✈️',
      'dr-crusher': '👩‍⚕️',
      'counselor-troi': '👩‍💼',
      'lieutenant-uhura': '👩‍💻',
      'quark': '👨‍💼'
    };
    
    return avatars[crewId] || '🤖';
  }

  /**
   * Get default crew members (fallback)
   */
  private getDefaultCrewMembers(): CrewMember[] {
    return [
      {
        id: 'captain-picard',
        name: 'Captain Jean-Luc Picard',
        department: 'Command',
        specialization: 'Strategic Planning',
        personality: 'Diplomatic, strategic, and wise leader',
        capabilities: ['Strategic planning', 'Decision making', 'Mission command'],
        avatar: '👨‍✈️'
      },
      {
        id: 'commander-riker',
        name: 'Commander William Riker',
        department: 'Tactical',
        specialization: 'Tactical Execution',
        personality: 'Confident, tactical, and decisive',
        capabilities: ['Code implementation', 'Workflow management', 'Tactical execution'],
        avatar: '👨‍💼'
      },
      {
        id: 'commander-data',
        name: 'Commander Data',
        department: 'Operations',
        specialization: 'Data Analysis',
        personality: 'Logical, analytical, and precise',
        capabilities: ['Code analysis', 'Logic operations', 'Data processing'],
        avatar: '🤖'
      },
      {
        id: 'geordi-la-forge',
        name: 'Geordi La Forge',
        department: 'Engineering',
        specialization: 'System Integration',
        personality: 'Innovative, technical, and problem-solving',
        capabilities: ['System integration', 'Infrastructure', 'Technical solutions'],
        avatar: '👨‍🔧'
      },
      {
        id: 'lieutenant-worf',
        name: 'Lieutenant Worf',
        department: 'Security',
        specialization: 'Security & Testing',
        personality: 'Honorable, security-focused, and disciplined',
        capabilities: ['Security analysis', 'Testing', 'Risk assessment'],
        avatar: '👨‍✈️'
      },
      {
        id: 'dr-crusher',
        name: 'Dr. Beverly Crusher',
        department: 'Medical',
        specialization: 'Performance Optimization',
        personality: 'Caring, analytical, and health-focused',
        capabilities: ['Performance optimization', 'Health diagnostics', 'System monitoring'],
        avatar: '👩‍⚕️'
      },
      {
        id: 'counselor-troi',
        name: 'Counselor Deanna Troi',
        department: 'Counseling',
        specialization: 'User Experience',
        personality: 'Empathetic, user-focused, and intuitive',
        capabilities: ['User experience', 'Quality assurance', 'Empathy analysis'],
        avatar: '👩‍💼'
      },
      {
        id: 'lieutenant-uhura',
        name: 'Lieutenant Uhura',
        department: 'Communications',
        specialization: 'Automation',
        personality: 'Communicative, organized, and efficient',
        capabilities: ['Workflow automation', 'Communications', 'I/O operations'],
        avatar: '👩‍💻'
      },
      {
        id: 'quark',
        name: 'Quark',
        department: 'Business',
        specialization: 'Business Analysis',
        personality: 'Entrepreneurial, profit-focused, and strategic',
        capabilities: ['Business analysis', 'ROI optimization', 'Budget analysis'],
        avatar: '👨‍💼'
      }
    ];
  }

  /**
   * Cleanup and dispose
   */
  async dispose(): Promise<void> {
    for (const [ideType, adapter] of this.adapters) {
      try {
        await adapter.dispose();
        console.log(`Disposed adapter for ${ideType}`);
      } catch (error) {
        console.error(`Failed to dispose adapter for ${ideType}:`, error);
      }
    }
    
    this.adapters.clear();
    this.activeAdapter = null;
    this.isInitialized = false;
  }
}














