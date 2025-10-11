# 🔧 Fix N8N & Supabase Integration Issues

## 🔍 **Issues Identified**

### 1. **Missing Crew Members** ❌
**Problem**: Demo shows only 6 crew members instead of 9
- Current: Captain Picard, Data, La Forge, Worf, Troi, Quark  
- Missing: **Commander Riker**, **Dr. Crusher**, **Lieutenant Uhura**

**Root Cause**: `UNIVERSAL_INTEGRATION_DEMO.js` hardcodes only 6 members (line 46-52)

### 2. **Database Recommendation Issue** ❌
**Problem**: Recommending PostgreSQL instead of Supabase
**Root Cause**: Offline/standalone mode not connected to live Supabase RAG system

### 3. **N8N Integration Not Live** ❌
**Problem**: N8N workflows not connected to n8n.pbradygeorgen.com
**Root Cause**: Missing environment variables and configuration

---

## ✅ **Solution: Connect to Live Infrastructure**

### Step 1: Set Environment Variables

Create `.env` file in project root:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# N8N Configuration
N8N_WEBHOOK_URL=https://n8n.pbradygeorgen.com/webhook
N8N_API_URL=https://n8n.pbradygeorgen.com/api/v1
N8N_API_KEY=your-n8n-api-key

# Crew Configuration
CREW_ENABLED=true
CREW_MEMBER_COUNT=9
```

### Step 2: Fix Demo Crew Members

Update `UNIVERSAL_INTEGRATION_DEMO.js` line 44-62:

```javascript
crewAI: {
  enabled: true,
  members: [
    'Captain Picard',           // Strategic Leadership
    'Commander Riker',          // Tactical Execution (MISSING)
    'Commander Data',           // Advanced Analytics
    'Commander La Forge',       // Engineering Solutions
    'Lieutenant Worf',          // Security & Defense
    'Counselor Troi',          // Emotional Intelligence
    'Dr. Crusher',             // System Health (MISSING)
    'Lieutenant Uhura',        // Communications (MISSING)
    'Quark'                    // Business Intelligence
  ],
  knowledgeBase: [
    'strategic-planning',
    'tactical-execution',
    'technical-architecture',
    'engineering-optimization',
    'security-protocols',
    'user-experience-design',
    'system-health-diagnostics',
    'communications-integration',
    'cost-efficiency-analysis'
  ]
}
```

### Step 3: Update Database Recommendation Logic

Modify crew recommendation in `examples/demo-project/index.js`:

```javascript
// OLD (line ~200):
database: 'PostgreSQL + Redis'

// NEW:
database: 'Supabase (PostgreSQL + pgvector) + Redis'
storage: 'Supabase Storage'
rag: 'Supabase Vector Store (pgvector extension)'
n8n: 'n8n.pbradygeorgen.com workflows'
```

### Step 4: Enable Live N8N Connection

Update `examples/demo-project/index.js` to connect to live N8N:

```javascript
async function initializeWithLiveN8N() {
  const n8nClient = new N8NClient({
    baseUrl: process.env.N8N_API_URL,
    apiKey: process.env.N8N_API_KEY
  });
  
  // Test connection
  const health = await n8nClient.getHealth();
  console.log('✅ Connected to N8N:', health);
  
  // Sync crew workflows
  await n8nClient.syncCrewWorkflows();
  
  return n8nClient;
}
```

---

## 🔧 **Quick Fix Script**

Create `fix-integration.js`:

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Alex AI Integration...\n');

// 1. Update UNIVERSAL_INTEGRATION_DEMO.js
const demoPath = './UNIVERSAL_INTEGRATION_DEMO.js';
let demoContent = fs.readFileSync(demoPath, 'utf8');

demoContent = demoContent.replace(
  /members: \[[^\]]+\]/,
  `members: [
    'Captain Picard',
    'Commander Riker',
    'Commander Data',
    'Commander La Forge',
    'Lieutenant Worf',
    'Counselor Troi',
    'Dr. Crusher',
    'Lieutenant Uhura',
    'Quark'
  ]`
);

fs.writeFileSync(demoPath, demoContent);
console.log('✅ Fixed crew members in UNIVERSAL_INTEGRATION_DEMO.js');

// 2. Update demo index.js
const indexPath = './examples/demo-project/index.js';
let indexContent = fs.readFileSync(indexPath, 'utf8');

indexContent = indexContent.replace(
  /database: ['"]PostgreSQL \+ Redis['"]/,
  `database: 'Supabase (PostgreSQL + pgvector) + Redis'`
);

fs.writeFileSync(indexPath, indexContent);
console.log('✅ Fixed database recommendation in demo/index.js');

// 3. Create .env if missing
if (!fs.existsSync('.env')) {
  const envTemplate = `# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# N8N Configuration  
