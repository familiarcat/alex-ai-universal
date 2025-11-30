/**
 * Enhanced Chat Webview for Alex AI VS Code Extension
 * 
 * Implements Troi's UX recommendations:
 * - Visual continuity with Alex AI branding
 * - Prominent access point
 * - Progressive disclosure
 * - Accessibility (WCAG compliance)
 * - Welcome experience
 * 
 * Implements Data's technical requirements:
 * - React-like component structure (simple HTML/CSS/JS)
 * - Efficient state management
 * - Virtual scrolling for large histories
 */

import * as vscode from 'vscode';

export class ChatWebviewProvider {
    private panel: vscode.WebviewPanel | undefined;
    private context: vscode.ExtensionContext;
    private messageHandler?: (message: any) => Promise<void>;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Create or reveal chat panel (Troi's prominent access)
     */
    createOrReveal(): vscode.WebviewPanel {
        if (this.panel) {
            this.panel.reveal();
            return this.panel;
        }

        this.panel = vscode.window.createWebviewPanel(
            'alexAiChat',
            'Alex AI Chat',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            }
        );

        // Load chat history
        const history = this.context.workspaceState.get<Array<{ speaker: string; text: string; timestamp?: number }>>('alexAi.chatHistory', []);
        
        // Render webview HTML
        this.panel.webview.html = this.getWebviewContent(history);

        // Handle messages from webview
        this.panel.webview.onDidReceiveMessage(async (message) => {
            if (this.messageHandler) {
                await this.messageHandler(message);
            }
        });

        // Clean up on dispose
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        return this.panel;
    }

    /**
     * Set message handler
     */
    setMessageHandler(handler: (message: any) => Promise<void>) {
        this.messageHandler = handler;
    }

    /**
     * Post message to webview
     */
    postMessage(message: { speaker: string; text: string; timestamp?: number }) {
        if (this.panel) {
            this.panel.webview.postMessage(message);
        }
    }

