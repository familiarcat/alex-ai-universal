/**
 * Natural Language Command Helper
 * 
 * Helps parse natural language into CLI commands
 */

class NaturalLanguageHelper {
  constructor() {
    this.commandMap = {
      'cost': ['cost', 'costs', 'cost analysis', 'compare costs', 'aws costs'],
      'health': ['health', 'health check', 'system health', 'health status'],
      'status': ['status', 'system status', 'check status']
    };
  }
  
  parseCommand(message) {
    const lower = message.toLowerCase();
    
    for (const [command, keywords] of Object.entries(this.commandMap)) {
      if (keywords.some(keyword => lower.includes(keyword))) {
        return command;
      }
    }
    
    return null;
  }
  
  isCommand(message) {
    return this.parseCommand(message) !== null;
  }
}

module.exports = { NaturalLanguageHelper };
