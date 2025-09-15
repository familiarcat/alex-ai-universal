/**
 * Universal Alex AI - Multi-IDE Support
 *
 * Provides a universal interface for Alex AI across all major IDEs and editors.
 * This is the core package that IDE-specific adapters will use.
 */
import { UniversalAlexAI, IDEAdapter, ChatRequest, ChatResponse, CodeContext, CrewMember, AlexAIConfig, AlexAIStatus, IDESettings } from '../types/ide-types';
export declare class UniversalAlexAIManager implements UniversalAlexAI {
    private alexAIManager;
    private adapters;
    private activeAdapter;
    private isInitialized;
    constructor();
    /**
     * Initialize Alex AI with configuration
     */
    initialize(config: AlexAIConfig): Promise<void>;
    /**
     * Get current status
     */
    getStatus(): Promise<AlexAIStatus>;
    /**
     * Send a chat message
     */
    sendMessage(request: ChatRequest): Promise<ChatResponse>;
    /**
     * Get available crew members
     */
    getCrewMembers(): Promise<CrewMember[]>;
    /**
     * Explain code
     */
    explainCode(code: string, context: CodeContext): Promise<ChatResponse>;
    /**
     * Generate code from prompt
     */
    generateCode(prompt: string, context: CodeContext): Promise<ChatResponse>;
    /**
     * Refactor code
     */
    refactorCode(code: string, context: CodeContext): Promise<ChatResponse>;
    /**
     * Optimize code
     */
    optimizeCode(code: string, context: CodeContext): Promise<ChatResponse>;
    /**
     * Get current context from active adapter
     */
    getCurrentContext(): Promise<CodeContext>;
    /**
     * Update context (not typically used, but available for future features)
     */
    updateContext(context: CodeContext): Promise<void>;
    /**
     * Update settings
     */
    updateSettings(settings: IDESettings): Promise<void>;
    /**
     * Get current settings
     */
    getSettings(): Promise<IDESettings>;
    /**
     * Register an IDE adapter
     */
    registerAdapter(ideType: string, adapter: IDEAdapter): void;
    /**
     * Get the currently active adapter
     */
    getActiveAdapter(): IDEAdapter | null;
    /**
     * Set the active adapter
     */
    setActiveAdapter(ideType: string): void;
    /**
     * Select appropriate crew member based on message and context
     */
    private selectCrewMember;
    /**
     * Get crew member avatar
     */
    private getCrewAvatar;
    /**
     * Get default crew members (fallback)
     */
    private getDefaultCrewMembers;
    /**
     * Cleanup and dispose
     */
    dispose(): Promise<void>;
}
//# sourceMappingURL=universal-alex-ai.d.ts.map