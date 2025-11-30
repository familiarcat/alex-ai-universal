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
"[project]/dashboard/app/api/cost/optimization/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Cost Optimization API
 * 
 * GET /api/cost/optimization
 * 
 * Returns cost optimization data from Supabase
 * Falls back to mock data if Supabase unavailable
 * 
 * Leadership: Quark (Business Intelligence) + Geordi La Forge (Infrastructure)
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
        // Try to fetch from Supabase
        if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(SUPABASE_URL, SUPABASE_SERVICE_KEY);
            // Query cost data (if table exists)
            let data = null;
            let error = null;
            try {
                const result = await supabase.from('cost_metrics').select('*').order('created_at', {
                    ascending: false
                }).limit(1).single();
                data = result.data;
                error = result.error;
            } catch (e) {
                // Table doesn't exist or query failed - use mock data
                data = null;
                error = {
                    message: 'Table not found'
                };
            }
            if (!error && data) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    success: true,
                    data: {
                        monthlyCost: data.monthly_cost || 200,
                        savings: data.savings || 50,
                        recommendations: data.recommendations || [],
                        trends: data.trends || []
                    }
                });
            }
        }
        // Fallback to mock data
        const mockData = {
            monthlyCost: Math.floor(Math.random() * 500) + 100,
            savings: Math.floor(Math.random() * 100) + 50,
            recommendations: [
                {
                    id: 'rec-1',
                    title: 'Optimize API calls',
                    savings: 25,
                    priority: 'high'
                },
                {
                    id: 'rec-2',
                    title: 'Cache frequently accessed data',
                    savings: 15,
                    priority: 'medium'
                }
            ],
            trends: Array.from({
                length: 12
            }, (_, i)=>({
                    month: new Date(2024, i, 1).toLocaleDateString('en-US', {
                        month: 'short'
                    }),
                    cost: Math.floor(Math.random() * 200) + 100
                }))
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: mockData,
            fallback: true,
            message: 'Using mock data - Supabase table may not exist yet'
        });
    } catch (error) {
        console.error('Cost optimization API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Failed to fetch cost optimization data',
            data: null
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d499a45d._.js.map