#!/bin/bash

# 🖖 Dashboard Deployment to Vercel
# 
# Option 1: Fastest path to live URL
# Fully automated using Vercel CLI
# 
# Crew: La Forge (Infrastructure) + Riker (Execution) + Data (Optimization)

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🖖 Dashboard Deployment to Vercel${NC}"
echo -e "${CYAN}   Fastest Path to Live URL${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Extract credentials from ~/.zshrc
extract_env_var() {
    local var_name=$1
    local default=$2
    local value=$(grep -E "^export ${var_name}=" ~/.zshrc 2>/dev/null | head -1 | sed -E "s/^export ${var_name}=['\"]?([^'\"]*)['\"]?.*/\1/" | head -1 || echo "")
    echo "${value:-$default}"
}

N8N_URL=$(extract_env_var "N8N_URL" "https://n8n.pbradygeorgen.com")
MCP_URL=$(extract_env_var "MCP_URL" "https://mcp.pbradygeorgen.com")
MCP_API_KEY=$(extract_env_var "MCP_API_KEY" "")
N8N_API_KEY=$(extract_env_var "N8N_API_KEY" "")
SUPABASE_URL=$(extract_env_var "SUPABASE_URL" "")
SUPABASE_ANON_KEY=$(extract_env_var "SUPABASE_ANON_KEY" "")
SUPABASE_SERVICE_KEY=$(extract_env_var "SUPABASE_SERVICE_KEY" "")
OPENROUTER_API_KEY=$(extract_env_var "OPENROUTER_API_KEY" "")

# Use N8N_API_KEY as fallback for MCP_API_KEY if MCP_API_KEY not set
if [ -z "$MCP_API_KEY" ] && [ -n "$N8N_API_KEY" ]; then
    MCP_API_KEY="$N8N_API_KEY"
fi

echo -e "${GREEN}✅ Configuration:${NC}"
echo "   N8N URL: $N8N_URL"
echo "   MCP URL: $MCP_URL"
if [ -n "$MCP_API_KEY" ]; then
    echo "   MCP API Key: Configured"
fi
if [ -n "$SUPABASE_URL" ]; then
    echo "   Supabase: Configured"
fi
echo ""

# Step 1: Check Vercel CLI
echo -e "${BLUE}📋 Step 1: Checking Vercel CLI${NC}"

if ! command -v vercel &> /dev/null; then
    echo "   📦 Installing Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}   ✅ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}   ✅ Vercel CLI found${NC}"
fi
echo ""

# Step 2: Navigate to dashboard directory
echo -e "${BLUE}📁 Step 2: Preparing Dashboard${NC}"
cd "$(dirname "$0")/../dashboard" || exit 1
echo "   📂 Working directory: $(pwd)"
echo ""

# Step 3: Create/Update Vercel configuration
echo -e "${BLUE}⚙️  Step 3: Configuring Vercel${NC}"

# Create vercel.json if it doesn't exist
if [ ! -f "vercel.json" ]; then
    cat > vercel.json << EOF
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "N8N_URL": "$N8N_URL",
    "NEXT_PUBLIC_N8N_URL": "$N8N_URL"
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ]
}
EOF
    echo "   📝 Created vercel.json"
else
    echo "   ✅ vercel.json exists"
fi

# Add environment variables if available
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
    echo "   🔐 Adding Supabase environment variables..."
    export SUPABASE_URL
    export SUPABASE_ANON_KEY
    export NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL"
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY"
    if [ -n "$SUPABASE_SERVICE_KEY" ]; then
        export SUPABASE_SERVICE_KEY
        export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_KEY"
    fi
fi

if [ -n "$MCP_URL" ]; then
    echo "   🔐 Adding MCP server environment variables..."
    export MCP_URL
    export NEXT_PUBLIC_MCP_URL="$MCP_URL"
    if [ -n "$MCP_API_KEY" ]; then
        export MCP_API_KEY
    fi
