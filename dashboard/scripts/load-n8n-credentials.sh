#!/bin/bash

# Load N8N credentials from ~/.zshrc and export them for Next.js
echo "🔍 Loading N8N credentials from ~/.zshrc..."

# Source the zshrc file to get the environment variables
source ~/.zshrc

# Export the N8N variables for the current session
export N8N_URL="https://n8n.pbradygeorgen.com"
export N8N_BASE_URL="https://n8n.pbradygeorgen.com"
export N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NjgxMzY5fQ._vFzyUok70PS3wI0bTSpB9QDxzLGHM3Ou9n4XvZF0aA"
export N8N_WEBHOOK_URL="https://n8n.pbradygeorgen.com/webhook"
export N8N_API_URL="https://n8n.pbradygeorgen.com/api/v1"

echo "✅ N8N credentials loaded:"
echo "   📍 N8N URL: $N8N_URL"
echo "   🔑 API Key: ${N8N_API_KEY:0:20}..."
echo "   🔗 Webhook URL: $N8N_WEBHOOK_URL"

# Test N8N connection
echo "🔍 Testing N8N connection..."
if curl -s -f "$N8N_URL/healthz" > /dev/null; then
    echo "✅ N8N server is accessible at $N8N_URL"
else
    echo "❌ N8N server is not accessible at $N8N_URL"
fi

echo "🚀 Starting Next.js development server with N8N credentials..."







