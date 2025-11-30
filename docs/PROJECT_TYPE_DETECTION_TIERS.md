# Project Type Detection Tiers

## Overview

The Alex AI system uses a hierarchical tier system for project type detection, allowing for precise categorization at multiple levels.

## Tier Structure

### Tier 1: Category (Highest Level)
The broadest classification of the project:

- **`framework`** - Full-stack frameworks (Next.js, Nuxt, Remix, SvelteKit, NestJS, etc.)
- **`application`** - Standalone applications
- **`library`** - Reusable libraries/packages
- **`tool`** - CLI tools, utilities, development tools
- **`monorepo`** - Monorepo structure (Turborepo, pnpm workspaces, Lerna, Nx)
- **`unknown`** - Unable to determine

### Tier 2: Technology/Framework
Specific technology or framework being used:

**Web Frameworks:**
- `nextjs` - Next.js
- `nuxt` - Nuxt.js
- `remix` - Remix
- `sveltekit` - SvelteKit

**UI Frameworks:**
- `react` - React
- `vue` - Vue.js
- `angular` - Angular
- `svelte` - Svelte

**Backend Frameworks:**
- `express` - Express.js
- `fastify` - Fastify
- `nestjs` - NestJS

**Languages:**
- `node` - Node.js
- `python` - Python
- `rust` - Rust
- `go` - Go
- `java` - Java

### Tier 3: Language
Primary programming language:

- `typescript` - TypeScript
- `javascript` - JavaScript
- `python` - Python
- `rust` - Rust
- `go` - Go
- `java` - Java

## Detection Logic

### Framework Detection
A project is classified as a **framework** (Tier 1) when it:
1. Uses a full-stack framework (Next.js, Nuxt, Remix, SvelteKit)
2. Has routing, SSR, or full-stack capabilities
3. Provides both frontend and backend functionality

### Monorepo Detection
A project is classified as a **monorepo** (Tier 1) when it:
1. Contains `turbo.json` + `package.json`
2. Contains `pnpm-workspace.yaml`
3. Contains `lerna.json`
4. Contains `nx.json`

### Tool Detection
A project is classified as a **tool** (Tier 1) when it:
1. Has a `bin` entry in `package.json`
2. Is primarily a CLI utility
3. Name includes "cli" or "tool"

## Usage

### Shell Integration
The shell intelligence script (`alex-ai-monorepo-shell-intelligence.sh`) uses the enhanced project type detector to display:
- Project category (Tier 1)
- Technology (Tier 2)
- Language (Tier 3)

### Configuration File
The `.alex-ai-config.json` file stores the detected project type information:

```json
{
  "project": {
    "name": "alex-ai-universal",
    "category": "monorepo",
    "technology": "node",
    "framework": "monorepo",
    "language": "typescript",
    "packageManager": "npm",
    "isMonorepo": true,
    "confidence": 90
  }
}
```

## Detection Script

The `scripts/enhanced-project-type-detector.js` script provides:
- Multi-tier detection
- Confidence scoring
- Package manager detection
- Monorepo detection
- Framework vs library distinction

### Running the Detector

```bash
node scripts/enhanced-project-type-detector.js
```

Output:
```json
{
  "category": "monorepo",
  "technology": "node",
  "language": "typescript",
  "isMonorepo": true,
  "packageManager": "npm",
  "confidence": 90
}
```

## Examples

### Next.js Application
```json
{
  "category": "framework",
  "technology": "nextjs",
  "language": "typescript",
  "isMonorepo": false,
  "packageManager": "npm",
  "confidence": 50
}
```

### React Library
```json
{
  "category": "library",
  "technology": "react",
  "language": "typescript",
  "isMonorepo": false,
  "packageManager": "npm",
  "confidence": 40
}
```

### CLI Tool
```json
{
  "category": "tool",
  "technology": "node",
  "language": "typescript",
  "isMonorepo": false,
  "packageManager": "npm",
  "confidence": 30
}
```

### Monorepo
```json
{
  "category": "monorepo",
  "technology": "node",
  "language": "typescript",
  "isMonorepo": true,
  "packageManager": "npm",
  "confidence": 90
}
```

## Integration Points

1. **Shell Prompt** - Displays project category in terminal
2. **Configuration File** - Stores detected type for persistence
3. **Crew Coordination** - Uses project type for context-aware assistance
4. **Workflow Automation** - Adapts behavior based on project type

