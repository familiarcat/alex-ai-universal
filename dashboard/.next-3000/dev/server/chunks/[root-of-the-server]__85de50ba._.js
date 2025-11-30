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
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/dashboard/app/api/lounge/latest/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
/**
 * Lounge Latest API
 * - Strictly proxies to n8n (no direct Supabase access from UI)
 * - Reads webhook from env (N8N_LOUNGE_LATEST_WEBHOOK or N8N_URL + /webhook/lounge-latest)
 */ function buildWebhookUrl() {
    const explicit = process.env.NEXT_PUBLIC_N8N_LOUNGE_LATEST_WEBHOOK || process.env.N8N_LOUNGE_LATEST_WEBHOOK;
    const base = ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || 'https://n8n.pbradygeorgen.com';
    if (explicit) {
        if (/^https?:\/\//i.test(explicit)) return explicit;
        if (explicit.startsWith('/')) {
            return `${base.replace(/\/$/, '')}${explicit}`;
        }
    }
    return `${base.replace(/\/$/, '')}/webhook/lounge-latest`;
}
async function GET() {
    try {
        const primary = buildWebhookUrl();
        const base = ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || ("TURBOPACK compile-time value", "https://n8n.pbradygeorgen.com") || 'https://n8n.pbradygeorgen.com';
        const baseNorm = base.replace(/\/$/, '');
        const candidates = Array.from(new Set([
            primary,
            baseNorm ? `${baseNorm}/webhook/lounge-latest` : null,
            baseNorm ? `${baseNorm}/webhook/lounge-latest/` : null,
            baseNorm ? `${baseNorm}/n8n/webhook/lounge-latest` : null,
            baseNorm ? `${baseNorm}/n8n/webhook/lounge-latest/` : null,
            baseNorm ? `${baseNorm}/webhook-test/lounge-latest` : null,
            baseNorm ? `${baseNorm}/webhook-test/lounge-latest/` : null,
            baseNorm ? `${baseNorm}/n8n/webhook-test/lounge-latest` : null,
            baseNorm ? `${baseNorm}/n8n/webhook-test/lounge-latest/` : null
        ].filter(Boolean)));
        let data = null;
        let lastError = null;
        const sharedHeaders = {};
        const signingSecret = process.env.N8N_WEBHOOK_SECRET || process.env.N8N_CONTROLLER_TOKEN;
        if (signingSecret) {
            // simple shared-secret header; workflow should validate
            sharedHeaders['x-controller-token'] = signingSecret;
        }
        for (const url of candidates){
            try {
                const controller = new AbortController();
                const timeout = setTimeout(()=>controller.abort(), 8000);
                const res = await fetch(url, {
                    method: 'GET',
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        ...sharedHeaders
                    }
                });
                clearTimeout(timeout);
                if (!res.ok) {
                    lastError = {
                        status: res.status,
                        body: await res.text().catch(()=>'')
                    };
                    continue;
                }
                data = await res.json().catch(()=>null);
                if (data) {
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        if (!data) {
            // Dev fallback: synthesize from local crew-memories if available
            try {
                const cwd = process.cwd();
                const roots = Array.from(new Set([
                    cwd,
                    __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(cwd, '..'),
                    __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(cwd, '..', '..')
                ]));
                const candidates = [];
                for (const root of roots){
                    candidates.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(root, 'crew-memories', 'active'));
                    candidates.push(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(root, 'crew-memories'));
                }
                const seen = new Set();
                const crew = [];
                const aliasToSlug = {
                    // Geordi variants
                    'geordi': 'la-forge',
                    'geordi la forge': 'la-forge',
                    'lt. cmdr. geordi': 'la-forge',
                    'lieutenant commander geordi la forge': 'la-forge',
                    'la forge': 'la-forge',
                    // Common others (defensive)
                    'picard': 'picard',
                    'captain jean-luc picard': 'picard',
                    'data': 'data',
                    'commander data': 'data',
                    'worf': 'worf',
                    'deanna troi': 'troi',
                    't roi': 'troi',
                    'crusher': 'crusher',
                    'beverly crusher': 'crusher',
                    'riker': 'riker',
                    'william riker': 'riker',
                    'uhura': 'uhura'
                };
                const toSlug = (name)=>{
                    const raw = String(name || '').trim().toLowerCase();
                    if (!raw) return '';
                    const mapped = aliasToSlug[raw] || raw;
                    return mapped.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                };
                for (const dir of candidates){
                    if (!__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].existsSync(dir)) continue;
                    const files = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(dir).filter((f)=>f.endsWith('.json'));
                    for (const file of files){
                        const filePath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dir, file);
                        try {
                            const json = JSON.parse(__TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(filePath, 'utf8'));
                            const member = json.crew_member || json.member || json.name || __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].basename(file, '.json');
                            const slug = toSlug(member);
                            if (seen.has(slug)) continue;
                            seen.add(slug);
                            crew.push({
                                crew_member: String(member || ''),
                                agent_id: slug,
                                title: String(json.title || json.topic || 'Latest Briefing'),
                                summary: String(json.summary || json.brief || ''),
                                key_findings: Array.isArray(json.key_findings) ? json.key_findings.map(String) : [],
                                conclusions: Array.isArray(json.conclusions) ? json.conclusions.map(String) : [],
                                recommendations: Array.isArray(json.recommendations) ? json.recommendations.map(String) : [],
                                timestamp: String(json.timestamp || json.date || '')
                            });
                        } catch  {}
                    }
                }
                return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    crew
                }, {
                    status: 200
                });
            } catch  {}
            // Last resort: render with empty crew
            return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                crew: []
            }, {
                status: 200
            });
        }
        // Minimal shape validation/sanitization
        // Expecting: { crew: [{ crew_member, title, summary, key_findings, conclusions, recommendations, timestamp }] }
        const crew = Array.isArray(data.crew) ? data.crew : [];
        const safe = crew.map((m)=>({
                crew_member: String(m.crew_member || ''),
                title: String(m.title || ''),
                summary: String(m.summary || ''),
                key_findings: Array.isArray(m.key_findings) ? m.key_findings.map(String) : [],
                conclusions: Array.isArray(m.conclusions) ? m.conclusions.map(String) : [],
                recommendations: Array.isArray(m.recommendations) ? m.recommendations.map(String) : [],
                timestamp: String(m.timestamp || '')
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            crew: safe
        }, {
            status: 200
        });
    } catch (err) {
        const message = err?.name === 'AbortError' ? 'Upstream timeout' : err?.message || 'Unknown error';
        return __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__85de50ba._.js.map