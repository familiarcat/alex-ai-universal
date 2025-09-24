"use strict";
/**
 * Alex AI Universal Cursor Extension
 *
 * Provides Cursor AI integration for Alex AI with Star Trek crew-based AI assistance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.alexAI = void 0;
const universal_extension_1 = require("@alex-ai/universal-extension");
// Create Cursor AI adapter
const cursorAI = {
    showChat: (message) => console.log(`🤖 Alex AI: ${message}`),
    showStatus: (status) => console.log(`📊 Status: ${status}`),
    showError: (error) => console.error(`❌ Error: ${error}`),
    showInput: async (prompt, placeholder) => {
        // In a real implementation, this would use Cursor's input API
        return prompt;
    },
    showQuickPick: async (items, placeholder) => {
        // In a real implementation, this would use Cursor's quick pick API
        return items[0];
    },
    createDocument: async (content, language) => {
        // In a real implementation, this would create a new document in Cursor
        console.log(`📄 Creating document: ${content.substring(0, 100)}...`);
    },
    insertText: async (text) => {
        // In a real implementation, this would insert text at cursor position
        console.log(`✏️ Inserting text: ${text.substring(0, 50)}...`);
    },
    getActiveFile: async () => {
        // In a real implementation, this would get the active file from Cursor
        return {
            path: 'cursor-chat',
            content: '',
            language: 'text'
        };
    },
    getWorkspacePath: async () => {
        // In a real implementation, this would get the workspace path from Cursor
        return process.cwd();
    },
    getProjectType: async () => {
        // In a real implementation, this would detect the project type
        return 'cursor';
    },
    getDependencies: async () => {
        // In a real implementation, this would get project dependencies
        return [];
    }
};
// Create the universal extension using Cursor adapter
const { core, commands } = (0, universal_extension_1.createCursorExtension)(cursorAI);
// Export for Cursor AI integration
exports.alexAI = core;
// Initialize on load
core.initialize().catch(console.error);
//# sourceMappingURL=index.js.map