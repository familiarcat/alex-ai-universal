/**
 * Universal Alex AI Package
 * 
 * Provides universal Alex AI functionality across all major IDEs and editors.
 * This package serves as the core integration layer for multi-IDE support.
 */

// Core Universal Alex AI
export { UniversalAlexAIManager } from './core/universal-alex-ai';

// Types
export type {
  UniversalAlexAI,
  IDEAdapter,
  ChatRequest,
  ChatResponse,
  CodeContext,
  CrewMember,
  AlexAIConfig,
  AlexAIStatus,
  IDESettings,
  FileContext,
  ProjectContext,
  CodeSuggestion,
  CodeAction,
  ChatMessage,
  IDEPosition,
  IDERange,
  IDEConfig
} from './types/ide-types';

// Adapters (to be implemented)
export { VSCodeAdapter } from './adapters/vscode-adapter';
export { CursorAdapter } from './adapters/cursor-adapter';
export { IntelliJAdapter } from './adapters/intellij-adapter';
export { SublimeAdapter } from './adapters/sublime-adapter';
export { VimAdapter } from './adapters/vim-adapter';

// UI Components (to be implemented)
export { UniversalChatInterface } from './ui/chat-interface';
export { UniversalCodeActions } from './ui/code-actions';
export { UniversalSettingsManager } from './ui/settings-manager';

// Utility functions
export { createUniversalAlexAI } from './core/universal-alex-ai';

/**
 * Create a new Universal Alex AI instance
 */
export function createUniversalAlexAI(): UniversalAlexAIManager {
  return new UniversalAlexAIManager();
}

/**
 * Default configuration for Universal Alex AI
 */
export const DEFAULT_CONFIG: AlexAIConfig = {
  environment: 'development',
  enableN8NIntegration: true,
  enableStealthScraping: true,
  enableCrewManagement: true,
  enableTesting: true,
  logLevel: 'info'
};

/**
 * Default IDE settings
 */
export const DEFAULT_IDE_SETTINGS: IDESettings = {
  apiUrl: 'http://localhost:3000',
  apiKey: '',
  defaultCrewMember: 'Commander Data',
  enableContextAwareness: true,
  maxContextLength: 4000,
  theme: 'auto',
  language: 'en'
};














