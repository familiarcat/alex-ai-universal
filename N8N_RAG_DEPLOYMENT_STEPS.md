# 🖖 N8N RAG Workflow - Manual Deployment Steps

**Date:** October 13, 2025  
**Type:** Manual Deployment Guide  
**Time Required:** 15 minutes  
**Prerequisites:** N8N access, OpenAI API key, Supabase credentials

---

## 🎯 OVERVIEW

Step-by-step instructions to deploy the RAG knowledge base workflow to N8N [[memory:8187266]].

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### **1. Verify Supabase Database**
```bash
# Test Supabase connection
psql -h your-project.supabase.co -U postgres -d postgres -c "SELECT version();"
```

### **2. Deploy Database Schema**
```bash
# Deploy RAG schema
psql -h your-project.supabase.co -U postgres -d postgres \
  -f supabase/rag-knowledge-base-schema.sql
```

**Expected Output:**
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE INDEX
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE FUNCTION
CREATE FUNCTION
CREATE FUNCTION
CREATE FUNCTION
✅ Schema deployed successfully
```

### **3. Verify Tables Created**
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('knowledge_base', 'rag_ingestion_log');
```

---

## 🚀 N8N WORKFLOW IMPORT

### **Step 1: Access N8N**
1. Open browser
2. Navigate to: `https://n8n.pbradygeorgen.com`
3. Login with your credentials [[memory:8187266]]

### **Step 2: Import Workflow**
1. Click **"Workflows"** in sidebar
2. Click **"Add Workflow"** (or **"+" button**)
3. Click **"Import from File"** or **three-dot menu → Import**
4. Select file: `n8n-workflows/knowledge-base-rag-ingestion.json`
5. Click **"Import"**

**Expected Result:** Workflow opens in editor

### **Step 3: Configure OpenAI Credentials**
1. Find **"Generate OpenAI Embeddings"** node
2. Click on the node
3. Under **"Credential to connect with"**:
   - If credential exists: Select "OpenAI API"
   - If not: Click **"+ Create New"**
     - Name: "OpenAI API"
     - API Key: `YOUR_OPENAI_API_KEY`
     - Click **"Save"**

### **Step 4: Configure Supabase Credentials**
1. Find **"Store in Supabase"** node
2. Click on the node
3. Under **"Credential to connect with"**:
   - If credential exists: Select "Supabase"
   - If not: Click **"+ Create New"**
     - Name: "Supabase"
     - Host: `your-project.supabase.co`
     - Service Role Secret: `YOUR_SERVICE_ROLE_KEY`
     - Click **"Save"**

4. Repeat for **"Log Error"** and **"Log Success"** nodes

### **Step 5: Get Webhook URL**
1. Click on **"Webhook Trigger"** node
2. Find **"Test URL"** or **"Production URL"**
3. Copy the URL (format: `https://n8n.pbradygeorgen.com/webhook/ingest-knowledge`)
4. Save this URL - you'll need it!

### **Step 6: Activate Workflow**
1. Toggle **"Active"** switch in top-right corner
2. Workflow should show **green "Active"** status
3. Webhook is now listening!

---

## ✅ VERIFICATION STEPS

### **Test 1: Webhook Connectivity**
```bash
# Test webhook responds
curl -X POST https://n8n.pbradygeorgen.com/webhook/ingest-knowledge \
  -H "Content-Type: application/json" \
  -d '{"test": true, "documents": []}'
```

**Expected:** HTTP 200 response

### **Test 2: Database Write**
```sql
-- Check if tables are writable
INSERT INTO rag_ingestion_log (session_id, status, document_title)
VALUES ('test-session', 'success', 'Test Document');

-- Verify
SELECT * FROM rag_ingestion_log WHERE session_id = 'test-session';

-- Cleanup
DELETE FROM rag_ingestion_log WHERE session_id = 'test-session';
```

### **Test 3: Full Pipeline**
```bash
# Prepare test payload
cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal
node scripts/prepare-rag-knowledge-base.js test-session-$(date +%s)

# Ingest
N8N_WEBHOOK_URL=https://n8n.pbradygeorgen.com/webhook/ingest-knowledge \
  node scripts/ingest-to-rag.js
```

