const assert = require('assert');
const vscode = require('vscode');

suite('Alex AI Extension', () => {
  test('Extension activates', async () => {
    const ext = vscode.extensions.getExtension('alex-ai.alex-ai-universal');
    if (!ext) throw new Error('Extension not found');
    await ext.activate();
    assert.strictEqual(ext.isActive, true);
  });

  test('Commands are registered', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('alex-ai.engage'));
    assert.ok(commands.includes('alex-ai.status'));
  });
  
  const assert = require('assert');
  const vscode = require('vscode');
  
  test('Open webview panel command completes', async () => {
    // Execute the command that opens the panel
    await vscode.commands.executeCommand('alex-ai.openPanel');
    // If no exception was thrown, we consider this a pass. Optionally we could inspect open panels via internal APIs.
    assert.ok(true);
  });
});
