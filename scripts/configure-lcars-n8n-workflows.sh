#!/bin/bash

##############################################################################
# LCARS n8n Workflow Configuration Script
# 
# Configures n8n workflows for LCARS (Library Computer Access/Retrieval System)
# integration with Open Router LLM optimization and crew coordination.
#
# This script:
# 1. Extracts credentials from ~/.zshrc
# 2. Creates n8n workflow for Library Computer (LC) - RAG integration
# 3. Creates n8n workflow for Access & Retrieval System (ARS) - UI coordination
# 4. Sets up Open Router LLM selection workflows for each crew member
# 5. Configures real-time update workflows
##############################################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🖖 LCARS n8n Workflow Configuration                     ║${NC}"
echo -e "${BLUE}║   Library Computer Access/Retrieval System                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# Step 1: Extract credentials from ~/.zshrc
##############################################################################

echo -e "${YELLOW}📝 Step 1: Extracting credentials from ~/.zshrc${NC}"

# Function to extract environment variable from ~/.zshrc
extract_env_var() {
  local var_name=$1
  local value=$(grep "^export ${var_name}=" ~/.zshrc | sed 's/^export [^=]*="//' | sed 's/"$//')
  echo "$value"
}

# Extract all required credentials
N8N_BASE_URL=$(extract_env_var "N8N_BASE_URL")
OPENROUTER_API_KEY=$(extract_env_var "OPENROUTER_API_KEY")
SUPABASE_URL=$(extract_env_var "SUPABASE_URL")
SUPABASE_ANON_KEY=$(extract_env_var "SUPABASE_ANON_KEY")

echo -e "${GREEN}✅ Credentials extracted${NC}"
echo "   • N8N Base URL: ${N8N_BASE_URL}"
echo "   • Open Router API Key: ${OPENROUTER_API_KEY:0:20}..."
echo "   • Supabase URL: ${SUPABASE_URL}"
echo "   • Supabase Key: ${SUPABASE_ANON_KEY:0:20}..."
echo ""

##############################################################################
# Step 2: Create n8n workflow JSON for Library Computer (LC)
##############################################################################

echo -e "${YELLOW}📝 Step 2: Creating Library Computer (LC) workflow${NC}"

