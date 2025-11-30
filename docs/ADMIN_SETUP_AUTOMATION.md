# 🤖 Admin User Setup Automation

## Overview

Automated script that handles all 4 steps of admin user setup:
1. Create admin user in Supabase
2. Add to AUTHORIZED_USERS environment variable
3. Test authentication flow
4. Security audit checklist

**Reviewed by:** Commander Riker (Automation) & Lieutenant Worf (Security)

---

## 🚀 Usage

### Quick Start

```bash
npm run admin:setup
```

### Manual Execution

```bash
node scripts/automate-admin-setup.js
```

---

## 📋 What It Does

### Step 1: Create Admin User in Supabase
- Attempts to create admin user via Supabase Admin API
- Email: `admin@alex-ai.local`
- Password: `admin`
- Auto-confirms email for development
- Falls back to manual instructions if API fails

### Step 2: Add to AUTHORIZED_USERS
- Adds to Supabase `authorized_users` table (if exists)
- Updates `AUTHORIZED_USERS` in `~/.zshrc`
- Updates `AUTHORIZED_USERS` in `dashboard/.env.local`
- Handles existing entries gracefully

### Step 3: Test Authentication Flow
- Checks if dashboard is running
- Provides test instructions
- Validates dashboard accessibility

### Step 4: Security Audit Checklist
- Displays Lieutenant Worf's security checklist
- Shows completion status
- Reminds about pending production security measures

---

## ✅ Automation Results

### Success Indicators

- ✅ **Step 1:** Admin user created or already exists
- ✅ **Step 2:** AUTHORIZED_USERS updated in environment files
- ⚠️ **Step 3:** Dashboard check (may show as not running if dashboard isn't started)
- ✅ **Step 4:** Security checklist displayed

### Expected Output

```
🖖 Automating Admin User Setup - All 4 Steps
════════════════════════════════════════════════════════════
✅ Connected to Supabase

📋 Step 1: Creating Admin User in Supabase...
✅ Admin user created successfully!

📋 Step 2: Adding to AUTHORIZED_USERS...
✅ Added AUTHORIZED_USERS to ~/.zshrc
✅ Updated AUTHORIZED_USERS in dashboard/.env.local

📋 Step 3: Testing Authentication Flow...
⚠️  Dashboard not running (expected if not started)

📋 Step 4: Security Audit Checklist...
✅ Checklist complete
```

---

## 🔧 Configuration

### Required Environment Variables

The script automatically loads from:
- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY`

Or from `~/.zshrc`:
- `export SUPABASE_URL="..."`
- `export SUPABASE_SERVICE_ROLE_KEY="..."`

### Admin User Credentials

- **Email:** `admin@alex-ai.local`
- **Password:** `admin`
- **Username:** `admin`
- **Role:** `admin`

---

## 🛡️ Security Notes

### Development Only

- ⚠️ Default credentials (`admin/admin`) are for development only
- ⚠️ Must be changed before production
- ⚠️ Admiral's Override acknowledged

### Security Checklist

The automation displays Lieutenant Worf's security checklist:
- ✅ Admin user created (development only)
- ✅ Default credentials documented
- ✅ Security memory stored
- ⚠️ Change password before production (PENDING)
- ⚠️ Remove default credentials (PENDING)
- ⚠️ Implement password policy (PENDING)
- ⚠️ Add multi-factor authentication (PENDING)
- ⚠️ Complete security audit (PENDING)

---

## 📝 Manual Steps (If Needed)

### If Step 1 Fails

1. Go to: https://app.supabase.com/project/rpkkkbufdwxmjaerbhbn/auth/users
2. Click "Add User" → "Create new user"
3. Email: `admin@alex-ai.local`
4. Password: `admin`
5. Auto Confirm User: ✅
6. Click "Create User"

### If Step 2 Fails

Add to `~/.zshrc`:
```bash
export AUTHORIZED_USERS="admin@alex-ai.local"
```

Add to `dashboard/.env.local`:
```
AUTHORIZED_USERS=admin@alex-ai.local
```

### If Step 3 Shows Dashboard Not Running

Start the dashboard:
```bash
cd dashboard && npm run dev
```

Then test authentication:
1. Open: http://localhost:3000
2. Click "Sign In"
3. Email: `admin@alex-ai.local`
4. Password: `admin`
5. Click "Sign In"

---

## 🔄 Reload Shell

After Step 2 completes, reload your shell:

```bash
source ~/.zshrc
```

Or restart your terminal.

---

## 📊 Crew Consensus

**Commander Riker:**
> "I have the conn. The automation handles all four steps efficiently. Excellent execution."

**Lieutenant Worf:**
> "I recommend we raise shields. The automation includes security reminders and checklist. Status: PENDING PRODUCTION REVIEW."

**Commander Data:**
> "Fascinating. The automation demonstrates logical efficiency: API creation, environment updates, testing, and security audit. The implementation is sound."

---

## 🚀 Next Steps

After automation completes:

1. **Reload shell:** `source ~/.zshrc`
2. **Start dashboard:** `cd dashboard && npm run dev`
3. **Test authentication:** Sign in with `admin@alex-ai.local` / `admin`
4. **Before production:** Complete security checklist

---

**End of Documentation**

