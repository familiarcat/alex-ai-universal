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
"[project]/dashboard/app/api/mcp/[...endpoint]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * 🖖 MCP Proxy API Route
 * 
 * Proxies requests to MCP server (mcp.pbradygeorgen.com)
 * Keeps API key server-side for security
 * 
 * DDD Architecture: Client → Next.js API → MCP Server → Supabase
 * 
 * Reviewed by: Lieutenant Worf (Security) & Commander Data (Implementation)
 */ __turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
;
const MCP_BASE_URL = process.env.NEXT_PUBLIC_MCP_URL || 'https://mcp.pbradygeorgen.com';
const MCP_API_KEY = process.env.MCP_API_KEY || ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhYmZhNTk0Ni1hYTVkLTQ1Y2QtOTQwYS00ZjZjNjVjMDEzYzAiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzYzNjIzMDIwfQ.JubiHmMzS3nLq4McKiVSIHwQ4NYmBCu941HIOtiYYP0"); // Reuse n8n key
async function POST(request, { params }) {
    try {
        const endpoint = params.endpoint.join('/');
        const body = await request.json();
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Proxy request to MCP server
        const mcpUrl = `${MCP_BASE_URL}/${endpoint}`;
        const requestId = body.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const response = await fetch(mcpUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-MCP-API-KEY': MCP_API_KEY,
                'X-Request-ID': requestId
            },
            body: JSON.stringify({
                ...body,
                requestId
            }),
            signal: AbortSignal.timeout(30000)
        });
        if (!response.ok) {
            // If MCP fails, return error (fallback handled by UnifiedDataService)
            const errorText = await response.text();
            console.warn(`⚠️  MCP endpoint ${endpoint} failed: ${response.status} ${errorText}`);
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: `MCP server error: ${response.status}`,
                mcpFailed: true
            }, {
                status: response.status
            });
        }
        const data = await response.json();
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(data);
    } catch (error) {
        // Handle timeout errors gracefully (don't log as errors - they're expected)
        const isTimeout = error.name === 'TimeoutError' || error.name === 'AbortError' || error.message?.includes('timeout') || error.message?.includes('signal timed out');
        if (!isTimeout) {
            // Only log non-timeout errors
            console.error(`❌ MCP proxy error for ${params.endpoint.join('/')}:`, error);
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: isTimeout ? 'Request timeout' : error.message || 'MCP proxy error',
            mcpFailed: true,
            timeout: isTimeout
        }, {
            status: isTimeout ? 408 : 500
        } // 408 Request Timeout for timeout errors
        );
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__ebafc18d._.js.map