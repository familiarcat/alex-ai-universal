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
"[project]/dashboard/app/api/memories/retrieve/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Memories Retrieve API
 * 
 * GET /api/memories/retrieve
 * 
 * Retrieves memories for a specific agent
 * Falls back to mock data if Supabase unavailable
 * 
 * Leadership: Lieutenant Uhura (Communications) + Geordi La Forge (Infrastructure)
 */ __turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
const SUPABASE_URL = ("TURBOPACK compile-time value", "https://rpkkkbufdwxmjaerbhbn.supabase.co") || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const agentName = searchParams.get('agent_name') || 'Data';
        const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
        // Try to fetch from Supabase
        if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            let data = null;
            let error = null;
            try {
                const result = await supabase.from('crew_memories').select('*').eq('crew_member', agentName).order('created_at', {
                    ascending: false
                }).limit(limit);
                data = result.data;
                error = result.error;
            } catch (e) {
                // Table doesn't exist or query failed - use mock data
                data = null;
                error = {
                    message: 'Table not found'
                };
            }
            if (!error && data && data.length > 0) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    agent_name: agentName,
                    total_memories: data.length,
                    memories: data.map((m)=>({
                            id: m.id,
                            content: m.content,
                            crew_member: m.crew_member,
                            timestamp: m.created_at || m.timestamp,
                            importance: m.importance || 'medium'
                        }))
                });
            }
        }
        // Fallback to mock data
        const mockMemories = Array.from({
            length: Math.min(limit, 5)
        }, (_, i)=>({
                id: `mock-${i + 1}`,
                content: `Mock memory ${i + 1} for ${agentName}`,
                crew_member: agentName,
                timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
                importance: i === 0 ? 'high' : 'medium'
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            agent_name: agentName,
            total_memories: mockMemories.length,
            memories: mockMemories,
            fallback: true,
            message: 'Using mock data - Supabase table may not exist yet'
        });
    } catch (error) {
        console.error('Memories retrieve API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Failed to retrieve memories',
            memories: []
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__db9561c6._.js.map