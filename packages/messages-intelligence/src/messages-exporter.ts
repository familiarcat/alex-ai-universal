import Database from 'better-sqlite3';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as readline from 'readline';
import { format } from 'date-fns';
import sharp from 'sharp';
import { Message, Conversation, ExportOptions, ExportResult } from './types';

export class MessagesExporter {
  private db: Database.Database | null = null;
  private readonly messagesDbPath: string;
  private readonly attachmentsPath: string;

  constructor() {
    const homeDir = require('os').homedir();
    this.messagesDbPath = path.join(homeDir, 'Library/Messages/chat.db');
    this.attachmentsPath = path.join(homeDir, 'Library/Messages/Attachments');
  }

  /**
   * Initialize the database connection
   */
  private async initializeDatabase(): Promise<void> {
    try {
      if (!await fs.pathExists(this.messagesDbPath)) {
        throw new Error(`Messages database not found at ${this.messagesDbPath}. Please ensure you have granted Full Disk Access to Terminal.`);
      }
      
      this.db = new Database(this.messagesDbPath, { readonly: true });
      console.log('✅ Connected to Messages database');
    } catch (error) {
      throw new Error(`Failed to connect to Messages database: ${error}`);
    }
  }

  /**
   * Get all available conversations
   */
  async getConversations(): Promise<Conversation[]> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    const query = `
      SELECT 
        chat.guid as id,
        COALESCE(chat.display_name, 'Unknown') as name,
        COUNT(message.ROWID) as messageCount,
        MAX(message.date/1000000000 + 978307200) as lastMessage,
        MIN(message.date/1000000000 + 978307200) as firstMessage,
        GROUP_CONCAT(DISTINCT handle.id) as participants
      FROM chat
      LEFT JOIN chat_message_join ON chat.ROWID = chat_message_join.chat_id
      LEFT JOIN message ON chat_message_join.message_id = message.ROWID
      LEFT JOIN handle ON message.handle_id = handle.ROWID
      GROUP BY chat.ROWID, chat.guid, chat.display_name
      HAVING messageCount > 0
      ORDER BY lastMessage DESC
    `;

