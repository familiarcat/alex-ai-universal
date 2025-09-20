/**
 * Alex AI Universal VSCode Extension
 * 
 * Provides VSCode integration for Alex AI with Star Trek crew-based AI assistance
 */

import * as vscode from 'vscode';
import { createVSCodeExtension } from '@alex-ai/universal-extension';

export function activate(context: vscode.ExtensionContext) {
    console.log('🚀 Alex AI Universal extension is now active!');

    // Create the universal extension using VSCode adapter
    const extension = createVSCodeExtension(context);
    
    console.log('✅ Alex AI Universal extension initialized with unified codebase');
}

export function deactivate() {
    console.log('🛑 Alex AI Universal extension is now deactivated');
}