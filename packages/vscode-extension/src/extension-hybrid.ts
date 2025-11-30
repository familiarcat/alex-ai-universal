/**
 * Hybrid Alex AI Universal VSCode Extension
 * 
 * Combines existing functionality with enhanced crew-recommended modules
 * Maintains backward compatibility while adding new features
 */

import * as vscode from 'vscode';
import { createVSCodeExtension } from '@alex-ai/universal-extension';
import { ProviderTree } from './providerTree';
import { SecureApiClient } from './api-client';
import { ContextGatherer } from './context-gatherer';
import { ChatWebviewProvider } from './chat-webview';
import { MCPIntegration } from './mcp-integration';
import { RAGIntegration } from './rag-integration';

// Create the universal extension using VS Code adapter
const { core } = createVSCodeExtension(vscode);

// Enhanced modules (crew recommendations)
let apiClient: SecureApiClient | undefined;
let mcpIntegration: MCPIntegration | undefined;
let ragIntegration: RAGIntegration | undefined;
let chatWebview: ChatWebviewProvider | undefined;

function isErr(e: unknown): e is { message?: unknown } {
    return typeof e === 'object' && e !== null && 'message' in e;
}

/**
 * Initialize enhanced modules if enabled
 */
function initializeEnhancedModules(context: vscode.ExtensionContext): boolean {
    try {
        const useEnhanced = vscode.workspace.getConfiguration().get('alexAi.useEnhanced', true);
        
        if (!useEnhanced) {
            console.log('Enhanced modules disabled, using legacy core');
            return false;
        }

        // Initialize secure API client
        apiClient = new SecureApiClient(context.secrets, {
            mcpUrl: vscode.workspace.getConfiguration().get('alexAi.mcpUrl'),
            n8nUrl: vscode.workspace.getConfiguration().get('alexAi.n8nUrl'),
            supabaseUrl: vscode.workspace.getConfiguration().get('alexAi.supabaseUrl'),
            openRouterUrl: vscode.workspace.getConfiguration().get('alexAi.openRouterUrl')
        });

        // Initialize integrations
        mcpIntegration = new MCPIntegration(apiClient);
        ragIntegration = new RAGIntegration(apiClient);
        chatWebview = new ChatWebviewProvider(context);

        // Initialize MCP session (non-blocking)
        mcpIntegration.initialize().catch(err => {
            console.warn('MCP initialization failed:', err);
        });

        console.log('✅ Enhanced modules initialized (crew recommendations)');
        return true;
    } catch (error) {
        console.warn('Failed to initialize enhanced modules, falling back to legacy:', error);
        return false;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Alex AI Universal extension is now active!');

    // Initialize legacy core
    core.initialize().then(() => {
        console.log('✅ Alex AI Universal core initialized with zero-artifact guarantee');
    }).catch(console.error);

    // Initialize enhanced modules (crew recommendations)
    const enhancedEnabled = initializeEnhancedModules(context);

    // Register enhanced chat command (if enhanced modules available)
    if (enhancedEnabled && chatWebview) {
        const enhancedChatCommand = vscode.commands.registerCommand('alex-ai.openChat', async () => {
            const panel = chatWebview!.createOrReveal();
            
            chatWebview!.setMessageHandler(async (message) => {
                if (message.type === 'message') {
                    try {
                        const context = await ContextGatherer.getRelevantContext(true);
                        const augmentedPrompt = await ragIntegration!.augmentPrompt(message.text, context);
                        
                        const response = await mcpIntegration!.sendCrewMessage({
                            query: augmentedPrompt,
                            context,
                            priority: 'medium'
                        });

                        if (response.success && response.data) {
                            const crewResponse = (response.data as { response?: string }).response || 
                                               JSON.stringify(response.data);
                            chatWebview!.postMessage({
                                speaker: 'Alex AI',
                                text: crewResponse,
                                timestamp: Date.now()
                            });

                            const history = context.workspaceState.get<Array<{ speaker: string; text: string; timestamp?: number }>>('alexAi.chatHistory', []);
                            history.push({ speaker: 'You', text: message.text, timestamp: Date.now() });
                            history.push({ speaker: 'Alex AI', text: crewResponse, timestamp: Date.now() });
                            await context.workspaceState.update('alexAi.chatHistory', history);
                        } else {
                            chatWebview!.postMessage({
                                speaker: 'Alex AI',
                                text: `Error: ${response.error || 'Unknown error'}`,
                                timestamp: Date.now()
                            });
                        }
                    } catch (error) {
                        chatWebview!.postMessage({
                            speaker: 'Alex AI',
                            text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                            timestamp: Date.now()
                        });
                    }
                }
            });
        });

        context.subscriptions.push(enhancedChatCommand);
    }

    // Register legacy commands (for backward compatibility)
    const engageCommand = vscode.commands.registerCommand('alex-ai.engage', async () => {
        if (enhancedEnabled) {
            await vscode.commands.executeCommand('alex-ai.openChat');
            return;
        }

        // Legacy implementation
        const userInput = await vscode.window.showInputBox({
            prompt: 'Engage Alex AI',
            placeHolder: 'Ask the crew for assistance...'
        });

        if (userInput) {
            try {
                const response = await core.processMessage(userInput);

                if (response.success) {
                    const doc = await vscode.workspace.openTextDocument({
                        content: response.coordinatedResponse,
                        language: 'markdown'
                    });
                    await vscode.window.showTextDocument(doc);
                } else {
                    vscode.window.showErrorMessage(`Alex AI Error: ${response.message}`);
                }
            } catch (error: unknown) {
                const msg = isErr(error) && typeof error.message === 'string' ? error.message : String(error);
                vscode.window.showErrorMessage(`Alex AI Error: ${msg}`);
            }
        }
    });

    // Register enhanced suggest command
    const suggestCommand = vscode.commands.registerCommand('alex-ai.suggest', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file and select some code or place the cursor on a line to get suggestions');
            return;
        }

        if (enhancedEnabled && mcpIntegration && ragIntegration) {
            // Enhanced implementation
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Alex AI: Getting suggestion...',
                cancellable: false
            }, async (progress) => {
                try {
                    const context = ContextGatherer.getMinimalContext();
                    const currentFile = ContextGatherer.getCurrentFileContext();
                    
                    if (!currentFile) {
                        vscode.window.showErrorMessage('Could not get file context');
                        return;
                    }

                    const selection = editor.selection;
                    const selectedText = selection && !selection.isEmpty 
                        ? editor.document.getText(selection) 
                        : editor.document.lineAt(selection.active.line).text;

                    const prompt = `Provide a focused code suggestion or improved replacement for the following ${currentFile.language} snippet:\n\n${selectedText}`;
                    const augmentedPrompt = await ragIntegration.augmentPrompt(prompt, context);
                    
                    const response = await mcpIntegration.sendCrewMessage({
                        query: augmentedPrompt,
                        context,
                        crewMembers: ['data'],
                        priority: 'high'
                    });

                    if (response.success && response.data) {
                        const suggestion = (response.data as { response?: string }).response || 
                                         JSON.stringify(response.data);
                        
                        const apply = 'Apply suggestion';
                        const copy = 'Copy to clipboard';
                        const view = 'Open in new document';
                        const choice = await vscode.window.showInformationMessage('Alex AI suggestion ready', apply, copy, view);

                        if (choice === apply) {
                            await editor.edit(editBuilder => {
                                if (selection && !selection.isEmpty) {
                                    editBuilder.replace(selection, suggestion);
                                } else {
                                    const line = editor.document.lineAt(selection.active.line);
                                    editBuilder.replace(line.range, suggestion);
                                }
                            });
                            vscode.window.showInformationMessage('Applied Alex AI suggestion');
                        } else if (choice === copy) {
                            await vscode.env.clipboard.writeText(suggestion);
                            vscode.window.showInformationMessage('Suggestion copied to clipboard');
                        } else if (choice === view) {
                            const doc = await vscode.workspace.openTextDocument({ 
                                content: suggestion, 
                                language: currentFile.language 
                            });
                            await vscode.window.showTextDocument(doc, { preview: true });
                        }
                    } else {
                        vscode.window.showErrorMessage(`Suggestion failed: ${response.error || 'Unknown error'}`);
                    }
                } catch (error) {
                    vscode.window.showErrorMessage(`Alex AI Suggestion failed: ${error instanceof Error ? error.message : String(error)}`);
                }
            });
        } else {
            // Legacy implementation
            const selection = editor.selection;
            const selectedText = selection && !selection.isEmpty ? editor.document.getText(selection) : editor.document.lineAt(selection.active.line).text;
            const language = editor.document.languageId || 'text';

            const prompt = `Provide a focused code suggestion or improved replacement for the following ${language} snippet:\n\n${selectedText}`;

            try {
                const response = await core.processMessage(prompt);
                if (!response || !response.success) {
                    const msg = response && response.message ? response.message : 'No response from Alex AI';
                    vscode.window.showErrorMessage(`Suggestion failed: ${msg}`);
                    return;
                }

                const suggestion = response.coordinatedResponse || '';
                if (!suggestion) {
                    vscode.window.showInformationMessage('Alex AI did not return a suggestion');
                    return;
                }

                const apply = 'Apply suggestion';
                const copy = 'Copy to clipboard';
                const view = 'Open in new document';
                const choice = await vscode.window.showInformationMessage('Alex AI suggestion ready', apply, copy, view);

                if (choice === apply) {
                    await editor.edit(editBuilder => {
                        if (selection && !selection.isEmpty) {
                            editBuilder.replace(selection, suggestion);
                        } else {
                            const line = editor.document.lineAt(selection.active.line);
                            editBuilder.replace(line.range, suggestion);
                        }
                    });
                    vscode.window.showInformationMessage('Applied Alex AI suggestion');
                } else if (choice === copy) {
                    await vscode.env.clipboard.writeText(suggestion);
                    vscode.window.showInformationMessage('Suggestion copied to clipboard');
                } else if (choice === view) {
                    const doc = await vscode.workspace.openTextDocument({ content: suggestion, language: language });
                    await vscode.window.showTextDocument(doc, { preview: true });
                }
            } catch (error: unknown) {
                const msg = isErr(error) && typeof error.message === 'string' ? error.message : String(error);
                vscode.window.showErrorMessage(`Alex AI Suggestion failed: ${msg}`);
            }
        }
    });

    // Register status command
    const statusCommand = vscode.commands.registerCommand('alex-ai.status', async () => {
        if (enhancedEnabled && mcpIntegration) {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Alex AI: Checking system status...',
                cancellable: false
            }, async () => {
                try {
                    const [crewStatus, systemHealth] = await Promise.all([
                        mcpIntegration!.getCrewStatus(),
                        mcpIntegration!.getSystemHealth()
                    ]);

                    const statusMessage = [
                        'Alex AI System Status:',
                        '',
                        'Crew Status:',
                        crewStatus.success ? '✅ Connected' : `❌ ${crewStatus.error}`,
                        '',
                        'System Health:',
                        systemHealth.success ? '✅ Healthy' : `⚠️ ${systemHealth.error}`
                    ].join('\n');

                    vscode.window.showInformationMessage(statusMessage);
                } catch (error) {
                    vscode.window.showErrorMessage(`Status check failed: ${error instanceof Error ? error.message : String(error)}`);
                }
            });
        } else {
            // Legacy status
            try {
                const response = await core.processMessage('Show system status');
                vscode.window.showInformationMessage(`Alex AI Status: ${response.coordinatedResponse}`);
            } catch (error: unknown) {
                const msg = isErr(error) && typeof error.message === 'string' ? error.message : String(error);
                vscode.window.showErrorMessage(`Status check failed: ${msg}`);
            }
        }
    });

    // Register status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(star) Alex AI';
    statusBarItem.tooltip = 'Alex AI Universal - Star Trek Crew-based AI Assistant (Zero Artifacts)';
    statusBarItem.command = enhancedEnabled ? 'alex-ai.openChat' : 'alex-ai.engage';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register provider tree
    const providerTree = new ProviderTree(context.secrets);
    vscode.window.registerTreeDataProvider('alexAiProviders', providerTree);

    // Register other legacy commands (keep for compatibility)
    const panelCommand = vscode.commands.registerCommand('alex-ai.openPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'alexAiPanel',
            'Alex AI Panel',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        panel.webview.html = `<!doctype html><html><body><h1>Alex AI</h1><p>Zero-artifact panel</p></body></html>`;
    });

    context.subscriptions.push(
        engageCommand,
        suggestCommand,
        statusCommand,
        panelCommand
    );

    console.log('✅ Alex AI Universal extension initialized');
}

export function deactivate() {
    console.log('🛑 Alex AI Universal extension is now deactivated');
}

