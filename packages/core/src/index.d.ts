/**
 * Universal Alex AI Package
 *
 * Provides universal Alex AI functionality across all major IDEs and editors.
 * This package serves as the core integration layer for multi-IDE support.
 */
export { UniversalAlexAIManager } from './core/universal-alex-ai';
export type { UniversalAlexAI, IDEAdapter, ChatRequest, ChatResponse, CodeContext, CrewMember, AlexAIConfig, AlexAIStatus, IDESettings, FileContext, ProjectContext, CodeSuggestion, CodeAction, ChatMessage, IDEPosition, IDERange, IDEConfig } from './types/ide-types';
export { VSCodeAdapter } from './adapters/vscode-adapter';
export { CursorAdapter } from './adapters/cursor-adapter';
export { IntelliJAdapter } from './adapters/intellij-adapter';
export { SublimeAdapter } from './adapters/sublime-adapter';
export { VimAdapter } from './adapters/vim-adapter';
export { UniversalChatInterface } from './ui/chat-interface';
export { UniversalCodeActions } from './ui/code-actions';
export { UniversalSettingsManager } from './ui/settings-manager';
export { createUniversalAlexAI } from './core/universal-alex-ai';
/**
 * Create a new Universal Alex AI instance
 */
export declare function createUniversalAlexAI(): UniversalAlexAIManager;
/**
 * Default configuration for Universal Alex AI
 */
export declare const DEFAULT_CONFIG: AlexAIConfig;
/**
 * Default IDE settings
 */
export declare const DEFAULT_IDE_SETTINGS: IDESettings;
//# sourceMappingURL=index.d.ts.map