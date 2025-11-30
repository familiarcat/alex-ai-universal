/**
 * Universal Extension Core - Shared Code for VSCode and Cursor
 *
 * This is the single source of truth for all IDE extensions
 */
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
export declare class UniversalExtensionCore {
    private alexAI;
    private isInitialized;
    private extensionAPI;
    constructor(extensionAPI: ExtensionAPI);
    initialize(): Promise<void>;
    engage(): Promise<void>;
    showStatus(): Promise<void>;
    showCrew(): Promise<void>;
    quickChat(): Promise<void>;
    private getCurrentContext;
    getCrewMembers(): Promise<any>;
    getStatus(): Promise<any>;
}
//# sourceMappingURL=extension-core.d.ts.map