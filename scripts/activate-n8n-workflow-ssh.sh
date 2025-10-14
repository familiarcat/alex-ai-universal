#!/bin/bash

###############################################################################
# N8N Workflow Activation via SSH
# 
# Automates workflow activation using n8n CLI on the server
# No manual UI steps required!
# 
# Reviewed by: Lt. Cmdr. La Forge (Remote Operations) & Lieutenant Uhura (Communication)
###############################################################################

set -e

# Configuration
N8N_SERVER="n8n.pbradygeorgen.com"
WORKFLOW_ID="${1:-d9EJA1Q0uPsgX5H3}"

echo "🖖 N8N Workflow Activation - SSH Method"
echo "=============================================="
echo ""

if [ -z "$WORKFLOW_ID" ]; then
    echo "❌ Error: Workflow ID required"
    echo "Usage: $0 <workflow-id>"
    exit 1
fi

echo "📡 Target: $N8N_SERVER"
echo "🔧 Workflow ID: $WORKFLOW_ID"
echo ""

# Check if we can SSH to the server
echo "🔍 Checking SSH access to N8N server..."

if ssh -q "$N8N_SERVER" exit 2>/dev/null; then
    echo "✅ SSH access confirmed"
    echo ""
    
    echo "🚀 Activating workflow via n8n CLI..."
    ssh "$N8N_SERVER" "n8n update:workflow --id=$WORKFLOW_ID --active=true"
    
    echo ""
    echo "✅ Workflow activated successfully!"
    echo "🔄 Restarting n8n (if needed)..."
    ssh "$N8N_SERVER" "pm2 restart n8n || systemctl restart n8n || echo 'Manual restart may be needed'"
    
    echo ""
    echo "🎉 Activation complete!"
    echo "Webhook should now be active at:"
    echo "  https://$N8N_SERVER/webhook/ingest-knowledge"
    
else
    echo "❌ Cannot SSH to $N8N_SERVER"
    echo ""
    echo "💡 ALTERNATIVE OPTIONS:"
    echo ""
    echo "Option 1: Manual UI Activation (30 seconds)"
    echo "  1. Open: https://$N8N_SERVER"
    echo "  2. Find workflow: 'Alex AI Knowledge Base RAG Ingestion'"
    echo "  3. Toggle activate (top-right)"
    echo ""
    echo "Option 2: Use N8N API with Test Webhook"
    echo "  Test webhooks work even when inactive!"
    echo "  URL: https://$N8N_SERVER/webhook-test/ingest-knowledge"
    echo ""
    echo "Option 3: Configure SSH Access"
    echo "  Add your SSH key to $N8N_SERVER"
    echo "  Then run this script again"
    echo ""
    exit 1
fi

echo ""
echo "🖖 Make it so!"

