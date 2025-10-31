# Domain-Driven Design: Content Flow Architecture

## ⚠️ Problem Identified
We were mixing AI-generated content with user content, storing only in localStorage without proper DDD flow.

## ✅ Solution: Proper DDD Flow

### **Client <=> n8n <=> Supabase**

```
User Edits Content (Dashboard)
  ↓
React State Manager (updateProject)
  ↓
content-sync.ts (storeProjectContent)
  ↓
n8n webhook: /webhook/project-content-store
  ↓
Supabase (persist user content)
```

### **Retrieval Flow:**

```
Client loads project
  ↓
content-sync.ts (retrieveProjectContent)
  ↓
n8n webhook: /webhook/project-content-retrieve
  ↓
Supabase (fetch user content)
  ↓
Client (display user content, NOT templates)
```

## 📦 Components

### **1. Content Sync Layer** (`lib/content-sync.ts`)
- `storeProjectContent()` - Save to Supabase via n8n
- `retrieveProjectContent()` - Load from Supabase via n8n
- `deleteProjectContent()` - Remove from Supabase via n8n
- `debouncedContentSync()` - Prevent excessive calls

### **2. State Manager** (`lib/state-manager.tsx`)
- Now triggers n8n sync on every update
- localStorage as cache/fallback only

### **3. n8n Webhooks** (to be created)
- `/webhook/project-content-store` - Validate & persist to Supabase
- `/webhook/project-content-retrieve` - Fetch from Supabase
- `/webhook/project-content-delete` - Remove from Supabase

### **4. Supabase Schema** (to be created)
```sql
CREATE TABLE project_content (
  project_id TEXT PRIMARY KEY,
  headline TEXT,
  subheadline TEXT,
  description TEXT,
  theme TEXT,
  business_type TEXT,
  components JSONB,
  pages JSONB,
  updated_at BIGINT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🎯 Benefits

1. **User Content Always Synced** - No data loss
2. **Cross-Device Support** - Access projects anywhere
3. **Proper DDD** - All content flows through n8n => Supabase
4. **AI Templates Separate** - Only used as fallbacks
5. **Crew Learning** - n8n can analyze content patterns

## 📊 Content Types

### **User Content** (DDD Flow)
- Headlines, subheadlines, descriptions
- Component titles & bodies
- Custom page content
- Theme selections
- Business metadata

**✅ Stored: Supabase via n8n**  
**✅ Retrieved: From Supabase via n8n**  
**✅ Cached: localStorage (fallback only)**

### **AI-Generated Templates** (No DDD)
- Initial component suggestions
- Theme recommendations
- Placeholder text

**❌ NOT stored in Supabase**  
**✅ Used only as starter content**  
**✅ Replaced by user edits immediately**

## 🚀 Implementation Status

- [x] Created `lib/content-sync.ts`
- [ ] Integrate with state-manager.tsx
- [ ] Create n8n webhooks
- [ ] Create Supabase schema
- [ ] Update New Project to use proper flow
- [ ] Update Dashboard to sync on edits
- [ ] Add sync status UI indicators

## 🖖 Crew Review

**Commander Data**: "Proper DDD architecture ensures data integrity across distributed systems."  
**Lt. Cmdr. La Forge**: "n8n middleware gives us transformation and validation layer."  
**Captain Picard**: "Make it so. User content deserves proper persistence."
