"use strict";
/**
 * Alex AI Universal VSCode Extension
 *
 * Provides VSCode integration for Alex AI with Star Trek crew-based AI assistance
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const universal_extension_1 = require("@alex-ai/universal-extension");
function activate(context) {
    console.log('🚀 Alex AI Universal extension is now active!');
    // Create the universal extension using VSCode adapter
    const extension = (0, universal_extension_1.createVSCodeExtension)(context);
    console.log('✅ Alex AI Universal extension initialized with unified codebase');
}
function deactivate() {
    console.log('🛑 Alex AI Universal extension is now deactivated');
}
//# sourceMappingURL=extension.js.map