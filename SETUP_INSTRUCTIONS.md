# Setup Instructions - Proper DDD Flow

## ✅ **Principle: Client => n8n Controller => Supabase**

---

## 🔧 **Phase 1: n8n Workflows (Manual Import Required)**

### **Step 1: Import Workflows into n8n**

1. Go to: https://n8n.pbradygeorgen.com/workflows
2. Click "Import from File" or "+" to create new workflow
3. Import these 4 workflows:

**Required Workflows:**
```
n8n-workflows/supabase-schema-setup.json      (Setup)
n8n-workflows/project-content-store.json      (Create/Update)
n8n-workflows/project-content-retrieve.json   (Read)
n8n-workflows/project-content-delete.json     (Delete)
```

### **Step 2: Configure Supabase Credentials in n8n**

For each workflow, configure the PostgreSQL node:

1. Open workflow in n8n
2. Click on PostgreSQL node ("Supabase Upsert", "Supabase Select", etc.)
3. Add credentials:
   - **Host**: `db.YOUR_PROJECT_ID.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: Your Supabase service role key
   - **SSL**: ✅ Enable
4. Save workflow
5. Activate workflow (toggle switch)

### **Step 3: Set Environment Variables in n8n**

Add these to n8n environment:
```bash
ADMIN_SETUP_KEY=your-secure-random-key-here
```

### **Step 4: Run Schema Setup**

Once workflows are imported and activated:

```bash
./scripts/setup-supabase-schema.sh
```

This will trigger the n8n workflow to create the Supabase schema via proper DDD flow.

---

## 🚀 **Phase 2: Frontend Integration**

After Phase 1 is complete, the dashboard will automatically sync content via n8n.

### **Workflow:**
```
User edits content
  ↓
Dashboard React state updates
  ↓
content-sync.ts triggers
  ↓
POST https://n8n.pbradygeorgen.com/webhook/project-content-store
  ↓
n8n validates & transforms
  ↓
Supabase stores data
  ↓
Response back to dashboard
```

---

## ✅ **Verification**

### **Test n8n Controller Health:**
```bash
curl https://n8n.pbradygeorgen.com/healthz
# Expected: {"status":"ok"}
```

### **Test Schema Setup (after workflows imported):**
```bash
export N8N_URL="https://n8n.pbradygeorgen.com"
export ADMIN_SETUP_KEY="your-key"
./scripts/setup-supabase-schema.sh
```

### **Test Content Store:**
```bash
curl -X POST https://n8n.pbradygeorgen.com/webhook/project-content-store \
  -H "Content-Type: application/json" \
  -H "X-Source: alex-ai-dashboard" \
  -d '{
    "projectId": "test_123",
    "headline": "Test Project",
    "subheadline": "Testing DDD flow",
    "description": "This is a test",
    "theme": "gradient",
    "components": [],
    "pages": {},
    "updatedAt": 1730400000000
  }'
```

Expected response:
```json
{
  "success": true,
  "projectId": "test_123",
  "version": 1,
  "syncedAt": "2025-10-31T..."
}
```

---

## 🔒 **Security Notes**

### **What's in ~/.zshrc:**
```bash
# ✅ Client only needs n8n Controller URL
export N8N_URL="https://n8n.pbradygeorgen.com"
export ADMIN_SETUP_KEY="your-secure-key"

# ❌ Client should NOT have these:
# export SUPABASE_URL="..."
# export SUPABASE_SERVICE_ROLE_KEY="..."
```

### **What's in n8n environment:**
```bash
# ✅ n8n has database credentials
SUPABASE_URL=https://project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ADMIN_SETUP_KEY=your-secure-key
```

---

## 📚 **DDD Principles**

Read `DDD_PRINCIPLES.md` for detailed explanation of why we NEVER access Supabase directly from client code.

**Key Rule:** 
> Client code should NEVER know that Supabase exists.  
> It should only know that n8n provides data services.

---

## 🖖 **Next Steps**

1. Import n8n workflows (manual)
2. Configure Supabase credentials in n8n
3. Run `./scripts/setup-supabase-schema.sh`
4. Verify with test commands above
5. Phase 2 will integrate with React automatically

All set! The proper DDD architecture is now in place.

