# 📅 Milestone Scripts

Scripts for pushing milestones to GitHub and RAG system.

## Scripts

- `push-milestone-to-rag.js` - Main milestone push script (GitHub + MCP RAG)

## Usage

```bash
# Push a milestone
node scripts/milestones/push-milestone-to-rag.js milestones/2025-01/MILESTONE_*.md

# From project root
node scripts/milestones/push-milestone-to-rag.js MILESTONE_*.md
```

## Features

1. **Always pushes to GitHub first** - Ensures version control
2. **Then pushes to RAG via MCP** - Stores in knowledge base
3. **Independent failure handling** - Each step can fail separately
4. **MCP is primary system** - No longer depends on n8n

## Process

1. Reads milestone markdown file
2. Extracts title, date, and content
3. Stages, commits, and pushes to GitHub
4. Stores in MCP RAG system with embeddings
5. Returns success/failure for each step

## Milestone Files

Milestone files are stored in `milestones/` directory organized by date.

