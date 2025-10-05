import * as vscode from 'vscode';
import { AlexAISpellChecker } from './spell-checker';
import { AlexAIBranding } from './branding';

export function activate(context: vscode.ExtensionContext) {
    console.log('🛡️ Alex AI Cursor Spell Check extension is now active!');
    
    // Initialize Alex AI Spell Checker
    const spellChecker = new AlexAISpellChecker();
    const branding = new AlexAIBranding();
    
    // Register commands
    const toggleCommand = vscode.commands.registerCommand('alex-ai-spell-check.toggle', () => {
        spellChecker.toggle();
        branding.updateStatus();
    });
    
    const addToDictionaryCommand = vscode.commands.registerCommand('alex-ai-spell-check.addToDictionary', () => {
        spellChecker.addCurrentWordToDictionary();
    });
    
    const showSuggestionsCommand = vscode.commands.registerCommand('alex-ai-spell-check.showSuggestions', () => {
        spellChecker.showSuggestions();
    });
    
    // Add commands to context
    context.subscriptions.push(toggleCommand, addToDictionaryCommand, showSuggestionsCommand);
    
    // Initialize spell checking
    spellChecker.initialize();
    branding.initialize();
    
    // Monitor text changes
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (spellChecker.isEnabled() && spellChecker.isChatInput(event.document)) {
            spellChecker.checkDocument(event.document);
        }
    });
    
    // Monitor active editor changes
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (editor && spellChecker.isEnabled() && spellChecker.isChatInput(editor.document)) {
            spellChecker.checkDocument(editor.document);
        }
    });
    
    // Show Alex AI branding
    branding.showAlexAIActive();
}

export function deactivate() {
    console.log('🛡️ Alex AI Cursor Spell Check extension deactivated');
}
