/**
 * Universal IDE Types
 *
 * Defines common interfaces and types for multi-IDE support
 */
export interface IDEPosition {
    line: number;
    character: number;
}
export interface IDERange {
    start: IDEPosition;
    end: IDEPosition;
}
export interface FileContext {
    filePath: string;
    language: string;
    content: string;
    selection?: IDERange;
    cursorPosition?: IDEPosition;
}
export interface ProjectContext {
    workspacePath: string;
    projectType: string;
    dependencies: string[];
    files: string[];
    gitInfo?: {
        branch: string;
        hasChanges: boolean;
    };
}
export interface CodeContext {
    filePath?: string;
    language?: string;
    content?: string;
    selection?: IDERange;
    projectType?: string;
    dependencies?: string[];
    workspacePath?: string;
}
export interface IDESettings {
    apiUrl: string;
    apiKey: string;
    defaultCrewMember: string;
    enableContextAwareness: boolean;
    maxContextLength: number;
    theme: 'light' | 'dark' | 'auto';
    language: string;
}
export interface IDEConfig {
    ideType: string;
    version: string;
    capabilities: string[];
    settings: IDESettings;
}
export interface CodeSuggestion {
    id: string;
    type: 'completion' | 'refactor' | 'optimize' | 'explain';
    title: string;
    description: string;
    code: string;
    range: IDERange;
    confidence: number;
}
export interface CodeAction {
    id: string;
    type: 'refactor' | 'optimize' | 'explain' | 'generate' | 'fix';
    title: string;
    description: string;
    code?: string;
    range?: IDERange;
    priority: 'low' | 'medium' | 'high';
}
export interface ChatMessage {
    id: string;
    type: 'user' | 'assistant' | 'system' | 'error';
    content: string;
    timestamp: string;
    crewMember?: string;
    suggestions?: string[];
    codeActions?: CodeAction[];
}
export interface ChatRequest {
    message: string;
    context?: CodeContext;
    crewMember?: string;
    timestamp?: string;
}
export interface ChatResponse {
    response: string;
    crewMember: string;
    timestamp: string;
    suggestions?: string[];
    codeActions?: CodeAction[];
}
export interface CrewMember {
    id: string;
    name: string;
    department: string;
    specialization: string;
    personality: string;
    capabilities: string[];
    avatar?: string;
}
export interface AlexAIConfig {
    environment: 'development' | 'staging' | 'production';
    enableN8NIntegration: boolean;
    enableStealthScraping: boolean;
    enableCrewManagement: boolean;
    enableTesting: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export interface AlexAIStatus {
    isInitialized: boolean;
    isConnected: boolean;
    activeCrewMember: string;
    lastActivity: string;
    messageCount: number;
    errorCount: number;
}
export interface IDEAdapter {
    initialize(config: IDEConfig): Promise<void>;
    showChatPanel(): Promise<void>;
    hideChatPanel(): Promise<void>;
    updateChatPanel(message: ChatMessage): Promise<void>;
    getCurrentFile(): Promise<FileContext | null>;
    getSelectedCode(): Promise<CodeContext | null>;
    getProjectContext(): Promise<ProjectContext | null>;
    insertCode(code: string, position: IDEPosition): Promise<void>;
    replaceCode(code: string, range: IDERange): Promise<void>;
    showSuggestion(suggestion: CodeSuggestion): Promise<void>;
    getSettings(): Promise<IDESettings>;
    updateSettings(settings: IDESettings): Promise<void>;
    onFileChange(callback: (file: FileContext) => void): void;
    onSelectionChange(callback: (selection: CodeContext) => void): void;
    onProjectChange(callback: (project: ProjectContext) => void): void;
    dispose(): Promise<void>;
}
export interface UniversalAlexAI {
    initialize(config: AlexAIConfig): Promise<void>;
    getStatus(): Promise<AlexAIStatus>;
    sendMessage(request: ChatRequest): Promise<ChatResponse>;
    getCrewMembers(): Promise<CrewMember[]>;
    explainCode(code: string, context: CodeContext): Promise<ChatResponse>;
    generateCode(prompt: string, context: CodeContext): Promise<ChatResponse>;
    refactorCode(code: string, context: CodeContext): Promise<ChatResponse>;
    optimizeCode(code: string, context: CodeContext): Promise<ChatResponse>;
    getCurrentContext(): Promise<CodeContext>;
    updateContext(context: CodeContext): Promise<void>;
    updateSettings(settings: IDESettings): Promise<void>;
    getSettings(): Promise<IDESettings>;
    registerAdapter(ideType: string, adapter: IDEAdapter): void;
    getActiveAdapter(): IDEAdapter | null;
    dispose(): Promise<void>;
}
//# sourceMappingURL=ide-types.d.ts.map