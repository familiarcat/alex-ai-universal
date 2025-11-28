# Vercel Deployment with Full DDD Integration

## 🏗️ Architecture

```
┌─────────────────┐
│  Vercel Client  │  (Dashboard - Public)
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│   n8n Server    │  (Controller Layer)
│ n8n.pbradygeorgen.com
└────────┬────────┘
         │ API
         ↓
┌─────────────────┐
│   MCP Server    │  (Integration Layer)
│ mcp.pbradygeorgen.com
└────────┬────────┘
         │ Service Role Key
         ↓
┌─────────────────┐
│   Supabase      │  (Database)
└─────────────────┘
```

## 🔐 Environment Variables

### Public (Client-Side)
- `NEXT_PUBLIC_N8N_URL` - n8n controller endpoint
- `NEXT_PUBLIC_MCP_URL` - MCP server endpoint
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Private (Server-Side Only)
- `MCP_API_KEY` - MCP server authentication
- `N8N_API_KEY` - n8n API authentication
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `OPENROUTER_API_KEY` - OpenRouter API key (optional)

## 🚀 Deployment

### Automated Deployment
```bash
./scripts/deploy-dashboard-vercel.sh
```

The script automatically:
1. ✅ Extracts credentials from `~/.zshrc`
2. ✅ Configures Vercel environment variables
3. ✅ Deploys with full DDD integration
4. ✅ Sets up Client => n8n => MCP => Supabase flow

### Manual Environment Variable Setup

If automated setup fails, configure in Vercel dashboard:
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all variables listed above

## 📋 DDD Flow

### Content Storage
```
User edits content (Vercel Dashboard)
  ↓
Client API Route (/api/content/store)
  ↓
n8n Webhook (/webhook/project-content-store)
  ↓
MCP Server (mcp.pbradygeorgen.com/api/content/store)
  ↓
Supabase (projects table)
```

### Content Retrieval
```
User loads project (Vercel Dashboard)
  ↓
Client API Route (/api/content/retrieve)
  ↓
n8n Webhook (/webhook/project-content-retrieve)
  ↓
MCP Server (mcp.pbradygeorgen.com/api/content/retrieve)
  ↓
Supabase (projects table)
  ↓
Client (display content)
```

## ✅ Benefits

1. **Full DDD Compliance** - Client never accesses Supabase directly
2. **Secure** - API keys only on server-side
3. **Scalable** - Vercel CDN + n8n controller + MCP integration
4. **Maintainable** - Clear separation of concerns
5. **Automated** - One-command deployment

## 🔄 Updates

To update the deployment:
```bash
./scripts/deploy-dashboard-vercel.sh
```

Environment variables are automatically synced from `~/.zshrc`.

## 🛠️ Troubleshooting

### MCP Server Not Responding
- Check `MCP_URL` and `MCP_API_KEY` in Vercel environment variables
- Verify MCP server is running: `https://mcp.pbradygeorgen.com/health`
- Check n8n workflows are configured to use MCP

### Supabase Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
- Check `SUPABASE_SERVICE_KEY` for server-side operations
- Verify Supabase RLS policies allow n8n/MCP access

### n8n Workflow Errors
- Check n8n webhook endpoints are active
- Verify n8n has Supabase credentials configured
- Check n8n workflow logs for errors

## 📊 Status Check

After deployment, verify DDD integration:
1. Visit: `https://[your-vercel-url]/api/mcp/status`
2. Check all services show "online"
3. Verify MCP server is accessible
4. Test content storage/retrieval

---

**Crew:** La Forge (Infrastructure) + Data (Architecture) + Riker (Execution)

