# Quick Start: DDD Workflow System

**Deploy the entire Client => n8n => Supabase architecture in 5 minutes.**

---

## Prerequisites

Add to `~/.zshrc`:

```bash
export N8N_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="your-n8n-api-key"
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"  # NOT anon key!
```

Then: `source ~/.zshrc`

---

## 5-Minute Deployment

### Step 1: Deploy Workflows (1 minute)

```bash
cd alex-ai-universal
node scripts/deploy-ddd-workflows.js
```

**What it does:**
- ✅ Creates Supabase credential in n8n
- ✅ Deploys 3 workflows from git
- ✅ Links credentials
- ✅ Activates workflows
- ✅ Tests webhooks

### Step 2: Create Database Table (2 minutes)

```bash
# Open Supabase SQL Editor
open "https://supabase.com/dashboard/project/$(echo $SUPABASE_URL | cut -d'/' -f3 | cut -d'.' -f1)/sql"

# Paste and run:
# supabase/migrations/001_create_projects_table.sql
```

### Step 3: Seed Data (1 minute)

```bash
node scripts/seed-projects-to-supabase.js
```

### Step 4: Verify (1 minute)

```bash
node scripts/verify-workflow-webhooks.js
```

**Expected:**
```
✅ Project Content Store: Active, Table: projects
✅ Project Content Retrieve: Active, Table: projects, Webhook: 200
✅ Project Content Delete: Active, Table: projects
```

---

## Done! 🎉

Your DDD architecture is deployed:
- Client (Dashboard) => n8n (Controller) => Supabase (Database)

Test it:
```bash
curl "https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=temporal"
```

---

## Troubleshooting

**Webhooks return 404?**
1. Open each workflow in n8n UI
2. Click "Save" (even with no changes)
3. This forces webhook re-registration

**"Table not found"?**
- Run the SQL migration in Supabase

**"Error fetching options"?**
- Verify using `SUPABASE_SERVICE_KEY` (not `anon`)
- Ensure `SUPABASE_URL` includes `https://`

---

## Next Steps

- Read full docs: `docs/DDD-WORKFLOW-SYSTEM.md`
- Deploy guide: `n8n-workflows/ddd-architecture/README.md`
- Update workflows: `scripts/export-n8n-workflows.js`

---

🖖 **Welcome to the DDD architecture!**

