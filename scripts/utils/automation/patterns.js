/**
 * Automation Pattern Utilities
 * 
 * Reusable patterns for script automation
 */

class AutomationPatterns {
  /**
   * Execute command with error handling
   */
  static async executeCommand(command, options = {}) {
    const { execSync } = require('child_process');
    const { silent = false, cwd = process.cwd() } = options;
    
    try {
      const result = execSync(command, {
        cwd,
        stdio: silent ? 'pipe' : 'inherit',
        encoding: 'utf8'
      });
      return { success: true, output: result };
    } catch (error) {
      return { success: false, error: error.message, output: error.stdout };
    }
  }
  
  /**
   * Run multiple commands in sequence
   */
  static async runSequence(commands, options = {}) {
    const results = [];
    for (const cmd of commands) {
      const result = await this.executeCommand(cmd, options);
      results.push(result);
      if (!result.success && !options.continueOnError) {
        throw new Error(`Command failed: ${cmd}`);
      }
    }
    return results;
  }
  
  /**
   * Run commands in parallel
   */
  static async runParallel(commands, options = {}) {
    const { execSync } = require('child_process');
    const { silent = false, cwd = process.cwd() } = options;
    
    const promises = commands.map(cmd => {
      return new Promise((resolve) => {
        try {
          const result = execSync(cmd, {
            cwd,
            stdio: silent ? 'pipe' : 'inherit',
            encoding: 'utf8'
          });
          resolve({ success: true, command: cmd, output: result });
        } catch (error) {
          resolve({ success: false, command: cmd, error: error.message });
        }
      });
    });
    
    return await Promise.all(promises);
  }
}

module.exports = { AutomationPatterns };
