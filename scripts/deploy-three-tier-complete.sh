#!/bin/bash

# 🖖 Three-Tier Dashboard Architecture - Complete Deployment
# 
# Captain Picard: "Make it so"
# 
# Mission: Deploy Supabase schema, create n8n webhooks, test system
# Crew: All hands on deck

set -e

echo "🖖 Three-Tier Dashboard Architecture - Complete Deployment"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Load credentials from ~/.zshrc
echo -e "${BLUE}🔐 Loading credentials...${NC}"
export SUPABASE_URL=$(grep 'export SUPABASE_URL=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' || echo "")
export SUPABASE_SERVICE_KEY=$(grep 'export SUPABASE_SERVICE_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' || echo "")
export N8N_URL=$(grep 'export N8N_URL=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' || echo "https://n8n.pbradygeorgen.com")
export N8N_API_KEY=$(grep 'export N8N_API_KEY=' ~/.zshrc | cut -d'=' -f2 | tr -d '"' || echo "")

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${RED}❌ Supabase credentials not found in ~/.zshrc${NC}"
    echo "   Please add:"
    echo "   export SUPABASE_URL='your-url'"
    echo "   export SUPABASE_SERVICE_KEY='your-key'"
    exit 1
fi

echo -e "${GREEN}✅ Credentials loaded${NC}"
echo ""

# Step 1: Deploy Supabase Schema
echo -e "${BLUE}📊 Step 1: Deploying Supabase Schema${NC}"
echo "   Schema: supabase/schema-three-tier-dashboard.sql"
echo ""

SCHEMA_FILE="supabase/schema-three-tier-dashboard.sql"

if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_FILE${NC}"
    exit 1
fi

echo "   📤 Deploying via Supabase API (DDD-compliant)..."
echo ""

# Use Supabase REST API to execute SQL (via n8n webhook if available, or direct)
# For now, we'll create a script that can be run manually or via n8n
DEPLOY_SCRIPT="scripts/deploy-supabase-schema.js"

cat > "$DEPLOY_SCRIPT" << 'EOF'
#!/usr/bin/env node
/**
 * Deploy Supabase Schema via API
 * DDD-compliant: Goes through n8n if available, otherwise direct
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';

async function deploySchema() {
  const schemaFile = path.join(__dirname, '..', 'supabase', 'schema-three-tier-dashboard.sql');
  const schema = fs.readFileSync(schemaFile, 'utf8');
  
  console.log('📊 Deploying Supabase schema...');
  console.log(`   URL: ${SUPABASE_URL}`);
  console.log(`   Schema size: ${schema.length} bytes`);
  console.log('');
  
  try {
    // Try n8n webhook first (DDD-compliant)
    const n8nResponse = await fetch(`${N8N_URL}/webhook/supabase-schema-deploy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sql: schema })
    }).catch(() => null);
    
    if (n8nResponse && n8nResponse.ok) {
      console.log('✅ Schema deployed via n8n webhook');
      return;
    }
    
    // Fallback: Direct Supabase API (for initial setup)
    console.log('   ⚠️  n8n webhook not available, using direct API...');
    
    // Split schema into statements and execute
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`   📝 Executing ${statements.length} SQL statements...`);
    
    // Note: Supabase REST API doesn't support raw SQL execution
    // This would need to be done via Supabase dashboard or psql
    console.log('');
    console.log('⚠️  Direct API execution not supported');
    console.log('📋 Please run the schema manually:');
    console.log(`   1. Open Supabase Dashboard: ${SUPABASE_URL.replace('https://', 'https://app.supabase.com/project/')}`);
    console.log('   2. Go to SQL Editor');
    console.log(`   3. Paste contents of: ${schemaFile}`);
    console.log('   4. Execute');
    console.log('');
    console.log('   Or create n8n webhook: /webhook/supabase-schema-deploy');
    
  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    process.exit(1);
  }
}

deploySchema();
EOF

chmod +x "$DEPLOY_SCRIPT"
node "$DEPLOY_SCRIPT"

echo ""

# Step 2: Create n8n RBAC Webhooks
echo -e "${BLUE}🔐 Step 2: Creating n8n RBAC Webhooks${NC}"
echo "   Webhooks needed:"
echo "     • /webhook/rbac-check"
echo "     • /webhook/rbac-get-roles"
echo "     • /webhook/rbac-assign-role"
echo "     • /webhook/rbac-revoke-role"
echo ""

# Create webhook workflow templates
WEBHOOKS_DIR="n8n-workflows/rbac-webhooks"
mkdir -p "$WEBHOOKS_DIR"

echo "   📝 Creating webhook workflow templates..."

# RBAC Check Webhook
cat > "$WEBHOOKS_DIR/rbac-check.json" << 'EOF'
{
  "name": "RBAC Check Permission",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "rbac-check",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "rpc",
        "functionName": "check_user_permission"
      },
      "name": "Check Permission",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { hasPermission: $json[0].check_user_permission } }}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Check Permission", "type": "main", "index": 0 }]]
    },
    "Check Permission": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    }
  }
}
EOF

# RBAC Get Roles Webhook
cat > "$WEBHOOKS_DIR/rbac-get-roles.json" << 'EOF'
{
  "name": "RBAC Get User Roles",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "rbac-get-roles",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT role FROM user_roles WHERE user_id = $1 AND ($2::text IS NULL OR project_id = $2) AND ($3::text IS NULL OR tier = $3)"
      },
      "name": "Get Roles",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { roles: $json.map(r => r.role) } }}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Get Roles", "type": "main", "index": 0 }]]
    },
    "Get Roles": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    }
  }
}
EOF

# RBAC Assign Role Webhook
cat > "$WEBHOOKS_DIR/rbac-assign-role.json" << 'EOF'
{
  "name": "RBAC Assign Role",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "rbac-assign-role",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO user_roles (user_id, project_id, role, tier, expires_at) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (user_id, project_id, role, tier) DO UPDATE SET expires_at = EXCLUDED.expires_at RETURNING *"
      },
      "name": "Assign Role",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, role: $json[0] } }}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Assign Role", "type": "main", "index": 0 }]]
    },
    "Assign Role": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    }
  }
}
EOF

# RBAC Revoke Role Webhook
cat > "$WEBHOOKS_DIR/rbac-revoke-role.json" << 'EOF'
{
  "name": "RBAC Revoke Role",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "rbac-revoke-role",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "DELETE FROM user_roles WHERE user_id = $1 AND ($2::text IS NULL OR project_id = $2) AND role = $3 AND tier = $4"
      },
      "name": "Revoke Role",
      "type": "n8n-nodes-base.postgres",
      "position": [450, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true } }}"
      },
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [650, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Revoke Role", "type": "main", "index": 0 }]]
    },
    "Revoke Role": {
      "main": [[{ "node": "Respond", "type": "main", "index": 0 }]]
    }
  }
}
EOF

echo -e "${GREEN}✅ Webhook workflows created in: $WEBHOOKS_DIR${NC}"
echo "   📋 Import these workflows into n8n:"
echo "      1. Open n8n: $N8N_URL"
echo "      2. Import each JSON file from $WEBHOOKS_DIR"
echo "      3. Configure Supabase connection in each workflow"
echo ""

# Step 3: Test Implementation
echo -e "${BLUE}🧪 Step 3: Testing Three-Tier System${NC}"
echo ""

TEST_SCRIPT="scripts/test-three-tier-system.js"

cat > "$TEST_SCRIPT" << 'EOF'
#!/usr/bin/env node
/**
 * Test Three-Tier Dashboard System
 */

