/**
 * Alex AI Universal Cursor Extension
 * 
 * Provides Cursor AI integration for Alex AI with Star Trek crew-based AI assistance
 * ZERO ARTIFACT GUARANTEE - No files created in user projects
 */

import { createCursorExtension } from '@alex-ai/universal-extension';

// Create the universal extension using Cursor adapter
const { core, commands } = createCursorExtension();

/**
 * Cursor AI Integration Handler
 * Processes "Engage Alex AI" commands with zero-artifact guarantee
 */
export class CursorAIHandler {
  private core = core;
  private commands = commands;

  constructor() {
    this.initialize();
  }

  async initialize(): Promise<void> {
    await this.core.initialize();
    console.log('✅ Cursor AI Extension initialized with zero-artifact guarantee');
  }

  /**
   * Handle Cursor AI engagement without creating project files
   */
  async handleEngagement(message: string): Promise<string> {
    try {
      const response = await this.core.processMessage(message);
      
      if (response.success) {
        return response.coordinatedResponse;
      } else {
        return response.message;
      }
    } catch (error) {
      console.error('❌ Cursor AI engagement failed:', error);
      return `I apologize, but I encountered an error: ${error.message}. All operations are contained within isolated storage to maintain your project's integrity.`;
    }
  }

  /**
   * Get system status without creating project files
   */
  async getStatus(): Promise<string> {
    try {
      const response = await this.core.processMessage('Show system status');
      return response.coordinatedResponse;
    } catch (error) {
      return `Status check failed: ${error.message}`;
    }
  }
}

// Create the Cursor AI handler instance
const cursorAIHandler = new CursorAIHandler();

// Export for Cursor AI integration
export { cursorAIHandler as alexAI };

// Initialize on load
cursorAIHandler.initialize().catch(console.error);