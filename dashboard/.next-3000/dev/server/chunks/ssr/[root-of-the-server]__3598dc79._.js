module.exports = [
"[project]/dashboard/app/icon.svg.mjs { IMAGE => \"[project]/dashboard/app/icon.svg (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/dashboard/app/icon.svg.mjs { IMAGE => \"[project]/dashboard/app/icon.svg (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/dashboard/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/dashboard/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[project]/dashboard/app/reports/observation-lounge/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ObservationLoungePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/dashboard/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
function loadObservations() {
    try {
        const memoriesDir = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(process.cwd(), '..', 'crew-memories', 'active');
        const files = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readdirSync(memoriesDir).filter((f)=>f.endsWith('.json'));
        const items = [];
        for (const f of files){
            try {
                const raw = __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["default"].readFileSync(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(memoriesDir, f), 'utf8');
                const json = JSON.parse(raw);
                items.push({
                    id: f,
                    title: json.title || json.name || f.replace(/\.json$/, ''),
                    summary: json.summary || json.notes || json.findings || json.description,
                    date: json.date || json.timestamp || undefined,
                    tags: json.tags || json.topics || undefined
                });
            } catch  {}
        }
        items.sort((a, b)=>b.id.localeCompare(a.id));
        return items;
    } catch  {
        return [];
    }
}
async function ObservationLoungePage() {
    const items = loadObservations();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            padding: '80px 24px 24px'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                style: {
                    fontSize: 28,
                    marginBottom: 12
                },
                children: "🛸 Observation Lounge"
            }, void 0, false, {
                fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                style: {
                    opacity: 0.8,
                    marginBottom: 24
                },
                children: "Recent crew observations, milestones, and findings."
            }, void 0, false, {
                fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))',
                    gap: 16
                },
                children: items.map((it)=>{
                    const summary = typeof it.summary === 'string' ? it.summary : it.summary ? (()=>{
                        try {
                            return JSON.stringify(it.summary);
                        } catch  {
                            return String(it.summary);
                        }
                    })() : '—';
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                        style: {
                            border: '1px solid var(--border)',
                            borderRadius: 12,
                            background: 'var(--card, rgba(255,255,255,0.05))',
                            padding: 16
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                style: {
                                    marginBottom: 8
                                },
                                children: it.title
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                                lineNumber: 57,
                                columnNumber: 13
                            }, this),
                            it.date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    fontSize: 12,
                                    opacity: 0.7,
                                    marginBottom: 8
                                },
                                children: it.date
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                                lineNumber: 58,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                style: {
                                    fontSize: 14,
                                    lineHeight: 1.5
                                },
                                children: summary
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                                lineNumber: 59,
                                columnNumber: 13
                            }, this),
                            it.tags && it.tags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    marginTop: 10,
                                    display: 'flex',
                                    gap: 8,
                                    flexWrap: 'wrap'
                                },
                                children: it.tags.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$dashboard$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontSize: 12,
                                            padding: '4px 8px',
                                            border: '1px solid var(--border)',
                                            borderRadius: 999
                                        },
                                        children: t
                                    }, t, false, {
                                        fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                                        lineNumber: 63,
                                        columnNumber: 19
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                                lineNumber: 61,
                                columnNumber: 15
                            }, this)
                        ]
                    }, it.id, true, {
                        fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/dashboard/app/reports/observation-lounge/page.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
}),
"[project]/dashboard/app/reports/observation-lounge/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/dashboard/app/reports/observation-lounge/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__3598dc79._.js.map