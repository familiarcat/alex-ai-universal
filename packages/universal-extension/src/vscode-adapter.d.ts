/**
 * VSCode Adapter - VSCode-specific implementation
 *
 * Adapts the universal extension core to VSCode's API
 */
import * as vscode from 'vscode';
import { UniversalExtensionCore, ExtensionAPI, ExtensionContext } from './extension-core';
export declare class VSCodeAdapter implements ExtensionAPI {
    private extensionContext;
    constructor(extensionContext: vscode.ExtensionContext);
    showMessage(message: string, type?: 'info' | 'warning' | 'error'): Promise<void>;
    showInputBox(prompt: string, placeholder?: string): Promise<string | undefined>;
    showQuickPick(items: string[], placeholder?: string): Promise<string | undefined>;
    createDocument(content: string, language?: string): Promise<void>;
    insertText(text: string): Promise<void>;
    getActiveFile(): Promise<ExtensionContext['activeFile'] | undefined>;
    getWorkspacePath(): Promise<string>;
    getProjectType(): Promise<string>;
    getDependencies(): Promise<string[]>;
    private fileExists;
}
export declare function createVSCodeExtension(extensionContext: vscode.ExtensionContext): UniversalExtensionCore;
//# sourceMappingURL=vscode-adapter.d.ts.map