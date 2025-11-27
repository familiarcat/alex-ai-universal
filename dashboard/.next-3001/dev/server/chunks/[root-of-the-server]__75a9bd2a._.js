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
"[project]/dashboard/app/api/settings/retrieve/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Settings Retrieve API - DDD-Compliant Settings Retrieval
 * 
 * PROPER DDD ARCHITECTURE:
 * Client → Next.js API (Controller) → MCP (Primary) → n8n (Fallback) → Supabase (Data)
 * 
 * Client Layer: Only knows about /api/settings/retrieve (black box)
 * Controller Layer: Handles MCP → n8n → Supabase fallback chain
 * Data Layer: Supabase (single source of truth)
 * 
 * Crew: Data (Architecture) + La Forge (Implementation) + O'Brien (Pragmatic)
 * Updated: 2025-11-27 - Fixed DDD violation: Client no longer aware of n8n/MCP
 */ __turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
// Controller layer configuration (NOT exposed to client)
const MCP_BASE_URL = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY;
const N8N_URL = ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || 'https://n8n.pbradygeorgen.com';
const SUPABASE_URL = ("TURBOPACK compile-time value", "https://rpkkkbufdwxmjaerbhbn.supabase.co") || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId') || 'default';
        // PROPER DDD: Controller layer handles fallback chain
        // Client is unaware of MCP, n8n, or Supabase - this is a black box
        // PRIMARY: Try MCP server (mcp.pbradygeorgen.com)
        if (MCP_API_KEY) {
            try {
                const mcpResponse = await fetch(`${MCP_BASE_URL}/api/settings/retrieve?userId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${MCP_API_KEY}`,
                        'X-Source': 'alex-ai-dashboard-api',
                        'Cache-Control': 'no-cache'
                    },
                    signal: AbortSignal.timeout(5000),
                    cache: 'no-store'
                });
                if (mcpResponse.ok) {
                    const mcpData = await mcpResponse.json();
                    if (mcpData.success && mcpData.globalTheme) {
                        // MCP returned valid settings
                        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                            success: true,
                            globalTheme: mcpData.globalTheme,
                            preferences: mcpData.preferences || {}
                        });
                    }
                }
            } catch (mcpError) {
                // MCP server unavailable or network error
                console.warn('⚠️  MCP server unavailable, trying n8n fallback:', mcpError.message);
            }
        }
        // FALLBACK 1: Try n8n webhook (controller layer)
        try {
            const response = await fetch(`${N8N_URL}/webhook/settings-retrieve?userId=${userId}`, {
                method: 'GET',
                headers: {
                    'X-Source': 'alex-ai-dashboard-api',
                    'Cache-Control': 'no-cache'
                },
                signal: AbortSignal.timeout(5000),
                cache: 'no-store'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.globalTheme) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true,
                        globalTheme: data.globalTheme,
                        preferences: data.preferences || {}
                    });
                }
            }
        } catch (n8nError) {
            // n8n failed, try Supabase direct fallback
            console.warn('⚠️  n8n webhook failed, trying Supabase direct fallback:', n8nError.message);
        }
        // FALLBACK 2: Try Supabase direct (data layer - last resort)
        if (SUPABASE_SERVICE_KEY) {
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                const { data, error } = await supabase.from('user_settings').select('global_theme, preferences').eq('user_id', userId).single();
                if (!error && data) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true,
                        globalTheme: data.global_theme || null,
                        preferences: data.preferences || {}
                    });
                }
            } catch (supabaseError) {
                // Supabase failed - all layers exhausted
                console.warn('⚠️  Supabase direct fallback failed:', supabaseError.message);
            }
        }
        // No settings found in any layer - return null to indicate no saved settings
        // This allows client to use localStorage theme instead of forcing 'midnight'
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            globalTheme: null,
            preferences: {}
        });
    } catch (error) {
        console.error('Settings retrieve error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to retrieve settings'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__75a9bd2a._.js.map