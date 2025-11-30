# Supabase Database Password Automation

**Date:** November 24, 2025  
**Status:** ✅ Automated  
**Purpose:** Automatically retrieve and configure Supabase database password

---

## 🎯 Overview

This automation system retrieves the Supabase database password from the Supabase dashboard and automatically adds it to `~/.zshrc` for use in deployment scripts.

---

## 🚀 Usage

### Quick Start

```bash
npm run setup:supabase-password
```

This will:
1. Load Supabase credentials from `~/.zshrc`
2. Attempt multiple methods to retrieve the database password
3. Automatically add it to `~/.zshrc`
4. Enable automated schema deployment

---

## 🔧 Methods

### Method 1: Supabase CLI
- Checks if Supabase CLI is installed and linked
- Extracts connection string from `supabase status`
- Parses password from connection string

### Method 2: Browser Automation (Puppeteer)
- Launches browser (headless: false for login if needed)
- Navigates to Supabase dashboard database settings
- Extracts password from connection string or password fields
- Handles login if required

### Method 3: Management API
- Placeholder for future API integration
- Note: Supabase doesn't expose passwords via API for security

---

## 📋 Prerequisites

### Required
- Supabase credentials in `~/.zshrc`:
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Optional (for browser automation)
```bash
npm install puppeteer
```

---

## 🔍 How It Works

1. **Load Credentials**: Reads Supabase URL and service key from `~/.zshrc`
2. **Extract Project Reference**: Gets project ID from Supabase URL
3. **Try Methods**: Attempts each method in order until password is found
4. **Browser Automation** (if Puppeteer available):
   - Navigates to: `https://supabase.com/dashboard/project/{projectRef}/settings/database`
   - Looks for connection strings or password fields
   - Extracts password from connection string format: `postgresql://user:password@host`
5. **Add to ~/.zshrc**: Automatically adds `export SUPABASE_DB_PASSWORD="password"`

---

## 🎯 After Setup

Once the password is added to `~/.zshrc`:

1. **Reload shell configuration**:
   ```bash
   source ~/.zshrc
   ```

2. **Deploy schema automatically**:
   ```bash
   node scripts/deploy/automated-supabase-deploy.js
   ```

---

## 🔒 Security Notes

- Password is stored in `~/.zshrc` (local file, not committed to git)
- Browser automation shows browser window (not headless) for transparency
- Password is never logged or displayed in full
- Only first 10 characters shown for verification

---

## 🐛 Troubleshooting

### Browser Automation Fails
- **Issue**: Puppeteer not installed
- **Solution**: `npm install puppeteer`

### Login Required
- **Issue**: Browser shows login page
- **Solution**: Log in manually in the browser window, script will continue

### Password Not Found
- **Issue**: Connection string format changed or not visible
- **Solution**: Manual steps provided in error message

### Password Already Exists
- **Issue**: `SUPABASE_DB_PASSWORD` already in `~/.zshrc`
- **Solution**: Script prompts to update or skip

---

## 📝 Manual Alternative

If automation fails, you can manually:

1. Go to: `https://supabase.com/dashboard/project/{projectRef}/settings/database`
2. Find connection string or database password
3. Copy password
4. Add to `~/.zshrc`:
   ```bash
   export SUPABASE_DB_PASSWORD="your-password-here"
   ```
5. Reload: `source ~/.zshrc`

---

## ✅ Success Criteria

- ✅ Password retrieved automatically
- ✅ Added to `~/.zshrc` in correct location
- ✅ Deployment scripts can now use it
- ✅ No manual copy-paste required

---

**This automation enables fully automated Supabase schema deployment!**

