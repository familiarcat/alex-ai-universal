export { MessagesExporter } from './messages-exporter';
export { ConversationAnalyzer } from './conversation-analyzer';
export { NaturalLanguageInterface } from './natural-language-interface';
export { SecurityProtocol, securityProtocol } from './security-protocol';
export { BidirectionalRAGIntegration } from './bidirectional-rag-integration';
export { CrewMultimodalAnalysis } from './crew-multimodal-analysis';
export { EnhancedMonitoringDashboard } from './enhanced-monitoring-dashboard';
export * from './types';

import { MessagesExporter } from './messages-exporter';
import { ConversationAnalyzer } from './conversation-analyzer';
import { NaturalLanguageInterface } from './natural-language-interface';

/**
 * Alex AI Messages Intelligence - Main Entry Point
 * 
 * This module provides comprehensive Apple Messages conversation analysis
 * and export capabilities integrated with the Alex AI Universal crew system.
 */

export class AlexAIMessagesIntelligence {
  private exporter: MessagesExporter;
  private analyzer: ConversationAnalyzer;
  private nli: NaturalLanguageInterface;

  constructor() {
    this.exporter = new MessagesExporter();
    this.analyzer = new ConversationAnalyzer();
    this.nli = new NaturalLanguageInterface();
  }

  /**
   * Start the natural language interface
   */
  async startInteractiveMode(): Promise<void> {
    return this.nli.start();
  }

  /**
   * Get the messages exporter instance
   */
  getExporter(): MessagesExporter {
    return this.exporter;
  }

  /**
   * Get the conversation analyzer instance
   */
  getAnalyzer(): ConversationAnalyzer {
    return this.analyzer;
  }

  /**
   * Get the natural language interface instance
   */
  getNaturalLanguageInterface(): NaturalLanguageInterface {
    return this.nli;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.exporter.close();
  }
}

/**
 * Default export for easy importing
 */
export default AlexAIMessagesIntelligence;

/**
 * CLI entry point
 */
if (require.main === module) {
  const messagesIntelligence = new AlexAIMessagesIntelligence();
  
  console.log('🖖 Alex AI Messages Intelligence - Starting...');
  console.log('Prime Directive: Zero-artifact guarantee active\n');
  
  messagesIntelligence.startInteractiveMode()
    .then(() => {
      console.log('\n🖖 Alex AI Messages Intelligence - Mission complete.');
      messagesIntelligence.cleanup();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Mission failed:', error);
      messagesIntelligence.cleanup();
      process.exit(1);
    });
}
