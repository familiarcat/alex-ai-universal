# Observation Lounge UI - Crew Memory Browser

**Version**: v1.7.2  
**Date**: November 3, 2025  
**Status**: ✅ Complete and operational

---

## Overview

The Observation Lounge is a visual interface for browsing and exploring crew memories stored in the RAG system (Supabase `knowledge_base` table). It displays what each officer has learned from recent sessions and their future learning priorities.

---

## Features

### 1. Session Browser
- **List all Observation Lounge sessions** chronologically
- **Expand sessions** to see full crew reflections
- **Commander Picard's opening and closing remarks**
- **Session metadata** (date, duration, number of officers present)

### 2. Crew Member Cards
- **Individual cards for each officer** showing:
  - Recent learnings (what they've mastered)
  - Future learning focus (what they plan to learn next)
  - Key insights (their main takeaway)
- **Click to expand** full details for each officer
- **Visual design** with officer emojis and rank/specialty

### 3. Smart Data Fetching
- **Connects to Supabase** `knowledge_base` table
- **Filters by category** (`observation_lounge_debrief`)
- **Parses rich crew memory format** automatically
- **Displays most recent** learnings per officer

---

## Architecture

### Data Flow

```
Client (Observation Lounge UI)
    ↓ (HTTP GET/POST)
/api/knowledge/query
    ↓ (Supabase REST API)
knowledge_base table in Supabase
```

**Current Pattern**: Direct Supabase fallback (n8n webhooks unavailable)  
**Future**: Can switch to n8n => Supabase when webhooks are restored

### Files

**Frontend**:
- `dashboard/app/observation-lounge/page.tsx` - Main UI component
- Connects to API route for data fetching
- Client-side rendering for interactivity

**Backend**:
- `dashboard/app/api/knowledge/query/route.ts` - API endpoint
- Queries Supabase `knowledge_base` table
- Filters, searches, and returns crew memories

**Configuration**:
- `dashboard/.env.local` - Environment variables (gitignored)
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_KEY`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Data Source**:
- `supabase/migrations/003_create_knowledge_base_table.sql`
- Table: `knowledge_base`
- Stores crew memories with rich JSON content

---

## Usage

### Accessing the Observation Lounge

1. **Via Dashboard Navigation**:
   - Click "🛸 Observation Lounge" in the dashboard nav
   - Route: `/observation-lounge`

2. **Via Command Palette**:
   - Press `Cmd+K` (or `Ctrl+K`)
   - Type "Observation Lounge"
   - Press Enter

### Viewing Crew Memories

**Session List**:
- Shows all Observation Lounge debrief sessions
- Click any session to expand full details
- See Picard's opening/closing remarks
- Read individual crew reflections

**Crew Cards**:
- Browse all officers who have shared learnings
- Click any card to expand details
- See full list of learnings and future priorities
- Read key insights

### Data Structure Expected

The UI expects crew memories with this structure:

```json
{
  "session_id": "crew-decision-...",
  "title": "Observation Lounge: ...",
  "category": "observation_lounge_debrief",
  "content": {
    "observation_lounge_transcript": {
      "picard_opening": {
        "statement": "..."
      },
      "crew_reflections": [
        {
          "officer": "Commander Data",
          "rank": "...",
          "specialty": "...",
          "memories_learned": ["...", "..."],
          "future_learning_focus": ["...", "..."],
          "key_insight": "..."
        }
      ],
      "picard_closing": {
        "statement": "..."
      }
    }
  }
}
```

---

## Environment Setup

### Required Environment Variables

Create `dashboard/.env.local`:

```bash
# Supabase Configuration
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-role-key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# n8n Configuration
N8N_URL="https://n8n.your-domain.com"
```

### Get Values from ~/.zshrc

```bash
grep SUPABASE ~/.zshrc
grep N8N_URL ~/.zshrc
```

### Restart Next.js Server

After creating `.env.local`, restart the development server:

```bash
cd dashboard
npm run dev
```

---

## API Endpoint

### GET /api/knowledge/query

Query crew memories with URL parameters:

```bash
curl "http://localhost:3000/api/knowledge/query?category=observation_lounge_debrief&limit=10"
```

**Parameters**:
- `category` (optional): Filter by category
- `limit` (optional): Max number of results (default: 10)

### POST /api/knowledge/query

Query with JSON body for more complex filters:

```bash
curl -X POST "http://localhost:3000/api/knowledge/query" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "observation_lounge_debrief",
    "limit": 10,
    "search": "theme system"
  }'
