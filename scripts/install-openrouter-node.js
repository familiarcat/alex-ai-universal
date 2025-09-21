#!/usr/bin/env node

/**
 * Install OpenRouter Node in N8N
 * Installs the OpenRouter community node to enable LLM access in workflows
 */

const fs = require('fs');
const https = require('https');

class OpenRouterNodeInstaller {
  constructor() {
    this.loadZshrcEnv();
    this.n8nBaseUrl = process.env.N8N_API_URL || 'https://n8n.pbradygeorgen.com/api/v1';
    this.apiKey = process.env.N8N_API_KEY;
    
    if (!this.apiKey) {
      console.error('❌ N8N_API_KEY not found in ~/.zshrc or environment variables');
      process.exit(1);
    }
  }

  /**
   * Load environment variables from ~/.zshrc
   */
  loadZshrcEnv() {
    try {
      const zshrcContent = fs.readFileSync(process.env.HOME + '/.zshrc', 'utf8');
      const lines = zshrcContent.split('\n');
      
      lines.forEach(line => {
        if (line.includes('export N8N_API_URL=')) {
          process.env.N8N_API_URL = line.split('=')[1].replace(/['"]/g, '');
        }
        if (line.includes('export N8N_API_KEY=')) {
          process.env.N8N_API_KEY = line.split('=')[1].replace(/['"]/g, '');
        }
      });
      
      console.log('✅ Environment variables loaded from ~/.zshrc');
    } catch (error) {
      console.error('❌ Failed to load ~/.zshrc:', error.message);
    }
  }

  /**
   * Check if OpenRouter node is already installed
   */
  async checkOpenRouterNode() {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/node-types',
        method: 'GET',
        headers: {
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            const nodeTypes = Array.isArray(response) ? response : response.data || response.nodeTypes || [];
            
            const openRouterNode = nodeTypes.find(node => 
              node.name === 'OpenRouter' || 
              node.name.includes('openrouter') || 
              node.name.includes('OpenRouter')
            );
            
            resolve(openRouterNode);
          } catch (error) {
            reject(new Error(`Failed to parse node types: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  }

  /**
   * Install OpenRouter node via N8N API
   */
  async installOpenRouterNode() {
    return new Promise((resolve, reject) => {
      const installData = JSON.stringify({
        packageName: '@n8n/n8n-nodes-openrouter',
        version: 'latest'
      });
      
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/node-types/install',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(installData),
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200 || res.statusCode === 201) {
            resolve(data);
          } else {
            reject(new Error(`Failed to install OpenRouter node: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(installData);
      req.end();
    });
  }

  /**
   * Alternative: Install via npm in N8N's node_modules
   */
  async installViaNPM() {
    console.log('📦 Installing OpenRouter node via npm...');
    
    // This would require SSH access to the N8N server
    // For now, we'll provide instructions
    console.log(`
🔧 Manual Installation Instructions:

1. SSH into your N8N server:
   ssh your-user@n8n.pbradygeorgen.com

2. Navigate to N8N directory:
   cd /path/to/n8n

3. Install OpenRouter node:
   npm install @n8n/n8n-nodes-openrouter

4. Restart N8N:
   pm2 restart n8n
   # or
   systemctl restart n8n

5. Verify installation by checking the node types API
`);
  }

  /**
   * Create a workflow that uses HTTP Request instead of OpenRouter
   */
  async createHttpBasedWorkflow() {
    console.log('🔄 Creating HTTP-based anti-hallucination workflow...');
    
    const httpWorkflow = {
      "name": "Anti-Hallucination Crew Workflow (HTTP)",
      "nodes": [
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "anti-hallucination-http",
            "responseMode": "responseNode",
            "options": {}
          },
          "id": "prompt-interception",
          "name": "Prompt Interception",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 1,
          "position": [240, 300]
        },
        {
          "parameters": {
            "functionCode": "// Analyze prompt context and prepare for crew activation\nconst prompt = $input.first().json.prompt;\nconst timestamp = new Date().toISOString();\n\n// Extract prompt metadata\nconst promptContext = {\n  text: prompt,\n  length: prompt.length,\n  timestamp: timestamp,\n  domain: detectDomain(prompt),\n  complexity: detectComplexity(prompt),\n  type: detectPromptType(prompt)\n};\n\n// Detect domain from prompt\nfunction detectDomain(prompt) {\n  const domains = {\n    'machine-learning': ['ml', 'ai', 'model', 'training', 'neural'],\n    'security': ['security', 'vulnerability', 'threat', 'attack'],\n    'psychology': ['emotion', 'behavior', 'psychology', 'mental'],\n    'engineering': ['code', 'architecture', 'system', 'design'],\n    'strategy': ['strategy', 'planning', 'leadership', 'management']\n  };\n  \n  const lowerPrompt = prompt.toLowerCase();\n  for (const [domain, keywords] of Object.entries(domains)) {\n    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {\n      return domain;\n    }\n  }\n  return 'general';\n}\n\n// Detect complexity level\nfunction detectComplexity(prompt) {\n  const highComplexityKeywords = ['complex', 'advanced', 'sophisticated', 'comprehensive'];\n  const mediumComplexityKeywords = ['explain', 'describe', 'analyze', 'compare'];\n  \n  const lowerPrompt = prompt.toLowerCase();\n  if (highComplexityKeywords.some(keyword => lowerPrompt.includes(keyword))) {\n    return 'high';\n  } else if (mediumComplexityKeywords.some(keyword => lowerPrompt.includes(keyword))) {\n    return 'medium';\n  }\n  return 'low';\n}\n\n// Detect prompt type\nfunction detectPromptType(prompt) {\n  const technicalKeywords = ['code', 'algorithm', 'technical', 'system'];\n  const creativeKeywords = ['creative', 'design', 'artistic', 'innovative'];\n  const analyticalKeywords = ['analyze', 'evaluate', 'compare', 'assess'];\n  const empathicKeywords = ['feel', 'emotion', 'empathy', 'understand'];\n  const strategicKeywords = ['strategy', 'plan', 'leadership', 'vision'];\n  \n  const lowerPrompt = prompt.toLowerCase();\n  if (technicalKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'technical';\n  if (creativeKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'creative';\n  if (analyticalKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'analytical';\n  if (empathicKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'empathic';\n  if (strategicKeywords.some(keyword => lowerPrompt.includes(keyword))) return 'strategic';\n  return 'analytical';\n}\n\nreturn {\n  promptContext,\n  originalPrompt: prompt,\n  processingId: `ah_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`\n};"
          },
          "id": "prompt-analysis",
          "name": "Prompt Analysis",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [460, 300]
        },
        {
          "parameters": {
            "functionCode": "// Split prompt context for crew member processing\nconst promptContext = $input.first().json;\nconst crewMembers = [\n  'Captain Picard',\n  'Commander Data', \n  'Counselor Troi',\n  'Lieutenant Worf',\n  'Commander Riker',\n  'Lieutenant Commander La Forge',\n  'Doctor Crusher',\n  'Lieutenant Commander Tasha Yar',\n  'Lieutenant Commander Spock'\n];\n\n// Create individual crew member tasks\nconst crewTasks = crewMembers.map(crewMember => ({\n  crewMember,\n  promptContext: promptContext.promptContext,\n  originalPrompt: promptContext.originalPrompt,\n  processingId: promptContext.processingId,\n  timestamp: new Date().toISOString()\n}));\n\nreturn crewTasks;"
          },
          "id": "crew-splitter",
          "name": "Crew Splitter",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [680, 300]
        },
        {
          "parameters": {
            "functionCode": "// Optimize LLM selection for crew member\nconst crewTask = $input.first().json;\nconst { crewMember, promptContext } = crewTask;\n\n// Crew member expertise mapping\nconst crewExpertise = {\n  'Captain Picard': ['leadership', 'strategy', 'diplomacy', 'ethics'],\n  'Commander Data': ['technical-analysis', 'logic', 'computation', 'science'],\n  'Counselor Troi': ['empathy', 'psychology', 'counseling', 'emotions'],\n  'Lieutenant Worf': ['security', 'tactics', 'combat', 'honor'],\n  'Commander Riker': ['leadership', 'tactics', 'diplomacy', 'command'],\n  'Lieutenant Commander La Forge': ['engineering', 'technology', 'innovation'],\n  'Doctor Crusher': ['medical', 'healing', 'science', 'research'],\n  'Lieutenant Commander Tasha Yar': ['security', 'tactics', 'survival'],\n  'Lieutenant Commander Spock': ['logic', 'science', 'analysis']\n};\n\n// LLM optimization based on context and expertise\nfunction selectOptimalLLM(crewMember, context) {\n  const expertise = crewExpertise[crewMember] || ['general'];\n  \n  // Context-based LLM selection\n  if (context.type === 'technical' && expertise.includes('technical-analysis')) {\n    return 'openai/gpt-4-turbo';\n  }\n  if (context.type === 'empathic' && expertise.includes('empathy')) {\n    return 'anthropic/claude-3-sonnet';\n  }\n  if (context.type === 'strategic' && expertise.includes('leadership')) {\n    return 'anthropic/claude-3-opus';\n  }\n  if (context.type === 'analytical' && expertise.includes('logic')) {\n    return 'openai/gpt-4-turbo';\n  }\n  \n  // Default LLM selection\n  if (expertise.includes('technical-analysis') || expertise.includes('logic')) {\n    return 'openai/gpt-4-turbo';\n  }\n  return 'anthropic/claude-3-sonnet';\n}\n\nconst optimalLLM = selectOptimalLLM(crewMember, promptContext);\nconst confidence = Math.random() * 0.3 + 0.7; // Simulate confidence between 0.7-1.0\n\nreturn {\n  ...crewTask,\n  optimalLLM,\n  confidence,\n  reasoning: `Selected ${optimalLLM} for ${crewMember} based on ${promptContext.type} context and ${crewExpertise[crewMember].join(', ')} expertise`\n};"
          },
          "id": "llm-optimization",
          "name": "LLM Optimization",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [900, 300]
        },
        {
          "parameters": {
            "url": "https://openrouter.ai/api/v1/chat/completions",
            "authentication": "predefinedCredentialType",
            "nodeCredentialType": "openRouterApi",
            "sendHeaders": true,
            "headerParameters": {
              "parameters": [
                {
                  "name": "Authorization",
                  "value": "Bearer {{ $credentials.openRouterApi.apiKey }}"
                },
                {
                  "name": "Content-Type",
                  "value": "application/json"
                }
              ]
            },
            "sendBody": true,
            "bodyParameters": {
              "parameters": [
                {
                  "name": "model",
                  "value": "={{ $json.optimalLLM }}"
                },
                {
                  "name": "messages",
                  "value": "=[{\"role\": \"system\", \"content\": \"You are {{ $json.crewMember }} from Star Trek: The Next Generation. Provide your perspective on the given prompt, drawing from your unique expertise and personality. Be specific, insightful, and maintain your character's voice while providing valuable analysis.\"}, {\"role\": \"user\", \"content\": \"Original Prompt: {{ $json.originalPrompt }}\\n\\nPlease provide your perspective on this prompt, drawing from your unique expertise and personality. Be specific, insightful, and maintain your character's voice while providing valuable analysis.\"}]"
                },
                {
                  "name": "temperature",
                  "value": "0.7"
                },
                {
                  "name": "max_tokens",
                  "value": "1000"
                }
              ]
            },
            "options": {}
          },
          "id": "crew-response-generation",
          "name": "Crew Response Generation",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.2,
          "position": [1120, 300]
        },
        {
          "parameters": {
            "functionCode": "// Process crew member response\nconst input = $input.first().json;\nconst crewTask = input.crewTask || input;\nconst llmResponse = input.choices?.[0]?.message?.content || 'No response generated';\n\nreturn {\n  crewMember: crewTask.crewMember,\n  response: llmResponse,\n  llmUsed: crewTask.optimalLLM,\n  confidence: crewTask.confidence,\n  timestamp: new Date().toISOString(),\n  context: crewTask.originalPrompt,\n  optimization: {\n    crewMember: crewTask.crewMember,\n    promptContext: JSON.stringify(crewTask.promptContext),\n    personaSkills: crewTask.promptContext.domain,\n    optimalLLM: crewTask.optimalLLM,\n    confidence: crewTask.confidence,\n    reasoning: crewTask.reasoning,\n    timestamp: crewTask.timestamp\n  }\n};"
          },
          "id": "response-processing",
          "name": "Response Processing",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [1340, 300]
        },
        {
          "parameters": {
            "functionCode": "// Collect all crew perspectives and analyze for hallucinations\nconst crewPerspectives = $input.all().map(item => item.json);\n\nif (crewPerspectives.length < 2) {\n  return {\n    error: 'Insufficient crew responses for consensus analysis',\n    perspectives: crewPerspectives\n  };\n}\n\n// Calculate consensus (simplified)\nconst responses = crewPerspectives.map(p => p.response);\nconst consensusResponse = responses[Math.floor(Math.random() * responses.length)]; // Simplified consensus\nconst consensusConfidence = crewPerspectives.reduce((sum, p) => sum + p.confidence, 0) / crewPerspectives.length;\n\n// Analyze for hallucinations (simplified deviation detection)\nconst hallucinationAnalyses = crewPerspectives.map(perspective => {\n  // Simple deviation calculation based on response length and keywords\n  const responseLength = perspective.response.length;\n  const avgLength = responses.reduce((sum, r) => sum + r.length, 0) / responses.length;\n  const lengthDeviation = Math.abs(responseLength - avgLength) / avgLength;\n  \n  // Simple keyword similarity check\n  const responseWords = perspective.response.toLowerCase().split(/\\s+/);\n  const consensusWords = consensusResponse.toLowerCase().split(/\\s+/);\n  const commonWords = responseWords.filter(word => consensusWords.includes(word));\n  const similarity = commonWords.length / Math.max(responseWords.length, consensusWords.length);\n  \n  const deviationScore = (lengthDeviation * 0.3) + ((1 - similarity) * 0.7);\n  const isHallucination = deviationScore > 0.3; // Threshold\n  \n  return {\n    crewMember: perspective.crewMember,\n    isHallucination,\n    deviationScore,\n    consensusAlignment: 1 - deviationScore,\n    correctionPrompt: isHallucination ? `Your response deviated from crew consensus. Please revise: ${consensusResponse}` : '',\n    learningOpportunity: isHallucination ? `Learning opportunity for ${perspective.crewMember}: improve consensus alignment` : '',\n    detectedAt: new Date().toISOString(),\n    severity: deviationScore > 0.7 ? 'high' : deviationScore > 0.5 ? 'medium' : 'low'\n  };\n});\n\nconst hallucinationsDetected = hallucinationAnalyses.filter(a => a.isHallucination);\nconst overallHealth = 1 - (hallucinationsDetected.length / crewPerspectives.length);\n\nreturn {\n  perspectives: crewPerspectives,\n  consensus: {\n    consensusResponse,\n    consensusConfidence,\n    participantCount: crewPerspectives.length,\n    agreementScore: overallHealth,\n    dominantPerspective: crewPerspectives[0]?.crewMember,\n    outlierCount: hallucinationsDetected.length\n  },\n  analyses: hallucinationAnalyses,\n  overallHealth,\n  hallucinationsDetected: hallucinationsDetected.length,\n  processingComplete: true\n};"
          },
          "id": "hallucination-analysis",
          "name": "Hallucination Analysis",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [1560, 300]
        },
        {
          "parameters": {
            "respondWith": "json",
            "responseBody": "={{ $json }}"
          },
          "id": "response-return",
          "name": "Response Return",
          "type": "n8n-nodes-base.respondToWebhook",
          "typeVersion": 1,
          "position": [1780, 300]
        }
      ],
      "connections": {
        "Prompt Interception": {
          "main": [
            [
              {
                "node": "Prompt Analysis",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Prompt Analysis": {
          "main": [
            [
              {
                "node": "Crew Splitter",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Crew Splitter": {
          "main": [
            [
              {
                "node": "LLM Optimization",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "LLM Optimization": {
          "main": [
            [
              {
                "node": "Crew Response Generation",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Crew Response Generation": {
          "main": [
            [
              {
                "node": "Response Processing",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Response Processing": {
          "main": [
            [
              {
                "node": "Hallucination Analysis",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Hallucination Analysis": {
          "main": [
            [
              {
                "node": "Response Return",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      },
      "settings": {
        "executionOrder": "v1"
      }
    };

    return httpWorkflow;
  }

  /**
   * Deploy HTTP-based workflow
   */
  async deployHttpWorkflow() {
    try {
      console.log('🚀 Deploying HTTP-based anti-hallucination workflow...');
      
      const workflow = await this.createHttpBasedWorkflow();
      
      const postData = JSON.stringify(workflow);
      
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: '/api/v1/workflows',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (res.statusCode === 201 || res.statusCode === 200) {
              console.log(`✅ HTTP-based workflow deployed successfully (ID: ${response.id})`);
              
              // Activate the workflow
              this.activateWorkflow(response.id);
            } else {
              console.error(`❌ Failed to deploy HTTP workflow: ${res.statusCode} - ${data}`);
            }
          } catch (error) {
            console.error(`❌ Failed to parse response: ${data}`);
          }
        });
      });

      req.on('error', (error) => {
        console.error('❌ Request failed:', error.message);
      });

      req.write(postData);
      req.end();
      
    } catch (error) {
      console.error('❌ Failed to deploy HTTP workflow:', error.message);
    }
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(workflowId) {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({ active: true });
      
      const options = {
        hostname: 'n8n.pbradygeorgen.com',
        port: 443,
        path: `/api/v1/workflows/${workflowId}/activate`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'X-N8N-API-KEY': this.apiKey
        }
      };

      const req = https.request(options, (res) => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          console.log(`✅ Workflow ${workflowId} activated successfully`);
          resolve();
        } else {
          console.error(`❌ Failed to activate workflow: ${res.statusCode}`);
          reject(new Error(`Failed to activate workflow: ${res.statusCode}`));
        }
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Main installation process
   */
  async install() {
    try {
      console.log('🔍 Checking if OpenRouter node is already installed...');
      
      const existingNode = await this.checkOpenRouterNode();
      
      if (existingNode) {
        console.log('✅ OpenRouter node is already installed!');
        console.log(`📋 Node details: ${JSON.stringify(existingNode, null, 2)}`);
        return;
      }
      
      console.log('📦 OpenRouter node not found. Installing...');
      
      try {
        await this.installOpenRouterNode();
        console.log('✅ OpenRouter node installed successfully via API!');
      } catch (apiError) {
        console.log('⚠️ API installation failed, trying alternative methods...');
        console.log(`❌ API Error: ${apiError.message}`);
        
        // Try npm installation instructions
        await this.installViaNPM();
        
        // Deploy HTTP-based workflow as fallback
        console.log('\n🔄 Deploying HTTP-based workflow as fallback...');
        await this.deployHttpWorkflow();
      }
      
    } catch (error) {
      console.error('❌ Installation failed:', error.message);
    }
  }
}

// Main execution
async function main() {
  const installer = new OpenRouterNodeInstaller();
  await installer.install();
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = OpenRouterNodeInstaller;
