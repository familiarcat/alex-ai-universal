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
"[project]/dashboard/app/api/settings/diagnose/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Settings API Diagnostic Endpoint
 * 
 * Helps diagnose configuration issues with settings storage
 * 
 * Crew: Data (Diagnostics) + La Forge (Infrastructure)
 */ __turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
;
async function GET(request) {
    const MCP_BASE_URL = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
    const MCP_API_KEY = process.env.MCP_API_KEY;
    const N8N_URL = ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || 'https://n8n.pbradygeorgen.com';
    const SUPABASE_URL = ("TURBOPACK compile-time value", "https://rpkkkbufdwxmjaerbhbn.supabase.co") || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const diagnostics = {
        timestamp: new Date().toISOString(),
        configuration: {
            mcp: {
                url: MCP_BASE_URL,
                hasApiKey: !!MCP_API_KEY,
                apiKeyLength: MCP_API_KEY ? MCP_API_KEY.length : 0,
                status: MCP_API_KEY ? 'configured' : 'missing'
            },
            n8n: {
                url: N8N_URL,
                status: 'configured'
            },
            supabase: {
                url: SUPABASE_URL || 'not configured',
                hasServiceKey: !!SUPABASE_SERVICE_KEY,
                serviceKeyLength: SUPABASE_SERVICE_KEY ? SUPABASE_SERVICE_KEY.length : 0,
                status: SUPABASE_SERVICE_KEY ? 'configured' : 'missing'
            }
        },
        recommendations: []
    };
    // Add recommendations
    if (!MCP_API_KEY) {
        diagnostics.recommendations.push('MCP_API_KEY not configured - MCP layer will be skipped');
    }
    if (!SUPABASE_SERVICE_KEY) {
        diagnostics.recommendations.push('SUPABASE_SERVICE_KEY not configured - Supabase direct fallback will fail');
        diagnostics.recommendations.push('Settings will only work if n8n webhook is accessible');
    }
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    // Test connectivity (non-blocking)
    const connectivityTests = {
        mcp: 'not tested',
        n8n: 'not tested',
        supabase: 'not tested'
    };
    // Test n8n (quick test)
    try {
        const n8nTest = await fetch(`${N8N_URL}/healthz`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
        });
        connectivityTests.n8n = n8nTest.ok ? 'accessible' : `error: ${n8nTest.status}`;
    } catch (error) {
        connectivityTests.n8n = `unreachable: ${error.message}`;
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ...diagnostics,
        connectivity: connectivityTests
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__090db7af._.js.map