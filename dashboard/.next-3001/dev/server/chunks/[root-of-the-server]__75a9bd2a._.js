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
 * Flow: Client → Next.js API → Supabase (Live) → Supabase
 * Fallback: Client → Next.js API → n8n Webhook → Supabase
 * 
 * Architecture: 
 *   PRIMARY: Supabase direct (Live instance) via Next.js API route
 *   FALLBACK: n8n Webhook (if Supabase unavailable)
 * 
 * Crew: Data (Architecture) + La Forge (Implementation) + O'Brien (Pragmatic)
 */ __turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
// Use live Supabase instance from environment variables
const SUPABASE_URL = ("TURBOPACK compile-time value", "https://rpkkkbufdwxmjaerbhbn.supabase.co") || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const N8N_URL = ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || 'https://n8n.pbradygeorgen.com';
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId') || 'default';
        // PRIMARY: Try Supabase first (Live instance)
        if (SUPABASE_SERVICE_KEY) {
            try {
                const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_SERVICE_KEY);
                const { data, error } = await supabase.from('user_settings').select('global_theme, preferences').eq('user_id', userId).single();
                if (!error && data) {
                    return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                        success: true,
                        globalTheme: data.global_theme || 'midnight',
                        preferences: data.preferences || {},
                        source: 'supabase'
                    });
                }
            } catch (supabaseError) {
                // Supabase failed, try n8n fallback
                console.warn('Supabase settings retrieve failed, trying n8n fallback:', supabaseError.message);
            }
        }
        // FALLBACK: Try n8n webhook
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
                return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    globalTheme: data.globalTheme || 'midnight',
                    preferences: data.preferences || {},
                    source: 'n8n'
                });
            }
        } catch (n8nError) {
            // Both failed - return null (settings not found)
            console.warn('Both Supabase and n8n failed for settings retrieve:', n8nError.message);
        }
        // No settings found - return null to indicate no saved settings
        // This allows client to use localStorage theme instead of forcing 'midnight'
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            globalTheme: null,
            preferences: {},
            source: 'default'
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