/**
 * Cursor AI Integration Wrapper with DDD
 * 
 * Wraps Cursor chat interactions with automatic DDD memory storage
 */

const { CursorDDDIntegration } = require('@alex-ai/shared-utilities/cursor-integration');

class CursorChatWithDDD {
  constructor() {
    this.dddIntegration = new CursorDDDIntegration();
  }
  
  /**
   * Handle Cursor chat with automatic DDD storage
   */
  async handleChat(userMessage, assistantResponse, metadata = {}) {
    // Store chat session automatically
    const chatContent = `User: ${userMessage}\n\nAssistant: ${assistantResponse}`;
    
    await this.dddIntegration.storeChatSession(chatContent, {
      ...metadata,
      title: metadata.title || 'Cursor AI Chat Interaction'
    });
    
    return assistantResponse;
  }
}

module.exports = { CursorChatWithDDD };
