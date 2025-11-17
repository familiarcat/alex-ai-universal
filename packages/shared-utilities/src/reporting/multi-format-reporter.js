/**
 * Multi-Format Reporter
 * 
 * Provides consistent reporting across text, JSON, and summary formats
 */

class MultiFormatReporter {
  constructor(data) {
    this.data = data;
  }
  
  toText() {
    // Generate text format
    let output = '';
    if (this.data.title) output += `${this.data.title}\n\n`;
    if (this.data.summary) output += `Summary: ${this.data.summary}\n\n`;
    if (this.data.findings) {
      output += 'Findings:\n';
      this.data.findings.forEach((f, i) => {
        output += `  ${i + 1}. ${f}\n`;
      });
    }
    return output;
  }
  
  toJSON() {
    return JSON.stringify(this.data, null, 2);
  }
  
  toSummary() {
    return {
      title: this.data.title,
      summary: this.data.summary,
      keyFindings: this.data.findings?.slice(0, 3) || [],
      timestamp: new Date().toISOString()
    };
  }
  
  save(outputPath, format = 'text') {
    let content;
    let extension;
    
    switch (format) {
      case 'json':
        content = this.toJSON();
        extension = 'json';
        break;
      case 'summary':
        content = JSON.stringify(this.toSummary(), null, 2);
        extension = 'json';
        break;
      default:
        content = this.toText();
        extension = 'txt';
    }
    
    const fs = require('fs');
    const path = require('path');
    const fullPath = `${outputPath}.${extension}`;
    fs.writeFileSync(fullPath, content);
    return fullPath;
  }
}

module.exports = { MultiFormatReporter };
