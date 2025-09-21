/**
 * Cursor Adapter - Cursor-specific implementation
 * 
 * Adapts the universal extension core to Cursor's API
 */

import { UniversalExtensionCore, ExtensionAPI, ExtensionContext } from './extension-core';

// Cursor AI integration interface (simplified)
interface CursorAI {
  showChat: (message: string) => void;
  showStatus: (status: string) => void;
  showError: (error: string) => void;
  showInput: (prompt: string, placeholder?: string) => Promise<string | undefined>;
  showQuickPick: (items: string[], placeholder?: string) => Promise<string | undefined>;
  createDocument: (content: string, language?: string) => Promise<void>;
  insertText: (text: string) => Promise<void>;
  getActiveFile: () => Promise<ExtensionContext['activeFile'] | undefined>;
  getWorkspacePath: () => Promise<string>;
  getProjectType: () => Promise<string>;
  getDependencies: () => Promise<string[]>;
}

export class CursorAdapter implements ExtensionAPI {
  private cursorAI: CursorAI;

  constructor(cursorAI: CursorAI) {
    this.cursorAI = cursorAI;
  }

  async showMessage(message: string, type: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    switch (type) {
      case 'info':
        this.cursorAI.showChat(message);
        break;
      case 'warning':
        this.cursorAI.showStatus(`⚠️ ${message}`);
        break;
      case 'error':
        this.cursorAI.showError(message);
        break;
    }
  }

  async showInputBox(prompt: string, placeholder?: string): Promise<string | undefined> {
    return await this.cursorAI.showInput(prompt, placeholder);
  }

  async showQuickPick(items: string[], placeholder?: string): Promise<string | undefined> {
    return await this.cursorAI.showQuickPick(items, placeholder);
  }

  async createDocument(content: string, language: string = 'markdown'): Promise<void> {
    await this.cursorAI.createDocument(content, language);
  }

  async insertText(text: string): Promise<void> {
    await this.cursorAI.insertText(text);
  }

  async getActiveFile(): Promise<ExtensionContext['activeFile'] | undefined> {
    return await this.cursorAI.getActiveFile();
  }

  async getWorkspacePath(): Promise<string> {
    return await this.cursorAI.getWorkspacePath();
  }

  async getProjectType(): Promise<string> {
    return await this.cursorAI.getProjectType();
  }

  async getDependencies(): Promise<string[]> {
    return await this.cursorAI.getDependencies();
  }
}

export function createCursorExtension(cursorAI: CursorAI) {
  const adapter = new CursorAdapter(cursorAI);
  const core = new UniversalExtensionCore(adapter);

  // Cursor AI command handlers
  const commands = {
    async engage(): Promise<string> {
      await core.engage();
      return 'Alex AI engaged successfully';
    },

    async status(): Promise<string> {
      await core.showStatus();
      return 'Status displayed';
    },

    async crew(): Promise<string> {
      await core.showCrew();
      return 'Crew information displayed';
    },

    async quickChat(): Promise<string> {
      await core.quickChat();
      return 'Quick chat completed';
    }
  };

  return { core, commands };
}






