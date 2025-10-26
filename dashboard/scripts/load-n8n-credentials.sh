#!/bin/bash

# Minimal, shell-agnostic N8N env loader for Next.js dev
echo "🔍 Preparing N8N credentials for this session..."

# Respect already-exported values; otherwise use sane defaults
export N8N_URL="${N8N_URL:-https://n8n.pbradygeorgen.com}"
export N8N_BASE_URL="${N8N_BASE_URL:-$N8N_URL}"
export N8N_API_URL="${N8N_API_URL:-${N8N_URL%/}/api/v1}"
export N8N_WEBHOOK_URL="${N8N_WEBHOOK_URL:-${N8N_URL%/}/webhook}"

# If N8N_API_KEY is not already present, fall back to the locally configured value
if [ -z "${N8N_API_KEY}" ]; then
    export N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTA3ZGJlZi0yZDJmLTQ2YjUtYWQ3ZC0yYjIzZTk2ZWE1NjYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU4NjgxMzY5fQ._vFzyUok70PS3wI0bTSpB9QDxzLGHM3Ou9n4XvZF0aA"
fi

echo "✅ N8N credentials ready:"
echo "   📍 N8N URL: $N8N_URL"
echo "   🔑 API Key: ${N8N_API_KEY:0:20}..."
echo "   🔗 Webhook URL: $N8N_WEBHOOK_URL"

# Best-effort health check (non-fatal)
echo "🔍 Testing N8N connection (non-fatal)..."
if command -v curl >/dev/null 2>&1; then
    if curl -s -f "$N8N_URL/healthz" >/dev/null; then
        echo "✅ N8N server is accessible at $N8N_URL"
    else
        echo "⚠️  N8N health check did not return OK (continuing)"
    fi
else
    echo "ℹ️  curl not available; skipping health check"
fi

echo "🚀 You can now run: npm run dev"







