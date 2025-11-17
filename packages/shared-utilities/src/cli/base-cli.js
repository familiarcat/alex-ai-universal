/**
 * Base CLI Interface
 * 
 * Provides consistent CLI patterns for all tools
 */

class BaseCLI {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.commands = [];
  }
  
  command(name, description, handler) {
    this.commands.push({ name, description, handler });
    return this;
  }
  
  async execute(args) {
    const command = args[0];
    const cmd = this.commands.find(c => c.name === command);
    
    if (!cmd) {
      console.log(`Usage: ${this.name} <command>`);
      console.log(`\nCommands:`);
      this.commands.forEach(c => {
        console.log(`  ${c.name.padEnd(20)} ${c.description}`);
      });
      return;
    }
    
    await cmd.handler(args.slice(1));
  }
}

module.exports = { BaseCLI };
