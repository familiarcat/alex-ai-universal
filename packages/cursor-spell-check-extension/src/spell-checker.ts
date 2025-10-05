import * as vscode from 'vscode';
import { SpellChecker } from 'spellchecker';

export class AlexAISpellChecker {
    private spellChecker: SpellChecker;
    private decorationType: vscode.TextEditorDecorationType;
    private enabled: boolean = true;
    private customDictionary: Set<string> = new Set();
    private misspelledWords: Map<string, vscode.Range[]> = new Map();
    
    constructor() {
        this.spellChecker = new SpellChecker();
        this.createDecorationType();
        this.loadCustomDictionary();
    }
    
    private createDecorationType() {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(0, 191, 255, 0.1)', // Alex AI Blue
            border: '1px solid #00BFFF',
            borderStyle: 'wavy',
            overviewRulerColor: '#00BFFF',
            overviewRulerLane: vscode.OverviewRulerLane.Right
        });
    }
    
    private loadCustomDictionary() {
        // Load Alex AI specific terms
        const alexAITerms = [
            'alex-ai', 'alexai', 'cursor-ai', 'cursorai',
            'vscode', 'typescript', 'javascript', 'react',
            'vue', 'angular', 'nodejs', 'npm', 'yarn',
            'git', 'github', 'docker', 'kubernetes',
            'api', 'rest', 'graphql', 'websocket',
            'json', 'xml', 'yaml', 'toml',
            'html', 'css', 'scss', 'sass',
            'webpack', 'babel', 'eslint', 'prettier',
            'jest', 'mocha', 'cypress', 'playwright',
            'mongodb', 'postgresql', 'mysql', 'redis',
            'aws', 'azure', 'gcp', 'heroku',
            'terraform', 'ansible', 'jenkins', 'ci-cd'
        ];
        
        alexAITerms.forEach(term => this.customDictionary.add(term.toLowerCase()));
    }
    
    public initialize() {
        console.log('🛡️ Alex AI Spell Checker initialized');
        this.checkCurrentDocument();
    }
    
    public isEnabled(): boolean {
        return this.enabled;
    }
    
    public toggle(): void {
        this.enabled = !this.enabled;
        if (this.enabled) {
            this.checkCurrentDocument();
            vscode.window.showInformationMessage('🛡️ Alex AI Spell Check: ENABLED');
        } else {
            this.clearDecorations();
            vscode.window.showInformationMessage('🛡️ Alex AI Spell Check: DISABLED');
        }
    }
    
    public isChatInput(document: vscode.TextDocument): boolean {
        // Check if this is a Cursor AI chat input
        const fileName = document.fileName.toLowerCase();
        const content = document.getText();
        
        // Look for Cursor AI chat indicators
        return fileName.includes('cursor') || 
               fileName.includes('chat') ||
               content.includes('@alex-ai') ||
               content.includes('@cursor') ||
               document.languageId === 'markdown' ||
               document.languageId === 'plaintext';
    }
    
    public checkDocument(document: vscode.TextDocument): void {
        if (!this.isChatInput(document)) {
            return;
        }
        
        const text = document.getText();
        const words = this.extractWords(text);
        const misspelled = this.findMisspelledWords(words);
        
        this.highlightMisspelledWords(document, misspelled);
        this.updateMisspelledWordsMap(document, misspelled);
    }
    
    private extractWords(text: string): Array<{ word: string; range: vscode.Range }> {
        const words: Array<{ word: string; range: vscode.Range }> = [];
        const lines = text.split('\n');
        
        lines.forEach((line, lineIndex) => {
            const wordRegex = /\b[a-zA-Z]+\b/g;
            let match;
            
            while ((match = wordRegex.exec(line)) !== null) {
                const word = match[0];
                const startPos = new vscode.Position(lineIndex, match.index);
                const endPos = new vscode.Position(lineIndex, match.index + word.length);
                const range = new vscode.Range(startPos, endPos);
                
                words.push({ word, range });
            }
        });
        
        return words;
    }
    
    private findMisspelledWords(words: Array<{ word: string; range: vscode.Range }>): Array<{ word: string; range: vscode.Range }> {
        return words.filter(({ word }) => {
            const lowerWord = word.toLowerCase();
            
            // Skip if in custom dictionary
            if (this.customDictionary.has(lowerWord)) {
                return false;
            }
            
            // Skip single characters
            if (word.length < 2) {
                return false;
            }
            
            // Skip if it's a number
            if (/^\d+$/.test(word)) {
                return false;
            }
            
            // Check spelling
            return !this.spellChecker.isCorrect(word);
        });
    }
    
    private highlightMisspelledWords(document: vscode.TextDocument, misspelled: Array<{ word: string; range: vscode.Range }>): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return;
        }
        
        const decorations = misspelled.map(({ word, range }) => ({
            range,
            hoverMessage: this.createHoverMessage(word)
        }));
        
        editor.setDecorations(this.decorationType, decorations);
    }
    
    private createHoverMessage(word: string): vscode.MarkdownString {
        const suggestions = this.getSuggestions(word);
        const markdown = new vscode.MarkdownString();
        
        markdown.appendMarkdown(`## 🛡️ Alex AI Spell Check\n\n`);
        markdown.appendMarkdown(`**Misspelled word:** \`${word}\`\n\n`);
        
        if (suggestions.length > 0) {
            markdown.appendMarkdown(`**Suggestions:**\n`);
            suggestions.forEach(suggestion => {
                markdown.appendMarkdown(`- \`${suggestion}\`\n`);
            });
        } else {
            markdown.appendMarkdown(`*No suggestions available*\n`);
        }
        
        markdown.appendMarkdown(`\n---\n`);
        markdown.appendMarkdown(`*Alex AI Universal Spell Checker*`);
        
        return markdown;
    }
    
    private getSuggestions(word: string): string[] {
        try {
            return this.spellChecker.getCorrectionsForMisspelling(word);
        } catch (error) {
            console.error('Error getting suggestions:', error);
            return [];
        }
    }
    
    private updateMisspelledWordsMap(document: vscode.TextDocument, misspelled: Array<{ word: string; range: vscode.Range }>): void {
        const uri = document.uri.toString();
        this.misspelledWords.set(uri, misspelled.map(({ range }) => range));
    }
    
    private clearDecorations(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.setDecorations(this.decorationType, []);
        }
    }
    
    private checkCurrentDocument(): void {
        const editor = vscode.window.activeTextEditor;
        if (editor && this.isChatInput(editor.document)) {
            this.checkDocument(editor.document);
        }
    }
    
    public addCurrentWordToDictionary(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        const selection = editor.selection;
        const word = editor.document.getText(selection);
        
        if (word) {
            this.customDictionary.add(word.toLowerCase());
            this.checkDocument(editor.document);
            vscode.window.showInformationMessage(`🛡️ Added "${word}" to Alex AI dictionary`);
        }
    }
    
    public showSuggestions(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        
        const selection = editor.selection;
        const word = editor.document.getText(selection);
        
        if (word) {
            const suggestions = this.getSuggestions(word);
            if (suggestions.length > 0) {
                vscode.window.showQuickPick(suggestions, {
                    placeHolder: `🛡️ Alex AI Suggestions for "${word}"`
                }).then(selected => {
                    if (selected) {
                        editor.edit(editBuilder => {
                            editBuilder.replace(selection, selected);
                        });
                    }
                });
            } else {
                vscode.window.showInformationMessage(`🛡️ No suggestions available for "${word}"`);
            }
        }
    }
}
