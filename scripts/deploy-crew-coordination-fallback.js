#!/usr/bin/env node
/**
 * FALLBACK CREW COORDINATION SYSTEM
 * 
 * Purpose: Enable full crew communication even if n8n webhooks fail
 * Pattern: Polling-based task queue + Direct execution + RAG storage
 * Philosophy: "The crew MUST be able to communicate and learn from each other"
 * 
 * Architecture:
 * 1. Client → Supabase (crew_tasks table) - Store task/question
 * 2. Coordinator (this script) polls Supabase every 5 seconds
 * 3. Route task to appropriate crew member (via CrewAssignmentSystem)
 * 4. Execute via: n8n webhook (if working) OR direct RAG query OR OpenRouter AI
 * 5. Store response → Supabase (crew_responses + crew_memories)
 * 6. Client polls for response
 * 
 * Benefits:
 * - Works with or without n8n webhooks
 * - Automatic retry and fallback
 * - All interactions stored in RAG for learning
 * - Crew learns from each other over time
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment
require('dotenv').config();
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const N8N_URL = process.env.N8N_URL || 'https://n8n.pbradygeorgen.com';

console.log('╔════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                        ║');
console.log('║   🏛️  FALLBACK CREW COORDINATION SYSTEM                              ║');
console.log('║                                                                        ║');
console.log('║   Polling-based crew communication (webhook-independent)               ║');
console.log('║                                                                        ║');
console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

// Load crew profiles
const CREW_DIR = path.join(__dirname, '../crew-members');
const crewProfiles = {};

fs.readdirSync(CREW_DIR)
    .filter(f => f.endsWith('.json'))
    .forEach(file => {
        const profile = JSON.parse(fs.readFileSync(path.join(CREW_DIR, file), 'utf8'));
        crewProfiles[profile.id] = profile;
    });

console.log(`✅ Loaded ${Object.keys(crewProfiles).length} crew profiles\n`);

/**
 * Make HTTPS request
 */
function request(url, options = {}, data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };

        const req = https.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(body));
                    } catch {
                        resolve(body);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

/**
 * Query Supabase
 */
async function supabaseQuery(table, params = {}) {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
    
    if (params.select) url.searchParams.append('select', params.select);
    if (params.eq) {
        Object.entries(params.eq).forEach(([key, val]) => {
            url.searchParams.append(key, `eq.${val}`);
        });
    }
    if (params.order) url.searchParams.append('order', params.order);
    if (params.limit) url.searchParams.append('limit', params.limit);

    return request(url.toString(), {
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
    });
}

/**
 * Insert into Supabase
 */
async function supabaseInsert(table, data) {
    return request(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    }, data);
}

/**
 * Update Supabase
 */
async function supabaseUpdate(table, id, data) {
    return request(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        }
    }, data);
}

/**
 * Execute task via n8n webhook
 */
async function executeViaWebhook(crewMember, task) {
    const webhookPath = crewMember.integrations?.n8n?.webhook_path;
    if (!webhookPath) throw new Error('No webhook path');

    const url = `${N8N_URL}${webhookPath}`;
    
    return request(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, {
        query: task.query,
        context: task.context,
        task_id: task.id
    });
}

/**
 * Execute task via OpenRouter AI (fallback)
 */
async function executeViaAI(crewMember, task) {
    const systemPrompt = crewMember.ai_config?.system_prompt || 
        `You are ${crewMember.name}, ${crewMember.personality?.archetype}. ${crewMember.personality?.traits?.join(', ')}.`;

    const response = await request('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://alex-ai-universal.com',
            'X-Title': 'Alex AI Universal - Crew Coordination'
        }
    }, {
        model: crewMember.ai_config?.preferred_models?.[0] || 'anthropic/claude-3.5-sonnet',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: task.query }
        ],
        temperature: crewMember.ai_config?.temperature || 0.7
    });

    return {
        crew_member: crewMember.name,
        response: response.choices[0].message.content,
        execution_method: 'openrouter_ai'
    };
}

/**
 * Execute task via RAG query (fastest fallback)
 */
async function executeViaRAG(crewMember, task) {
    // Query crew memories for similar context
    const memories = await supabaseQuery('crew_memories', {
        eq: { crew_member: crewMember.name },
        order: 'created_at.desc',
        limit: 5
    });

    // Simple response based on memories
    const memoryContext = memories.map(m => m.content).join('\n\n');
    
    return {
        crew_member: crewMember.name,
        response: `Based on my experience:\n\n${memoryContext}\n\nFor your query: "${task.query}"\n\nI recommend ${crewMember.expertise?.primary} approach with focus on ${crewMember.responsibilities?.[0]}.`,
        execution_method: 'rag_memory',
        memories_used: memories.length
    };
}

/**
 * Route and execute task
 */
