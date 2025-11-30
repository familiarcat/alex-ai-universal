# Supabase Automation Setup Guide (November 2025)

## Overview

This guide explains how to set up Supabase for automated migrations using either the **Supabase CLI** (recommended) or **psql** (alternative). As of November 2025, the Supabase CLI is the preferred method for automation.

---

## Do You Need Both psql and Supabase CLI?

**Short Answer: No. Use Supabase CLI only.**

The Supabase CLI handles all migration operations and is the official tool for automation. `psql` is only needed if:
- You want direct PostgreSQL access for debugging
- You're running custom SQL queries outside of migrations
- You prefer traditional PostgreSQL tooling

**For automation purposes, Supabase CLI is sufficient and recommended.**

---

## Method 1: Supabase CLI (Recommended for Automation)

### Step 1: Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Linux/Windows:**
```bash
# Via npm (if you have Node.js)
npm install -g supabase

# Or download from: https://github.com/supabase/cli/releases
```

**Verify installation:**
```bash
supabase --version
```

### Step 2: Authenticate with Supabase

The Supabase CLI uses your Supabase account for authentication, not API keys.

**Option A: Login via Browser (Recommended)**
```bash
supabase login
```
This will:
1. Open your browser
2. Prompt you to log in to Supabase
3. Store your access token locally

**Option B: Use Access Token (CI/CD)**
```bash
export SUPABASE_ACCESS_TOKEN="your-access-token"
supabase login --token $SUPABASE_ACCESS_TOKEN
```

To get your access token:
1. Go to: https://app.supabase.com/account/tokens
2. Generate a new token
3. Copy and use it

### Step 3: Link Your Project

Link your local repository to your Supabase project:

```bash
cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal
supabase link --project-ref rpkkkbufdwxmjaerbhbn
```

**What this does:**
- Creates a `.supabase` directory with project configuration
- Stores the project reference locally
- Enables `supabase db push` to work

**Find your project reference:**
- From your Supabase URL: `https://rpkkkbufdwxmjaerbhbn.supabase.co`
- The project ref is: `rpkkkbufdwxmjaerbhbn`
- Or find it in: Dashboard → Settings → General → Reference ID

### Step 4: Run Migrations

Once linked, you can push all migrations:

```bash
supabase db push
```

This command:
- Reads all files from `supabase/migrations/`
- Applies them in chronological order
- Shows progress and any errors

**For our consolidated migration:**
```bash
# The consolidated file is for manual execution only
# Use db push for all individual migration files
supabase db push
```

### Step 5: Verify Migration Status

Check which migrations have been applied:

```bash
supabase migration list
```

This shows:
- ✅ Applied migrations
- ⏳ Pending migrations
- ❌ Failed migrations

---

## Method 2: psql (Alternative - Requires Database Password)

### Why psql Failed Earlier

The error `Wrong password` occurred because:
- The `SUPABASE_SERVICE_KEY` is a **JWT token**, not a database password
- `psql` requires the actual PostgreSQL database password
- These are two different authentication mechanisms

### Step 1: Get Your Database Password