    const rows = this.db!.prepare(query).all() as any[];
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      messageCount: row.messageCount,
      lastMessage: new Date(row.lastMessage * 1000),
      firstMessage: new Date(row.firstMessage * 1000),
      participants: row.participants ? row.participants.split(',') : []
    }));
  }

  /**
   * Get messages for a specific conversation within a date range
   */
  async getMessages(conversationId: string, startDate?: Date, endDate?: Date): Promise<Message[]> {
    if (!this.db) {
      await this.initializeDatabase();
    }

    let query = `
      SELECT 
        message.ROWID as id,
        message.text,
        message.date/1000000000 + 978307200 as date,
        COALESCE(handle.id, 'Unknown') as sender,
        message.is_from_me as isFromMe,
        attachment.filename as attachmentPath,
        attachment.mime_type as attachmentType
      FROM message
      LEFT JOIN handle ON message.handle_id = handle.ROWID
      LEFT JOIN chat_message_join ON message.ROWID = chat_message_join.message_id
      LEFT JOIN chat ON chat_message_join.chat_id = chat.ROWID
      LEFT JOIN message_attachment_join ON message.ROWID = message_attachment_join.message_id
      LEFT JOIN attachment ON message_attachment_join.attachment_id = attachment.ROWID
      WHERE chat.guid = ?
    `;

    const params: any[] = [conversationId];

    if (startDate) {
      query += ' AND message.date/1000000000 + 978307200 >= ?';
      params.push(startDate.getTime() / 1000);
    }

    if (endDate) {
      query += ' AND message.date/1000000000 + 978307200 <= ?';
      params.push(endDate.getTime() / 1000);
    }

    query += ' ORDER BY message.date ASC';

    const rows = this.db!.prepare(query).all(...params) as any[];
    
    return rows.map(row => ({
      id: row.id,
      text: row.text || '',
      date: new Date(row.date * 1000),
      sender: row.sender,
      isFromMe: Boolean(row.isFromMe),
      attachmentPath: row.attachmentPath,
      attachmentType: row.attachmentType
    }));
  }

  /**
   * Export conversation to files
   */
  async exportConversation(options: ExportOptions): Promise<ExportResult> {
    try {
      const messages = await this.getMessages(options.conversationId, options.startDate, options.endDate);
      
      if (messages.length === 0) {
        return {
          success: false,
          outputPath: '',
          messageCount: 0,
          error: 'No messages found in the specified date range'
        };
      }

      // Create output directory
      const conversationName = this.sanitizeFilename(options.conversationId);
      const dateRange = `${format(options.startDate, 'yyyy-MM-dd')}_to_${format(options.endDate, 'yyyy-MM-dd')}`;
      const folderName = `${conversationName}_${dateRange}`;
      const outputPath = path.join(options.outputDirectory, folderName);
      
      await fs.ensureDir(outputPath);
      await fs.ensureDir(path.join(outputPath, 'images'));

      let markdownPath: string | undefined;
      let pdfPath: string | undefined;
      let imagesPath: string | undefined;

      if (options.format === 'markdown' || options.format === 'both') {
        markdownPath = await this.exportToMarkdown(messages, outputPath, options);
      }

      if (options.format === 'pdf' || options.format === 'both') {
        pdfPath = await this.exportToPDF(messages, outputPath, options);
      }

      if (options.includeImages) {
        imagesPath = await this.exportImages(messages, outputPath);
      }

      return {
        success: true,
        outputPath,
        markdownPath,
        pdfPath,
        imagesPath,
        messageCount: messages.length
      };

    } catch (error) {
      return {
        success: false,
        outputPath: '',
        messageCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Export messages to Markdown format
   */
  private async exportToMarkdown(messages: Message[], outputPath: string, options: ExportOptions): Promise<string> {
    const markdownPath = path.join(outputPath, 'conversation.md');
    
    let markdown = `# Conversation Export\n\n`;
    markdown += `**Date Range:** ${format(options.startDate, 'PPP')} - ${format(options.endDate, 'PPP')}\n`;
    markdown += `**Total Messages:** ${messages.length}\n\n`;
    markdown += `---\n\n`;

    for (const message of messages) {
      const timestamp = format(message.date, 'yyyy-MM-dd HH:mm:ss');
      const sender = message.isFromMe ? 'You' : message.sender;
      
      markdown += `**${sender}** - ${timestamp}\n\n`;
      
      if (message.text) {
        markdown += `${message.text}\n\n`;
      }
      
      if (message.attachmentPath && options.includeImages) {
        const imageName = `image_${message.id}`;
        const extension = path.extname(message.attachmentPath);
        markdown += `![Attachment](./images/${imageName}${extension})\n\n`;
      }
      
      markdown += `---\n\n`;
    }

    await fs.writeFile(markdownPath, markdown, 'utf8');
    return markdownPath;
  }

  /**
   * Export messages to PDF format (simplified HTML to PDF)
   */
  private async exportToPDF(messages: Message[], outputPath: string, options: ExportOptions): Promise<string> {
    const pdfPath = path.join(outputPath, 'conversation.pdf');
    
    // For now, we'll create an HTML version that can be converted to PDF
    // In a full implementation, you'd use puppeteer or similar
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Conversation Export</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px; }
            .message { margin-bottom: 20px; padding: 15px; border-left: 4px solid #007AFF; background: #f9f9f9; }
            .sender { font-weight: bold; color: #007AFF; }
            .timestamp { color: #666; font-size: 0.9em; }
            .text { margin: 10px 0; }
            .attachment { margin: 10px 0; font-style: italic; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Conversation Export</h1>
            <p><strong>Date Range:</strong> ${format(options.startDate, 'PPP')} - ${format(options.endDate, 'PPP')}</p>
            <p><strong>Total Messages:</strong> ${messages.length}</p>
        </div>
    `;

    for (const message of messages) {
      const timestamp = format(message.date, 'yyyy-MM-dd HH:mm:ss');
      const sender = message.isFromMe ? 'You' : message.sender;
      
      html += `
        <div class="message">
            <div class="sender">${sender}</div>
            <div class="timestamp">${timestamp}</div>
            <div class="text">${message.text || ''}</div>
            ${message.attachmentPath && options.includeImages ? 
              `<div class="attachment">📎 ${message.attachmentPath}</div>` : ''}
        </div>
      `;
    }

    html += `</body></html>`;
    
    await fs.writeFile(pdfPath.replace('.pdf', '.html'), html, 'utf8');
    
    // Note: For actual PDF generation, you'd use puppeteer here
    // For now, we'll return the HTML path
    return pdfPath.replace('.pdf', '.html');
  }

  /**
   * Export images and attachments
   */
  private async exportImages(messages: Message[], outputPath: string): Promise<string> {
    const imagesPath = path.join(outputPath, 'images');
    let exportedCount = 0;

    for (const message of messages) {
      if (message.attachmentPath) {
        const sourcePath = path.join(this.attachmentsPath, message.attachmentPath);
        
        if (await fs.pathExists(sourcePath)) {
          const extension = path.extname(message.attachmentPath);
          const imageName = `image_${message.id}${extension}`;
          const destPath = path.join(imagesPath, imageName);
          
          try {
            // Optimize image if it's an image file
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension.toLowerCase())) {
              await sharp(sourcePath)
                .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(destPath.replace(extension, '.jpg'));
            } else {
              await fs.copy(sourcePath, destPath);
            }
            exportedCount++;
          } catch (error) {
            console.warn(`Failed to export attachment: ${message.attachmentPath}`);
          }
        }
      }
    }

    return imagesPath;
  }

  /**
   * Sanitize filename for safe file system usage
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-z0-9]/gi, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase();
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}
