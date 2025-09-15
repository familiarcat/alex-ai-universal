"use strict";
/**
 * Universal Alex AI Package
 *
 * Provides universal Alex AI functionality across all major IDEs and editors.
 * This package serves as the core integration layer for multi-IDE support.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IDE_SETTINGS = exports.DEFAULT_CONFIG = exports.UniversalSettingsManager = exports.UniversalCodeActions = exports.UniversalChatInterface = exports.VimAdapter = exports.SublimeAdapter = exports.IntelliJAdapter = exports.CursorAdapter = exports.VSCodeAdapter = exports.UniversalAlexAIManager = void 0;
exports.createUniversalAlexAI = createUniversalAlexAI;
// Core Universal Alex AI
var universal_alex_ai_1 = require("./core/universal-alex-ai");
Object.defineProperty(exports, "UniversalAlexAIManager", { enumerable: true, get: function () { return universal_alex_ai_1.UniversalAlexAIManager; } });
// Adapters (to be implemented)
var vscode_adapter_1 = require("./adapters/vscode-adapter");
Object.defineProperty(exports, "VSCodeAdapter", { enumerable: true, get: function () { return vscode_adapter_1.VSCodeAdapter; } });
var cursor_adapter_1 = require("./adapters/cursor-adapter");
Object.defineProperty(exports, "CursorAdapter", { enumerable: true, get: function () { return cursor_adapter_1.CursorAdapter; } });
var intellij_adapter_1 = require("./adapters/intellij-adapter");
Object.defineProperty(exports, "IntelliJAdapter", { enumerable: true, get: function () { return intellij_adapter_1.IntelliJAdapter; } });
var sublime_adapter_1 = require("./adapters/sublime-adapter");
Object.defineProperty(exports, "SublimeAdapter", { enumerable: true, get: function () { return sublime_adapter_1.SublimeAdapter; } });
var vim_adapter_1 = require("./adapters/vim-adapter");
Object.defineProperty(exports, "VimAdapter", { enumerable: true, get: function () { return vim_adapter_1.VimAdapter; } });
// UI Components (to be implemented)
var chat_interface_1 = require("./ui/chat-interface");
Object.defineProperty(exports, "UniversalChatInterface", { enumerable: true, get: function () { return chat_interface_1.UniversalChatInterface; } });
var code_actions_1 = require("./ui/code-actions");
Object.defineProperty(exports, "UniversalCodeActions", { enumerable: true, get: function () { return code_actions_1.UniversalCodeActions; } });
var settings_manager_1 = require("./ui/settings-manager");
Object.defineProperty(exports, "UniversalSettingsManager", { enumerable: true, get: function () { return settings_manager_1.UniversalSettingsManager; } });
// Utility functions
var universal_alex_ai_2 = require("./core/universal-alex-ai");
Object.defineProperty(exports, "createUniversalAlexAI", { enumerable: true, get: function () { return universal_alex_ai_2.createUniversalAlexAI; } });
/**
 * Create a new Universal Alex AI instance
 */
function createUniversalAlexAI() {
    return new UniversalAlexAIManager();
}
/**
 * Default configuration for Universal Alex AI
 */
exports.DEFAULT_CONFIG = {
    environment: 'development',
    enableN8NIntegration: true,
    enableStealthScraping: true,
    enableCrewManagement: true,
    enableTesting: true,
    logLevel: 'info'
};
/**
 * Default IDE settings
 */
exports.DEFAULT_IDE_SETTINGS = {
    apiUrl: 'http://localhost:3000',
    apiKey: '',
    defaultCrewMember: 'Commander Data',
    enableContextAwareness: true,
    maxContextLength: 4000,
    theme: 'auto',
    language: 'en'
};
//# sourceMappingURL=index.js.map