**Expected Output:**
```
✅ Knowledge base updated successfully!
📊 Session: test-session-...
📁 Documents: 4
⏰ Timestamp: 2025-10-13...
```

### **Test 4: Query Knowledge**
```sql
-- Count chunks created
SELECT COUNT(*) FROM knowledge_base;

-- View recent entries
SELECT title, LEFT(content, 100), created_at 
FROM knowledge_base 
ORDER BY created_at DESC 
LIMIT 5;

-- Test vector search (if embeddings exist)
SELECT title, metadata 
FROM knowledge_base 
WHERE embedding IS NOT NULL 
LIMIT 3;
```

---

## 🔧 TROUBLESHOOTING

### **Issue: Workflow Import Fails**
**Symptom:** "Invalid workflow JSON"  
**Solution:** 
- Verify JSON is valid: `cat n8n-workflows/knowledge-base-rag-ingestion.json | jq .`
- Re-download from GitHub
- Check for file corruption

### **Issue: OpenAI Credential Fails**
**Symptom:** "Authentication failed"  
**Solution:**
- Verify API key at: https://platform.openai.com/api-keys
- Ensure key has permissions
- Check billing is active

### **Issue: Supabase Connection Fails**
**Symptom:** "Could not connect to Supabase"  
**Solution:**
- Verify service role key (not anon key!)
- Check database is running
- Verify host URL format: `abc123.supabase.co` (no https://)

### **Issue: Webhook Returns 404**
**Symptom:** Curl returns 404  
**Solution:**
- Verify workflow is **Active** (green toggle)
- Check webhook path in URL
- Try Test URL instead of Production URL

### **Issue: No Embeddings Generated**
**Symptom:** Entries in database but embedding is NULL  
**Solution:**
- Check OpenAI API key is valid
- Verify model name: "text-embedding-3-small"
- Check N8N execution log for errors

---

## 📊 MONITORING

### **Check N8N Executions**
1. Go to **"Executions"** in N8N
2. View recent workflow runs
3. Check for errors (red)
4. Click execution to see detailed flow

### **Monitor Supabase**
```sql
-- Ingestion statistics
SELECT * FROM get_ingestion_stats();

-- Recent logs
SELECT * FROM rag_ingestion_log 
ORDER BY timestamp DESC 
LIMIT 20;

-- Storage usage
SELECT 
  COUNT(*) as total_chunks,
  COUNT(DISTINCT session_id) as sessions,
  pg_size_pretty(pg_total_relation_size('knowledge_base')) as size
FROM knowledge_base;
```

---

## 🎯 SUCCESS CRITERIA

- [ ] Workflow imported and active in N8N
- [ ] OpenAI credentials configured
- [ ] Supabase credentials configured
- [ ] Webhook URL copied
- [ ] Test webhook returns 200
- [ ] Database schema deployed
- [ ] Test ingestion completes
- [ ] Knowledge queryable in Supabase

---

## 🖖 ESTIMATED TIME

- **Database Setup:** 5 minutes
- **N8N Import & Config:** 5 minutes
- **Testing:** 5 minutes
- **Total:** 15 minutes

---

## 📚 NEXT STEPS AFTER DEPLOYMENT

1. **Ingest Current Session:**
   ```bash
   node scripts/prepare-rag-knowledge-base.js nextjs-integration-2025-10-13
   node scripts/ingest-to-rag.js
   ```

2. **Verify Knowledge:**
   ```sql
   SELECT title, metadata->>'priority' as priority
   FROM knowledge_base
   WHERE session_id = 'nextjs-integration-2025-10-13';
   ```

3. **Test Search:**
   ```
   Ask AI: "What did we learn about Next.js architecture?"
   ```

4. **Run Cleanup (after verification):**
   ```bash
   ./cleanup-redundant-files.sh
   ```

---

**🖖 Ready to deploy! Follow these steps and your knowledge will be immortal!**

**Reviewed by:** Lieutenant Uhura (Communication), Lt. Cmdr. La Forge (Implementation)