```

**Body**:
- `category` (optional): Filter by category
- `limit` (optional): Max number of results
- `search` (optional): Search in title/summary

---

## Styling

The Observation Lounge uses:
- **CSS variables** from global theme system
- **Responsive grid layout** for crew cards
- **Hover effects** for interactivity
- **Expandable sections** for progressive disclosure
- **Consistent spacing** and typography

**Theme Variables Used**:
- `--background` - Page background
- `--text` - Primary text color
- `--heading` - Headings color
- `--accent` - Links, highlights, borders
- `--surface` - Card backgrounds
- `--border` - Card borders
- `--card` - Alternate card backgrounds

---

## Future Enhancements

### Planned (from Crew Priorities)

1. **Natural Language Search**:
   - "Show me what Data learned about n8n"
   - "What did the crew learn about theme systems?"
   - Conversational interface

2. **Vector Search Integration**:
   - Semantic similarity search
   - "Find similar learnings to this one"
   - Related insights recommendations

3. **Timeline View**:
   - Chronological crew growth visualization
   - Officer expertise progression over time
   - Milestone markers

4. **Crew Member Detail Pages**:
   - Individual pages per officer
   - Complete learning history
   - Expertise visualization
   - Contributions timeline

5. **Export & Sharing**:
   - Download crew memories as PDF
   - Share specific sessions
   - Generate learning summaries

---

## Crew Attribution

**UI Design**: Counselor Troi (UX, progressive disclosure)  
**Data Architecture**: Commander Data (knowledge management)  
**Implementation**: Chief O'Brien (pragmatic fallback pattern)  
**API Integration**: Lt. Uhura (Supabase REST API)  
**Security**: Lt. Worf (service_role key protection)

---

## Known Limitations

1. **n8n Webhooks Down**:
   - Currently using direct Supabase API
   - When n8n webhooks are restored, can switch to DDD flow
   - No impact on functionality

2. **Single User**:
   - Currently assumes single "default" user
   - Future: OAuth for multi-user support

3. **No Real-time Updates**:
   - Requires page refresh to see new sessions
   - Future: Supabase Realtime subscriptions

---

## Testing

### Manual Testing

1. **Start Dashboard**:
   ```bash
   cd dashboard
   npm run dev
   ```

2. **Navigate to Observation Lounge**:
   - Visit `http://localhost:3000/observation-lounge`
   - Or click nav link in dashboard

3. **Verify Data Loading**:
   - Should see 2 sessions (if crew memories exist)
   - Should see crew member cards
   - Click to expand sessions and crew cards

4. **Test API Directly**:
   ```bash
   curl "http://localhost:3000/api/knowledge/query?category=observation_lounge_debrief"
   ```

### Expected Results

- ✅ Sessions list displays with titles and summaries
- ✅ Clicking session expands to show full transcript
- ✅ Crew cards show officer name, rank, specialty
- ✅ Clicking crew card shows learnings and future focus
- ✅ Key insights display in italic blocks
- ✅ No console errors
- ✅ Responsive layout works on different screen sizes

---

## Troubleshooting

### "Failed to load crew memories"

**Cause**: API endpoint can't reach Supabase  
**Fix**: Check `.env.local` has correct credentials

### "No Observation Lounge sessions yet"

**Cause**: No crew memories in database  
**Fix**: Run `node scripts/store-crew-decision-in-rag.js crew-memories/active/observation-lounge-session-2025-11-03.json`

### "Error: knowledge_base table not found"

**Cause**: Supabase migration not run  
**Fix**: Run migration `003_create_knowledge_base_table.sql` in Supabase SQL editor

### API returns empty array `[]`

**Cause**: Category filter too restrictive or no data  
**Fix**: Check `category` value matches what's in database

---

## Documentation

- **Main Docs**: This file
- **RAG System**: `docs/DDD-WORKFLOW-SYSTEM.md`
- **Supabase Schema**: `supabase/migrations/003_create_knowledge_base_table.sql`
- **Crew Memory Format**: `crew-memories/active/observation-lounge-session-2025-11-03.json`

---

✅ **Status**: Ready for use! Navigate to `/observation-lounge` in the dashboard to explore crew learnings.

🖖 "The past is written, but the future is always in motion." — Counselor Troi

