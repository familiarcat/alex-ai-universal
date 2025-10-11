const vscode = require('vscode');

function activate(context) {
    console.log('🚀 Alex AI Universal extension is now active!');

    const engageCommand = vscode.commands.registerCommand('alex-ai.engage', async () => {
        const userInput = await vscode.window.showInputBox({
            prompt: 'Engage Alex AI',
            placeHolder: 'Ask the crew for assistance...'
        });

        if (userInput) {
            const crewResponse = `# 🚀 Alex AI Universal Response

## Captain Picard - Strategic Leadership

From a strategic perspective, I recommend analyzing this situation comprehensively. Your request "${userInput}" requires careful consideration of the broader implications and long-term objectives.

---

## 🤖 Crew Coordination

**Zero-Artifact Guarantee**: ✅ Active - No files will be created in your project.

**Available Crew Members**:
- 👨‍✈️ Captain Picard - Strategic Leadership
- 🤖 Commander Data - Advanced Analytics  
- 👨‍✈️ Commander Riker - Tactical Execution
- 🔧 Lt. Cmdr. Geordi - Engineering Solutions
- 🛡️ Lieutenant Worf - Security & Defense
- 💚 Counselor Troi - Emotional Intelligence
- 🏥 Dr. Crusher - System Health
- 📡 Lieutenant Uhura - Communications
- 💰 Quark - Business Intelligence

**How to Engage**: Use the Command Palette (Ctrl+Shift+P) and search for "Alex AI: Engage"

---
*"Make it so!"* - Captain Picard 🖖`;

            const doc = await vscode.workspace.openTextDocument({
                content: crewResponse,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage('Alex AI crew has responded! Check the new document.');
        }
    });

    const statusCommand = vscode.commands.registerCommand('alex-ai.status', async () => {
        vscode.window.showInformationMessage('🚀 Alex AI Universal Status: All crew members are ready!');
    });

    context.subscriptions.push(engageCommand, statusCommand);

    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = '$(star) Alex AI';
    statusBarItem.tooltip = 'Alex AI Universal - Star Trek Crew-based AI Assistant';
    statusBarItem.command = 'alex-ai.engage';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    console.log('✅ Alex AI Universal extension initialized');
}

function deactivate() {
    console.log('🛑 Alex AI Universal extension deactivated');
}

module.exports = { activate, deactivate };