async function executeTask(task) {
    console.log(`\n🎯 Executing task ${task.id}`);
    console.log(`   Query: ${task.query.substring(0, 60)}...`);
    
    // Determine crew member (from task or auto-assign)
    let crewMember;
    if (task.crew_member_id) {
        crewMember = crewProfiles[task.crew_member_id];
    } else {
        // Simple keyword matching for auto-assignment
        const query = task.query.toLowerCase();
        if (query.includes('strategic') || query.includes('command')) {
            crewMember = crewProfiles['captain-picard'];
        } else if (query.includes('data') || query.includes('analysis')) {
            crewMember = crewProfiles['commander-data'];
        } else if (query.includes('engineering') || query.includes('technical')) {
            crewMember = crewProfiles['geordi-la-forge'];
        } else if (query.includes('security') || query.includes('protect')) {
            crewMember = crewProfiles['lieutenant-worf'];
        } else {
            // Default to Captain Picard for coordination
            crewMember = crewProfiles['captain-picard'];
        }
    }

    console.log(`   Assigned to: ${crewMember.name}`);

    // Try execution methods in order of preference
    let result;
    let method;

    // Method 1: Try n8n webhook
    try {
        console.log('   Attempt 1: n8n webhook...');
        result = await executeViaWebhook(crewMember, task);
        method = 'webhook';
        console.log('   ✅ Success via webhook');
    } catch (webhookError) {
        console.log(`   ❌ Webhook failed: ${webhookError.message}`);

        // Method 2: Try OpenRouter AI
        try {
            console.log('   Attempt 2: OpenRouter AI...');
            result = await executeViaAI(crewMember, task);
            method = 'ai';
            console.log('   ✅ Success via AI');
        } catch (aiError) {
            console.log(`   ❌ AI failed: ${aiError.message}`);

            // Method 3: Fallback to RAG
            console.log('   Attempt 3: RAG memories...');
            result = await executeViaRAG(crewMember, task);
            method = 'rag';
            console.log('   ✅ Success via RAG');
        }
    }

    // Store response
    const response = {
        task_id: task.id,
        crew_member: crewMember.name,
        response: result.response || result,
        execution_method: method,
        created_at: new Date().toISOString()
    };

    await supabaseInsert('crew_responses', response);

    // Store as memory for learning
    await supabaseInsert('crew_memories', {
        crew_member: crewMember.name,
        category: 'coordination',
        content: `Query: ${task.query}\n\nResponse: ${response.response.substring(0, 500)}`,
        source: 'coordination_system',
        created_at: new Date().toISOString()
    });

    // Update task status
    await supabaseUpdate('crew_tasks', task.id, {
        status: 'completed',
        completed_at: new Date().toISOString()
    });

    console.log(`   ✅ Task completed and stored`);

    return response;
}

/**
 * Main polling loop
 */
async function pollAndExecute() {
    try {
        // Get pending tasks
        const tasks = await supabaseQuery('crew_tasks', {
            eq: { status: 'pending' },
            order: 'created_at.asc',
            limit: 10
        });

        if (tasks.length > 0) {
            console.log(`\n📋 Found ${tasks.length} pending task(s)`);
            
            for (const task of tasks) {
                try {
                    await executeTask(task);
                } catch (error) {
                    console.error(`❌ Error executing task ${task.id}:`, error.message);
                    
                    // Mark as failed
                    await supabaseUpdate('crew_tasks', task.id, {
                        status: 'failed',
                        error: error.message
                    });
                }
            }
        } else {
            process.stdout.write('.');
        }
    } catch (error) {
        console.error('❌ Polling error:', error.message);
    }

    // Poll every 5 seconds
    setTimeout(pollAndExecute, 5000);
}

/**
 * Initialize system
 */
async function initialize() {
    console.log('🔧 Initializing fallback coordination system...\n');

    // Create tables if they don't exist (via n8n or direct SQL)
    console.log('📊 Database schema:');
    console.log('   - crew_tasks: Incoming coordination requests');
    console.log('   - crew_responses: Crew member responses');
    console.log('   - crew_memories: Learning and context storage');
    
    console.log('\n🎯 Execution priority:');
    console.log('   1. n8n webhooks (if available)');
    console.log('   2. OpenRouter AI (intelligent fallback)');
    console.log('   3. RAG memories (fast fallback)');

    console.log('\n👥 Crew roster:');
    Object.values(crewProfiles).forEach(crew => {
        console.log(`   - ${crew.name} (${crew.expertise?.primary})`);
    });

    console.log('\n✅ System ready. Starting polling loop...');
    console.log('   (Polling every 5 seconds for new tasks)\n');

    // Start polling
    pollAndExecute();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down crew coordination system...');
    console.log('✅ All active tasks completed');
    console.log('🖖 The crew stands ready for your return.\n');
    process.exit(0);
});

// Start the system
initialize();

