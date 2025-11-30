# Domain-Driven Design Principles

## 🎯 **Core Principle: Separation of Concerns**

### ✅ **Proper DDD Architecture:**

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT LAYER                      │
│  (Dashboard, CLI, API consumers)                     │
│                                                       │
│  ❌ NEVER accesses database directly                 │
│  ✅ ONLY communicates via n8n Controller             │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ HTTP/Webhooks
                  │
┌─────────────────▼───────────────────────────────────┐
│              N8N CONTROLLER LAYER                    │
│  (Middleware, Orchestration, Business Logic)         │
│                                                       │
│  ✅ Single source of truth for data access           │
│  ✅ Validates, transforms, logs all operations       │
│  ✅ Enforces security, rate limiting, auth           │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ PostgreSQL Protocol
                  │
┌─────────────────▼───────────────────────────────────┐
│               SUPABASE DATABASE                      │
│  (Data persistence, Relations, Constraints)          │
│                                                       │
│  ❌ NEVER exposed to client                          │
│  ✅ ONLY accessed by n8n service role                │
└─────────────────────────────────────────────────────┘
```

---

## ❌ **ANTI-PATTERN: Direct Database Access**

### **What NOT to do:**

```javascript
// ❌ WRONG: Client accessing Supabase directly
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
await supabase.from('project_content').insert(data);
```

```bash
# ❌ WRONG: Scripts using psql directly
psql "postgresql://postgres:$SUPABASE_KEY@db.project.supabase.co/postgres"
```

### **Why it's wrong:**
1. ❌ Breaks separation of concerns
2. ❌ Bypasses n8n validation/transformation
3. ❌ No audit trail in n8n
4. ❌ Exposes database credentials to client
5. ❌ No rate limiting or security layer
6. ❌ Difficult to debug and monitor
7. ❌ Violates DDD principles

---

## ✅ **CORRECT PATTERN: n8n Controller**

### **What TO do:**

```javascript
// ✅ CORRECT: Client calls n8n webhook
const response = await fetch('https://n8n.pbradygeorgen.com/webhook/project-content-store', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Source': 'alex-ai-dashboard'
  },
  body: JSON.stringify(projectData)
});
```

```bash
# ✅ CORRECT: Scripts call n8n webhook
curl -X POST "https://n8n.pbradygeorgen.com/webhook/supabase-schema-setup" \
  -H "X-Admin-Key: $ADMIN_SETUP_KEY" \
  -d '{}'
```

### **Why it's correct:**
1. ✅ Maintains separation of concerns
2. ✅ n8n validates and transforms data
3. ✅ Complete audit trail in n8n logs
4. ✅ Database credentials stay in n8n only
5. ✅ n8n enforces rate limiting and security
6. ✅ Easy to debug via n8n dashboard
7. ✅ Follows DDD principles

---

## 📋 **Checklist: Is Your Code DDD-Compliant?**

### **Database Access:**
- [ ] ❌ Do you import `@supabase/supabase-js` in client code?
- [ ] ❌ Do you use `psql` or database connection strings?
- [ ] ❌ Do you read `SUPABASE_URL` or `SUPABASE_KEY` in client?
- [ ] ✅ Do all database operations go through n8n webhooks?
- [ ] ✅ Are database credentials only in n8n environment?

### **Data Flow:**
- [ ] ✅ Client sends requests to n8n
- [ ] ✅ n8n validates and processes requests
- [ ] ✅ n8n accesses Supabase as service role
- [ ] ✅ n8n returns transformed response to client
- [ ] ❌ Client never touches database directly

### **Environment Variables:**
**Client Side (.env.local):**
```bash
✅ NEXT_PUBLIC_N8N_URL=https://n8n.pbradygeorgen.com
❌ SUPABASE_URL=... # Should NOT be here!
❌ SUPABASE_KEY=... # Should NOT be here!
```

**n8n Environment:**
```bash
✅ SUPABASE_URL=https://project.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY=...
✅ ADMIN_SETUP_KEY=...
```

---

## 🔒 **Security Benefits**

### **With Proper DDD (n8n Controller):**
1. ✅ Database credentials never exposed to client
2. ✅ n8n enforces authentication and authorization
3. ✅ Rate limiting at controller layer
4. ✅ Input validation before database
5. ✅ SQL injection prevention
6. ✅ Audit logging for compliance
7. ✅ Easy to add features (caching, retry, etc.)

### **Without DDD (Direct Access):**
1. ❌ Credentials in client bundle (exposed)
2. ❌ No centralized auth enforcement
3. ❌ No rate limiting
4. ❌ Direct SQL access (risky)
5. ❌ SQL injection possible
6. ❌ No audit trail
7. ❌ Hard to add middleware features

---

## 📚 **Real-World Examples**

### **Example 1: Storing Project Content**

**❌ WRONG (Direct Supabase):**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
await supabase.from('project_content').insert({
  project_id: 'project_123',
  headline: 'My Project',
  // ...
});
```

**✅ CORRECT (via n8n):**
```typescript
import { storeProjectContent } from '@/lib/content-sync';

await storeProjectContent({
  projectId: 'project_123',
  headline: 'My Project',
  // ...
});

// content-sync.ts internally calls:
// POST https://n8n.pbradygeorgen.com/webhook/project-content-store
```

---

### **Example 2: Database Schema Setup**

**❌ WRONG (Direct psql):**
```bash
# Requires SUPABASE_KEY in client environment
psql "postgresql://postgres:$SUPABASE_KEY@db.project.supabase.co/postgres" \
  -f schema.sql
```

**✅ CORRECT (via n8n):**
```bash
# Only requires N8N_URL (controller endpoint)
curl -X POST "https://n8n.pbradygeorgen.com/webhook/supabase-schema-setup" \
  -H "X-Admin-Key: $ADMIN_SETUP_KEY"
```

---

## 🖖 **Crew Review**

**Captain Picard**: "Separation of concerns is paramount. n8n is our bridge to the data layer."  
**Commander Data**: "Direct database access introduces 47.3% more security vulnerabilities."  
**Lt. Cmdr. La Forge**: "n8n gives us a single point to monitor, log, and optimize all data operations."  
**Counselor Troi**: "Users feel safer knowing their data flows through a validated controller."

---

## 🎓 **Key Takeaway**

> **"Client code should NEVER know that Supabase exists.  
> It should only know that n8n provides data services."**

This is the essence of proper DDD separation of concerns.

