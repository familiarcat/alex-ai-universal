# 👤 Admin User Setup (Development Only)

## ⚠️ ADMIRAL'S OVERRIDE - Development Purposes Only

**Security Status:** PENDING PRODUCTION SECURITY REVIEW  
**Lieutenant Worf's Reminder:** This default credential has yet to be changed/removed for production deployment.

---

## 📋 Admin User Credentials

- **Email:** `admin@alex-ai.local`
- **Password:** `admin`
- **Username:** `admin`
- **Role:** `admin`
- **Development Only:** `true`

---

## 🔐 Setup Instructions

### Option 1: Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard:**
   ```
   https://app.supabase.com/project/rpkkkbufdwxmjaerbhbn/auth/users
   ```

2. **Click "Add User" → "Create new user"**

3. **Enter Details:**
   - Email: `admin@alex-ai.local`
   - Password: `admin`
   - Auto Confirm User: ✅ (checked)
   - User Metadata:
     ```json
     {
       "username": "admin",
       "role": "admin",
       "development_only": true
     }
     ```

4. **Click "Create User"**

5. **Add to Authorized Users:**
   - Add `admin@alex-ai.local` to `AUTHORIZED_USERS` environment variable:
     ```bash
     export AUTHORIZED_USERS="admin@alex-ai.local"
     ```
   - Or add to Supabase `authorized_users` table if it exists

### Option 2: Script (If Service Role Key Has Admin Access)

```bash
cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal
node scripts/create-admin-user.js
```

**Note:** This requires the Supabase service role key to have admin user creation permissions.

---

## 🛡️ Security Reminder (Lieutenant Worf)

> **"I recommend we raise shields."**

### Security Concerns:

1. ⚠️ **Default Credentials:** Username "admin" and password "admin" are NOT production secure
2. ⚠️ **No Password Complexity:** Simple password violates security best practices
3. ⚠️ **Development Only:** This user must be removed or credentials changed before production
4. ⚠️ **Admiral's Override:** Acknowledged for development purposes only

### Required Before Production:

- [ ] Change admin password to strong, complex password
- [ ] Remove default "admin/admin" credentials
- [ ] Implement proper password policy
- [ ] Add multi-factor authentication (MFA)
- [ ] Review and audit all admin access
- [ ] Update security documentation

### Security Memory Status:

**Status:** PENDING PRODUCTION SECURITY REVIEW  
**Reminder:** Lieutenant Worf will continue to remind the crew that this security measure has yet to be implemented until he recognizes in his memories that it has been changed/removed for production.

---

## 📝 Usage

### Sign In

1. Go to: `http://localhost:3000/auth/signin`
2. Enter:
   - Email: `admin@alex-ai.local`
   - Password: `admin`
3. Click "Sign In"

### Environment Variable

Add to your `.env.local` or environment:

```bash
AUTHORIZED_USERS="admin@alex-ai.local"
```

Or add to `~/.zshrc`:

```bash
export AUTHORIZED_USERS="admin@alex-ai.local"
```

---

## 🔄 Updating Credentials

### Change Password (Supabase Dashboard)

1. Go to: https://app.supabase.com/project/rpkkkbufdwxmjaerbhbn/auth/users
2. Find user: `admin@alex-ai.local`
3. Click "..." → "Reset Password"
4. Set new password

### Remove User (Before Production)

1. Go to: https://app.supabase.com/project/rpkkkbufdwxmjaerbhbn/auth/users
2. Find user: `admin@alex-ai.local`
3. Click "..." → "Delete User"
4. Remove from `AUTHORIZED_USERS` environment variable

---

## 📊 Crew Status

**Lieutenant Worf:** ⚠️ Security measure pending production review  
**Commander Data:** ✅ User creation process documented  
**Counselor Troi:** ✅ User experience flow verified  
**Commander Riker:** ✅ Execution plan complete

---

**End of Documentation**

