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
"[project]/dashboard/app/api/settings/store/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Settings Store API - DDD-Compliant Settings Persistence
 * 
 * PROPER DDD ARCHITECTURE:
 * Client → Next.js API (Controller) → MCP (Primary) → n8n (Fallback) → Supabase (Data)
 * 
 * Client Layer: Only knows about /api/settings/store (black box)
 * Controller Layer: Handles MCP → n8n → Supabase fallback chain
 * Data Layer: Supabase (single source of truth)
 * 
 * Crew: Data (Architecture) + La Forge (Implementation) + O'Brien (Pragmatic)
 * Updated: 2025-11-27 - Fixed DDD violation: Client no longer aware of n8n/MCP
 */ __turbopack_context__.s([
    "POST",
    ()=>POST
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
async function POST(request) {
    try {
        const body = await request.json();
        const { userId = 'default', globalTheme, preferences = {} } = body;
        // SECURITY: Input validation
        if (!globalTheme || typeof globalTheme !== 'string') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'Invalid globalTheme'
            }, {
                status: 400
            });
        }
        // PROPER DDD: Controller layer handles fallback chain
        // Client is unaware of MCP, n8n, or Supabase - this is a black box
        // PRIMARY: Try MCP server (mcp.pbradygeorgen.com)
        if (MCP_API_KEY) {
            try {
                console.log('🔄 Attempting MCP server for settings store:', {
                    userId,
                    globalTheme,
                    mcpUrl: `${MCP_BASE_URL}/api/settings/store`
                });
                const mcpResponse = await fetch(`${MCP_BASE_URL}/api/settings/store`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${MCP_API_KEY}`,
                        'X-Source': 'alex-ai-dashboard-api'
                    },
                    body: JSON.stringify({
                        userId,
                        globalTheme,
                        preferences
                    }),
                    signal: AbortSignal.timeout(5000)
                });
                if (mcpResponse.ok) {
                    const mcpData = await mcpResponse.json().catch(()=>({}));
                    console.log('✅ Settings stored successfully via MCP:', {
                        userId,
                        globalTheme
                    });
                    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true
                    }); // Client doesn't need to know source
                } else {
                    const errorText = await mcpResponse.text().catch(()=>'Unknown error');
                    console.warn('⚠️  MCP server returned error, trying n8n fallback:', {
                        status: mcpResponse.status,
                        statusText: mcpResponse.statusText,
                        body: errorText
                    });
                }
            } catch (mcpError) {
                // MCP server unavailable or network error
                console.warn('⚠️  MCP server unavailable, trying n8n fallback:', {
                    message: mcpError.message,
                    name: mcpError.name
                });
            }
        } else {
            console.warn('⚠️  MCP_API_KEY not configured, skipping MCP and using n8n fallback');
        }
        // FALLBACK 1: Try n8n webhook (controller layer)
        try {
            console.log('🔄 Attempting n8n fallback for settings store:', {
                userId,
                globalTheme,
                n8nUrl: `${N8N_URL}/webhook/settings-store`
            });
            const response = await fetch(`${N8N_URL}/webhook/settings-store`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Source': 'alex-ai-dashboard-api'
                },
                body: JSON.stringify({
                    userId,
                    globalTheme,
                    preferences
                }),
                signal: AbortSignal.timeout(5000)
            });
            if (response.ok) {
                const responseData = await response.json().catch(()=>({}));
                console.log('✅ Settings stored successfully via n8n:', {
                    userId,
                    globalTheme
                });
                return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true
                }); // Client doesn't need to know source
            } else {
                const errorText = await response.text().catch(()=>'Unknown error');
                console.warn('⚠️  n8n webhook returned error, trying Supabase direct fallback:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
            }
        } catch (n8nError) {
            // Network error or timeout
            console.warn('⚠️  n8n webhook request failed, trying Supabase direct fallback:', {
                message: n8nError.message,
                name: n8nError.name
            });
        }
        // FALLBACK 2: Try Supabase direct (data layer - last resort)
        if (SUPABASE_SERVICE_KEY) {
            try {
                console.log('🔄 Attempting Supabase direct for settings store (fallback):', {
                    userId,
                    globalTheme
                });
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                const { data, error } = await supabase.from('user_settings').upsert({
                    user_id: userId,
                    global_theme: globalTheme,
                    preferences: preferences,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'user_id'
                });
                if (!error) {
                    console.log('✅ Settings stored successfully in Supabase (direct fallback):', {
                        userId,
                        globalTheme
                    });
                    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true
                    }); // Client doesn't need to know source
                } else {
                    // Log the actual Supabase error for debugging
                    console.error('❌ Supabase upsert error:', {
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        userId,
                        globalTheme
                    });
                // Continue to final error - don't return here
                }
            } catch (supabaseError) {
                // Supabase client creation or network error
                console.error('❌ Supabase client error:', {
                    message: supabaseError.message,
                    stack: supabaseError.stack,
                    userId,
                    globalTheme
                });
            // Continue to final error - don't return here
            }
        } else {
            console.error('❌ SUPABASE_SERVICE_KEY not configured - all storage layers will fail');
        // This is a critical configuration error - we should still try to provide helpful error
        }
        // All layers failed - provide helpful error message
        const errorDetails = {
            userId,
            globalTheme,
            hasMcpKey: !!MCP_API_KEY,
            hasSupabaseKey: !!SUPABASE_SERVICE_KEY,
            mcpUrl: MCP_BASE_URL,
            n8nUrl: N8N_URL,
            supabaseUrl: ("TURBOPACK compile-time truthy", 1) ? 'configured' : "TURBOPACK unreachable"
        };
        console.error('❌ All storage layers failed (MCP → n8n → Supabase):', errorDetails);
        // Provide helpful error message based on configuration
        let errorMessage = 'Failed to store settings';
        if (!SUPABASE_SERVICE_KEY && !MCP_API_KEY) {
            errorMessage = 'Configuration error: SUPABASE_SERVICE_KEY or MCP_API_KEY required';
        } else if (!SUPABASE_SERVICE_KEY) {
            errorMessage = 'Configuration error: SUPABASE_SERVICE_KEY required for fallback';
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: errorMessage,
            // Include diagnostic endpoint for debugging (server-side only)
            diagnostic: '/api/settings/diagnose'
        }, {
            status: 500
        });
    } catch (error) {
        // Top-level error handler - catches JSON parsing errors, etc.
        console.error('❌ Settings store top-level error:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        // Return helpful error message
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to store settings',
            details: error.message || 'Unknown error occurred'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__2d24350c._.js.map