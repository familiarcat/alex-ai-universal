/**
 * Universal Extension Core - Shared Code for VSCode and Cursor
 * 
 * This is the single source of truth for all IDE extensions
 */

import { UniversalAlexAIManager, AlexAIConfig } from '@alex-ai/core';

export interface ExtensionContext {
  workspacePath: string;
  activeFile?: {
    path: string;
    content: string;
    language: string;
    selection?: {
      start: number;
      end: number;
    };
  };
  projectType: string;
  dependencies: string[];
}

export interface ExtensionAPI {
  showMessage: (message: string, type?: 'info' | 'warning' | 'error') => void;
  showInputBox: (prompt: string, placeholder?: string) => Promise<string | undefined>;
  showQuickPick: (items: string[], placeholder?: string) => Promise<string | undefined>;
  createDocument: (content: string, language?: string) => Promise<void>;
  insertText: (text: string) => Promise<void>;
  getActiveFile: () => Promise<ExtensionContext['activeFile'] | undefined>;
  getWorkspacePath: () => Promise<string>;
  getProjectType: () => Promise<string>;
  getDependencies: () => Promise<string[]>;
}

export class UniversalExtensionCore {
  private alexAI: UniversalAlexAIManager;
  private isInitialized = false;
  private extensionAPI: ExtensionAPI;

  constructor(extensionAPI: ExtensionAPI) {
    this.alexAI = new UniversalAlexAIManager();
    this.extensionAPI = extensionAPI;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const config: AlexAIConfig = {
        environment: 'development',
        enableN8NIntegration: true,
        enableStealthScraping: true,
        enableCrewManagement: true,
        enableTesting: true,
        logLevel: 'info'
      };

      await this.alexAI.initialize(config);
      this.isInitialized = true;
      console.log('✅ Universal Extension Core initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Universal Extension Core:', error);
      throw error;
    }
  }

  async engage(): Promise<void> {
    await this.initialize();

    try {
      const context = await this.getCurrentContext();
      const userMessage = await this.extensionAPI.showInputBox(
        'What would you like the crew to help you with?',
        'Ask the crew anything...'
      );

      if (!userMessage) return;

      const response = await this.alexAI.sendMessage({
        message: userMessage,
        context: context
      });

      // Show response in a new document
      const responseContent = `# Alex AI Response - ${response.crewMember}

${response.response}

**Timestamp:** ${response.timestamp}

${response.suggestions && response.suggestions.length > 0 ? 
  `## Suggestions\n\n${response.suggestions.map((s: string) => `- ${s}`).join('\n')}` : ''}

${response.codeActions && response.codeActions.length > 0 ? 
  `## Available Actions\n\n${response.codeActions.map((a: any) => `- **${a.title}**: ${a.description}`).join('\n')}` : ''}`;

      await this.extensionAPI.createDocument(responseContent, 'markdown');

      if (response.suggestions && response.suggestions.length > 0) {
        this.extensionAPI.showMessage(
          `Alex AI has ${response.suggestions.length} suggestions for you!`,
          'info'
        );
      }

    } catch (error) {
      this.extensionAPI.showMessage(
        `Alex AI Error: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
    }
  }

  async showStatus(): Promise<void> {
    await this.initialize();

    try {
      const status = await this.alexAI.getStatus();
      const context = await this.getCurrentContext();
      
      const statusContent = `# Alex AI Status Report

## System Status
- **Initialized:** ${status.isInitialized ? '✅ Yes' : '❌ No'}
- **Connected:** ${status.isConnected ? '✅ Yes' : '❌ No'}
- **Active Crew:** ${status.activeCrewMember}
- **Last Activity:** ${new Date(status.lastActivity).toLocaleString()}
- **Messages:** ${status.messageCount}
- **Errors:** ${status.errorCount}

## Project Context
- **Workspace:** ${context.workspacePath}
- **Project Type:** ${context.projectType}
- **Dependencies:** ${context.dependencies.length} packages
- **Active File:** ${context.activeFile?.path || 'None'}

## Available Crew Members
${(await this.alexAI.getCrewMembers()).map(member => 
  `- **${member.name}** - ${member.department} (${member.specialization})`
).join('\n')}`;

      await this.extensionAPI.createDocument(statusContent, 'markdown');

    } catch (error) {
      this.extensionAPI.showMessage(
        `Status Error: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
    }
  }

  async showCrew(): Promise<void> {
    await this.initialize();

    try {
      const crewMembers = await this.alexAI.getCrewMembers();
      const crewList = crewMembers.map(member => 
        `## ${member.name}
- **Department:** ${member.department}
- **Specialization:** ${member.specialization}
- **Capabilities:** ${member.capabilities.join(', ')}
- **Avatar:** ${member.avatar || '🤖'}

---`
      ).join('\n');

      const crewContent = `# Alex AI Crew Members

${crewList}

## How to Use
1. Use the command palette to "Engage Alex AI"
2. Ask questions or request help
3. The crew will automatically select the best member for your task
4. Each crew member has unique expertise and personality`;

      await this.extensionAPI.createDocument(crewContent, 'markdown');

    } catch (error) {
      this.extensionAPI.showMessage(
        `Crew Error: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
    }
  }

  async quickChat(): Promise<void> {
    await this.initialize();

    try {
      const context = await this.getCurrentContext();
      const userMessage = await this.extensionAPI.showInputBox(
        'Quick question for the crew:',
        'Type your question...'
      );

      if (!userMessage) return;

      const response = await this.alexAI.sendMessage({
        message: userMessage,
        context: context
      });

      this.extensionAPI.showMessage(
        `[${response.crewMember}] ${response.response}`,
        'info'
      );

    } catch (error) {
      this.extensionAPI.showMessage(
        `Quick Chat Error: ${error instanceof Error ? error.message : String(error)}`,
        'error'
      );
    }
  }

  private async getCurrentContext(): Promise<ExtensionContext> {
    const workspacePath = await this.extensionAPI.getWorkspacePath();
    const activeFile = await this.extensionAPI.getActiveFile();
    const projectType = await this.extensionAPI.getProjectType();
    const dependencies = await this.extensionAPI.getDependencies();

    return {
      workspacePath,
      activeFile,
      projectType,
      dependencies
    };
  }

  async getCrewMembers() {
    await this.initialize();
    return await this.alexAI.getCrewMembers();
  }

  async getStatus() {
    await this.initialize();
    return await this.alexAI.getStatus();
  }
}