fi

if [ -n "$N8N_API_KEY" ]; then
    export N8N_API_KEY
fi

if [ -n "$OPENROUTER_API_KEY" ]; then
    export OPENROUTER_API_KEY
fi

echo -e "${GREEN}   ✅ Configuration ready${NC}"
echo ""

# Step 4: Deploy to Vercel
echo -e "${BLUE}🚀 Step 4: Deploying to Vercel${NC}"
echo "   📤 Starting deployment..."
echo ""

# Step 5: Set Vercel environment variables (DDD Integration)
echo -e "${BLUE}🔐 Step 5: Configuring Vercel Environment Variables${NC}"
echo "   Setting up DDD architecture (Client => n8n => MCP => Supabase)..."
echo ""

# Check if project is linked (required for env vars)
if [ ! -f ".vercel/project.json" ]; then
    echo -e "${YELLOW}   ⚠️  Project not linked yet - env vars will be set after linking${NC}"
    echo "   Environment variables will be configured after project linking."
    ENV_VARS_PENDING=true
else
    ENV_VARS_PENDING=false
fi

# Function to set Vercel env var (production)
set_vercel_env() {
    local key=$1
    local value=$2
    local env_type=${3:-production}
    
    if [ -n "$value" ]; then
        echo -n "   Setting $key... "
        if echo "$value" | vercel env add "$key" "$env_type" 2>/dev/null; then
            echo -e "${GREEN}✅${NC}"
        else
            # Try to update existing
            echo "$value" | vercel env rm "$key" "$env_type" --yes 2>/dev/null
            if echo "$value" | vercel env add "$key" "$env_type" 2>/dev/null; then
                echo -e "${GREEN}✅ (updated)${NC}"
            else
                echo -e "${YELLOW}⚠️  (manual setup required)${NC}"
                echo "      Run: echo '$value' | vercel env add $key $env_type"
            fi
        fi
    fi
}

# Set environment variables if project is linked
if [ "$ENV_VARS_PENDING" = false ]; then
    # Set public environment variables (accessible in browser)
    if [ -n "$N8N_URL" ]; then
        set_vercel_env "NEXT_PUBLIC_N8N_URL" "$N8N_URL" "production"
    fi

    if [ -n "$MCP_URL" ]; then
        set_vercel_env "NEXT_PUBLIC_MCP_URL" "$MCP_URL" "production"
    fi

    if [ -n "$SUPABASE_URL" ]; then
        set_vercel_env "NEXT_PUBLIC_SUPABASE_URL" "$SUPABASE_URL" "production"
    fi

    if [ -n "$SUPABASE_ANON_KEY" ]; then
        set_vercel_env "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$SUPABASE_ANON_KEY" "production"
    fi

    # Set private environment variables (server-side only)
    if [ -n "$MCP_API_KEY" ]; then
        set_vercel_env "MCP_API_KEY" "$MCP_API_KEY" "production"
    fi

    if [ -n "$N8N_API_KEY" ]; then
        set_vercel_env "N8N_API_KEY" "$N8N_API_KEY" "production"
    fi

    if [ -n "$SUPABASE_SERVICE_KEY" ]; then
        set_vercel_env "SUPABASE_SERVICE_KEY" "$SUPABASE_SERVICE_KEY" "production"
        set_vercel_env "SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_SERVICE_KEY" "production"
    fi

    if [ -n "$OPENROUTER_API_KEY" ]; then
        set_vercel_env "OPENROUTER_API_KEY" "$OPENROUTER_API_KEY" "production"
    fi
fi