const path = require('path');

console.log('🧪 Testing Three-Tier Dashboard System\n');

// Test tier detection
const { detectTierFromPath, extractProjectIdFromPath, getTierContext } = require('../dashboard/lib/tier-detection');

const testCases = [
  { path: '/dashboard', expectedTier: 'main' },
  { path: '/dashboard/projects/alpha', expectedTier: 'project', expectedProjectId: 'alpha' },
  { path: '/projects/beta', expectedTier: 'published', expectedProjectId: 'beta' },
  { path: '/dashboard/analytics', expectedTier: 'main' }
];

console.log('📊 Tier Detection Tests:');
let passed = 0;
let failed = 0;

for (const test of testCases) {
  const tier = detectTierFromPath(test.path);
  const projectId = extractProjectIdFromPath(test.path);
  const context = getTierContext(test.path);
  
  const tierPass = tier === test.expectedTier;
  const projectPass = !test.expectedProjectId || projectId === test.expectedProjectId;
  
  if (tierPass && projectPass) {
    console.log(`   ✅ ${test.path} → Tier: ${tier}, Project: ${projectId || 'N/A'}`);
    passed++;
  } else {
    console.log(`   ❌ ${test.path} → Expected: ${test.expectedTier}/${test.expectedProjectId}, Got: ${tier}/${projectId}`);
    failed++;
  }
}

console.log(`\n   Results: ${passed} passed, ${failed} failed\n`);

// Test RBAC
const { getRolePermissions, hasPermission, canAccessTier } = require('../dashboard/lib/rbac');

console.log('🔐 RBAC Tests:');
const rbacTests = [
  { role: 'admin', permission: 'admin', expected: true },
  { role: 'project_owner', permission: 'write', expected: true },
  { role: 'project_viewer', permission: 'write', expected: false },
  { role: 'public', permission: 'read', expected: true }
];

let rbacPassed = 0;
let rbacFailed = 0;

for (const test of rbacTests) {
  const result = hasPermission(test.role, test.permission);
  if (result === test.expected) {
    console.log(`   ✅ ${test.role}.${test.permission} = ${result}`);
    rbacPassed++;
  } else {
    console.log(`   ❌ ${test.role}.${test.permission} = ${result}, expected ${test.expected}`);
    rbacFailed++;
  }
}

console.log(`\n   Results: ${rbacPassed} passed, ${rbacFailed} failed\n`);

// Summary
const totalPassed = passed + rbacPassed;
const totalFailed = failed + rbacFailed;

console.log('═══════════════════════════════════════════════════════════');
console.log(`📊 Test Summary: ${totalPassed} passed, ${totalFailed} failed`);

if (totalFailed === 0) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed');
  process.exit(1);
}
EOF

chmod +x "$TEST_SCRIPT"

# Note: This test requires TypeScript compilation, so we'll create a simpler version
echo "   📝 Test script created: $TEST_SCRIPT"
echo "   ⚠️  Note: Run tests after TypeScript compilation"
echo ""

# Summary
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ Deployment Preparation Complete!${NC}"
echo ""
echo "📋 Manual Steps Required:"
echo ""
echo "1. Deploy Supabase Schema:"
echo "   • Open Supabase Dashboard"
echo "   • Go to SQL Editor"
echo "   • Run: supabase/schema-three-tier-dashboard.sql"
echo ""
echo "2. Import n8n Webhooks:"
echo "   • Open n8n: $N8N_URL"
echo "   • Import workflows from: $WEBHOOKS_DIR"
echo "   • Configure Supabase connection"
echo ""
echo "3. Test System:"
echo "   • Run: npm run test:three-tier (after compilation)"
echo "   • Verify tier routing in browser"
echo ""
echo "💰 Cost: \$0/month (Supabase free tier)"
echo "🚀 Status: Ready for deployment"
echo ""

