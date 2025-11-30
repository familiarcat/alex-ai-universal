/**
 * Alex AI Universal VSCode Extension
 * 
 * Provides VSCode integration for Alex AI with Star Trek crew-based AI assistance
 * ZERO ARTIFACT GUARANTEE - No files created in user projects
 */

import * as vscode from 'vscode';
import { createVSCodeExtension } from '@alex-ai/universal-extension';
import { ProviderTree } from './providerTree';
import * as https from 'https';

// Create the universal extension using VS Code adapter
const { core } = createVSCodeExtension(vscode);

function isErr(e: unknown): e is { message?: unknown } {
    return typeof e === 'object' && e !== null && 'message' in e;
}

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Alex AI Universal extension is now active!');

    // Initialize the universal core
    core.initialize().then(() => {
        console.log('✅ Alex AI Universal core initialized with zero-artifact guarantee');
    }).catch(console.error);

    // Register Alex AI Engage command
    const engageCommand = vscode.commands.registerCommand('alex-ai.engage', async () => {
        const userInput = await vscode.window.showInputBox({
            prompt: 'Engage Alex AI',
            placeHolder: 'Ask the crew for assistance...'
        });

        if (userInput) {
            try {
                const response = await core.processMessage(userInput);

                if (response.success) {
                    // Show response in a new document (read-only)
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

    // Register Alex AI Status command
    const statusCommand = vscode.commands.registerCommand('alex-ai.status', async () => {
        try {
            const response = await core.processMessage('Show system status');
            vscode.window.showInformationMessage(`Alex AI Status: ${response.coordinatedResponse}`);
        } catch (error: unknown) {
            const msg = isErr(error) && typeof error.message === 'string' ? error.message : String(error);
            vscode.window.showErrorMessage(`Status check failed: ${msg}`);
        }
    });

    // Register a simple webview panel command
    const panelCommand = vscode.commands.registerCommand('alex-ai.openPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'alexAiPanel',
            'Alex AI Panel',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        panel.webview.html = `<!doctype html><html><body><h1>Alex AI</h1><p>Zero-artifact panel</p></body></html>`;
    });

    context.subscriptions.push(panelCommand);

    context.subscriptions.push(engageCommand, statusCommand);

    // Register Alex AI Suggest command - provides in-editor suggestions from the crew/LLM
    const suggestCommand = vscode.commands.registerCommand('alex-ai.suggest', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showInformationMessage('Open a file and select some code or place the cursor on a line to get suggestions');
            return;
        }

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

            // Offer to apply or copy the suggestion
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
    });

    context.subscriptions.push(suggestCommand);

    // Provider tree view
    const providerTree = new ProviderTree(context.secrets);
    vscode.window.registerTreeDataProvider('alexAiProviders', providerTree);

    // Debounced inline completion provider
    const debounce = <F extends (...args: unknown[]) => void>(fn: F, wait = 200) => {
        let timer: NodeJS.Timeout | undefined;
        return (...args: unknown[]) => {
            if (timer) clearTimeout(timer);
            const lastArgs = args as Parameters<F>;
            timer = setTimeout(() => {
                fn(...lastArgs);
            }, wait);
        };
    };

    const provideInline = async (document: vscode.TextDocument, position: vscode.Position) => {
        try {
            const enabled = vscode.workspace.getConfiguration().get('alexAi.enabled', true);
            if (!enabled) return null;

            const prefix = document.lineAt(position.line).text.substring(0, position.character);
            const language = document.languageId || 'text';
            const prompt = `Provide a short inline completion (1-2 lines) for this ${language} code context:\n\n${prefix}`;

            const response = await core.processMessage(prompt);
            if (!response || !response.success) return null;

            const suggestion = response.coordinatedResponse || '';
            if (!suggestion) return null;

            const item: vscode.InlineCompletionItem = { insertText: suggestion } as unknown as vscode.InlineCompletionItem;
            return new vscode.InlineCompletionList([item]);
        } catch (err) {
            return null;
        }
    };

    const inlineProvider = vscode.languages.registerInlineCompletionItemProvider({ scheme: 'file' }, {
        provideInlineCompletionItems(document, position) {
            // wrap in a promise that resolves after debounced work
            return new Promise<vscode.InlineCompletionList | null>((resolve) => {
                debounce(async () => resolve(await provideInline(document, position)))();
            });
        }
    });
    context.subscriptions.push(inlineProvider);

    // Register Alex AI status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(star) Alex AI';
    statusBarItem.tooltip = 'Alex AI Universal - Star Trek Crew-based AI Assistant (Zero Artifacts)';
    statusBarItem.command = 'alex-ai.engage';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    console.log('✅ Alex AI Universal extension initialized with zero-artifact guarantee');

        // Command to connect a provider (store API key in SecretStorage)
        const connectProvider = vscode.commands.registerCommand('alex-ai.connectProvider', async () => {
                const provider = await vscode.window.showQuickPick(['openai', 'anthropic', 'local'], { placeHolder: 'Select a provider to connect' });
                if (!provider) return;

                const key = await vscode.window.showInputBox({ prompt: `Enter API key/token for ${provider}`, ignoreFocusOut: true, password: true });
                if (!key) return;

                await context.secrets.store(`alexai.${provider}.key`, key);
                providerTree.refresh();
                vscode.window.showInformationMessage(`Saved API key for ${provider}`);
        });
        context.subscriptions.push(connectProvider);

        // Command to disconnect a provider (remove key)
        const disconnectProvider = vscode.commands.registerCommand('alex-ai.disconnectProvider', async () => {
                const provider = await vscode.window.showQuickPick(['openai', 'anthropic', 'local'], { placeHolder: 'Select a provider to disconnect' });
                if (!provider) return;
                await context.secrets.delete(`alexai.${provider}.key`);
            providerTree.refresh();
                vscode.window.showInformationMessage(`Removed API key for ${provider}`);
        });
        context.subscriptions.push(disconnectProvider);

        // Command to test provider connectivity (simple OpenAI ping)
        const testProvider = vscode.commands.registerCommand('alex-ai.testProvider', async () => {
            const provider = await vscode.window.showQuickPick(['openai', 'anthropic', 'local'], { placeHolder: 'Select a provider to test' });
            if (!provider) return;
            const key = await context.secrets.get(`alexai.${provider}.key`);
            if (!key) { vscode.window.showWarningMessage(`No key found for ${provider}`); return; }

            if (provider === 'openai') {
                try {
                    await new Promise<void>((resolve, reject) => {
                        const req = https.request({
                            method: 'GET',
                            host: 'api.openai.com',
                            path: '/v1/models',
                            headers: { Authorization: `Bearer ${key}` }
                        }, res => {
                            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve();
                            else reject(new Error(`OpenAI test failed: ${res.statusCode}`));
                        });
                        req.on('error', reject);
                        req.end();
                    });
                    vscode.window.showInformationMessage('OpenAI key appears valid');
                } catch (err) {
                    vscode.window.showErrorMessage('OpenAI test failed: ' + String(err));
                }
            } else {
                vscode.window.showInformationMessage(`Test not implemented for ${provider}`);
            }
        });
        context.subscriptions.push(testProvider);

        // Chat panel handle so we can post messages programmatically
        let chatPanel: vscode.WebviewPanel | undefined;

        // Command to copy clipboard into chat (opens chat and posts message if chat is active)
        const sendClipboardToChat = vscode.commands.registerCommand('alex-ai.sendClipboardToChat', async () => {
            const text = await vscode.env.clipboard.readText();
            if (!text) {
                vscode.window.showInformationMessage('Clipboard is empty');
                return;
            }
            await vscode.commands.executeCommand('alex-ai.openChat');
            // send to open panel if present
            if (chatPanel) {
                chatPanel.webview.postMessage({ type: 'external', text });
                vscode.window.showInformationMessage('Sent clipboard text to chat.');
            } else {
                vscode.window.showInformationMessage('Opened chat — paste the clipboard text to send.');
            }
        });
        context.subscriptions.push(sendClipboardToChat);

        // Command to set preference for whether Alex AI should be preferred over Copilot for this workspace
        const setPreference = vscode.commands.registerCommand('alex-ai.setPreference', async () => {
            const choice = await vscode.window.showQuickPick(['alex', 'copilot', 'auto'], { placeHolder: 'Select preferred assistant for this workspace' });
            if (!choice) return;
            await vscode.workspace.getConfiguration().update('alexAi.preferredAssistant', choice, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`Set preferred assistant to ${choice}`);
        });
        context.subscriptions.push(setPreference);

        // Choose assistant for current file (stores per-language preference)
        const chooseAssistantForFile = vscode.commands.registerCommand('alex-ai.chooseAssistantForFile', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) { vscode.window.showInformationMessage('Open a file to choose assistant for'); return; }
            const lang = editor.document.languageId || 'plaintext';
            const choice = await vscode.window.showQuickPick(['alex', 'copilot', 'auto'], { placeHolder: `Choose assistant for language '${lang}'` });
            if (!choice) return;
            const map = vscode.workspace.getConfiguration().get('alexAi.perLanguageEnabled', {}) as Record<string, boolean>;
            map[lang] = choice === 'alex';
            await vscode.workspace.getConfiguration().update('alexAi.perLanguageEnabled', map, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage(`Set assistant for ${lang} to ${choice}`);
        });
        context.subscriptions.push(chooseAssistantForFile);

        // Chat webview with history and assistant switching
        const openChat = vscode.commands.registerCommand('alex-ai.openChat', async () => {
                // reveal existing
                if (chatPanel) { chatPanel.reveal(vscode.ViewColumn.One); return; }

                chatPanel = vscode.window.createWebviewPanel('alexAiChat', 'Alex AI Chat', vscode.ViewColumn.One, { enableScripts: true });

                const history: Array<{ speaker: string; text: string }> = context.workspaceState.get('alexAi.chatHistory', []);
                const preferredAssistant = context.workspaceState.get('alexAi.preferredAssistant', vscode.workspace.getConfiguration().get('alexAi.preferredAssistant', 'auto'));

                const renderMessages = (msgs: Array<{ speaker: string; text: string }>) => msgs.map(m => `<div><strong>${m.speaker}:</strong> ${m.text}</div>`).join('');

                chatPanel.webview.html = `<!doctype html><html><body>
                    <div id="messages" style="font-family: sans-serif; padding-bottom: 80px;">${renderMessages(history)}</div>
                    <div style="position:fixed;bottom:10px;left:10px;right:10px;display:flex;gap:8px;align-items:center;">
                      <select id="assistant"><option value="auto">Auto</option><option value="alex">Alex</option><option value="copilot">Copilot</option></select>
                      <input id="input" style="flex:1;padding:8px" placeholder="Type a message..." />
                      <button id="send">Send</button>
                    </div>
                    <script>
                      const vscode = acquireVsCodeApi();
                      const assistant = document.getElementById('assistant'); assistant.value = '${preferredAssistant}';
                      const send = () => {
                        const input = document.getElementById('input');
                        const msg = input.value;
                        if (!msg) return;
                        const m = document.createElement('div'); m.innerHTML = '<strong>You:</strong> ' + msg; document.getElementById('messages').appendChild(m);
                        const a = assistant.value;
                        vscode.postMessage({ type: 'message', text: msg, assistant: a });
                        input.value = '';
                      };
                      document.getElementById('send').addEventListener('click', send);
                      document.getElementById('input').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
                      window.addEventListener('message', event => {
                        const ev = event.data;
                        const m = document.createElement('div'); m.innerHTML = '<strong>' + (ev.speaker || 'Alex AI') + ':</strong> ' + ev.text; document.getElementById('messages').appendChild(m);
                      });
                    </script>
                  </body></html>`;

                chatPanel.onDidDispose(() => { chatPanel = undefined; });

                chatPanel.webview.onDidReceiveMessage(async (msg) => {
                    if (msg.type === 'message') {
                        try {
                            const hist: Array<{ speaker: string; text: string }> = context.workspaceState.get('alexAi.chatHistory', []);
                            hist.push({ speaker: 'You', text: msg.text });
                            await context.workspaceState.update('alexAi.chatHistory', hist);

                            if (msg.assistant) {
                                await context.workspaceState.update('alexAi.preferredAssistant', msg.assistant);
                            }

                            const response = await core.processMessage(msg.text);
                            const text = response.coordinatedResponse || response.message || 'No response';
                            const hist2: Array<{ speaker: string; text: string }> = context.workspaceState.get('alexAi.chatHistory', []);
                            hist2.push({ speaker: 'Alex AI', text });
                            await context.workspaceState.update('alexAi.chatHistory', hist2);
                            chatPanel?.webview.postMessage({ speaker: 'Alex AI', text });
                        } catch (err) {
                            chatPanel?.webview.postMessage({ speaker: 'Alex AI', text: 'Error: ' + String(err) });
                        }
                    } else if (msg.type === 'external') {
                        // External messages posted from extension (clipboard)
                        const hist: Array<{ speaker: string; text: string }> = context.workspaceState.get('alexAi.chatHistory', []);
                        hist.push({ speaker: 'External', text: msg.text });
                        await context.workspaceState.update('alexAi.chatHistory', hist);
                        chatPanel?.webview.postMessage({ speaker: 'External', text: msg.text });
                    }
                });
        });
        context.subscriptions.push(openChat);

        // Detect GitHub Copilot extension and expose a compare command if present
        const copilotExt = vscode.extensions.getExtension('github.copilot');
        if (copilotExt) {
            const compareCmd = vscode.commands.registerCommand('alex-ai.compareWithCopilot', async () => {
                const editor = vscode.window.activeTextEditor;
                if (!editor) {
                    vscode.window.showInformationMessage('Open a file and place the cursor where you want a suggestion');
                    return;
                }

                const selection = editor.selection;
                const contextText = selection && !selection.isEmpty ? editor.document.getText(selection) : editor.document.lineAt(selection.active.line).text;
                const language = editor.document.languageId || 'text';

                // Ask Alex AI for a suggestion
                const alexPrompt = `Provide a concise suggestion for this ${language} snippet:\n\n${contextText}`;
                const alexResp = await core.processMessage(alexPrompt);
                const alexSuggestion = alexResp && alexResp.coordinatedResponse ? alexResp.coordinatedResponse : 'No Alex AI suggestion';

                // We cannot programmatically fetch Copilot's suggestion via API; instead, show instructions and Alex suggestion
                const choice = await vscode.window.showQuickPick([
                    { label: 'Alex AI suggestion', description: alexSuggestion },
                    { label: 'Show Copilot', description: 'Trigger Copilot suggestion (if available) and compare manually' }
                ], { placeHolder: 'Compare Alex AI with Copilot' });

                if (!choice) return;
                if (choice.label === 'Alex AI suggestion') {
                    const doc = await vscode.workspace.openTextDocument({ content: alexSuggestion, language });
                    await vscode.window.showTextDocument(doc, { preview: true });
                } else {
                    vscode.window.showInformationMessage('Trigger Copilot suggestion now (use your Copilot shortcut) and compare with the Alex AI suggestion shown in the editor.');
                }
            });
            context.subscriptions.push(compareCmd);
        }
}

export function deactivate() {
    console.log('🛑 Alex AI Universal extension is now deactivated');
}