echo ""
if [ "$ENV_VARS_PENDING" = true ]; then
    echo -e "${YELLOW}   📝 Environment variables will be configured after project linking${NC}"
    echo "   After deployment, set these in Vercel dashboard:"
    echo "   https://vercel.com/dashboard -> Project -> Settings -> Environment Variables"
    echo ""
    echo "   Required variables:"
    [ -n "$MCP_URL" ] && echo "   • NEXT_PUBLIC_MCP_URL = $MCP_URL"
    [ -n "$MCP_API_KEY" ] && echo "   • MCP_API_KEY = (configured)"
    [ -n "$N8N_URL" ] && echo "   • NEXT_PUBLIC_N8N_URL = $N8N_URL"
    [ -n "$SUPABASE_URL" ] && echo "   • NEXT_PUBLIC_SUPABASE_URL = $SUPABASE_URL"
    echo ""
else
    echo -e "${GREEN}   ✅ Environment variables configured${NC}"
fi
echo ""

# Step 6: Deploy to Vercel
echo -e "${BLUE}🚀 Step 6: Deploying to Vercel${NC}"
echo "   📤 Starting deployment with DDD integration..."
echo ""

# Check if already linked to Vercel project
if [ -f ".vercel/project.json" ]; then
    echo "   🔗 Project already linked, deploying..."
    vercel --prod --yes 2>&1 | tee /tmp/vercel-deploy.log
    
    # If env vars were pending, set them now
    if [ "$ENV_VARS_PENDING" = true ]; then
        echo ""
        echo -e "${BLUE}   🔐 Setting environment variables now that project is linked...${NC}"
        [ -n "$N8N_URL" ] && echo "$N8N_URL" | vercel env add "NEXT_PUBLIC_N8N_URL" "production" 2>/dev/null || true
        [ -n "$MCP_URL" ] && echo "$MCP_URL" | vercel env add "NEXT_PUBLIC_MCP_URL" "production" 2>/dev/null || true
        [ -n "$SUPABASE_URL" ] && echo "$SUPABASE_URL" | vercel env add "NEXT_PUBLIC_SUPABASE_URL" "production" 2>/dev/null || true
        [ -n "$SUPABASE_ANON_KEY" ] && echo "$SUPABASE_ANON_KEY" | vercel env add "NEXT_PUBLIC_SUPABASE_ANON_KEY" "production" 2>/dev/null || true
        [ -n "$MCP_API_KEY" ] && echo "$MCP_API_KEY" | vercel env add "MCP_API_KEY" "production" 2>/dev/null || true
        [ -n "$N8N_API_KEY" ] && echo "$N8N_API_KEY" | vercel env add "N8N_API_KEY" "production" 2>/dev/null || true
        [ -n "$SUPABASE_SERVICE_KEY" ] && echo "$SUPABASE_SERVICE_KEY" | vercel env add "SUPABASE_SERVICE_KEY" "production" 2>/dev/null || true
        [ -n "$OPENROUTER_API_KEY" ] && echo "$OPENROUTER_API_KEY" | vercel env add "OPENROUTER_API_KEY" "production" 2>/dev/null || true
        echo -e "${GREEN}   ✅ Environment variables set${NC}"
        echo ""
        echo -e "${YELLOW}   🔄 Redeploying with new environment variables...${NC}"
        vercel --prod --yes 2>&1 | tee /tmp/vercel-deploy.log
    fi
