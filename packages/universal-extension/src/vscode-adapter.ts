/**
 * VSCode Adapter - VSCode-specific implementation
 * 
 * Adapts the universal extension core to VSCode's API
 */

import * as vscode from 'vscode';
import { UniversalExtensionCore, ExtensionAPI, ExtensionContext } from './extension-core';

export class VSCodeAdapter implements ExtensionAPI {
  private extensionContext: vscode.ExtensionContext;

  constructor(extensionContext: vscode.ExtensionContext) {
    this.extensionContext = extensionContext;
  }

  async showMessage(message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    switch (type) {
      case 'info':
        vscode.window.showInformationMessage(message);
        break;
      case 'warning':
        vscode.window.showWarningMessage(message);
        break;
      case 'error':
        vscode.window.showErrorMessage(message);
        break;
    }
  }

  async showInputBox(prompt: string, placeholder?: string): Promise<string | undefined> {
    return await vscode.window.showInputBox({
      prompt,
      placeHolder: placeholder,
      validateInput: (value) => value.trim().length > 0 ? null : 'Please enter a message'
    });
  }

  async showQuickPick(items: string[], placeholder?: string): Promise<string | undefined> {
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: placeholder,
      canPickMany: false
    });
    return selected;
  }

  async createDocument(content: string, language: string = 'markdown'): Promise<void> {
    const doc = await vscode.workspace.openTextDocument({
      content,
      language
    });
    await vscode.window.showTextDocument(doc);
  }

  async insertText(text: string): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const position = editor.selection.active;
      await editor.edit(editBuilder => {
        editBuilder.insert(position, text);
      });
    }
  }

  async getActiveFile(): Promise<ExtensionContext['activeFile'] | undefined> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return undefined;

    const document = editor.document;
    const selection = editor.selection;

    return {
      path: document.fileName,
      content: document.getText(),
      language: document.languageId,
      selection: {
        start: document.offsetAt(selection.start),
        end: document.offsetAt(selection.end)
      }
    };
  }

  async getWorkspacePath(): Promise<string> {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    return workspaceFolder?.uri.fsPath || process.cwd();
  }

  async getProjectType(): Promise<string> {
    const workspacePath = await this.getWorkspacePath();
    
    // Simple project type detection
    if (await this.fileExists(workspacePath, 'package.json')) {
      return 'node';
    } else if (await this.fileExists(workspacePath, 'requirements.txt')) {
      return 'python';
    } else if (await this.fileExists(workspacePath, 'Cargo.toml')) {
      return 'rust';
    } else if (await this.fileExists(workspacePath, 'pom.xml')) {
      return 'java';
    } else if (await this.fileExists(workspacePath, 'go.mod')) {
      return 'go';
    }
    
    return 'unknown';
  }

  async getDependencies(): Promise<string[]> {
    const workspacePath = await this.getWorkspacePath();
    const packageJsonPath = vscode.Uri.joinPath(vscode.Uri.file(workspacePath), 'package.json');
    
    try {
      const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonPath);
      const packageJson = JSON.parse(packageJsonContent.toString());
      return Object.keys(packageJson.dependencies || {});
    } catch {
      return [];
    }
  }

  private async fileExists(workspacePath: string, fileName: string): Promise<boolean> {
    try {
      const filePath = vscode.Uri.joinPath(vscode.Uri.file(workspacePath), fileName);
      await vscode.workspace.fs.stat(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

export function createVSCodeExtension(extensionContext: vscode.ExtensionContext) {
  const adapter = new VSCodeAdapter(extensionContext);
  const core = new UniversalExtensionCore(adapter);

  // Register VSCode commands
  const engageCommand = vscode.commands.registerCommand('alex-ai.engage', async () => {
    await core.engage();
  });

  const statusCommand = vscode.commands.registerCommand('alex-ai.status', async () => {
    await core.showStatus();
  });

  const crewCommand = vscode.commands.registerCommand('alex-ai.crew', async () => {
    await core.showCrew();
  });

  const quickChatCommand = vscode.commands.registerCommand('alex-ai.quickChat', async () => {
    await core.quickChat();
  });

  // Register all commands
  extensionContext.subscriptions.push(
    engageCommand,
    statusCommand,
    crewCommand,
    quickChatCommand
  );

  return core;
}






