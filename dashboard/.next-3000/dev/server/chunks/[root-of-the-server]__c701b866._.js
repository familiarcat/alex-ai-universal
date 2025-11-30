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
"[project]/dashboard/app/api/security/assessment/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Security Assessment API
 * 
 * GET /api/security/assessment
 * 
 * Returns security assessment data from Supabase
 * Falls back to mock data if Supabase unavailable
 * 
 * Leadership: Lieutenant Worf (Security) + Geordi La Forge (Infrastructure)
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
            // Query security audits (if table exists)
            let data = null;
            let error = null;
            try {
                const result = await supabase.from('security_audits').select('*').order('created_at', {
                    ascending: false
                }).limit(10).single();
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
                        overallScore: data.score || 85,
                        vulnerabilities: data.vulnerabilities || [],
                        compliance: data.compliance || {
                            gdpr: true,
                            hipaa: false,
                            soc2: true
                        },
                        lastScan: data.created_at || new Date().toISOString(),
                        nextScan: data.next_scan || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                    }
                });
            }
        }
        // Fallback to mock data if Supabase unavailable
        const mockData = {
            overallScore: Math.floor(Math.random() * 20) + 80,
            vulnerabilities: [
                {
                    id: 'vuln-1',
                    severity: 'low',
                    title: 'Mock vulnerability 1',
                    status: 'resolved'
                },
                {
                    id: 'vuln-2',
                    severity: 'medium',
                    title: 'Mock vulnerability 2',
                    status: 'in-progress'
                }
            ],
            compliance: {
                gdpr: true,
                hipaa: false,
                soc2: true
            },
            lastScan: new Date().toISOString(),
            nextScan: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: mockData,
            fallback: true,
            message: 'Using mock data - Supabase table may not exist yet'
        });
    } catch (error) {
        console.error('Security assessment API error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error.message || 'Failed to fetch security assessment',
            data: null
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__c701b866._.js.map