else
    echo "   🔗 Linking project (first time)..."
    echo "   💡 You may be prompted to:"
    echo "      - Login to Vercel (if not logged in)"
    echo "      - Create/select project"
    echo "      - Confirm deployment settings"
    echo ""
    
    # Non-interactive deployment
    vercel --prod --yes --token="${VERCEL_TOKEN:-}" 2>&1 | tee /tmp/vercel-deploy.log || {
        echo ""
        echo -e "${YELLOW}   ⚠️  Automated deployment requires VERCEL_TOKEN${NC}"
        echo "   Running interactive deployment instead..."
        echo ""
        vercel --prod
    }
    
    # After linking, set environment variables
    if [ -f ".vercel/project.json" ]; then
        echo ""
        echo -e "${BLUE}   🔐 Setting environment variables...${NC}"
        [ -n "$N8N_URL" ] && echo "$N8N_URL" | vercel env add "NEXT_PUBLIC_N8N_URL" "production" 2>/dev/null || true
        [ -n "$MCP_URL" ] && echo "$MCP_URL" | vercel env add "NEXT_PUBLIC_MCP_URL" "production" 2>/dev/null || true
        [ -n "$SUPABASE_URL" ] && echo "$SUPABASE_URL" | vercel env add "NEXT_PUBLIC_SUPABASE_URL" "production" 2>/dev/null || true
        [ -n "$SUPABASE_ANON_KEY" ] && echo "$SUPABASE_ANON_KEY" | vercel env add "NEXT_PUBLIC_SUPABASE_ANON_KEY" "production" 2>/dev/null || true
        [ -n "$MCP_API_KEY" ] && echo "$MCP_API_KEY" | vercel env add "MCP_API_KEY" "production" 2>/dev/null || true
        [ -n "$N8N_API_KEY" ] && echo "$N8N_API_KEY" | vercel env add "N8N_API_KEY" "production" 2>/dev/null || true
        [ -n "$SUPABASE_SERVICE_KEY" ] && echo "$SUPABASE_SERVICE_KEY" | vercel env add "SUPABASE_SERVICE_KEY" "production" 2>/dev/null || true
        [ -n "$OPENROUTER_API_KEY" ] && echo "$OPENROUTER_API_KEY" | vercel env add "OPENROUTER_API_KEY" "production" 2>/dev/null || true
        echo -e "${GREEN}   ✅ Environment variables set${NC}"
        echo ""
        echo -e "${YELLOW}   🔄 Redeploying with new environment variables...${NC}"
        vercel --prod --yes 2>&1 | tee /tmp/vercel-deploy.log
    fi
fi

# Extract deployment URL from log
DEPLOYMENT_URL=$(grep -E "https://.*\.vercel\.app" /tmp/vercel-deploy.log | tail -1 | grep -oE "https://[^ ]+\.vercel\.app" | head -1 || echo "")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$DEPLOYMENT_URL" ]; then
    echo -e "${GREEN}✅ Deployment Complete!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Live Dashboard URL:${NC}"
    echo ""
    echo -e "${GREEN}   $DEPLOYMENT_URL${NC}"
    echo ""
    echo "   📋 Features:"
    echo "      • Automatic HTTPS"
    echo "      • Global CDN"
    echo "      • Zero configuration"
    echo "      • Free tier (hobby plan)"
    echo "      • Full DDD Integration: Client => n8n => MCP => Supabase"
    echo ""
    echo "   🔄 To update: Run this script again"
    echo "   📊 Dashboard: https://vercel.com/dashboard"
    echo ""
    echo "   🏗️  DDD Architecture:"
    echo "      • Client: Vercel Dashboard"
    echo "      • Controller: n8n ($N8N_URL)"
    echo "      • MCP Server: $MCP_URL"
    echo "      • Database: Supabase"
    echo ""
else
    echo -e "${YELLOW}⚠️  Deployment URL not automatically detected${NC}"
    echo ""
    echo "   Check Vercel dashboard for deployment URL:"
    echo "   https://vercel.com/dashboard"
    echo ""
    echo "   Or run: vercel ls"
    echo ""
fi

# Save deployment info
cat > "$(dirname "$0")/../.vercel-deployment-info.json" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "platform": "vercel",
  "url": "${DEPLOYMENT_URL:-}",
  "n8n_url": "$N8N_URL",
  "mcp_url": "$MCP_URL",
  "mcp_configured": $([ -n "$MCP_API_KEY" ] && echo "true" || echo "false"),
  "supabase_configured": $([ -n "$SUPABASE_URL" ] && echo "true" || echo "false"),
  "ddd_architecture": "Client => n8n => MCP => Supabase",
  "deployment_method": "vercel_cli"
}
EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎖️  Mission Complete!${NC}"
echo ""

