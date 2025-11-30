/**
 * Universal Extension Factory
 * 
 * Creates platform-specific extensions using the Universal Core
 */

import { UniversalAlexAICore, createUniversalCore } from './universal-core';
import { createPlatformAdapter } from './platform-adapters';

/**
 * Create Cursor AI Extension
 */
export function createCursorExtension(): { core: UniversalAlexAICore; commands: any } {
  const adapter = createPlatformAdapter('cursor');
  const core = createUniversalCore(adapter);
  
  const commands = {
    engage: async (message: string) => {
      return await core.processMessage(message);
    },
    status: async () => {
      return await core.processMessage('Show system status');
    }
  };

  return { core, commands };
}

/**
 * Create VS Code Extension
 */
export function createVSCodeExtension(vscode: any): { core: UniversalAlexAICore; commands: any } {
  const adapter = createPlatformAdapter('vscode', vscode);
  const core = createUniversalCore(adapter);
  
  const commands = {
    engage: async (message: string) => {
      return await core.processMessage(message);
    },
    status: async () => {
      return await core.processMessage('Show system status');
    }
  };

  return { core, commands };
}

/**
 * Create NPX CLI Extension
 */
export function createNPXExtension(): { core: UniversalAlexAICore; commands: any } {
  const adapter = createPlatformAdapter('npx');
  const core = createUniversalCore(adapter);
  
  const commands = {
    engage: async (message: string) => {
      return await core.processMessage(message);
    },
    status: async () => {
      return await core.processMessage('Show system status');
    }
  };

  return { core, commands };
}

/**
 * Universal Extension Interface
 */
export interface UniversalExtension {
  core: UniversalAlexAICore;
  commands: {
    engage: (message: string) => Promise<any>;
    status: () => Promise<any>;
  };
}

/**
 * Create Universal Extension for any platform
 */
export function createUniversalExtension(
  platform: 'cursor' | 'vscode' | 'npx',
  vscode?: any
): UniversalExtension {
  switch (platform) {
    case 'cursor':
      return createCursorExtension();
    case 'vscode':
      return createVSCodeExtension(vscode);
    case 'npx':
      return createNPXExtension();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
