# 🖖 Three-Tier Dashboard Architecture

## Mission Overview

Design and implement a synchronized state management system across three deployment tiers with proper DDD architecture, security boundaries, and optimized sync schema.

**Crew Coordination**: All teams working in parallel with cross-team knowledge sharing

---

## Architecture Tiers

### **Tier 1: Main Dashboard (Universal)**
- **Purpose**: Universal dashboard managing all projects
- **Access**: Full administrative access
- **State Source**: Supabase (primary) + localStorage (cache)
- **Users**: System administrators, project managers
- **Capabilities**: 
  - Create/manage all projects
  - Access all project dashboards
  - System-wide configuration
  - User management

### **Tier 2: Project Dashboards (User-Controlled)**
- **Purpose**: Individual project dashboards with security-based features
- **Access**: Role-based access control (RBAC)
- **State Source**: Supabase (project-scoped) + localStorage (user cache)
- **Users**: Project owners, authorized team members
- **Capabilities**:
  - Edit project content (based on permissions)
  - Manage project components
  - Configure project settings
  - View project analytics
- **Security**: User permissions determine feature access

### **Tier 3: Published Sites (Read-Only)**
- **Purpose**: Public-facing published sites
- **Access**: Public read, authenticated write (if enabled)
- **State Source**: Supabase (read-only) + CDN cache
- **Users**: Public visitors, authenticated users (limited)
- **Capabilities**:
  - View published content
  - Submit forms (if enabled)
  - No dashboard access
- **Security**: Isolated from dashboard tiers, secure interactions only

---

## State Synchronization Architecture

### **Flow: Client ↔ Controller ↔ Storage**

```
┌─────────────┐
│   Client    │ (localStorage - optimistic cache)
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP/WebSocket
       │
┌──────▼──────────────────┐
│   Controller Layer      │ (n8n/MCP - validation & transformation)
│  - Validation           │
│  - Transformation       │
│  - Access Control       │
│  - Conflict Resolution  │
└──────┬──────────────────┘
       │
       │ PostgreSQL + Vector
       │
┌──────▼──────────────┐
│   Supabase Storage  │ (Vector database - single source of truth)
│  - Project State     │
│  - Vector Embeddings │
│  - Version History   │
│  - Permissions       │
└─────────────────────┘
```

### **Sync Strategy**

1. **Optimistic Updates**: Client updates localStorage immediately
2. **Debounced Sync**: Changes sync to server after 2 seconds of inactivity
3. **Periodic Sync**: Full sync every 30 seconds (configurable)
4. **Conflict Resolution**: Field-level merge with version tracking
5. **Vector Storage**: State stored as vectors for efficient semantic search

---

## Security Model

### **Tier Boundaries**

- **Tier 1 → Tier 2**: Administrative access, can manage all projects
- **Tier 2 → Tier 3**: Publish-only access, cannot access published site dashboard
- **Tier 3**: Isolated, no access to dashboard tiers

### **Access Control**

- **Role-Based Access Control (RBAC)**:
  - `admin`: Full access to Tier 1
  - `project_owner`: Full access to Tier 2 (specific project)
  - `project_editor`: Write access to Tier 2 (specific project)
  - `project_viewer`: Read-only access to Tier 2
  - `public`: Read-only access to Tier 3

### **Security Measures**

- Published sites have no dashboard API access
- Project dashboards are scoped to user permissions
- All state changes validated through n8n controller
- Vector storage includes permission metadata

---

## Sync Schema Design

### **Project State Structure**

```typescript
interface ProjectState {
  projectId: string;
  tier: 'main' | 'project' | 'published';
  userId?: string;
  content: {
    headline: string;
    subheadline: string;
    description: string;
    theme: string;
    components: Component[];
    pages: Record<string, PageContent>;
  };
  metadata: {
    version: number;
    updatedAt: number;
    syncedAt?: number;
    lastSyncBy?: string;
  };
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
}
```

### **Vector Storage Schema**

```sql
CREATE TABLE project_state_vectors (
  id UUID PRIMARY KEY,
  project_id TEXT NOT NULL,
  tier TEXT NOT NULL,
  state_vector vector(1536), -- Embedding of project state
  content JSONB NOT NULL,
  metadata JSONB NOT NULL,
  permissions JSONB,
  version INTEGER NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_project_state_vectors_project ON project_state_vectors(project_id);
CREATE INDEX idx_project_state_vectors_tier ON project_state_vectors(tier);
CREATE INDEX idx_project_state_vectors_vector ON project_state_vectors USING hnsw (state_vector vector_cosine_ops);
```

---

## DDD Layer Boundaries

### **Bounded Contexts**

1. **Dashboard Context** (Tier 1 + Tier 2)
   - Manages project creation, editing, configuration
   - User authentication and authorization
   - State synchronization

2. **Publishing Context** (Tier 3)
   - Serves published content
   - Handles public interactions
   - No dashboard access

3. **Sync Context** (Controller Layer)
   - Validates state changes
   - Resolves conflicts
   - Manages vector storage

### **Communication Patterns**

- **Tier 1 ↔ Tier 2**: Direct API calls with RBAC
- **Tier 2 ↔ Tier 3**: Publish workflow (one-way)
- **All Tiers ↔ Controller**: HTTP/WebSocket via n8n
- **Controller ↔ Storage**: PostgreSQL + Vector operations

---

## Implementation Phases

### **Phase 1: State Sync Manager** ✅
- [x] Create StateSyncManager class
- [x] Implement bidirectional sync
- [x] Conflict resolution
- [x] Periodic sync

### **Phase 2: Three-Tier Routing**
- [ ] Create tier detection logic
- [ ] Implement tier-specific routes
- [ ] Add permission checks

### **Phase 3: Vector Storage**
- [ ] Create Supabase schema
- [ ] Implement vector embedding generation
- [ ] Add semantic search capabilities

### **Phase 4: Security Integration**
- [ ] Implement RBAC system
- [ ] Add tier boundary enforcement
- [ ] Secure published sites

### **Phase 5: Optimization**
- [ ] Incremental sync with change detection
- [ ] Caching strategies
- [ ] Performance monitoring

---

## Crew Recommendations

### **Team Alpha (Data + La Forge)**
- Use timestamp + version for conflict resolution
- Implement incremental sync to minimize network traffic
- Store state as vectors for efficient semantic search

### **Team Beta (Worf + Picard)**
- Enforce strict tier boundaries
- Implement RBAC with role inheritance
- Isolate published sites from dashboard access

### **Team Gamma (Quark + Riker)**
- Optimize sync schema for minimal data transfer
- Use change detection to sync only modified fields
- Implement smart caching at each tier

### **Team Delta (Troi + Uhura)**
- Design clear DDD bounded contexts
- Create intuitive APIs for tier communication
- Ensure user-friendly error handling

### **Team Epsilon (Data + Crusher)**
- Design vector schema for efficient retrieval
- Include metadata for versioning and history
- Monitor sync health and performance

---

## Next Steps

1. Integrate StateSyncManager into state-manager.tsx
2. Create tier detection and routing logic
3. Implement Supabase vector storage schema
4. Add RBAC permission system
5. Test sync across all three tiers
6. Monitor and optimize performance

---

**Generated by**: Crew Coordination System
**Date**: ${new Date().toISOString()}
**Mission ID**: dashboard-architecture-${Date.now()}