N8N_WEBHOOK_URL=https://n8n.pbradygeorgen.com/webhook
N8N_API_URL=https://n8n.pbradygeorgen.com/api/v1
N8N_API_KEY=your-n8n-api-key

# Crew Configuration
CREW_ENABLED=true
CREW_MEMBER_COUNT=9
`;
  fs.writeFileSync('.env', envTemplate);
  console.log('✅ Created .env template (UPDATE WITH YOUR CREDENTIALS)');
}

console.log('\n🎉 Integration fix complete!');
console.log('\n📋 Next steps:');
console.log('1. Update .env with your actual Supabase and N8N credentials');
console.log('2. Run: npm run demo');
console.log('3. Verify all 9 crew members appear');
console.log('4. Check database recommendation shows Supabase');
```

---

## 🚀 **Apply the Fix**

```bash
# Navigate to alex-ai-universal
cd /Users/bradygeorgen/Documents/workspace/alex-ai-universal

# Run the fix script
node fix-integration.js

# Update .env with your credentials

# Test the fixed demo
npm run demo
```

---

## 📊 **Verification Checklist**

After applying fix, verify:

- [ ] All 9 crew members appear in demo output
- [ ] Database recommendation shows "Supabase" not "PostgreSQL"
- [ ] N8N workflows reference n8n.pbradygeorgen.com
- [ ] RAG system mentions Supabase Vector Store
- [ ] Crew recommendations include all 9 members

---

## 🔗 **Live Integration Requirements**

### Supabase Setup Required:
1. **Crew Memories Table**: Store crew knowledge
2. **Vector Extension**: Enable pgvector for RAG
3. **Workflows Table**: Track N8N workflow executions
4. **Documents Table**: Store project documentation

### N8N Setup Required:
1. **Crew Analysis Workflow**: Analyze conversations
2. **RAG Sync Workflow**: Bidirectional memory sync
3. **Monitoring Workflow**: System health tracking
4. **Emergency Protocol**: Critical alerts

---

## 🎯 **Expected Output After Fix**

```
👥 Universal Crew Members:
  1. 🖖 Captain Picard
  2. 🖖 Commander Riker          ← FIXED
  3. 🖖 Commander Data
  4. 🖖 Commander La Forge
  5. 🖖 Lieutenant Worf
  6. 🖖 Counselor Troi
  7. 🖖 Dr. Crusher              ← FIXED
  8. 🖖 Lieutenant Uhura         ← FIXED
  9. 🖖 Quark

🛠️ Recommended Technical Stack:
  backend: Node.js + TypeScript
  frontend: React + Next.js
  database: Supabase (PostgreSQL + pgvector) + Redis  ← FIXED
  storage: Supabase Storage                            ← FIXED
  rag: Supabase Vector Store                          ← FIXED
  n8n: n8n.pbradygeorgen.com workflows               ← FIXED
```

---

## 🔐 **Get Your Credentials**

### Supabase:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy URL and anon key

### N8N:
1. Go to https://n8n.pbradygeorgen.com
2. Settings → API
3. Generate API key
4. Copy webhook URL

---

**Status**: Ready to fix! Run the fix script and update credentials to connect to live infrastructure.

