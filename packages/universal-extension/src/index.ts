/**
 * Universal Extension Core for VSCode, Cursor AI, and NPX
 */

import { createUniversalExtension, createCursorExtension, createVSCodeExtension, createNPXExtension } from './extension-factory';
import { UniversalAlexAICore, createUniversalCore } from './universal-core';
import { createPlatformAdapter } from './platform-adapters';

export { 
  createUniversalExtension,
  createCursorExtension, 
  createVSCodeExtension, 
  createNPXExtension,
  UniversalAlexAICore,
  createUniversalCore,
  createPlatformAdapter
};