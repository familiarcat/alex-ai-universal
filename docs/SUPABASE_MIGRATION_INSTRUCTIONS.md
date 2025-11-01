# Supabase Migration Instructions

## DDD Philosophy: Infrastructure vs Application

**Infrastructure Setup (One-time Admin Operations):**
- Creating database schema (tables, indexes, constraints)
- Configuring n8n credentials
- Setting up RLS policies

**Application Logic (MUST use DDD flow):**
- Creating/updating/deleting projects
- Querying project data
- All CRUD operations from dashboard

---

## Step 1: Run Supabase Migration

### Option A: Supabase Dashboard (Recommended)

1. **Go to Supabase SQL Editor:**
   ```
   https://app.supabase.com/project/YOUR_PROJECT_ID/sql/new
   ```

2. **Copy the migration SQL:**
   - Open: `supabase/migrations/001_create_projects_table.sql`
   - Copy entire contents

3. **Paste and Run:**
   - Paste SQL into Supabase SQL Editor
   - Click "Run" button
   - Verify success message

4. **Verify Table Created:**
   ```sql
   SELECT * FROM projects ORDER BY project_id;
   ```
   
   You should see 4 rows (alpha, beta, gamma, temporal) auto-inserted.

---

### Option B: Supabase CLI (Advanced)

```bash
# If you have Supabase CLI installed
npx supabase db push

# Or via psql
psql $DATABASE_URL -f supabase/migrations/001_create_projects_table.sql
```

---

## Step 2: Configure n8n Supabase Credentials

1. **Go to n8n Credentials:**
   ```
   https://n8n.pbradygeorgen.com/credentials
   ```

2. **Create New Credential:**
   - Click "+ Add Credential"
   - Select "Supabase"

3. **Enter Details:**
   ```
   Name: Supabase Account
   Host: https://YOUR_PROJECT.supabase.co
   Service Role Key: eyJ... (from Supabase Settings > API)
   ```

4. **Test Connection:**
   - Click "Test" button
   - Should show "Connection successful"

5. **Save Credential**

---

## Step 3: Update n8n Workflows with Credential

Each workflow has a placeholder `SUPABASE_CREDENTIAL_ID`. Update them:

1. **Open each workflow in n8n:**
   - Project Content Store
   - Project Content Retrieve
   - Project Content Delete

2. **For each Supabase node:**
   - Click on the Supabase node
   - Select Credential: "Supabase Account"
   - Save workflow

3. **Verify all 3 workflows are active**

---

## Step 4: Test DDD Flow

### Test 1: Store Project via n8n (DDD: Client => n8n => Supabase)

```bash
curl -X POST "https://n8n.pbradygeorgen.com/webhook/project-content-store" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-ddd",
    "headline": "DDD Test Project",
    "subheadline": "Testing proper architecture",
    "description": "This goes through n8n, not direct to Supabase",
    "theme": "midnight",
    "projectType": "business"
  }'
```

Expected: `{"success": true, "projectId": "test-ddd", ...}`

### Test 2: Retrieve Project via n8n

```bash
curl "https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=alpha"
```

Expected: `{"projectId": "alpha", "headline": "✨ Discover Your Next Obsession", ...}`

### Test 3: Verify in Supabase

```sql
SELECT project_id, headline, project_type, created_at 
FROM projects 
ORDER BY created_at DESC 
LIMIT 5;
```

Should show: alpha, beta, gamma, temporal, and test-ddd

---

## Step 5: Seed Default Projects (DDD Way)

**IMPORTANT: This uses n8n webhooks, NOT direct Supabase writes!**

```bash
cd dashboard
npm run seed:projects
```

This script:
1. Reads default project data
2. POSTs to n8n `/webhook/project-content-store`
3. n8n validates and transforms
4. n8n writes to Supabase
5. Returns success/failure

**This is proper DDD! ✅**

---

## Verification Checklist

- [ ] Supabase `projects` table exists
- [ ] Table has 4 default rows (alpha, beta, gamma, temporal)
- [ ] n8n Supabase credential configured
- [ ] All 3 workflows have credential selected
- [ ] All 3 workflows are active (green toggle)
- [ ] Test webhook responds successfully
- [ ] Seed script completes without errors
- [ ] Dashboard loads projects from Supabase (not localStorage)

---

## DDD Principles Maintained

✅ **Schema Migration:** Direct to Supabase (infrastructure setup)  
✅ **Credential Config:** Via n8n UI (infrastructure setup)  
✅ **Project Seeding:** Via n8n webhooks (application logic)  
✅ **CRUD Operations:** Via n8n webhooks (application logic)  
❌ **NEVER:** Client => Supabase directly  

---

## Troubleshooting

**If seeding fails:**
1. Check n8n workflow execution logs
2. Verify Supabase credential is correct
3. Check Supabase RLS policies allow inserts
4. Test webhook manually with curl first

**If dashboard still uses localStorage:**
1. Clear browser localStorage
2. Hard refresh (Cmd+Shift+R)
3. Check browser console for fetch errors
4. Verify n8n webhooks are reachable

---

## Next: Update Dashboard to Load from Supabase

Once migration and seeding are complete, we need to update:

`dashboard/lib/state-manager.tsx`:
- Add `useEffect` to fetch from Supabase on mount
- Keep localStorage as optimistic cache only
- Show loading state while fetching
- Handle fetch failures gracefully

This will complete the DDD architecture!

