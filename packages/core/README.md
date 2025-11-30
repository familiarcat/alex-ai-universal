# @alex-ai/core

**Alex AI Core Package - Central Integration Hub**

This package provides the core Alex AI functionality that all sub-projects in the monorepo can use to integrate with the Alex AI system, N8N Federation Crew, and all advanced capabilities.

## 🚀 Features

- **N8N Federation Crew Integration** - Single source of truth for all credentials
- **Universal Credential Management** - Automatic loading from ~/.zshrc and N8N
- **Stealth Scraping Service** - IP-protected web scraping with anti-detection
- **Crew Management** - Alex AI crew coordination and task assignment
- **Unified Data Service** - Centralized data access with fallback mechanisms
- **Comprehensive Testing** - Built-in testing and monitoring capabilities

## 📦 Installation

```bash
pnpm add @alex-ai/core
```

## 🔧 Quick Start

```typescript
import { initializeAlexAI, getAlexAI } from '@alex-ai/core'

// Initialize Alex AI
const alexAI = await initializeAlexAI({
  environment: 'development',
  enableN8NIntegration: true,
  enableStealthScraping: true,
  enableCrewManagement: true
})

// Get system status
const status = await alexAI.getStatus()
console.log('Alex AI Status:', status)
```

## 🎯 Core Services

### AlexAIManager
Central manager that coordinates all Alex AI services.

```typescript
import { AlexAIManager } from '@alex-ai/core'

const manager = AlexAIManager.getInstance()
await manager.initialize()

// Access all services
const credentialsManager = manager.getCredentialsManager()
const dataService = manager.getDataService()
const stealthService = manager.getStealthService()
const crewManager = manager.getCrewManager()
```

### N8NCredentialsManager
Manages all credentials through N8N Federation Crew.

```typescript
import { N8NCredentialsManager } from '@alex-ai/core'

const credentialsManager = new N8NCredentialsManager()

// Get all credentials
const credentials = await credentialsManager.getCredentials()

// Get specific credentials
const supabaseCreds = await credentialsManager.getSupabaseCredentials()
const n8nCreds = await credentialsManager.getN8NCredentials()
const openaiCreds = await credentialsManager.getOpenAICredentials()

// Test connection
const isConnected = await credentialsManager.testConnection()
```

### UnifiedDataService
Provides unified data access across all data sources.

```typescript
import { UnifiedDataService } from '@alex-ai/core'

const dataService = new UnifiedDataService()

// Get job opportunities (tries N8N → Supabase → Local fallback)
const jobs = await dataService.getJobOpportunities()

// Get contacts
const contacts = await dataService.getContacts()

// Check data sources
const sources = dataService.getDataSources()
```

### StealthScrapingService
IP-protected web scraping with anti-detection measures.

```typescript
import { StealthScrapingService } from '@alex-ai/core'

const stealthService = new StealthScrapingService()

// Start stealth scraping job
const job = await stealthService.startScrapingJob({
  source: 'linkedin',
  searchTerm: 'AI Engineer',
  location: 'St. Louis, MO',
  maxResults: 10
})

// Check job status
const status = stealthService.getJobStatus(job.id)
```

### AlexAICrewManager
Manages Alex AI crew members and their interactions.

```typescript
import { AlexAICrewManager } from '@alex-ai/core'

const crewManager = new AlexAICrewManager()

// Get all crew members
const members = crewManager.getCrewMembers()

// Assign task to crew member
const interaction = await crewManager.assignTask('technical_lead', {
  type: 'code_review',
  data: { file: 'src/app.ts', priority: 'high' }
})

// Complete task
await crewManager.completeTask(interaction.id, {
  result: 'Code review completed',
  recommendations: ['Add error handling', 'Optimize performance']
})
```

## 🔐 Credential Management

Alex AI automatically loads credentials from:
1. **N8N Federation Crew** (primary source)
2. **~/.zshrc** (fallback for development)
3. **Environment variables** (fallback)

## 🧪 Testing

```typescript
import { getAlexAI } from '@alex-ai/core'

const alexAI = getAlexAI()

// Run comprehensive tests
const testResults = await alexAI.runTests()
console.log('Test Results:', testResults)
```

## 📊 Monitoring

```typescript
import { getAlexAIStatus } from '@alex-ai/core'

const status = await getAlexAIStatus()
console.log('Alex AI System Status:', {
  initialized: status.isInitialized,
  n8nConnection: status.n8nConnection,
  supabaseConnection: status.supabaseConnection,
  crewStatus: status.crewStatus,
  version: status.version
})
```

## 🚀 CLI Commands

```bash
# Initialize Alex AI
pnpm run alex-ai:init

# Check system status
pnpm run alex-ai:status

# Run tests
pnpm run alex-ai:test
```

## 📚 Documentation

For complete integration guide, see:
- [Alex AI Monorepo Integration Guide](../../ALEX_AI_MONOREPO_INTEGRATION_GUIDE.md)
- [Alex AI Milestone v2.0](../../ALEX_AI_MILESTONE_v2.0.md)

## 🤝 Contributing

This package is part of the Alex AI monorepo. See the main repository for contribution guidelines.

## 📄 License

MIT License - see LICENSE file for details.