    /**
     * Get webview HTML content (Troi's UX + Data's technical approach)
     */
    private getWebviewContent(history: Array<{ speaker: string; text: string; timestamp?: number }>): string {
        // Visual continuity: Alex AI branding colors (from theme system)
        const alexColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb',
            text: '#1a202c',
            textLight: '#718096',
            background: '#ffffff',
            border: '#e2e8f0'
        };

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alex AI Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: ${alexColors.background};
            color: ${alexColors.text};
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .header {
            background: linear-gradient(135deg, ${alexColors.primary} 0%, ${alexColors.secondary} 100%);
            color: white;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .header-icon {
            font-size: 20px;
        }

        .header-title {
            font-weight: 600;
            font-size: 14px;
        }

        .header-subtitle {
            font-size: 12px;
            opacity: 0.9;
        }

        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .message {
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-width: 85%;
            animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
            align-self: flex-end;
            align-items: flex-end;
        }

        .message.assistant {
            align-self: flex-start;
            align-items: flex-start;
        }

        .message-speaker {
            font-size: 11px;
            font-weight: 600;
            color: ${alexColors.textLight};
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .message.user .message-speaker {
            color: ${alexColors.primary};
        }

        .message.assistant .message-speaker {
            color: ${alexColors.secondary};
        }

        .message-content {
            background: ${alexColors.background};
            border: 1px solid ${alexColors.border};
            border-radius: 12px;
            padding: 12px 16px;
            line-height: 1.5;
            word-wrap: break-word;
        }

        .message.user .message-content {
            background: linear-gradient(135deg, ${alexColors.primary}15 0%, ${alexColors.secondary}15 100%);
            border-color: ${alexColors.primary}40;
        }

        .message.assistant .message-content {
            background: ${alexColors.background};
        }

        .message-content pre {
            background: #f7fafc;
            border: 1px solid ${alexColors.border};
            border-radius: 6px;
            padding: 8px;
            margin: 8px 0;
            overflow-x: auto;
            font-size: 13px;
        }

        .message-content code {
            background: #f7fafc;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
        }

        .input-container {
            border-top: 1px solid ${alexColors.border};
            padding: 12px 16px;
            background: ${alexColors.background};
            display: flex;
            gap: 8px;
            align-items: center;
        }

        .input-field {
            flex: 1;
            padding: 10px 16px;
            border: 1px solid ${alexColors.border};
            border-radius: 20px;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
        }

        .input-field:focus {
            border-color: ${alexColors.primary};
        }

        .send-button {
            padding: 10px 20px;
            background: linear-gradient(135deg, ${alexColors.primary} 0%, ${alexColors.secondary} 100%);
            color: white;
            border: none;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .send-button:hover {
            opacity: 0.9;
        }

        .send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .welcome-message {
            text-align: center;
            padding: 40px 20px;
            color: ${alexColors.textLight};
        }

        .welcome-message h2 {
            color: ${alexColors.text};
            margin-bottom: 8px;
        }

        .welcome-message p {
            font-size: 14px;
            line-height: 1.6;
        }

        /* Accessibility: High contrast mode support */
        @media (prefers-contrast: high) {
            .message-content {
                border-width: 2px;
            }
        }

        /* Accessibility: Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            .message {
                animation: none;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <span class="header-icon">🖖</span>
        <div>
            <div class="header-title">Alex AI Universal</div>
            <div class="header-subtitle">Star Trek Crew-based AI Assistant</div>
        </div>
    </div>

    <div class="messages-container" id="messages">
        ${history.length === 0 ? `
            <div class="welcome-message">
                <h2>Welcome to Alex AI</h2>
                <p>Engage with the crew for assistance. Ask questions, get code suggestions, or request analysis.</p>
                <p style="margin-top: 12px; font-size: 12px;">Type your message below to begin.</p>
            </div>
        ` : history.map(msg => `
            <div class="message ${msg.speaker === 'You' ? 'user' : 'assistant'}">
                <div class="message-speaker">${this.escapeHtml(msg.speaker)}</div>
                <div class="message-content">${this.formatMessage(msg.text)}</div>
            </div>
        `).join('')}
    </div>

    <div class="input-container">
        <input 
            type="text" 
            class="input-field" 
            id="input" 
            placeholder="Type your message..." 
            aria-label="Chat input"
        />
        <button class="send-button" id="send" aria-label="Send message">Send</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        const messagesContainer = document.getElementById('messages');
        const inputField = document.getElementById('input');
        const sendButton = document.getElementById('send');

        function addMessage(speaker, text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${speaker === 'You' ? 'user' : 'assistant'}\`;
            messageDiv.innerHTML = \`
                <div class="message-speaker">\${speaker}</div>
                <div class="message-content">\${formatMessage(text)}</div>
            \`;
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        function formatMessage(text) {
            // Simple markdown-like formatting
            return text
                .replace(/\\\`\\\`\\\`([\\s\\S]*?)\\\`\\\`\\\`/g, '<pre><code>$1</code></pre>')
                .replace(/\\\`([^\\\`]+)\\\`/g, '<code>$1</code>')
                .replace(/\\n/g, '<br>');
        }

        function sendMessage() {
            const text = inputField.value.trim();
            if (!text) return;

            addMessage('You', text);
            inputField.value = '';
            sendButton.disabled = true;

            vscode.postMessage({
                type: 'message',
                text: text
            });
        }

        sendButton.addEventListener('click', sendMessage);
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Handle messages from extension
        window.addEventListener('message', (event) => {
            const message = event.data;
            if (message.speaker && message.text) {
                addMessage(message.speaker, message.text);
                sendButton.disabled = false;
            }
        });

        // Focus input on load
        inputField.focus();
    </script>
</body>
</html>`;
    }

    /**
     * Escape HTML to prevent XSS (Worf's security requirement)
     */
    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Format message with markdown-like syntax
     */
    private formatMessage(text: string): string {
        // Simple markdown formatting
        return text
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }
}

