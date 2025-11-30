# 🖖 Dashboard Clean Restart Guide

## Problem
Dashboard URLs (`http://localhost:3000` and `http://localhost:3001`) were not loading after refactoring.

## Solution: Complete Clean Rebuild

### Steps Performed

1. **Killed Existing Processes**
   - Stopped all processes on ports 3000 and 3001
   - Killed any running Next.js dev servers

2. **Cleared All Dev Caches**
   - Removed `.next/` directory (Next.js build cache)
   - Removed `node_modules/.cache/` (module cache)
   - Removed `.turbo/` (Turbopack cache)
   - Removed `.swc/` (SWC compiler cache)
   - Removed `.next.lock` (lock file)

3. **Verified Dependencies**
   - Checked if `node_modules` exists
   - Reinstalled if needed

4. **Started Fresh Dev Server**
   - Started Next.js dev server on port 3000
   - Server running in background

## Clean Restart Script

A reusable script has been created at:
```
scripts/dashboard/clean-restart.sh
```

### Usage

```bash
# Run the clean restart script
./scripts/dashboard/clean-restart.sh
```

Or manually:

```bash
cd dashboard

# Kill existing processes
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Clear caches
rm -rf .next node_modules/.cache .turbo .swc .next.lock

# Reinstall if needed (optional)
npm install

# Start dev server
npm run dev
```

## Expected Results

After clean restart:
- ✅ Dashboard loads at `http://localhost:3000`
- ✅ No cached build artifacts causing issues
- ✅ Fresh Next.js compilation
- ✅ All routes working correctly

## Troubleshooting

If dashboard still doesn't load:

1. **Check Server Status**
   ```bash
   lsof -ti:3000
   ```
   Should return a process ID if server is running

2. **Check Browser Console**
   - Open DevTools → Console
   - Look for JavaScript errors
   - Check Network tab for failed requests

3. **Verify Port Availability**
   ```bash
   lsof -i:3000
   ```
   Should show Next.js process

4. **Check Build Errors**
   ```bash
   cd dashboard
   npm run build
   ```
   Look for compilation errors

5. **Full Clean Reinstall** (if needed)
   ```bash
   cd dashboard
   rm -rf node_modules .next
   npm install
   npm run dev
   ```

## Crew Notes

**Lt. Cmdr. La Forge**: "Cache clearing is essential after major refactoring. The `.next` directory can hold stale build artifacts that prevent proper compilation."

**Chief O'Brien**: "Killing processes first prevents port conflicts. Always clear caches before restarting - it's the pragmatic approach."

**Commander Data**: "Cache invalidation ensures fresh compilation. Efficiency: 99.2%."



