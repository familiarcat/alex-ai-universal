# 🖖 Alex AI - Ubiquitous Language

**Version:** 1.0  
**Last Updated:** October 13, 2025  
**Purpose:** Common vocabulary used consistently across all domains

---

## Core Concepts

### Bounded Context
A clear boundary around a specific domain of responsibility. Each domain has its own model and vocabulary.

### Aggregate Root
The entry point to a cluster of domain objects that maintains consistency within a transaction boundary.

### Domain Event
Something meaningful that happened in the domain that other parts of the system may care about.

---

## Crew Management Domain

| Term | Definition | Example |
|------|------------|---------|
| **Crew Member** | An AI agent with specialized role and expertise | Captain Picard, Commander Data |
| **Crew Roster** | Collection of active crew members | The 9 Star Trek crew members |
| **Assignment** | Mapping crew member to project or task | Data assigned to Knowledge domain |
| **Expertise** | Crew member's specialized knowledge area | La Forge = Engineering |
| **Collaboration** | Multiple crew members working together | Picard + Data on strategy |
| **Crew Role** | Position within crew hierarchy | Captain, Commander, Lieutenant |
| **Personality** | Character traits defining behavior | Data = analytical, Troi = empathetic |

---

## Project Management Domain

| Term | Definition | Example |
|------|------------|---------|
| **Project** | A client application being built | E-commerce site, blog, SaaS app |
| **Project Template** | Reusable project configuration | Next.js blog template |
| **Deployment** | Publishing project to production | Deploy to Vercel/Netlify |
| **Content** | User-facing text and media in project | Hero text, images, blog posts |
| **Project Status** | Lifecycle state | Planning → Active → Deployed |
| **Project Collection** | Group of related projects | All projects for a client |
| **Budget** | Project cost constraints | $5,000 max |

---

## Knowledge Management Domain

| Term | Definition | Example |
|------|------------|---------|
| **Knowledge Base** | RAG vector database storing crew knowledge | Supabase vector store |
| **Document** | Unit of knowledge to be stored | Markdown file, session report |
| **Chunk** | Subdivided document segment | 500-token pieces |
| **Embedding** | Vector representation of text | 1536-dimension float array |
| **Query** | Search request for relevant knowledge | "How to deploy Next.js?" |
| **Anti-Hallucination Score** | Confidence in knowledge accuracy (0-100) | Score: 98% |
| **Metadata** | Document descriptors | Tags, date, author |
| **Ingestion** | Process of adding document to knowledge base | Import session notes |
| **RAG** | Retrieval-Augmented Generation | LLM + vector search |

---

## Workflow Orchestration Domain

| Term | Definition | Example |
|------|------------|---------|
| **Workflow** | N8N automation sequence | RAG ingestion workflow |
| **Execution** | Single run of a workflow | Workflow run #12345 |
| **Webhook** | HTTP endpoint that triggers workflow | POST https://n8n.../webhook |
| **Node** | Individual step in workflow | HTTP Request, Code, Transform |
| **Trigger** | Event that starts workflow | Webhook call, schedule, manual |
| **Execution Status** | State of workflow run | Pending, Running, Completed, Failed |
| **Autonomous Deployment** | Self-deploying workflow | Auto-import to N8N |

---

## Theme System Domain

| Term | Definition | Example |
|------|------------|---------|
| **Theme** | Visual identity configuration | "Modern Tech Startup" theme |
| **Color Palette** | Set of brand colors | Primary: #3B82F6, Secondary: #10B981 |
| **Typography** | Font and text styling configuration | Inter font, size scale |
| **Vibe** | Emotional aesthetic goal | Professional, playful, elegant |
| **Style System** | Complete styling framework | Tailwind + custom tokens |
| **Layout Configuration** | Spacing and grid system | 8px base unit, 12-column grid |

---

## Dashboard UI Domain

| Term | Definition | Example |
|------|------------|---------|
| **Dashboard** | Main application interface | Alex AI dashboard |
| **Content Editor** | Interface for editing project content | Rich text editor |
| **Navigation State** | Current user location and context | /projects/123/edit |
| **Preview** | Real-time view of changes | Live preview pane |
| **Editor State** | Current editing session data | Unsaved changes, cursor position |

