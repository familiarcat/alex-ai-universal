# DDD Architecture: User Settings

**Crew Decision**: UNANIMOUS 6/6 ✅  
**Milestone**: v1.5.0  
**Date**: November 2, 2025

## Problem Statement

We identified a **DDD architecture violation** in how global theme preferences were stored:

```
❌ BEFORE:
- globalTheme stored ONLY in localStorage
- No Supabase table for user settings
- No n8n workflows for settings sync
- Caused hydration errors (server/client mismatch)
- Settings not portable across devices
```

This violated our core DDD principle: **"All persistent state flows through n8n to Supabase"**

## Solution: Proper DDD for User Settings

### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │────────▶│     n8n     │────────▶│  Supabase   │
│  Dashboard  │         │  Workflows  │         │    RLS      │
│             │◀────────│             │◀────────│             │
└─────────────┘         └─────────────┘         └─────────────┘
     ▲                                                ▲
     │                                                │
     └────────── localStorage (cache only) ──────────┘
```

- **Client**: React state manager (dashboard)
- **n8n**: Controller layer (validation, transformation)
- **Supabase**: Source of truth (persistent storage with RLS)
- **localStorage**: Optimistic cache only

### Implementation

#### 1. Supabase Schema

**Table**: `user_settings`

```sql
CREATE TABLE user_settings (
  user_id TEXT PRIMARY KEY DEFAULT 'default',
  global_theme TEXT DEFAULT 'midnight',
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Features**:
- Row Level Security (RLS) policies
- Auto-update triggers
- JSONB for future preference extensibility
- Single-user MVP (`user_id = 'default'`)

#### 2. n8n Workflows

**Workflow 1**: `settings-store`
- **Method**: POST
- **Path**: `/webhook/settings-store`
- **Function**: Validates and upserts user settings to Supabase
- **Payload**:
  ```json
  {
    "userId": "default",
    "globalTheme": "cyberpunk",
    "preferences": {}
  }
  ```

**Workflow 2**: `settings-retrieve`
- **Method**: GET
- **Path**: `/webhook/settings-retrieve?userId=default`
- **Function**: Retrieves settings from Supabase
- **Response**:
  ```json
  {
    "userId": "default",
    "globalTheme": "cyberpunk",
    "preferences": {},
    "updatedAt": "2025-11-02T..."
  }
  ```

#### 3. Client Implementation

**File**: `dashboard/lib/settings-sync.ts`

```typescript
// Debounced sync (1s delay to prevent excessive API calls)
debouncedSettingsSync({ globalTheme: 'cyberpunk' }, 1000);

// Retrieval (on mount or refresh)
const settings = await retrieveSettings('default');
```

**File**: `dashboard/lib/state-manager.tsx`

```typescript
// On mount: Load from Supabase
useEffect(() => {
  retrieveSettings('default').then(settings => {
    if (settings && settings.globalTheme !== state.globalTheme) {
      setState(prev => ({ ...prev, globalTheme: settings.globalTheme }));
    }
  });
}, []);

// On change: Sync to Supabase
const updateGlobalTheme = (themeId: string) => {
  setState(prev => ({ ...prev, globalTheme: themeId }));
  debouncedSettingsSync({ globalTheme: themeId }, 1000);
};
```

### Data Flow

#### Write Flow (User Changes Theme)

```
1. User clicks theme selector
   ↓
2. updateGlobalTheme('cyberpunk') called
   ↓
3. localStorage updated immediately (optimistic)
   ↓
4. UI updates instantly (no flash)
   ↓
5. After 1s debounce: debouncedSettingsSync()
   ↓
6. POST to n8n /webhook/settings-store
   ↓
7. n8n validates payload
   ↓
8. n8n upserts to Supabase user_settings table
   ↓
9. Supabase becomes source of truth ✅
```

#### Read Flow (User Loads Dashboard)

```
1. Dashboard mounts
   ↓
2. getInitialState() reads localStorage (fast)
   ↓
3. UI renders with cached theme (no flash)
   ↓
4. useEffect triggers: retrieveSettings('default')
   ↓
5. GET from n8n /webhook/settings-retrieve
   ↓
6. n8n fetches from Supabase
   ↓
7. If Supabase theme differs from cache:
      - Update state
      - Update localStorage
   ↓
8. Theme synced to authoritative source ✅
```

#### Cross-Device Flow

```
Device A:
  User sets theme to 'cyberpunk'
  → Synced to Supabase

Device B:
  User loads dashboard
  → Fetches from Supabase
  → Sees 'cyberpunk' theme ✅
```

### Benefits

✅ **Architectural Consistency**  
All persistent state now flows through DDD

✅ **Cross-Device Sync**  
Settings persist across browsers and devices

✅ **Offline Resilience**  
localStorage cache works when offline

✅ **Scalable**  
JSONB `preferences` field supports future settings

✅ **Secure**  
Supabase RLS policies control access

✅ **Debuggable**  
All changes logged in Supabase `updated_at`

### Hydration Warning Status

**suppressHydrationWarning**: KEPT in `GlobalThemeStyles.tsx`

**Reason**:
- Server renders with default theme
- Client hydrates from localStorage (instant)
- useEffect syncs from Supabase (async, after hydration)
- Brief mismatch unavoidable without SSR fetch

**Future Improvement**:
- Implement Server Component fetch from Supabase
- Would eliminate warning completely
- Requires Next.js App Router server-side data fetching pattern

### Deployment Steps

#### 1. Run Supabase Migration

```bash
scripts/open-supabase-sql-editor.sh
```

Paste contents of: `supabase/migrations/002_create_user_settings_table.sql`

#### 2. Configure n8n Workflows

Visit: https://n8n.pbradygeorgen.com

For each workflow (`settings-store`, `settings-retrieve`):
1. Open workflow
2. Find Supabase node
3. Set "Table" dropdown to: `user_settings`
4. Save workflow

#### 3. Test Implementation

1. Change dashboard theme
2. Check browser console for sync logs
3. Refresh page
4. Verify theme persists
5. Test on different browser/device

### Crew Attribution

- **Commander Picard**: Strategic decision, architectural integrity
- **Commander Data**: DDD architecture design, implementation plan
- **Lt. Cmdr. La Forge**: Infrastructure patterns, reuse of project-sync code
- **Counselor Troi**: UX consistency, cross-device expectations
- **Lt. Worf**: Security review, RLS policies
- **Chief O'Brien**: Pragmatic implementation, kept it simple

### Files Created/Modified

**Created**:
- `supabase/migrations/002_create_user_settings_table.sql`
- `n8n-workflows/settings-workflows/settings-store.json`
- `n8n-workflows/settings-workflows/settings-retrieve.json`
- `dashboard/lib/settings-sync.ts`
- `scripts/deploy-settings-workflows.js`
- `scripts/configure-settings-workflows.js`
- `docs/DDD-USER-SETTINGS-ARCHITECTURE.md`

**Modified**:
- `dashboard/lib/state-manager.tsx` (added DDD sync)
- `dashboard/components/GlobalThemeStyles.tsx` (kept suppressHydrationWarning)

### Related Documentation

- `docs/DDD-WORKFLOW-SYSTEM.md` (Project content DDD)
- `docs/CREW-OBSERVATION-HYDRATION-ISSUE.md` (Original hydration analysis)
- `MILESTONE_v1.4.1_THEME_SYSTEM_RESTORATION.md` (Theme system)

---

**Conclusion**: DDD architecture violation eliminated. User settings now properly flow through Client => n8n => Supabase, maintaining architectural consistency and enabling cross-device sync. 🖖

