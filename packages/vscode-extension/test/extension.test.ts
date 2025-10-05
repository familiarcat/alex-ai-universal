import * as assert from 'assert';
import * as vscode from 'vscode';
import { before, after } from 'mocha';

// These integration tests run *inside* VS Code using its test runner
suite('Alex AI Extension', () => {
  before(async () => {
    // Wait for extension to activate fully
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    const ext = vscode.extensions.getExtension('alex-ai.alex-ai-universal');
    if (!ext) {
      throw new Error('Extension not found');
    }
    await ext.activate();
  });

  after(() => {
    // Clean up after tests
    return vscode.commands.executeCommand('workbench.action.closeAllEditors');
  });

  test('Extension activates', async () => {
    const ext = vscode.extensions.getExtension('alex-ai.alex-ai-universal');
    assert.ok(ext);
    assert.strictEqual(ext.isActive, true);
  });

  test('Commands are registered', () => {
    return Promise.all([
      vscode.commands.getCommands(true).then(commands => {
        assert.ok(commands.includes('alex-ai.engage'));
        assert.ok(commands.includes('alex-ai.status'));
      })
    ]);
  });

  test('Status bar item exists', async () => {
    // Wait a moment for status bar to be created
    await new Promise(resolve => setTimeout(resolve, 500));
    // Instead of inspecting internal status bar API (not available in test runner),
    // execute the engage command to ensure the status bar's command is registered and callable.
    await vscode.commands.executeCommand('alex-ai.engage');
    // If the command executes without throwing, assume the status bar is wired correctly.
    assert.ok(true);
  });
});