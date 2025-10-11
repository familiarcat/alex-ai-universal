# GitHub Secrets Setup for Alex AI CI/CD

## 🔐 Overview
This guide shows how to configure GitHub repository secrets for Alex AI's N8N and Supabase integration.

---

## 📋 Required Secrets

### Supabase Secrets
| Secret Name | Value (from your .env) | Purpose |
|-------------|------------------------|---------|
| `SUPABASE_URL` | `https://rpkkkbufdwxmjaerbhbn.supabase.co` | Supabase project URL |
| `SUPABASE_ANON_KEY` | `sb_secret_TCaP5QXq4PHTtsjxcU1l1Q_XB5nRLJg` | Supabase anonymous key |
| `SUPABASE_KEY` | `sb_publishable_ibWfa8oHqDMzbhEr6BxgBw_0aXaq3DU` | Supabase publishable key |

### N8N Secrets
| Secret Name | Value (from your .env) | Purpose |
|-------------|------------------------|---------|
| `N8N_API_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | N8N API authentication |

### LLM API Keys (Optional but recommended)
| Secret Name | Value | Purpose |
|-------------|-------|---------|
| `OPENAI_API_KEY` | Your OpenAI key | OpenAI API access |
| `ANTHROPIC_API_KEY` | Your Anthropic key | Claude API access |

---

## 🚀 How to Add Secrets to GitHub

### Step 1: Go to Repository Settings
1. Navigate to your GitHub repository
2. Click **Settings** tab
3. In sidebar, click **Secrets and variables** → **Actions**

### Step 2: Add Each Secret
For each secret in the table above:

1. Click **New repository secret**
2. **Name**: Enter exact name from table (e.g., `SUPABASE_URL`)
3. **Value**: Copy value from your `.env` file
4. Click **Add secret**
5. Repeat for all secrets

### Step 3: Quick Copy Commands

Use these commands to copy values directly from your .env:

```bash
# Copy Supabase URL
grep "^SUPABASE_URL=" .env | cut -d '=' -f2 | pbcopy
echo "✅ SUPABASE_URL copied to clipboard - paste in GitHub"

# Copy Supabase Anon Key
grep "^SUPABASE_ANON_KEY=" .env | cut -d '=' -f2 | pbcopy
echo "✅ SUPABASE_ANON_KEY copied to clipboard - paste in GitHub"

# Copy N8N API Key
grep "^N8N_API_KEY=" .env | cut -d '=' -f2 | pbcopy
echo "✅ N8N_API_KEY copied to clipboard - paste in GitHub"

# Copy OpenAI API Key
grep "^OPENAI_API_KEY=" .env | cut -d '=' -f2 | pbcopy
echo "✅ OPENAI_API_KEY copied to clipboard - paste in GitHub"
```

---

## 🔍 Verify Secrets Are Set

After adding all secrets:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all secrets listed (values hidden)
3. Click **Update** to change any secret if needed

---

## 🤖 GitHub Actions Workflow Created

I've created `.github/workflows/alex-ai-integration.yml` that:

✅ **Automatically runs on**:
- Push to main or develop branches
- Pull requests
- Manual trigger (workflow_dispatch)

✅ **Tests**:
- Crew member count (verifies all 9)
- Database recommendations (verifies Supabase)
- N8N connection (if API key configured)
- Supabase connection (if credentials configured)

✅ **Uses secrets securely**:
- Secrets never exposed in logs
- Only available to workflow
- Encrypted by GitHub

---

## 🧪 Test Workflow Locally

Before pushing, test locally with your credentials:

```bash
# Verify .env is configured
cat .env | grep -E "(SUPABASE_URL|N8N_API_KEY)"

# Test universal demo
npm run universal-demo | grep "Universal Crew Members:" -A 10

# Test database recommendations
npm run demo | grep "Recommended Technical Stack:" -A 5

