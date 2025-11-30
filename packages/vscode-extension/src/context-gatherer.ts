/**
 * Context Gatherer for Alex AI VS Code Extension
 * 
 * Implements O'Brien's pragmatic approach:
 * - Simple, efficient context gathering
 * - Current file awareness
 * - Workspace context
 * - No over-engineering
 * 
 * Implements Data's technical requirements:
 * - File system access via Workspace API
 * - Efficient memory management
 * - Context augmentation for RAG
 */

import * as vscode from 'vscode';

export interface FileContext {
    path: string;
    content: string;
    language: string;
    selection?: {
        start: { line: number; character: number };
        end: { line: number; character: number };
        text: string;
    };
}

export interface WorkspaceContext {
    files: FileContext[];
    workspaceRoot?: string;
    languageStats: Record<string, number>;
    totalFiles: number;
}

export class ContextGatherer {
    /**
     * Get current file context (O'Brien's MVP approach)
     */
    static getCurrentFileContext(): FileContext | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }

        const document = editor.document;
        const selection = editor.selection;
        
        let selectionText = '';
        if (selection && !selection.isEmpty) {
            selectionText = document.getText(selection);
        }

        return {
            path: document.fileName,
            content: document.getText(),
            language: document.languageId || 'plaintext',
            selection: selection && !selection.isEmpty ? {
                start: {
                    line: selection.start.line,
                    character: selection.start.character
                },
                end: {
                    line: selection.end.line,
                    character: selection.end.character
                },
                text: selectionText
            } : undefined
        };
    }

    /**
     * Get workspace context (limited to avoid performance issues)
     */
    static async getWorkspaceContext(maxFiles: number = 10): Promise<WorkspaceContext> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return {
                files: [],
                languageStats: {},
                totalFiles: 0
            };
        }

        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const files: FileContext[] = [];
        const languageStats: Record<string, number> = {};

        try {
            // Get all text files in workspace (limited for performance)
            const pattern = new vscode.RelativePattern(
                workspaceFolders[0],
                '**/*.{ts,tsx,js,jsx,py,go,rs,java,php,rb,cs,cpp,c,html,css,json,yaml,yml,md,txt}'
            );

            const fileUris = await vscode.workspace.findFiles(
                pattern,
                '**/node_modules/**',
                maxFiles
            );

            for (const uri of fileUris) {
                try {
                    const document = await vscode.workspace.openTextDocument(uri);
                    const content = document.getText();
                    const language = document.languageId || 'plaintext';

                    files.push({
                        path: uri.fsPath,
                        content: content.substring(0, 5000), // Limit content size
                        language
                    });

                    languageStats[language] = (languageStats[language] || 0) + 1;
                } catch (error) {
                    // Skip files that can't be read
                    console.warn(`Failed to read file ${uri.fsPath}:`, error);
                }
            }
        } catch (error) {
            console.error('Failed to gather workspace context:', error);
        }

        return {
            files,
            workspaceRoot,
            languageStats,
            totalFiles: files.length
        };
    }

    /**
     * Get relevant context for AI prompt (O'Brien's pragmatic approach)
     */
    static async getRelevantContext(includeWorkspace: boolean = false): Promise<string> {
        const currentFile = this.getCurrentFileContext();
        let context = '';

        if (currentFile) {
            context += `Current File: ${currentFile.path}\n`;
            context += `Language: ${currentFile.language}\n`;
            
            if (currentFile.selection) {
                context += `\nSelected Code:\n\`\`\`${currentFile.language}\n${currentFile.selection.text}\n\`\`\`\n`;
            } else {
                // Include surrounding lines if no selection
                const lines = currentFile.content.split('\n');
                const currentLine = vscode.window.activeTextEditor?.selection.active.line || 0;
                const start = Math.max(0, currentLine - 10);
                const end = Math.min(lines.length, currentLine + 10);
                context += `\nContext around cursor (lines ${start + 1}-${end}):\n\`\`\`${currentFile.language}\n${lines.slice(start, end).join('\n')}\n\`\`\`\n`;
            }
        }

        if (includeWorkspace) {
            const workspace = await this.getWorkspaceContext(5); // Limit to 5 files
            if (workspace.files.length > 0) {
                context += `\nWorkspace Context:\n`;
                context += `- Total files analyzed: ${workspace.totalFiles}\n`;
                context += `- Languages: ${Object.keys(workspace.languageStats).join(', ')}\n`;
                
                // Include first few relevant files
                for (const file of workspace.files.slice(0, 3)) {
                    context += `\n- ${file.path} (${file.language})\n`;
                }
            }
        }

        return context;
    }

    /**
     * Get minimal context for quick suggestions (O'Brien's quick wins)
     */
    static getMinimalContext(): string {
        const currentFile = this.getCurrentFileContext();
        if (!currentFile) {
            return '';
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return '';
        }

        const line = editor.document.lineAt(editor.selection.active.line);
        return `File: ${currentFile.path}\nLanguage: ${currentFile.language}\nCurrent line: ${line.text}`;
    }
}

