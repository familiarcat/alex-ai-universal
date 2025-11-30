/**
 * Platform Adapters for Universal Alex AI
 * 
 * Provides platform-specific implementations for:
 * - Cursor AI Extension
 * - VS Code Extension  
 * - npx CLI Execution
 */

import { PlatformAdapter } from './universal-core';

/**
 * Cursor AI Platform Adapter
 * Chat-based interface with zero artifacts
 */
export class CursorAIAdapter implements PlatformAdapter {
  async showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<void> {
    const emoji = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🤖';
    console.log(`${emoji} Alex AI: ${message}`);
  }

  async showInput(prompt: string, placeholder?: string): Promise<string | undefined> {
    // In Cursor AI, this would use the chat input system
    console.log(`📝 Input Request: ${prompt}`);
    return prompt; // Simulated response
  }

  async showQuickPick(items: string[], placeholder?: string): Promise<string | undefined> {
    // In Cursor AI, this would use the quick pick system
    console.log(`🔍 Quick Pick: ${placeholder || 'Select an option'}`);
    console.log(`Options: ${items.join(', ')}`);
    return items[0]; // Simulated selection
  }

  async getWorkspacePath(): Promise<string> {
    return process.cwd();
  }

  async getProjectType(): Promise<string> {
    // Detect project type based on files in workspace
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        if (packageJson.dependencies?.react) return 'React';
        if (packageJson.dependencies?.vue) return 'Vue';
        if (packageJson.dependencies?.angular) return 'Angular';
        return 'Node.js';
      }
      
      if (fs.existsSync('requirements.txt')) return 'Python';
      if (fs.existsSync('Cargo.toml')) return 'Rust';
      if (fs.existsSync('go.mod')) return 'Go';
      
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  async getDependencies(): Promise<string[]> {
    try {
      const fs = require('fs');
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      return Object.keys(packageJson.dependencies || {});
    } catch {
      return [];
    }
  }
}

/**
 * VS Code Platform Adapter
 * Command-based interface with status bar integration
 */
export class VSCodeAdapter implements PlatformAdapter {
  private vscode: any;

  constructor(vscode: any) {
    this.vscode = vscode;
  }

  async showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<void> {
    const messageType = type === 'error' ? this.vscode.MessageType.Error :
                       type === 'warning' ? this.vscode.MessageType.Warning :
                       type === 'success' ? this.vscode.MessageType.Info :
                       this.vscode.MessageType.Info;
    
    this.vscode.window.showInformationMessage(`Alex AI: ${message}`, messageType);
  }

  async showInput(prompt: string, placeholder?: string): Promise<string | undefined> {
    return this.vscode.window.showInputBox({
      prompt,
      placeHolder: placeholder
    });
  }

  async showQuickPick(items: string[], placeholder?: string): Promise<string | undefined> {
    const selection = await this.vscode.window.showQuickPick(items, {
      placeHolder: placeholder
    });
    return selection;
  }

  async getWorkspacePath(): Promise<string> {
    const workspaceFolders = this.vscode.workspace.workspaceFolders;
    return workspaceFolders?.[0]?.uri?.fsPath || process.cwd();
  }

  async getProjectType(): Promise<string> {
    const workspacePath = await this.getWorkspacePath();
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (fs.existsSync(path.join(workspacePath, 'package.json'))) {
        const packageJson = JSON.parse(fs.readFileSync(path.join(workspacePath, 'package.json'), 'utf-8'));
        if (packageJson.dependencies?.react) return 'React';
        if (packageJson.dependencies?.vue) return 'Vue';
        if (packageJson.dependencies?.angular) return 'Angular';
        return 'Node.js';
      }
      
      if (fs.existsSync(path.join(workspacePath, 'requirements.txt'))) return 'Python';
      if (fs.existsSync(path.join(workspacePath, 'Cargo.toml'))) return 'Rust';
      if (fs.existsSync(path.join(workspacePath, 'go.mod'))) return 'Go';
      
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  async getDependencies(): Promise<string[]> {
    const workspacePath = await this.getWorkspacePath();
    try {
      const fs = require('fs');
      const path = require('path');
      const packageJson = JSON.parse(fs.readFileSync(path.join(workspacePath, 'package.json'), 'utf-8'));
      return Object.keys(packageJson.dependencies || {});
    } catch {
      return [];
    }
  }
}

/**
 * NPX CLI Platform Adapter
 * Command-line interface with natural language processing
 */
export class NPXAdapter implements PlatformAdapter {
  async showMessage(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): Promise<void> {
    const emoji = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : '🤖';
    console.log(`${emoji} Alex AI: ${message}`);
  }

  async showInput(prompt: string, placeholder?: string): Promise<string | undefined> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question(`${prompt}: `, (answer: string) => {
        rl.close();
        resolve(answer);
      });
    });
  }

  async showQuickPick(items: string[], placeholder?: string): Promise<string | undefined> {
    console.log(`\n${placeholder || 'Select an option'}:`);
    items.forEach((item, index) => {
      console.log(`${index + 1}. ${item}`);
    });
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter your choice (number): ', (answer: string) => {
        rl.close();
        const index = parseInt(answer) - 1;
        resolve(items[index]);
      });
    });
  }

  async getWorkspacePath(): Promise<string> {
    return process.cwd();
  }

  async getProjectType(): Promise<string> {
    try {
      const fs = require('fs');
      const path = require('path');
      
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
        if (packageJson.dependencies?.react) return 'React';
        if (packageJson.dependencies?.vue) return 'Vue';
        if (packageJson.dependencies?.angular) return 'Angular';
        return 'Node.js';
      }
      
      if (fs.existsSync('requirements.txt')) return 'Python';
      if (fs.existsSync('Cargo.toml')) return 'Rust';
      if (fs.existsSync('go.mod')) return 'Go';
      
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  async getDependencies(): Promise<string[]> {
    try {
      const fs = require('fs');
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      return Object.keys(packageJson.dependencies || {});
    } catch {
      return [];
    }
  }
}

/**
 * Factory function to create platform adapters
 */
export function createPlatformAdapter(platform: 'cursor' | 'vscode' | 'npx', vscode?: any): PlatformAdapter {
  switch (platform) {
    case 'cursor':
      return new CursorAIAdapter();
    case 'vscode':
      return new VSCodeAdapter(vscode);
    case 'npx':
      return new NPXAdapter();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