1. Go to Supabase Dashboard: https://app.supabase.com/project/rpkkkbufdwxmjaerbhbn/settings/database
2. Scroll to **"Database Password"** section
3. Click **"Reset Database Password"** (if you don't have it)
4. Copy the password (you'll only see it once!)

### Step 2: Add Password to ~/.zshrc

Add this line to your `~/.zshrc`:

```bash
export SUPABASE_DB_PASSWORD="your-actual-database-password"
```

Then reload:
```bash
source ~/.zshrc
```

### Step 3: Build Connection String

The connection string format is:

```
postgresql://postgres.rpkkkbufdwxmjaerbhbn:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

Or for direct connection (port 5432):

```
postgresql://postgres.rpkkkbufdwxmjaerbhbn:[PASSWORD]@db.rpkkkbufdwxmjaerbhbn.supabase.co:5432/postgres
```

**Note:** Use port **6543** for connection pooling (recommended) or **5432** for direct connection.

### Step 4: Test Connection

```bash
psql "postgresql://postgres.rpkkkbufdwxmjaerbhbn:$SUPABASE_DB_PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres" -c "SELECT version();"
```

### Step 5: Run Migrations

```bash
# Single migration
psql "postgresql://postgres.rpkkkbufdwxmjaerbhbn:$SUPABASE_DB_PASSWORD@aws-0-us-east-2.pooler.supabase.com:6543/postgres" -f supabase/migrations/001_create_projects_table.sql

# All migrations (using our script)
node scripts/run-all-supabase-migrations.js
```

---

## Comparison: Supabase CLI vs psql

| Feature | Supabase CLI | psql |
|---------|-------------|------|
| **Setup Complexity** | ⭐ Easy (login + link) | ⭐⭐ Medium (need password) |
| **Authentication** | Supabase account | Database password |
| **Migration Management** | ✅ Built-in tracking | ❌ Manual tracking |
| **Error Handling** | ✅ Better error messages | ⚠️ PostgreSQL errors |
| **Rollback Support** | ✅ `supabase migration repair` | ❌ Manual |
| **CI/CD Integration** | ✅ Excellent | ⚠️ Requires password management |
| **Recommended For** | ✅ Production automation | Debugging, custom queries |

---

## Recommended Setup for Automation

### For Local Development:
```bash
# 1. Install CLI
brew install supabase/tap/supabase

# 2. Login
supabase login

# 3. Link project
supabase link --project-ref rpkkkbufdwxmjaerbhbn

# 4. Run migrations
supabase db push
```

### For CI/CD:
```bash
# Use access token
export SUPABASE_ACCESS_TOKEN="your-ci-token"
supabase login --token $SUPABASE_ACCESS_TOKEN
supabase link --project-ref $SUPABASE_PROJECT_REF
supabase db push
```

---

## Updating Our Automation Scripts

Our `scripts/run-all-supabase-migrations.js` should be updated to:

1. **Check for Supabase CLI first** (preferred method)
2. **Fall back to psql** only if CLI is unavailable
3. **Provide clear error messages** for both methods

**Recommended approach:**
```javascript
// 1. Try Supabase CLI
if (hasSupabaseCLI()) {
  execSync('supabase db push', { stdio: 'inherit' });
  return;
}

// 2. Fall back to psql
if (hasPsql() && hasDatabasePassword()) {
  // Use psql with password
} else {
  // Provide manual instructions
}
```

---

## Troubleshooting

### Supabase CLI Issues

**"Project not linked"**
```bash
supabase link --project-ref rpkkkbufdwxmjaerbhbn
```

**"Not authenticated"**
```bash
supabase login
```

**"Migration already applied"**
```bash
supabase migration repair
```

### psql Issues

**"Wrong password"**
- Verify you're using the database password, not the service role key
- Check password in: Dashboard → Settings → Database

**"Connection timeout"**
- Try port 5432 instead of 6543
- Check firewall/network settings

**"SSL required"**
```bash
psql "postgresql://..." -c "SELECT 1" --set=sslmode=require
```

---

## Summary

**For November 2025 automation:**
1. ✅ **Use Supabase CLI** - It's the official tool and handles everything
2. ❌ **Skip psql** - Only needed for debugging or custom queries
3. 🔑 **Authentication** - Use `supabase login` (not API keys)
4. 🔗 **Linking** - Run `supabase link --project-ref` once per project
5. 🚀 **Migrations** - Use `supabase db push` for all migrations

**Next Steps:**
1. Install Supabase CLI: `brew install supabase/tap/supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref rpkkkbufdwxmjaerbhbn`
4. Run migrations: `supabase db push`
5. Verify: `supabase migration list`

---

**Crew Notes:**
- **Chief O'Brien**: "The Supabase CLI is like having a transporter - it just works!"
- **Lt. Uhura**: "CLI authentication is much cleaner than managing database passwords."
- **Commander Data**: "The CLI provides better error handling and migration tracking than raw psql."

