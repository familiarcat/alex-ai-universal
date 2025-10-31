# Phase 1: Backend Setup (n8n + Supabase)

## 📋 Overview

This phase establishes the proper DDD backend for user content:
- **Supabase**: PostgreSQL database for content storage
- **n8n**: Webhook middleware for validation/transformation
- **Flow**: Client => n8n => Supabase

---

## 🚀 Quick Start

### Step 1: Setup Supabase Schema

```bash
./scripts/setup-supabase-schema.sh
```

**What it does:**
- Creates `project_content` table (stores user content)
- Creates `project_content_changelog` table (audit log)
- Creates views for active projects and recent changes
- Sets up triggers for version control and logging
- Configures Row Level Security (RLS) for n8n access

**Prerequisites:**
- `psql` installed (`brew install postgresql`)
- `SUPABASE_URL` in `~/.zshrc`
- `SUPABASE_SERVICE_ROLE_KEY` in `~/.zshrc`

---

### Step 2: Setup n8n Workflows

```bash
./scripts/setup-n8n-workflows.sh
```

**What it does:**
- Imports 3 workflows into n8n:
  1. `project-content-store` - Save content to Supabase
  2. `project-content-retrieve` - Load content from Supabase
  3. `project-content-delete` - Soft delete content
- Activates all workflows
- Creates webhook endpoints

**Prerequisites:**
- `N8N_URL` in `~/.zshrc`
- `N8N_API_KEY` in `~/.zshrc`
- `jq` installed (`brew install jq`)

---

### Step 3: Configure Supabase Credentials in n8n

**Manual step required:**

1. Go to: https://n8n.pbradygeorgen.com/workflows
2. Open each workflow:
   - Project Content Store
   - Project Content Retrieve
   - Project Content Delete
3. Click on "Supabase Upsert" / "Supabase Select" / "Supabase Soft Delete" nodes
4. Add PostgreSQL credentials:
   - **Host**: `db.YOUR_PROJECT_ID.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your `SUPABASE_SERVICE_ROLE_KEY`
   - **SSL**: Enable
5. Save and test each workflow

---

## 📊 Supabase Schema

### **project_content** Table
```sql
- project_id (TEXT, PRIMARY KEY) - Unique project ID
- headline (TEXT, NOT NULL) - User's headline
- subheadline (TEXT) - User's subheadline
- description (TEXT) - User's description
- theme (TEXT) - Selected theme
- business_type (TEXT) - Business category
- components (JSONB) - User-created components
- pages (JSONB) - Custom page content
- updated_at (BIGINT) - Client timestamp
- synced_at (TIMESTAMPTZ) - Server timestamp
- created_at (TIMESTAMPTZ) - Creation time
- version (INTEGER) - For conflict resolution
- deleted_at (TIMESTAMPTZ) - Soft delete
```

### **project_content_changelog** Table
```sql
- id (BIGSERIAL, PRIMARY KEY)
- project_id (TEXT) - Related project
- action (TEXT) - 'create', 'update', 'delete'
- changed_fields (JSONB) - What changed
- old_values (JSONB) - Previous state
- new_values (JSONB) - New state
- source (TEXT) - 'dashboard', 'api', 'migration'
- changed_at (TIMESTAMPTZ) - When changed
```

---

## 🔗 n8n Webhook Endpoints

After setup, you'll have these endpoints:

1. **Store Content**
   - URL: `https://n8n.pbradygeorgen.com/webhook/project-content-store`
   - Method: `POST`
   - Headers: `X-Source: alex-ai-dashboard`
   - Body: `{ projectId, headline, subheadline, description, theme, businessType, components, pages, updatedAt }`

2. **Retrieve Content**
   - URL: `https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=PROJECT_ID`
   - Method: `GET`
   - Headers: `X-Source: alex-ai-dashboard`

3. **Delete Content**
   - URL: `https://n8n.pbradygeorgen.com/webhook/project-content-delete`
   - Method: `POST`
   - Headers: `X-Source: alex-ai-dashboard`
   - Body: `{ projectId }`

---

## ✅ Verification

### Test Supabase Connection:
```bash
psql "postgresql://postgres:YOUR_KEY@db.YOUR_PROJECT.supabase.co:5432/postgres" -c "SELECT COUNT(*) FROM project_content;"
```

### Test n8n Webhook (Store):
```bash
curl -X POST https://n8n.pbradygeorgen.com/webhook/project-content-store \
  -H "Content-Type: application/json" \
  -H "X-Source: alex-ai-dashboard" \
  -d '{
    "projectId": "test_project_123",
    "headline": "Test Headline",
    "subheadline": "Test Subheadline",
    "description": "Test Description",
    "theme": "gradient",
    "businessType": "saas",
    "components": [],
    "pages": {},
    "updatedAt": 1234567890000
  }'
```

Expected response:
```json
{
  "success": true,
  "projectId": "test_project_123",
  "version": 1,
  "syncedAt": "2025-10-31T..."
}
```

### Test n8n Webhook (Retrieve):
```bash
curl "https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=test_project_123" \
  -H "X-Source: alex-ai-dashboard"
```

---

## 🐛 Troubleshooting

### Supabase Schema Errors:
- **Error: connection refused**: Check `SUPABASE_URL` and firewall
- **Error: authentication failed**: Verify `SUPABASE_SERVICE_ROLE_KEY`
- **Error: relation exists**: Schema already created (safe to ignore)

### n8n Workflow Errors:
- **Error: 401 Unauthorized**: Check `N8N_API_KEY`
- **Error: workflow not found**: Import workflows manually via UI
- **Webhook not responding**: Check workflow is activated

---

## 📁 Files Created

```
supabase/
  └── schema-project-content.sql

n8n-workflows/
  ├── project-content-store.json
  ├── project-content-retrieve.json
  └── project-content-delete.json

scripts/
  ├── setup-supabase-schema.sh
  └── setup-n8n-workflows.sh
```

---

## ⏭️ Next: Phase 2

Once Phase 1 is complete, proceed to Phase 2:
- Integrate `content-sync.ts` with `state-manager.tsx`
- Add sync status UI indicators
- Remove AI template content from rendering
- Test end-to-end DDD flow

See: `ARCHITECTURE_DDD_CONTENT_FLOW.md`

