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
"[project]/dashboard/app/api/mcp/status/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
/**
 * MCP System Status API
 * 
 * DDD Architecture:
 * - Data Layer: Supabase (local MCP), Remote MCP Server, OpenRouter API
 * - Controller Layer: This API route (status aggregation)
 * - Client Layer: Dashboard UI (consumes this API)
 * 
 * Returns overall system health and status from source of truth
 */ const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYmZhNTk0Ni1hYTVkLTQ1Y2QtOTQwYS00ZjZjNjVjMDEzYzAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNjIzMDIwfQ.JubiHmMzS3nLq4McKiVSIHwQ4NYmBCu941HIOtiYYP0");
async function GET() {
    try {
        // Check remote MCP health
        let remoteMcpOperational = false;
        let localMcpOperational = false;
        let n8nOperational = false;
        // Check live Supabase first (hosted on pbradygeorgen.com - this is our primary system)
        // DDD: Data Layer - Live Supabase is the source of truth
        const supabaseUrl = ("TURBOPACK compile-time value", "https://rpkkkbufdwxmjaerbhbn.supabase.co");
        const supabaseKey = ("TURBOPACK compile-time value", "sb_secret_TCaP5QXq4PHTtsjxcU1l1Q_XB5nRLJg") || process.env.SUPABASE_ANON_KEY;
        if ("TURBOPACK compile-time truthy", 1) {
            try {
                // Use Supabase client library for more reliable connection check
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
                // Test connection by querying knowledge_base table (MCP's primary table)
                const { data, error } = await supabase.from('knowledge_base').select('id').limit(1);
                // If we can query (even if empty), Supabase is operational
                localMcpOperational = !error;
                if (error) {
                    console.warn('Local MCP (Supabase) query error:', error.message);
                }
            } catch (error) {
                // Local MCP (Supabase) not available or not configured
                localMcpOperational = false;
                console.warn('Local MCP (Supabase) connection failed:', error.message);
            }
        } else //TURBOPACK unreachable
        ;
        // Check remote MCP server (optional - for future remote MCP server)
        if (MCP_BASE_URL && !localMcpOperational) {
            try {
                const healthUrl = `${MCP_BASE_URL}/health`;
                const response = await fetch(healthUrl, {
                    method: 'GET',
                    headers: ("TURBOPACK compile-time truthy", 1) ? {
                        'X-MCP-API-KEY': MCP_API_KEY
                    } : "TURBOPACK unreachable",
                    signal: AbortSignal.timeout(3000)
                });
                remoteMcpOperational = response.ok;
            } catch (error) {
                // If health endpoint doesn't exist, try a simple endpoint
                try {
                    const testUrl = `${MCP_BASE_URL}/api/status`;
                    const response = await fetch(testUrl, {
                        method: 'GET',
                        headers: ("TURBOPACK compile-time truthy", 1) ? {
                            'X-MCP-API-KEY': MCP_API_KEY
                        } : "TURBOPACK unreachable",
                        signal: AbortSignal.timeout(3000)
                    });
                    remoteMcpOperational = response.ok;
                } catch (testError) {
                    remoteMcpOperational = false;
                // Remote MCP server not available - this is OK, we use local MCP
                // Silently handle timeout errors (expected behavior)
                }
            }
        }
        // Check n8n health
        const n8nUrl = ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || 'https://n8n.pbradygeorgen.com';
        if ("TURBOPACK compile-time truthy", 1) {
            try {
                const response = await fetch(`${n8nUrl}/healthz`, {
                    method: 'GET',
                    signal: AbortSignal.timeout(5000)
                });
                n8nOperational = response.ok;
            } catch (error) {
                n8nOperational = false;
            // Silently handle timeout errors (expected behavior for health checks)
            }
        }
        // Check OpenRouter health (DDD: Source of Truth)
        let openRouterOperational = false;
        const openRouterApiKey = process.env.OPENROUTER_API_KEY;
        if (openRouterApiKey) {
            try {
                const response = await fetch('https://openrouter.ai/api/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${openRouterApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    signal: AbortSignal.timeout(5000)
                });
                openRouterOperational = response.ok;
            } catch (error) {
                openRouterOperational = false;
                // Silently handle timeout errors (expected behavior for health checks)
                const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || error.message?.includes('timeout');
                if (!isTimeout) {
                    console.warn('OpenRouter health check failed:', error.message);
                }
            }
        } else {
            console.warn('OpenRouter API key not configured');
        }
        // Build diagnostics information
        const diagnostics = {
            supabaseConfigured: !!(supabaseUrl && supabaseKey),
            supabaseConnected: localMcpOperational,
            supabaseError: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : !localMcpOperational ? 'Supabase connection failed - check credentials and network' : undefined,
            remoteMcpConfigured: !!(MCP_BASE_URL && MCP_API_KEY),
            remoteMcpReachable: remoteMcpOperational,
            remoteMcpError: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : !remoteMcpOperational ? 'Remote MCP server unreachable - check URL and API key' : undefined,
            n8nConfigured: !!n8nUrl,
            n8nReachable: n8nOperational,
            n8nError: ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : !n8nOperational ? 'n8n server unreachable - check URL and network' : undefined,
            openRouterConfigured: !!openRouterApiKey,
            openRouterReachable: openRouterOperational,
            openRouterError: !openRouterApiKey ? 'Missing OPENROUTER_API_KEY' : !openRouterOperational ? 'OpenRouter API unreachable - check API key and network' : undefined
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            status: remoteMcpOperational || localMcpOperational ? 'operational' : 'offline',
            services: {
                remoteMCP: remoteMcpOperational,
                localMCP: localMcpOperational,
                n8n: n8nOperational,
                openRouter: openRouterOperational
            },
            endpoints: {
                mcp: MCP_BASE_URL,
                n8n: n8nUrl,
                openRouter: 'https://openrouter.ai'
            },
            diagnostics,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting MCP status:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            status: 'error',
            error: error.message || 'Failed to get system status',
            timestamp: new Date().toISOString()
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4b681c7d._.js.map