cat > /tmp/lcars-library-computer-workflow.json << 'EOF'
{
  "name": "LCARS Library Computer - LLM Optimization",
  "nodes": [
    {
      "parameters": {},
      "name": "Webhook - Crew Request",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "lcars-lc-webhook",
      "id": "webhook-crew-request"
    },
    {
      "parameters": {
        "functionCode": "// Extract request data\nconst crewMemberId = $input.item.json.crewMemberId;\nconst prompt = $input.item.json.prompt;\nconst context = $input.item.json.context || {};\n\n// Analyze prompt complexity\nlet complexity = 5;\n\n// Length factor\nif (prompt.length > 1000) complexity += 1;\nif (prompt.length > 2000) complexity += 1;\n\n// Technical keywords\nconst technicalKeywords = ['implement', 'architecture', 'algorithm', 'optimize', 'design', 'integrate'];\nconst technicalCount = technicalKeywords.filter(kw => prompt.toLowerCase().includes(kw)).length;\ncomplexity += technicalCount * 0.5;\n\n// Strategic keywords\nconst strategicKeywords = ['strategy', 'plan', 'coordinate', 'evaluate', 'decide', 'prioritize'];\nconst strategicCount = strategicKeywords.filter(kw => prompt.toLowerCase().includes(kw)).length;\ncomplexity += strategicCount * 0.5;\n\n// Clamp to 0-10\ncomplexity = Math.min(Math.max(complexity, 0), 10);\n\n// Determine task type\nconst promptLower = prompt.toLowerCase();\nlet taskType = 'general';\n\nif (promptLower.includes('strategy') || promptLower.includes('plan')) {\n  taskType = 'strategic';\n} else if (promptLower.includes('analyze') || promptLower.includes('calculate')) {\n  taskType = 'analytical';\n} else if (promptLower.includes('design') || promptLower.includes('create')) {\n  taskType = 'creative';\n} else if (promptLower.includes('implement') || promptLower.includes('code')) {\n  taskType = 'technical';\n} else if (promptLower.includes('document') || promptLower.includes('explain')) {\n  taskType = 'documentation';\n}\n\n// Estimate tokens (1 token ≈ 4 characters)\nconst estimatedTokens = Math.ceil((prompt.length + JSON.stringify(context).length) / 4 * 1.5);\n\nreturn {\n  json: {\n    crewMemberId,\n    prompt,\n    context,\n    analysis: {\n      complexity,\n      taskType,\n      estimatedTokens\n    }\n  }\n};"
      },
      "name": "Analyze Prompt",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300],
      "id": "analyze-prompt"
    },
    {
      "parameters": {
        "functionCode": "// Select optimal LLM based on analysis\nconst analysis = $input.item.json.analysis;\nconst { complexity, taskType, estimatedTokens } = analysis;\n\n// Available models with their characteristics\nconst models = [\n  {\n    id: 'anthropic/claude-3.5-sonnet',\n    name: 'Claude 3.5 Sonnet',\n    contextWindow: 200000,\n    costPer1kTokens: 0.003,\n    specialties: ['strategic', 'analytical', 'complex_reasoning'],\n    performanceRating: 9.5\n  },\n  {\n    id: 'openai/gpt-4-turbo',\n    name: 'GPT-4 Turbo',\n    contextWindow: 128000,\n    costPer1kTokens: 0.01,\n    specialties: ['creative', 'technical', 'general'],\n    performanceRating: 9.0\n  },\n  {\n    id: 'google/gemini-pro-1.5',\n    name: 'Gemini Pro 1.5',\n    contextWindow: 1000000,\n    costPer1kTokens: 0.0005,\n    specialties: ['analytical', 'documentation', 'large_context'],\n    performanceRating: 8.5\n  },\n  {\n    id: 'meta-llama/llama-3.1-70b-instruct',\n    name: 'Llama 3.1 70B',\n    contextWindow: 8192,\n    costPer1kTokens: 0.0003,\n    specialties: ['technical', 'documentation', 'cost_effective'],\n    performanceRating: 8.0\n  },\n  {\n    id: 'anthropic/claude-3-haiku',\n    name: 'Claude 3 Haiku',\n    contextWindow: 200000,\n    costPer1kTokens: 0.00025,\n    specialties: ['fast_response', 'documentation', 'simple_tasks'],\n    performanceRating: 7.5\n  }\n];\n\n// Filter models by specialty\nlet candidates = models.filter(m => \n  m.specialties.includes(taskType) || m.specialties.includes('general')\n);\n\nif (candidates.length === 0) {\n  candidates = models;\n}\n\n// Score each model\nconst scoredModels = candidates.map(model => {\n  let score = model.performanceRating;\n  \n  // Complexity matching\n  if (complexity > 8 && model.performanceRating > 9) score += 2;\n  if (complexity < 4 && model.specialties.includes('cost_effective')) score += 2;\n  \n  // Token limit matching\n  if (estimatedTokens > model.contextWindow) score -= 10;\n  \n  // Cost efficiency for simple tasks\n  if (complexity < 5 && model.costPer1kTokens < 0.001) score += 1;\n  \n  return { model, score };\n});\n\n// Sort by score and select best\nscored Models.sort((a, b) => b.score - a.score);\nconst selectedModel = scoredModels[0].model;\n\n// Calculate cost estimate\nconst costEstimate = (estimatedTokens / 1000) * selectedModel.costPer1kTokens;\n\nreturn {\n  json: {\n    ...$input.item.json,\n    selectedModel: selectedModel.id,\n    modelName: selectedModel.name,\n    costEstimate,\n    reasoning: `Selected ${selectedModel.name} for ${taskType} task with complexity ${complexity}/10. Cost: $${costEstimate.toFixed(4)}`\n  }\n};"
      },
      "name": "Select Optimal LLM",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [650, 300],
      "id": "select-llm"
    },
    {
      "parameters": {
        "url": "https://openrouter.ai/api/v1/chat/completions",
        "authentication": "genericCredentialType",
        "genericAuthType": "httpHeaderAuth",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "=Bearer {{$env.OPENROUTER_API_KEY}}"
            },
            {
              "name": "HTTP-Referer",
              "value": "https://alex-ai-universal.app"
            },
            {
              "name": "X-Title",
              "value": "Alex AI LCARS System"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "model",
              "value": "={{$json.selectedModel}}"
            },
            {
              "name": "messages",
              "value": "=[{\"role\": \"user\", \"content\": $json.prompt}]"
            }
          ]
        },
        "options": {}
      },
      "name": "Call Open Router",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [850, 300],
      "id": "call-openrouter"
    },
    {
      "parameters": {
        "operation": "insert",
        "schema": "public",
        "table": "lcars_performance_metrics",
        "columns": "crew_member_id, model_used, response_time, cost, success, timestamp",
        "additionalFields": {}
      },
      "name": "Record Performance",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [1050, 300],
      "credentials": {
        "supabaseApi": {
          "id": "supabase-credentials",
          "name": "Supabase API"
        }
      },
      "id": "record-performance"
    },
    {
      "parameters": {},
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1250, 300],
      "id": "respond-webhook"
    }
  ],
  "connections": {
    "Webhook - Crew Request": {
      "main": [
        [
          {
            "node": "Analyze Prompt",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Analyze Prompt": {
      "main": [
        [
          {
            "node": "Select Optimal LLM",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Select Optimal LLM": {
      "main": [
        [
          {
            "node": "Call Open Router",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Call Open Router": {
      "main": [
        [
          {
            "node": "Record Performance",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Record Performance": {
      "main": [
        [
          {
            "node": "Respond to Webhook",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "versionId": "1"
}
EOF

echo -e "${GREEN}✅ Library Computer workflow created${NC}"
echo "   • Workflow: lcars-library-computer-workflow.json"
echo "   • Nodes: 6 (Webhook → Analyze → Select LLM → Call API → Record → Respond)"
echo ""

##############################################################################
# Step 3: Create n8n workflow JSON for Access & Retrieval System (ARS)
##############################################################################

echo -e "${YELLOW}📝 Step 3: Creating Access & Retrieval System (ARS) workflow${NC}"

cat > /tmp/lcars-ars-workflow.json << 'EOF'
{
  "name": "LCARS Access & Retrieval System - Real-time Preview",
  "nodes": [
    {
      "parameters": {},
      "name": "Webhook - Preview Update",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [250, 300],
      "webhookId": "lcars-ars-webhook",
      "id": "webhook-preview-update"
    },
    {
      "parameters": {
        "functionCode": "// Process preview update\nconst projectId = $input.item.json.projectId;\nconst updateType = $input.item.json.type;\nconst target = $input.item.json.target;\nconst change = $input.item.json.change;\nconst crewMember = $input.item.json.crewMember;\n\nreturn {\n  json: {\n    projectId,\n    update: {\n      type: updateType,\n      target,\n      change,\n      crewMember,\n      timestamp: new Date().toISOString(),\n      approved: false\n    }\n  }\n};"
      },
      "name": "Process Update",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300],
      "id": "process-update"
    },
    {
      "parameters": {
        "operation": "insert",
        "schema": "public",
        "table": "lcars_live_updates",
        "columns": "project_id, update_data, timestamp",
        "additionalFields": {}
      },
      "name": "Store Update",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [650, 300],
      "credentials": {
        "supabaseApi": {
          "id": "supabase-credentials",
          "name": "Supabase API"
        }
      },
      "id": "store-update"
    },
    {
      "parameters": {
        "url": "http://localhost:3002/api/broadcast",
        "method": "POST",
        "sendBody": true,
        "bodyParameters": {
          "parameters": [
            {
              "name": "projectId",
              "value": "={{$json.projectId}}"
            },
            {
              "name": "update",
              "value": "={{$json.update}}"
            }
          ]
        }
      },
      "name": "Broadcast to Clients",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [850, 300],
      "id": "broadcast-clients"
    },
    {
      "parameters": {},
      "name": "Respond Success",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [1050, 300],
      "id": "respond-success"
    }
  ],
  "connections": {
    "Webhook - Preview Update": {
      "main": [
        [
          {
            "node": "Process Update",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Process Update": {
      "main": [
        [
          {
            "node": "Store Update",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Store Update": {
      "main": [
        [
          {
            "node": "Broadcast to Clients",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Broadcast to Clients": {
      "main": [
        [
          {
            "node": "Respond Success",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "versionId": "1"
}
EOF

echo -e "${GREEN}✅ Access & Retrieval System workflow created${NC}"
echo "   • Workflow: lcars-ars-workflow.json"
echo "   • Nodes: 5 (Webhook → Process → Store → Broadcast → Respond)"
echo ""

##############################################################################
# Step 4: Create Supabase tables for LCARS
##############################################################################

echo -e "${YELLOW}📝 Step 4: Creating Supabase tables for LCARS${NC}"

cat > /tmp/lcars-supabase-schema.sql << 'EOF'
-- LCARS Performance Metrics Table
CREATE TABLE IF NOT EXISTS lcars_performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crew_member_id TEXT NOT NULL,
  model_used TEXT NOT NULL,
  response_time INTEGER NOT NULL,
  cost DECIMAL(10, 6) NOT NULL,
  success BOOLEAN NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_lcars_performance_crew 
  ON lcars_performance_metrics(crew_member_id);
CREATE INDEX IF NOT EXISTS idx_lcars_performance_timestamp 
  ON lcars_performance_metrics(timestamp DESC);

-- LCARS Live Updates Table
CREATE TABLE IF NOT EXISTS lcars_live_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id TEXT NOT NULL,
  update_data JSONB NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_lcars_updates_project 
  ON lcars_live_updates(project_id);
CREATE INDEX IF NOT EXISTS idx_lcars_updates_timestamp 
  ON lcars_live_updates(timestamp DESC);

-- LCARS Projects Table
CREATE TABLE IF NOT EXISTS lcars_projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  crew_members TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  preview_url TEXT,
  published_url TEXT,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_lcars_projects_status 
  ON lcars_projects(status);
CREATE INDEX IF NOT EXISTS idx_lcars_projects_updated 
  ON lcars_projects(updated_at DESC);
EOF

echo -e "${GREEN}✅ Supabase schema created${NC}"
echo "   • Tables: lcars_performance_metrics, lcars_live_updates, lcars_projects"
echo ""

##############################################################################
# Step 5: Create configuration file
##############################################################################

echo -e "${YELLOW}📝 Step 5: Creating LCARS configuration file${NC}"

cat > /tmp/lcars-config.json << EOF
{
  "system": "LCARS",
  "version": "1.0.0",
  "components": {
    "libraryComputer": {
      "enabled": true,
      "n8nWorkflow": "lcars-library-computer-workflow.json",
      "webhookUrl": "${N8N_BASE_URL}/webhook/lcars-lc-webhook",
      "openRouterApiKey": "${OPENROUTER_API_KEY}"
    },
    "accessRetrievalSystem": {
      "enabled": true,
      "n8nWorkflow": "lcars-ars-workflow.json",
      "webhookUrl": "${N8N_BASE_URL}/webhook/lcars-ars-webhook",
      "previewServerPort": 3002
    },
    "supabase": {
      "url": "${SUPABASE_URL}",
      "anonKey": "${SUPABASE_ANON_KEY}",
      "schema": "lcars-supabase-schema.sql"
    }
  },
  "crewMembers": [
    {
      "id": "captain_picard",
      "name": "Captain Jean-Luc Picard",
      "optimalTasks": ["strategic", "complex_reasoning"],
      "preferredModels": ["anthropic/claude-3.5-sonnet"]
    },
    {
      "id": "commander_data",
      "name": "Commander Data",
      "optimalTasks": ["analytical", "data_processing"],
      "preferredModels": ["google/gemini-pro-1.5", "anthropic/claude-3.5-sonnet"]
    },
    {
      "id": "commander_riker",
      "name": "Commander William Riker",
      "optimalTasks": ["tactical", "workflow_management"],
      "preferredModels": ["openai/gpt-4-turbo"]
    },
    {
      "id": "lieutenant_geordi",
      "name": "Lieutenant Commander Geordi La Forge",
      "optimalTasks": ["technical", "infrastructure"],
      "preferredModels": ["openai/gpt-4-turbo", "meta-llama/llama-3.1-70b-instruct"]
    },
    {
      "id": "lieutenant_worf",
      "name": "Lieutenant Worf",
      "optimalTasks": ["security", "threat_assessment"],
      "preferredModels": ["anthropic/claude-3.5-sonnet"]
    },
    {
      "id": "counselor_troi",
      "name": "Counselor Deanna Troi",
      "optimalTasks": ["creative", "user_experience"],
      "preferredModels": ["openai/gpt-4-turbo", "anthropic/claude-3.5-sonnet"]
    },
    {
      "id": "dr_crusher",
      "name": "Dr. Beverly Crusher",
      "optimalTasks": ["analytical", "diagnostics"],
      "preferredModels": ["google/gemini-pro-1.5"]
    },
    {
      "id": "lieutenant_uhura",
      "name": "Lieutenant Uhura",
      "optimalTasks": ["documentation", "communication"],
      "preferredModels": ["anthropic/claude-3-haiku", "meta-llama/llama-3.1-70b-instruct"]
    },
    {
      "id": "quark",
      "name": "Quark",
      "optimalTasks": ["analytical", "cost_optimization"],
      "preferredModels": ["google/gemini-pro-1.5", "meta-llama/llama-3.1-70b-instruct"]
    }
  ],
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo -e "${GREEN}✅ LCARS configuration file created${NC}"
echo "   • Config: lcars-config.json"
echo ""

##############################################################################
# Summary
##############################################################################

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🖖 LCARS Configuration Complete                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Created Files:${NC}"
echo "   • /tmp/lcars-library-computer-workflow.json"
echo "   • /tmp/lcars-ars-workflow.json"
echo "   • /tmp/lcars-supabase-schema.sql"
echo "   • /tmp/lcars-config.json"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "   1. Import n8n workflows:"
echo "      - Navigate to your n8n instance: ${N8N_BASE_URL}"
echo "      - Import /tmp/lcars-library-computer-workflow.json"
echo "      - Import /tmp/lcars-ars-workflow.json"
echo ""
echo "   2. Apply Supabase schema:"
echo "      - Run: psql \$SUPABASE_URL < /tmp/lcars-supabase-schema.sql"
echo "      - Or use Supabase dashboard SQL editor"
echo ""
echo "   3. Test LCARS system:"
echo "      - Library Computer: curl ${N8N_BASE_URL}/webhook/lcars-lc-webhook"
echo "      - ARS: curl ${N8N_BASE_URL}/webhook/lcars-ars-webhook"
echo ""
echo -e "${BLUE}🖖 LCARS is ready for deployment!${NC}"

