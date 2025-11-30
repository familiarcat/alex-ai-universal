# Natural Language CLI Pattern

This pattern enables natural language prompts to trigger specific CLI commands.

## Implementation Pattern

```typescript
// 1. Define keyword detection function
private isFeatureRequest(message: string): boolean {
  const keywords = ['feature keyword 1', 'feature keyword 2'];
  return keywords.some(keyword => message.toLowerCase().includes(keyword));
}

// 2. Add handler method
async handleFeature(options?: FeatureOptions): Promise<void> {
  // Implementation
}

// 3. Integrate into handleEngagement
async handleEngagement(message: string): Promise<void> {
  if (this.isFeatureRequest(message)) {
    await this.handleFeature();
    return;
  }
  // ... other handlers
}

// 4. Add CLI command
program
  .command('feature')
  .description('Feature description')
  .action(async (options) => {
    await handler.handleFeature(options);
  });
```

## Usage

Users can trigger features via:
- Natural language: "compare costs", "cost analysis", "show costs"
- CLI command: `npx alex-ai costs`
- Chat mode: Type natural language in chat interface