# Test N8N connection
curl -H "X-N8N-API-KEY: $(grep N8N_API_KEY .env | cut -d= -f2)" \
  https://n8n.pbradygeorgen.com/api/v1/workflows

# Test Supabase connection
curl "$(grep ^SUPABASE_URL= .env | cut -d= -f2)/rest/v1/" \
  -H "apikey: $(grep ^SUPABASE_ANON_KEY= .env | cut -d= -f2)"
```

---

## 🔒 Security Best Practices

### ✅ Do:
- Use GitHub Secrets for sensitive data
- Keep .env file in .gitignore
- Rotate keys periodically
- Use different keys for dev/staging/prod
- Enable GitHub secret scanning
- Review access logs regularly

### ❌ Don't:
- Never commit .env file
- Never hardcode secrets in code
- Never share secrets in issues/PRs
- Never log secret values
- Never use production keys in dev

---

## 📊 Secrets Checklist

- [ ] `SUPABASE_URL` added to GitHub
- [ ] `SUPABASE_ANON_KEY` added to GitHub
- [ ] `SUPABASE_KEY` added to GitHub
- [ ] `N8N_API_KEY` added to GitHub
- [ ] `OPENAI_API_KEY` added to GitHub (optional)
- [ ] `ANTHROPIC_API_KEY` added to GitHub (optional)
- [ ] `.env` file NOT committed (in .gitignore)
- [ ] Workflow file committed (alex-ai-integration.yml)
- [ ] Tested locally before pushing
- [ ] Verified secrets in GitHub UI

---

## 🚀 Trigger the Workflow

### Method 1: Push to Branch
```bash
git add .github/workflows/alex-ai-integration.yml
git commit -m "feat: Add Alex AI N8N & Supabase integration workflow"
git push
```

### Method 2: Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **Alex AI Integration - N8N & Supabase**
3. Click **Run workflow**
4. Choose branch and click **Run workflow**

---

## 📈 What the Workflow Tests

1. **✅ Crew Members**: Verifies all 9 crew members are active
2. **✅ Database Config**: Confirms Supabase recommendations
3. **✅ N8N Connection**: Tests API connectivity to n8n.pbradygeorgen.com
4. **✅ Supabase Connection**: Tests database connectivity
5. **✅ Environment**: Validates all required vars are set

---

## 🎯 Expected Output

When workflow runs successfully:

```
================================================
🖖 Alex AI Integration Test Summary
================================================

✅ Crew Members: 9 (verified)
✅ Database: Supabase recommendations (verified)
✅ Environment: Configured

📊 Integration Status:
  - Offline Demo: Working
  - N8N: Configured
  - Supabase: Configured
```

---

## 🆘 Troubleshooting

### Workflow Fails to Connect to N8N
- Verify `N8N_API_KEY` secret is correct
- Check n8n.pbradygeorgen.com is accessible
- Confirm API key has proper permissions

### Workflow Fails to Connect to Supabase
- Verify `SUPABASE_URL` is correct
- Check `SUPABASE_ANON_KEY` is valid
- Confirm Supabase project is active

### Secrets Not Found
- Verify secret names match exactly (case-sensitive)
- Check secrets are set in correct repository
- Confirm workflow has access to secrets

---

## 📚 Additional Resources

- **GitHub Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **GitHub Actions**: https://docs.github.com/en/actions
- **Supabase Docs**: https://supabase.com/docs
- **N8N API Docs**: https://docs.n8n.io/api/

---

## ✅ Success Criteria

Once setup is complete, you should have:

- ✅ All secrets configured in GitHub
- ✅ Workflow file committed and pushed
- ✅ Workflow runs successfully on push
- ✅ All 9 crew members active in demo
- ✅ Supabase recommendations shown
- ✅ N8N connection tested
- ✅ Live RAG sync operational

---

**Status**: Ready for GitHub secrets configuration!

**Next**: Add secrets to GitHub and trigger the workflow.

