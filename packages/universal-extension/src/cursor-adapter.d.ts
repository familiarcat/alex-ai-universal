/**
 * Cursor Adapter - Cursor-specific implementation
 *
 * Adapts the universal extension core to Cursor's API
 */
import { UniversalExtensionCore, ExtensionAPI, ExtensionContext } from './extension-core';
interface CursorAI {
    showChat: (message: string) => void;
    showStatus: (status: string) => void;
    showError: (error: string) => void;
    showInput: (prompt: string, placeholder?: string) => Promise<string | undefined>;
    showQuickPick: (items: string[], placeholder?: string) => Promise<string | undefined>;
    createDocument: (content: string, language?: string) => Promise<void>;
    insertText: (text: string) => Promise<void>;
    getActiveFile: () => Promise<ExtensionContext['activeFile'] | undefined>;
    getWorkspacePath: () => Promise<string>;
    getProjectType: () => Promise<string>;
    getDependencies: () => Promise<string[]>;
}
export declare class CursorAdapter implements ExtensionAPI {
    private cursorAI;
    constructor(cursorAI: CursorAI);
    showMessage(message: string, type?: 'info' | 'warning' | 'error'): Promise<void>;
    showInputBox(prompt: string, placeholder?: string): Promise<string | undefined>;
    showQuickPick(items: string[], placeholder?: string): Promise<string | undefined>;
    createDocument(content: string, language?: string): Promise<void>;
    insertText(text: string): Promise<void>;
    getActiveFile(): Promise<ExtensionContext['activeFile'] | undefined>;
    getWorkspacePath(): Promise<string>;
    getProjectType(): Promise<string>;
    getDependencies(): Promise<string[]>;
}
export declare function createCursorExtension(cursorAI: CursorAI): {
    core: UniversalExtensionCore;
    commands: {
        engage(): Promise<string>;
        status(): Promise<string>;
        crew(): Promise<string>;
        quickChat(): Promise<string>;
    };
};
export {};
//# sourceMappingURL=cursor-adapter.d.ts.map