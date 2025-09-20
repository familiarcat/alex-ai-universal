/**
 * Universal Extension - Main Entry Point
 * 
 * Exports the universal extension core and adapters
 */

export { UniversalExtensionCore, ExtensionAPI, ExtensionContext } from './extension-core';
export { VSCodeAdapter, createVSCodeExtension } from './vscode-adapter';
export { CursorAdapter, createCursorExtension } from './cursor-adapter';





