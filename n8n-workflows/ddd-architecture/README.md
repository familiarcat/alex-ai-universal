# DDD Architecture: Client => n8n => Supabase

**Domain-Driven Design** workflow system for Alex AI Universal Dashboard

---

## 🏛️ Architecture Overview

```
┌─────────────┐       ┌──────────┐       ┌───────────┐
│   Client    │ ───▶  │   n8n    │ ───▶  │ Supabase  │
│ (Dashboard) │       │(Controller)      │ (Database)│
└─────────────┘       └──────────┘       └───────────┘
```

**Prime Directive:** Client NEVER accesses Supabase directly.  
All database operations flow through n8n as the controller layer.

---

## 📁 Workflow Files

### 1. `project-content-store.json`
**Purpose:** Create/Update projects  
**Method:** POST  
**Webhook:** `/webhook/project-content-store`  
**Flow:**
- Receives project data from dashboard
- Validates required fields (projectId, headline)
- Transforms to Supabase schema
- Upserts to `projects` table
- Returns success/error response

### 2. `project-content-retrieve.json`
**Purpose:** Read projects  
**Method:** GET  
**Webhook:** `/webhook/project-content-retrieve?projectId=<id>`  
**Flow:**
- Extracts projectId from query params
- Queries Supabase for non-deleted project
- Transforms Supabase data to dashboard format
- Returns project data or 404

### 3. `project-content-delete.json`
**Purpose:** Soft-delete projects  
**Method:** POST  
**Webhook:** `/webhook/project-content-delete`  
**Flow:**
- Receives projectId from request body
- Sets `deleted_at` timestamp in Supabase
- Returns success confirmation

---

## 🚀 Deployment

### Initial Setup (New Environment)

```bash
# 1. Export workflows from existing n8n (if updating)
node scripts/export-n8n-workflows.js

# 2. Deploy to n8n (creates/updates workflows)
node scripts/deploy-ddd-workflows.js

# 3. Seed initial data to Supabase
node scripts/seed-projects-to-supabase.js

# 4. Verify webhooks
node scripts/verify-workflow-webhooks.js
```

### Prerequisites

Ensure these environment variables are in `~/.zshrc`:
```bash
export N8N_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="your-api-key"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"  # NOT anon key!
```

---

## 🔧 Maintenance

### Updating Workflows

1. Make changes in n8n UI
2. Export updated workflows:
   ```bash
   node scripts/export-n8n-workflows.js
   ```
3. Review changes in git diff
4. Commit to version control
5. Deploy to other environments:
   ```bash
   node scripts/deploy-ddd-workflows.js
   ```

### Troubleshooting

**Webhooks return 404:**
- Open each workflow in n8n UI
- Click "Save" button (even if no changes)
- This forces webhook re-registration

**Supabase connection errors:**
- Verify you're using `SUPABASE_SERVICE_KEY` (not `anon` key)
- Ensure `SUPABASE_URL` includes `https://`
- Check credential is linked to all Supabase nodes

**"Table not found" errors:**
- Run Supabase migration: `supabase/migrations/001_create_projects_table.sql`
- Or manually create `projects` table in Supabase UI

---

## 📊 Database Schema

### `projects` Table

```sql
CREATE TABLE projects (
  project_id TEXT PRIMARY KEY,
  headline TEXT NOT NULL,
  subheadline TEXT,
  description TEXT,
  theme TEXT DEFAULT 'midnight',
  project_type TEXT DEFAULT 'business' CHECK (project_type IN ('business', 'creative')),
  business_type TEXT,
  components JSONB,
  pages JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
```

---

## 🧪 Testing

### Manual Webhook Tests

```bash
# Retrieve project
curl "https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=temporal"

# Store project
curl -X POST https://n8n.pbradygeorgen.com/webhook/project-content-store \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test",
    "headline": "Test Project",
    "theme": "midnight",
    "projectType": "business"
  }'

# Delete project
curl -X POST https://n8n.pbradygeorgen.com/webhook/project-content-delete \
  -H "Content-Type: application/json" \
  -d '{"projectId": "test"}'
```

### Automated Verification

```bash
node scripts/verify-workflow-webhooks.js
```

---

## 🎯 Design Principles

1. **Single Source of Truth:** n8n workflows are versioned in git
2. **Credential Isolation:** Supabase credentials never exposed to client
3. **Separation of Concerns:** n8n handles business logic, Supabase handles persistence
4. **Soft Deletes:** Never hard-delete data, use `deleted_at` timestamp
5. **Idempotent Operations:** Upserts can be safely retried
6. **Validation First:** All data validated before hitting database

---

## 📚 Related Documentation

- `supabase/migrations/001_create_projects_table.sql` - Database schema
- `dashboard/lib/content-sync.ts` - Client-side sync functions
- `dashboard/lib/state-manager.tsx` - State management with n8n integration
- `scripts/seed-projects-to-supabase.js` - Initial data seeding

---

## 👥 Crew Attribution

- **Captain Picard:** Architecture design, separation of concerns
- **Chief O'Brien:** Implementation, automation scripts
- **Commander Data:** Workflow logic, validation
- **Counselor Troi:** UX flow, error messages
- **Lt. Commander La Forge:** Infrastructure, Supabase integration

---

## 🖖 Live Long and Persist Data

*"In the pursuit of excellence, we find that the best architectures are those that respect boundaries."*  
— Captain Jean-Luc Picard

