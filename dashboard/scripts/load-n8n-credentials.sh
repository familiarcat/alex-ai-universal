#!/bin/bash

# N8N env loader with smart fallback (remote preferred)
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
echo "   📍 Preferred N8N URL: $N8N_URL"
echo "   🔑 API Key: ${N8N_API_KEY:0:20}..."
echo "   🔗 Webhook URL: $N8N_WEBHOOK_URL"

# Best-effort health check (non-fatal)
echo "🔍 Testing preferred N8N health..."
fallback_used=0
if command -v curl >/dev/null 2>&1; then
    if curl -s -f "$N8N_URL/healthz" >/dev/null; then
        echo "✅ Remote N8N is accessible at $N8N_URL"
    else
        echo "⚠️  Remote N8N health check failed. Considering local fallback."
        # Attempt local fallback only if Docker is available
        if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
            repo_root="$(cd "$(dirname "$0")/.." && pwd)"  # ../ from dashboard => repo root
            compose_file="$repo_root/docker-compose.n8n.yml"
            if [ -f "$compose_file" ]; then
                echo "🧩 Starting local n8n via Docker (fallback)..."
                docker compose -f "$compose_file" up -d >/dev/null 2>&1 || true
                # Wait briefly for startup
                for i in 1 2 3 4 5; do
                    if curl -s -f "http://localhost:5678/healthz" >/dev/null; then
                        break
                    fi
                    sleep 1
                done
                if curl -s -f "http://localhost:5678/healthz" >/dev/null; then
                    export N8N_URL="http://localhost:5678"
                    export N8N_BASE_URL="$N8N_URL"
                    export N8N_API_URL="${N8N_URL%/}/api/v1"
                    export N8N_WEBHOOK_URL="${N8N_URL%/}/webhook"
                    echo "✅ Local fallback active at $N8N_URL"
                    fallback_used=1
                else
                    echo "❌ Local n8n failed to become healthy. Continuing with remote config."
                fi
            else
                echo "ℹ️  Compose file not found at $compose_file; skipping local fallback."
            fi
        else
            echo "ℹ️  Docker not available; skipping local fallback."
        fi
    fi
else
    echo "ℹ️  curl not available; skipping health checks"
fi

if [ "$fallback_used" = "1" ]; then
  echo "🚀 Using local n8n fallback: $N8N_URL"
else
  echo "🚀 Using remote n8n: $N8N_URL"
fi







