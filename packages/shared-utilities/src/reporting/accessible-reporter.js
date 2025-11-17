/**
 * Accessible Reporter
 * 
 * Provides accessible reporting formats
 */

const { MultiFormatReporter } = require('../reporting/multi-format-reporter');

class AccessibleReporter extends MultiFormatReporter {
  toAccessibleText() {
    // Enhanced text format with clear structure
    let output = '';
    if (this.data.title) output += `# ${this.data.title}\n\n`;
    if (this.data.summary) output += `## Summary\n${this.data.summary}\n\n`;
    if (this.data.findings) {
      output += '## Findings\n';
      this.data.findings.forEach((f, i) => {
        output += `${i + 1}. ${f}\n`;
      });
    }
    return output;
  }
  
  toScreenReader() {
    // Format optimized for screen readers
    return this.toAccessibleText();
  }
}

module.exports = { AccessibleReporter };
