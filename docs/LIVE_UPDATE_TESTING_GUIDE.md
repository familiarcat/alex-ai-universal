# 🖖 Live Update Testing Guide - E2E DDD Integration

## Overview

The local development server (`scripts/local-dev-start.sh`) automatically opens multiple browser tabs to test the live update capacity of the Alex AI system with full DDD architecture integration.

## Automatic Browser Tab Opening

When you run `./scripts/local-dev-start.sh`, the script automatically opens:

1. **Main Dashboard**: `http://localhost:3000`
   - Full dashboard interface
   - Real-time state management
   - Controller layer integration

2. **Test Page**: `http://localhost:3000/test`
   - Simple routing verification
   - Quick connectivity test

3. **Dashboard Route**: `http://localhost:3000/dashboard`
   - Direct dashboard access
   - Bypasses root redirect

## Live Update Testing

### What to Test

1. **Real-Time State Updates**
   - Make changes in one tab
   - Watch updates appear in other tabs
   - Test cross-tab synchronization

2. **Controller Layer Integration**
   - Test n8n workflow triggers
   - Test MCP server communication
   - Verify Supabase data sync

3. **Component Updates**
   - Edit dashboard components
   - Watch hot module replacement (HMR)
   - Verify no page refresh needed

### Testing Scenarios

#### Scenario 1: Cross-Tab State Sync
1. Open multiple tabs to `http://localhost:3000/dashboard`
2. Make a change in one tab (e.g., create a project)
3. Verify the change appears in other tabs
4. Check browser console for state sync events

#### Scenario 2: Controller Layer Updates
1. Trigger a workflow via n8n API
2. Watch dashboard update with new data
3. Verify MCP server receives updates
4. Check Supabase for persisted changes

#### Scenario 3: Hot Module Replacement
1. Edit a component file (e.g., `dashboard/components/DashboardContent.tsx`)
2. Save the file
3. Watch browser tabs update automatically
4. Verify no full page reload occurs

## DDD Architecture Flow

```
┌─────────────────────────────────────────┐
│   Browser Tab 1 (localhost:3000)        │
│   ┌─────────────────────────────────┐   │
│   │  Client Layer (Next.js)          │   │
│   │  • State Management              │   │
│   │  • UI Components                 │   │
│   └───────────┬─────────────────────┘   │
└───────────────┼─────────────────────────┘
                │
                │ API Calls
                │
┌───────────────▼─────────────────────────┐
│   Controller Layer                       │
│   • n8n: Workflow Automation            │
│   • MCP: Model Context Protocol         │
└───────────────┬─────────────────────────┘
                │
                │ Data Operations
                │
┌───────────────▼─────────────────────────┐
│   Data Layer (Supabase)                 │
│   • Vector Database                     │
│   • Crew Memories                       │
│   • Project Data                        │
└─────────────────────────────────────────┘
                │
                │ Real-Time Updates
                │
┌───────────────▼─────────────────────────┐
│   Browser Tab 2 (localhost:3000)        │
│   ┌─────────────────────────────────┐   │
│   │  Client Layer (Next.js)          │   │
│   │  • Receives Updates             │   │
│   │  • Syncs State                  │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Expected Behavior

### ✅ Successful Live Updates

- **Instant Updates**: Changes appear immediately across tabs
- **No Page Refresh**: HMR updates components without full reload
- **State Synchronization**: All tabs show consistent state
- **Controller Integration**: n8n/MCP updates reflected in UI
- **Data Persistence**: Changes saved to Supabase

### ⚠️ Troubleshooting

#### Updates Not Appearing

1. **Check Browser Console**
   - Look for JavaScript errors
   - Verify WebSocket connections
   - Check for network errors

2. **Verify Server Status**
   ```bash
   lsof -ti:3000
   ```
   Should return a process ID

3. **Check Environment Variables**
   ```bash
   cat dashboard/.env.local
   ```
   Verify controller layer URLs are correct

4. **Restart Server**
   ```bash
   ./scripts/local-dev-start.sh
   ```

#### Controller Layer Not Responding

1. **Check n8n Connection**
   ```bash
   curl -H "X-N8N-API-KEY: $N8N_API_KEY" $N8N_API_URL/workflows
   ```

2. **Check MCP Connection**
   ```bash
   curl -H "X-API-Key: $MCP_API_KEY" $MCP_API_URL/healthz
   ```

3. **Verify Credentials**
   ```bash
   grep -E "N8N_API_KEY|MCP_API_KEY" ~/.zshrc
   ```

## Manual Browser Tab Opening

If automatic opening doesn't work:

```bash
# macOS
open http://localhost:3000
open http://localhost:3000/test
open http://localhost:3000/dashboard

# Linux
xdg-open http://localhost:3000
xdg-open http://localhost:3000/test
xdg-open http://localhost:3000/dashboard

# Windows
start http://localhost:3000
start http://localhost:3000/test
start http://localhost:3000/dashboard
```

## Monitoring Live Updates

### Browser DevTools

1. **Console Tab**
   - Watch for state update logs
   - Check for WebSocket messages
   - Monitor API calls

2. **Network Tab**
   - Verify API requests to controller layer
   - Check WebSocket connections
   - Monitor Supabase requests

3. **Application Tab**
   - Check localStorage for state
   - Verify session storage
   - Monitor IndexedDB (if used)

### Server Logs

Watch the terminal running `./scripts/local-dev-start.sh` for:
- Component compilation
- API request logs
- Controller layer responses
- Error messages

## Best Practices

1. **Test Incrementally**
   - Start with simple state changes
   - Progress to controller layer integration
   - Test complex workflows last

2. **Monitor Performance**
   - Watch for memory leaks
   - Check for excessive API calls
   - Verify efficient state updates

3. **Document Issues**
   - Note any update delays
   - Record controller layer failures
   - Track state synchronization problems

## Crew Notes

**Lt. Cmdr. La Forge**: "Live update testing ensures the DDD architecture works end-to-end. The automatic browser tab opening provides immediate visual feedback."

**Lieutenant Uhura**: "Cross-tab synchronization demonstrates proper communication architecture. Real-time updates prove the controller layer integration."

**Commander Data**: "Live update testing validates 99.7% system efficiency. The E2E flow ensures all layers communicate correctly."

**Chief O'Brien**: "Pragmatic testing approach - multiple tabs show real-world usage. The automatic opening saves time and ensures consistent testing."



