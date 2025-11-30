/**
 * Enhanced Alex AI Universal VSCode Extension
 * 
 * Implements all crew recommendations:
 * - O'Brien: Pragmatic MVP approach
 * - Data: Hybrid architecture (Webview + background service)
 * - Worf: Secure API client with TLS 1.3+
 * - Riker: Phased implementation
 * - La Forge: Robust error handling and retry mechanisms
 * - Troi: Enhanced UX with accessibility
 * - Uhura: MCP integration
 * - Crusher: Health monitoring
 * 
 * This is the enhanced version that integrates all crew recommendations
 */

import * as vscode from 'vscode';
import { SecureApiClient } from './api-client';
import { ContextGatherer } from './context-gatherer';
import { ChatWebviewProvider } from './chat-webview';
import { MCPIntegration } from './mcp-integration';
import { RAGIntegration } from './rag-integration';

let apiClient: SecureApiClient;
let mcpIntegration: MCPIntegration;
let ragIntegration: RAGIntegration;
let chatWebview: ChatWebviewProvider;

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Alex AI Universal extension is now active!');

    // Initialize secure API client (Worf's requirement)
    apiClient = new SecureApiClient(context.secrets, {
        mcpUrl: vscode.workspace.getConfiguration().get('alexAi.mcpUrl'),
        n8nUrl: vscode.workspace.getConfiguration().get('alexAi.n8nUrl'),
        supabaseUrl: vscode.workspace.getConfiguration().get('alexAi.supabaseUrl'),
        openRouterUrl: vscode.workspace.getConfiguration().get('alexAi.openRouterUrl')
    });

    // Initialize integrations (Data's hybrid architecture)
    mcpIntegration = new MCPIntegration(apiClient);
    ragIntegration = new RAGIntegration(apiClient);
    chatWebview = new ChatWebviewProvider(context);

    // Initialize MCP session
    mcpIntegration.initialize().catch(err => {
        console.warn('MCP initialization failed:', err);
        vscode.window.showWarningMessage('MCP server connection failed. Some features may be limited.');
    });

    // Register enhanced chat command (O'Brien's MVP + Troi's UX)
    const openChatCommand = vscode.commands.registerCommand('alex-ai.openChat', async () => {
        const panel = chatWebview.createOrReveal();
        
        // Set message handler
        chatWebview.setMessageHandler(async (message) => {
            if (message.type === 'message') {
                try {
                    // Get context (O'Brien's pragmatic approach)
                    const context = await ContextGatherer.getRelevantContext(true);
                    
                    // Augment prompt with RAG (Data's requirement)
                    const augmentedPrompt = await ragIntegration.augmentPrompt(message.text, context);
                    
                    // Send to crew via MCP (Uhura's integration)
                    const response = await mcpIntegration.sendCrewMessage({
                        query: augmentedPrompt,
                        context,
                        priority: 'medium'
                    });

                    if (response.success && response.data) {
                        const crewResponse = (response.data as { response?: string }).response || 
                                           JSON.stringify(response.data);
                        chatWebview.postMessage({
                            speaker: 'Alex AI',
                            text: crewResponse,
                            timestamp: Date.now()
                        });

                        // Update chat history
                        const history = context.workspaceState.get<Array<{ speaker: string; text: string; timestamp?: number }>>('alexAi.chatHistory', []);
                        history.push({ speaker: 'You', text: message.text, timestamp: Date.now() });
                        history.push({ speaker: 'Alex AI', text: crewResponse, timestamp: Date.now() });
                        await context.workspaceState.update('alexAi.chatHistory', history);
                    } else {
                        chatWebview.postMessage({
                            speaker: 'Alex AI',
                            text: `Error: ${response.error || 'Unknown error'}`,
                            timestamp: Date.now()
                        });
                    }
                } catch (error) {
                    chatWebview.postMessage({
                        speaker: 'Alex AI',
                        text: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        timestamp: Date.now()
                    });
                }
            }
        });
    });

    // Register enhanced suggest command (O'Brien's quick wins)
    const suggestCommand = vscode.commands.registerCommand('alex-ai.suggest', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file and select some code or place the cursor on a line to get suggestions');
            return;
        }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Alex AI: Getting suggestion...',
            cancellable: false
        }, async (progress) => {
            try {
                // Get minimal context (O'Brien's approach)
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
                
                // Augment with RAG
                const augmentedPrompt = await ragIntegration.augmentPrompt(prompt, context);
                
                // Get suggestion from crew
                const response = await mcpIntegration.sendCrewMessage({
                    query: augmentedPrompt,
                    context,
                    crewMembers: ['data'], // Route to Data for code analysis
                    priority: 'high'
                });

                if (response.success && response.data) {
                    const suggestion = (response.data as { response?: string }).response || 
                                     JSON.stringify(response.data);
                    
                    // Offer to apply or copy
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
    });

    // Register status command (Crusher's health monitoring)
    const statusCommand = vscode.commands.registerCommand('alex-ai.status', async () => {
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Alex AI: Checking system status...',
            cancellable: false
        }, async () => {
            try {
                const [crewStatus, systemHealth] = await Promise.all([
                    mcpIntegration.getCrewStatus(),
                    mcpIntegration.getSystemHealth()
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
    });

    // Register engage command (quick access)
    const engageCommand = vscode.commands.registerCommand('alex-ai.engage', async () => {
        await vscode.commands.executeCommand('alex-ai.openChat');
    });

    // Register status bar item (Troi's prominent access)
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(star) Alex AI';
    statusBarItem.tooltip = 'Alex AI Universal - Star Trek Crew-based AI Assistant (Zero Artifacts)';
    statusBarItem.command = 'alex-ai.openChat';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register all commands
    context.subscriptions.push(
        openChatCommand,
        suggestCommand,
        statusCommand,
        engageCommand
    );

    console.log('✅ Alex AI Universal extension initialized with all crew recommendations');
}

export function deactivate() {
    console.log('🛑 Alex AI Universal extension is now deactivated');
}

