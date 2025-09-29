/**
 * Alex AI Universal VSCode Extension
 * 
 * Provides VSCode integration for Alex AI with Star Trek crew-based AI assistance
 * ZERO ARTIFACT GUARANTEE - No files created in user projects
 */

import * as vscode from 'vscode';
import { createVSCodeExtension } from '@alex-ai/universal-extension';

// Create the universal extension using VS Code adapter
const { core, commands } = createVSCodeExtension(vscode);

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
            } catch (error) {
                vscode.window.showErrorMessage(`Alex AI Error: ${error.message}`);
            }
        }
    });

    // Register Alex AI Status command
    const statusCommand = vscode.commands.registerCommand('alex-ai.status', async () => {
        try {
            const response = await core.processMessage('Show system status');
            vscode.window.showInformationMessage(`Alex AI Status: ${response.coordinatedResponse}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Status check failed: ${error.message}`);
        }
    });

    context.subscriptions.push(engageCommand, statusCommand);

    // Register Alex AI status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(star) Alex AI';
    statusBarItem.tooltip = 'Alex AI Universal - Star Trek Crew-based AI Assistant (Zero Artifacts)';
    statusBarItem.command = 'alex-ai.engage';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    console.log('✅ Alex AI Universal extension initialized with zero-artifact guarantee');
}

export function deactivate() {
    console.log('🛑 Alex AI Universal extension is now deactivated');
}