# n8n Webhook Configuration Reference

**Instance**: i-0afdf313f61f22df0  
**Host**: n8n.pbradygeorgen.com  
**Total Workflows**: 38 active  
**Workflows with Webhooks**: 28

---

## Critical DDD Architecture Webhooks (Fix These First!)

### 1. User Settings Store
- **Workflow ID**: xN7Lh0QbqJIukrha
- **Name**: User Settings Store (Dashboard => Supabase)
- **Webhook Path**: `/webhook/settings-store`
- **Method**: POST
- **Purpose**: Sync globalTheme from client to Supabase
- **Test**: `curl -X POST https://n8n.pbradygeorgen.com/webhook/settings-store -d '{"userId":"default","globalTheme":"midnight"}'`

### 2. User Settings Retrieve
- **Workflow ID**: yPZwYv1VGm5pkTgE
- **Name**: User Settings Retrieve (Dashboard <= Supabase)
- **Webhook Path**: `/webhook/settings-retrieve`
- **Method**: GET
- **Purpose**: Load globalTheme from Supabase on mount
- **Test**: `curl https://n8n.pbradygeorgen.com/webhook/settings-retrieve?userId=default`

### 3. Knowledge Ingest (RAG System)
- **Workflow ID**: N6vrRsrIEWR7ZyTq
- **Name**: Knowledge Ingest (Crew Memories => Supabase RAG)
- **Webhook Path**: `/webhook/knowledge-ingest`
- **Method**: POST
- **Purpose**: Store crew memories in knowledge_base table
- **Test**: `curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest -d '{"title":"test"}'`

### 4. Project Content Store
- **Workflow ID**: 2eoq8ycgL5M8dG7z
- **Name**: Project Content Store (Dashboard => Supabase)
- **Webhook Path**: `/webhook/project-content-store`
- **Method**: POST
- **Purpose**: Save project edits to Supabase
- **Test**: `curl -X POST https://n8n.pbradygeorgen.com/webhook/project-content-store`

### 5. Project Content Retrieve
- **Workflow ID**: NmxfBurDWPEQDqeE
- **Name**: Project Content Retrieve (Supabase => Dashboard)
- **Webhook Path**: `/webhook/project-content-retrieve`
- **Method**: GET
- **Purpose**: Load project data from Supabase
- **Test**: `curl https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=alpha`

### 6. Project Content Delete
- **Workflow ID**: bgfljtVeLVCSnfI5
- **Name**: Project Content Delete (Dashboard => Supabase)
- **Webhook Path**: `/webhook/project-content-delete`
- **Method**: POST
- **Purpose**: Soft-delete projects from Supabase
- **Test**: `curl -X POST https://n8n.pbradygeorgen.com/webhook/project-content-delete`

---

## Crew Member Webhooks (Production)

### 7. Captain Picard
- **ID**: xz1Op8tLhe6dd3yV
- **Path**: `/webhook/crew-captain-jean-luc-picard`
- **Method**: POST

### 8. Commander Data
- **ID**: RxCX3376Du6xW727
- **Path**: `/webhook/crew-commander-data`
- **Method**: POST

### 9. Commander Riker
- **ID**: BFh2I9TwxN9871uO
- **Path**: `/webhook/crew-commander-william-riker`
- **Method**: POST

### 10. Lt. Cmdr. La Forge
- **ID**: ogsUoPCp5KjNf3Or
- **Path**: `/webhook/crew-lieutenant-commander-geordi-la-forge`
- **Method**: POST

### 11. Lt. Worf
- **ID**: Jz3TVht94wnjr5Q7
- **Path**: `/webhook/crew-lieutenant-worf`
- **Method**: POST

### 12. Counselor Troi
- **ID**: ozPdtlXJ7mkB3jkc
- **Path**: `/webhook/crew-counselor-deanna-troi`
- **Method**: POST

### 13. Dr. Crusher
- **ID**: FZjbB8fmomNvH7et
- **Path**: `/webhook/crew-dr-beverly-crusher`
- **Method**: POST

### 14. Lt. Uhura
- **ID**: ALug4ov1cTS754pV
- **Path**: `/webhook/crew-lieutenant-uhura`
- **Method**: POST

### 15. Chief O'Brien
- **ID**: MuaWfFowlkSDefSP
- **Path**: `/webhook/crew-chief-obrien`
- **Method**: POST

### 16. Quark
- **ID**: neFZ70goRnt6qUNm
- **Path**: `/webhook/crew-quark-optimized`
- **Method**: POST

---

## Other Production Webhooks

### 17. Observation Lounge
- **ID**: w1kjBmfzPVKwoKe2
- **Path**: `/webhook/observation-lounge`
- **Method**: POST

### 18. Knowledge Base Ingestion
- **ID**: H6XdAiXtcLj1WZgj
- **Path**: `/webhook/ingest-knowledge`
- **Method**: POST

### 19-28. Various Project & Utility Workflows
(See full list above)

---

## Fix All Webhooks At Once

**The Fix**: Set `WEBHOOK_URL` environment variable on EC2

Once `WEBHOOK_URL=https://n8n.pbradygeorgen.com` is set and n8n restarts, ALL 28 webhooks will register automatically!

You don't need to configure each webhook individually - fixing the root cause (WEBHOOK_URL) fixes them all.

---

## Verification Tests (After Fix)

### Critical Path (DDD Architecture)
```bash
# Settings
curl https://n8n.pbradygeorgen.com/webhook/settings-retrieve?userId=default
curl -X POST https://n8n.pbradygeorgen.com/webhook/settings-store -d '{}'

# RAG
curl -X POST https://n8n.pbradygeorgen.com/webhook/knowledge-ingest -d '{}'

# Projects
curl https://n8n.pbradygeorgen.com/webhook/project-content-retrieve?projectId=alpha
curl -X POST https://n8n.pbradygeorgen.com/webhook/project-content-store -d '{}'
```

### Expected Results
- **Before fix**: All return 404
- **After fix**: Return 400/405/422 (webhook exists, needs proper payload)

---

## Summary

**Total Active Workflows**: 38  
**Workflows with Webhooks**: 28  
**Critical for DDD**: 6 (settings, knowledge, projects)  
**Crew Webhooks**: 10  
**Other Production**: 12  

**Single Fix Repairs All**: Set `WEBHOOK_URL` environment variable ✅