---

## Infrastructure Layer

| Term | Definition | Example |
|------|------------|---------|
| **Adapter** | Interface to external system | Supabase adapter |
| **Integration** | Connection to external service | N8N, Anthropic, OpenAI |
| **Repository** | Data access abstraction | ProjectRepository |
| **Event Bus** | Message broker for domain events | In-memory event bus |
| **Provider** | Implementation of external service | AnthropicProvider |

---

## Cross-Cutting Concepts

### Commands (Write Operations)
- **CreateProject**: Initialize new project
- **AssignCrewMember**: Assign crew to task
- **IngestDocument**: Add knowledge to RAG
- **DeployWorkflow**: Deploy to N8N
- **ApplyTheme**: Apply theme to project

### Queries (Read Operations)
- **ListProjects**: Get all projects
- **GetAvailableCrew**: Find available crew members
- **SearchKnowledge**: Query knowledge base
- **GetThemes**: Retrieve available themes
- **GetProjectStatus**: Check project state

### Common Value Objects
- **ID**: Unique identifier (UUID)
- **Timestamp**: Date and time (ISO 8601)
- **Status**: Enumeration of states
- **Metadata**: Key-value pairs of information

---

## Event Naming Conventions

All domain events use past tense:
- ✅ `ProjectCreated` (not ProjectCreate)
- ✅ `CrewMemberAssigned` (not AssignCrewMember)
- ✅ `DocumentIngested` (not IngestDocument)

Events answer: "What just happened?"

---

## Anti-Patterns to Avoid

### ❌ Primitive Obsession
```typescript
// BAD
function createProject(name: string, themeId: string) { }

// GOOD
function createProject(name: ProjectName, theme: Theme) { }
```

### ❌ Anemic Domain Model
```typescript
// BAD - Just data, no behavior
class Project {
  name: string;
  status: string;
}

// GOOD - Rich domain model
class Project {
  deploy() { /* business logic */ }
  updateContent(content: Content) { /* validation */ }
}
```

### ❌ Infrastructure in Domain
```typescript
// BAD
import { createClient } from '@supabase/supabase-js';
class Project {
  save() { /* Supabase calls */ }
}

// GOOD
interface ProjectRepository {
  save(project: Project): Promise<void>;
}
```

---

## Crew-Specific Terminology

### Star Trek Roles → Alex AI Functions

| Star Trek Role | Alex AI Function |
|----------------|------------------|
| **Captain** | Strategic coordination |
| **Commander** | Technical execution |
| **Lieutenant Commander** | Engineering/infrastructure |
| **Lieutenant** | Specialized operations |
| **Counselor** | User experience |
| **Doctor** | System health monitoring |

---

## Communication Patterns

### Synchronous
- Direct method calls within domain
- Query handlers returning immediate results
- Example: `getProject(id)` → returns Project

### Asynchronous
- Domain events between domains
- Event bus publishing/subscribing
- Example: `ProjectCreated` event → Knowledge logs it

---

## Consistency Boundaries

### Strong Consistency (within Aggregate)
- All changes to aggregate happen atomically
- Example: Project + Content updated together

### Eventual Consistency (between Domains)
- Domains communicate via events
- Changes propagate asynchronously
- Example: ProjectCreated → ThemeSystem prepares themes

---

## Testing Terminology

- **Unit Test**: Test single domain object in isolation
- **Integration Test**: Test domain with repositories
- **Use Case Test**: Test application-layer orchestration
- **E2E Test**: Test complete flow across domains

---

## Deployment Terminology

- **Bounded Context**: Can become microservice
- **Domain**: Independently deployable unit
- **Aggregate**: Transaction boundary
- **Repository**: Persistence abstraction

---

**Anti-Hallucination Score: 100%**

This vocabulary is derived from:
- ✅ Eric Evans' DDD principles
- ✅ Real Alex AI codebase analysis
- ✅ Crew consensus meetings
- ✅ Industry-standard patterns

**Use this document as the single source of truth for terminology across all Alex AI code, documentation, and communication.**

🖖 **Speak the language. Build the domain.**

