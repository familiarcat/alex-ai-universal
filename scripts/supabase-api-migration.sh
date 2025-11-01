#!/bin/bash

##############################################################################
# Supabase Migration via REST API (No CLI Required!)
# 
# Executes SQL migration using Supabase's PostgREST API
# Pure terminal automation - no UI, no CLI dependencies
#
# Uses credentials from ~/.zshrc:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY (we'll use this for the migration)
#
# Crew: Chief O'Brien (Pragmatic Automation)
##############################################################################

set -e

echo "🗄️  Supabase Migration via REST API"
echo "====================================="
echo ""

# Load credentials
if [ -f "$HOME/.zshrc" ]; then
    echo "🔐 Loading credentials..."
    export SUPABASE_URL=$(grep "export SUPABASE_URL" "$HOME/.zshrc" | cut -d'"' -f2 | head -1 | tr -d ' ')
    export SUPABASE_ANON_KEY=$(grep "export SUPABASE_ANON_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
    export SUPABASE_KEY=$(grep "export SUPABASE_KEY" "$HOME/.zshrc" | cut -d'"' -f2)
fi

if [ -z "$SUPABASE_URL" ]; then
    echo "❌ SUPABASE_URL not set"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ SUPABASE_ANON_KEY not set"
    exit 1
fi

echo "✅ Credentials loaded"
echo "   URL: $SUPABASE_URL"
echo ""

# Read migration file
MIGRATION_FILE="supabase/migrations/001_create_projects_table.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found"
    exit 1
fi

echo "📄 Reading migration SQL..."
MIGRATION_SQL=$(cat "$MIGRATION_FILE")

echo "🚀 Executing migration..."
echo ""

# Execute SQL via Supabase REST API using psql wire protocol endpoint
# We'll use the anon key which should have sufficient permissions for schema creation
RESPONSE=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: params=single-object" \
    -d "$(jq -n --arg sql "$MIGRATION_SQL" '{query: $sql}')" 2>&1)

# Check response
if echo "$RESPONSE" | grep -q "error\|404\|unauthorized"; then
    echo "⚠️  RPC endpoint not available or insufficient permissions"
    echo "   Response: $RESPONSE"
    echo ""
    echo "📋 Alternative: Using SQL statements individually..."
    echo ""
    
    # Try inserting projects directly via REST API
    echo "🌱 Seeding default projects via REST API..."
    
    # Alpha project
    curl -s -X POST "${SUPABASE_URL}/rest/v1/projects" \
        -H "apikey: ${SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: resolution=merge-duplicates" \
        -d '{
            "project_id": "alpha",
            "headline": "✨ Discover Your Next Obsession",
            "subheadline": "Curated collections of premium streetwear and creative essentials",
            "description": "Limited edition drops and exclusive designs you wont find anywhere else. New releases every Friday.",
            "theme": "gradient",
            "project_type": "business"
        }' && echo "✅ Alpha seeded" || echo "⚠️  Alpha may already exist"
    
    # Beta project
    curl -s -X POST "${SUPABASE_URL}/rest/v1/projects" \
        -H "apikey: ${SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: resolution=merge-duplicates" \
        -d '{
            "project_id": "beta",
            "headline": "Compassionate Care, When You Need It Most",
            "subheadline": "Board-certified providers dedicated to your health and wellness",
            "description": "Professional healthcare services with telemedicine, patient portal, and HIPAA-compliant security.",
            "theme": "pastel",
            "project_type": "business"
        }' && echo "✅ Beta seeded" || echo "⚠️  Beta may already exist"
    
    # Gamma project
    curl -s -X POST "${SUPABASE_URL}/rest/v1/projects" \
        -H "apikey: ${SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: resolution=merge-duplicates" \
        -d '{
            "project_id": "gamma",
            "headline": "⚡ Unlock the Power of Your Data",
            "subheadline": "Real-time analytics and ML-powered insights for modern teams",
            "description": "Advanced dashboards, custom reports, powerful API access, and predictive analytics.",
            "theme": "cyberpunk",
            "project_type": "business"
        }' && echo "✅ Gamma seeded" || echo "⚠️  Gamma may already exist"
    
    # Temporal project (CREATIVE!)
    curl -s -X POST "${SUPABASE_URL}/rest/v1/projects" \
        -H "apikey: ${SUPABASE_ANON_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
        -H "Content-Type: application/json" \
        -H "Prefer: resolution=merge-duplicates" \
        -d '{
            "project_id": "temporal",
            "headline": "⏰ Temporal Wake - Screenplay & Novel",
            "subheadline": "Professional screenplay and novel writing system with visualization",
            "description": "Complete creative writing suite with screenplay formatting, novel composition, outline tools, and Mermaid timeline visualization.",
            "theme": "offworld",
            "project_type": "creative"
        }' && echo "✅ Temporal seeded (CREATIVE TYPE!)" || echo "⚠️  Temporal may already exist"
    
    echo ""
    echo "⚠️  Note: Table may not exist yet. If inserts failed, run migration SQL manually first."
    echo "   Then re-run this script to seed data."
    echo ""
    
    # Ask user if they want to open Supabase Dashboard
    echo "Would you like to run the migration SQL manually? (table creation)"
    echo "  1. Open: https://app.supabase.com/project/$(echo $SUPABASE_URL | sed 's|https://||' | cut -d'.' -f1)/sql"
    echo "  2. Copy: supabase/migrations/001_create_projects_table.sql"
    echo "  3. Run SQL"
    echo "  4. Re-run this script: bash scripts/supabase-api-migration.sh"
    echo ""
fi

# Verify projects exist
echo "🔍 Verifying projects in Supabase..."
PROJECTS=$(curl -s -X GET "${SUPABASE_URL}/rest/v1/projects?select=project_id,headline,project_type&order=project_id.asc" \
    -H "apikey: ${SUPABASE_ANON_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}")

PROJECT_COUNT=$(echo "$PROJECTS" | jq '. | length' 2>/dev/null || echo "0")

echo ""
echo "================================"
echo "📊 Migration Status"
echo "================================"
echo ""

if [ "$PROJECT_COUNT" -ge 4 ]; then
    echo "✅ SUCCESS! Found $PROJECT_COUNT projects in Supabase:"
    echo ""
    echo "$PROJECTS" | jq -r '.[] | "  \(.project_id): \(.headline) [\(.project_type)]"' 2>/dev/null || echo "$PROJECTS"
    echo ""
    echo "🎉 Supabase is ready!"
    echo ""
    echo "Next: Configure n8n to use Supabase credential"
    echo "  bash scripts/setup-n8n-supabase-credential.sh"
else
    echo "⚠️  Expected 4+ projects, found: $PROJECT_COUNT"
    echo ""
    if [ "$PROJECT_COUNT" -eq 0 ]; then
        echo "❌ No projects found - table may not exist"
        echo ""
        echo "Action required:"
        echo "  1. Run migration SQL to create table"
        echo "  2. Re-run this script to seed data"
    else
        echo "Projects found: $PROJECTS"
    fi
fi

echo ""
echo "🖖 Automation complete!"

