# 🔐 Developer Login Credentials

## Quick Reference

**Email:** `admin@alex-ai.local`  
**Password:** `admin`  
**Username:** `admin`

---

## 📋 Full Credentials

### Admin User (Development Only)

- **Email:** `admin@alex-ai.local`
- **Password:** `admin`
- **Role:** `admin`
- **Status:** Development only (Admiral's Override)
- **Security:** PENDING PRODUCTION REVIEW

---

## 🚀 How to Sign In

1. **Navigate to:** http://localhost:3000/auth/signin
2. **Enter Email:** `admin@alex-ai.local`
3. **Enter Password:** `admin`
4. **Click:** "Sign In"

---

## ⚠️ Important Notes

### Email Format
- ✅ **Correct:** `admin@alex-ai.local`
- ❌ **Incorrect:** `admin` (missing @ symbol)

The email must include the full domain: `@alex-ai.local`

### Development Only
- These credentials are for **development purposes only**
- **Admiral's Override** acknowledged
- **Must be changed** before production deployment
- **Lieutenant Worf's Security Status:** PENDING PRODUCTION REVIEW

---

## 🛡️ Security Reminder

**Lieutenant Worf:**
> "I recommend we raise shields. These default credentials are NOT production secure. Status: PENDING PRODUCTION REVIEW."

**Required Before Production:**
- [ ] Change password from "admin" to strong, complex password
- [ ] Remove default credentials
- [ ] Implement password policy
- [ ] Add multi-factor authentication
- [ ] Complete security audit

---

## 🔄 Troubleshooting

### "Invalid email or password"
- Verify you're using: `admin@alex-ai.local` (not just `admin`)
- Check that password is: `admin`
- Ensure user exists in Supabase
- Verify `AUTHORIZED_USERS` includes `admin@alex-ai.local`

### "Access denied. This account is not authorized."
- Add `admin@alex-ai.local` to `AUTHORIZED_USERS` environment variable
- Reload shell: `source ~/.zshrc`
- Restart dashboard server

### Email Validation Error
- Make sure to include `@alex-ai.local` in the email
- The email field requires a valid email format

---

## 📝 Environment Setup

Ensure `AUTHORIZED_USERS` is set:

```bash
export AUTHORIZED_USERS="admin@alex-ai.local"
```

Or in `dashboard/.env.local`:
```
AUTHORIZED_USERS=admin@alex-ai.local
```

---

## 🎯 Quick Copy-Paste

**Email:**
```
admin@alex-ai.local
```

**Password:**
```
admin
```

---

**End of Documentation**

