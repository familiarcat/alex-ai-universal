module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/dashboard/lib/unified-data-service.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🖖 Unified Data Service (Client-Side)
 * 
 * DDD-Compliant Data Access Layer for Dashboard Components
 * 
 * Flow: UI Component → UnifiedDataService → Next.js API → Supabase (Live - pbradygeorgen.com)
 * Fallback: UI Component → UnifiedDataService → n8n Webhook → Supabase (if Supabase unavailable)
 * 
 * Architecture: 
 *   PRIMARY: Supabase direct (Live instance hosted on pbradygeorgen.com) via Next.js API routes
 *   FALLBACK: n8n Webhook (if Supabase unavailable)
 *   REMOTE MCP: Future enhancement (when mcp.pbradygeorgen.com is deployed)
 * 
 * Crew Fix: Data (Architecture) + La Forge (Implementation) + Troi (UX)
 * Updated: 2025-11-27 - Fixed to use Supabase directly instead of remote MCP server
 * Updated: 2025-01-24 - Added progress tracking for async operations
 */ __turbopack_context__.s([
    "UnifiedDataService",
    ()=>UnifiedDataService,
    "default",
    ()=>__TURBOPACK__default__export__,
    "getUnifiedDataService",
    ()=>getUnifiedDataService
]);
const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const N8N_BASE_URL = ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || 'https://n8n.pbradygeorgen.com'; // Fallback only
class UnifiedDataService {
    config;
    activeOperations = new Map();
    // Track failed endpoints to prevent infinite retry loops
    failedEndpoints = new Set();
    lastFailureTime = new Map();
    FAILURE_COOLDOWN = 60000;
    constructor(config = {}){
        this.config = {
            timeout: config.timeout || 15000,
            retries: config.retries || 1,
            onProgress: config.onProgress
        };
    }
    /**
   * Report progress for an operation
   */ reportProgress(operationId, current, total, description, status) {
        if (this.config.onProgress) {
            this.config.onProgress(current, total, description, status);
        }
        this.activeOperations.set(operationId, {
            current,
            total
        });
    }
    /**
   * Query knowledge base via MCP (primary) or n8n (fallback)
   * 
   * @param params - Query parameters
   * @returns Knowledge base results
   */ async queryKnowledge(params) {
        return this.callMCPEndpoint('knowledge/query', {
            action: 'query',
            ...params
        });
    }
    /**
   * Get crew memory statistics via MCP (primary) or n8n (fallback)
   * 
   * @param params - Query parameters
   * @returns Crew stats
   */ async getCrewStats(params = {}) {
        return this.callMCPEndpoint('crew/stats', {
            action: 'get_stats',
            ...params
        });
    }
    /**
   * Get learning metrics via MCP (primary) or n8n (fallback)
   * 
   * @param params - Query parameters
   * @returns Learning metrics
   */ async getLearningMetrics(params = {}) {
        return this.callMCPEndpoint('learning/metrics', {
            action: 'get_metrics',
            ...params
        });
    }
    /**
   * Get project recommendations via MCP (primary) or n8n (fallback)
   * 
   * @param params - Query parameters
   * @returns Project recommendations
   */ async getProjectRecommendations(params = {}) {
        return this.callMCPEndpoint('project/recommendations', {
            action: 'get_recommendations',
            ...params
        });
    }
    /**
   * Get security assessment data via MCP (primary) or n8n (fallback)
   * 
   * @returns Security assessment data
   */ async getSecurityData() {
        return this.callMCPEndpoint('security/assessment', {
            action: 'get_assessment'
        });
    }
    /**
   * Get cost optimization data via MCP (primary) or n8n (fallback)
   * 
   * @returns Cost optimization data
   */ async getCostData() {
        return this.callMCPEndpoint('cost/optimization', {
            action: 'get_cost_data'
        });
    }
    /**
   * Get UX analytics data via MCP (primary) or n8n (fallback)
   * 
   * @returns UX analytics data
   */ async getUXData() {
        return this.callMCPEndpoint('ux/analytics', {
            action: 'get_ux_data'
        });
    }
    /**
   * Get AI impact assessment data via MCP (primary) or n8n (fallback)
   * 
   * @returns AI impact assessment data
   */ async getAssessmentData() {
        return this.callMCPEndpoint('ai/impact', {
            action: 'get_assessment'
        });
    }
    /**
   * Get process documentation via MCP (primary) or n8n (fallback)
   * 
   * @returns Process documentation
   */ async getProcesses() {
        return this.callMCPEndpoint('process/documentation', {
            action: 'get_processes'
        });
    }
    /**
   * Get data sources via MCP (primary) or n8n (fallback)
   * 
   * @returns Data sources
   */ async getDataSources() {
        return this.callMCPEndpoint('data/sources', {
            action: 'get_data_sources'
        });
    }
    /**
   * Get documentation via MCP (primary) or n8n (fallback)
   * 
   * @returns Documentation
   */ async getDocumentation(params = {}) {
        return this.callMCPEndpoint('documentation', {
            action: 'get_documentation',
            ...params
        });
    }
    /**
   * Call Supabase via Next.js API route (PRIMARY - Live Supabase)
   * 
   * FIXED: Changed from remote MCP (mcp.pbradygeorgen.com) to live Supabase (hosted on pbradygeorgen.com)
   * Uses Next.js API routes that connect directly to the live Supabase instance
   * This is the live production Supabase instance - the source of truth
   * 
   * Crew Fix: Data (Architecture) + La Forge (Implementation) + Troi (UX)
   * Date: 2025-11-27
   * 
   * @param endpoint - API endpoint name (maps to Next.js API route)
   * @param payload - Request payload
   * @returns Response data
   */ async callMCPEndpoint(endpoint, payload) {
        // FIXED: Added failure tracking to prevent infinite retry loops
        // Crew: Data (Analysis) & La Forge (Implementation)
        const endpointKey = `mcp:${endpoint}`;
        // Check if endpoint is in cooldown (recently failed)
        const lastFailure = this.lastFailureTime.get(endpointKey);
        if (lastFailure && Date.now() - lastFailure < this.FAILURE_COOLDOWN) {
            // Endpoint recently failed, skip retry and go straight to fallback
            console.warn(`⚠️  Supabase endpoint ${endpoint} in cooldown, using n8n fallback immediately`);
            return this.callN8NFallback(endpoint, payload, payload.operationId);
        }
        // Map UI endpoints to Next.js API routes (Supabase direct - Local MCP)
        // Note: Some routes only support GET, not POST
        const apiRouteMap = {
            'knowledge/query': {
                route: '/api/knowledge/query',
                method: 'POST'
            },
            'crew/stats': {
                route: '/api/lounge/crew-status',
                method: 'GET'
            },
            'learning/metrics': {
                route: '/api/lounge/latest',
                method: 'GET'
            },
            'project/recommendations': {
                route: '/api/lounge/latest',
                method: 'GET'
            },
            'security/assessment': {
                route: '/api/lounge/latest',
                method: 'GET'
            },
            'cost/optimization': {
                route: '/api/lounge/latest',
                method: 'GET'
            },
            'ux/analytics': {
                route: '/api/lounge/latest',
                method: 'GET'
            },
            'ai/impact': {
                route: '/api/lounge/latest',
                method: 'GET'
            },
            'process/documentation': {
                route: '/api/lounge/latest',
                method: 'GET'
            },
            'data/sources': {
                route: '/api/lounge/latest',
                method: 'GET'
            },
            'documentation': {
                route: '/api/lounge/latest',
                method: 'GET'
            }
        };
        const routeConfig = apiRouteMap[endpoint] || {
            route: '/api/lounge/latest',
            method: 'GET'
        };
        const url = routeConfig.route;
        const method = routeConfig.method;
        const requestId = payload.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const operationId = payload.operationId || `${endpoint}-${requestId}`;
        // Prevent infinite loops: Check if this request is already in progress
        const activeKey = `${endpoint}-${requestId}`;
        if (this.activeOperations.has(activeKey)) {
            console.warn(`⚠️  Preventing infinite loop: ${endpoint} already in progress (requestId: ${requestId})`);
            throw new Error(`Request already in progress: ${endpoint}`);
        }
        // Mark as active
        this.activeOperations.set(activeKey, {
            current: 0,
            total: this.config.retries
        });
        try {
            // Report initial progress
            this.reportProgress(operationId, 0, this.config.retries, `📡 Connecting to Supabase (Live): ${endpoint}`, 'loading');
            // Retry logic with exponential backoff (per crew optimization)
            for(let attempt = 1; attempt <= this.config.retries; attempt++){
                try {
                    this.reportProgress(operationId, attempt - 1, this.config.retries, `📡 Attempt ${attempt}/${this.config.retries}: ${endpoint} (Supabase)`, 'loading');
                    // Build request based on method
                    let finalUrl = url;
                    const requestOptions = {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Request-ID': requestId
                        },
                        signal: AbortSignal.timeout(this.config.timeout)
                    };
                    // Only include body for POST requests
                    if (method === 'POST') {
                        requestOptions.body = JSON.stringify({
                            ...payload,
                            timestamp: new Date().toISOString(),
                            source: 'dashboard',
                            requestId
                        });
                    } else {
                        // For GET requests, add query params if needed
                        const baseUrl = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'http://localhost:3000';
                        const urlObj = new URL(url, baseUrl);
                        if (payload.action) {
                            urlObj.searchParams.set('action', payload.action);
                        }
                        if (payload.limit) {
                            urlObj.searchParams.set('limit', String(payload.limit));
                        }
                        if (payload.category) {
                            urlObj.searchParams.set('category', payload.category);
                        }
                        if (payload.crew_member) {
                            urlObj.searchParams.set('crew_member', payload.crew_member);
                        }
                        if (payload.query) {
                            urlObj.searchParams.set('query', payload.query);
                        }
                        finalUrl = urlObj.pathname + urlObj.search;
                    }
                    const response = await fetch(finalUrl, requestOptions);
                    if (!response.ok) {
                        const errorText = await response.text().catch(()=>'');
                        throw new Error(`Supabase endpoint error: ${response.status} ${response.statusText} - ${errorText}`);
                    }
                    const data = await response.json();
                    this.reportProgress(operationId, this.config.retries, this.config.retries, `✅ Retrieved from Supabase: ${endpoint}`, 'complete');
                    this.activeOperations.delete(activeKey);
                    // Clear failure tracking on success
                    this.failedEndpoints.delete(endpointKey);
                    this.lastFailureTime.delete(endpointKey);
                    return data;
                } catch (error) {
                    const isLastAttempt = attempt === this.config.retries;
                    const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('signal timed out');
                    // Silently handle timeout errors (they're expected and handled with fallbacks)
                    // Only log non-timeout errors to avoid console noise
                    if (isLastAttempt) {
                        this.activeOperations.delete(activeKey);
                        // Mark endpoint as failed and set cooldown
                        this.failedEndpoints.add(endpointKey);
                        this.lastFailureTime.set(endpointKey, Date.now());
                        this.reportProgress(operationId, this.config.retries, this.config.retries, `⚠️  Supabase failed, trying fallback: ${endpoint}`, 'loading');
                        if (!isTimeout) {
                            // Only log non-timeout errors
                            console.warn(`⚠️  Supabase endpoint ${endpoint} failed after ${this.config.retries} attempts (requestId: ${requestId}), trying n8n fallback:`, error.message);
                        }
                        // Fallback to n8n if MCP unavailable after all retries
                        return this.callN8NFallback(endpoint, payload, operationId);
                    }
                    // Exponential backoff: 1s, 2s, 4s
                    const backoffMs = Math.pow(2, attempt - 1) * 1000;
                    this.reportProgress(operationId, attempt, this.config.retries, `⏳ Retrying in ${backoffMs}ms: ${endpoint}`, 'loading');
                    if (!isTimeout) {
                        // Only log non-timeout errors
                        console.warn(`⚠️  Supabase endpoint ${endpoint} attempt ${attempt}/${this.config.retries} failed (requestId: ${requestId}), retrying in ${backoffMs}ms:`, error.message);
                    }
                    await new Promise((resolve)=>setTimeout(resolve, backoffMs));
                }
            }
            // Should never reach here, but TypeScript needs it
            this.activeOperations.delete(activeKey);
            // Mark endpoint as failed and set cooldown
            this.failedEndpoints.add(endpointKey);
            this.lastFailureTime.set(endpointKey, Date.now());
            return this.callN8NFallback(endpoint, payload, operationId);
        } catch (error) {
            // Clean up on unexpected error
            this.activeOperations.delete(activeKey);
            // Mark endpoint as failed and set cooldown
            this.failedEndpoints.add(endpointKey);
            this.lastFailureTime.set(endpointKey, Date.now());
            throw error;
        }
    }
    /**
   * Call n8n webhook (FALLBACK ONLY - when MCP unavailable)
   * 
   * @param endpoint - Webhook endpoint name
   * @param payload - Request payload
   * @param operationId - Progress operation ID
   * @returns Response data
   */ async callN8NFallback(endpoint, payload, operationId) {
        const endpointKey = `n8n:${endpoint}`;
        // Check if n8n endpoint is in cooldown (recently failed)
        const lastFailure = this.lastFailureTime.get(endpointKey);
        if (lastFailure && Date.now() - lastFailure < this.FAILURE_COOLDOWN) {
            // n8n also failed recently, throw error instead of infinite retry
            throw new Error(`Both Supabase and n8n endpoints failed for ${endpoint}. Please check controller layer connectivity.`);
        }
        const url = `${N8N_BASE_URL}/webhook/${endpoint}`;
        const requestId = payload.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const fallbackOpId = operationId || `n8n-${endpoint}-${requestId}`;
        this.reportProgress(fallbackOpId, 0, 1, `🔄 Fallback to n8n: ${endpoint}`, 'loading');
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-ID': requestId
                },
                body: JSON.stringify({
                    ...payload,
                    timestamp: new Date().toISOString(),
                    source: 'dashboard',
                    fallback: true,
                    requestId
                }),
                signal: AbortSignal.timeout(this.config.timeout)
            });
            if (!response.ok) {
                const errorText = await response.text().catch(()=>'');
                throw new Error(`n8n fallback error: ${response.status} ${response.statusText} - ${errorText}`);
            }
            const data = await response.json();
            this.reportProgress(fallbackOpId, 1, 1, `✅ Retrieved from n8n: ${endpoint}`, 'complete');
            // Clear failure tracking on success
            this.failedEndpoints.delete(endpointKey);
            this.lastFailureTime.delete(endpointKey);
            return {
                ...data,
                fallback: true
            }; // Mark as fallback response
        } catch (error) {
            // Mark n8n endpoint as failed
            this.failedEndpoints.add(endpointKey);
            this.lastFailureTime.set(endpointKey, Date.now());
            const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('signal timed out');
            this.reportProgress(fallbackOpId, 1, 1, `❌ Both MCP and n8n failed: ${endpoint}`, 'failed');
            // Only log non-timeout errors (timeouts are expected and handled gracefully)
            if (!isTimeout) {
                console.error(`❌ Both MCP and n8n failed for ${endpoint}:`, error);
            }
            // Return fallback data structure to prevent UI crashes
            return {
                error: isTimeout ? 'Request timeout' : error.message,
                data: [],
                sessions: [],
                fallback: true,
                supabaseFailed: true,
                n8nFailed: true
            };
        }
    }
}
// Singleton instance for easy import
let serviceInstance = null;
function getUnifiedDataService() {
    if (!serviceInstance) {
        serviceInstance = new UnifiedDataService();
    }
    return serviceInstance;
}
const __TURBOPACK__default__export__ = UnifiedDataService;
}),
"[project]/dashboard/app/api/crew/thoughts/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$unified$2d$data$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/lib/unified-data-service.ts [app-route] (ecmascript)");
;
;
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50');
        const crewMember = searchParams.get('crew_member') || undefined;
        // Get recent crew memories with thoughts/concerns
        // Query all memories, then filter for crew-specific ones
        let memories = [];
        try {
            const service = (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$lib$2f$unified$2d$data$2d$service$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getUnifiedDataService"])();
            try {
                const knowledgeData = await service.queryKnowledge({
                    limit,
                    crew_member: crewMember,
                    query: crewMember ? `crew member ${crewMember}` : undefined
                });
                // Handle different response formats
                memories = knowledgeData?.data || knowledgeData?.memories || knowledgeData?.results || knowledgeData || [];
                // If we got crew stats instead, try to get memories from there
                if (Array.isArray(memories) && memories.length === 0) {
                    const statsData = await service.getCrewStats({
                        limit,
                        crew_member: crewMember
                    });
                    memories = statsData?.sessions || statsData?.data || statsData || [];
                }
            } catch (queryError) {
                console.warn('Knowledge query failed, trying crew stats:', queryError?.message || queryError);
                // Fallback to crew stats
                try {
                    const statsData = await service.getCrewStats({
                        limit,
                        crew_member: crewMember
                    });
                    memories = statsData?.sessions || statsData?.data || statsData || [];
                } catch (statsError) {
                    console.warn('Crew stats also failed:', statsError?.message || statsError);
                    // Return empty array if both fail
                    memories = [];
                }
            }
        } catch (serviceError) {
            console.error('Failed to initialize UnifiedDataService:', serviceError?.message || serviceError);
            // Return empty array if service initialization fails
            memories = [];
        }
        // Process memories to extract thoughts and concerns
        const crewThoughts = processCrewMemories(memories);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            crewThoughts,
            memoryCount: memories.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Failed to fetch crew thoughts:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Failed to fetch crew thoughts',
            crewThoughts: [],
            memoryCount: 0
        }, {
            status: 500
        });
    }
}
/**
 * Process crew memories to extract thoughts, concerns, and emotional metrics
 */ function processCrewMemories(memories) {
    const crewMap = new Map();
    const crewMembers = [
        {
            name: 'Picard',
            role: 'Strategic Leadership',
            icon: '🎖️'
        },
        {
            name: 'Data',
            role: 'Operations & Analytics',
            icon: '🤖'
        },
        {
            name: 'Riker',
            role: 'Tactical Operations',
            icon: '⚡'
        },
        {
            name: 'La Forge',
            role: 'Engineering',
            icon: '🔧'
        },
        {
            name: 'Worf',
            role: 'Security',
            icon: '⚔️'
        },
        {
            name: 'Troi',
            role: 'UX & Empathy',
            icon: '💭'
        },
        {
            name: 'Crusher',
            role: 'System Health',
            icon: '💊'
        },
        {
            name: 'Uhura',
            role: 'Communications',
            icon: '📻'
        },
        {
            name: 'Quark',
            role: 'Business Analysis',
            icon: '💰'
        },
        {
            name: 'O\'Brien',
            role: 'Pragmatic Solutions',
            icon: '🛠️'
        }
    ];
    // Initialize crew map
    crewMembers.forEach((crew)=>{
        crewMap.set(crew.name, {
            ...crew,
            recentThoughts: [],
            concerns: [],
            concernLevel: 0,
            satisfaction: 7,
            lastActive: 'Never',
            memoryCount: 0
        });
    });
    // Process memories
    memories.forEach((memory)=>{
        const crewName = extractCrewName(memory.crew_member || memory.crewMember || 'system');
        const crew = crewMap.get(crewName);
        if (!crew) return;
        crew.memoryCount++;
        // Extract thought/summary
        const thought = memory.summary || memory.title || memory.content || '';
        if (thought && crew.recentThoughts.length < 3) {
            crew.recentThoughts.push(thought.substring(0, 150)); // Limit length
        }
        // Extract concerns (look for keywords)
        const concernKeywords = [
            'concern',
            'issue',
            'problem',
            'worry',
            'risk',
            'critical',
            'urgent',
            'failing',
            'broken'
        ];
        const lowerThought = thought.toLowerCase();
        const hasConcern = concernKeywords.some((keyword)=>lowerThought.includes(keyword));
        if (hasConcern && crew.concerns.length < 2) {
            crew.concerns.push(thought.substring(0, 120));
            crew.concernLevel = Math.min(10, crew.concernLevel + 2); // Increase concern level
        }
        // Calculate satisfaction based on memory content
        const positiveKeywords = [
            'success',
            'complete',
            'excellent',
            'optimal',
            'improved',
            'resolved',
            'working'
        ];
        const negativeKeywords = [
            'failed',
            'error',
            'broken',
            'issue',
            'problem',
            'concern',
            'critical'
        ];
        const positiveCount = positiveKeywords.filter((k)=>lowerThought.includes(k)).length;
        const negativeCount = negativeKeywords.filter((k)=>lowerThought.includes(k)).length;
        if (positiveCount > negativeCount) {
            crew.satisfaction = Math.min(10, crew.satisfaction + 0.5);
        } else if (negativeCount > positiveCount) {
            crew.satisfaction = Math.max(0, crew.satisfaction - 1);
        }
        // Update last active
        const memoryDate = new Date(memory.created_at || memory.timestamp || memory.storage_timestamp);
        if (memoryDate > new Date(crew.lastActive) || crew.lastActive === 'Never') {
            crew.lastActive = memoryDate.toLocaleDateString();
        }
    });
    // Normalize concern level and satisfaction
    crewMap.forEach((crew)=>{
        crew.concernLevel = Math.min(10, Math.max(0, crew.concernLevel));
        crew.satisfaction = Math.min(10, Math.max(0, crew.satisfaction));
    });
    return Array.from(crewMap.values());
}
/**
 * Extract crew member name from various formats
 */ function extractCrewName(crewMember) {
    if (!crewMember) return 'Data'; // Default
    const normalized = crewMember.toLowerCase().trim();
    // Map common variations
    const nameMap = {
        'picard': 'Picard',
        'jean-luc picard': 'Picard',
        'captain picard': 'Picard',
        'data': 'Data',
        'commander data': 'Data',
        'riker': 'Riker',
        'commander riker': 'Riker',
        'william riker': 'Riker',
        'la forge': 'La Forge',
        'geordi': 'La Forge',
        'geordi la forge': 'La Forge',
        'worf': 'Worf',
        'lieutenant worf': 'Worf',
        'troi': 'Troi',
        'deanna troi': 'Troi',
        'counselor troi': 'Troi',
        'crusher': 'Crusher',
        'beverly crusher': 'Crusher',
        'dr. crusher': 'Crusher',
        'uhura': 'Uhura',
        'lieutenant uhura': 'Uhura',
        'quark': 'Quark',
        'obrien': 'O\'Brien',
        'chief obrien': 'O\'Brien',
        'miles obrien': 'O\'Brien'
    };
    return nameMap[normalized] || 'Data';
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__f3da55e6._.js.map