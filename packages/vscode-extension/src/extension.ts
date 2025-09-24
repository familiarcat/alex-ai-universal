/**
 * Alex AI Universal VSCode Extension
 * 
 * Provides VSCode integration for Alex AI with Star Trek crew-based AI assistance
 */

import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Alex AI Universal extension is now active!');

    // Register Alex AI commands
    const disposable = vscode.commands.registerCommand('alex-ai.helloWorld', () => {
        vscode.window.showInformationMessage('Hello from Alex AI! 🖖');
    });

    context.subscriptions.push(disposable);

    // Register Alex AI status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = 'Alex AI';
    statusBarItem.tooltip = 'Alex AI Universal - Star Trek Crew-based AI Assistant';
    statusBarItem.command = 'alex-ai.helloWorld';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    console.log('✅ Alex AI Universal extension initialized');
}

export function deactivate() {
    console.log('🛑 Alex AI Universal extension is now deactivated');
}