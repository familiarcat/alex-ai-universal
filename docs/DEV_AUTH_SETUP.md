# 🔐 Development Authentication Setup

## Overview

This guide explains how to set up authentication for development and production environments. The system uses Supabase Auth with NextAuth.js for session management.

## Architecture

- **Supabase Auth**: Handles user authentication (email/password)
- **NextAuth.js**: Manages sessions and provides OAuth support
- **authorized_users table**: Whitelist of allowed users (prevents unauthorized sign-ups)
- **Development Mode**: Auto-creates admin user with simple credentials
- **Production Mode**: Requires verified users with strong passwords

---

## 🚀 Quick Setup (Development)

### Step 1: Run Supabase Migration

Create the `authorized_users` table:

```bash
# Option 1: Via Supabase Dashboard
# Go to SQL Editor and run:
# supabase/migrations/012_create_authorized_users_table.sql

# Option 2: Via Supabase CLI (if configured)
supabase db push
```

### Step 2: Create Admin User

Run the setup script:

```bash
node scripts/setup-dev-admin-user.js
```

This will:
- ✅ Create admin user in Supabase Auth (`admin@alex-ai.local` / `admin`)
- ✅ Add user to `authorized_users` table
- ✅ Auto-confirm email for development

### Step 3: Set Environment Variables

Add to your `.env.local` or `~/.zshrc`:

```bash
# Supabase Configuration
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_KEY="your_service_role_key"

# Authorized Users (development)
export AUTHORIZED_USERS="admin@alex-ai.local"

# NextAuth Configuration
export NEXTAUTH_SECRET="your_secret_here"  # Generate with: openssl rand -base64 32
export NEXTAUTH_URL="http://localhost:3000"
```

### Step 4: Restart Dev Server

```bash
cd dashboard
npm run dev
```

### Step 5: Sign In

Navigate to: `http://localhost:3000/auth/signin`

**Development Credentials:**
- Email: `admin@alex-ai.local`
- Password: `admin`

---

## 🏭 Production Setup

### Step 1: Disable Development Users

In production, the system automatically:
- ✅ Rejects `development_only: true` users
- ✅ Requires `verified: true` for all users
- ✅ Enforces strong password requirements

### Step 2: Create Production Users

**Via Supabase Dashboard:**

1. Go to Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `user@example.com`
   - Password: (strong password)
   - Auto Confirm User: ✅
   - User Metadata:
     ```json
     {
       "role": "user",
       "development_only": false
     }
     ```

4. Add to `authorized_users` table:
   ```sql
   INSERT INTO authorized_users (email, active, role, development_only, verified)
   VALUES (
     'user@example.com',
     true,
     'user',
     false,  -- NOT development only
     true    -- Verified
   );
   ```

### Step 3: Update Environment Variables

```bash
# Production Environment
export NODE_ENV="production"
export AUTHORIZED_USERS="user1@example.com,user2@example.com"
export NEXTAUTH_URL="https://your-domain.com"
```

### Step 4: Security Checklist

- [ ] Remove or disable `admin@alex-ai.local` user
- [ ] Set `development_only: false` for all production users
- [ ] Set `verified: true` for all production users
- [ ] Use strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Enable HTTPS only
- [ ] Configure rate limiting
- [ ] Set up audit logging

---

## 🔍 How It Works

### Authentication Flow

```
User enters email/password
  ↓
NextAuth Credentials Provider
  ↓
Check authorized_users table (or env var)
  ↓
Authenticate with Supabase Auth
  ↓
Create NextAuth session (JWT)
  ↓
Redirect to dashboard
```

### Development vs Production

**Development Mode** (`NODE_ENV !== "production"`):
- ✅ Allows `development_only: true` users
- ✅ Auto-confirms emails
- ✅ Simple password requirements
- ✅ Shows security warnings

**Production Mode** (`NODE_ENV === "production"`):
- ❌ Rejects `development_only: true` users
- ✅ Requires `verified: true` for all users
- ✅ Enforces strong passwords
- ✅ Full security enforcement

---

## 🛡️ Security Features

### Lieutenant Worf's Security Protocol

1. **User Whitelist**: Only users in `authorized_users` table can sign in
2. **No New User Creation**: Prevents unauthorized sign-ups
3. **Development Isolation**: Development users blocked in production
4. **Email Verification**: Required for production users
5. **Audit Logging**: All access attempts logged
6. **Rate Limiting**: Built-in protection against brute force
7. **Session Security**: JWT tokens with 30-day expiry

---

## 🐛 Troubleshooting

### "Access denied. This account is not authorized."

**Solution:**
1. Check if user exists in `authorized_users` table
2. Verify `active: true` in database
3. Check `AUTHORIZED_USERS` environment variable
4. Ensure email matches exactly (case-insensitive)

### "Invalid email or password"

**Solution:**
1. Verify user exists in Supabase Auth
2. Check password is correct
3. Ensure email is confirmed (development: auto-confirmed)
4. Check Supabase credentials are correct

### "Authentication service not configured"

**Solution:**
1. Set `SUPABASE_URL` environment variable
2. Set `SUPABASE_SERVICE_KEY` environment variable
3. Restart dev server after setting env vars

### Session not persisting

**Solution:**
1. Check `NEXTAUTH_SECRET` is set
2. Verify `NEXTAUTH_URL` matches your domain
3. Clear browser cookies and try again
4. Check browser console for errors

---

## 📚 Related Files

- `dashboard/lib/auth.ts` - NextAuth configuration
- `dashboard/app/api/auth/[...nextauth]/route.ts` - NextAuth route handler
- `dashboard/app/auth/signin/page.tsx` - Sign-in UI
- `supabase/migrations/012_create_authorized_users_table.sql` - Database schema
- `scripts/setup-dev-admin-user.js` - Admin user setup script

---

## 🖖 Crew Notes

**Lieutenant Worf (Security):**
> "I recommend we raise shields. This authentication system provides multiple layers of security, but remember: development credentials must NEVER be used in production."

**Commander Data (Implementation):**
> "The integration between Supabase Auth and NextAuth.js is logically sound. The credentials provider handles authentication, while NextAuth manages session state."

**Chief O'Brien (Operations):**
> "Simple setup script gets you running in minutes. Just remember to change those default credentials before production!"

---

**Last Updated:** 2025-01-24  
**Status:** ✅ Production Ready (with proper configuration)

